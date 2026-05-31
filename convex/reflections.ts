import { v } from "convex/values";
import { mutation, query } from "./_convex";

const reflectionType = v.union(v.literal("daily"), v.literal("weekly"));

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reflections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const listDaily = query({
  args: { userId: v.id("users"), dateKey: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let reflections = await ctx.db
      .query("reflections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    reflections = reflections.filter((reflection) => reflection.type === "daily");
    if (args.dateKey) {
      reflections = reflections.filter(
        (reflection) => reflection.dateKey === args.dateKey,
      );
    }

    return reflections;
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    type: reflectionType,
    dateKey: v.optional(v.string()),
    weekKey: v.optional(v.string()),
    questions: v.array(v.string()),
    answers: v.array(v.string()),
    aiSummary: v.optional(v.string()),
    patternNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reflections", {
      userId: args.userId,
      type: args.type,
      dateKey: args.dateKey,
      weekKey: args.weekKey,
      questions: args.questions,
      answers: args.answers,
      aiSummary: args.aiSummary ?? "",
      patternNotes: args.patternNotes ?? "",
      createdAt: Date.now(),
    });
  },
});
