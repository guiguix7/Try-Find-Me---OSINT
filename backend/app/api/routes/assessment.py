# Assessment API routes

from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, HTTPException, Request, status

from app.core.logging import get_logger, log_event
from app.modules.ct_subdomains import CrtShSubdomainsModule
from app.modules.dns_records import DnsRecordsModule
from app.modules.rdap_registration import RdapRegistrationModule
from app.schemas.assessment import (
    AssessmentRequest,
    ModuleStatus,
    Report,
    RiskCounts,
)
from app.schemas.risk import RiskClassification
from app.services.ownership import get_proof
from app.services.security import assessment_limiter, check_rate_limit

logger = get_logger("app.api.routes.assessment")

router = APIRouter(prefix="/assessments", tags=["Assessments"])

# Registered discovery modules (order matters for deterministic output)
MODULES: list = [
    CrtShSubdomainsModule(),
    DnsRecordsModule(),
    RdapRegistrationModule(),
]


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    client = request.client
    return client.host if client else "unknown"


def _classify_risk(evidence_list) -> list[RiskClassification]:
    """Apply deterministic risk rules to evidence.

    Rules are documented and explainable. No arbitrary scoring.
    """
    classifications: list[RiskClassification] = []
    for ev in evidence_list:
        rule_id = "default"
        risk = "low"
        recommendation = ev.recommendation or "Review exposed information."
        confidence = ev.confidence
        match_type = ev.match_type
        explanation = "Default low-risk classification for public information."

        if ev.risk in ("medium", "high"):
            risk = ev.risk
            rule_id = "source_assigned"
            explanation = f"Risk assigned by source module: {ev.message}"
        elif ev.match_type == "unverified_candidate":
            risk = "low"
            rule_id = "unverified_candidate"
            explanation = (
                "Unverified candidate — no independent mechanism proves control. "
                "Treated as low risk until verified."
            )
            recommendation = (
                "Do not treat this as confirmed ownership without additional proof."
            )
        elif ev.confidence == "low":
            risk = "low"
            rule_id = "low_confidence"
            explanation = "Low confidence evidence — treat with caution."

        classifications.append(
            RiskClassification(
                rule_id=rule_id,
                risk=risk,
                recommendation=recommendation,
                match_type=match_type,
                confidence=confidence,
                explanation=explanation,
            )
        )
    return classifications


@router.post("", response_model=Report, status_code=status.HTTP_201_CREATED)
def run_assessment(request: Request, data: AssessmentRequest) -> Report:
    """Run a passive domain assessment.

    Requires a valid proof_id from a successful domain ownership verification.
    Runs all discovery modules and returns a DEIP-structured report.
    """
    client_key = _client_key(request)
    allowed, retry_after = check_rate_limit(assessment_limiter, client_key)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many assessment requests. Try again later.",
            headers={"Retry-After": str(int(retry_after))},
        )

    proof = get_proof(data.proof_id)
    if proof is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ownership proof not found.",
        )
    if not proof.verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Domain ownership not verified.",
        )

    domain = proof.domain

    # Run all modules sequentially (passive, no concurrent external requests)
    module_statuses = []
    all_evidence = []
    limitations = []
    sources_consulted = []

    for module in MODULES:
        try:
            result = asyncio.run(module.run(domain, _module_context()))
        except Exception:
            log_event(
                logger,
                logging.ERROR,
                "module_execution_failed",
                component=module.module_id,
            )
            module_statuses.append(
                ModuleStatus(
                    module_id=module.module_id,
                    status="failed",
                    message="Module execution failed.",
                    evidence_count=0,
                )
            )
            limitations.append(f"{module.module_id}: execution error.")
            continue

        module_statuses.append(
            ModuleStatus(
                module_id=result.module_id,
                status=result.status,
                message=result.user_message,
                evidence_count=len(result.evidence),
            )
        )
        all_evidence.extend(result.evidence)

        sources_consulted.append(
            {
                "module_id": result.module_id,
                "source_name": result.user_message[:80],
                "status": result.status,
            }
        )

        if result.status in ("failed", "skipped"):
            limitations.append(f"{module.module_id}: {result.user_message}")

    # Count risks
    risk_counts = RiskCounts()
    for ev in all_evidence:
        if ev.risk == "low":
            risk_counts.low += 1
        elif ev.risk == "medium":
            risk_counts.medium += 1
        elif ev.risk == "high":
            risk_counts.high += 1
        else:
            risk_counts.info += 1

    return Report(
        asset=domain,
        ownership_method="dns_txt",
        ownership_expires_at=proof.expires_at,
        module_status=module_statuses,
        evidence=all_evidence,
        risk_counts=risk_counts,
        limitations=limitations,
        sources_consulted=sources_consulted,
    )


def _module_context():
    import httpx

    from app.modules.base import ModuleContext

    return ModuleContext(
        http_client=httpx.Client(timeout=10),
        timeout_seconds=10,
    )
