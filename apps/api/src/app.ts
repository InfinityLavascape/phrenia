import { Hono } from "hono";
import { LOCAL_MODEL_PRESETS } from "@phrenia/ai-core";
import { defaultAiPermissions } from "@phrenia/shared";

export function createApp() {
  const app = new Hono();

  app.get("/health", (c) => c.json({ ok: true, name: "phrenia-api", version: "0.0.0" }));

  // Which AI paths exist. AI is off by default for everyone; nothing is sent until the user opts in.
  app.get("/api/v1/ai/providers", (c) =>
    c.json({
      defaultPermissions: defaultAiPermissions(),
      kinds: ["local-ollama", "openai-compatible", "gemini"],
      localPresets: LOCAL_MODEL_PRESETS,
    }),
  );

  return app;
}
