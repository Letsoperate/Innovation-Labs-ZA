import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const getUser = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("email", (q) => q.eq("email", args.id)).first();
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("email", (q) => q.eq("email", args.email)).first();
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("username", (q) => q.eq("username", args.username)).first();
  },
});

export const createUser = mutation({
  args: {
    id: v.string(),
    email: v.string(),
    username: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    twitter: v.optional(v.string()),
    github: v.optional(v.string()),
    website: v.optional(v.string()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.insert("users", { ...data, bio: data.bio || "", avatarUrl: data.avatarUrl || "", twitter: data.twitter || "", github: data.github || "", website: data.website || "" });
  },
});

export const updateUser = mutation({
  args: {
    id: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      bio: v.optional(v.string()),
      twitter: v.optional(v.string()),
      github: v.optional(v.string()),
      website: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
      passwordHash: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", args.id)).first();
    if (user) await ctx.db.patch(user._id, args.updates);
  },
});

export const getUserById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").filter((q) => q.eq(q.field("_id"), args.id)).collect();
    return users[0] || null;
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({ _id: u._id, email: u.email, username: u.username, name: u.name, bio: u.bio, avatarUrl: u.avatarUrl, role: u.role, createdAt: u.createdAt }));
  },
});
