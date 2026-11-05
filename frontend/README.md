# Try Find Me! — Frontend

React, TypeScript and Vite frontend for the Try Find Me! OSINT platform.

## Development

The supported local workflow is Docker Compose from the repository root:

```bash
docker compose up --build
```

Open <http://127.0.0.1:5173>. The browser calls the API at `http://127.0.0.1:8000` (configured in `compose.yaml`).

To run only the frontend against an existing backend:

```bash
npm install
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

## Checks

```bash
npx tsc -b --pretty false
npx vitest run
npx vite build
npx oxlint
```

## Structure

| Path | Purpose |
|---|---|
| `src/components` | Screens, report views and UI primitives |
| `src/hooks` | Assessment state machine and countdown |
| `src/lib` | Formatting and presentation helpers |
| `src/services` | Typed API client |
| `src/styles` | Obsidian Grid tokens, base styles, components and print |
| `src/tests` | Vitest + React Testing Library suites |

The frontend never persists investigation data and renders all API values as React text.
