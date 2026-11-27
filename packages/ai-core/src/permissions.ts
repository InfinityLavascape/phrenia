import type { AiPermissions } from "@phrenia/shared";

export interface RawTaskContext {
  title?: string;
  description?: string;
  deadline?: string | null;
  estimateMinutes?: number | null;
  subtasks?: { title: string; done: boolean }[];
  pomodoroHistory?: { minutes: number; taskTitle: string }[];
  canvasPoints?: number | null;
  calendarBusy?: { start: string; end: string }[];
  // Anything else (names, emails, document text, source code) is never copied.
  [key: string]: unknown;
}

export class AiDisabledError extends Error {
  constructor() { super("AI suggestions are turned off"); }
}

/**
 * Builds the smallest input the user allows. Runs on the server before anything leaves the app,
 * even when a local model will run the prompt.
 */
export function minimizeInput(perm: AiPermissions, raw: RawTaskContext): Record<string, unknown> {
  if (!perm.enabled) throw new AiDisabledError();
  const out: Record<string, unknown> = {};
  if (perm.taskText) { out.title = raw.title; out.description = raw.description; }
  if (perm.deadlinesAndEstimates) { out.deadline = raw.deadline; out.estimateMinutes = raw.estimateMinutes; }
  if (perm.subtasksAndProgress) out.subtasks = raw.subtasks;
  if (perm.pomodoroHistory) out.pomodoroHistory = raw.pomodoroHistory;
  if (perm.canvasGrades) out.canvasPoints = raw.canvasPoints;
  if (perm.calendarBusy) out.calendarBusy = raw.calendarBusy;
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined));
}
