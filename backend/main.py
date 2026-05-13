import os
import uuid
import json
import asyncio
import sqlite3
import hashlib
import logging
import secrets
import jwt
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response, UploadFile, File, Form, Query, Header
from fastapi.responses import Response as FastResponse
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ---------- Setup ----------
DB_PATH = os.environ.get("SQLITE_PATH", "/tmp/innovation_lab.db")

app = FastAPI(title="Innovation Lab ZA API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"
APP_NAME = os.environ.get("APP_NAME", "innovation-lab-za")
UPLOAD_DIR = Path("/tmp/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA busy_timeout=5000")
    return conn


async def query(sql: str, args: tuple = ()):
    def _run():
        conn = get_db()
        try:
            cur = conn.execute(sql, args)
            rows = [dict(r) for r in cur.fetchall()]
            return rows
        finally:
            conn.close()
    return await asyncio.to_thread(_run)


async def query_one(sql: str, args: tuple = ()):
    rows = await query(sql, args)
    return rows[0] if rows else None


async def execute(sql: str, args: tuple = ()):
    def _run():
        conn = get_db()
        try:
            conn.execute(sql, args)
            conn.commit()
        finally:
            conn.close()
    await asyncio.to_thread(_run)


SQL_SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    avatar_url TEXT,
    twitter TEXT,
    github TEXT,
    website TEXT,
    role TEXT DEFAULT 'user',
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tagline TEXT DEFAULT '',
    description TEXT DEFAULT '',
    website_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    category TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    tech_stack TEXT DEFAULT '[]',
    cover_image_url TEXT DEFAULT '',
    maker_id TEXT NOT NULL,
    upvotes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TEXT,
    FOREIGN KEY (maker_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS upvotes (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TEXT,
    UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    storage_path TEXT NOT NULL,
    original_filename TEXT,
    content_type TEXT,
    size INTEGER,
    uploaded_by TEXT NOT NULL,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT
);
"""


def parse_json_list(val) -> list:
    if val is None:
        return []
    if isinstance(val, list):
        return val
    try:
        return json.loads(val) if isinstance(val, str) else []
    except (json.JSONDecodeError, TypeError):
        return []


# ---------- Auth helpers ----------
def hash_password(password: str) -> str:
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ':' + pwd_hash.hex()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        salt_hex, pwd_hex = hashed.split(':')
        salt = bytes.fromhex(salt_hex)
        pwd_hash = hashlib.pbkdf2_hmac('sha256', plain.encode('utf-8'), salt, 100000)
        return pwd_hash.hex() == pwd_hex
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ.get("JWT_SECRET", "dev-secret-change-in-production")


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
        user = await query_one("SELECT * FROM users WHERE id = ?", (payload["sub"],))
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
def put_object(user_id: str, data: bytes, ext: str) -> dict:
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.{ext}"
    file_dir = UPLOAD_DIR / user_id
    file_dir.mkdir(parents=True, exist_ok=True)
    filepath = file_dir / filename
    filepath.write_bytes(data)
    return {"path": filename, "user_id": user_id, "size": len(data)}


def get_object(user_id: str, filename: str):
    filepath = UPLOAD_DIR / user_id / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    content_type = MIME_TYPES.get(filename.rsplit(".", 1)[-1].lower(), "application/octet-stream")
    return filepath.read_bytes(), content_type


MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml",
}


# ---------- Models ----------
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    username: str


class LoginRequest(BaseModel):
    email: str
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
    if await query_one("SELECT id FROM users WHERE email = ?", (email,)):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await query_one("SELECT id FROM users WHERE username = ?", (username,)):
        raise HTTPException(status_code=400, detail="Username taken")

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await execute(
        "INSERT INTO users (id, email, username, password_hash, name, role, created_at) VALUES (?,?,?,?,?,?,?)",
        (user_id, email, username, hash_password(payload.password), payload.name.strip(), "user", now),
    )
    user_doc = await query_one("SELECT * FROM users WHERE id = ?", (user_id,))
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return serialize_user(user_doc)


@api_router.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower().strip()
    user = await query_one("SELECT * FROM users WHERE email = ?", (email,))
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
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
        user = await query_one("SELECT * FROM users WHERE id = ?", (payload["sub"],))
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
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        setters = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [user["id"]]
        await execute(f"UPDATE users SET {setters} WHERE id = ?", tuple(values))
    fresh = await query_one("SELECT * FROM users WHERE id = ?", (user["id"],))
    return serialize_user(fresh)


@api_router.get("/users/{username}")
async def get_user(username: str):
    user = await query_one("SELECT * FROM users WHERE username = ?", (username.lower(),))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.pop("password_hash", None)
    projects = await query("SELECT * FROM projects WHERE maker_id = ? ORDER BY created_at DESC", (user["id"],))
    for p in projects:
        p["tags"] = parse_json_list(p.get("tags"))
        p["tech_stack"] = parse_json_list(p.get("tech_stack"))
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
    result = put_object(user["id"], data, ext)
    storage_path = f"{result['user_id']}/{result['path']}"
    file_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await execute(
        "INSERT INTO files (id, storage_path, original_filename, content_type, size, uploaded_by, created_at) VALUES (?,?,?,?,?,?,?)",
        (file_id, storage_path, file.filename, content_type, result["size"], user["id"], now),
    )
    return {"id": file_id, "url": f"/api/files/{storage_path}", "path": result["path"]}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await query_one("SELECT * FROM files WHERE storage_path = ? AND is_deleted = 0", (path,))
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    parts = path.split("/", 1)
    user_id, filename = parts if len(parts) == 2 else ("unknown", path)
    data, content_type = get_object(user_id, filename)
    return FastResponse(content=data, media_type=record.get("content_type", content_type))


# ---------- Projects ----------
def project_score(p: dict) -> int:
    return (p.get("upvotes_count", 0) or 0) * 3 + (p.get("views_count", 0) or 0) + (p.get("comments_count", 0) or 0) * 2


async def annotate_projects(projects: List[dict], current_user_id: Optional[str]):
    out = []
    for p in projects:
        maker = await query_one("SELECT * FROM users WHERE id = ?", (p["maker_id"],))
        if maker:
            maker.pop("password_hash", None)
        p["maker"] = serialize_user(maker) if maker else None
        p["score"] = project_score(p)
        p["tags"] = parse_json_list(p.get("tags"))
        p["tech_stack"] = parse_json_list(p.get("tech_stack"))
        if current_user_id:
            up = await query_one("SELECT id FROM upvotes WHERE project_id = ? AND user_id = ?", (p["id"], current_user_id))
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
    tags_json = json.dumps(payload.tags)
    tech_json = json.dumps(payload.tech_stack)
    await execute(
        "INSERT INTO projects (id, slug, name, tagline, description, website_url, github_url, category, tags, tech_stack, cover_image_url, maker_id, upvotes_count, views_count, comments_count, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (pid, slug, payload.name, payload.tagline, payload.description, payload.website_url, payload.github_url or "", payload.category, tags_json, tech_json, payload.cover_image_url or "", user["id"], 0, 0, 0, now),
    )
    project = await query_one("SELECT * FROM projects WHERE id = ?", (pid,))
    project["tags"] = parse_json_list(project.get("tags"))
    project["tech_stack"] = parse_json_list(project.get("tech_stack"))
    return project


@api_router.get("/projects")
async def list_projects(
    request: Request,
    sort: str = "recent",
    category: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 50,
):
    where = ["1=1"]
    params = []
    if category and category != "all":
        where.append("category = ?")
        params.append(category)
    if q:
        where.append("(name LIKE ? OR tagline LIKE ? OR tags LIKE ?)")
        like = f"%{q}%"
        params.extend([like, like, like])
    sql = f"SELECT * FROM projects WHERE {' AND '.join(where)} LIMIT {int(limit)}"
    projects = await query(sql, tuple(params))
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
    where = ["1=1"]
    params = []
    if period == "weekly":
        cutoff = (now - timedelta(days=7)).isoformat()
        where.append("created_at >= ?")
        params.append(cutoff)
    elif period == "monthly":
        cutoff = (now - timedelta(days=30)).isoformat()
        where.append("created_at >= ?")
        params.append(cutoff)
    sql = f"SELECT * FROM projects WHERE {' AND '.join(where)}"
    projects = await query(sql, tuple(params))
    projects.sort(key=project_score, reverse=True)
    projects = projects[:int(limit)]
    cur = await get_optional_user(request)
    projects = await annotate_projects(projects, cur["id"] if cur else None)
    return projects


@api_router.get("/projects/{slug}")
async def get_project(slug: str, request: Request):
    p = await query_one("SELECT * FROM projects WHERE slug = ?", (slug,))
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    await execute("UPDATE projects SET views_count = views_count + 1 WHERE id = ?", (p["id"],))
    p["views_count"] = (p.get("views_count", 0) or 0) + 1
    cur = await get_optional_user(request)
    annotated = await annotate_projects([p], cur["id"] if cur else None)
    return annotated[0]


@api_router.patch("/projects/{pid}")
async def update_project(pid: str, payload: ProjectUpdate, user: dict = Depends(get_current_user)):
    p = await query_one("SELECT * FROM projects WHERE id = ?", (pid,))
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    if p["maker_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        for k in ["tags", "tech_stack"]:
            if k in updates and isinstance(updates[k], list):
                updates[k] = json.dumps(updates[k])
        setters = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [pid]
        await execute(f"UPDATE projects SET {setters} WHERE id = ?", tuple(values))
    fresh = await query_one("SELECT * FROM projects WHERE id = ?", (pid,))
    fresh["tags"] = parse_json_list(fresh.get("tags"))
    fresh["tech_stack"] = parse_json_list(fresh.get("tech_stack"))
    return fresh


@api_router.delete("/projects/{pid}")
async def delete_project(pid: str, user: dict = Depends(get_current_user)):
    p = await query_one("SELECT * FROM projects WHERE id = ?", (pid,))
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    if p["maker_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    await execute("DELETE FROM comments WHERE project_id = ?", (pid,))
    await execute("DELETE FROM upvotes WHERE project_id = ?", (pid,))
    await execute("DELETE FROM projects WHERE id = ?", (pid,))
    return {"ok": True}


# ---------- Upvotes ----------
@api_router.post("/projects/{pid}/upvote")
async def toggle_upvote(pid: str, user: dict = Depends(get_current_user)):
    p = await query_one("SELECT * FROM projects WHERE id = ?", (pid,))
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    existing = await query_one("SELECT id FROM upvotes WHERE project_id = ? AND user_id = ?", (pid, user["id"]))
    if existing:
        await execute("DELETE FROM upvotes WHERE project_id = ? AND user_id = ?", (pid, user["id"]))
        await execute("UPDATE projects SET upvotes_count = MAX(upvotes_count - 1, 0) WHERE id = ?", (pid,))
        return {"upvoted": False, "upvotes_count": max(0, (p.get("upvotes_count", 0) or 0) - 1)}
    now = datetime.now(timezone.utc).isoformat()
    await execute(
        "INSERT INTO upvotes (id, project_id, user_id, created_at) VALUES (?,?,?,?)",
        (str(uuid.uuid4()), pid, user["id"], now),
    )
    await execute("UPDATE projects SET upvotes_count = upvotes_count + 1 WHERE id = ?", (pid,))
    return {"upvoted": True, "upvotes_count": (p.get("upvotes_count", 0) or 0) + 1}


# ---------- Comments ----------
@api_router.get("/projects/{pid}/comments")
async def get_comments(pid: str):
    comments = await query("SELECT * FROM comments WHERE project_id = ? ORDER BY created_at DESC", (pid,))
    out = []
    for c in comments:
        u = await query_one("SELECT * FROM users WHERE id = ?", (c["user_id"],))
        if u:
            u.pop("password_hash", None)
        c["author"] = serialize_user(u) if u else None
        out.append(c)
    return out


@api_router.post("/projects/{pid}/comments")
async def post_comment(pid: str, payload: CommentCreate, user: dict = Depends(get_current_user)):
    p = await query_one("SELECT * FROM projects WHERE id = ?", (pid,))
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    cid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await execute(
        "INSERT INTO comments (id, project_id, user_id, body, created_at) VALUES (?,?,?,?,?)",
        (cid, pid, user["id"], payload.body, now),
    )
    await execute("UPDATE projects SET comments_count = comments_count + 1 WHERE id = ?", (pid,))
    comment = await query_one("SELECT * FROM comments WHERE id = ?", (cid,))
    comment["author"] = serialize_user(user)
    return comment


# ---------- Stats ----------
@api_router.get("/stats")
async def stats():
    p = await query_one("SELECT COUNT(*) as cnt FROM projects")
    m = await query_one("SELECT COUNT(*) as cnt FROM users")
    u = await query_one("SELECT COUNT(*) as cnt FROM upvotes")
    c = await query_one("SELECT COUNT(*) as cnt FROM comments")
    return {
        "projects": p["cnt"],
        "makers": m["cnt"],
        "upvotes": u["cnt"],
        "comments": c["cnt"],
    }


@api_router.get("/categories")
async def categories():
    return [
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


# ---------- Startup ----------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@innovationlabza.dev")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await query_one("SELECT * FROM users WHERE email = ?", (admin_email,))
    if not existing:
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        await execute(
            "INSERT INTO users (id, email, username, password_hash, name, bio, role, created_at) VALUES (?,?,?,?,?,?,?,?)",
            (user_id, admin_email, "admin", hash_password(admin_password), "Admin", "Platform admin", "admin", now),
        )
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await execute("UPDATE users SET password_hash = ? WHERE email = ?", (hash_password(admin_password), admin_email))


async def seed_demo_data():
    count = await query_one("SELECT COUNT(*) as cnt FROM projects")
    if count["cnt"] > 0:
        return
    demo_email = "demo@innovationlabza.dev"
    maker = await query_one("SELECT * FROM users WHERE email = ?", (demo_email,))
    if not maker:
        maker_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        await execute(
            "INSERT INTO users (id, email, username, password_hash, name, bio, role, twitter, github, website, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (maker_id, demo_email, "demo", hash_password("demo123"), "Demo Maker", "Building stuff in public.", "user", "demo", "demo", "https://example.com", now),
        )
        maker = await query_one("SELECT * FROM users WHERE id = ?", (maker_id,))
    demo_projects = [
        {"name": "Synthwave Notes", "tagline": "Markdown notes with a retro twist", "category": "productivity", "tags": ["notes", "markdown"], "tech_stack": ["React", "FastAPI"], "cover_image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80", "upvotes": 142, "views": 980, "comments": 18},
        {"name": "PixelForge", "tagline": "Generate UI mockups in seconds", "category": "design", "tags": ["design", "ui"], "tech_stack": ["Next.js", "Tailwind"], "cover_image_url": "https://images.unsplash.com/photo-1561070791-2526d30994b8?auto=format&fit=crop&q=80", "upvotes": 98, "views": 670, "comments": 12},
        {"name": "DeployDash", "tagline": "One-click deploys for indie projects", "category": "developer-tools", "tags": ["deploy", "devops"], "tech_stack": ["Go", "React"], "cover_image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80", "upvotes": 211, "views": 1450, "comments": 32},
        {"name": "FocusFox", "tagline": "Pomodoro timer with team sync", "category": "productivity", "tags": ["focus", "team"], "tech_stack": ["Svelte", "Node"], "cover_image_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80", "upvotes": 76, "views": 540, "comments": 9},
        {"name": "TaxTroll", "tagline": "AI tax assistant for freelancers", "category": "fintech", "tags": ["tax", "ai"], "tech_stack": ["Python", "React"], "cover_image_url": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80", "upvotes": 165, "views": 1120, "comments": 24},
        {"name": "ChirpStream", "tagline": "Schedule and analyze your Twitter posts", "category": "marketing", "tags": ["twitter", "social"], "tech_stack": ["Rails", "Vue"], "cover_image_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80", "upvotes": 89, "views": 720, "comments": 14},
        {"name": "InkPress", "tagline": "Beautiful blogs for hackers", "category": "saas", "tags": ["blog", "publishing"], "tech_stack": ["Astro", "MDX"], "cover_image_url": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80", "upvotes": 134, "views": 890, "comments": 21},
        {"name": "NomadGrid", "tagline": "Find coworking spots in 200+ cities", "category": "social", "tags": ["travel", "remote"], "tech_stack": ["Flutter", "Firebase"], "cover_image_url": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80", "upvotes": 67, "views": 480, "comments": 8},
        {"name": "Predator Bot Market", "tagline": "A marketplace for trading bots and automation tools", "category": "saas", "tags": ["bots", "automation", "marketplace"], "tech_stack": ["React", "Node.js"], "cover_image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80", "website_url": "https://predator-bot-market.netlify.app/", "upvotes": 120, "views": 850, "comments": 16},
    ]
    for d in demo_projects:
        pid = str(uuid.uuid4())
        slug = "-".join(d["name"].lower().split()) + "-" + pid[:6]
        now = (datetime.now(timezone.utc) - timedelta(days=secrets.randbelow(20))).isoformat()
        await execute(
            "INSERT INTO projects (id, slug, name, tagline, description, website_url, github_url, category, tags, tech_stack, cover_image_url, maker_id, upvotes_count, views_count, comments_count, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (pid, slug, d["name"], d["tagline"], f"{d['tagline']}. Built for indie hackers who care about craft and shipping.", d.get("website_url", "https://example.com"), "https://github.com", d["category"], json.dumps(d["tags"]), json.dumps(d["tech_stack"]), d["cover_image_url"], maker["id"], d["upvotes"], d["views"], d["comments"], now),
        )


@app.on_event("startup")
async def startup():
    for stmt in SQL_SCHEMA.strip().split(";"):
        stmt = stmt.strip()
        if stmt and not stmt.startswith("--"):
            await execute(stmt)
    await seed_admin()
    await seed_demo_data()
    logger.info("SQLite database initialized and seeded")


@api_router.get("/")
async def root():
    return {"message": "Innovation Lab ZA API", "version": "1.0"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
