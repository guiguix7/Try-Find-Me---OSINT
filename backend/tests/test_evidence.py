# Tests for evidence schema validation and risk classification

import pytest

from app.schemas.assessment import (
    Evidence,
    ModuleStatus,
    Report,
    RiskCounts,
)
from app.schemas.risk import RiskClassification


class TestEvidenceSchema:
    def test_evidence_creation_minimal(self):
        ev = Evidence(
            source_id="test_source",
            source_name="Test Source",
            evidence_type="dns_record",
            match_type="exact",
            confidence="high",
            message="Test message",
        )
        assert ev.source_id == "test_source"
        assert ev.source_name == "Test Source"
        assert ev.evidence_type == "dns_record"
        assert ev.match_type == "exact"
        assert ev.confidence == "high"
        assert ev.message == "Test message"
        assert ev.ownership_verified is False
        assert ev.risk is None

    def test_evidence_match_type_valid_values(self):
        for mt in ["exact", "partial", "inferred", "unverified_candidate"]:
            ev = Evidence(
                source_id="s",
                source_name="n",
                evidence_type="t",
                match_type=mt,
                confidence="low",
                message="m",
            )
            assert ev.match_type == mt

    def test_evidence_confidence_valid_values(self):
        for conf in ["low", "medium", "high"]:
            ev = Evidence(
                source_id="s",
                source_name="n",
                evidence_type="t",
                match_type="exact",
                confidence=conf,
                message="m",
            )
            assert ev.confidence == conf

    def test_evidence_risk_requires_recommendation(self):
        with pytest.raises(ValueError):
            Evidence(
                source_id="s",
                source_name="n",
                evidence_type="t",
                match_type="exact",
                confidence="high",
                risk="high",
                message="m",
                # no recommendation
            )

    def test_evidence_risk_medium_requires_recommendation(self):
        with pytest.raises(ValueError):
            Evidence(
                source_id="s",
                source_name="n",
                evidence_type="t",
                match_type="exact",
                confidence="medium",
                risk="medium",
                message="m",
            )

    def test_evidence_low_risk_no_recommendation_ok(self):
        ev = Evidence(
            source_id="s",
            source_name="n",
            evidence_type="t",
            match_type="exact",
            confidence="low",
            risk="low",
            message="m",
        )
        assert ev.risk == "low"
        assert ev.recommendation is None


class TestModuleStatus:
    def test_module_status_creation(self):
        status = ModuleStatus(
            module_id="test_module",
            status="ok",
            message="All good",
            evidence_count=3,
        )
        assert status.module_id == "test_module"
        assert status.status == "ok"
        assert status.evidence_count == 3

    @pytest.mark.parametrize(
        "status_val", ["running", "ok", "partial", "failed", "skipped"]
    )
    def test_module_status_valid_values(self, status_val):
        status = ModuleStatus(
            module_id="m",
            status=status_val,
            message="msg",
        )
        assert status.status == status_val


class TestRiskCounts:
    def test_risk_counts_default(self):
        rc = RiskCounts()
        assert rc.low == 0
        assert rc.medium == 0
        assert rc.high == 0
        assert rc.info == 0

    def test_risk_counts_values(self):
        rc = RiskCounts(low=5, medium=2, high=1, info=0)
        assert rc.low == 5
        assert rc.medium == 2
        assert rc.high == 1


class TestReport:
    def test_report_creation(self):
        report = Report(
            asset="example.com",
            ownership_method="dns_txt",
        )
        assert report.asset == "example.com"
        assert report.ownership_method == "dns_txt"
        assert report.generated_at is not None
        assert len(report.evidence) == 0
        assert len(report.module_status) == 0


class TestRiskClassification:
    def test_risk_classification_creation(self):
        rc = RiskClassification(
            rule_id="rule_1",
            risk="medium",
            recommendation="Review DNS config.",
            match_type="exact",
            confidence="medium",
            explanation="Public DNS records expose infrastructure.",
        )
        assert rc.rule_id == "rule_1"
        assert rc.risk == "medium"
        assert rc.recommendation == "Review DNS config."
        assert rc.explanation is not None

    @pytest.mark.parametrize("risk", ["low", "medium", "high"])
    def test_risk_category_values(self, risk):
        rc = RiskClassification(
            rule_id="r",
            risk=risk,
            recommendation="rec",
            match_type="exact",
            confidence="low",
            explanation="exp",
        )
        assert rc.risk == risk
