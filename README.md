# Phrenia

Branchable planning for students and small teams: plan on one timeline, branch to try other plans, merge the one you choose, and keep what really happened (status, Pomodoro, evidence) separate from the plan.

This is the **step 0 scaffold**. See `docs/ARCHITECTURE.md` for how the pieces fit and `docs/QA-STEP-0.md` for the checklist.

## Requirements (Windows)

- Node.js 22 LTS
- pnpm 12 (`corepack enable` then `corepack prepare pnpm@12.23.0 --activate`, or `npm install -g pnpm@12.23.0`)
- Firefox for manual checks

## Commands (PowerShell, from this folder)

```powershell
pnpm install     # first time only
pnpm typecheck   # TypeScript checks for every package
pnpm test        # all automated tests (the first database test takes about 5 seconds)
pnpm build       # builds the web app into apps/web/dist
pnpm dev         # API on http://localhost:8787, web app on http://localhost:5173
```

If `pnpm install` stops with `ERR_PNPM_IGNORED_BUILDS`, run `pnpm approve-builds esbuild` once.

## Layout

```
apps/web/                   React + Vite shell (nav tabs from the mockup, design tokens)
apps/api/                   Hono server, in-process Postgres (PGlite) with Drizzle, Better Auth smoke test
packages/shared/            Zod schemas and constants (roles, statuses, plan fields, AI permissions)
packages/planning-engine/   Pure TypeScript: diff, three-way merge, conflicts, scheduling warnings
packages/ai-core/           AI provider interface, permission gate, OpenAI-compatible and Ollama providers,
                            local model management
```

## Rules baked in

- AI is off by default and sends only what the user allows.
- The planning engine has no database, no network and no clock.
- Text is at least 12px, targets at least 24px, focus is always visible.
