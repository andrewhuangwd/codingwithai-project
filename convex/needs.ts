import { v } from "convex/values";
import { MAX_NEEDS_PER_ANDY } from "../lib/constants";
import { shouldPrunePendingInstanceForNeed } from "../lib/convexCore";
import { mutation, query } from "./_convex";

const needType = v.union(
  v.literal("scheduled_recurring"),
  v.literal("daily_checkin"),
  v.literal("weekly_checkin"),
  v.literal("one_off"),
);

const schedule = v.union(
  v.object({
    type: v.literal("scheduled_recurring"),
    weekdays: v.array(v.union(
      v.literal(0),
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4),
      v.literal(5),
      v.literal(6),
    )),
    startTime: v.string(),
    durationMinutes: v.number(),
  }),
  v.object({ type: v.literal("daily_checkin") }),
  v.object({ type: v.literal("weekly_checkin") }),
  v.object({
    type: v.literal("one_off"),
    dueDateTime: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
  }),
);

export const listByAndy = query({
  args: { andyId: v.id("andies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("needs")
      .withIndex("by_andy", (q) => q.eq("andyId", args.andyId))
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("needs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    andyId: v.id("andies"),
    title: v.string(),
    type: needType,
    schedule,
    durationMinutes: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    ensureMatchingNeedShape(args.type, args.schedule.type);
    const andy = await ctx.db.get(args.andyId);
    if (!andy || andy.userId !== args.userId) {
      throw new Error("Andy not found for user.");
    }

    const activeNeeds = await ctx.db
      .query("needs")
      .withIndex("by_andy", (q) => q.eq("andyId", args.andyId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    if (activeNeeds.length >= MAX_NEEDS_PER_ANDY) {
      throw new Error(`MVP supports up to ${MAX_NEEDS_PER_ANDY} Needs per Andy.`);
    }

    const now = Date.now();
    return await ctx.db.insert("needs", {
      userId: args.userId,
      andyId: args.andyId,
      title: args.title.trim(),
      type: args.type,
      schedule: args.schedule,
      durationMinutes: args.durationMinutes,
      active: args.active ?? true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    needId: v.id("needs"),
    title: v.optional(v.string()),
    type: v.optional(needType),
    schedule: v.optional(schedule),
    durationMinutes: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const need = await ctx.db.get(args.needId);
    if (!need) throw new Error("Need not found.");
    const andy = await ctx.db.get(need.andyId);
    if (
      !andy ||
      andy.userId !== args.userId ||
      need.userId !== args.userId
    ) {
      throw new Error("Need not found for user.");
    }

    const nextType = args.type ?? need.type;
    const nextScheduleType = args.schedule?.type ?? need.schedule.type;
    ensureMatchingNeedShape(nextType, nextScheduleType);
    const scheduleChanged = args.schedule !== undefined || args.type !== undefined;

    await ctx.db.patch(args.needId, {
      ...(args.title !== undefined ? { title: args.title.trim() } : {}),
      ...(args.type !== undefined ? { type: args.type } : {}),
      ...(args.schedule !== undefined ? { schedule: args.schedule } : {}),
      ...(args.durationMinutes !== undefined
        ? { durationMinutes: args.durationMinutes }
        : {}),
      ...(args.active !== undefined ? { active: args.active } : {}),
      updatedAt: Date.now(),
    });
    if (scheduleChanged) {
      await deletePendingInstancesForNeed(ctx, args.needId);
    }

    return args.needId;
  },
});

function ensureMatchingNeedShape(type: string, scheduleType: string) {
  if (type !== scheduleType) {
    throw new Error("Need type and schedule type must match.");
  }
}

async function deletePendingInstancesForNeed(ctx: unknown, needId: string) {
  const database = (ctx as { db: NeedMaintenanceDb }).db;
  const instances = await database
    .query("needInstances")
    .withIndex("by_need", (q) => q.eq("needId", needId))
    .collect();

  for (const instance of instances) {
    if (
      shouldPrunePendingInstanceForNeed({
        instanceNeedId: instance.needId,
        instanceStatus: instance.status,
        updatedNeedId: needId,
      })
    ) {
      await database.delete(instance._id);
    }
  }
}

type NeedMaintenanceDb = {
  query: (tableName: string) => {
    withIndex: (
      indexName: string,
      cb: (q: {
        eq: (fieldName: string, value: unknown) => unknown;
      }) => unknown,
    ) => {
      collect: () => Promise<
        Array<{
          _id: string;
          needId: string;
          status: "pending" | "completed" | "missed";
        }>
      >;
    };
  };
  delete: (id: string) => Promise<void>;
};
