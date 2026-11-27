# Phrenia — Development Specification

**Version:** 1.0 draft · **Date:** 26 Nov 2026\
**Built from:** Product & System Specification v1.0, Spec Amendment v1.1 (integrations are monitoring only), and the 12-screen UI mockup.\
**Purpose:** what to build, in which order and with which stack, precisely enough to start coding.

## 1. Scope on one page

- **Planning:** a branchable timeline (branch, commit, three-way merge) and scheduling-conflict warnings.
- **Execution:** tasks, subtasks, Kanban, Pomodoro and evidence. Execution data lives at project level and never depends on a branch.
- **Integrations (monitoring only):** Canvas (import), Google Docs (activity of chosen documents), WakaTime (coding time), Google Calendar (busy times, optional). One Integrations screen manages all of them.
- **AI (suggests only):** estimate, prioritize, explain a conflict, draft a branch. It never changes main.
- **Collaboration:** owner, editor and viewer roles for 3 to 5 people.
- **Out of scope:** native apps, payments, real-time co-editing, two-way sync, Git commit evidence, add-ons or extensions for other tools.

## 2. Recommended stack

**Decision drivers:** a desktop web app; a team of five sharing about one hour a day; free hosting for the pilot; a modern TypeScript and React stack; a relational model with history; strict privacy promises.

**Frontend**

- React + TypeScript + Vite as a single-page app. The app sits behind login, so SEO and server rendering are not needed. React Router for routes.
- TanStack Query for server state (caching, polling, optimistic updates). Keep local state small (useReducer or Zustand).
- Tailwind CSS with the mockup's design tokens as CSS variables (monospace font, palette, 12px minimum text).
- React Aria Components for dialogs, menus, radio groups and focus handling, so accessibility is built in rather than hand-written.
- Timeline and commit graph: custom SVG/DOM plus d3-scale for the time axis. dnd-kit for dragging, always paired with a menu or keyboard alternative. Burndown: small custom SVG.

**Backend**

- Node.js + TypeScript with Hono. Zod schemas live in a shared package, and Hono's typed client gives end-to-end types without code generation.
- PostgreSQL through Drizzle ORM (SQL-first, readable migrations).
- Auth: Better Auth, decided. It has an official Hono example, a Drizzle and Postgres adapter, Google sign-in and built-in rate limiting. Its organization plugin (teams, roles, invitations) may also cover workspaces and invites. Confirm in the spike that its roles can be set to owner, editor and viewer; if not, keep workspaces in our own tables.
- Background jobs: pg-boss (a queue stored in Postgres, no Redis). Workers run inside the API process at first.
- Realtime: polling with ETags first. Server-Sent Events later only if polling proves too slow.
- Style: a modular monolith with modules identity, workspace, planning, execution, integrations, ai and audit.

**Planning engine as a pure package**

- `packages/planning-engine` has no database, no HTTP and no clock. Input and output are plain JSON.
- The server uses it as the authority. The browser uses the same code for merge preview and scheduling checks.
- Written in TypeScript first. Because it is pure and JSON in, JSON out, it can later be rewritten in Rust and compiled to WebAssembly without changing any caller. Treat that as an optional later step, not an MVP task.

**Tooling:** pnpm workspaces, Vitest, Playwright with axe for end-to-end and accessibility checks, ESLint with jsx-a11y, GitHub Actions for CI.

**Free hosting for the pilot** (checked Nov 2026; limits change, so recheck before committing)

- Web: any static host (Cloudflare Pages, Netlify, Vercel).
- API: Render free web service. It spins down after 15 minutes idle and takes about a minute to wake, has no persistent disk, and gives 750 free instance hours a month. Fly.io no longer has a free tier for new organizations.
- Database: Neon Free. Compute scales to zero after 5 minutes and cannot be turned off. Its FAQ (updated 3 Nov 2026) lists 100 CU-hours a month and 1 GB storage per project; some older pages show 0.5 GB, so confirm the current numbers.
- **Consequences to design for:** the first request after idle can wait a minute for the API plus a database wake. Use skeleton screens and retry with backoff on first load. A sleeping server runs nothing, so scheduled syncs must be triggered by an external cron (for example GitHub Actions) calling a protected endpoint. Do not keep the database awake all day, because that burns the free compute hours.
- Move to a small paid host or managed tier when real users arrive.

**Alternatives considered**

- Python + FastAPI: a familiar language, but it loses the shared types and the shared engine in the browser.
- Rust (Axum) backend: a great fit for the engine, but it slows the first milestone and doubles the tooling. Revisit later.
- Next.js full-stack: workable, but this is a logged-in app, and Vite keeps frontend, backend and engine cleanly separated.
- Supabase or Firebase: quick to start, but merge and commit logic needs server-side transactions you fully control.

## 3. Repository layout

```
phrenia/
  apps/web/                 React SPA
  apps/api/                 Hono server and workers
  packages/shared/          Zod schemas, types, constants (roles, statuses)
  packages/planning-engine/ pure TS: diff, merge, conflicts, scheduling rules
  packages/ui/              tokens and base components (optional at first)
```

## 4. Data model

**Rules:** ids are UUIDv7. Timestamps are timestamptz in UTC. Dates shown to users follow the user's timezone. A date-only deadline is stored as a date with `is_date_only = true`. Mutable rows carry a `version` integer for optimistic concurrency.

**Identity and access**

- `users`, `user_settings` (timezone, week start, pomodoro lengths, notification choices, `ai_permissions` jsonb).
- `workspaces` (owner), `workspace_members` (role: owner, editor, viewer), `invites` (email, role, status, expiry).
- `projects` (workspace, name, status active or archived, `use_sprints`, `use_story_points`), `project_access` (project, user).

**Planning (versioned, like git trees)**

- `tasks`: identity only. id, project, title, description, source (manual or canvas), created\_by. Title and description edits are not versioned.
- `task_plan_versions`: immutable. `fields` jsonb holds deadline, `is_date_only`, window start and end, planned minutes, estimate, story points, priority, `priority_locked`, assignee, depends\_on, `in_plan`, and the subtask structure (id, title, estimate, assignee). A `content_hash` with a unique (task, hash) lets identical versions be shared.
- `commits`: immutable. `parent_ids` (one parent, or two for a merge), author, message, and `plan` = a small map of task id to plan version id, plus a `changes` summary for the UI.
- `branches`: name, description, creator, `base_commit_id`, `head_commit_id`, status (active, merged, abandoned), merged commit. Main is the default branch. The head moves by compare-and-swap inside a transaction.
- Why this shape: a commit stores only a map to shared immutable versions, so storage stays small (important on a 1 GB database) and a diff compares two maps.

**Execution (never versioned)**

- `execution_state` (task, status: backlog, planned, in\_progress, review, done), `subtasks` and `subtask_state` (done\_at).
- `pomodoro_sessions` (user, task, optional subtask, planned seconds, started\_at, ended\_at, paused seconds, status running, completed, interrupted or cancelled, note). A partial unique index allows one running session per user.
- `evidence` (project, task, kind: pomodoro, subtask\_done, note, document\_activity, coding\_time; source: phrenia, integration, manual; actor, occurred\_at, body jsonb, external\_ref, `undone_at`).

**Agile:** `sprints`, `sprint_tasks` (added\_at, removed\_at, points at the time, so burndown shows scope changes), `user_stories` and links.

**Sprint rule:** sprint membership and dates are project-level. A branch cannot change which sprint a task belongs to, not even implicitly. Moving a task between sprints is an explicit action in Backlog or Sprints, applies to every branch, and is recorded in the audit log and in the sprint scope history. The planning engine only warns when a branch schedules a task outside its sprint's dates.

**Integrations:** `integrations` (owner, provider, status, scopes, encrypted token, key id, last sync, settings), `external_objects` (unique on integration and external id, content hash, status active or missing), `sync_runs` (counts, cursor, error), `integration_mappings` (WakaTime project to task, document to task).

**AI and audit:** `ai_suggestions` (kind, requester, decision open, accepted, modified or rejected, data scopes used, output, whether full input is stored), `audit_log` (actor, action, target, before, after).

## 5. Planning engine

**Pure functions**

- `diffPlans(a, b)`: field changes per task.
- `threeWayMerge(base, ours, theirs)` returns the merged plan and a list of conflicts.
- `applyResolutions(merge, choices)`.
- `findSchedulingConflicts(plan, busyIntervals, members)`.

**Merge rules**

- Go through every task id in base, ours and theirs.
- Only one side changed: take that side. Both made the same change: take it.
- Both changed different fields: combine field by field.
- Both changed the same field to different values: a field conflict.
- One side removed the task from the plan and the other edited it: an edit-versus-delete conflict.
- MVP simplification: dependencies and the subtask list are each treated as one field.
- A merge always creates a merge commit with parents \[target head, source head\], even when it could fast-forward, because the spec records who merged.
- Nothing is written until every conflict is resolved. The write is one transaction. If the target head moved meanwhile, recompute the merge.

**Scheduling conflicts** (warnings, never automatic fixes)

- Overlapping windows for the same assignee, unless a task is marked as parallel.
- A task scheduled before the task it depends on finishes.
- A window that ends after its deadline.
- A window that overlaps a Google Calendar busy interval.

**Invariants to test**

- Commits are immutable and task ids are stable across branches.
- Viewing an old commit or merging never changes execution state or evidence.
- Removing a task from a plan is not deleting the task.
- Merging a branch with itself changes nothing, and merge(base, A, base) equals A.

**Required cases:** same field on both sides, different fields, delete versus edit, tasks added on both branches, two merges racing, merging twice, branching from an old commit.

## 6. API

REST under `/api/v1`, JSON, session cookie authentication.

**Cross-cutting rules**

- Every route checks workspace membership, project access and role. An id in a URL is never trusted by itself.
- `Idempotency-Key` on creating tasks from Canvas, starting or finishing a Pomodoro, and merging.
- Updates use `ETag` with `If-Match`. A stale write returns 412 with the current data, so the client can reload or resolve.
- History, evidence and activity use cursor pagination. Errors use problem+json.

**Groups**

- Auth, me and settings. Workspaces, members, invites. Projects and project settings.
- Tasks, subtasks, status changes, dependencies.
- Plan: list branches, create a branch from a commit, read a branch's plan, post a commit (changeset), list commits, `compare?source&target` (diff plus conflicts), `merge` (with resolutions).
- Sprints, stories, burndown.
- Pomodoro: start, pause, resume, finish, cancel, and read the current session.
- Evidence: list, add a note, undo an integration entry.
- Integrations: list, start OAuth, callback, disconnect, change settings, sync now, mappings.
- AI: estimate, prioritize, explain conflict, draft branch, and record a decision on a suggestion.
- Activity feed and read state. Data export.

## 7. Screens (the 12 mockup boards)

1. **Timeline** `/p/:id/timeline`: branch lanes on one date axis (cap the visible lanes), today marker, bars for windows, diamonds for deadlines, quick-add (`@assignee #date ~estimate !priority`), ask-ai button. Moving a bar is a commit. Keyboard and menu alternatives for every drag.
2. **Kanban**: columns by execution status. Filters for branch, sprint and assignee. Tasks outside the viewed plan show as ghosts. A status change is an execution update, never a commit. Shortcuts j, k, m, p.
3. **Backlog**: tasks not in the plan, planned into a sprint or the timeline, with a Canvas change notice.
4. **Compare and merge**: engine diff drawn as mini timelines per task, a vertical commit graph, labeled radio groups for conflicts, merge disabled until resolved, scheduling warnings after.
5. **Sprints**: schedule strip, history, retrospective, burndown in points or task count, with scope changes shown.
6. **Pomodoro**: a full-screen timer, click anywhere or press space to start, a dot carousel for work and break phases. The server owns the start time, so a closed app recovers. One running timer per user.
7. **Activity**: an inbox list with unread state per user, labels, and sources.
8. **Task detail**: subtasks, evidence, plan history, and deadline, window and duration shown as three separate values. Priority can be locked.
9. **AI planner**: a chat with structured cards (draft branch, estimate), accept, modify and reject, data-access toggles, and a suggestion log.
10. **Integrations**: one screen for connections, their settings and the evidence they produce (see section 8).
11. **Members**: roles, invites, project access, transfer of ownership.
12. **Settings**: account, time and dates, Pomodoro lengths, notifications, project options, and data and privacy.

**Every screen:** the shared nav, visible focus, 12px minimum text, 24px minimum targets, and a clear statement of which branch scope is being shown.

## 8. Integrations

**Common:** one adapter interface (connect, refresh, disconnect, sync from a cursor, map objects). Tokens are encrypted with AES-256-GCM using a key from the environment, with a key id for rotation, and are never logged. Syncs run as pg-boss jobs with exponential backoff on 429 and 5xx. Objects are upserted by (integration, external id), so a repeated sync never duplicates. Every run is recorded. One failing adapter must not affect the others.

**Canvas**

- OAuth 2.0 through a Developer Key; a personal token only for the pilot, if the school allows it.
- Courses, assignments and quizzes with link-header pagination. Store the external id and a content hash.
- If Canvas changes something the user edited, apply the user's rule (ask, keep mine, use Canvas). If an assignment disappears, mark the task as missing upstream and keep it.
- Read-only. Grades and weights are stored only with permission.
- **Milestone 0 must prove access on at least one real Canvas instance**, because it depends on the school's settings.

**Google Docs (monitoring)**

- Use Google Picker with the `drive.file` scope. It is non-sensitive and gives access only to the files the user picks.
- Read the last modified time and revision count, never the content. Aggregate into one document-activity evidence entry per document per day.
- While the consent screen is in testing mode there is a 100-user cap. Broader Drive scopes bring verification and possibly a security assessment, so avoid them.

**WakaTime**

- OAuth 2.0 with the `read_summaries` scope only. Do not request raw heartbeats.
- Read daily summaries per project, a few times a day. The documented default limit (under 10 requests per second averaged over 5 minutes) is not a concern at this scale. Confirm scopes and limits on WakaTime's own developer page.
- Map a WakaTime project to a task. Unmapped time becomes a suggestion to attach, never an automatic guess.

**Google Calendar (optional):** FreeBusy, read-only.

**Evidence from integrations** is always labeled with its source, can be undone, and never changes status or progress.

## 9. AI service

- A provider interface: `generate(promptId, input, schema)` returns validated JSON. The provider stays swappable.
- Pipeline: check the user's AI permissions, build the smallest possible input (no names or emails, no unpermitted fields), call the model, validate with Zod, save an `ai_suggestions` row, return the suggestion. The AI never writes a plan.
- **Draft branch:** the AI returns a changeset proposal kept in the suggestion. Only Accept creates a real branch and commit, authored by the user.
- **Estimate:** minutes with a range, steps, assumptions and confidence. It says plainly when there is no history.
- **Conflict explanation:** the engine finds the conflict. The model only words it.
- **Priority:** respects locked priorities.
- Per-user daily limits. Every core screen must work when AI is down.

**AI provider decision**

- There is no AI budget, so the AI runs on free tiers only. The paid-tier plan is dropped.
- What the free tiers mean: Google's free Gemini API tier is meant for testing, with lower limits, and content sent on it is used to improve Google products. NVIDIA's free API (build.nvidia.com) runs under API Trial Terms: NVIDIA staff describe trial use as prototyping, research, development, testing and learning, and say production use needs a paid license. A forum post quoting the terms says prompts may be used to improve NVIDIA products, so confirm that in the terms. Reports put NVIDIA's default limit at about 40 requests per minute.
- Fit: Google's free tier suits a small pilot better. NVIDIA's trial terms fit a deployed app poorly, so use NVIDIA's free API for development with synthetic data only.
- Keep the privacy promise through explicit opt-in. AI is off by default. Turning it on shows who processes the data, that the free tier may use prompts to improve its products, and exactly which fields are sent. The per-feature toggles for what AI can see stay. Without consent nothing leaves the app.
- Send the minimum: task titles, deadlines and estimates only, with no names or emails, no Canvas grades, no document text and no source code unless the user turns more on.
- Free means limits: per-user and per-team daily caps, caching of repeated requests, retry with backoff on 429, and a clear message when the quota runs out while the rest of the app keeps working.
- Other zero-cost routes if a free tier goes away (not yet researched): each user brings their own free API key, or runs a small model on their own machine.
- Build one adapter for OpenAI-compatible endpoints (NVIDIA's API is of this type) and one small adapter for the Gemini API.

## 10. Security and privacy

- httpOnly, SameSite cookies, CSRF protection, and OAuth state with PKCE.
- One central `can(user, action, resource)` policy. Every query is scoped by project membership. Write tests that try to read another project's data by changing ids.
- Secrets in the environment only. Rate limits on login and AI routes.
- Audit log for task edits, merges, role changes, and connecting or disconnecting a service.
- Data minimization as in section 8. AI data scopes follow the settings screen. Full AI inputs are off by default.
- Data export as a background job. Account deletion removes personal data and leaves shared project content attributed to a deleted user.
- Before the pilot, re-read the terms of the AI provider and of each connected service, because they change.

## 11. Rules carried over from the design

- Monospace UI, palette and spacing from tokens. Text at least 12px, targets at least 24px, a 2px focus outline.
- Never meaning by color alone, never faded text. Contrast at least 4.5 to 1.
- Every drag has a menu or keyboard alternative. Active nav uses `aria-current`. Radio groups have labels. Icon buttons have `aria-label`.
- AI output is visually distinct (dashed) and never styled as confirmed.

## 12. Testing

- **Engine:** unit and property tests, including the invariants in section 5.
- **API:** integration tests against a real Postgres, access tests, and concurrency tests (two merges, two edits).
- **Integrations:** recorded fixtures and contract tests for pagination, 429, token expiry and repeated sync.
- **End to end:** Playwright for the scenarios in spec section 16.8, plus an axe accessibility check on every screen.

## 13. Build order

Capacity: five people sharing about one hour a day, so 5 team-hours a week. If all five work during that hour it is up to 25 person-hours a week; if 5 person-hours is the total, everything below takes five times longer. Sizes are rough guesses for a moderately experienced team and can be off by half or more: S is about 10 person-hours, M about 25, L about 50.

The cut-line product below is about 200 person-hours: roughly 8 to 9 weeks if five people work in parallel, or about 40 weeks at 5 person-hours a week.

Suggested ownership so people can work in parallel:

- Engine and merge: one person (steps 2 and 3).
- Database, auth and API: one person (steps 1 and 5).
- Web shell, timeline and quick-add: one person.
- Kanban, task detail, Pomodoro and evidence: one person (step 4).
- Integrations and AI: one person (steps 6 and 7), starting after step 3.

0. **Spike (S to M):** engine prototype on JSON fixtures, a clickable timeline, proof of Canvas access on a real instance, proofs for WakaTime and Picker, pick the auth library, choose the AI path.
1. **Foundation (M):** monorepo, CI, auth, workspaces, projects, members, schema and migrations, tokens, nav shell.
2. **Planning core (L):** tasks, plan versions, commits, branches, timeline lanes, quick-add.
3. **Merge (L):** compare, conflicts, merge commit, commit graph, scheduling warnings.
4. **Execution (M):** Kanban, task detail, subtasks, server-side Pomodoro, evidence, activity.
5. **Collaboration (S to M):** invites, roles, optimistic concurrency, audit.
6. **Integrations (L):** the Integrations screen with Canvas first, then Docs and WakaTime, Calendar last.
7. **AI (M):** provider interface, estimate, priority, conflict explanation, draft branch, suggestion log.
8. **Agile (S to M):** backlog to sprint, burndown, retrospective.
9. **Settings, export, hardening, pilot (M).**

**Cut line if time is short:** steps 1 to 5 plus Canvas and Pomodoro make a usable product. AI and Agile come last, as the spec says.

## 14. Decisions

- **Decided:** a team of five sharing about one hour a day; Better Auth for sign-in; sprint membership is project-level and a branch cannot change it implicitly; no under-18 policy; AI on free tiers only (no budget): Google's free Gemini tier for the pilot with explicit opt-in and AI off by default, NVIDIA's free API for development with synthetic data only.
- **Open:** the capacity reading (up to 25 person-hours a week, or 5 in total). It only matters when choosing the build order, not for design or spec work.
- **Open:** merge granularity for subtasks and dependencies, whole field or set.
- **Open:** hosting after the pilot.
- **Open:** Git commit evidence was dropped in the amendment; confirm it stays out.
