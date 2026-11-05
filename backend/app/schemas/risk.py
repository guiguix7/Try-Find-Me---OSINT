# Risk classification schemas

from typing import Literal

from pydantic import BaseModel

RiskCategory = Literal["low", "medium", "high"]


class RiskRule(BaseModel):
    rule_id: str
    condition: str
    risk: RiskCategory
    recommendation: str
    match_type: Literal["exact", "partial", "inferred", "unverified_candidate"]
    confidence: Literal["low", "medium", "high"]


class RiskClassification(BaseModel):
    rule_id: str
    risk: RiskCategory
    recommendation: str
    match_type: Literal["exact", "partial", "inferred", "unverified_candidate"]
    confidence: Literal["low", "medium", "high"]
    explanation: str
