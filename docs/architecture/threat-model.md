# Threat Model — Try Find Me! — OSINT

## Scope

This threat model covers the Phase 1 MVP: domain ownership verification, passive subdomain discovery, DNS records, RDAP registration, and the DEIP report.

## Assets to Protect

1. **User-assessed domains** — domains entered by the user for assessment.
2. **Verification tokens** — HMAC-signed tokens used for DNS TXT ownership proof.
3. **Server secret** — HMAC signing key from environment variables.
4. **Investigation results and evidence** — findings retrieved from public sources.
5. **User trust** — the platform must not be usable for doxxing or unauthorized surveillance.

## Threat Actors

1. **Malicious user** — attempts to assess domains they do not own, bypass verification, or probe internal infrastructure.
2. **External attacker** — attempts SSRF, DNS rebinding, or injection through user-supplied input.
3. **Public source operator** — may log requests, return malformed responses, or rate-limit the application.
4. **Insider / local user** — has access to the machine running the application.

## Threats and Mitigations

| Threat | Asset | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| SSRF via user-supplied domain | Backend, internal network | High | Critical | Validate domain syntax, resolve DNS, reject private/loopback/link-local/multicast IPs (IPv4+IPv6), allowlist outbound hosts, strict timeouts, response size limits |
| DNS rebinding | Backend | Medium | High | Resolve and validate IP at request time; do not cache resolution across validation and connection |
| Malicious external response | Evidence integrity | Medium | Medium | Validate all third-party responses with schemas, cap response size, treat as untrusted input |
| Verification token bypass | Ownership integrity | Medium | High | HMAC-signed tokens with expiration, server secret from env, no token storage in database |
| Token replay | Ownership integrity | Low | Medium | Token expiration (15 min challenge TTL, 30 min proof TTL) |
| Excessive requests / DoS | Backend availability | High | Medium | Rate limiting per client (challenge 10/min, verify 10/min, assessments 3/min) |
| Sensitive data in logs | Privacy | Medium | High | Structured logging that never logs domains, tokens, passwords, or personal data; generic user-facing errors |
| Secret exposure | Server secret | Low | Critical | SERVER_SECRET from environment only, no default value, never logged, never in URLs |
| Dependency vulnerability | Supply chain | Medium | Medium | Pinned dependencies, audited before release, new dependencies require approval |
| Cross-origin request risks | Browser data | Low | Medium | CORS restricted to frontend origins only, credentials disabled |
| Browser-side data leakage | Privacy | Low | Medium | No investigation data in localStorage/IndexedDB/cookies; optional visual preferences only |
| Misleading or false evidence | Trust | Medium | Medium | Evidence contract with source, retrieval time, match type, confidence; no fabricated findings |
| Unauthorized domain assessment | Ownership integrity | High | Critical | DNS TXT proof required before any Discovery module runs; authorization checkbox required |
| IPv6 edge cases | SSRF protection | Medium | High | Private IP rejection covers both IPv4 and IPv6 ranges |

## Assumptions

1. The server runs in a trusted local environment (Docker Compose on the user's machine).
2. Public DNS and RDAP services are available and return accurate data.
3. The user's DNS resolver does not return private IPs for public domains.
4. The server secret is not compromised.

## Limitations

1. Ownership verification is a friction and consent mechanism, not a cryptographic guarantee. Open-source code can be modified by anyone running it.
2. DNS propagation delays may cause temporary verification failures.
3. Public sources may be unavailable, rate-limited, or return stale data.
4. The platform cannot prevent a determined user from modifying the source to bypass verification.

## Security Requirements (Implementation Checklist)

- [ ] Domain syntax validation on all user-supplied input
- [ ] DNS resolution with private IP rejection (IPv4 + IPv6)
- [ ] Outbound HTTP restricted to allowlisted hosts (crt.sh, RDAP bootstrap servers)
- [ ] Strict timeouts on all external requests (per-module 10s, whole assessment 30s)
- [ ] Response size limits on external responses
- [ ] No following of arbitrary redirects
- [ ] HMAC-SHA256 token signing with server secret from environment
- [ ] Token expiration (15 min challenge, 30 min proof)
- [ ] Rate limiting per client on all mutation endpoints
- [ ] Structured logging with no sensitive data
- [ ] Generic user-facing error messages (no stack traces, secrets, or internal paths)
- [ ] No database persistence of investigation data
- [ ] No accounts, authentication cookies, or user tracking
