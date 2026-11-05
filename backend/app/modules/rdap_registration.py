# RDAP registration information via public RDAP services

from __future__ import annotations

import logging

import requests

from app.modules.base import BaseOSINTModule, ModuleContext, ModuleResult
from app.services.security import is_host_allowlisted

logger = logging.getLogger("app.modules.rdap_registration")

_RDAP_TIMEOUT = 10

# Public RDAP bootstrap servers (allowlisted)
_RDAP_BOOTSTRAP_SERVERS: list[str] = [
    "https://rdap.verisign-grs.com",
    "https://rdap.arin.net",
    "https://rdap.apnic.net",
]


def _extract_rdap_fields(data: dict) -> dict:
    """Extract relevant non-sensitive fields from an RDAP response.

    Avoids exposing unnecessary personal registration information.
    """
    result: dict = {}

    # Entity roles we care about (registrant, admin, tech)
    entities = data.get("entities", [])
    for entity in entities:
        roles = entity.get("roles", [])
        vcard = entity.get("vcardArray", [])
        if len(vcard) < 2:
            continue
        props = vcard[1]
        entity_info = {"roles": roles}
        for prop in props:
            if len(prop) < 3:
                continue
            name = prop[0]
            value = prop[3] if len(prop) > 3 else None
            if name == "fn":
                entity_info["name"] = value
            elif name == "org":
                entity_info["organization"] = value
        result.setdefault("entities", []).append(entity_info)

    # Registration dates
    for key in ["registrationDate", "expirationDate", "lastChangedDate"]:
        if key in data:
            result[key] = data[key]

    # Nameservers (non-personal)
    ns = data.get("nameservers", [])
    result["nameservers"] = [n.get("ldhName", "") for n in ns if n.get("ldhName")]

    # Status
    result["status"] = data.get("status", [])

    return result


class RdapRegistrationModule(BaseOSINTModule):
    """Passive RDAP registration lookup for a verified domain.

    Queries public RDAP services for registration information. Handles
    missing information, rate limits, and unavailable registries gracefully.
    Avoids exposing unnecessary personal registration information.
    """

    @property
    def module_id(self) -> str:
        return "rdap_registration"

    async def run(self, asset: str, context: ModuleContext) -> ModuleResult:
        evidence: list = []
        errors: list[str] = []
        queried_servers: list[str] = []

        rdap_url = None
        for server in _RDAP_BOOTSTRAP_SERVERS:
            if not is_host_allowlisted(server.replace("https://", "")):
                continue
            try:
                # Try the RDAP endpoint for the domain
                url = f"{server}/domain/{asset}"
                response = context.http_client.get(
                    url,
                    timeout=_RDAP_TIMEOUT,
                    headers={"Accept": "application/rdap+json"},
                )
                queried_servers.append(server)
                if response.status_code == 200:
                    rdap_url = url
                    break
                elif response.status_code == 429:
                    errors.append("RDAP service rate-limited the request.")
                    continue
                elif response.status_code == 404:
                    errors.append("Domain not found in RDAP registry.")
                    continue
                else:
                    errors.append(f"RDAP query returned HTTP {response.status_code}.")
                    continue
            except requests.RequestException as exc:
                errors.append(f"RDAP query failed: {type(exc).__name__}.")
                continue

        if rdap_url is None:
            return ModuleResult(
                module_id=self.module_id,
                status="failed",
                user_message="RDAP registration information unavailable.",
                error="; ".join(errors) if errors else "No RDAP service responded.",
            )

        try:
            data = response.json()
        except ValueError:
            return ModuleResult(
                module_id=self.module_id,
                status="failed",
                user_message="RDAP service returned malformed data.",
                error="JSON parse error",
            )

        extracted = _extract_rdap_fields(data)

        if not extracted:
            return ModuleResult(
                module_id=self.module_id,
                status="ok",
                user_message="No registration information available in RDAP.",
                evidence=[],
            )

        evidence.append(
            self._make_evidence(
                source_name="RDAP",
                evidence_type="registration_info",
                match_type="exact",
                confidence="medium",
                message=(
                    f"Registration information retrieved for {asset} from RDAP. "
                    f"Personal registrant details are intentionally limited."
                ),
                source_url=rdap_url,
                risk="low",
                recommendation=(
                    "Review domain registration information. Consider using "
                    "privacy protection services offered by your registrar."
                ),
                data=extracted,
                ownership_verified=True,
            )
        )

        return ModuleResult(
            module_id=self.module_id,
            status="ok",
            evidence=evidence,
            user_message=f"RDAP registration information retrieved for {asset}.",
        )
