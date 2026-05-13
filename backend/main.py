import os
from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware

app = FastAPI(title="Innovation Lab ZA API")
api = APIRouter(prefix="/api")

@api.get("/")
async def root():
    return {"message": "Innovation Lab ZA API", "version": "1.0"}

app.include_router(api)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','), allow_methods=["*"], allow_headers=["*"])
