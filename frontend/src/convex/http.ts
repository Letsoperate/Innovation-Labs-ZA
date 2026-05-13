import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/query",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    try {
      let result;
      switch (type) {
        case "getUserByEmail": result = await ctx.runQuery(api.auth.getUserByEmail, { email: url.searchParams.get("email")! }); break;
        case "getUserByUsername": result = await ctx.runQuery(api.auth.getUserByUsername, { username: url.searchParams.get("username")! }); break;
        case "getUser": result = await ctx.runQuery(api.auth.getUser, { id: url.searchParams.get("id")! }); break;
        case "listProjects": result = await ctx.runQuery(api.projects.listProjects, { sort: url.searchParams.get("sort") || "recent", category: url.searchParams.get("category") || undefined, q: url.searchParams.get("q") || undefined, limit: parseInt(url.searchParams.get("limit") || "50"), makerId: undefined }); break;
        case "getProject": result = await ctx.runQuery(api.projects.getProject, { slug: url.searchParams.get("slug")! }); break;
        case "getUpvote": result = await ctx.runQuery(api.operations.getUpvote, { projectId: url.searchParams.get("projectId")!, userId: url.searchParams.get("userId")! }); break;
        case "getBookmark": result = await ctx.runQuery(api.operations.getBookmark, { projectId: url.searchParams.get("projectId")!, userId: url.searchParams.get("userId")! }); break;
        case "getBanners": result = await ctx.runQuery(api.operations.getBanners, {}); break;
        case "stats": {
          const projects = await ctx.runQuery(api.projects.listProjects, { sort: "recent", limit: 9999, category: undefined, q: undefined, makerId: undefined });
          result = { projects: projects.length, makers: 0, upvotes: 0, comments: 0 };
          break;
        }
        default: return new Response(JSON.stringify({ error: "unknown query" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }),
});

http.route({
  path: "/mutation",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { type, args } = body;
      let result;
      switch (type) {
        case "createUser": result = await ctx.runMutation(api.auth.createUser, args); break;
        case "updateUser": result = await ctx.runMutation(api.auth.updateUser, args); break;
        case "createProject": result = await ctx.runMutation(api.projects.createProject, args); break;
        case "updateProject": result = await ctx.runMutation(api.projects.updateProject, args); break;
        case "deleteProject": result = await ctx.runMutation(api.projects.deleteProject, args); break;
        case "recordView": result = await ctx.runMutation(api.projects.recordView, args); break;
        case "toggleUpvote": result = await ctx.runMutation(api.operations.toggleUpvote, args); break;
        case "postComment": result = await ctx.runMutation(api.operations.postComment, args); break;
        case "toggleCommentLike": result = await ctx.runMutation(api.operations.toggleCommentLike, args); break;
        case "toggleBookmark": result = await ctx.runMutation(api.operations.toggleBookmark, args); break;
        case "createBanner": result = await ctx.runMutation(api.operations.createBanner, args); break;
        case "deleteBanner": result = await ctx.runMutation(api.operations.deleteBanner, args); break;
        default: return new Response(JSON.stringify({ error: "unknown mutation" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify(result ?? { ok: true }), { headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }),
});

export default http;
