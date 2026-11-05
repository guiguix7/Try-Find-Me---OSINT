# Data sources

**Rule:** a module may not be implemented until its row is complete and a human has approved it. Terms and endpoints below are starting points; **verify each against the provider's current official documentation before implementing.**

## Phase 1

| Module id | Source | Data | Reliability | Receives | Auth | Notes to verify |
|---|---|---|---|---|---|---|
| `ct_subdomains` | Certificate Transparency search (crt.sh) | Names that appear in publicly logged certificates | Medium (third-party aggregator; availability varies; names may be stale) | The domain | None | Terms of use, rate limits, response size, availability |
| `dns_records` | DNS resolver (system resolver by default, configurable) | NS, MX, TXT (SPF), `_dmarc` TXT, CAA for the apex | High | Queries for the domain | None | The resolver sees the queries; the domain's authoritative servers see lookups |
| `rdap_registration` | RDAP (servers found through the IANA RDAP bootstrap) | Registration status, dates, registrar | High | The domain | None | Bootstrap file location and terms; rate limits per RDAP server |

Phase 1 modules never connect to the assessed domain's own web or mail servers.

## Phase 2 (planned)

| Module id | Source | Notes |
|---|---|---|
| `password_range` (client-side) | Pwned Passwords range API (k-anonymity) | Browser sends only a short hash prefix; confirm CORS and padding support and current terms |
| `gravatar` | Gravatar | Sends a hash of the email; disclose it |
| `github_public` | GitHub public API | Public data only; respect rate limits |
| BYOK breach sources | User-supplied key | Local mode only; the user must comply with the provider's terms; the project never shares keys |

## Not planned

Search engines, social network scraping, people-search sites, leaked-credential dumps, paste sites.

## Consent screen

`GET /api/v1/sources` returns, for every enabled module, what is sent to which service. The UI shows it before each search.