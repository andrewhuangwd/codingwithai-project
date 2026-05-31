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
