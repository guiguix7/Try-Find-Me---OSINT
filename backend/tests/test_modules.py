# Tests for OSINT module response parsing (with mocks)

from unittest.mock import MagicMock

import pytest

from app.modules.base import ModuleContext
from app.modules.ct_subdomains import (
    CrtShSubdomainsModule,
    _normalize_domain,
    _valid_domain_label,
)
from app.modules.dns_records import DnsRecordsModule
from app.modules.rdap_registration import RdapRegistrationModule


class TestCrtShHelpers:
    @pytest.mark.parametrize("raw,expected", [
        ("*.example.com", "example.com"),
        (".example.com", "example.com"),
        ("sub.example.com", "sub.example.com"),
        ("EXAMPLE.COM", "example.com"),
        ("  sub.example.com  ", "sub.example.com"),
    ])
    def test_normalize_domain(self, raw, expected):
        assert _normalize_domain(raw) == expected

    @pytest.mark.parametrize("domain,valid", [
        ("example.com", True),
        ("sub.example.com", True),
        ("a-b.example.com", True),
        ("-invalid.com", False),
        ("invalid-.com", False),
        ("", False),
        ("nodots", False),
        ("a"*64 + ".com", False),
    ])
    def test_valid_domain_label(self, domain, valid):
        assert _valid_domain_label(domain) == valid


class TestCrtShModule:
    @pytest.mark.asyncio
    async def test_module_returns_no_results(self):
        module = CrtShSubdomainsModule()
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = []
        mock_client.get.return_value = mock_response

        context = ModuleContext(http_client=mock_client, timeout_seconds=10)
        result = await module.run("example.com", context)

        assert result.status == "ok"
        assert "No subdomains found" in result.user_message
        assert len(result.evidence) == 0

    @pytest.mark.asyncio
    async def test_module_service_unavailable(self):
        module = CrtShSubdomainsModule()
        import requests
        mock_client = MagicMock()
        mock_client.get.side_effect = requests.ConnectionError("connection refused")

        context = ModuleContext(http_client=mock_client, timeout_seconds=10)
        result = await module.run("example.com", context)

        assert result.status == "failed"
        assert "unavailable" in result.user_message.lower()


class TestDnsRecordsModule:
    @pytest.mark.asyncio
    async def test_module_no_records(self):
        module = DnsRecordsModule()
        mock_resolver = MagicMock()
        mock_resolver.resolve.side_effect = Exception("NoAnswer")

        context = ModuleContext(dns_resolver=mock_resolver, timeout_seconds=10)
        result = await module.run("example.com", context)

        assert result.status in ("ok", "partial")
        assert (
            "No DNS records" in result.user_message
            or "no records" in result.user_message.lower()
        )


class TestRdapModule:
    @pytest.mark.asyncio
    async def test_module_service_unavailable(self):
        module = RdapRegistrationModule()
        import requests
        mock_client = MagicMock()
        mock_client.get.side_effect = requests.ConnectionError("connection refused")

        context = ModuleContext(http_client=mock_client, timeout_seconds=10)
        result = await module.run("example.com", context)

        assert result.status == "failed"
        assert "unavailable" in result.user_message.lower()
