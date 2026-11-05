# Main FastAPI application

import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.assessment import router as assessment_router
from app.api.routes.audits import router as audits_router
from app.api.routes.ownership import router as ownership_router
from app.api.routes.sources import router as sources_router
from app.core.config import settings
from app.core.logging import get_logger, log_event

logger = get_logger("app.main")

app = FastAPI(
    title=settings.APP_NAME,
    description="Authorized Digital Exposure Assessment Platform",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    """Attach a request ID to every request and log the request outcome."""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    try:
        response = await call_next(request)
        log_event(
            logger,
            logging.INFO,
            "request_completed",
            request_id=request_id,
            status_code=response.status_code,
            component="api",
        )
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception:
        log_event(
            logger,
            logging.ERROR,
            "request_failed",
            request_id=request_id,
            component="api",
        )
        raise


@app.get("/")
def root():
    return {"message": "Try Find Me! API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


app.include_router(audits_router, prefix="/api/v1")
app.include_router(ownership_router, prefix="/api/v1")
app.include_router(assessment_router, prefix="/api/v1")
app.include_router(sources_router, prefix="/api/v1")
