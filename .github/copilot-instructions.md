# Try Find Me development instructions

## Scope and safety

- Follow `AGENTS.md` and the project documents in `docs/`, `PRIVACY.md`, `LEGAL.md`, and `SECURITY.md`.
- Keep the product passive and authorization-based. Never add active scanning, access-control bypasses, invasive collection, tracking, or persistence of searches.
- Do not expose secrets, tokens, personal data, or sensitive assets in logs, tests, fixtures, error messages, or generated reports.
- Do not change API contracts, remove endpoints, replace technologies, or add dependencies without documenting the reason.

## Implementation rules

- Keep changes small and focused. Preserve existing behavior and local Docker Compose execution.
- Keep code, comments, documentation, and UI copy in English.
- Prefer existing project patterns and typed contracts. Escape values received from APIs before rendering them.
- Add or update tests for behavior and error paths. Unit tests must not use the network.
- Do not claim a task is complete without executable validation.

## Validation

- Backend: run `cd backend` followed by the relevant `pytest` command.
- Frontend: run `cd frontend` followed by `npm run lint` and `npm run build` when applicable.
- Compose: run `docker compose config` before starting services.
- For substantial work, update `TASKS.md`, `PROGRESS.md`, and `DECISIONS.md` with the current status and next action.

## Git hygiene

- Never commit `node_modules`, Python environments, caches, build output, logs, local environment files, or credentials.
- Before finishing, inspect `git status --short` and verify that only intentional files are candidates for commit.
