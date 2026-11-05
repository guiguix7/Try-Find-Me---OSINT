# Phase 1 Specification (MVP): Domain Exposure Assessment

## 1. Goal

A user proves control of a domain they own and receives a report with evidence-backed findings, deterministic risk classification and concrete recommendations, without any account and without anything being persisted.

## 2. User Flow (UI)

1. **Home** — the first page is the tool: one input for the domain, a short "what is sent where" notice generated from `GET /api/v1/sources`, and a start button. Only categories that exist are shown (Domain). No login, no registration, no marketing sections.
2. **Verify ownership** — shows the TXT record to create (name, value, copy buttons) and a "Check now" button. Failure messages say "not found yet" with DNS propagation guidance.
3. **Assessment running** — one row per module with status (running, ok, partial, failed, skipped) and a plain-language message. Announced to screen readers with `aria-live`.
4. **Report** — findings grouped by risk, filter by category, evidence detail (source, retrieval time, match type and basis, confidence, rule id), recommendation, a **Limitations** section, "Export JSON" and "Discard report" (clears memory).
5. **States** — loading, success, empty ("nothing notable found" with what was checked), per-module failure, global error with request id.

Design constraints: professional, no decorative dashboards, no numbers that do not come from real data, WCAG 2.1 AA contrast, keyboard navigable, risk never conveyed by color alone, responsive for desktop, tablet and mobile. Text in English.

## 3. API (all under `/api/v1`)

| Method and path | Request | Response | Notes |
|---|---|---|---|
| `GET /health` | — | `{"status":"ok"}` | No asset data |
| `GET /sources` | — | `list[SourceInfo]` | Shown before consent |
| `POST /ownership/domain/challenge` | `DomainChallengeRequest` | `DomainChallengeResponse` | Stateless; TTL 15 min |
| `POST /ownership/domain/verify` | `DomainVerifyRequest` | `DomainVerifyResponse` | Checks HMAC and DNS TXT; returns proof, TTL 30 min |
| `POST /assessments` | `AssessmentRequest` | `Report` | Requires valid proof; runs modules |

Contracts live in `backend/app/schemas`. Any change to them must be documented and justified (see `docs/agents.md`).

**Errors:** always `ErrorResponse`. Mapping: invalid input → 422 `VALIDATION_ERROR`; missing or invalid proof → 403 `OWNERSHIP_REQUIRED`; expired proof → 403 `OWNERSHIP_EXPIRED`; too many requests → 429 `RATE_LIMITED`; unreachable source → reported per module (`SOURCE_UNAVAILABLE` only when everything failed); unexpected → 500 `INTERNAL_ERROR` with a generic message.

**Limits:** per-module timeout 10 s, whole assessment 30 s, request body ≤ 4 KB, in-memory rate limits per client (challenge and verify 10/min, assessments 3/min). **[HUMAN]** confirm numbers.

**Domain rules:** every domain goes through `canonicalize_domain`. If the apex resolves only to non-public addresses (private, loopback, link-local, etc.), return `VALIDATION_ERROR`. The server never connects to the target or to any resolved address.

## 4. Modules

Common interface (conceptual): each module exposes `module_id` and `run(asset, context) -> ModuleResult(status, evidence[], user_message)`. The context provides a clock, an HTTP client restricted to allowlisted hosts, a DNS resolver and timeouts. A module never raises to the caller: failures become `failed` or `partial` with a safe message, and details go to the logs without the asset.

| Module | Produces |
|---|---|
| `ct_subdomains` | `SUBDOMAIN` evidence per name found (info), plus rule-based findings |
| `dns_records` | `DNS_RECORD` and `EMAIL_AUTHENTICATION` evidence (NS, MX, SPF, DMARC, CAA) |
| `rdap_registration` | `REGISTRATION` evidence (status, dates, registrar) |

Source reliability: `ct_subdomains` medium, `dns_records` high, `rdap_registration` high. Confidence is derived (weakest link), never set by hand.

## 5. Risk Rules, Version 1 (Draft) **[HUMAN]**

Risk comes only from written rules. Every medium or high finding carries its `rule_id` and a recommendation.

| Rule id | Condition | Risk | Recommendation (summary) |
|---|---|---|---|
| `DNS-SPF-001` | Domain has MX records but no SPF record | Medium | Publish an SPF record that lists only authorized senders |
| `DNS-SPF-002` | SPF record ends with `+all` | High | Replace with `-all` (or `~all` while testing) and list authorized senders |
| `DNS-DMARC-001` | MX records exist but no DMARC record | Medium | Publish a DMARC record, starting with `p=none` and reporting |
| `DNS-DMARC-002` | DMARC policy is `p=none` | Low | Move to `quarantine` then `reject` once reports look clean |
| `DNS-CAA-001` | No CAA record | Low | Add CAA records restricting which CAs may issue certificates |
| `SUB-NAME-001` | A subdomain label matches a documented list (admin, vpn, staging, dev, jenkins, gitlab, grafana, kibana, phpmyadmin, internal) | Medium | Check that the service is intended to be public; restrict or remove it. Match type is `inferred` (naming only), so confidence is low |
| `RDAP-EXP-001` | Registration expires in 30 days or less | Medium | Renew the domain and enable auto-renew |
| `RDAP-EXP-002` | Registration expires in 7 days or less | High | Renew immediately |
| `RDAP-LOCK-001` | No transfer-prohibited status present | Low | Ask the registrar to enable a registrar lock |

Inventory findings (every subdomain found, nameservers, registrar) are `info` and need no recommendation. The keyword list for `SUB-NAME-001` lives in a versioned data file, not in code.

## 6. Mandatory Report Content

- Asset, generation time, ownership method and expiry.
- Module status list.
- Evidence list with source, retrieval time, match type and basis, derived confidence, risk, rule id, recommendation.
- Derived `risk_counts` (counts of real findings, nothing else).
- **Limitations** (at least): only public, passive sources were used; certificate transparency lists names that appeared in certificates, not necessarily live services; absence of findings is not proof of absence of exposure; results describe one moment in time; ownership verification proves control, not legal ownership.

## 7. Non-Functional Requirements

- **Persistence:** none. No database, no cookies. Optional localStorage for visual preferences only.
- **Logging:** structured logs and a server console for operations. Never log assets, tokens, proofs, keys or response bodies containing them. One consistent error-handling pattern across the code; user-facing messages are clear and generic, details only in logs.
- **Run locally:** Docker Compose with two services, `api` and `web`.
- **Dependencies:** pinned; any new dependency (for example a public-suffix list library, to reject bare public suffixes like `co.uk`, or a DNS library) requires approval **[HUMAN]**.
- **Language:** all code, comments, docs and UI in English.

## 8. Acceptance Criteria

1. The first screen is the tool, with no login or registration.
2. No Discovery module runs without a valid, unexpired ownership proof (tested).
3. Every finding shows source, time, match type and confidence; every medium or high finding has a rule id and a recommendation (enforced by the schema).
4. Nothing from a search is written to disk or logs (tested by inspecting logs in an end-to-end test).
5. IP addresses, internal TLDs, ports, schemes and wildcards are rejected; domains resolving only to non-public addresses are rejected; no request to hosts derived from user input (tested).
6. Each module's failure degrades gracefully and is visible in the report.
7. Loading, empty, success and error states exist and are accessible.
8. Automated tests pass in CI, with the test report attached. A phase is not "done" on an agent's say-so: **[HUMAN]** reviews code, tests and a real run.
9. `docker compose up` brings up the working application.

## 9. Out of Scope for Phase 1

Email, passwords, profiles, names, photos, BYOK, PDF export, accounts, any persistence, any active scanning.
