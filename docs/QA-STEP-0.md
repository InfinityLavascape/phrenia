# QA checklist: step 0 scaffold

Run these on your Windows machine, in Firefox. Report each item as pass or fail, with a note or screenshot for any fail. Please also tell me your Node version (`node -v`) and Windows version.

## A. Setup and automated checks

1. Unzip, open PowerShell in the `phrenia` folder, run `pnpm install`.
   Expected: finishes without errors. (If it stops with `ERR_PNPM_IGNORED_BUILDS`, run `pnpm approve-builds esbuild`, then `pnpm install` again, and tell me it happened.)
2. `pnpm typecheck`. Expected: no errors.
3. `pnpm test`. Expected: every package passes. Counts: planning-engine 14, shared 4, ai-core 12, api 5, web 2 (37 tests).
4. `pnpm build`. Expected: succeeds and creates `apps\web\dist`.

## B. The running app

5. `pnpm dev`. Expected: the API says it is listening on port 8787 and Vite shows port 5173.
6. Open http://localhost:5173 in Firefox. Expected: nine tabs (timeline, kanban, backlog, sprints, pomodoro, activity, integrations, members, settings); "timeline" is underlined.
7. Click every tab. Expected: the page heading changes, the address bar shows `#/<tab>`, and the clicked tab is the underlined one. Reload on `#/settings`: it stays on settings.
8. Press Tab from a fresh page. Expected: a "Skip to content" link appears first, then each tab shows a visible outline.
9. Open http://localhost:8787/health. Expected: JSON with `"ok":true`.
10. Open http://localhost:8787/api/v1/ai/providers. Expected: `"enabled":false` and the three local model levels.

## C. Local model check (optional, but tells me whether the idea works for you)

11. Install Ollama for Windows. In PowerShell run `setx OLLAMA_ORIGINS "http://localhost:5173"`, close PowerShell, quit Ollama from the tray, and start it again.
12. `ollama pull gemma4:e2b`. Expected: downloads. Tell me if the tag does not exist, and try `ollama pull gemma4`. Also try `ollama pull qwen3.5:0.8b` and report.
13. With the app open in Firefox, open the console (F12) and run:
    `fetch('http://localhost:11434/api/tags').then(r => r.json()).then(console.log)`
    Expected: a list that includes the model. If you see a CORS error, copy it to me. This is the most important result in this section.

## D. Accounts (don't create anything yet)

14. Tell me which of these you can get: a Google account for a Google Cloud project, a WakaTime account, access to a Canvas course through your school. I will ask for exact settings in step 1.
