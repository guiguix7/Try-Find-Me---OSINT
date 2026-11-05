# Domain ownership verification service

from __future__ import annotations

import base64
import hashlib
import hmac
import logging
import os
from uuid import UUID, uuid4

from app.core.config import settings
from app.core.logging import get_logger, log_event
from app.schemas.ownership import (
    DomainChallengeResponse,
    DomainVerifyResponse,
    OwnershipProof,
)

logger = get_logger("app.services.ownership")

# In-memory store of ownership proofs (not persistent)
# {proof_id: OwnershipProof}
_proofs: dict[str, OwnershipProof] = {}

# Used tokens for replay protection
_used_tokens: set[str] = set()


def _server_secret() -> bytes:
    """Return the server secret as bytes for HMAC signing."""
    return settings.SERVER_SECRET.encode("utf-8")


def generate_token(domain: str) -> str:
    """Generate a cryptographically secure verification token for a domain.

    The token is a random value that will be signed with HMAC when creating
    the challenge response. The token itself is not stored persistently.
    """
    random_bytes = os.urandom(32)
    return base64.urlsafe_b64encode(random_bytes).rstrip(b"=").decode("ascii")


def sign_token(token: str, domain: str) -> str:
    """Create an HMAC signature for the token+domain pair."""
    message = f"{domain}:{token}".encode("utf-8")
    signature = hmac.new(_server_secret(), message, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(signature).rstrip(b"=").decode("ascii")


def verify_token_signature(token: str, domain: str, signature: str) -> bool:
    """Verify an HMAC signature for a token+domain pair."""
    expected = sign_token(token, domain)
    return hmac.compare_digest(expected, signature)


def create_challenge(domain: str) -> DomainChallengeResponse:
    """Create a domain ownership challenge with a signed verification token.

    The token is signed with HMAC using the server secret. The signed token
    is embedded in the DNS TXT record value the user must publish.
    """
    import time as _time

    token = generate_token(domain)
    signature = sign_token(token, domain)
    proof_id = uuid4()

    # Token value published in DNS TXT: token.signature
    txt_value = f"{token}.{signature}"

    ttl = settings.CHALLENGE_TTL_SECONDS
    expires_at = _time.time() + ttl
    expires_iso = _time.strftime(
        "%Y-%m-%dT%H:%M:%SZ", _time.gmtime(expires_at)
    )

    proof = OwnershipProof(
        domain=domain,
        token=token,
        proof_id=proof_id,
        created_at=_time.strftime(
            "%Y-%m-%dT%H:%M:%SZ", _time.gmtime(_time.time())
        ),
        expires_at=_time.strftime(
            "%Y-%m-%dT%H:%M:%SZ", _time.gmtime(expires_at)
        ),
        verified=False,
    )
    _proofs[str(proof_id)] = proof

    log_event(
        logger,
        logging.INFO,
        "challenge_created",
        component="ownership",
    )

    return DomainChallengeResponse(
        domain=domain,
        token=token,
        txt_record_name=f"_tryfindme-verification.{domain}",
        txt_record_value=txt_value,
        expires_at=expires_iso,
        ttl_seconds=ttl,
    )


def verify_challenge(
    domain: str, token: str, client_ip: str = "unknown"
) -> DomainVerifyResponse:
    """Verify a domain ownership challenge.

    Checks:
    - Token exists and is not expired
    - Token signature is valid
    - Token has not been used before (replay protection)
    - DNS TXT record contains the expected value
    """
    import time as _time

    now = _time.time()

    # Find matching proof
    matching_proof: OwnershipProof | None = None
    for proof in _proofs.values():
        if proof.domain == domain and proof.token == token:
            matching_proof = proof
            break

    if matching_proof is None:
        log_event(
            logger,
            logging.WARNING,
            "verification_failed_token_not_found",
            component="ownership",
        )
        return DomainVerifyResponse(
            domain=domain,
            verified=False,
            message="Invalid or expired verification token.",
        )

    # Check expiration
    expires_at = matching_proof.expires_at
    if isinstance(expires_at, str):
        expires_epoch = _time.mktime(
            _time.strptime(expires_at, "%Y-%m-%dT%H:%M:%SZ")
        )
    else:
        # Already a datetime (Pydantic v2 parsed it)
        expires_epoch = expires_at.timestamp()
    if now > expires_epoch:
        log_event(
            logger,
            logging.WARNING,
            "verification_failed_expired",
            component="ownership",
        )
        return DomainVerifyResponse(
            domain=domain,
            verified=False,
            message="Verification token has expired.",
        )

    # Replay protection
    if token in _used_tokens:
        log_event(
            logger,
            logging.WARNING,
            "verification_failed_replay",
            component="ownership",
        )
        return DomainVerifyResponse(
            domain=domain,
            verified=False,
            message="Verification token has already been used.",
        )

    # Verify DNS TXT record
    txt_value_expected = f"{token}.{sign_token(token, domain)}"
    try:
        import dns.resolver

        resolver = dns.resolver.Resolver()
        resolver.timeout = 10
        resolver.lifetime = 10
        answers = resolver.resolve(
            f"_tryfindme-verification.{domain}", "TXT", lifetime=10
        )
        published_values = []
        for rdata in answers:
            for txt_string in rdata.strings:
                published_values.append(
                    txt_string.decode("utf-8")
                    if isinstance(txt_string, bytes)
                    else txt_string
                )
    except Exception:
        log_event(
            logger,
            logging.WARNING,
            "verification_failed_dns_lookup",
            component="ownership",
        )
        return DomainVerifyResponse(
            domain=domain,
            verified=False,
            message="DNS TXT verification failed. Ensure the TXT record is published.",
        )

    if txt_value_expected not in published_values:
        log_event(
            logger,
            logging.WARNING,
            "verification_failed_txt_mismatch",
            component="ownership",
        )
        return DomainVerifyResponse(
            domain=domain,
            verified=False,
            message="DNS TXT record does not match the expected verification value.",
        )

    # Mark token as used and proof as verified
    _used_tokens.add(token)
    matching_proof.verified = True

    log_event(
        logger,
        logging.INFO,
        "verification_success",
        component="ownership",
    )

    return DomainVerifyResponse(
        domain=domain,
        verified=True,
        proof_id=matching_proof.proof_id,
        expires_at=matching_proof.expires_at,
        message="Domain ownership verified successfully.",
    )


def get_proof(proof_id: UUID) -> OwnershipProof | None:
    """Retrieve an ownership proof by ID."""
    return _proofs.get(str(proof_id))
