# Common module interface for OSINT discovery modules

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable

from app.schemas.assessment import Evidence


@dataclass
class ModuleContext:
    """Context provided to each OSINT module during an assessment."""

    clock: Callable[[], datetime] = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    http_client: Any = None
    dns_resolver: Any = None
    timeout_seconds: int = 10
    allowlisted_hosts: set[str] | None = None
    max_response_bytes: int = 1024 * 1024  # 1 MB


@dataclass
class ModuleResult:
    """Result returned by an OSINT module."""

    module_id: str
    status: str  # "ok", "partial", "failed", "skipped"
    evidence: list[Evidence] = field(default_factory=list)
    user_message: str = ""
    error: str | None = None


class BaseOSINTModule(ABC):
    """Abstract base class for all OSINT discovery modules.

    Each module must implement module_id and run(). Modules never raise
    exceptions to the caller: failures become failed/partial results with
    safe messages, and details go to logs without the assessed asset.
    """

    @property
    @abstractmethod
    def module_id(self) -> str:
        """Stable identifier for the module."""

    @abstractmethod
    async def run(self, asset: str, context: ModuleContext) -> ModuleResult:
        """Run the module against the given asset.

        Args:
            asset: The verified domain name.
            context: Module context with HTTP client, DNS resolver, timeouts.

        Returns:
            ModuleResult with status, evidence, and user message.
        """

    def _make_evidence(
        self,
        *,
        source_name: str,
        evidence_type: str,
        match_type: str,
        confidence: str,
        message: str,
        source_url: str | None = None,
        risk: str | None = None,
        risk_rule_id: str | None = None,
        recommendation: str | None = None,
        data: dict | None = None,
        ownership_verified: bool = False,
    ) -> Evidence:
        """Helper to create an Evidence entry."""
        from uuid import UUID

        return Evidence(
            id=str(UUID(int=0)),
            source_id=self.module_id,
            source_name=source_name,
            source_url=source_url,
            retrieved_at=self.context_clock().isoformat(),
            evidence_type=evidence_type,
            ownership_verified=ownership_verified,
            match_type=match_type,
            confidence=confidence,
            risk=risk,
            risk_rule_id=risk_rule_id,
            recommendation=recommendation,
            data=data or {},
            message=message,
        )

    def context_clock(self) -> datetime:
        """Get the current UTC time from the context clock."""
        return datetime.now(timezone.utc)
