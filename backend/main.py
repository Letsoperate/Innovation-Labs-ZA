import os, uuid, json, hashlib, logging, secrets, httpx, jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Request, Response, UploadFile, File
from fastapi.responses import Response as FastResponse, RedirectResponse
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Innovation Lab ZA API")
api = APIRouter(prefix="/api")
JWT_ALGORITHM = "HS256"
CV_SITE = os.environ.get("CONVEX_SITE_URL", "https://small-dogfish-122.convex.site")

async def cv_q(type_: str, **params):
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.get(f"{CV_SITE}/query", params={"type": type_, **params})
        return r.json() if r.status_code == 200 else None

async def cv_m(type_: str, args: dict):
    async with httpx.AsyncClient(timeout=15) as c:
        r = await c.post(f"{CV_SITE}/mutation", json={"type": type_, "args": args})
        if r.status_code == 200: return r.json()
        raise Exception(f"Convex error {r.status_code}: {r.text}")

async def cv_get_user_by_email(email):
    return await cv_q("getUserByEmail", email=email)
async def cv_get_user_by_username(username):
    return await cv_q("getUserByUsername", username=username)
async def cv_create_user(**k): return await cv_m("createUser", k)
async def cv_update_user(i, u): return await cv_m("updateUser", {"id": i, "updates": u})
async def cv_list_projects(sort="recent", category=None, q=None, limit=50):
    p = {"sort": sort, "limit": str(limit)}
    if category: p["category"] = category
    if q: p["q"] = q
    return await cv_q("listProjects", **p) or []
async def cv_get_project(slug): return await cv_q("getProject", slug=slug)
async def cv_create_project(**k): return await cv_m("createProject", k)
async def cv_update_project(slug, u): return await cv_m("updateProject", {"slug": slug, "updates": u})
async def cv_delete_project(slug): return await cv_m("deleteProject", {"slug": slug})
async def cv_get_upvote(pid, uid): return await cv_q("getUpvote", projectId=pid, userId=uid)
async def cv_toggle_upvote(pid, uid):
    return await cv_m("toggleUpvote", {"projectId": pid, "userId": uid, "createdAt": datetime.now(timezone.utc).isoformat()})
async def cv_get_bookmark(pid, uid): return await cv_q("getBookmark", projectId=pid, userId=uid)
async def cv_toggle_bookmark(pid, uid):
    return await cv_m("toggleBookmark", {"projectId": pid, "userId": uid, "createdAt": datetime.now(timezone.utc).isoformat()})
async def cv_record_view(pid, ip):
    return await cv_m("recordView", {"projectId": pid, "ipAddress": ip, "viewedAt": datetime.now(timezone.utc).isoformat()})
async def cv_get_banners(): return await cv_q("getBanners") or []
async def cv_create_banner(**k): return await cv_m("createBanner", k)
async def cv_delete_banner(bid): return await cv_m("deleteBanner", {"id": bid})

def hash_password(p):
    s = os.urandom(16); return s.hex() + ':' + hashlib.pbkdf2_hmac('sha256', p.encode(), s, 100000).hex()
def verify_password(p, h):
    try: return hashlib.pbkdf2_hmac('sha256', p.encode(), bytes.fromhex(h.split(':')[0]), 100000).hex() == h.split(':')[1]
    except: return False
def get_jwt_secret(): return os.environ.get("JWT_SECRET", "dev-secret-change-in-production")
def create_access_token(uid, email):
    return jwt.encode({"sub": uid, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=1440), "type": "access"}, get_jwt_secret(), algorithm=JWT_ALGORITHM)
def create_refresh_token(uid):
    return jwt.encode({"sub": uid, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}, get_jwt_secret(), algorithm=JWT_ALGORITHM)
def set_cookies(r, at, rt):
    r.set_cookie("access_token", at, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    r.set_cookie("refresh_token", rt, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

def serialize_user(u):
    return {"id": u.get("id",""), "email": u["email"], "username": u.get("username"), "name": u.get("name",""), "bio": u.get("bio",""), "avatar_url": u.get("avatar_url") or u.get("avatarUrl"), "twitter": u.get("twitter"), "github": u.get("github"), "website": u.get("website"), "role": u.get("role","user"), "created_at": u.get("created_at") or u.get("createdAt")}

async def get_current_user(request):
    token = request.cookies.get("access_token") or ""
    if not token:
        ah = request.headers.get("Authorization","")
        if ah.startswith("Bearer "): token = ah[7:]
    if not token: raise HTTPException(401, "Not authenticated")
    try:
        p = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if p.get("type") != "access": raise HTTPException(401, "Invalid token type")
        u = await cv_get_user_by_email(p["sub"])
        if not u: raise HTTPException(401, "User not found")
        return u
    except jwt.ExpiredSignatureError: raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError: raise HTTPException(401, "Invalid token")

async def get_optional_user(request):
    try: return await get_current_user(request)
    except HTTPException: return None

def project_score(p):
    return (p.get("upvotesCount",0) or 0)*3 + (p.get("viewsCount",0) or 0) + (p.get("commentsCount",0) or 0)*2 + (p.get("bookmarksCount",0) or 0)*2

def compute_badges(p):
    b=[]; s=project_score(p); d=999
    if p.get("createdAt"):
        try: d=(datetime.now(timezone.utc)-datetime.fromisoformat(p["createdAt"])).days
        except: pass
    if s>=200: b.append({"type":"hot","label":"HOT","color":"bg-red-500"})
    elif s>=100: b.append({"type":"rising","label":"RISING","color":"bg-orange-500"})
    if d<=3: b.append({"type":"new","label":"NEW","color":"bg-blue-500"})
    elif d<=7 and s>=50: b.append({"type":"fast","label":"FAST GROWING","color":"bg-green-500"})
    return b

def apply_crowns(ps):
    for i,p in enumerate(sorted(ps, key=project_score, reverse=True)):
        if i==0: p["badges"].insert(0,{"type":"crown","label":"RANK #1","color":"bg-yellow-500"})
        elif i==1: p["badges"].insert(0,{"type":"crown","label":"RANK #2","color":"bg-slate-400"})
        elif i==2: p["badges"].insert(0,{"type":"crown","label":"RANK #3","color":"bg-amber-700"})

async def annotate(ps, uid):
    out=[]
    for p in ps:
        p["score"]=project_score(p); p["badges"]=compute_badges(p); p["has_upvoted"]=False; p["has_bookmarked"]=False
        if uid:
            u=await cv_get_upvote(str(p["_id"]),uid); p["has_upvoted"]=u is not None
            b=await cv_get_bookmark(str(p["_id"]),uid); p["has_bookmarked"]=b is not None
        out.append(p)
    return out

class RegReq(BaseModel):
    email: str; password: str; name: str; username: str
class LoginReq(BaseModel):
    email: str; password: str
class ProfileUpd(BaseModel):
    name: Optional[str]=None; bio: Optional[str]=None; twitter: Optional[str]=None; github: Optional[str]=None; website: Optional[str]=None; avatar_url: Optional[str]=None
class ProjCreate(BaseModel):
    name: str; tagline: str; description: str; website_url: str; category: str
    tags: List[str]=[]; tech_stack: List[str]=[]; cover_image_url: Optional[str]=None; github_url: Optional[str]=None
class ProjUpdate(BaseModel):
    name: Optional[str]=None; tagline: Optional[str]=None; description: Optional[str]=None; website_url: Optional[str]=None; category: Optional[str]=None
    tags: Optional[List[str]]=None; tech_stack: Optional[List[str]]=None; cover_image_url: Optional[str]=None; github_url: Optional[str]=None
class CmtCreate(BaseModel):
    body: str; parent_id: Optional[str]=None

@api.post("/auth/register")
async def register(p: RegReq, resp: Response):
    e=p.email.lower().strip(); u=p.username.lower().strip()
    if await cv_get_user_by_email(e): raise HTTPException(400,"Email already registered")
    if await cv_get_user_by_username(u): raise HTTPException(400,"Username taken")
    uid=str(uuid.uuid4()); n=datetime.now(timezone.utc).isoformat()
    await cv_create_user(id=uid,email=e,username=u,passwordHash=hash_password(p.password),name=p.name.strip(),role="user",createdAt=n)
    set_cookies(resp,create_access_token(uid,e),create_refresh_token(uid))
    return serialize_user(await cv_get_user_by_email(e))

@api.post("/auth/login")
async def login(p: LoginReq, resp: Response):
    e=p.email.lower().strip(); u=await cv_get_user_by_email(e)
    if not u or not verify_password(p.password,u.get("passwordHash","")): raise HTTPException(401,"Invalid email or password")
    set_cookies(resp,create_access_token(u["_id"],e),create_refresh_token(u["_id"]))
    return serialize_user(u)

@api.post("/auth/logout")
async def logout(resp: Response):
    resp.delete_cookie("access_token",path="/"); resp.delete_cookie("refresh_token",path="/"); return {"ok":True}

@api.get("/auth/me")
async def me(u: dict = Depends(get_current_user)): return serialize_user(u)

@api.post("/auth/refresh")
async def refresh(req: Request, resp: Response):
    rt=req.cookies.get("refresh_token")
    if not rt: raise HTTPException(401,"No refresh token")
    try:
        p=jwt.decode(rt,get_jwt_secret(),algorithms=[JWT_ALGORITHM])
        if p.get("type")!="refresh": raise HTTPException(401,"Invalid token")
        u=await cv_get_user_by_email(p["sub"])
        if not u: raise HTTPException(401,"User not found")
        resp.set_cookie("access_token",create_access_token(u["_id"],u["email"]),httponly=True,secure=False,samesite="lax",max_age=86400,path="/")
        return {"ok":True}
    except jwt.InvalidTokenError: raise HTTPException(401,"Invalid refresh token")

@api.get("/auth/github")
async def github_login():
    cid=os.environ.get("GITHUB_CLIENT_ID","")
    ru=os.environ.get("GITHUB_REDIRECT_URI","https://innovation-lab-za.vercel.app/_/backend/api/auth/github/callback")
    return {"url":f"https://github.com/login/oauth/authorize?client_id={cid}&redirect_uri={ru}&scope=user:email"}

@api.get("/auth/github/callback")
async def github_cb(code: str, resp: Response):
    cid=os.environ.get("GITHUB_CLIENT_ID",""); cs=os.environ.get("GITHUB_CLIENT_SECRET","")
    if not cid or not cs: raise HTTPException(500,"GitHub OAuth not configured")
    async with httpx.AsyncClient(timeout=15) as c:
        tr=await c.post("https://github.com/login/oauth/access_token",json={"client_id":cid,"client_secret":cs,"code":code},headers={"Accept":"application/json"})
        td=tr.json(); at=td.get("access_token")
        if not at: raise HTTPException(400,"GitHub auth failed")
        ur=await c.get("https://api.github.com/user",headers={"Authorization":f"Bearer {at}"})
        gu=ur.json(); ge=gu.get("email")
        if not ge:
            er=await c.get("https://api.github.com/user/emails",headers={"Authorization":f"Bearer {at}"})
            es=er.json(); pr=next((e for e in es if e.get("primary")),es[0]or{}); ge=pr.get("email","")
    gid=str(gu.get("id","")); un=gu.get("login",gid).lower(); nm=gu.get("name")or un; av=gu.get("avatar_url","")
    ex=await cv_get_user_by_email(ge)
    if ex:
        if av: await cv_update_user(ex["_id"],{"name":nm,"avatarUrl":av})
    else:
        uid=str(uuid.uuid4()); n=datetime.now(timezone.utc).isoformat()
        await cv_create_user(id=uid,email=ge,username=un,passwordHash=hash_password("gh_"+gid),name=nm,role="user",avatarUrl=av,createdAt=n)
        ex=await cv_get_user_by_email(ge)
    fu=os.environ.get("FRONTEND_URL","https://innovation-lab-za.vercel.app")
    rd=RedirectResponse(url=f"{fu}?github_auth=1",status_code=302)
    set_cookies(rd,create_access_token(ex["_id"],ge),create_refresh_token(ex["_id"]))
    return rd

@api.patch("/users/me")
async def update_me(p: ProfileUpd, u: dict = Depends(get_current_user)):
    upd={}
    if p.name is not None: upd["name"]=p.name
    if p.bio is not None: upd["bio"]=p.bio
    if p.twitter is not None: upd["twitter"]=p.twitter
    if p.github is not None: upd["github"]=p.github
    if p.website is not None: upd["website"]=p.website
    if p.avatar_url is not None: upd["avatarUrl"]=p.avatar_url
    if upd: await cv_update_user(u["_id"],upd)
    return serialize_user(await cv_get_user_by_email(u["email"]))

@api.get("/users/{username}")
async def get_user(username: str):
    u=await cv_get_user_by_username(username.lower())
    if not u: raise HTTPException(404,"User not found")
    return {"user":serialize_user(u),"projects":[]}

@api.post("/projects")
async def create_project(p: ProjCreate, u: dict = Depends(get_current_user)):
    pid=str(uuid.uuid4()); slug="-".join(p.name.lower().split())[:60]+"-"+pid[:6]
    n=datetime.now(timezone.utc).isoformat()
    await cv_create_project(id=pid,slug=slug,name=p.name,tagline=p.tagline,description=p.description,websiteUrl=p.website_url,githubUrl=p.github_url or "",category=p.category,tags=json.dumps(p.tags),techStack=json.dumps(p.tech_stack),coverImageUrl=p.cover_image_url or "",makerId=u["_id"],createdAt=n)
    return await cv_get_project(slug)

@api.get("/projects")
async def list_projects(req: Request, sort: str ="recent", category: Optional[str]=None, q: Optional[str]=None, limit: int=50):
    ps=await cv_list_projects(sort=sort,category=category,q=q,limit=limit)
    cu=await get_optional_user(req)
    return await annotate(ps,cu["_id"]if cu else None)

@api.get("/projects/leaderboard")
async def leaderboard(req: Request, period: str="all", limit: int=10):
    n=datetime.now(timezone.utc); ps=await cv_list_projects(sort="trending",limit=500)
    if period=="weekly": c=(n-timedelta(days=7)).isoformat(); ps=[p for p in ps if p.get("createdAt","")>=c]
    elif period=="monthly": c=(n-timedelta(days=30)).isoformat(); ps=[p for p in ps if p.get("createdAt","")>=c]
    ps.sort(key=project_score,reverse=True); ps=ps[:int(limit)]
    cu=await get_optional_user(req)
    ps=await annotate(ps,cu["_id"]if cu else None)
    apply_crowns(ps); return ps

@api.get("/projects/{slug}")
async def get_project(slug: str, req: Request):
    p=await cv_get_project(slug)
    if not p: raise HTTPException(404,"Project not found")
    ip=req.headers.get("x-forwarded-for","").split(",")[0].strip()or"unknown"
    await cv_record_view(str(p["_id"]),ip)
    p["viewsCount"]=(p.get("viewsCount",0)or 0)+1
    cu=await get_optional_user(req)
    an=await annotate([p],cu["_id"]if cu else None); return an[0]

@api.patch("/projects/{pid}")
async def update_project(pid: str, p: ProjUpdate, u: dict = Depends(get_current_user)):
    pr=await cv_get_project(pid)or{}
    if not pr: raise HTTPException(404,"Project not found")
    if pr.get("makerId")!=u["_id"]and u.get("role")!="admin": raise HTTPException(403,"Forbidden")
    upd={}
    for a,b in[("name","name"),("tagline","tagline"),("description","description"),("website_url","websiteUrl"),("category","category"),("github_url","githubUrl"),("cover_image_url","coverImageUrl")]:
        v=getattr(p,a,None)
        if v is not None: upd[b]=v
    if p.tags is not None: upd["tags"]=json.dumps(p.tags)
    if p.tech_stack is not None: upd["techStack"]=json.dumps(p.tech_stack)
    if upd: await cv_update_project(pid,upd)
    fr=await cv_get_project(pid)
    if fr: fr["tags"]=json.loads(fr.get("tags","[]")); fr["techStack"]=json.loads(fr.get("techStack","[]"))
    return fr

@api.delete("/projects/{pid}")
async def delete_project(pid: str, u: dict = Depends(get_current_user)):
    p=await cv_get_project(pid)or{}
    if not p: raise HTTPException(404,"Project not found")
    if p.get("makerId")!=u["_id"]and u.get("role")!="admin": raise HTTPException(403,"Forbidden")
    await cv_delete_project(pid); return {"ok":True}

@api.post("/projects/{pid}/upvote")
async def toggle_upvote(pid: str, u: dict = Depends(get_current_user)):
    r=await cv_toggle_upvote(pid,u["_id"]); p=await cv_get_project(pid)or{}
    return{"upvoted":r.get("upvoted",True),"upvotes_count":p.get("upvotesCount",0)or 0}

@api.post("/projects/{pid}/bookmark")
async def toggle_bookmark(pid: str, u: dict = Depends(get_current_user)):
    return await cv_toggle_bookmark(pid,u["_id"])

@api.get("/banners")
async def get_banners(): return await cv_get_banners()

@api.post("/admin/banners")
async def create_banner(image_url: str,caption: str="",link_url: str="",position: str="top",u: dict = Depends(get_current_user)):
    if u.get("role")!="admin": raise HTTPException(403,"Admin only")
    bid=str(uuid.uuid4()); n=datetime.now(timezone.utc).isoformat()
    await cv_create_banner(id=bid,imageUrl=image_url,caption=caption,linkUrl=link_url,position=position,sortOrder=0,createdBy=u["_id"],createdAt=n)
    return{"ok":True}

@api.delete("/admin/banners/{bid}")
async def delete_banner(bid: str, u: dict = Depends(get_current_user)):
    if u.get("role")!="admin": raise HTTPException(403,"Admin only")
    await cv_delete_banner(bid); return{"ok":True}

@api.get("/stats")
async def stats():
    ps=await cv_list_projects(sort="recent",limit=0)
    return{"projects":len(ps),"makers":0,"upvotes":0,"comments":0}

@api.get("/categories")
async def categories():
    return[{"slug":"ai","name":"AI & ML","icon":"Robot"},{"slug":"developer-tools","name":"Developer Tools","icon":"Code"},{"slug":"productivity","name":"Productivity","icon":"Lightning"},{"slug":"design","name":"Design","icon":"PaintBrush"},{"slug":"marketing","name":"Marketing","icon":"Megaphone"},{"slug":"fintech","name":"Fintech","icon":"CurrencyDollar"},{"slug":"social","name":"Social","icon":"Users"},{"slug":"saas","name":"SaaS","icon":"Cloud"},{"slug":"mobile","name":"Mobile","icon":"DeviceMobile"},{"slug":"open-source","name":"Open Source","icon":"GitBranch"}]

@api.get("/")
async def root(): return{"message":"Innovation Lab ZA API","version":"1.0"}

app.include_router(api)
app.add_middleware(CORSMiddleware,allow_credentials=True,allow_origins=os.environ.get('CORS_ORIGINS','*').split(','),allow_methods=["*"],allow_headers=["*"])
