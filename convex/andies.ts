import { v } from "convex/values";
import { DEFAULT_HP, MAX_ANDIES } from "../lib/constants";
import { mutation, query } from "./_convex";

const spriteStatus = v.union(
  v.literal("fallback"),
  v.literal("pending"),
  v.literal("generated"),
  v.literal("failed"),
);

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("andies")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getById = query({
  args: { andyId: v.id("andies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.andyId);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    dimension: v.string(),
    spriteKey: v.string(),
    spriteUrl: v.optional(v.string()),
    spriteGenerationStatus: v.optional(spriteStatus),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("andies")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (existing.length >= MAX_ANDIES) {
      throw new Error(`MVP supports up to ${MAX_ANDIES} Andies.`);
    }

    const now = Date.now();
    return await ctx.db.insert("andies", {
      userId: args.userId,
      name: args.name.trim(),
      dimension: args.dimension.trim(),
      hp: DEFAULT_HP,
      spriteKey: args.spriteKey,
      spriteUrl: args.spriteUrl,
      spriteGenerationStatus: args.spriteGenerationStatus ?? "fallback",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    andyId: v.id("andies"),
    name: v.optional(v.string()),
    dimension: v.optional(v.string()),
    spriteKey: v.optional(v.string()),
    spriteUrl: v.optional(v.string()),
    spriteGenerationStatus: v.optional(spriteStatus),
  },
  handler: async (ctx, args) => {
    const andy = await ctx.db.get(args.andyId);
    if (!andy) throw new Error("Andy not found.");

    await ctx.db.patch(args.andyId, {
      ...(args.name !== undefined ? { name: args.name.trim() } : {}),
      ...(args.dimension !== undefined
        ? { dimension: args.dimension.trim() }
        : {}),
      ...(args.spriteKey !== undefined ? { spriteKey: args.spriteKey } : {}),
      ...(args.spriteUrl !== undefined ? { spriteUrl: args.spriteUrl } : {}),
      ...(args.spriteGenerationStatus !== undefined
        ? { spriteGenerationStatus: args.spriteGenerationStatus }
        : {}),
      updatedAt: Date.now(),
    });

    return args.andyId;
  },
});
