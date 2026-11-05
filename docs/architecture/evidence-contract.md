# Evidence Contract — Try Find Me! — OSINT

## Overview

Every discovery module must return findings in a consistent evidence structure. This contract ensures that all findings are traceable, interpretable, and actionable.

## Evidence Schema

| Field | Type | Purpose |
|---|---|---|
| `id` | string (UUID) | Unique identifier for the finding |
| `source_id` | string | Stable identifier of the source (e.g., `ct_subdomains`, `dns_records`, `rdap_registration`) |
| `source_name` | string | Human-readable source name (e.g., "crt.sh Certificate Transparency") |
| `source_url` | string \| null | URL identifying the source or reference |
| `retrieved_at` | string (ISO 8601 UTC) | Timestamp of retrieval |
| `evidence_type` | string | Type of information discovered (e.g., `SUBDOMAIN`, `DNS_RECORD`, `REGISTRATION`) |
| `ownership_verified` | boolean | Whether the relevant asset passed its ownership verification |
| `match_type` | string | Strength of correspondence: `exact`, `partial`, `inferred`, `unverified_candidate` |
| `confidence` | string | Evidence confidence classification: `low`, `medium`, `high` |
| `risk` | string \| null | Deterministic risk category: `low`, `medium`, `high`, or null for info findings |
| `risk_rule_id` | string \| null | Rule identifier that produced the risk classification |
| `recommendation` | string \| null | Concrete protective action for medium/high risk findings |
| `data` | object | Source-specific data payload |
| `message` | string | Human-readable summary of the finding |

## Match Types

Use only these classifications:

| Match Type | Meaning |
|---|---|
| `exact` | The finding precisely matches the assessed asset |
| `partial` | The finding is related but not an exact match |
| `inferred` | The finding is derived from naming or pattern analysis, not confirmed control |
| `unverified_candidate` | A candidate match with no independent mechanism proving control |

A username existing on a platform is `unverified_candidate` unless there is an independent mechanism proving control of that profile. A username match must never be presented as a confirmed identity.

## Confidence

Confidence is **derived, not declared**. It is the minimum of source reliability and match strength — a finding is only as reliable as its weakest link.

| Confidence | Basis |
|---|---|
| `high` | Reliable source + exact match + recent data |
| `medium` | Reliable source + partial/inferred match, OR less reliable source + exact match |
| `low` | Less reliable source + partial/inferred match, OR stale data |

Do not invent arbitrary percentages. Document how each confidence classification is calculated and tested.

## Risk

Use deterministic categories: `low`, `medium`, `high`. Every classification must be supported by written rules with a `risk_rule_id`.

| Risk | Example Conditions |
|---|---|
| `low` | Public information with limited sensitivity; no CAA record; DMARC `p=none` |
| `medium` | Relevant exposed information increasing privacy exposure; MX without SPF; domain expiring in ≤30 days; subdomain name matching sensitive keyword list |
| `high` | Confirmed sensitive exposure with credible security implication; SPF `+all`; domain expiring in ≤7 days |

Inventory findings (every subdomain found, nameservers, registrar) are info-level and need no recommendation.

## Recommendations

Every medium or high risk finding must contain a concrete, actionable recommendation tied to the evidence. Do not recommend unrelated actions. Do not fabricate removal links or claim information has been removed.

## Report Schema

| Field | Type | Purpose |
|---|---|---|
| `asset` | string | The assessed domain |
| `generated_at` | string (ISO 8601 UTC) | Report generation timestamp |
| `ownership_method` | string | Verification method used (e.g., `dns_txt`) |
| `ownership_expires_at` | string (ISO 8601 UTC) | Ownership proof expiration |
| `module_status` | object[] | Status of each module (running, ok, partial, failed, skipped) |
| `evidence` | object[] | All findings conforming to the Evidence contract |
| `risk_counts` | object | Counts of findings by risk level (low/medium/high/info) |
| `limitations` | string[] | Limitations of the assessment |
| `sources_consulted` | object[] | Sources that were queried |

## Limitations (Mandatory in Every Report)

- Only public, passive sources were used.
- Certificate transparency lists names that appeared in certificates, not necessarily live services.
- Absence of findings is not proof of absence of exposure.
- Results describe one moment in time.
- Ownership verification proves control, not legal ownership.

## Pydantic Schemas

Defined in `backend/app/schemas/`:

- `assessment.py` — `AssessmentRequest`, `Report`, `Evidence`, `SourceInfo`, `ErrorResponse`
- `risk.py` — `RiskRule`, `RiskClassification`
