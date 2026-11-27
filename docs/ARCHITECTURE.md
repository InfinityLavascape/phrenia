# Architecture (step 0)

## Packages and who may import what

- `shared`: no dependencies on other packages.
- `planning-engine`: pure, depends on nothing. Used by the server and, later, by the browser.
- `ai-core`: depends on `shared`. Used by the server and by the browser.
- `apps/api` and `apps/web` depend on the packages, never on each other.

## Where AI runs

Prompt building, the permission gate and output validation live in `ai-core`, so the same code runs in two places.

1. **Prepare (server).** The browser asks the API for a suggestion. The API checks the user's AI permissions, builds the smallest allowed input (`minimizeInput`) and says which provider to use.
2. **Run.**
   - Cloud provider (free tier, opt-in): the server calls it.
   - Local model (Ollama): the browser calls `http://localhost:11434` itself, because a hosted server cannot reach a user's machine.
3. **Record (server).** The browser sends the validated result back. The server stores the suggestion and later the user's decision. The AI never writes a plan.

## Local models

Ollama is the installer and the model manager; Phrenia does not build its own. The planned setup panel (step 8) does four things through Ollama's own API:

1. Detect Ollama (`detectOllama`).
2. Show the one-time Windows command that lets the site reach Ollama: `setx OLLAMA_ORIGINS "<site address>"`, then restart Ollama.
3. Offer a level (Light, Standard, Strong) mapped to a model tag (`LOCAL_MODEL_PRESETS`; Gemma 4 first, Qwen 3.5 as the alternative), or any tag the user types.
4. Download with progress (`pullModel`), list and remove (`detectOllama`, `deleteModel`).

All preset tags must be confirmed with `ollama pull` in step 0. LM Studio and similar tools work through the OpenAI-compatible provider.

## Not built yet

Real schema and migrations (step 1), auth routes (step 1), plan versions and commits (step 3), everything else in the spec.
