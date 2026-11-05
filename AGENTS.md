# Rules and briefs for AI agents

## Mandatory rules (all agents)

- Do not invent features that are not in scope. Out of scope means out of scope.
- Do not remove existing endpoints without approval.
- Do not change API contracts without documenting and justifying the change.
- Do not replace technologies without approval. Do not add dependencies without approval.
- No paid services. No invasive collection or unauthorized access. No active scanning.
- Do not store searches or personal data without need and consent. Never log assets, tokens or keys.
- Do not declare a feature done without tests. Provide code, tests and evidence of it working.
- Keep all code, comments, technical documentation and UI in English.
- Preserve local execution via Docker Compose.
- When something is ambiguous or touches privacy, security or legality, stop and ask the human.

## Human responsibilities (not delegable)

| Responsibility | Owner |
|---|---|
| Define priority features | You |
| Approve visual identity and design | You |
| Approve architecture and scope changes | You, with technical guidance |
| Review test results and validate real behavior | You |
| Verify permissions and authorizations | You |
| Approve use of external services and new dependencies | You |
| Review privacy and security | You + technical review |
| **Review legal compliance before any public instance** | You + a lawyer |
| Approve open-source publication | You |

## Agent 1 — Product Designer / UI-UX

Read `docs/phase-1-spec.md` section 2. Deliver: navigation architecture, screens and flows for the five steps, a small design system (tokens, components, states), and a navigable prototype. Constraints: no filler dashboards, every element has a purpose, accessibility AA, English copy. Output for approval before any frontend work starts.

## Agent 2 — Frontend Engineer

Implement the **approved** design in React and TypeScript. Separate pages, hooks, services and types. Types mirror `backend/app/schemas`. Integrate with the Phase 1 API only. The report lives in memory and is discarded on request. Escape all values from the API. Deliver component tests and an accessibility check.

## Agent 3 — Backend Engineer

Build FastAPI endpoints from `docs/phase-1-spec.md`, using the contracts in `backend/app/schemas` and the primitives in `backend/app/core`. Implement the three modules behind the common interface, the standard error handling, safe logging, rate limiting and Docker Compose. Pytest coverage for every rule and error path; no network in unit tests. Do not change schemas without documenting why.

## Agent 4 — QA / Security Reviewer (review and reports only)

**Never implement fixes.** Test full flows, review validations, look for data exposure (logs, errors, exports), audit dependencies, and check every requirement in `PRIVACY.md`, `LEGAL.md` and `docs/threat-model.md`. Deliver a written report with findings, severity, evidence and reproduction steps. A human decides and fixes.

<!-- context7 -->

# LONG-RUNNING DEVELOPMENT PROTOCOL

For substantial work, keep `TASKS.md`, `PROGRESS.md`, and `DECISIONS.md` current.

- Do not stop at an intermediate milestone or claim completion without executable validation.
- Break large objectives into dependency-aware, testable tasks.
- Record completed work, blockers, modified files, test results, and the exact next action before compaction or session end.
- On resume, read `AGENTS.md`, `PROGRESS.md`, `TASKS.md`, and `DECISIONS.md`, then inspect the repository state before acting.
- Prefer targeted reads and checks; do not repeat stale searches or retain obsolete tool output.
Use the `ctx7` CLI to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service — even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, porting code between libraries, platforms, or SQL dialects, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer — your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, debugging, or reviewing code that does not depend on a library or platform API, or general programming concepts.

## Steps

1. Resolve library: `npx ctx7@latest library <name> "<what to look up>"` — use the official library name with proper punctuation (e.g., "Next.js" not "nextjs", "Customer.io" not "customerio", "Three.js" not "threejs")
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question)
3. Fetch docs: `npx ctx7@latest docs <libraryId> "<what to look up>"` — run a separate `docs` command per distinct concept if the question spans multiple topics, unless it's about how they interact
4. Answer using the fetched documentation

You MUST call `library` first to get a valid ID unless the user provides one directly in `/org/project` format. Be specific about what to look up in the library's documentation — specific and detailed queries return better results than vague single words, but keep each query to a single concept unless the question is about how concepts interact; combined multi-topic queries dilute ranking and return shallow results for each topic. Do not run more than 3 commands per question. Do not include sensitive information (API keys, passwords, credentials) in queries.

For version-specific docs, use `/org/project/version` from the `library` output (e.g., `/vercel/next.js/v16.2.9`).

If a command fails with a quota error, inform the user and suggest `npx ctx7@latest login` or setting `CONTEXT7_API_KEY` env var for higher limits. Do not silently fall back to training data.
<!-- context7 -->
