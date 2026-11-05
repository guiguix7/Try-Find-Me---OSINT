# Security policy

## Reporting a vulnerability

Please report security issues privately (for example through GitHub's private vulnerability reporting once the repository is public) and do not open a public issue. **Maintainers must add a contact channel here before publishing the repository.**

Include: what you found, how to reproduce it, and the impact. We aim to acknowledge reports within 7 days.

## Scope highlights

- Ownership verification bypasses beyond the documented limits (`docs/ownership-verification.md`).
- Any path that makes the server connect to the assessed target or to resolved addresses.
- Leaks of assets, tokens or API keys into logs, errors or exports.
- Injection, SSRF, or unsafe handling of third-party responses.

## Secure-by-default rules for contributors

- No active scanning. No connections to hosts derived from user input. Outbound HTTP goes only to allowlisted hosts documented in `docs/sources.md`.
- Treat every third-party response as untrusted input: validate with schemas, cap size and time.
- Secrets (signing secret, API keys) come from the environment, are never committed, never logged and never placed in URLs.
- Logs and error messages never contain the assessed asset or personal data. Internal errors are logged without those details; users get a generic message and a request id.
- Dependencies are pinned and audited before each release. New dependencies require human approval.
- A feature is not done without tests and evidence of working behavior.