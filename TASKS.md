# Try Find Me! — OSINT — Task Tracking

## Stage 1 — Repository Audit (COMPLETED)
- [x] Inspected repository structure, backend, frontend, Docker Compose, dependencies, tests, documentation
- [x] Identified all gaps vs. master specification
- [x] Delivered audit report

## Stage 2 — Architecture and Specification (IN PROGRESS)
- [ ] Create LICENSE with full AGPL-3.0 text
- [ ] Create requirements.txt with pinned dependencies
- [ ] Update pyproject.toml with project metadata + pytest dev dependency
- [ ] Create .env.example
- [ ] Add __init__.py to all backend packages
- [ ] Create docs/architecture/overview.md
- [ ] Create docs/architecture/threat-model.md
- [ ] Create docs/architecture/evidence-contract.md
- [ ] Create docs/privacy/privacy-policy.md
- [ ] Create docs/roadmap/roadmap.md
- [ ] Create docs/roadmap/phase-1-specification.md
- [ ] Populate empty docs: CONTRIBUTING.md, ROADMAP.md, PRODUCT.md, DESIGN.md, ACCESSIBILITY.md, SUPPORT.md, CHANGELOG.md, CODE_OF_CONDUCT.md

## Stage 3 — Foundation (PENDING)
- [ ] Implement structured, privacy-safe logging
- [ ] Implement SERVER_SECRET from env (no default, generate on first run)
- [ ] Run tests, validate Docker Compose, review logging/config/docs

## Stage 4 — Backend MVP (PENDING)
- [ ] Domain verification module (challenge/verify, HMAC, expiration, rate limiting)
- [ ] SSRF protection (DNS resolution, private IP rejection IPv4/IPv6, allowlist, timeouts, size limits)
- [ ] ct_subdomains module (crt.sh integration)
- [ ] dns_records module (NS, MX, SPF, DMARC, CAA)
- [ ] rdap_registration module (RDAP bootstrap)
- [ ] Evidence contract schemas (Evidence, Report, SourceInfo, ErrorResponse)
- [ ] Risk classification (deterministic rules)
- [ ] Assessment endpoint (POST /assessments requiring valid proof)
- [ ] GET /sources endpoint

## Stage 5 — Frontend MVP (PENDING)
- [ ] Verification flow (TXT token display, Check now button)
- [ ] Assessment running state (per-module status rows)
- [ ] Report view (findings by risk, evidence detail, limitations)
- [ ] States (empty, partial, error, timeout, rate limit, verification failure)
- [ ] Export/discard (JSON export, clear memory)
- [ ] Frontend tests (Vitest + React Testing Library)

## Stage 6 — Integration and Security Review (PENDING)
- [ ] Validate complete flow
- [ ] Security review (SSRF, input validation, DNS, external requests, retention, logging, secrets, rate limiting, error handling, browser exposure)

## Stage 7 — Final Validation (PENDING)
- [ ] Build results, test results, Docker validation, functional validation
- [ ] Security review, documentation status, known limitations, remaining tasks
