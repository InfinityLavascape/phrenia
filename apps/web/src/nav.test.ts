import { describe, expect, it } from "vitest";
import { tabFromHash } from "./nav";

describe("tabFromHash", () => {
  it("reads known tabs", () => {
    expect(tabFromHash("#/kanban")).toBe("kanban");
    expect(tabFromHash("#settings")).toBe("settings");
  });
  it("falls back to the timeline for anything else", () => {
    expect(tabFromHash("")).toBe("timeline");
    expect(tabFromHash("#/nope")).toBe("timeline");
  });
});
