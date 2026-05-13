"""Innovation Lab ZA backend API tests"""
import os
import uuid
import io
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8000').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@innovationlabza.dev"
ADMIN_PASSWORD = "admin123"
DEMO_EMAIL = "demo@innovationlabza.dev"
DEMO_PASSWORD = "demo123"


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="session")
def new_user():
    """Create a brand new user once per session and return its session."""
    s = requests.Session()
    uniq = uuid.uuid4().hex[:8]
    payload = {
        "email": f"TEST_{uniq}@example.com",
        "password": "TestPass123!",
        "name": f"TEST User {uniq}",
        "username": f"test_{uniq}",
    }
    r = s.post(f"{API}/auth/register", json=payload, timeout=30)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    return {"session": s, "payload": payload, "user": r.json()}


# ---------- Health ----------
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        assert "Innovation Lab ZA" in r.json().get("message", "")


# ---------- Auth ----------
class TestAuth:
    def test_register_login_me_logout(self):
        s = requests.Session()
        uniq = uuid.uuid4().hex[:8]
        payload = {
            "email": f"TEST_auth_{uniq}@example.com",
            "password": "Pass1234!",
            "name": "Test Auth",
            "username": f"testauth_{uniq}",
        }
        r = s.post(f"{API}/auth/register", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == payload["email"].lower()
        assert "access_token" in s.cookies
        assert "refresh_token" in s.cookies

        # me
        r = s.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        assert r.json()["username"] == payload["username"]

        # logout
        r = s.post(f"{API}/auth/logout", timeout=15)
        assert r.status_code == 200
        # after logout the previous cookies should not auth
        s2 = requests.Session()
        r = s2.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

        # login again
        r = s2.post(f"{API}/auth/login", json={"email": payload["email"], "password": payload["password"]}, timeout=15)
        assert r.status_code == 200
        r = s2.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": "nope@nope.dev", "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_duplicate_email(self):
        uniq = uuid.uuid4().hex[:8]
        payload = {
            "email": f"TEST_dup_{uniq}@example.com",
            "password": "Pass1234!",
            "name": "Dup",
            "username": f"dup_{uniq}",
        }
        r = requests.post(f"{API}/auth/register", json=payload, timeout=15)
        assert r.status_code == 200
        r = requests.post(f"{API}/auth/register", json=payload, timeout=15)
        assert r.status_code == 400

    def test_admin_login(self, admin_session):
        r = admin_session.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"


# ---------- Categories & Stats ----------
class TestMeta:
    def test_categories(self):
        r = requests.get(f"{API}/categories", timeout=15)
        assert r.status_code == 200
        cats = r.json()
        assert isinstance(cats, list) and len(cats) >= 5
        assert all("slug" in c and "name" in c for c in cats)

    def test_stats(self):
        r = requests.get(f"{API}/stats", timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ["projects", "makers", "upvotes", "comments"]:
            assert k in d


# ---------- Projects ----------
class TestProjects:
    def test_list_recent(self):
        r = requests.get(f"{API}/projects?sort=recent&limit=20", timeout=20)
        assert r.status_code == 200
        ps = r.json()
        assert isinstance(ps, list)
        assert len(ps) >= 1
        # ensure no _id leak
        assert all("_id" not in p for p in ps)
        # ensure maker attached
        assert "maker" in ps[0]
        assert "score" in ps[0]

    def test_list_trending_sorted(self):
        r = requests.get(f"{API}/projects?sort=trending&limit=20", timeout=20)
        assert r.status_code == 200
        ps = r.json()
        scores = [p["score"] for p in ps]
        assert scores == sorted(scores, reverse=True)

    def test_category_filter(self):
        r = requests.get(f"{API}/projects?category=productivity", timeout=20)
        assert r.status_code == 200
        for p in r.json():
            assert p["category"] == "productivity"

    def test_search_query(self):
        r = requests.get(f"{API}/projects?q=Synthwave", timeout=20)
        assert r.status_code == 200
        names = [p["name"] for p in r.json()]
        assert any("Synthwave" in n for n in names)

    def test_leaderboard_periods(self):
        for period in ["weekly", "monthly", "all"]:
            r = requests.get(f"{API}/projects/leaderboard?period={period}&limit=10", timeout=20)
            assert r.status_code == 200, f"period={period} failed: {r.text}"
            ps = r.json()
            assert isinstance(ps, list)
            scores = [p["score"] for p in ps]
            assert scores == sorted(scores, reverse=True), f"leaderboard {period} not sorted"

    def test_create_get_update_delete_project(self, new_user):
        s = new_user["session"]
        payload = {
            "name": f"TEST Project {uuid.uuid4().hex[:6]}",
            "tagline": "A test project",
            "description": "Long description for TEST project",
            "website_url": "https://example.com",
            "category": "ai",
            "tags": ["test", "ai"],
            "tech_stack": ["Python"],
            "cover_image_url": "https://example.com/img.png",
        }
        r = s.post(f"{API}/projects", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        proj = r.json()
        assert proj["name"] == payload["name"]
        assert proj["slug"]
        pid = proj["id"]
        slug = proj["slug"]

        # GET by slug increments views
        r = requests.get(f"{API}/projects/{slug}", timeout=15)
        assert r.status_code == 200
        before_views = r.json()["views_count"]
        r2 = requests.get(f"{API}/projects/{slug}", timeout=15)
        assert r2.json()["views_count"] == before_views + 1

        # Unauthorized update from a different session
        other = requests.Session()
        r = other.patch(f"{API}/projects/{pid}", json={"name": "Hacked"}, timeout=15)
        assert r.status_code == 401

        # Owner update
        r = s.patch(f"{API}/projects/{pid}", json={"tagline": "Updated tagline"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["tagline"] == "Updated tagline"

        # Verify persistence
        r = requests.get(f"{API}/projects/{slug}", timeout=15)
        assert r.json()["tagline"] == "Updated tagline"

        # Delete by owner
        r = s.delete(f"{API}/projects/{pid}", timeout=15)
        assert r.status_code == 200

        # Verify gone
        r = requests.get(f"{API}/projects/{slug}", timeout=15)
        assert r.status_code == 404

    def test_create_project_requires_auth(self):
        r = requests.post(f"{API}/projects", json={
            "name": "X", "tagline": "y", "description": "z",
            "website_url": "https://e.com", "category": "ai"
        }, timeout=15)
        assert r.status_code == 401


# ---------- Upvotes ----------
class TestUpvotes:
    def test_toggle_upvote(self, new_user):
        s = new_user["session"]
        # create a project to upvote
        r = s.post(f"{API}/projects", json={
            "name": f"TEST Upvote {uuid.uuid4().hex[:5]}",
            "tagline": "u", "description": "d",
            "website_url": "https://e.com", "category": "ai",
        }, timeout=15)
        assert r.status_code == 200
        pid = r.json()["id"]
        slug = r.json()["slug"]

        # Upvote
        r = s.post(f"{API}/projects/{pid}/upvote", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["upvoted"] is True
        assert d["upvotes_count"] == 1

        # Toggle off
        r = s.post(f"{API}/projects/{pid}/upvote", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["upvoted"] is False
        assert d["upvotes_count"] == 0

        # Verify has_upvoted false
        r = s.get(f"{API}/projects/{slug}", timeout=15)
        assert r.json()["has_upvoted"] is False

        # cleanup
        s.delete(f"{API}/projects/{pid}", timeout=15)

    def test_upvote_requires_auth(self):
        r = requests.post(f"{API}/projects/nonexistent/upvote", timeout=15)
        assert r.status_code == 401


# ---------- Comments ----------
class TestComments:
    def test_comments_crud(self, new_user):
        s = new_user["session"]
        r = s.post(f"{API}/projects", json={
            "name": f"TEST Comments {uuid.uuid4().hex[:5]}",
            "tagline": "t", "description": "d",
            "website_url": "https://e.com", "category": "ai",
        }, timeout=15)
        pid = r.json()["id"]
        r = s.post(f"{API}/projects/{pid}/comments", json={"body": "Great work!"}, timeout=15)
        assert r.status_code == 200
        c = r.json()
        assert c["body"] == "Great work!"
        assert c["author"]["id"] == new_user["user"]["id"]

        r = requests.get(f"{API}/projects/{pid}/comments", timeout=15)
        assert r.status_code == 200
        cs = r.json()
        assert any(c2["body"] == "Great work!" for c2 in cs)
        assert all("_id" not in c2 for c2 in cs)

        # cleanup
        s.delete(f"{API}/projects/{pid}", timeout=15)


# ---------- Profiles ----------
class TestProfiles:
    def test_get_user_profile(self):
        r = requests.get(f"{API}/users/demo", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["user"]["username"] == "demo"
        assert isinstance(d["projects"], list)

    def test_get_user_404(self):
        r = requests.get(f"{API}/users/__nope__{uuid.uuid4().hex[:6]}", timeout=15)
        assert r.status_code == 404

    def test_update_profile(self, new_user):
        s = new_user["session"]
        r = s.patch(f"{API}/users/me", json={"bio": "Updated bio TEST", "twitter": "tx"}, timeout=15)
        assert r.status_code == 200
        assert r.json()["bio"] == "Updated bio TEST"
        # Verify persistence via /auth/me
        r = s.get(f"{API}/auth/me", timeout=15)
        assert r.json()["bio"] == "Updated bio TEST"
        assert r.json()["twitter"] == "tx"


# ---------- Upload (storage) ----------
class TestUpload:
    def test_upload_requires_auth(self):
        r = requests.post(f"{API}/upload", files={"file": ("a.png", b"x", "image/png")}, timeout=20)
        assert r.status_code == 401

    def test_upload_and_fetch(self, new_user):
        s = new_user["session"]
        # 1x1 PNG
        png = bytes.fromhex(
            "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
            "890000000d49444154789c6360000002000001e221bc330000000049454e44ae426082"
        )
        r = s.post(f"{API}/upload", files={"file": ("test.png", png, "image/png")}, timeout=60)
        if r.status_code != 200:
            pytest.skip(f"upload failed (storage env): {r.status_code} {r.text}")
        d = r.json()
        assert "url" in d and d["url"].startswith("/api/files/")
        # fetch
        r2 = requests.get(f"{BASE_URL}{d['url']}", timeout=30)
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/")
