import httpx, os, json, uuid
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from main import CV_SITE, UPLOAD_DIR, cv_m, cv_q

api = APIRouter(prefix="/api")

VIDEO_DIR = UPLOAD_DIR / "videos"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

@api.post("/generate-video")
async def generate_video(url: str, project_id: str = ""):
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            screenshots = []
            for scroll_y in [0, 500, 1000, 1500, 2000, 2500, 3000]:
                sc_url = f"https://api.screenshotone.com/take?url={httpx.utils.quote(url)}&viewport_width=1280&viewport_height=800&scroll_y={scroll_y}&access_key=free&format=png&block_ads=true&block_trackers=true"
                try:
                    r = await c.get(sc_url, timeout=15)
                    if r.status_code == 200:
                        path = VIDEO_DIR / f"{uuid.uuid4()}.png"
                        path.write_bytes(r.content)
                        screenshots.append(str(path))
                except:
                    pass
            
            if not screenshots:
                return {"error": "Could not capture website", "ok": False}
            
            vid_id = str(uuid.uuid4())
            result = {
                "id": vid_id,
                "screenshots": [s.split("/")[-1] for s in screenshots],
                "count": len(screenshots),
                "ok": True,
                "note": "Screenshot preview generated. For real video, install Playwright + Chromium on your server."
            }
            return result
    except Exception as e:
        raise HTTPException(500, f"Video generation failed: {e}")
