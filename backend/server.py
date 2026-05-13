from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import secrets
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response, UploadFile, File, Form, Query, Header
from fastapi.responses import Response as FastResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


# ---------- Setup ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="LaunchLoop API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"
APP_NAME = os.environ.get("APP_NAME", "launchloop")
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")

storage_key: Optional[str] = None


# ---------- Auth helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60 * 24),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie("access_token", access_token, httponly=True, secure=False, samesite="lax", max_age=60 * 60 * 24, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=False, samesite="lax", max_age=60 * 60 * 24 * 7, path="/")


def serialize_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "username": user.get("username"),
        "name": user.get("name", ""),
        "bio": user.get("bio", ""),
        "avatar_url": user.get("avatar_url"),
        "twitter": user.get("twitter"),
        "github": user.get("github"),
        "website": user.get("website"),
        "role": user.get("role", "user"),
        "created_at": user.get("created_at"),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("password_hash", None)
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


# ---------- Storage helpers ----------
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    if not EMERGENT_KEY:
        logger.error("EMERGENT_LLM_KEY not set")
        return None
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml",
}


# ---------- Models ----------
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    username: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    twitter: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    avatar_url: Optional[str] = None


class ProjectCreate(BaseModel):
    name: str
    tagline: str
    description: str
    website_url: str
    category: str
    tags: List[str] = []
    tech_stack: List[str] = []
    cover_image_url: Optional[str] = None
    github_url: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    website_url: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    tech_stack: Optional[List[str]] = None
    cover_image_url: Optional[str] = None
    github_url: Optional[str] = None


class CommentCreate(BaseModel):
    body: str


# ---------- Auth Endpoints ----------
@api_router.post("/auth/register")
async def register(payload: RegisterRequest, response: Response):
    email = payload.email.lower().strip()
    username = payload.username.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await db.users.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="Username taken")

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    user_doc = {
        "id": user_id,
        "email": email,
        "username": username,
        "password_hash": hash_password(payload.password),
        "name": payload.name.strip(),
        "bio": "",
        "avatar_url": None,
        "twitter": None,
        "github": None,
        "website": None,
        "role": "user",
        "created_at": now,
    }
    await db.users.insert_one(user_doc)
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return serialize_user(user_doc)


@api_router.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access = create_access_token(user["id"], email)
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return serialize_user(user)


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return serialize_user(user)


@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    rt = request.cookies.get("refresh_token")
    if not rt:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(rt, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(user["id"], user["email"])
        response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax", max_age=60 * 60 * 24, path="/")
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------- Profile Endpoints ----------
@api_router.patch("/users/me")
async def update_me(payload: UpdateProfileRequest, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update:
        await db.users.update_one({"id": user["id"]}, {"$set": update})
    fresh = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return serialize_user(fresh)


@api_router.get("/users/{username}")
async def get_user(username: str):
    user = await db.users.find_one({"username": username.lower()}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    projects = await db.projects.find({"maker_id": user["id"]}, {"_id": 0}).to_list(100)
    return {"user": serialize_user(user), "projects": projects}


# ---------- Upload ----------
@api_router.post("/upload")
async def upload(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "bin"
    if ext not in MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    content_type = MIME_TYPES.get(ext, "application/octet-stream")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    path = f"{APP_NAME}/uploads/{user['id']}/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, content_type)
    file_id = str(uuid.uuid4())
    await db.files.insert_one({
        "id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "uploaded_by": user["id"],
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"id": file_id, "url": f"/api/files/{result['path']}", "path": result["path"]}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return FastResponse(content=data, media_type=record.get("content_type", content_type))


# ---------- Projects ----------
def project_score(p: dict) -> int:
    return p.get("upvotes_count", 0) * 3 + p.get("views_count", 0) + p.get("comments_count", 0) * 2


async def annotate_projects(projects: List[dict], current_user_id: Optional[str]):
    out = []
    for p in projects:
        maker = await db.users.find_one({"id": p["maker_id"]}, {"_id": 0, "password_hash": 0})
        p["maker"] = serialize_user(maker) if maker else None
        p["score"] = project_score(p)
        if current_user_id:
            up = await db.upvotes.find_one({"project_id": p["id"], "user_id": current_user_id})
            p["has_upvoted"] = up is not None
        else:
            p["has_upvoted"] = False
        out.append(p)
    return out


@api_router.post("/projects")
async def create_project(payload: ProjectCreate, user: dict = Depends(get_current_user)):
    pid = str(uuid.uuid4())
    slug = "-".join(payload.name.lower().split())[:60] + "-" + pid[:6]
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": pid,
        "slug": slug,
        "name": payload.name,
        "tagline": payload.tagline,
        "description": payload.description,
        "website_url": payload.website_url,
        "github_url": payload.github_url,
        "category": payload.category,
        "tags": payload.tags,
        "tech_stack": payload.tech_stack,
        "cover_image_url": payload.cover_image_url,
        "maker_id": user["id"],
        "upvotes_count": 0,
        "views_count": 0,
        "comments_count": 0,
        "created_at": now,
    }
    await db.projects.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/projects")
async def list_projects(
    request: Request,
    sort: str = "recent",
    category: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 50,
):
    query = {}
    if category and category != "all":
        query["category"] = category
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"tagline": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
        ]
    projects = await db.projects.find(query, {"_id": 0}).to_list(limit)
    if sort == "trending":
        projects.sort(key=project_score, reverse=True)
    elif sort == "recent":
        projects.sort(key=lambda p: p.get("created_at", ""), reverse=True)
    cur = await get_optional_user(request)
    projects = await annotate_projects(projects, cur["id"] if cur else None)
    return projects


@api_router.get("/projects/leaderboard")
async def leaderboard(request: Request, period: str = "all", limit: int = 10):
    now = datetime.now(timezone.utc)
    query = {}
    if period == "weekly":
        cutoff = (now - timedelta(days=7)).isoformat()
        query["created_at"] = {"$gte": cutoff}
    elif period == "monthly":
        cutoff = (now - timedelta(days=30)).isoformat()
        query["created_at"] = {"$gte": cutoff}
    projects = await db.projects.find(query, {"_id": 0}).to_list(500)
    projects.sort(key=project_score, reverse=True)
    projects = projects[:limit]
    cur = await get_optional_user(request)
    projects = await annotate_projects(projects, cur["id"] if cur else None)
    return projects


@api_router.get("/projects/{slug}")
async def get_project(slug: str, request: Request):
    p = await db.projects.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.projects.update_one({"id": p["id"]}, {"$inc": {"views_count": 1}})
    p["views_count"] = p.get("views_count", 0) + 1
    cur = await get_optional_user(request)
    annotated = await annotate_projects([p], cur["id"] if cur else None)
    return annotated[0]


@api_router.patch("/projects/{pid}")
async def update_project(pid: str, payload: ProjectUpdate, user: dict = Depends(get_current_user)):
    p = await db.projects.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    if p["maker_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update:
        await db.projects.update_one({"id": pid}, {"$set": update})
    fresh = await db.projects.find_one({"id": pid}, {"_id": 0})
    return fresh


@api_router.delete("/projects/{pid}")
async def delete_project(pid: str, user: dict = Depends(get_current_user)):
    p = await db.projects.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    if p["maker_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.projects.delete_one({"id": pid})
    await db.upvotes.delete_many({"project_id": pid})
    await db.comments.delete_many({"project_id": pid})
    return {"ok": True}


# ---------- Upvotes ----------
@api_router.post("/projects/{pid}/upvote")
async def toggle_upvote(pid: str, user: dict = Depends(get_current_user)):
    p = await db.projects.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    existing = await db.upvotes.find_one({"project_id": pid, "user_id": user["id"]})
    if existing:
        await db.upvotes.delete_one({"project_id": pid, "user_id": user["id"]})
        await db.projects.update_one({"id": pid}, {"$inc": {"upvotes_count": -1}})
        return {"upvoted": False, "upvotes_count": max(0, p.get("upvotes_count", 0) - 1)}
    await db.upvotes.insert_one({
        "id": str(uuid.uuid4()),
        "project_id": pid,
        "user_id": user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.projects.update_one({"id": pid}, {"$inc": {"upvotes_count": 1}})
    return {"upvoted": True, "upvotes_count": p.get("upvotes_count", 0) + 1}


# ---------- Comments ----------
@api_router.get("/projects/{pid}/comments")
async def get_comments(pid: str):
    comments = await db.comments.find({"project_id": pid}, {"_id": 0}).sort("created_at", -1).to_list(200)
    out = []
    for c in comments:
        u = await db.users.find_one({"id": c["user_id"]}, {"_id": 0, "password_hash": 0})
        c["author"] = serialize_user(u) if u else None
        out.append(c)
    return out


@api_router.post("/projects/{pid}/comments")
async def post_comment(pid: str, payload: CommentCreate, user: dict = Depends(get_current_user)):
    p = await db.projects.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    cid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": cid,
        "project_id": pid,
        "user_id": user["id"],
        "body": payload.body,
        "created_at": now,
    }
    await db.comments.insert_one(doc)
    await db.projects.update_one({"id": pid}, {"$inc": {"comments_count": 1}})
    doc.pop("_id", None)
    doc["author"] = serialize_user(user)
    return doc


# ---------- Stats ----------
@api_router.get("/stats")
async def stats():
    projects = await db.projects.count_documents({})
    makers = await db.users.count_documents({})
    upvotes = await db.upvotes.count_documents({})
    comments = await db.comments.count_documents({})
    return {"projects": projects, "makers": makers, "upvotes": upvotes, "comments": comments}


@api_router.get("/categories")
async def categories():
    cats = [
        {"slug": "ai", "name": "AI & ML", "icon": "Robot"},
        {"slug": "developer-tools", "name": "Developer Tools", "icon": "Code"},
        {"slug": "productivity", "name": "Productivity", "icon": "Lightning"},
        {"slug": "design", "name": "Design", "icon": "PaintBrush"},
        {"slug": "marketing", "name": "Marketing", "icon": "Megaphone"},
        {"slug": "fintech", "name": "Fintech", "icon": "CurrencyDollar"},
        {"slug": "social", "name": "Social", "icon": "Users"},
        {"slug": "saas", "name": "SaaS", "icon": "Cloud"},
        {"slug": "mobile", "name": "Mobile", "icon": "DeviceMobile"},
        {"slug": "open-source", "name": "Open Source", "icon": "GitBranch"},
    ]
    return cats


# ---------- Startup ----------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@launchloop.dev")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "username": "admin",
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "bio": "Platform admin",
            "role": "admin",
            "avatar_url": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})


async def seed_demo_data():
    if await db.projects.count_documents({}) > 0:
        return
    # Create demo maker if not exists
    demo_email = "demo@launchloop.dev"
    maker = await db.users.find_one({"email": demo_email})
    if not maker:
        maker_id = str(uuid.uuid4())
        maker = {
            "id": maker_id,
            "email": demo_email,
            "username": "demo",
            "password_hash": hash_password("demo123"),
            "name": "Demo Maker",
            "bio": "Building stuff in public.",
            "role": "user",
            "avatar_url": None,
            "twitter": "demo",
            "github": "demo",
            "website": "https://example.com",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(maker)
    demo_projects = [
        {"name": "Synthwave Notes", "tagline": "Markdown notes with a retro twist", "category": "productivity", "tags": ["notes", "markdown"], "tech_stack": ["React", "FastAPI"], "cover_image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80", "upvotes": 142, "views": 980, "comments": 18},
        {"name": "PixelForge", "tagline": "Generate UI mockups in seconds", "category": "design", "tags": ["design", "ui"], "tech_stack": ["Next.js", "Tailwind"], "cover_image_url": "https://images.unsplash.com/photo-1561070791-2526d30994b8?auto=format&fit=crop&q=80", "upvotes": 98, "views": 670, "comments": 12},
        {"name": "DeployDash", "tagline": "One-click deploys for indie projects", "category": "developer-tools", "tags": ["deploy", "devops"], "tech_stack": ["Go", "React"], "cover_image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80", "upvotes": 211, "views": 1450, "comments": 32},
        {"name": "FocusFox", "tagline": "Pomodoro timer with team sync", "category": "productivity", "tags": ["focus", "team"], "tech_stack": ["Svelte", "Node"], "cover_image_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80", "upvotes": 76, "views": 540, "comments": 9},
        {"name": "TaxTroll", "tagline": "AI tax assistant for freelancers", "category": "fintech", "tags": ["tax", "ai"], "tech_stack": ["Python", "React"], "cover_image_url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80", "upvotes": 165, "views": 1120, "comments": 24},
        {"name": "ChirpStream", "tagline": "Schedule and analyze your Twitter posts", "category": "marketing", "tags": ["twitter", "social"], "tech_stack": ["Rails", "Vue"], "cover_image_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80", "upvotes": 89, "views": 720, "comments": 14},
        {"name": "InkPress", "tagline": "Beautiful blogs for hackers", "category": "saas", "tags": ["blog", "publishing"], "tech_stack": ["Astro", "MDX"], "cover_image_url": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80", "upvotes": 134, "views": 890, "comments": 21},
        {"name": "NomadGrid", "tagline": "Find coworking spots in 200+ cities", "category": "social", "tags": ["travel", "remote"], "tech_stack": ["Flutter", "Firebase"], "cover_image_url": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80", "upvotes": 67, "views": 480, "comments": 8},
    ]
    for d in demo_projects:
        pid = str(uuid.uuid4())
        slug = "-".join(d["name"].lower().split()) + "-" + pid[:6]
        await db.projects.insert_one({
            "id": pid,
            "slug": slug,
            "name": d["name"],
            "tagline": d["tagline"],
            "description": f"{d['tagline']}. Built for indie hackers who care about craft and shipping.",
            "website_url": "https://example.com",
            "github_url": "https://github.com",
            "category": d["category"],
            "tags": d["tags"],
            "tech_stack": d["tech_stack"],
            "cover_image_url": d["cover_image_url"],
            "maker_id": maker["id"],
            "upvotes_count": d["upvotes"],
            "views_count": d["views"],
            "comments_count": d["comments"],
            "created_at": (datetime.now(timezone.utc) - timedelta(days=secrets.randbelow(20))).isoformat(),
        })


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.projects.create_index("slug", unique=True)
    await db.projects.create_index("maker_id")
    await db.upvotes.create_index([("project_id", 1), ("user_id", 1)], unique=True)
    await seed_admin()
    await seed_demo_data()
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


@api_router.get("/")
async def root():
    return {"message": "LaunchLoop API", "version": "1.0"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
