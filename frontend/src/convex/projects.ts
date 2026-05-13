import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

const SCORE_WEIGHTS = { upvote: 3, view: 1, comment: 2, bookmark: 2 };

function projectScore(p: Doc<"projects">): number {
  return (p.upvotesCount || 0) * 3 + (p.viewsCount || 0) + (p.commentsCount || 0) * 2 + (p.bookmarksCount || 0) * 2;
}

function computeBadges(p: Doc<"projects">, now: string) {
  const badges: { type: string; label: string }[] = [];
  const score = projectScore(p);
  const daysAgo = p.createdAt ? Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86400000) : 999;
  if (score >= 200) badges.push({ type: "hot", label: "HOT" });
  else if (score >= 100) badges.push({ type: "rising", label: "RISING" });
  if (daysAgo <= 3) badges.push({ type: "new", label: "NEW" });
  else if (daysAgo <= 7 && score >= 50) badges.push({ type: "fast", label: "FAST GROWING" });
  return badges;
}

export const listProjects = query({
  args: { sort: v.string(), category: v.optional(v.string()), q: v.optional(v.string()), limit: v.number(), makerId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let projects = await ctx.db.query("projects").collect();
    if (args.category && args.category !== "all") projects = projects.filter((p) => p.category === args.category);
    if (args.q) {
      const q = args.q.toLowerCase();
      projects = projects.filter((p) => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.tags.toLowerCase().includes(q));
    }
    if (args.makerId) projects = projects.filter((p) => p.makerId === args.makerId);
    if (args.sort === "trending") projects.sort((a, b) => projectScore(b) - projectScore(a));
    else projects.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return projects.slice(0, args.limit).map((p) => ({ ...p, score: projectScore(p), badges: computeBadges(p, new Date().toISOString()) }));
  },
});

export const getProject = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const p = await ctx.db.query("projects").withIndex("slug", (q) => q.eq("slug", args.slug)).first();
    return p ? { ...p, score: projectScore(p), badges: computeBadges(p, new Date().toISOString()) } : null;
  },
});

export const getProjectById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("projects").filter((q) => q.eq(q.field("_id"), args.id)).first();
  },
});

export const incrementViews = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const p = await ctx.db.get(args.projectId);
    if (p) await ctx.db.patch(args.projectId, { viewsCount: (p.viewsCount || 0) + 1 });
  },
});

export const recordView = mutation({
  args: { projectId: v.id("projects"), ipAddress: v.string(), viewedAt: v.string() },
  handler: async (ctx, args) => {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const existing = await ctx.db.query("projectViews").filter((q) => q.and(
      q.eq(q.field("projectId"), args.projectId),
      q.eq(q.field("ipAddress"), args.ipAddress),
      q.gt(q.field("viewedAt"), oneHourAgo)
    )).first();
    if (!existing) {
      await ctx.db.insert("projectViews", { projectId: args.projectId, ipAddress: args.ipAddress, viewedAt: args.viewedAt });
      await incrementViews(ctx, { projectId: args.projectId });
    }
  },
});

export const createProject = mutation({
  args: v.object({
    id: v.string(), slug: v.string(), name: v.string(), tagline: v.string(), description: v.string(),
    websiteUrl: v.string(), githubUrl: v.string(), category: v.string(), tags: v.string(), techStack: v.string(),
    coverImageUrl: v.string(), makerId: v.string(), createdAt: v.string(),
  }),
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.insert("projects", { ...data, upvotesCount: 0, viewsCount: 0, commentsCount: 0, bookmarksCount: 0 });
  },
});

export const updateProject = mutation({
  args: { slug: v.string(), updates: v.object({
    name: v.optional(v.string()), tagline: v.optional(v.string()), description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()), category: v.optional(v.string()), tags: v.optional(v.string()),
    techStack: v.optional(v.string()), coverImageUrl: v.optional(v.string()), githubUrl: v.optional(v.string()),
  }) },
  handler: async (ctx, args) => {
    const p = await ctx.db.query("projects").withIndex("slug", (q) => q.eq("slug", args.slug)).first();
    if (p) await ctx.db.patch(p._id, args.updates);
  },
});

export const deleteProject = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const p = await ctx.db.query("projects").withIndex("slug", (q) => q.eq("slug", args.slug)).first();
    if (p) {
      await ctx.db.delete(p._id);
      const ups = await ctx.db.query("upvotes").withIndex("projectUser", (q) => q.eq("projectId", p._id)).collect();
      for (const u of ups) await ctx.db.delete(u._id);
      const cmts = await ctx.db.query("comments").withIndex("projectId", (q) => q.eq("projectId", p._id)).collect();
      for (const c of cmts) await ctx.db.delete(c._id);
    }
  },
});

function parseTags(val: string): string[] {
  try { return JSON.parse(val); } catch { return []; }
}

export const annotateProjects = query({
  args: { projectIds: v.array(v.id("projects")), currentUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const out = [];
    for (const pid of args.projectIds) {
      const p = await ctx.db.get(pid);
      if (!p) continue;
      const maker = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", p.makerId)).first();
      const score = projectScore(p);
      const hasUpvoted = args.currentUserId ? !!(await ctx.db.query("upvotes").withIndex("projectUser", (q) => q.eq("projectId", pid).eq("userId", args.currentUserId!)).first()) : false;
      const hasBookmarked = args.currentUserId ? !!(await ctx.db.query("bookmarks").withIndex("projectUser", (q) => q.eq("projectId", pid).eq("userId", args.currentUserId!)).first()) : false;
      out.push({ ...p, maker, score, badges: computeBadges(p, new Date().toISOString()), hasUpvoted, hasBookmarked, tags: parseTags(p.tags), techStack: parseTags(p.techStack) });
    }
    return out;
  },
});
