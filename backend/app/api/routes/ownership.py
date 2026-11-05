# Domain ownership verification API routes

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status

from app.core.logging import get_logger
from app.schemas.ownership import (
    DomainChallengeRequest,
    DomainChallengeResponse,
    DomainVerifyRequest,
    DomainVerifyResponse,
)
from app.services.ownership import create_challenge, verify_challenge
from app.services.security import challenge_limiter, check_rate_limit, verify_limiter

logger = get_logger("app.api.routes.ownership")

router = APIRouter(prefix="/ownership", tags=["Ownership Verification"])


def _client_key(request: Request) -> str:
    """Derive a client key for rate limiting from the request."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    client = request.client
    return client.host if client else "unknown"


@router.post(
    "/domain/challenge",
    response_model=DomainChallengeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_domain_challenge(
    request: Request, data: DomainChallengeRequest
) -> DomainChallengeResponse:
    """Issue a domain ownership challenge.

    The client must publish a DNS TXT record containing the signed
    verification token, then call /verify to prove ownership.
    """
    client_key = _client_key(request)
    allowed, retry_after = check_rate_limit(challenge_limiter, client_key)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many challenge requests. Try again later.",
            headers={"Retry-After": str(int(retry_after))},
        )

    try:
        return create_challenge(data.domain)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post(
    "/domain/verify",
    response_model=DomainVerifyResponse,
)
def verify_domain_ownership(
    request: Request, data: DomainVerifyRequest
) -> DomainVerifyResponse:
    """Verify domain ownership via DNS TXT record.

    Checks that the token is valid, not expired, not reused, and that
    the DNS TXT record contains the expected value.
    """
    client_key = _client_key(request)
    allowed, retry_after = check_rate_limit(verify_limiter, client_key)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification requests. Try again later.",
            headers={"Retry-After": str(int(retry_after))},
        )

    return verify_challenge(data.domain, data.token)
