import { describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("api", () => {
  it("answers the health check", async () => {
    const res = await createApp().request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });
  it("reports AI as off by default and lists local model presets", async () => {
    const res = await createApp().request("/api/v1/ai/providers");
    const body = (await res.json()) as { defaultPermissions: { enabled: boolean }; localPresets: { tag: string }[] };
    expect(body.defaultPermissions.enabled).toBe(false);
    expect(body.localPresets.map((p) => p.tag)).toContain("gemma4:e4b");
  });
});
