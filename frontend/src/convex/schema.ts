import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    username: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    twitter: v.optional(v.string()),
    github: v.optional(v.string()),
    website: v.optional(v.string()),
    role: v.string(),
    referredBy: v.optional(v.string()),
    referralCode: v.optional(v.string()),
    createdAt: v.string(),
  }).index("email", ["email"]).index("username", ["username"]),

  projects: defineTable({
    slug: v.string(),
    name: v.string(),
    tagline: v.string(),
    description: v.string(),
    websiteUrl: v.string(),
    githubUrl: v.string(),
    category: v.string(),
    tags: v.string(),
    techStack: v.string(),
    coverImageUrl: v.string(),
    makerId: v.string(),
    upvotesCount: v.optional(v.number()),
    viewsCount: v.optional(v.number()),
    commentsCount: v.optional(v.number()),
    bookmarksCount: v.optional(v.number()),
    screenshots: v.optional(v.string()),
    createdAt: v.string(),
  }).index("slug", ["slug"]).index("makerId", ["makerId"]),

  upvotes: defineTable({
    projectId: v.string(),
    userId: v.string(),
    createdAt: v.string(),
  }).index("projectUser", ["projectId", "userId"]),

  comments: defineTable({
    projectId: v.string(),
    userId: v.string(),
    parentId: v.optional(v.string()),
    body: v.string(),
    likesCount: v.number(),
    createdAt: v.string(),
  }).index("projectId", ["projectId"]),

  commentLikes: defineTable({
    commentId: v.string(),
    userId: v.string(),
    createdAt: v.string(),
  }).index("commentUser", ["commentId", "userId"]),

  files: defineTable({
    storagePath: v.string(),
    originalFilename: v.string(),
    contentType: v.string(),
    size: v.number(),
    uploadedBy: v.string(),
    isDeleted: v.boolean(),
    createdAt: v.string(),
  }),

  projectViews: defineTable({
    projectId: v.string(),
    ipAddress: v.string(),
    viewedAt: v.string(),
  }),

  bookmarks: defineTable({
    projectId: v.string(),
    userId: v.string(),
    createdAt: v.string(),
  }).index("projectUser", ["projectId", "userId"]),

  banners: defineTable({
    imageUrl: v.string(),
    caption: v.string(),
    linkUrl: v.string(),
    position: v.string(),
    sortOrder: v.number(),
    createdBy: v.string(),
    createdAt: v.string(),
  }),

  channels: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    color: v.string(),
    icon: v.string(),
    postCount: v.number(),
    createdBy: v.string(),
    createdAt: v.string(),
  }).index("slug", ["slug"]),

  posts: defineTable({
    title: v.string(),
    body: v.string(),
    channelSlug: v.string(),
    userId: v.string(),
    upvotes: v.number(),
    downvotes: v.number(),
    commentCount: v.number(),
    createdAt: v.string(),
  }).index("channel", ["channelSlug"]),

  postVotes: defineTable({
    postId: v.string(),
    userId: v.string(),
    vote: v.number(),
    createdAt: v.string(),
  }).index("postUser", ["postId", "userId"]),
});
