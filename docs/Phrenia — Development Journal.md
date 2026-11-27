# Phrenia — Development Journal

A running record of every update to Phrenia: design, specification and, later, code. One entry per update, oldest first, newest at the bottom. Every entry has the task, the date, what was done, what was implemented and how, the purpose, and a link to evidence.

The entries for 25 to 27 Nov 2026 were written after the fact from the project history. The date is the day the work was saved, so correct any date that is off.

## Entries

### 2026-11-25 · First Phrenia spec and early mockups

- **Task:** Define Phrenia's first concept (layered timeline) and mock it up.
- **Date:** 25 Nov 2026
- **What was done:** A first written spec (Layered Timeline, Kanban with Backlog/Ready/Doing/Done, analytics, a Gemini-powered AI assistant) was personalized as Phrenia, followed by a v0.2 spec document and four UI mockups.
- **What was implemented, and how:** Documents and mockups only, no code. The detailed contents of this early iteration were not recorded in this journal.
- **Purpose:** Give the product a name, a brand and core values (minimalist, professional, intuitive, accessible for students), and make the vague UI concept concrete.
- **Evidence:** No link on file for this early iteration. It was superseded by the v1.0 spec below.

### 2026-11-25 · Product & System Specification v1.0

- **Task:** Replace the layered-timeline concept with the full product specification.
- **Date:** 25 Nov 2026
- **What was done:** A complete specification (in Vietnamese) was added to the project. It defines the Branchable Timeline (branch, commit, three-way merge), Kanban, Pomodoro with Progress Evidence, integrations (Docs, VS Code, Canvas, optional Calendar), human-controlled AI, optional Agile, team roles, architecture, risks and a milestone roadmap.
- **What was implemented, and how:** A specification document only. Key rules: planning data is versioned per branch while status, Pomodoro and evidence are project-level; focus time never counts as completion; AI only suggests.
- **Purpose:** Set Phrenia apart from calendar apps and define the MVP, its acceptance criteria and its build order.
- **Evidence:** Project file `writing-block.md` in the Phrenia project.

### 2026-11-26 · Timeline screen mockup

- **Task:** Mock up the main Timeline screen in the style of the user's "homework" app.
- **Date:** 26 Nov 2026
- **What was done:** The first screen of a new UI mockup was designed and published as a design canvas.
- **What was implemented, and how:** One HTML board using a monospace font, a pale lavender-white background and hairline borders. It has a quick-add input (shorthand for assignee, date, estimate, priority), three branch lanes (main, exam-week, split-geo) on one date axis, bars for planned windows, diamonds for deadlines, a today line, a merge-conflict strip, an AI suggestion strip with accept, modify and reject, task lists and a log.
- **Purpose:** Test whether the minimalist style stays readable on a dense screen, and show the spec's Branch Lanes view.
- **Evidence:** [Phrenia mockup canvas (Timeline board)](https://claude.ai/artifact/At9TV1hs8Fus8XakJU2REL)

### 2026-11-26 · Kanban and Backlog mockups

- **Task:** Design the Kanban and Backlog screens with a different layout from the Timeline.
- **Date:** 26 Nov 2026
- **What was done:** Two more boards were added with the same header and navigation.
- **What was implemented, and how:** Kanban has five status columns with cards showing subject, date, assignee and subtask progress, plus filters, ghost cards for tasks outside the viewed plan, and a keyboard shortcut box. Backlog is a two-pane planning view with a dense task list grouped by source and a Canvas change notice.
- **Purpose:** Show that status is shared across branches while plans differ, and give a keyboard alternative to drag and drop.
- **Evidence:** [Phrenia mockup canvas (Kanban and Backlog boards)](https://claude.ai/artifact/At9TV1hs8Fus8XakJU2REL)

### 2026-11-26 · Compare and merge screen

- **Task:** Design the branch comparison and merge screen.
- **Date:** 26 Nov 2026
- **What was done:** A first version used a three-way table. After feedback that tables are unintuitive for students, it was rebuilt.
- **What was implemented, and how:** Each changed task is drawn like on the timeline, with rows for base, main, the branch and the result. Conflicts are labeled radio groups. A narrow left column holds the tasks and a vertical commit graph sits on the right, showing the base commit and a pending merge. The merge button stays disabled until all conflicts are resolved, and scheduling warnings appear after.
- **Purpose:** Make Git-style merging understandable without Git knowledge, and show the spec's rule that conflicts are never resolved automatically.
- **Evidence:** [Phrenia mockup canvas (Compare and merge board)](https://claude.ai/artifact/At9TV1hs8Fus8XakJU2REL)

### 2026-11-26 · Sprints and Activity screens

- **Task:** Add the Sprints and Activity tabs and remove overlap with Backlog.
- **Date:** 26 Nov 2026
- **What was done:** Sprints was first too similar to Backlog, so the two were separated. Activity was restyled after feedback.
- **What was implemented, and how:** Backlog now only plans tasks into sprints. Sprints shows a day-by-day schedule of the next sprint, history, retrospectives and a burndown with scope changes. Activity became a Gmail-style inbox list with labels, unread state and source tags.
- **Purpose:** One clear job per tab, and an activity view that students already know how to read.
- **Evidence:** [Phrenia mockup canvas (Sprints, Activity and Backlog boards)](https://claude.ai/artifact/At9TV1hs8Fus8XakJU2REL)

### 2026-11-26 · Pomodoro as its own tab

- **Task:** Make the Pomodoro timer prominent.
- **Date:** 26 Nov 2026
- **What was done:** The small timer box was removed from the Timeline and a dedicated screen was added.
- **What was implemented, and how:** A very large timer, a horizontal carousel of filled and hollow dots for work and break phases, and no start button: click anywhere (or press space) to start. A "pomodoro" tab was added to the navigation of every screen.
- **Purpose:** The timer felt invisible inside the Timeline, and a full-screen timer supports focus.
- **Evidence:** [Phrenia mockup canvas (Pomodoro board)](https://claude.ai/artifact/At9TV1hs8Fus8XakJU2REL)

### 2026-11-26 · Accessibility and consistency pass

- **Task:** Review the whole mockup and fix inconsistencies and accessibility problems.
- **Date:** 26 Nov 2026
- **What was done:** The mockup was rated about 7.5 out of 10 and fixed.
- **What was implemented, and how:** Faded low-contrast text replaced by flat grey styles; a visible checked state for checkboxes; text raised to at least 12px; buttons at least 24px tall; a visible focus outline; active navigation marked with `aria-current`; labeled radio groups; keyboard start for Pomodoro. Data contradictions were fixed (conflict counts, branch changes, who created a branch, the sprint filter).
- **Purpose:** Meet the spec's accessibility requirements and keep the sample data consistent across screens.
- **Evidence:** [Phrenia mockup canvas (all boards)](https://claude.ai/artifact/At9TV1hs8Fus8XakJU2REL)

### 2026-11-26 · Task detail and AI planner screens

- **Task:** Mock the screens that hold evidence and AI suggestions.
- **Date:** 26 Nov 2026
- **What was done:** Two boards were added, and an "ask ai" button was added to the Timeline.
- **What was implemented, and how:** Task detail shows status, subtasks, an evidence feed labeled by source, plan history, and deadline, planned window and planned duration as three separate values, with a lock on priority. The AI planner is a chat with a dashed draft-branch card (accept, modify, reject), an estimate card that separates focus time from calendar time, toggles for what the AI can see, and a suggestion log.
- **Purpose:** Show evidence as activity rather than completion, and keep AI suggestions clearly separate from confirmed plans.
- **Evidence:** [Phrenia mockup canvas (Task detail and AI planner boards)](https://claude.ai/artifact/At9TV1hs8Fus8XakJU2REL)

### 2026-11-26 · Integrations become monitoring only; spec amendment v1.1

- **Task:** Correct a misunderstanding about integrations and update the spec.
- **Date:** 26 Nov 2026
- **What was done:** Screens for a Google Docs add-on and a VS Code extension had been built by mistake. They were removed from the design, WakaTime replaced VS Code, and the spec was amended.
- **What was implemented, and how:** One Integrations screen manages Canvas, Google Docs, WakaTime and Calendar connections, their settings, and the evidence they produce (with undo and an attach suggestion). A separate amendment document lists the spec sections to change. Evidence labels and sample data on other screens were updated, and an "integrations" tab was added.
- **Purpose:** Integrations only watch and record activity. They are not screens of the app, and status stays editable only inside Phrenia.
- **Evidence:** [Spec Amendment v1.1](https://claude.ai/artifact/NcMdmrfgG3Xtm3fJfsDeZN) and [mockup canvas (Integrations board)](https://claude.ai/artifact/At9TV1hs8Fus8XakJU2REL)

### 2026-11-26 · Members and permissions screen

- **Task:** Mock team management.
- **Date:** 26 Nov 2026
- **What was done:** A members board and a "members" tab were added.
- **What was implemented, and how:** Invite by email with a role, a member list with role toggles and remove, pending invites, project access, transfer of ownership, plain-list descriptions of the owner, editor and viewer roles, and notes on merges and privacy between members.
- **Purpose:** Cover the spec's Owner, Editor and Viewer model for groups of three to five people.
- **Evidence:** [Phrenia mockup canvas (Members board)](https://claude.ai/artifact/At9TV1hs8Fus8XakJU2REL)

### 2026-11-26 · Settings and data privacy screen

- **Task:** Mock settings and the privacy controls.
- **Date:** 26 Nov 2026
- **What was done:** A settings board and a "settings" tab were added. The Pomodoro running and break states were deliberately postponed until coding starts.
- **What was implemented, and how:** Sections for account, time and dates, Pomodoro lengths, notifications and project options, plus a data and privacy section: what AI can see, what is kept, what each connection holds, export and delete. Download and delete rows, and the notification options, are additions beyond the spec.
- **Purpose:** Let users decide what leaves Phrenia, as the spec's privacy principles require.
- **Evidence:** [Phrenia mockup canvas (Settings board)](https://claude.ai/artifact/At9TV1hs8Fus8XakJU2REL)

### 2026-11-27 · Development specification v1.0

- **Task:** Turn the spec and mockups into a development specification, including the technology stack.
- **Date:** 27 Nov 2026
- **What was done:** A development spec was written and current limits of the proposed services were checked.
- **What was implemented, and how:** It covers scope, a stack (React, TypeScript, Vite, Hono, PostgreSQL with Drizzle, pg-boss, a pure planning-engine package), a repository layout, a versioned data model (commits as maps to shared immutable plan versions), merge rules, an API outline, the 12 screens, integrations, the AI service, security, testing, a build order and open decisions. Findings: Gemini's free tier uses content to improve Google products and its terms reportedly require users to be 18 or older; Render's free service sleeps after 15 minutes; Fly.io has no free tier for new organizations; Neon Free scales to zero; Google Picker with the `drive.file` scope avoids restricted Drive scopes.
- **Purpose:** Give a buildable plan that fits free hosting and the spec's privacy promises, and flag the decisions still open.
- **Evidence:** [Phrenia Development Specification v1.0](https://claude.ai/artifact/5zUy5TjGCcXPPDSZngLENd)

### 2026-11-27 · Development journal created

- **Task:** Start this journal.
- **Date:** 27 Nov 2026
- **What was done:** This document was created and the earlier work was written up as entries.
- **What was implemented, and how:** A single document with one entry per update. A new entry is appended at the bottom each time Phrenia is updated.
- **Purpose:** Keep a dated, linkable history of what changed, how and why.
- **Evidence:** This document, and the links in the entries above.

### 2026-11-27 · Development decisions: capacity, auth, AI provider, sprints

- **Task:** Settle the open decisions in the development specification.
- **Date:** 27 Nov 2026
- **What was done:** The team answered the open questions, and the development spec was updated to match. Two research checks were made: the terms of NVIDIA's free API, and Better Auth's fit with the stack.
- **What was implemented, and how:** The spec now records a team of five sharing about one hour a day, with a rough size estimate (the cut-line product is about 200 person-hours, 8 to 9 weeks at 25 person-hours a week, or about 40 weeks at 5) and a suggested split of ownership. Better Auth was chosen for sign-in. AI goes through an OpenAI-compatible adapter plus a Gemini adapter: NVIDIA's free API for development with synthetic data only, and Google's paid tier with a monthly budget cap for the pilot, because both free tiers are trial-grade. Sprint membership is project-level and a branch cannot change it implicitly; moves are explicit and affect every branch. The under-18 policy was dropped. The decisions section was rewritten as decided and still open.
- **Purpose:** Remove blockers before coding starts and keep the plan realistic for the available hours and the privacy promises.
- **Evidence:** [Phrenia Development Specification v1.0](https://claude.ai/artifact/5zUy5TjGCcXPPDSZngLENd), sections 2, 4, 9, 10, 13 and 14.

### 2026-11-27 · AI provider plan changed to free tiers only

- **Task:** Revise the AI provider plan after learning there is no AI budget.
- **Date:** 27 Nov 2026
- **What was done:** The paid-tier plan from the previous entry was dropped, and the AI section and the decisions list of the development spec were rewritten.
- **What was implemented, and how:** The spec now plans for free tiers only: Google's free Gemini tier for the pilot and NVIDIA's free API for development with synthetic data, because NVIDIA's trial terms fit a deployed app poorly. The spec's privacy promise is kept through explicit opt-in: AI is off by default, turning it on discloses the provider and that the free tier may use prompts to improve its products, and only task titles, deadlines and estimates are sent unless the user allows more. It also plans per-user daily caps, caching, retry on 429, and a clear message when quota runs out. The budget-cap question was removed from the open list.
- **Purpose:** Keep AI at zero cost without breaking the promise that user data is not used for training without clear consent.
- **Evidence:** [Phrenia Development Specification v1.0](https://claude.ai/artifact/5zUy5TjGCcXPPDSZngLENd), sections 9 and 14.
