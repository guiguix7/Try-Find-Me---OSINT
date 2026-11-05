# DNS record discovery via public DNS resolution

from __future__ import annotations

import logging

import dns.exception
import dns.resolver

from app.modules.base import BaseOSINTModule, ModuleContext, ModuleResult
from app.services.security import validate_no_private_ips

logger = logging.getLogger("app.modules.dns_records")

# Record types supported for MVP
SUPPORTED_TYPES: list[str] = ["A", "AAAA", "MX", "TXT", "NS", "CNAME", "SOA"]

_DNS_TIMEOUT = 10


class DnsRecordsModule(BaseOSINTModule):
    """Passive DNS information retrieval for a verified domain.

    Queries public DNS for standard record types. Returns the raw records
    with source attribution and retrieval timestamps. Does not perform
    active scanning or zone transfers.
    """

    @property
    def module_id(self) -> str:
        return "dns_records"

    async def run(self, asset: str, context: ModuleContext) -> ModuleResult:
        evidence: list = []
        record_types_queried: list[str] = []
        errors: list[str] = []

        resolver = context.dns_resolver or dns.resolver.Resolver()
        if not context.dns_resolver:
            resolver.timeout = _DNS_TIMEOUT
            resolver.lifetime = _DNS_TIMEOUT

        for rtype in SUPPORTED_TYPES:
            record_types_queried.append(rtype)
            try:
                answers = resolver.resolve(asset, rtype, lifetime=_DNS_TIMEOUT)
                records = [str(r) for r in answers]
            except dns.resolver.NoAnswer:
                records = []
            except dns.resolver.NXDOMAIN:
                records = []
            except dns.resolver.NoNameservers:
                records = []
                errors.append(f"No nameservers responded for {rtype}")
            except dns.exception.Timeout:
                records = []
                errors.append(f"Timeout querying {rtype}")
            except Exception as exc:
                records = []
                errors.append(
                    f"Unexpected error querying {rtype}: {type(exc).__name__}"
                )
                logger.warning("dns_query_failed", extra={"record_type": rtype})

            if records:
                # For A/AAAA records, validate that resolved IPs are public
                if rtype in ("A", "AAAA"):
                    public_ips = validate_no_private_ips(records)
                    records = public_ips

                evidence.append(
                    self._make_evidence(
                        source_name="Public DNS",
                        evidence_type="dns_record",
                        match_type="exact",
                        confidence="high",
                        message=f"{rtype} record(s) found for {asset}.",
                        source_url=f"dns://{asset}/{rtype}",
                        risk="low",
                        recommendation=(
                            f"Review {rtype} records for {asset}. Ensure only "
                            f"intended services are exposed."
                        ),
                        data={
                            "domain": asset,
                            "record_type": rtype,
                            "records": records,
                        },
                        ownership_verified=True,
                    )
                )

        if not evidence and not errors:
            user_message = f"No DNS records found for {asset}."
            status = "ok"
        elif not evidence:
            user_message = "DNS queries returned no records."
            status = "ok"
        else:
            user_message = f"DNS records retrieved for {len(evidence)} record type(s)."
            status = "partial" if errors else "ok"

        return ModuleResult(
            module_id=self.module_id,
            status=status,
            evidence=evidence,
            user_message=user_message,
            error="; ".join(errors) if errors else None,
        )
