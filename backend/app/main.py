# Main

from fastapi import FastAPI

from app.api.routes.audits import router as audits_router

app = FastAPI(
    title="Try Find Me! — OSINT",
    description="Authorized Digital Exposure Assessment Platform",
    version="0.1.1",
)


@app.get("/")
def root():
    return {"message": "Try Find Me! API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


app.include_router(audits_router, prefix="/api/v1")
