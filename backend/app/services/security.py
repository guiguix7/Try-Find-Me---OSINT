# Security: SSRF protection, IP allowlisting, rate limiting

from __future__ import annotations

import ipaddress
import logging
import time
from collections import defaultdict

from app.core.config import settings
from app.core.logging import get_logger, log_event

logger = get_logger("app.security")


# --- IP allowlisting ---

# Private/reserved IP ranges that must never be contacted
# Covers IPv4 (RFC 1918, loopback, link-local, multicast, etc.)
# and IPv6 (unique local, loopback, link-local, multicast, etc.)
PRIVATE_IP_NETWORKS: list[ipaddress.IPv4Network | ipaddress.IPv6Network] = [
    # IPv4
    ipaddress.ip_network("0.0.0.0/8"),      # "This" network
    ipaddress.ip_network("10.0.0.0/8"),     # RFC 1918 private
    ipaddress.ip_network("100.64.0.0/10"),  # RFC 6598 CGN
    ipaddress.ip_network("127.0.0.0/8"),    # Loopback
    ipaddress.ip_network("169.254.0.0/16"), # RFC 3927 link-local
    ipaddress.ip_network("172.16.0.0/12"),  # RFC 1918 private
    ipaddress.ip_network("192.0.0.0/24"),   # IETF protocol assignments
    ipaddress.ip_network("192.0.2.0/24"),   # RFC 5737 TEST-NET-1
    ipaddress.ip_network("192.88.99.0/24"), # RFC 3068 6to4 relay
    ipaddress.ip_network("192.168.0.0/16"), # RFC 1918 private
    ipaddress.ip_network("198.18.0.0/15"),  # RFC 2544 benchmarking
    ipaddress.ip_network("198.51.100.0/24"),# RFC 5737 TEST-NET-2
    ipaddress.ip_network("203.0.113.0/24"), # RFC 5737 TEST-NET-3
    ipaddress.ip_network("224.0.0.0/4"),    # Multicast
    ipaddress.ip_network("240.0.0.0/4"),    # Reserved
    ipaddress.ip_network("255.255.255.255/32"), # Limited broadcast
    # IPv6
    ipaddress.ip_network("::1/128"),        # Loopback
    ipaddress.ip_network("::/128"),         # Unspecified
    ipaddress.ip_network("::ffff:0:0/96"),  # IPv4-mapped
    ipaddress.ip_network("64:ff9b::/96"),   # IPv4-IPv6 translation
    ipaddress.ip_network("100::/64"),       # Discard
    ipaddress.ip_network("2001::/32"),      # TEREDO
    ipaddress.ip_network("2001:2::/48"),    # Benchmarking
    ipaddress.ip_network("2001:db8::/32"),  # Documentation
    ipaddress.ip_network("2002::/16"),      # 6to4
    ipaddress.ip_network("fc00::/7"),       # Unique local (private)
    ipaddress.ip_network("fe80::/10"),      # Link-local
    ipaddress.ip_network("ff00::/8"),       # Multicast
]


def is_public_ip(ip_str: str) -> bool:
    """Return True if the IP address is a public (non-private) address."""
    try:
        ip = ipaddress.ip_address(ip_str)
    except ValueError:
        return False
    for net in PRIVATE_IP_NETWORKS:
        if ip in net:
            return False
    return True


def validate_no_private_ips(ip_addresses: list[str]) -> list[str]:
    """Filter out non-public IPs. Returns only public IPs."""
    public = []
    for ip_str in ip_addresses:
        if is_public_ip(ip_str):
            public.append(ip_str)
        else:
            log_event(
                logger,
                logging.WARNING,
                "private_ip_rejected",
                component="security",
            )
    return public




# --- Allowlisted outbound hosts ---

# Hosts that the backend is allowed to contact for OSINT lookups.
# User-supplied domains are NEVER used for outbound HTTP; only these
# approved public services may be contacted.
ALLOWLISTED_HOSTS: set[str] = {
    "crt.sh",
    "rdap.verisign-grs.com",
    "rdap.arin.net",
    "rdap.apnic.net",
}


def is_host_allowlisted(host: str) -> bool:
    """Return True if the host is in the allowlist."""
    return host in ALLOWLISTED_HOSTS


# --- Rate limiting ---

# In-memory token bucket per client key
# {client_key: {"tokens": float, "last_update": float}}
_rate_limit_state: dict[str, dict] = defaultdict(
    lambda: {"tokens": 0.0, "last_update": 0.0}
)

class RateLimiter:
    """Token-bucket rate limiter per client key.

    Starts each client with a full bucket (max_rate tokens) so the first
    request is always allowed. Tokens refill at refill_rate tokens/second.
    """

    def __init__(self, max_rate: int, per_seconds: float = 60.0):
        self.max_rate = max_rate
        self.per_seconds = per_seconds
        self.refill_rate = max_rate / per_seconds  # tokens per second

    def allow(self, client_key: str) -> tuple[bool, float]:
        """Return (allowed, retry_after_seconds)."""
        now = time.time()
        state = _rate_limit_state[client_key]

        # Initialize on first use with a full bucket
        if state["last_update"] == 0.0:
            state["tokens"] = float(self.max_rate)
            state["last_update"] = now

        # Refill tokens based on elapsed time
        elapsed = now - state["last_update"]
        state["tokens"] = min(
            self.max_rate,
            state["tokens"] + elapsed * self.refill_rate,
        )
        state["last_update"] = now

        if state["tokens"] >= 1.0:
            state["tokens"] -= 1.0
            return True, 0.0

        # Calculate retry after
        needed = 1.0 - state["tokens"]
        retry_after = needed / self.refill_rate
        return False, retry_after


# Pre-configured rate limiters
challenge_limiter = RateLimiter(settings.RATE_LIMIT_CHALLENGE)
verify_limiter = RateLimiter(settings.RATE_LIMIT_VERIFY)
assessment_limiter = RateLimiter(settings.RATE_LIMIT_ASSESSMENT)


def check_rate_limit(
    limiter: RateLimiter, client_key: str
) -> tuple[bool, float]:
    """Check if a request is allowed under the rate limit."""
    allowed, retry_after = limiter.allow(client_key)
    if not allowed:
        log_event(
            logger,
            logging.WARNING,
            "rate_limit_exceeded",
            component="security",
        )
    return allowed, retry_after


# --- Request size ---

MAX_REQUEST_BODY_BYTES = settings.MAX_REQUEST_BODY_BYTES


def check_request_size(body_bytes: int) -> bool:
    """Return True if the request body is within the allowed size."""
    return body_bytes <= MAX_REQUEST_BODY_BYTES
