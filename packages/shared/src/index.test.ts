import { describe, expect, it } from "vitest";
import { AiPermissions, NAV_TABS, PlanFields, defaultAiPermissions } from "./index";

describe("shared schemas", () => {
  it("AI is off by default and every field is off", () => {
    const p = defaultAiPermissions();
    expect(p.enabled).toBe(false);
    expect(Object.values(p).every((v) => v === false)).toBe(true);
  });
  it("plan fields get safe defaults", () => {
    const f = PlanFields.parse({});
    expect(f.inPlan).toBe(true);
    expect(f.dependsOn).toEqual([]);
    expect(f.priorityLocked).toBe(false);
  });
  it("rejects unknown ai permission types", () => {
    expect(() => AiPermissions.parse({ enabled: "yes" })).toThrow();
  });
  it("keeps the mockup tab order", () => {
    expect(NAV_TABS[0]).toBe("timeline");
    expect(NAV_TABS.at(-1)).toBe("settings");
  });
});
