import httpx
import os
import json
from datetime import datetime, timezone
from typing import Optional

SITE_URL = os.environ.get("CONVEX_SITE_URL", "https://small-dogfish-122.convex.site")

async def q(type_: str, **params):
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{SITE_URL}/query", params={"type": type_, **params})
        if resp.status_code == 200: return resp.json()
        if resp.status_code == 404: return None
        raise Exception(f"Convex query error {resp.status_code}: {resp.text}")

async def m(type_: str, args: dict):
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(f"{SITE_URL}/mutation", json={"type": type_, "args": args})
        if resp.status_code == 200: return resp.json()
        raise Exception(f"Convex mutation error {resp.status_code}: {resp.text}")

async def get_user_by_email(email: str):
    return await q("getUserByEmail", email=email)

async def get_user_by_username(username: str):
    return await q("getUserByUsername", username=username)

async def create_user(**kwargs):
    return await m("createUser", kwargs)

async def update_user(id: str, updates: dict):
    return await m("updateUser", {"id": id, "updates": updates})

async def list_projects(sort="recent", category=None, q=None, limit=50):
    params = {"sort": sort, "limit": str(limit)}
    if category: params["category"] = category
    if q: params["q"] = q
    return await q("listProjects", **params) or []

async def get_project(slug: str):
    return await q("getProject", slug=slug)

async def create_project(**kwargs):
    return await m("createProject", kwargs)

async def update_project(slug: str, updates: dict):
    return await m("updateProject", {"slug": slug, "updates": updates})

async def delete_project(slug: str):
    return await m("deleteProject", {"slug": slug})

async def get_upvote(project_id: str, user_id: str):
    return await q("getUpvote", projectId=project_id, userId=user_id)

async def toggle_upvote(project_id: str, user_id: str):
    now = datetime.now(timezone.utc).isoformat()
    return await m("toggleUpvote", {"projectId": project_id, "userId": user_id, "createdAt": now})

async def get_bookmark(project_id: str, user_id: str):
    return await q("getBookmark", projectId=project_id, userId=user_id)

async def toggle_bookmark(project_id: str, user_id: str):
    now = datetime.now(timezone.utc).isoformat()
    return await m("toggleBookmark", {"projectId": project_id, "userId": user_id, "createdAt": now})

async def record_view(project_id: str, ip_address: str):
    now = datetime.now(timezone.utc).isoformat()
    return await m("recordView", {"projectId": project_id, "ipAddress": ip_address, "viewedAt": now})

async def get_banners():
    return await q("getBanners") or []

async def create_banner(**kwargs):
    return await m("createBanner", kwargs)

async def delete_banner(banner_id: str):
    return await m("deleteBanner", {"id": banner_id})
