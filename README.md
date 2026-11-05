# Try Find Me! — OSINT

An open-source, passive OSINT platform for authorized digital exposure assessments, helping users discover, understand, and reduce their public digital footprint.

> **Status: Phase 1 MVP implemented.** The domain ownership flow, passive assessment API, and the Obsidian Grid frontend are working locally via Docker Compose. A security review and a formal screen-reader audit remain release gates.

The goal is not simply to find information. It is to turn public information into useful intelligence for protecting privacy.

## Principles

- **Privacy by Design** and minimal data collection.
- **Proof of ownership:** only assets the user can prove control over are assessed.
- **Passive only:** public sources and official APIs; never active scanning, never bypassing access controls.
- **Traceable evidence:** every finding records where it came from, when, and how reliable it is.
- **Transparency about limitations** in every report.
- **Local-first:** the main way to run it is on your own machine via Docker Compose.
- **No accounts, no tracking, no stored searches.** Close the report and it is gone.

## What is implemented

The Phase 1 MVP assesses domains only, after DNS TXT ownership verification.

1. **Identify** — enter a domain and confirm you own it or are authorized to assess it.
2. **Verify ownership** — publish the signed temporary TXT record shown by the app and verify it through public DNS.
3. **Sources & consent** — review every external service that will receive the domain, then explicitly consent.
4. **Report** — read a point-in-time DEIP report (Discovery, Evidence, Intelligence, Protection), print or save it as PDF, then discard it from memory.

The report covers certificate transparency subdomains, public DNS records, and RDAP registration data. Every evidence item includes its source, retrieval time, match type, confidence, ownership state, deterministic risk rule, and raw JSON. Missing results are distinguished from unavailable sources; no risk score or per-module progress is fabricated.

## The four pillars (DEIP)

1. **Discovery** — find publicly available information about a verified asset.
2. **Evidence** — record source, retrieval time, match type and confidence.
3. **Intelligence** — classify risk with explicit, deterministic, documented rules.
4. **Protection** — attach a concrete action to every medium or high risk.

## Scope

| Asset | Phase | Ownership proof |
|---|---|---|
| Domains and subdomains | 1 (MVP) | DNS TXT record |
| Email address | 2 | Confirmation sent to the address |
| Passwords (independent, client-side, k-anonymity) | 2 | Not applicable |
| Public profiles | Later | Only after a profile control-proof mechanism exists |
| Full name, photos | **Never** | Out of scope permanently |
| Active scanning of any kind | **Never** | Out of scope permanently |

## Technology

Python, FastAPI, Pytest, React, TypeScript, Vite, Vitest, Git/GitHub, HTTP/REST, Docker Compose. No database in the MVP.

## Repository layout

| Path | Responsibility |
|---|---|
| `backend/app/api` | HTTP endpoints and communication |
| `backend/app/core` | Configuration, asset validation, ownership tokens, logging |
| `backend/app/modules` | Passive OSINT modules behind a common interface |
| `backend/app/schemas` | Pydantic contracts (`Evidence`, `Report`, `SourceInfo`, errors) |
| `backend/tests` | Backend unit and API tests |
| `frontend/src/components` | Screens and hand-authored UI primitives |
| `frontend/src/hooks` | Assessment state machine and countdown |
| `frontend/src/services` | Typed API client |
| `frontend/src/styles` | Obsidian Grid tokens, base styles, components, print |
| `docs` | Specifications and architecture documentation |

## Run locally with Docker Compose

Requirements: Docker Desktop with Compose, and ports `8000` and `5173` free.

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Open <http://127.0.0.1:5173>. The API is available at <http://127.0.0.1:8000>, with health at `/health` and interactive docs at `/docs`.

The frontend reads `VITE_API_BASE_URL` at build/dev-server start. It is set to `http://127.0.0.1:8000` in `compose.yaml` because the API URL is resolved by the browser on the host, not by the frontend container.

## Verify a domain

The backend issues a signed token with a short lifetime. Publish one TXT record:

| Field | Value |
|---|---|
| Name | the `txt_record_name` shown in the app, for example `_tryfindme-verification.example.com` |
| Type | `TXT` |
| Value | the `txt_record_value` shown in the app |

Wait for DNS propagation, click **I've published the record — Verify**, then remove the record after verification. The app never asks you to paste the token.

## Tests and checks

Frontend, from `frontend/`:

```bash
npx tsc -b --pretty false
npx vitest run
npx vite build
npx oxlint
```

Backend, from the repository root (uses the backend image so native dependencies match):

```bash
docker compose run --rm -v "${PWD}/backend/tests:/app/tests" backend python -m pytest -q
```

The current suite is 64 frontend tests and 89 backend tests. The frontend tests cover the full flow, automatic token use, consent gating, context-aware retries, rate limits, failure states, and literal rendering of untrusted API values.

## Privacy and security

- The investigation lives in React state only. There is no database, account, history, analytics, cookie, or `localStorage` use for investigation data.
- The domain is sent to allowlisted third-party sources only after explicit consent.
- The app never connects to the assessed domain and never performs active scanning.
- API values are rendered as React text; the frontend does not build HTML strings.
- The ownership record is temporary. Remove it after verification.

See [PRIVACY.md](PRIVACY.md), [SECURITY.md](SECURITY.md), and [LEGAL.md](LEGAL.md).

## Documentation

- [Phase 1 specification](docs/roadmap/phase-1-specification.md)
- [Roadmap](docs/roadmap/roadmap.md)
- [Architecture overview](docs/architecture/overview.md)
- [Evidence contract](docs/architecture/evidence-contract.md)
- [Threat model](docs/architecture/threat-model.md)
- [Privacy policy](docs/privacy/privacy-policy.md)
- [Accessibility](ACCESSIBILITY.md)
- [Rules and briefs for AI agents](AGENTS.md)

## Known limitations

- Only domains are supported in Phase 1.
- Risk categories are deterministic rules, not a statistical score.
- Public sources can be incomplete, stale, rate-limited, or unavailable. Absence of findings does not prove absence of exposure.
- DNS propagation can delay verification.
- A formal external security review and screen-reader audit have not been completed.

## License

AGPL-3.0-or-later. See `LICENSE`.

## Responsible use

Use this tool only on assets you own or are explicitly authorized to assess. See [LEGAL.md](LEGAL.md).
