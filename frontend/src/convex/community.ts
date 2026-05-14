import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listChannels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("channels").order("desc").collect();
  },
});

export const getChannel = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("channels").withIndex("slug", (q) => q.eq("slug", args.slug)).first();
  },
});

export const listPosts = query({
  args: { channelSlug: v.optional(v.string()), sort: v.string(), limit: v.number() },
  handler: async (ctx, args) => {
    let posts;
    if (args.channelSlug) {
      posts = await ctx.db.query("posts").withIndex("channel", (q) => q.eq("channelSlug", args.channelSlug!)).collect();
    } else {
      posts = await ctx.db.query("posts").collect();
    }
    if (args.sort === "top") posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    else posts.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return posts.slice(0, args.limit);
  },
});

export const getPost = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const posts = await ctx.db.query("posts").filter((q) => q.eq(q.field("_id"), args.id)).collect();
    return posts[0] || null;
  },
});

export const createChannel = mutation({
  args: { name: v.string(), slug: v.string(), description: v.string(), color: v.string(), icon: v.string(), createdBy: v.string(), createdAt: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("channels", { ...args, postCount: 0 });
  },
});

export const createPost = mutation({
  args: { title: v.string(), body: v.string(), channelSlug: v.string(), userId: v.string(), createdAt: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("posts", { ...args, upvotes: 0, downvotes: 0, commentCount: 0 });
    const ch = await ctx.db.query("channels").withIndex("slug", (q) => q.eq("slug", args.channelSlug)).first();
    if (ch) await ctx.db.patch(ch._id, { postCount: (ch.postCount || 0) + 1 });
  },
});

export const votePost = mutation({
  args: { postId: v.string(), userId: v.string(), vote: v.number(), createdAt: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("postVotes").withIndex("postUser", (q) => q.eq("postId", args.postId).eq("userId", args.userId)).first();
    const post = await ctx.db.query("posts").filter((q) => q.eq(q.field("_id"), args.postId)).first();
    if (existing) {
      if (existing.vote === args.vote) {
        await ctx.db.delete(existing._id);
        if (post) {
          const diff = args.vote === 1 ? -1 : 1;
          if (args.vote === 1) await ctx.db.patch(post._id, { upvotes: Math.max(0, (post.upvotes || 0) - 1) });
          else await ctx.db.patch(post._id, { downvotes: Math.max(0, (post.downvotes || 0) - 1) });
        }
        return { voted: false };
      }
      await ctx.db.patch(existing._id, { vote: args.vote });
      if (post) {
        if (args.vote === 1) { await ctx.db.patch(post._id, { upvotes: (post.upvotes || 0) + 1, downvotes: Math.max(0, (post.downvotes || 0) - 1) }); }
        else { await ctx.db.patch(post._id, { downvotes: (post.downvotes || 0) + 1, upvotes: Math.max(0, (post.upvotes || 0) - 1) }); }
      }
    } else {
      await ctx.db.insert("postVotes", args);
      if (post) {
        if (args.vote === 1) await ctx.db.patch(post._id, { upvotes: (post.upvotes || 0) + 1 });
        else await ctx.db.patch(post._id, { downvotes: (post.downvotes || 0) + 1 });
      }
    }
    return { voted: true };
  },
});
