# Main

from fastapi import FastAPI

from app.api.routes.audits import router as audits_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Authorized Digital Exposure Assessment Platform",
    version="0.2.0",
)


@app.get("/")
def root():
    return {"message": "Try Find Me! API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


app.include_router(audits_router, prefix="/api/v1")
