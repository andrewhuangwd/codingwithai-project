import type { IndexRange } from "convex/server";
import { v } from "convex/values";
import type { BadgeType } from "../lib/types";
import { mutation, query } from "./_convex";

type ChainableIndexRange = {
  eq: (fieldName: string, value: unknown) => ChainableIndexRange;
};

const badgeType = v.union(
  v.literal("first_care"),
  v.literal("three_day_streak"),
  v.literal("three_in_a_row"),
  v.literal("perfect_week"),
  v.literal("comeback"),
);

const BADGE_COPY: Record<BadgeType, { title: string; description: string }> = {
  first_care: {
    title: "First Care",
    description: "Completed the first Need for this Andy.",
  },
  three_day_streak: {
    title: "3-Day Streak",
    description: "Completed at least one Need across three consecutive days.",
  },
  three_in_a_row: {
    title: "3 in a Row",
    description: "Completed the same Need three scheduled times in a row.",
  },
  perfect_week: {
    title: "Perfect Week",
    description: "Completed every generated Need instance in a week.",
  },
  comeback: {
    title: "Comeback",
    description: "Completed a Need after a previous miss.",
  },
};

export const listByAndy = query({
  args: { andyId: v.id("andies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("badges")
      .withIndex("by_andy", (q) => q.eq("andyId", args.andyId))
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("badges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const hasBadge = query({
  args: { andyId: v.id("andies"), badgeType: badgeType },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("badges")
      .withIndex("by_andy_type", (q) =>
        compoundIndex(q, [
          ["andyId", args.andyId],
          ["badgeType", args.badgeType],
        ]),
      )
      .first();

    return existing !== null;
  },
});

export const awardIfMissing = mutation({
  args: {
    userId: v.id("users"),
    andyId: v.id("andies"),
    badgeType,
    relatedNeedId: v.optional(v.id("needs")),
    relatedNeedInstanceId: v.optional(v.id("needInstances")),
  },
  handler: async (ctx, args) => {
    const andy = await ctx.db.get(args.andyId);
    if (!andy || andy.userId !== args.userId) {
      throw new Error("Andy not found for user.");
    }
    if (args.relatedNeedId) {
      const need = await ctx.db.get(args.relatedNeedId);
      if (!need || need.userId !== args.userId || need.andyId !== args.andyId) {
        throw new Error("Related Need not found for user.");
      }
    }
    if (args.relatedNeedInstanceId) {
      const instance = await ctx.db.get(args.relatedNeedInstanceId);
      if (
        !instance ||
        instance.userId !== args.userId ||
        instance.andyId !== args.andyId
      ) {
        throw new Error("Related Need instance not found for user.");
      }
    }

    const existing = await ctx.db
      .query("badges")
      .withIndex("by_andy_type", (q) =>
        compoundIndex(q, [
          ["andyId", args.andyId],
          ["badgeType", args.badgeType],
        ]),
      )
      .first();

    if (existing) return existing._id;

    const copy = BADGE_COPY[args.badgeType];
    return await ctx.db.insert("badges", {
      userId: args.userId,
      andyId: args.andyId,
      badgeType: args.badgeType,
      title: copy.title,
      description: copy.description,
      awardedAt: Date.now(),
      relatedNeedId: args.relatedNeedId,
      relatedNeedInstanceId: args.relatedNeedInstanceId,
    });
  },
});

export function getBadgeCopy(badgeType: BadgeType) {
  return BADGE_COPY[badgeType];
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
