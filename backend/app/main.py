# Main

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.audits import router as audits_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Authorized Digital Exposure Assessment Platform",
    version="0.2.0",
)

allowed_origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/")
def root():
    return {"message": "Try Find Me! API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


app.include_router(audits_router, prefix="/api/v1")
