import os
import sys
sys.path.insert(0, os.path.dirname(__file__))
import uuid
import json
import hashlib
import logging
import secrets
import httpx
import jwt
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response, UploadFile, File
from fastapi.responses import Response as FastResponse, RedirectResponse
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel

CV_SITE = os.environ.get("CONVEX_SITE_URL", "https://small-dogfish-122.convex.site")

async def cv_q(type_: str, **params):
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.get(f"{CV_SITE}/query", params={"type": type_, **params})
        return r.json() if r.status_code == 200 else None if r.status_code == 404 else (_ for _ in ()).throw(Exception(f"Convex error {r.status_code}: {r.text}"))

async def cv_m(type_: str, args: dict):
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{CV_SITE}/mutation", json={"type": type_, "args": args})
        return r.json() if r.status_code == 200 else (_ for _ in ()).throw(Exception(f"Convex error {r.status_code}: {r.text}"))

async def cv_get_user_by_email(email: str):
    return await cv_q("getUserByEmail", email=email)
async def cv_get_user_by_username(username: str):
    return await cv_q("getUserByUsername", username=username)
async def cv_create_user(**k):
    return await cv_m("createUser", k)
async def cv_update_user(id: str, u: dict):
    return await cv_m("updateUser", {"id": id, "updates": u})
async def cv_list_projects(sort="recent", category=None, q=None, limit=50):
    p = {"sort": sort, "limit": str(limit)}
    if category: p["category"] = category
    if q: p["q"] = q
    return await cv_q("listProjects", **p) or []
async def cv_get_project(slug: str):
    return await cv_q("getProject", slug=slug)
async def cv_create_project(**k):
    return await cv_m("createProject", k)
async def cv_update_project(slug: str, u: dict):
    return await cv_m("updateProject", {"slug": slug, "updates": u})
async def cv_delete_project(slug: str):
    return await cv_m("deleteProject", {"slug": slug})
async def cv_get_upvote(pid: str, uid: str):
    return await cv_q("getUpvote", projectId=pid, userId=uid)
async def cv_toggle_upvote(pid: str, uid: str):
    return await cv_m("toggleUpvote", {"projectId": pid, "userId": uid, "createdAt": datetime.now(timezone.utc).isoformat()})
async def cv_get_bookmark(pid: str, uid: str):
    return await cv_q("getBookmark", projectId=pid, userId=uid)
async def cv_toggle_bookmark(pid: str, uid: str):
    return await cv_m("toggleBookmark", {"projectId": pid, "userId": uid, "createdAt": datetime.now(timezone.utc).isoformat()})
async def cv_record_view(pid: str, ip: str):
    return await cv_m("recordView", {"projectId": pid, "ipAddress": ip, "viewedAt": datetime.now(timezone.utc).isoformat()})
async def cv_get_banners():
    return await cv_q("getBanners") or []
async def cv_create_banner(**k):
    return await cv_m("createBanner", k)
async def cv_delete_banner(bid: str):
    return await cv_m("deleteBanner", {"id": bid})

app = FastAPI(title="Innovation Lab ZA API")
api_router = APIRouter(prefix="/api")
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"
UPLOAD_DIR = Path("/tmp/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ':' + pwd_hash.hex()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        salt_hex, pwd_hex = hashed.split(':')
        salt = bytes.fromhex(salt_hex)
        return hashlib.pbkdf2_hmac('sha256', plain.encode('utf-8'), salt, 100000).hex() == pwd_hex
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ.get("JWT_SECRET", "dev-secret-change-in-production")


def create_access_token(user_id: str, email: str) -> str:
    return jwt.encode({"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60 * 24), "type": "access"}, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    return jwt.encode({"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie("access_token", access_token, httponly=True, secure=False, samesite="lax", max_age=60 * 60 * 24, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=False, samesite="lax", max_age=60 * 60 * 24 * 7, path="/")


def serialize_user(user: dict) -> dict:
    return {"id": user.get("id") or str(user["_id"]), "email": user["email"], "username": user.get("username"), "name": user.get("name", ""), "bio": user.get("bio", ""), "avatar_url": user.get("avatar_url") or user.get("avatarUrl"), "twitter": user.get("twitter"), "github": user.get("github"), "website": user.get("website"), "role": user.get("role", "user"), "created_at": user.get("created_at") or user.get("createdAt")}


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "): token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await cv_get_user_by_email(payload["sub"])
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_optional_user(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None


def put_object(user_id: str, data: bytes, ext: str) -> dict:
    file_id = str(uuid.uuid4())
    path = UPLOAD_DIR / user_id / f"{file_id}.{ext}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return {"path": f"{file_id}.{ext}", "user_id": user_id, "size": len(data)}


def get_object(user_id: str, filename: str):
    filepath = UPLOAD_DIR / user_id / filename
    if not filepath.exists(): raise HTTPException(status_code=404, detail="File not found")
    ext = filename.rsplit(".", 1)[-1].lower()
    return filepath.read_bytes(), MIME_TYPES.get(ext, "application/octet-stream")


MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml"}


class RegisterRequest(BaseModel):
    email: str; password: str; name: str; username: str
class LoginRequest(BaseModel):
    email: str; password: str
class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None; bio: Optional[str] = None; twitter: Optional[str] = None
    github: Optional[str] = None; website: Optional[str] = None; avatar_url: Optional[str] = None
class ProjectCreate(BaseModel):
    name: str; tagline: str; description: str; website_url: str; category: str
    tags: List[str] = []; tech_stack: List[str] = []
    cover_image_url: Optional[str] = None; github_url: Optional[str] = None
class ProjectUpdate(BaseModel):
    name: Optional[str] = None; tagline: Optional[str] = None; description: Optional[str] = None
    website_url: Optional[str] = None; category: Optional[str] = None
    tags: Optional[List[str]] = None; tech_stack: Optional[List[str]] = None
    cover_image_url: Optional[str] = None; github_url: Optional[str] = None
class CommentCreate(BaseModel):
    body: str; parent_id: Optional[str] = None


# ---------- Auth ----------
@api_router.post("/auth/register")
async def register(payload: RegisterRequest, response: Response):
    email = payload.email.lower().strip(); username = payload.username.lower().strip()
    if await cv_get_user_by_email(email): raise HTTPException(400, "Email already registered")
    if await cv_get_user_by_username(username): raise HTTPException(400, "Username taken")
    user_id = str(uuid.uuid4()); now = datetime.now(timezone.utc).isoformat()
    await cv_create_user(id=user_id, email=email, username=username, passwordHash=hash_password(payload.password), name=payload.name.strip(), role="user", createdAt=now)
    user = await cv_get_user_by_email(email)
    access = create_access_token(user_id, email); refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return serialize_user(user)


@api_router.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower().strip()
    user = await cv_get_user_by_email(email)
    if not user or not verify_password(payload.password, user.get("passwordHash", "")):
        raise HTTPException(401, "Invalid email or password")
    access = create_access_token(user["_id"], email); refresh = create_refresh_token(user["_id"])
    set_auth_cookies(response, access, refresh)
    return serialize_user(user)


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/"); response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return serialize_user(user)


@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    rt = request.cookies.get("refresh_token")
    if not rt: raise HTTPException(401, "No refresh token")
    try:
        payload = jwt.decode(rt, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh": raise HTTPException(401, "Invalid token")
        user = await cv_get_user_by_email(payload["sub"])
        if not user: raise HTTPException(401, "User not found")
        access = create_access_token(user["_id"], user["email"])
        response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax", max_age=60 * 60 * 24, path="/")
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid refresh token")


# ---------- GitHub OAuth ----------
@api_router.get("/auth/github")
async def github_login():
    client_id = os.environ.get("GITHUB_CLIENT_ID", "")
    redirect_uri = os.environ.get("GITHUB_REDIRECT_URI", "https://innovation-lab-za.vercel.app/_/backend/api/auth/github/callback")
    return {"url": f"https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&scope=user:email"}


@api_router.get("/auth/github/callback")
async def github_callback(code: str, response: Response):
    client_id = os.environ.get("GITHUB_CLIENT_ID", ""); client_secret = os.environ.get("GITHUB_CLIENT_SECRET", "")
    if not client_id or not client_secret: raise HTTPException(500, "GitHub OAuth not configured")
    async with httpx.AsyncClient(timeout=15) as client:
        token_resp = await client.post("https://github.com/login/oauth/access_token", json={"client_id": client_id, "client_secret": client_secret, "code": code}, headers={"Accept": "application/json"})
        token_data = token_resp.json(); access_token = token_data.get("access_token")
        if not access_token: raise HTTPException(400, "GitHub auth failed")
        user_resp = await client.get("https://api.github.com/user", headers={"Authorization": f"Bearer {access_token}"})
        gh_user = user_resp.json(); gh_email = gh_user.get("email")
        if not gh_email:
            email_resp = await client.get("https://api.github.com/user/emails", headers={"Authorization": f"Bearer {access_token}"})
            emails = email_resp.json(); primary = next((e for e in emails if e.get("primary")), emails[0] or {})
            gh_email = primary.get("email", "")
    gh_id = str(gh_user.get("id", "")); username = gh_user.get("login", gh_id).lower(); name = gh_user.get("name") or username; avatar_url = gh_user.get("avatar_url", "")
    existing = await cv_get_user_by_email(gh_email)
    if existing:
        if avatar_url: await cv_update_user(existing["_id"], {"name": name, "avatarUrl": avatar_url})
    else:
        user_id = str(uuid.uuid4()); now = datetime.now(timezone.utc).isoformat()
        await cv_create_user(id=user_id, email=gh_email, username=username, passwordHash=hash_password("gh_" + gh_id), name=name, role="user", avatarUrl=avatar_url, createdAt=now)
        existing = await cv_get_user_by_email(gh_email)
    access = create_access_token(existing["_id"], gh_email); refresh = create_refresh_token(existing["_id"])
    frontend_url = os.environ.get("FRONTEND_URL", "https://innovation-lab-za.vercel.app")
    redirect = RedirectResponse(url=f"{frontend_url}?github_auth=1", status_code=302)
    set_auth_cookies(redirect, access, refresh)
    return redirect


# ---------- Profile ----------
@api_router.patch("/users/me")
async def update_me(payload: UpdateProfileRequest, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    cv_updates = {}
    if "name" in updates: cv_updates["name"] = updates["name"]
    if "bio" in updates: cv_updates["bio"] = updates["bio"]
    if "twitter" in updates: cv_updates["twitter"] = updates["twitter"]
    if "github" in updates: cv_updates["github"] = updates["github"]
    if "website" in updates: cv_updates["website"] = updates["website"]
    if "avatar_url" in updates: cv_updates["avatarUrl"] = updates["avatar_url"]
    if cv_updates: await cv_update_user(user["_id"], cv_updates)
    fresh = await cv_get_user_by_email(user["email"])
    return serialize_user(fresh)


@api_router.get("/users/{username}")
async def get_user(username: str):
    user = await cv_get_user_by_username(username.lower())
    if not user: raise HTTPException(404, "User not found")
    return {"user": serialize_user(user), "projects": []}


# ---------- Upload ----------
@api_router.post("/upload")
async def upload(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.filename: raise HTTPException(400, "No filename")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "bin"
    if ext not in MIME_TYPES: raise HTTPException(400, "Unsupported file type")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024: raise HTTPException(400, "File too large (max 5MB)")
    result = put_object(user["_id"], data, ext)
    storage_path = f"{result['user_id']}/{result['path']}"
    return {"id": str(uuid.uuid4()), "url": f"/api/files/{storage_path}", "path": result["path"]}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    parts = path.split("/", 1)
    user_id, filename = parts if len(parts) == 2 else ("unknown", path)
    data, content_type = get_object(user_id, filename)
    return FastResponse(content=data, media_type=content_type)


# ---------- Projects ----------
def project_score(p: dict) -> int:
    return (p.get("upvotesCount", 0) or 0) * 3 + (p.get("viewsCount", 0) or 0) + (p.get("commentsCount", 0) or 0) * 2 + (p.get("bookmarksCount", 0) or 0) * 2


def compute_badges(p: dict) -> list:
    badges = []; score = project_score(p); days_ago = 999
    if p.get("createdAt"):
        try: days_ago = (datetime.now(timezone.utc) - datetime.fromisoformat(p["createdAt"])).days
        except: pass
    if score >= 200: badges.append({"type": "hot", "label": "HOT", "color": "bg-red-500"})
    elif score >= 100: badges.append({"type": "rising", "label": "RISING", "color": "bg-orange-500"})
    if days_ago <= 3: badges.append({"type": "new", "label": "NEW", "color": "bg-blue-500"})
    elif days_ago <= 7 and score >= 50: badges.append({"type": "fast", "label": "FAST GROWING", "color": "bg-green-500"})
    return badges


def apply_crowns(projects: List[dict]):
    scored = sorted(projects, key=project_score, reverse=True)
    for i, p in enumerate(scored):
        if i == 0: p["badges"].insert(0, {"type": "crown", "label": "RANK #1", "color": "bg-yellow-500"})
        elif i == 1: p["badges"].insert(0, {"type": "crown", "label": "RANK #2", "color": "bg-slate-400"})
        elif i == 2: p["badges"].insert(0, {"type": "crown", "label": "RANK #3", "color": "bg-amber-700"})


async def annotate_projects(projects: List[dict], current_user_id: Optional[str]):
    out = []
    for p in projects:
        p["maker"] = None
        p["score"] = project_score(p)
        p["badges"] = compute_badges(p)
        p["has_upvoted"] = False
        p["has_bookmarked"] = False
        if current_user_id:
            up = await cv_get_upvote(str(p["_id"]), current_user_id)
            p["has_upvoted"] = up is not None
            bm = await cv_get_bookmark(str(p["_id"]), current_user_id)
            p["has_bookmarked"] = bm is not None
        out.append(p)
    return out


@api_router.post("/projects")
async def create_project(payload: ProjectCreate, user: dict = Depends(get_current_user)):
    pid = str(uuid.uuid4()); slug = "-".join(payload.name.lower().split())[:60] + "-" + pid[:6]
    now = datetime.now(timezone.utc).isoformat()
    await cv_create_project(id=pid, slug=slug, name=payload.name, tagline=payload.tagline, description=payload.description, websiteUrl=payload.website_url, githubUrl=payload.github_url or "", category=payload.category, tags=json.dumps(payload.tags), techStack=json.dumps(payload.tech_stack), coverImageUrl=payload.cover_image_url or "", makerId=user["_id"], createdAt=now)
    return await cv_get_project(slug)


@api_router.get("/projects")
async def list_projects_api(request: Request, sort: str = "recent", category: Optional[str] = None, q: Optional[str] = None, limit: int = 50):
    projects = await cv_list_projects(sort=sort, category=category, q=q, limit=limit)
    cur = await get_optional_user(request)
    return await annotate_projects(projects, cur["_id"] if cur else None)


@api_router.get("/projects/leaderboard")
async def leaderboard(request: Request, period: str = "all", limit: int = 10):
    now = datetime.now(timezone.utc)
    projects = await cv_list_projects(sort="trending", limit=500)
    if period == "weekly":
        cutoff = (now - timedelta(days=7)).isoformat()
        projects = [p for p in projects if p.get("createdAt", "") >= cutoff]
    elif period == "monthly":
        cutoff = (now - timedelta(days=30)).isoformat()
        projects = [p for p in projects if p.get("createdAt", "") >= cutoff]
    projects.sort(key=project_score, reverse=True)
    projects = projects[:int(limit)]
    cur = await get_optional_user(request)
    projects = await annotate_projects(projects, cur["_id"] if cur else None)
    apply_crowns(projects)
    return projects


@api_router.get("/projects/{slug}")
async def get_project_api(slug: str, request: Request):
    p = await cv_get_project(slug)
    if not p: raise HTTPException(404, detail="Project not found")
    client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or "unknown"
    await cv_record_view(str(p["_id"]), client_ip)
    p["viewsCount"] = (p.get("viewsCount", 0) or 0) + 1
    cur = await get_optional_user(request)
    annotated = await annotate_projects([p], cur["_id"] if cur else None)
    return annotated[0]


@api_router.patch("/projects/{pid}")
async def update_project_api(pid: str, payload: ProjectUpdate, user: dict = Depends(get_current_user)):
    p = await cv_get_project(pid) or {}
    if not p: raise HTTPException(404, "Project not found")
    if p.get("makerId") != user["_id"] and user.get("role") != "admin": raise HTTPException(403, "Forbidden")
    updates = {}
    for k, ck in [("name","name"),("tagline","tagline"),("description","description"),("website_url","websiteUrl"),("category","category"),("github_url","githubUrl"),("cover_image_url","coverImageUrl")]:
        v = getattr(payload, k, None)
        if v is not None: updates[ck] = v
    if payload.tags is not None: updates["tags"] = json.dumps(payload.tags)
    if payload.tech_stack is not None: updates["techStack"] = json.dumps(payload.tech_stack)
    if updates: await cv_update_project(pid, updates)
    fresh = await cv_get_project(pid)
    if fresh: fresh["tags"] = json.loads(fresh.get("tags","[]"))
    if fresh: fresh["techStack"] = json.loads(fresh.get("techStack","[]"))
    return fresh


@api_router.delete("/projects/{pid}")
async def delete_project_api(pid: str, user: dict = Depends(get_current_user)):
    p = await cv_get_project(pid) or {}
    if not p: raise HTTPException(404, "Project not found")
    if p.get("makerId") != user["_id"] and user.get("role") != "admin": raise HTTPException(403, "Forbidden")
    await cv_delete_project(pid)
    return {"ok": True}


# ---------- Upvotes ----------
@api_router.post("/projects/{pid}/upvote")
async def toggle_upvote(pid: str, user: dict = Depends(get_current_user)):
    result = await cv_toggle_upvote(pid, user["_id"])
    p = await cv_get_project(pid) or {}
    return {"upvoted": result.get("upvoted", True), "upvotes_count": p.get("upvotesCount", 0) or 0}


# ---------- Bookmarks ----------
@api_router.post("/projects/{pid}/bookmark")
async def toggle_bookmark(pid: str, user: dict = Depends(get_current_user)):
    return await cv_toggle_bookmark(pid, user["_id"])


# ---------- Comments ----------
@api_router.get("/projects/{pid}/comments")
async def get_comments(pid: str):
    return []


@api_router.post("/projects/{pid}/comments")
async def post_comment(pid: str, payload: CommentCreate, user: dict = Depends(get_current_user)):
    return {"ok": True}


# ---------- Banners ----------
@api_router.get("/banners")
async def get_banners():
    return await cv_get_banners()


@api_router.post("/admin/banners")
async def create_banner(banner_id: str, image_url: str, caption: str = "", link_url: str = "", position: str = "top", user: dict = Depends(get_current_user)):
    if user.get("role") != "admin": raise HTTPException(403, "Admin only")
    bid = str(uuid.uuid4()); now = datetime.now(timezone.utc).isoformat()
    await cv_create_banner(id=bid, imageUrl=image_url, caption=caption, linkUrl=link_url, position=position, sortOrder=0, createdBy=user["_id"], createdAt=now)
    return {"ok": True}


@api_router.delete("/admin/banners/{bid}")
async def delete_banner(bid: str, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin": raise HTTPException(403, "Admin only")
    await cv_delete_banner(bid)
    return {"ok": True}


# ---------- Stats ----------
@api_router.get("/stats")
async def stats():
    projects = await cv_list_projects(sort="recent", limit=0)
    return {"projects": len(projects), "makers": 0, "upvotes": 0, "comments": 0}


@api_router.get("/categories")
async def categories():
    return [{"slug":"ai","name":"AI & ML","icon":"Robot"},{"slug":"developer-tools","name":"Developer Tools","icon":"Code"},{"slug":"productivity","name":"Productivity","icon":"Lightning"},{"slug":"design","name":"Design","icon":"PaintBrush"},{"slug":"marketing","name":"Marketing","icon":"Megaphone"},{"slug":"fintech","name":"Fintech","icon":"CurrencyDollar"},{"slug":"social","name":"Social","icon":"Users"},{"slug":"saas","name":"SaaS","icon":"Cloud"},{"slug":"mobile","name":"Mobile","icon":"DeviceMobile"},{"slug":"open-source","name":"Open Source","icon":"GitBranch"}]


# ---------- Startup ----------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@innovationlabza.dev")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await cv_get_user_by_email(admin_email)
    if not existing:
        user_id = str(uuid.uuid4()); now = datetime.now(timezone.utc).isoformat()
        await cv_create_user(id=user_id, email=admin_email, username="admin", passwordHash=hash_password(admin_password), name="Admin", bio="Platform admin", role="admin", createdAt=now)
        logger.info("Admin seeded")
    elif not verify_password(admin_password, existing.get("passwordHash", "")):
        await cv_update_user(existing["_id"], {"passwordHash": hash_password(admin_password)})


async def seed_demo_data():
    try:
        projects = await cv_list_projects(sort="recent", limit=1)
        if projects: return
    except Exception:
        pass
    demo_email = "demo@innovationlabza.dev"
    maker = await cv_get_user_by_email(demo_email)
    if not maker:
        maker_id = str(uuid.uuid4()); now = datetime.now(timezone.utc).isoformat()
        await cv_create_user(id=maker_id, email=demo_email, username="demo", passwordHash=hash_password("demo123"), name="Demo Maker", bio="Building stuff in public.", role="user", twitter="demo", github="demo", website="https://example.com", createdAt=now)
        maker = await cv_get_user_by_email(demo_email)
    if not maker: return
    demo_projects = [
        {"name":"Synthwave Notes","tagline":"Markdown notes with a retro twist","category":"productivity","tags":["notes","markdown"],"tech_stack":["React","FastAPI"],"cover_image_url":"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80","upvotes":142,"views":980,"comments":18},
        {"name":"PixelForge","tagline":"Generate UI mockups in seconds","category":"design","tags":["design","ui"],"tech_stack":["Next.js","Tailwind"],"cover_image_url":"https://images.unsplash.com/photo-1561070791-2526d30994b8?auto=format&fit=crop&q=80","upvotes":98,"views":670,"comments":12},
        {"name":"DeployDash","tagline":"One-click deploys for indie projects","category":"developer-tools","tags":["deploy","devops"],"tech_stack":["Go","React"],"cover_image_url":"https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80","upvotes":211,"views":1450,"comments":32},
        {"name":"TaxTroll","tagline":"AI tax assistant for freelancers","category":"fintech","tags":["tax","ai"],"tech_stack":["Python","React"],"cover_image_url":"https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80","upvotes":165,"views":1120,"comments":24},
        {"name":"Predator Bot Market","tagline":"A marketplace for trading bots and automation tools","category":"saas","tags":["bots","automation","marketplace"],"tech_stack":["React","Node.js"],"cover_image_url":"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80","website_url":"https://predator-bot-market.netlify.app/","upvotes":120,"views":850,"comments":16},
    ]
    for d in demo_projects:
        pid = str(uuid.uuid4()); slug = "-".join(d["name"].lower().split()) + "-" + pid[:6]
        now = (datetime.now(timezone.utc) - timedelta(days=secrets.randbelow(20))).isoformat()
        await cv_create_project(id=pid, slug=slug, name=d["name"], tagline=d["tagline"], description=f"{d['tagline']}. Built for indie hackers who care about craft and shipping.", websiteUrl=d.get("website_url","https://example.com"), githubUrl="https://github.com", category=d["category"], tags=json.dumps(d["tags"]), techStack=json.dumps(d["tech_stack"]), coverImageUrl=d["cover_image_url"], makerId=maker["_id"], createdAt=now)


@app.on_event("startup")
async def startup():
    await seed_admin()
    await seed_demo_data()
    logger.info("Backend started with Convex")


@api_router.get("/")
async def root():
    return {"message": "Innovation Lab ZA API", "version": "1.0"}


app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','), allow_methods=["*"], allow_headers=["*"])
