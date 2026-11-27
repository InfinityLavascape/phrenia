/**
 * Pure planning engine: no database, no HTTP, no clock. JSON in, JSON out.
 * First-cut prototype for step 0. Step 2 hardens it and adds property tests.
 */
export type FieldValue = string | number | boolean | null | string[];
export type TaskPlan = Record<string, FieldValue>;
/** A plan is a map from task id to that task's plan fields. A missing id means "not in this plan". */
export type Plan = Record<string, TaskPlan>;

export type Conflict =
  | { kind: "field"; taskId: string; field: string; base: FieldValue | undefined; ours: FieldValue | undefined; theirs: FieldValue | undefined }
  | { kind: "edit_delete"; taskId: string; deletedBy: "ours" | "theirs"; base: TaskPlan; edited: TaskPlan };

export interface MergeResult {
  merged: Plan;
  conflicts: Conflict[];
}

export type Resolution = "ours" | "theirs" | "keep" | "delete" | { custom: FieldValue };
/** Resolution keys: `${taskId}:${field}` for field conflicts, `${taskId}` for edit/delete conflicts. */
export type Resolutions = Record<string, Resolution>;

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

export function conflictKey(c: Conflict): string {
  return c.kind === "field" ? `${c.taskId}:${c.field}` : c.taskId;
}

export interface PlanChange {
  taskId: string;
  change: "added" | "removed" | "changed";
  fields?: string[];
}

export function diffPlans(a: Plan, b: Plan): PlanChange[] {
  const out: PlanChange[] = [];
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[id];
    const y = b[id];
    if (x && !y) out.push({ taskId: id, change: "removed" });
    else if (!x && y) out.push({ taskId: id, change: "added" });
    else if (x && y && !same(x, y)) {
      const fields = [...new Set([...Object.keys(x), ...Object.keys(y)])].filter((f) => !same(x[f], y[f]));
      out.push({ taskId: id, change: "changed", fields });
    }
  }
  return out;
}

export function threeWayMerge(base: Plan, ours: Plan, theirs: Plan): MergeResult {
  const merged: Plan = {};
  const conflicts: Conflict[] = [];
  const ids = new Set([...Object.keys(base), ...Object.keys(ours), ...Object.keys(theirs)]);

  for (const id of ids) {
    const b = base[id];
    const o = ours[id];
    const t = theirs[id];

    if (same(o, t)) { if (o) merged[id] = o; continue; }

    if (!o || !t) {
      const edited = (o ?? t) as TaskPlan;
      const deletedBy = o ? "theirs" : "ours";
      if (!b) { merged[id] = edited; continue; }          // added on one side only
      if (same(edited, b)) continue;                       // deleted on one side, untouched on the other
      conflicts.push({ kind: "edit_delete", taskId: id, deletedBy, base: b, edited });
      continue;
    }

    const bf: TaskPlan = b ?? {};
    const result: TaskPlan = {};
    for (const f of new Set([...Object.keys(bf), ...Object.keys(o), ...Object.keys(t)])) {
      const bv = bf[f], ov = o[f], tv = t[f];
      if (same(ov, tv)) { if (ov !== undefined) result[f] = ov; }
      else if (same(ov, bv)) { if (tv !== undefined) result[f] = tv; }
      else if (same(tv, bv)) { if (ov !== undefined) result[f] = ov; }
      else conflicts.push({ kind: "field", taskId: id, field: f, base: bv, ours: ov, theirs: tv });
    }
    merged[id] = result;
  }
  return { merged, conflicts };
}

/** Apply user choices. Throws if any conflict has no resolution, so nothing is ever half-applied. */
export function applyResolutions(result: MergeResult, choices: Resolutions): Plan {
  const plan: Plan = structuredClone(result.merged);
  for (const c of result.conflicts) {
    const choice = choices[conflictKey(c)];
    if (choice === undefined) throw new Error(`Unresolved conflict: ${conflictKey(c)}`);
    if (c.kind === "field") {
      const value = choice === "ours" ? c.ours : choice === "theirs" ? c.theirs : typeof choice === "object" ? choice.custom : undefined;
      if (value === undefined && typeof choice !== "object" && choice !== "ours" && choice !== "theirs")
        throw new Error(`Invalid choice for ${conflictKey(c)}`);
      const task = (plan[c.taskId] ??= {});
      if (value === undefined) delete task[c.field]; else task[c.field] = value;
    } else if (choice === "keep") plan[c.taskId] = c.edited;
    else if (choice !== "delete") throw new Error(`Invalid choice for ${conflictKey(c)}`);
  }
  return plan;
}

export interface SchedulingWarning {
  kind: "overlap" | "after_deadline";
  taskIds: string[];
  assigneeId?: string;
}

/** Warnings only. Never moves anything. Dates are ISO strings. */
export function findSchedulingConflicts(plan: Plan): SchedulingWarning[] {
  const warnings: SchedulingWarning[] = [];
  const entries = Object.entries(plan).filter(([, p]) => p.windowStart && p.windowEnd);
  for (let i = 0; i < entries.length; i++) {
    const [idA, a] = entries[i]!;
    if (a.deadline && String(a.windowEnd) > String(a.deadline))
      warnings.push({ kind: "after_deadline", taskIds: [idA] });
    for (let j = i + 1; j < entries.length; j++) {
      const [idB, b] = entries[j]!;
      if (!a.assigneeId || a.assigneeId !== b.assigneeId) continue;
      if (a.parallel === true || b.parallel === true) continue;
      if (String(a.windowStart) < String(b.windowEnd) && String(b.windowStart) < String(a.windowEnd))
        warnings.push({ kind: "overlap", taskIds: [idA, idB], assigneeId: String(a.assigneeId) });
    }
  }
  return warnings;
}
