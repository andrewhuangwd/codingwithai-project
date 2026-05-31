import { v } from "convex/values";
import { mutation, query } from "./_convex";

export const getFirstUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").first();
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const deleteFirstUser = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.db.query("users").first();
    if (!user) return;
    const profile = await ctx.db
      .query("dayZeroProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (profile) await ctx.db.delete(profile._id);
    await ctx.db.delete(user._id);
  },
});

export const createFirstUser = mutation({
  args: {
    singularName: v.string(),
    pluralName: v.string(),
    hasProfilePhoto: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").first();
    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      singularName: args.singularName.trim(),
      pluralName: args.pluralName.trim(),
      profilePhotoStatus: args.hasProfilePhoto ? "uploaded" : "none",
      createdAt: Date.now(),
    });
  },
});
