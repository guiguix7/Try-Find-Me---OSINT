# Available data sources endpoint

from __future__ import annotations

from fastapi import APIRouter

from app.schemas.assessment import SourceInfo

router = APIRouter(prefix="/sources", tags=["Sources"])


@router.get("", response_model=list[SourceInfo])
def list_sources():
    """Return the list of external data sources the platform may query.

    Provides transparency about which services receive domain information,
    what is sent, why, and what may be returned.
    """
    return [
        SourceInfo(
            module_id="ct_subdomains",
            source_name="crt.sh",
            source_url="https://crt.sh/",
            data_sent="domain name (for certificate transparency search)",
            purpose=(
                "Passive subdomain discovery through certificate transparency logs."
            ),
            reliability="medium",
            auth_required=False,
        ),
        SourceInfo(
            module_id="dns_records",
            source_name="Public DNS",
            source_url="dns://public-resolvers",
            data_sent="domain name (for DNS record queries)",
            purpose="Retrieve public DNS records (A, AAAA, MX, TXT, NS, CNAME, SOA).",
            reliability="high",
            auth_required=False,
        ),
        SourceInfo(
            module_id="rdap_registration",
            source_name="RDAP",
            source_url="https://rdap.org/",
            data_sent="domain name (for registration lookup)",
            purpose="Retrieve public domain registration information.",
            reliability="medium",
            auth_required=False,
        ),
    ]
