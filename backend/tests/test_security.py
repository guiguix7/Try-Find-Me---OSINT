# Tests for SSRF protection and IP allowlisting

import pytest

from app.services.security import (
    challenge_limiter,
    check_rate_limit,
    is_host_allowlisted,
    is_public_ip,
    validate_no_private_ips,
)


class TestPublicIP:
    @pytest.mark.parametrize("ip", [
        "127.0.0.1",
        "127.0.0.2",
        "10.0.0.1",
        "10.255.255.255",
        "172.16.0.1",
        "172.31.255.255",
        "192.168.0.1",
        "192.168.255.255",
        "169.254.0.1",
        "224.0.0.1",
        "240.0.0.1",
        "0.0.0.0",
        "255.255.255.255",
    ])
    def test_private_ips_are_not_public(self, ip):
        assert is_public_ip(ip) is False

    @pytest.mark.parametrize("ip", [
        "1.1.1.1",
        "8.8.8.8",
        "8.8.4.4",
        "208.67.222.222",
    ])
    def test_public_ips_are_public(self, ip):
        assert is_public_ip(ip) is True

    @pytest.mark.parametrize("ip", [
        "::1",
        "::",
        "fe80::1",
        "fc00::1",
        "ff00::1",
    ])
    def test_private_ipv6_are_not_public(self, ip):
        assert is_public_ip(ip) is False

    @pytest.mark.parametrize("ip", [
        "2001:4860:4860::8888",
        "2001:4860:4860::8844",
        "2606:4700:4700::1111",
    ])
    def test_public_ipv6_are_public(self, ip):
        assert is_public_ip(ip) is True

    def test_invalid_ip_is_not_public(self):
        assert is_public_ip("not.an.ip") is False
        assert is_public_ip("") is False


class TestValidateNoPrivateIPs:
    def test_filters_private_ips(self):
        result = validate_no_private_ips(["127.0.0.1", "1.1.1.1", "10.0.0.1"])
        assert result == ["1.1.1.1"]

    def test_empty_list(self):
        assert validate_no_private_ips([]) == []

    def test_all_public(self):
        result = validate_no_private_ips(["1.1.1.1", "8.8.8.8"])
        assert result == ["1.1.1.1", "8.8.8.8"]

    def test_all_private(self):
        assert validate_no_private_ips(["127.0.0.1", "10.0.0.1"]) == []


class TestHostAllowlisting:
    def test_allowlisted_hosts(self):
        assert is_host_allowlisted("crt.sh") is True
        assert is_host_allowlisted("rdap.arin.net") is True
        assert is_host_allowlisted("rdap.apnic.net") is True

    def test_non_allowlisted_hosts(self):
        assert is_host_allowlisted("evil.com") is False
        assert is_host_allowlisted("127.0.0.1") is False
        assert is_host_allowlisted("localhost") is False


class TestRateLimiting:
    def test_challenge_limiter_allows_initial_requests(self):
        allowed, retry = challenge_limiter.allow("test_client")
        assert allowed is True
        assert retry == 0.0

    def test_rate_limit_different_keys(self):
        allowed1, _ = challenge_limiter.allow("client_a")
        allowed2, _ = challenge_limiter.allow("client_b")
        assert allowed1 is True
        assert allowed2 is True

    def test_check_rate_limit_function(self):
        allowed, retry = check_rate_limit(challenge_limiter, "test")
        assert allowed is True
        assert isinstance(retry, float)
