# Decisions — Try Find Me! — OSINT

## Decision: Proceed without separate human approval
- User explicitly instructed: "aprove-yourself" — proceed with development without waiting for explicit approval
- User will be away from PC and unavailable for approvals
- Rationale: Direct user instruction overrides the "wait for approval" gate in the master spec
- Risk: User may want to review architecture decisions before implementation; all decisions documented here for later review

## Decision: Service names
- Keeping existing `backend`/`frontend` names rather than migrating to `api`/`web`
- Per spec: "Do not perform unnecessary migrations simply to make names match this specification"

## Decision: Rate limit numbers
- Using FASE1.md draft values (challenge 10/min, verify 10/min, assessments 3/min)
- Marked [HUMAN] in spec; will flag for user review when available

## Decision: Risk rules version 1
- Using FASE1.md draft rules
- Marked [HUMAN] in spec; will flag for user review when available

## Decision: Dependency additions
- dnspython added for DNS resolution (required for SSRF protection and DNS verification)
- python-dotenv added for environment variable loading
- All dependencies pinned; new additions require approval per spec

## Pending Decisions (require human review when available)
- Rate limit numbers confirmation
- Risk rules v1 approval
- Public-suffix list library (to reject bare public suffixes like co.uk)

## Decision: Obsidian Grid visual direction
- The approved redesign uses a dark-first graphite palette with signal cyan `#38BDF8`, 1px borders, mono identifiers and system fonts.
- All icons and the brand mark are hand-authored SVG. No icon or font dependency was added.
- Tokens in `frontend/src/styles/tokens.css` are the single source of truth for color, type and spacing.

## Decision: Consent gates the assessment
- The source transparency screen is mandatory. The assessment cannot start until the source list loads and the user explicitly confirms that the listed services will receive the domain.
- A source-registry failure blocks the assessment instead of silently proceeding with an unknown set of services.

## Decision: No fabricated progress or scores
- The assessment API is synchronous and returns one report. The UI shows a single indeterminate state and elapsed time only; it never infers per-module progress.
- Risk is presented as deterministic categories and rule IDs. No numeric score is calculated or displayed.

## Decision: Context-aware error recovery
- Challenge, verification, source-list and assessment errors keep the user in the relevant step with a matching retry action.
- Verification failures keep the challenge and TXT record visible.
- Source-list failures keep the same `proof_id`; a rejected proof (403/404) offers re-verification.
- `Retry-After` is honored with a visible countdown and a disabled retry button.

## Decision: React text rendering only
- All six legacy `escapeHtml` helpers were removed. API values are rendered as React children, including raw evidence JSON in `<pre>`.
- No `dangerouslySetInnerHTML` is used.

## Decision: Report output
- The report uses the full `Report`/`Evidence` contract and the DEIP section structure.
- Print / Save as PDF uses the browser print dialog. Discard clears the in-memory report after an inline confirmation. JSON export is not implemented; print/PDF replaces it for the MVP.

## Decision: Docker frontend API URL
- `VITE_API_BASE_URL` is read by the browser, so it must be a host-resolvable URL. It was changed from `http://backend:8000` to `http://127.0.0.1:8000` in `compose.yaml`.
- The backend port is already published on `127.0.0.1:8000`; this keeps the local-first Docker workflow working without adding a proxy.
