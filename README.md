# Try Find Me! — OSINT

An open-source, passive OSINT platform for authorized digital exposure assessments, helping users discover, understand, and reduce their public digital footprint.

> **Status: Phase 0 (contracts and documentation).** No user-facing feature exists yet.

The goal is not simply to find information. It is to turn public information into useful intelligence for protecting privacy.

## Principles

- **Privacy by Design** and minimal data collection.
- **Proof of ownership:** only assets the user can prove control over are assessed.
- **Passive only:** public sources and official APIs; never active scanning, never bypassing access controls.
- **Traceable evidence:** every finding records where it came from, when, and how reliable it is.
- **Transparency about limitations** in every report.
- **Local-first:** the main way to run it is on your own machine via Docker Compose.
- **No accounts, no tracking, no stored searches.** Close the report and it is gone.

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

Python, FastAPI, Pytest, React, TypeScript, Git/GitHub, HTTP/REST, Docker Compose. No database in the MVP.

## Repository layout

| Path | Responsibility |
|---|---|
| `backend/app/api` | HTTP endpoints and communication |
| `backend/app/core` | Configuration and central functionality (asset validation, ownership tokens) |
| `backend/app/modules` | OSINT intelligence modules (one per source, common interface) |
| `backend/app/schemas` | Data structures and validation (`AssetOwnership`, `Evidence`, `Report`, errors) |
| `backend/tests` | Automated tests |
| `docs` | Project documentation |

## Documentation

- [Phase 1 specification](docs/phase-1-spec.md)
- [Ownership verification and its limits](docs/ownership-verification.md)
- [Threat model](docs/threat-model.md)
- [Data sources](docs/sources.md)
- [Rules and briefs for AI agents](docs/agents.md)
- [LEGAL](LEGAL.md) · [PRIVACY](PRIVACY.md) · [SECURITY](SECURITY.md)

## Running the contract tests

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
pytest
```

## License

AGPL-3.0-or-later.

**Pending:** the full AGPL-3.0 text must be copied from <https://www.gnu.org/licenses/agpl-3.0.txt> into a `LICENSE` file before publishing the repository.

## Responsible use

Use this tool only on assets you own or are explicitly authorized to assess. See [LEGAL](LEGAL.md).