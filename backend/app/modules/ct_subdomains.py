# Certificate Transparency subdomain discovery via crt.sh

from __future__ import annotations

import logging
import re

import requests

from app.modules.base import BaseOSINTModule, ModuleContext, ModuleResult
from app.services.security import validate_no_private_ips

logger = logging.getLogger("app.modules.ct_subdomains")

_CTSH_URL = "https://crt.sh/"
_CTSH_TIMEOUT = 10
_CTSH_MAX_RESULTS = 500


def _is_public_domain(domain: str) -> bool:
    """Basic check that domain resolves only to public IPs."""
    try:
        import dns.resolver

        answers = dns.resolver.resolve(domain, "A", lifetime=_CTSH_TIMEOUT)
        ips = [str(r) for r in answers]
    except Exception:
        try:
            import dns.resolver

            answers = dns.resolver.resolve(domain, "AAAA", lifetime=_CTSH_TIMEOUT)
            ips = [str(r) for r in answers]
        except Exception:
            return False
    public = validate_no_private_ips(ips)
    return len(public) > 0


def _normalize_domain(raw: str) -> str:
    """Normalize domain from crt.sh: lowercase, strip, remove wildcard prefix."""
    domain = raw.strip().lower()
    if domain.startswith("*."):
        domain = domain[2:]
    if domain.startswith("."):
        domain = domain[1:]
    return domain


def _valid_domain_label(domain: str) -> bool:
    """Check domain syntax matches DNS label rules."""
    if not domain or "." not in domain:
        return False
    labels = domain.split(".")
    label_re = re.compile(r"^(?!-)[a-z0-9-]{1,63}(?<!-)$")
    return all(label_re.match(label) for label in labels if label)


class CrtShSubdomainsModule(BaseOSINTModule):
    """Passive subdomain discovery via crt.sh certificate transparency logs.

    Never performs active probing. Only queries crt.sh. Results are
    certificate entries — a certificate entry does NOT prove a service
    is currently accessible.
    """

    @property
    def module_id(self) -> str:
        return "ct_subdomains"

    async def run(self, asset: str, context: ModuleContext) -> ModuleResult:
        evidence: list = []
        discovered: list[str] = []
        errors: list[str] = []

        try:
            response = context.http_client.get(
                _CTSH_URL,
                params={"q": f"%.{asset}", "output": "json"},
                timeout=context.timeout_seconds,
            )
        except requests.RequestException as exc:
            return ModuleResult(
                module_id=self.module_id,
                status="failed",
                user_message="Certificate transparency service unavailable.",
                error=str(exc),
            )

        if response.status_code != 200:
            return ModuleResult(
                module_id=self.module_id,
                status="failed",
                user_message="Certificate transparency service returned an error.",
                error=f"HTTP {response.status_code}",
            )

        try:
            entries = response.json()
        except ValueError:
            return ModuleResult(
                module_id=self.module_id,
                status="failed",
                user_message=(
                    "Certificate transparency service returned malformed data."
                ),
                error="JSON parse error",
            )

        if not entries:
            return ModuleResult(
                module_id=self.module_id,
                status="ok",
                user_message="No subdomains found in certificate transparency logs.",
                evidence=[],
            )

        seen: set[str] = set()
        for entry in entries[:_CTSH_MAX_RESULTS]:
            name_value = entry.get("name_value", "")
            for raw_domain in name_value.split("\n"):
                domain = _normalize_domain(raw_domain)
                if not domain or domain in seen:
                    continue
                seen.add(domain)
                if not _valid_domain_label(domain):
                    continue
                if not domain.endswith("." + asset) and domain != asset:
                    continue
                discovered.append(domain)

        if not discovered:
            return ModuleResult(
                module_id=self.module_id,
                status="ok",
                user_message=(
                    "No matching subdomains found in certificate transparency logs."
                ),
                evidence=[],
            )

        # Verify each discovered domain resolves to a public IP (optional,
        # best-effort; failure does not mark the result as failed)
        verified_public: list[str] = []
        for domain in discovered:
            try:
                if _is_public_domain(domain):
                    verified_public.append(domain)
            except Exception:
                pass

        for domain in discovered:
            evidence.append(
                self._make_evidence(
                    source_name="crt.sh",
                    evidence_type="subdomain_certificate_entry",
                    match_type="inferred",
                    confidence="medium",
                    message=(
                        f"Subdomain '{domain}' found in a certificate transparency "
                        f"log entry for {asset}. A certificate entry indicates a "
                        f"certificate was issued for this name; it does not prove "
                        f"the service is currently accessible."
                    ),
                    source_url=f"{_CTSH_URL}?q=%.{asset}&output=json",
                    risk="low",
                    recommendation=(
                        f"Review whether {domain} should be publicly exposed. "
                        f"If not, consider removing the DNS record or certificate."
                    ),
                    data={"domain": domain, "asset": asset},
                    ownership_verified=False,
                )
            )

        status = "ok" if verified_public else "partial"
        msg = (
            f"Found {len(discovered)} subdomain(s) in certificate transparency logs."
        )
        if verified_public:
            msg += f" {len(verified_public)} resolve to public IP(s)."
        else:
            msg += " None could be confirmed as publicly resolvable."

        return ModuleResult(
            module_id=self.module_id,
            status=status,
            evidence=evidence,
            user_message=msg,
            errors=errors if errors else None,
        )
