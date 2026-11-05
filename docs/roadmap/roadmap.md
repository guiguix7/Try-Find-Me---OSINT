# Roadmap — Try Find Me! — OSINT

## Phase 0 — Foundation

- Threat model
- Privacy documentation
- AGPL-3.0 license
- Project architecture
- Folder structure
- Docker Compose
- Safe logging
- Evidence contract
- Development and contribution documentation
- Security reporting instructions

## Phase 1 — MVP (Current)

- Domain verification (DNS TXT proof)
- Passive subdomain discovery (Certificate Transparency via crt.sh)
- DNS information (NS, MX, SPF, DMARC, CAA)
- RDAP registration information
- SSRF protection
- Evidence contract implementation
- DEIP report
- Tests

## Phase 2 — Independent Password Module and Email

Password module:
- Client-side SHA-1
- Pwned Passwords range API
- Local matching
- No storage or logging
- Complete separation from investigations

Email:
- SMTP configurable by the user through environment variables
- Email ownership confirmation
- Explicit user consent
- No default paid email provider
- No requirement for the project maintainer to pay for email delivery

Public sources such as Gravatar and GitHub may be considered after their privacy implications and matching limitations are documented.

Optional user-supplied API keys for breach sources remain an **open product decision**. Do not implement BYOK breach integrations until the project owner explicitly approves the approach.

## Phase 3 — Reports and Quality

- JSON export
- PDF export
- Internationalization
- Accessibility improvements
- Additional usability refinements

## Later — Profile Ownership Claims

Public profile assessments may be considered only after implementing a real control-proof mechanism. A username match alone is never proof of ownership.

## Permanently Excluded

- Searching people by full name.
- Searching or identifying people through photographs.
- Facial recognition.
- Reverse image identification of individuals.
- Doxxing functionality.
- Investigating arbitrary individuals.
- Active port scanning.
- Brute-force attacks.
- Credential stuffing.
- Password guessing.
- Authentication bypass.
- Unauthorized account access.
- Exploitation of vulnerabilities.
- Active requests to target infrastructure.
