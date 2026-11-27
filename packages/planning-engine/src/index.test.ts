import { describe, expect, it } from "vitest";
import { applyResolutions, diffPlans, findSchedulingConflicts, threeWayMerge, type Plan } from "./index";

const base: Plan = {
  geo: { deadline: "2026-12-12", windowStart: "2026-12-03", windowEnd: "2026-12-12", priority: "p2", assigneeId: "you" },
  esl: { deadline: "2026-12-01", plannedMinutes: 180 },
  poster: { plannedMinutes: 120 },
};

describe("threeWayMerge", () => {
  it("takes the only side that changed", () => {
    const theirs: Plan = { ...base, esl: { ...base.esl!, plannedMinutes: 240 } };
    const r = threeWayMerge(base, base, theirs);
    expect(r.conflicts).toEqual([]);
    expect(r.merged.esl!.plannedMinutes).toBe(240);
  });
  it("combines changes to different fields of one task", () => {
    const ours: Plan = { ...base, geo: { ...base.geo!, priority: "p1" } };
    const theirs: Plan = { ...base, geo: { ...base.geo!, assigneeId: "minh" } };
    const r = threeWayMerge(base, ours, theirs);
    expect(r.conflicts).toEqual([]);
    expect(r.merged.geo).toMatchObject({ priority: "p1", assigneeId: "minh" });
  });
  it("flags the same field changed to different values", () => {
    const ours: Plan = { ...base, geo: { ...base.geo!, deadline: "2026-12-14" } };
    const theirs: Plan = { ...base, geo: { ...base.geo!, deadline: "2026-12-17" } };
    const r = threeWayMerge(base, ours, theirs);
    expect(r.conflicts).toHaveLength(1);
    expect(r.conflicts[0]).toMatchObject({ kind: "field", taskId: "geo", field: "deadline" });
  });
  it("does not flag the same change on both sides", () => {
    const both: Plan = { ...base, geo: { ...base.geo!, deadline: "2026-12-14" } };
    expect(threeWayMerge(base, both, both).conflicts).toEqual([]);
  });
  it("flags edit versus delete, and removes an untouched deleted task", () => {
    const { poster, ...withoutPoster } = base;
    const edited: Plan = { ...base, poster: { plannedMinutes: 180 } };
    const r = threeWayMerge(base, edited, withoutPoster);
    expect(r.conflicts[0]).toMatchObject({ kind: "edit_delete", taskId: "poster", deletedBy: "theirs" });
    const clean = threeWayMerge(base, base, withoutPoster);
    expect(clean.conflicts).toEqual([]);
    expect(clean.merged.poster).toBeUndefined();
    expect(poster).toBeDefined();
  });
  it("keeps a task added on one side", () => {
    const theirs: Plan = { ...base, calc: { plannedMinutes: 240 } };
    expect(threeWayMerge(base, base, theirs).merged.calc).toEqual({ plannedMinutes: 240 });
  });
  it("merging a branch with itself changes nothing", () => {
    const r = threeWayMerge(base, base, base);
    expect(r.merged).toEqual(base);
    expect(r.conflicts).toEqual([]);
  });
  it("merge(base, A, base) equals A", () => {
    const a: Plan = { ...base, geo: { ...base.geo!, priority: "p1" }, calc: { plannedMinutes: 60 } };
    expect(threeWayMerge(base, a, base).merged).toEqual(a);
  });
});

describe("applyResolutions", () => {
  const ours: Plan = { ...base, geo: { ...base.geo!, deadline: "2026-12-14" } };
  const theirs: Plan = { ...base, geo: { ...base.geo!, deadline: "2026-12-17" } };
  it("refuses to apply while a conflict is unresolved", () => {
    expect(() => applyResolutions(threeWayMerge(base, ours, theirs), {})).toThrow(/Unresolved/);
  });
  it("applies ours, theirs or a custom value", () => {
    const r = threeWayMerge(base, ours, theirs);
    expect(applyResolutions(r, { "geo:deadline": "theirs" }).geo!.deadline).toBe("2026-12-17");
    expect(applyResolutions(r, { "geo:deadline": { custom: "2026-12-15" } }).geo!.deadline).toBe("2026-12-15");
  });
  it("resolves edit versus delete", () => {
    const { poster, ...without } = base;
    const r = threeWayMerge(base, { ...base, poster: { plannedMinutes: 180 } }, without);
    expect(applyResolutions(r, { poster: "keep" }).poster).toEqual({ plannedMinutes: 180 });
    expect(applyResolutions(r, { poster: "delete" }).poster).toBeUndefined();
    expect(poster).toBeDefined();
  });
});

describe("diffPlans and scheduling", () => {
  it("lists added, removed and changed tasks", () => {
    const { poster, ...rest } = base;
    const next: Plan = { ...rest, esl: { ...base.esl!, plannedMinutes: 1 }, calc: {} };
    const kinds = Object.fromEntries(diffPlans(base, next).map((c) => [c.taskId, c.change]));
    expect(kinds).toEqual({ poster: "removed", esl: "changed", calc: "added" });
    expect(poster).toBeDefined();
  });
  it("warns about overlapping windows for the same assignee only", () => {
    const plan: Plan = {
      a: { assigneeId: "you", windowStart: "2026-12-01", windowEnd: "2026-12-05" },
      b: { assigneeId: "you", windowStart: "2026-12-04", windowEnd: "2026-12-08" },
      c: { assigneeId: "linh", windowStart: "2026-12-04", windowEnd: "2026-12-08" },
    };
    const w = findSchedulingConflicts(plan);
    expect(w).toEqual([{ kind: "overlap", taskIds: ["a", "b"], assigneeId: "you" }]);
  });
  it("warns when a window ends after its deadline", () => {
    const w = findSchedulingConflicts({ a: { deadline: "2026-12-05", windowStart: "2026-12-01", windowEnd: "2026-12-09" } });
    expect(w[0]).toMatchObject({ kind: "after_deadline" });
  });
});
