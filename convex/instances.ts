import type { IndexRange } from "convex/server";
import { v } from "convex/values";
import { getBadgeAwardsForEvent } from "../lib/badgeRules";
import { HP_DELTA } from "../lib/constants";
import { hasExistingHpEvent } from "../lib/convexCore";
import { getDateKey, getMondayWeekKey } from "../lib/dates";
import { applyHpDelta } from "../lib/hp";
import { generateCurrentWeekInstances } from "../lib/needInstances";
import type {
  BadgeType,
  Need,
  NeedInstance,
  NeedInstanceStatus,
  Weekday,
} from "../lib/types";
import { getBadgeCopy } from "./badges";
import { mutation, query } from "./_convex";

type ChainableIndexRange = {
  eq: (fieldName: string, value: unknown) => ChainableIndexRange;
};

type ConvexDoc = Record<string, unknown> & { _id: string };
type DbAndy = ConvexDoc & { hp: number };
type DbBadge = ConvexDoc & { badgeType: BadgeType };
type DbHpEvent = ConvexDoc & { needInstanceId: string; reason: string };
type DbNeed = ConvexDoc & {
  andyId: string;
  title: string;
  type: Need["type"];
  schedule: {
    type: Need["type"];
    weekdays?: Weekday[];
    startTime?: string;
    durationMinutes?: number;
    dueDateTime?: string;
  };
  durationMinutes?: number;
  active: boolean;
};
type DbNeedInstance = ConvexDoc & {
  userId: string;
  andyId: string;
  needId: string;
  title: string;
  scheduledFor?: string;
  durationMinutes?: number;
  status: NeedInstanceStatus;
  weekKey: string;
};
type ConvexCtx = {
  db: unknown;
};
type ConvexDb = {
  get: (id: string) => Promise<ConvexDoc | null>;
  patch: (id: string, value: Record<string, unknown>) => Promise<void>;
  insert: (tableName: string, value: Record<string, unknown>) => Promise<string>;
  query: (tableName: string) => {
    withIndex: (
      indexName: string,
      cb: (q: unknown) => unknown,
    ) => {
      collect: () => Promise<ConvexDoc[]>;
      first: () => Promise<ConvexDoc | null>;
    };
    collect: () => Promise<ConvexDoc[]>;
  };
};

export const listToday = query({
  args: {
    userId: v.id("users"),
    dateKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const dateKey = args.dateKey ?? getDateKey(new Date());
    const weekKey = getMondayWeekKey(new Date(`${dateKey}T00:00:00`));
    const instances = await ctx.db
      .query("needInstances")
      .withIndex("by_user_week", (q) =>
        compoundIndex(q, [
          ["userId", args.userId],
          ["weekKey", weekKey],
        ]),
      )
      .collect();

    return instances.filter(
      (instance) =>
        instance.scheduledFor === dateKey ||
        instance.scheduledFor?.startsWith(`${dateKey}T`),
    );
  },
});

export const listByWeek = query({
  args: { userId: v.id("users"), weekKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("needInstances")
      .withIndex("by_user_week", (q) =>
        compoundIndex(q, [
          ["userId", args.userId],
          ["weekKey", args.weekKey],
        ]),
      )
      .collect();
  },
});

export const createManyForWeek = mutation({
  args: {
    userId: v.id("users"),
    anchorDateIso: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const anchorDate = args.anchorDateIso
      ? new Date(args.anchorDateIso)
      : new Date();
    const weekKey = getMondayWeekKey(anchorDate);
    const needs = await ctx.db
      .query("needs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const generated = generateCurrentWeekInstances(
      needs.map(toLibNeed),
      anchorDate,
    );
    const existing = await ctx.db
      .query("needInstances")
      .withIndex("by_user_week", (q) =>
        compoundIndex(q, [
          ["userId", args.userId],
          ["weekKey", weekKey],
        ]),
      )
      .collect();
    const existingKeys = new Set(
      existing.map((instance) =>
        getInstanceDedupeKey(instance.needId, instance.scheduledFor),
      ),
    );

    const createdIds = [];
    const now = Date.now();
    for (const instance of generated) {
      const dedupeKey = getInstanceDedupeKey(
        instance.needId,
        instance.scheduledFor ?? undefined,
      );
      if (existingKeys.has(dedupeKey)) continue;

      createdIds.push(
        await ctx.db.insert("needInstances", {
          userId: args.userId,
          andyId: instance.andyId,
          needId: instance.needId,
          title: instance.title,
          scheduledFor: instance.scheduledFor ?? undefined,
          durationMinutes: instance.durationMinutes ?? undefined,
          status: "pending",
          weekKey: instance.weekKey,
          createdAt: now,
        }),
      );
      existingKeys.add(dedupeKey);
    }

    return createdIds;
  },
});

export const markCompleted = mutation({
  args: { needInstanceId: v.id("needInstances") },
  handler: async (ctx, args) => {
    return await markTerminal(ctx, args.needInstanceId, "completed");
  },
});

export const markMissed = mutation({
  args: { needInstanceId: v.id("needInstances") },
  handler: async (ctx, args) => {
    return await markTerminal(ctx, args.needInstanceId, "missed");
  },
});

async function markTerminal(
  ctx: ConvexCtx,
  needInstanceId: string,
  nextStatus: Extract<NeedInstanceStatus, "completed" | "missed">,
) {
  const database = ctx.db as ConvexDb;
  const instance = (await database.get(needInstanceId)) as DbNeedInstance | null;
  if (!instance) throw new Error("Need instance not found.");

  if (instance.status === "completed" || instance.status === "missed") {
    return {
      status: "already_terminal",
      needInstanceId,
      hpEventId: null,
      awardedBadges: [] as BadgeType[],
    };
  }

  const andy = (await database.get(instance.andyId)) as DbAndy | null;
  if (!andy) throw new Error("Andy not found.");

  const now = Date.now();
  const reason = nextStatus === "completed" ? "completed_need" : "missed_need";
  const priorHpEvents = (await database
    .query("hpEvents")
    .withIndex("by_instance_reason", (q) =>
      compoundIndex(q, [
        ["needInstanceId", needInstanceId],
        ["reason", reason],
      ]),
    )
    .collect()) as DbHpEvent[];

  if (hasExistingHpEvent(priorHpEvents, needInstanceId, reason)) {
    await database.patch(needInstanceId, {
      status: nextStatus,
      ...(nextStatus === "completed"
        ? { completedAt: now }
        : { missedAt: now }),
    });

    return {
      status: "already_recorded",
      needInstanceId,
      hpEventId: priorHpEvents[0]._id,
      awardedBadges: [] as BadgeType[],
    };
  }

  const delta = nextStatus === "completed" ? HP_DELTA : -HP_DELTA;
  const hpAfter = applyHpDelta(andy.hp, delta);

  await database.patch(andy._id, { hp: hpAfter, updatedAt: now });
  await database.patch(needInstanceId, {
    status: nextStatus,
    ...(nextStatus === "completed" ? { completedAt: now } : { missedAt: now }),
  });

  const hpEventId = await database.insert("hpEvents", {
    userId: instance.userId,
    andyId: instance.andyId,
    needInstanceId,
    delta,
    hpBefore: andy.hp,
    hpAfter,
    reason,
    createdAt: now,
  });

  const awardedBadges =
    nextStatus === "completed"
      ? await awardBadgesForCompletion(ctx, {
          ...instance,
          status: "completed",
          completedAt: now,
        })
      : [];

  return {
    status: nextStatus,
    needInstanceId,
    hpEventId,
    hpAfter,
    awardedBadges,
  };
}

async function awardBadgesForCompletion(
  ctx: ConvexCtx,
  completedInstance: DbNeedInstance,
) {
  const [allInstances, existingBadges] = await Promise.all([
    (ctx.db as ConvexDb)
      .query("needInstances")
      .withIndex("by_andy", (q) =>
        compoundIndex(q, [["andyId", completedInstance.andyId]]),
      )
      .collect(),
    (ctx.db as ConvexDb)
      .query("badges")
      .withIndex("by_andy", (q) =>
        compoundIndex(q, [["andyId", completedInstance.andyId]]),
      )
      .collect(),
  ]);
  const andyInstances = allInstances as DbNeedInstance[];
  const andyBadges = existingBadges as DbBadge[];

  const awardedTypes = getBadgeAwardsForEvent({
    completedInstance: toLibInstance(completedInstance),
    allInstancesForAndy: andyInstances.map(toLibInstance),
    existingBadgeTypes: andyBadges.map((badge) => badge.badgeType),
  });

  for (const badgeType of awardedTypes) {
    const existing = andyBadges.find((badge) => badge.badgeType === badgeType);
    if (existing) continue;

    const copy = getBadgeCopy(badgeType);
    await (ctx.db as ConvexDb).insert("badges", {
      userId: completedInstance.userId,
      andyId: completedInstance.andyId,
      badgeType,
      title: copy.title,
      description: copy.description,
      awardedAt: Date.now(),
      relatedNeedId: completedInstance.needId,
      relatedNeedInstanceId: completedInstance._id,
    });
  }

  return awardedTypes;
}

function getInstanceDedupeKey(
  needId: string,
  scheduledFor: string | undefined,
): string {
  return `${needId}:${scheduledFor ?? "unscheduled"}`;
}

function toLibNeed(need: DbNeed): Need {
  const base = {
    id: need._id,
    andyId: need.andyId,
    title: need.title,
    durationMinutes: need.durationMinutes,
    active: need.active,
  };

  if (need.type === "scheduled_recurring") {
    if (
      !need.schedule.weekdays ||
      !need.schedule.startTime ||
      need.schedule.durationMinutes === undefined
    ) {
      throw new Error("Scheduled recurring Need has an invalid schedule.");
    }

    return {
      ...base,
      type: "scheduled_recurring",
      schedule: {
        weekdays: need.schedule.weekdays,
        startTime: need.schedule.startTime,
        durationMinutes: need.schedule.durationMinutes,
      },
    };
  }

  if (need.type === "one_off") {
    return {
      ...base,
      type: "one_off",
      schedule: {
        dueDateTime: need.schedule.dueDateTime,
        durationMinutes: need.schedule.durationMinutes,
      },
    };
  }

  return {
    ...base,
    type: need.type,
    schedule: {},
  };
}

function toLibInstance(instance: DbNeedInstance): NeedInstance {
  return {
    id: instance._id,
    andyId: instance.andyId,
    needId: instance.needId,
    title: instance.title,
    scheduledFor: instance.scheduledFor ?? null,
    durationMinutes: instance.durationMinutes ?? null,
    status: instance.status,
    weekKey: instance.weekKey,
  };
}

function compoundIndex(
  indexRange: unknown,
  fields: Array<[string, unknown]>,
): IndexRange {
  return fields
    .reduce(
      (range, [fieldName, value]) => range.eq(fieldName, value),
      indexRange as ChainableIndexRange,
    ) as unknown as IndexRange;
}
