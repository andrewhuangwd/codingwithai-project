import { v } from "convex/values";
import { DEFAULT_HP } from "../lib/constants";
import { getMondayWeekKey } from "../lib/dates";
import { generateCurrentWeekInstances } from "../lib/needInstances";
import type {
  DailyCheckinNeed,
  Need,
  OneOffNeed,
  ScheduledRecurringNeed,
  Weekday,
  WeeklyCheckinNeed,
} from "../lib/types";
import { mutation, query } from "./_convex";

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dayZeroProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

const needInput = v.object({
  title: v.string(),
  type: v.union(
    v.literal("scheduled_recurring"),
    v.literal("daily_checkin"),
    v.literal("weekly_checkin"),
    v.literal("one_off"),
  ),
  weekdays: v.optional(v.array(v.number())),
  startTime: v.optional(v.string()),
  durationMinutes: v.optional(v.number()),
});

const andyInput = v.object({
  name: v.string(),
  dimension: v.string(),
  needs: v.array(needInput),
});

export const saveOnboardingResults = mutation({
  args: {
    userId: v.id("users"),
    coreAnswers: v.array(v.string()),
    clarifyingAnswers: v.array(v.string()),
    summary: v.string(),
    andies: v.array(andyInput),
    extractedDimensions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dayZeroProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) return { alreadyDone: true };

    const now = Date.now();
    const anchorDate = new Date();
    const weekKey = getMondayWeekKey(anchorDate);

    await ctx.db.insert("dayZeroProfiles", {
      userId: args.userId,
      rawAnswers: args.coreAnswers,
      clarifyingAnswers: args.clarifyingAnswers,
      summary: args.summary,
      extractedDimensions: args.extractedDimensions,
      createdAt: now,
    });

    for (const andy of args.andies) {
      const andyId = await ctx.db.insert("andies", {
        userId: args.userId,
        name: andy.name.trim(),
        dimension: andy.dimension.trim(),
        hp: DEFAULT_HP,
        spriteKey: `fallback-${andy.dimension.toLowerCase()}`,
        spriteGenerationStatus: "fallback",
        createdAt: now,
        updatedAt: now,
      });

      const libNeeds: Need[] = [];

      for (const need of andy.needs) {
        const schedule = buildSchedule(need);
        const needId = await ctx.db.insert("needs", {
          userId: args.userId,
          andyId,
          title: need.title.trim(),
          type: need.type,
          schedule,
          durationMinutes:
            need.type === "scheduled_recurring"
              ? (need.durationMinutes ?? 30)
              : need.durationMinutes,
          active: true,
          createdAt: now,
          updatedAt: now,
        });

        libNeeds.push(buildLibNeed(needId, andyId, need));
      }

      const instances = generateCurrentWeekInstances(libNeeds, anchorDate);
      for (const inst of instances) {
        await ctx.db.insert("needInstances", {
          userId: args.userId,
          andyId,
          needId: inst.needId as typeof andyId,
          title: inst.title,
          scheduledFor: inst.scheduledFor ?? undefined,
          durationMinutes: inst.durationMinutes ?? undefined,
          status: "pending",
          weekKey,
          createdAt: now,
        });
      }
    }

    return { alreadyDone: false };
  },
});

type NeedPayload = {
  title: string;
  type:
    | "scheduled_recurring"
    | "daily_checkin"
    | "weekly_checkin"
    | "one_off";
  weekdays?: number[];
  startTime?: string;
  durationMinutes?: number;
};

function buildSchedule(need: NeedPayload) {
  if (need.type === "scheduled_recurring") {
    const weekdays = (need.weekdays ?? [1, 3, 5]).map(
      (w) => w as Weekday,
    );
    return {
      type: "scheduled_recurring" as const,
      weekdays,
      startTime: need.startTime ?? "09:00",
      durationMinutes: need.durationMinutes ?? 30,
    };
  }
  if (need.type === "one_off") {
    return {
      type: "one_off" as const,
      dueDateTime: undefined,
      durationMinutes: need.durationMinutes,
    };
  }
  if (need.type === "weekly_checkin") {
    return { type: "weekly_checkin" as const };
  }
  return { type: "daily_checkin" as const };
}

function buildLibNeed(needId: string, andyId: string, need: NeedPayload): Need {
  const base = {
    id: needId,
    andyId,
    title: need.title,
    durationMinutes: need.durationMinutes,
    active: true,
  };

  if (need.type === "scheduled_recurring") {
    return {
      ...base,
      type: "scheduled_recurring",
      schedule: {
        weekdays: (need.weekdays ?? [1, 3, 5]) as Weekday[],
        startTime: need.startTime ?? "09:00",
        durationMinutes: need.durationMinutes ?? 30,
      },
    } satisfies ScheduledRecurringNeed;
  }

  if (need.type === "one_off") {
    return {
      ...base,
      type: "one_off",
      schedule: {
        dueDateTime: undefined,
        durationMinutes: need.durationMinutes,
      },
    } satisfies OneOffNeed;
  }

  if (need.type === "weekly_checkin") {
    return {
      ...base,
      type: "weekly_checkin",
      schedule: {},
    } satisfies WeeklyCheckinNeed;
  }

  return {
    ...base,
    type: "daily_checkin",
    schedule: {},
  } satisfies DailyCheckinNeed;
}
