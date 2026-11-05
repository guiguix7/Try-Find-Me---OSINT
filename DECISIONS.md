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
