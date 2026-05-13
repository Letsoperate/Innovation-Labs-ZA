import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Innovation Lab ZA API")

app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','), allow_methods=["*"], allow_headers=["*"])

@app.get("/")
async def root():
    return {"message": "Innovation Lab ZA API", "version": "1.0"}

@app.get("/api/")
async def api_root():
    return {"message": "API is running"}
