import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUpvote = query({
  args: { projectId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("upvotes").withIndex("projectUser", (q) => q.eq("projectId", args.projectId).eq("userId", args.userId)).first();
  },
});

export const toggleUpvote = mutation({
  args: { projectId: v.string(), userId: v.string(), createdAt: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("upvotes").withIndex("projectUser", (q) => q.eq("projectId", args.projectId).eq("userId", args.userId)).first();
    if (existing) {
      await ctx.db.delete(existing._id);
      const p = await ctx.db.get(args.projectId as any);
      if (p) await ctx.db.patch(p._id, { upvotesCount: Math.max(0, (p.upvotesCount || 0) - 1) });
      return { upvoted: false };
    }
    await ctx.db.insert("upvotes", { projectId: args.projectId, userId: args.userId, createdAt: args.createdAt });
    const p = await ctx.db.get(args.projectId as any);
    if (p) await ctx.db.patch(p._id, { upvotesCount: (p.upvotesCount || 0) + 1 });
    return { upvoted: true };
  },
});

export const getComments = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const comments = await ctx.db.query("comments").withIndex("projectId", (q) => q.eq("projectId", args.projectId)).order("desc").collect();
    const out = [];
    for (const c of comments) {
      if (c.parentId) continue;
      const user = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", c.userId)).first();
      const replies = comments.filter((r) => r.parentId === c._id);
      out.push({ ...c, author: user || { id: c.userId, username: "unknown", name: "" }, replies });
    }
    return out;
  },
});

export const postComment = mutation({
  args: { projectId: v.string(), userId: v.string(), body: v.string(), parentId: v.optional(v.string()), createdAt: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("comments", { projectId: args.projectId, userId: args.userId, parentId: args.parentId, body: args.body, likesCount: 0, createdAt: args.createdAt });
    const p = await ctx.db.get(args.projectId as any);
    if (p) await ctx.db.patch(p._id, { commentsCount: (p.commentsCount || 0) + 1 });
  },
});

export const toggleCommentLike = mutation({
  args: { commentId: v.id("comments"), userId: v.string(), createdAt: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("commentLikes").withIndex("commentUser", (q) => q.eq("commentId", args.commentId).eq("userId", args.userId)).first();
    if (existing) {
      await ctx.db.delete(existing._id);
      const c = await ctx.db.get(args.commentId);
      if (c) await ctx.db.patch(args.commentId, { likesCount: Math.max(0, (c.likesCount || 0) - 1) });
      return { liked: false };
    }
    await ctx.db.insert("commentLikes", { commentId: args.commentId, userId: args.userId, createdAt: args.createdAt });
    const c = await ctx.db.get(args.commentId);
    if (c) await ctx.db.patch(args.commentId, { likesCount: (c.likesCount || 0) + 1 });
    return { liked: true };
  },
});

export const getBookmark = query({
  args: { projectId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("bookmarks").withIndex("projectUser", (q) => q.eq("projectId", args.projectId).eq("userId", args.userId)).first();
  },
});

export const toggleBookmark = mutation({
  args: { projectId: v.string(), userId: v.string(), createdAt: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("bookmarks").withIndex("projectUser", (q) => q.eq("projectId", args.projectId).eq("userId", args.userId)).first();
    if (existing) {
      await ctx.db.delete(existing._id);
      const p = await ctx.db.get(args.projectId as any);
      if (p) await ctx.db.patch(p._id, { bookmarksCount: Math.max(0, (p.bookmarksCount || 0) - 1) });
      return { bookmarked: false };
    }
    await ctx.db.insert("bookmarks", { projectId: args.projectId, userId: args.userId, createdAt: args.createdAt });
    const p = await ctx.db.get(args.projectId as any);
    if (p) await ctx.db.patch(p._id, { bookmarksCount: (p.bookmarksCount || 0) + 1 });
    return { bookmarked: true };
  },
});

export const getBanners = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("banners").order("desc").collect();
  },
});

export const createBanner = mutation({
  args: { imageUrl: v.string(), caption: v.string(), linkUrl: v.string(), position: v.string(), sortOrder: v.number(), createdBy: v.string(), createdAt: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("banners", args);
  },
});

export const deleteBanner = mutation({
  args: { id: v.id("banners") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
