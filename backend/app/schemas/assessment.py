# Evidence and assessment schemas

from datetime import datetime, timezone
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

# --- Evidence contract ---

MatchType = Literal["exact", "partial", "inferred", "unverified_candidate"]
ConfidenceLevel = Literal["low", "medium", "high"]
RiskCategory = Literal["low", "medium", "high"]


class Evidence(BaseModel):
    id: str = Field(default_factory=lambda: str(UUID(int=0)))
    source_id: str
    source_name: str
    source_url: str | None = None
    retrieved_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    evidence_type: str
    ownership_verified: bool = False
    match_type: MatchType
    confidence: ConfidenceLevel
    risk: RiskCategory | None = None
    risk_rule_id: str | None = None
    recommendation: str | None = None
    data: dict = Field(default_factory=dict)
    message: str

    @model_validator(mode="after")
    def _risk_requires_recommendation(self) -> "Evidence":
        if self.risk in ("medium", "high") and not self.recommendation:
            raise ValueError("medium/high risk findings require a recommendation")
        return self


class ModuleStatus(BaseModel):
    module_id: str
    status: Literal["running", "ok", "partial", "failed", "skipped"]
    message: str
    evidence_count: int = 0


class RiskCounts(BaseModel):
    low: int = 0
    medium: int = 0
    high: int = 0
    info: int = 0


class Report(BaseModel):
    asset: str
    generated_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    ownership_method: str
    ownership_expires_at: str | None = None
    module_status: list[ModuleStatus] = Field(default_factory=list)
    evidence: list[Evidence] = Field(default_factory=list)
    risk_counts: RiskCounts = Field(default_factory=RiskCounts)
    limitations: list[str] = Field(default_factory=list)
    sources_consulted: list[dict] = Field(default_factory=list)


# --- Source info ---

class SourceInfo(BaseModel):
    module_id: str
    source_name: str
    source_url: str | None = None
    data_sent: str
    purpose: str
    reliability: Literal["low", "medium", "high"]
    auth_required: bool = False


# --- Error response ---

class ErrorResponse(BaseModel):
    error: str
    message: str
    request_id: str | None = None


# --- Assessment request ---

class AssessmentRequest(BaseModel):
    domain: str
    proof_id: UUID
