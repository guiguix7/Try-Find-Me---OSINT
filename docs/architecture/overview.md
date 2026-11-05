# Architecture Overview — Try Find Me! — OSINT

## System Architecture

The application consists of two services running locally via Docker Compose:

| Service | Technology | Port | Responsibility |
|---|---|---|---|
| `backend` | FastAPI (Python 3.12) | 8000 | API endpoints, domain verification, OSINT modules, evidence assembly |
| `frontend` | React 19 + TypeScript + Vite | 5173 | User interface, domain input, verification flow, report display |

### Communication

The frontend calls the backend over HTTP/REST at `http://127.0.0.1:8000/api/v1/`. CORS is configured to allow only the frontend origin(s). No database is used.

## Backend Layout

```
backend/app/
├── main.py              # FastAPI app, CORS middleware, health/root endpoints
├── core/
│   ├── __init__.py
│   └── config.py        # Settings from environment variables
├── schemas/
│   ├── __init__.py
│   ├── audit.py         # AuditCreate: domain validation + authorization
│   ├── ownership.py     # DomainChallengeRequest/Response, DomainVerifyRequest/Response
│   ├── assessment.py    # AssessmentRequest, Report, Evidence, SourceInfo, ErrorResponse
│   └── risk.py          # RiskRule, RiskClassification
├── services/
│   ├── __init__.py
│   ├── audit_service.py # In-memory audit store with TTL expiration
│   ├── logging.py       # Structured, privacy-safe logging
│   └── security.py      # SSRF protection, IP allowlisting, rate limiting
├── api/
│   ├── __init__.py
│   └── routes/
│       ├── __init__.py
│       ├── audits.py    # POST /audits, GET /audits/{id} (legacy)
│       ├── ownership.py # POST /ownership/domain/challenge, POST /ownership/domain/verify
│       ├── assessment.py # POST /assessments
│       └── sources.py   # GET /sources
├── modules/
│   ├── __init__.py
│   ├── base.py          # Common module interface: module_id, run() -> ModuleResult
│   ├── ct_subdomains.py # Certificate Transparency via crt.sh
│   ├── dns_records.py   # DNS: NS, MX, SPF, DMARC, CAA
│   ├── rdap_registration.py # RDAP registration info
│   └── confidence.py    # Confidence classification (weakest-link derivation)
└── __init__.py
```

## Data Flow

1. User enters a domain and confirms authorization in the frontend.
2. Frontend calls `POST /ownership/domain/challenge` → backend generates a signed verification token.
3. User publishes the token as a DNS TXT record on their domain.
4. Frontend calls `POST /ownership/domain/verify` → backend checks DNS TXT + HMAC + expiration.
5. If verified, frontend calls `POST /assessments` → backend runs all OSINT modules.
6. Each module returns evidence entries conforming to the Evidence contract.
7. Backend assembles a Report with risk classifications and recommendations.
8. Frontend displays the report; user can export or discard.

## Data Retention

- No persistent database.
- Investigation data exists only in backend memory with TTL expiration.
- Reports exist only in the browser until the user exports or discards.
- Logs never contain assessed domains, tokens, passwords, or personal data.

## Security Boundaries

- SSRF protection: private/loopback/link-local/multicast IP rejection, allowlisted outbound hosts, strict timeouts, response size limits.
- Rate limiting: per-client limits on challenge, verify, and assessment endpoints.
- Secrets: SERVER_SECRET from environment, never logged, never exposed to frontend.
- Passive only: no active scanning, no connections to target infrastructure.

## External Services (Phase 1)

| Module | Source | Data Sent | Auth |
|---|---|---|---|
| ct_subdomains | crt.sh | The domain | None |
| dns_records | System DNS resolver | The domain | None |
| rdap_registration | IANA RDAP bootstrap | The domain | None |

## Technology Decisions

- **Python 3.12+** with FastAPI: already in the existing stack.
- **Pydantic**: schema validation, already in the existing stack.
- **Pytest**: backend testing, already in the existing stack.
- **No database**: MVP requirement; in-memory structures with expiration.
- **React 19 + TypeScript + Vite**: already in the existing stack.
- **Docker Compose**: two services, local-first execution.

## Conflicts with Specification

None identified. The existing repository structure is compatible with the master specification. Service names (`backend`/`frontend`) are kept as-is per the spec's guidance not to perform unnecessary migrations.
