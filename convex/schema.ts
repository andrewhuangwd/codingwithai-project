import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const needType = v.union(
  v.literal("scheduled_recurring"),
  v.literal("daily_checkin"),
  v.literal("weekly_checkin"),
  v.literal("one_off"),
);

const needSchedule = v.union(
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

export default defineSchema({
  users: defineTable({
    singularName: v.string(),
    pluralName: v.string(),
    profilePhotoStatus: v.union(
      v.literal("none"),
      v.literal("uploaded"),
      v.literal("deleted"),
    ),
    createdAt: v.number(),
  }),
  dayZeroProfiles: defineTable({
    userId: v.id("users"),
    rawAnswers: v.any(),
    clarifyingAnswers: v.array(v.any()),
    summary: v.string(),
    extractedDimensions: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  andies: defineTable({
    userId: v.id("users"),
    name: v.string(),
    dimension: v.string(),
    hp: v.number(),
    spriteKey: v.string(),
    spriteUrl: v.optional(v.string()),
    spriteGenerationStatus: v.union(
      v.literal("fallback"),
      v.literal("pending"),
      v.literal("generated"),
      v.literal("failed"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  needs: defineTable({
    userId: v.id("users"),
    andyId: v.id("andies"),
    title: v.string(),
    type: needType,
    schedule: needSchedule,
    durationMinutes: v.optional(v.number()),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_andy", ["andyId"])
    .index("by_user", ["userId"]),
  needInstances: defineTable({
    userId: v.id("users"),
    andyId: v.id("andies"),
    needId: v.id("needs"),
    title: v.string(),
    scheduledFor: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("missed"),
    ),
    completedAt: v.optional(v.number()),
    missedAt: v.optional(v.number()),
    weekKey: v.string(),
    createdAt: v.number(),
  })
    .index("by_user_week", ["userId", "weekKey"])
    .index("by_andy", ["andyId"])
    .index("by_need", ["needId"])
    .index("by_need_week", ["needId", "weekKey"]),
  hpEvents: defineTable({
    userId: v.id("users"),
    andyId: v.id("andies"),
    needInstanceId: v.id("needInstances"),
    delta: v.number(),
    hpBefore: v.number(),
    hpAfter: v.number(),
    reason: v.string(),
    createdAt: v.number(),
  })
    .index("by_andy", ["andyId"])
    .index("by_instance_reason", ["needInstanceId", "reason"]),
  badges: defineTable({
    userId: v.id("users"),
    andyId: v.id("andies"),
    badgeType: v.union(
      v.literal("first_care"),
      v.literal("three_day_streak"),
      v.literal("three_in_a_row"),
      v.literal("perfect_week"),
      v.literal("comeback"),
    ),
    title: v.string(),
    description: v.string(),
    awardedAt: v.number(),
    relatedNeedId: v.optional(v.id("needs")),
    relatedNeedInstanceId: v.optional(v.id("needInstances")),
  })
    .index("by_andy", ["andyId"])
    .index("by_user", ["userId"])
    .index("by_andy_type", ["andyId", "badgeType"]),
  reflections: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("daily"), v.literal("weekly")),
    dateKey: v.optional(v.string()),
    weekKey: v.optional(v.string()),
    questions: v.array(v.string()),
    answers: v.array(v.string()),
    aiSummary: v.string(),
    patternNotes: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "dateKey"])
    .index("by_user_week", ["userId", "weekKey"]),
});
