from fastapi import FastAPI
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Innovation Lab ZA API")
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','), allow_methods=["*"], allow_headers=["*"])

@app.get("/api/")
async def root():
    return {"message": "Innovation Lab ZA API", "version": "1.0"}
