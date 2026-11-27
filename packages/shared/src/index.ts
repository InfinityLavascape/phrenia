import { z } from "zod";

export const Role = z.enum(["owner", "editor", "viewer"]);
export type Role = z.infer<typeof Role>;

export const TaskStatus = z.enum(["backlog", "planned", "in_progress", "review", "done"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

/** Plan fields live in versioned plan data (per branch). Status and evidence do not. */
export const PlanFields = z.object({
  deadline: z.string().nullable().default(null), // ISO date or date-time
  isDateOnly: z.boolean().default(true),
  windowStart: z.string().nullable().default(null),
  windowEnd: z.string().nullable().default(null),
  plannedMinutes: z.number().int().nonnegative().nullable().default(null),
  storyPoints: z.number().int().nullable().default(null),
  priority: z.enum(["p1", "p2", "p3"]).nullable().default(null),
  priorityLocked: z.boolean().default(false),
  assigneeId: z.string().nullable().default(null),
  dependsOn: z.array(z.string()).default([]),
  inPlan: z.boolean().default(true),
});
export type PlanFields = z.infer<typeof PlanFields>;

/** What the user lets AI see. AI is OFF by default and every field is off until turned on. */
export const AiPermissions = z.object({
  enabled: z.boolean().default(false),
  taskText: z.boolean().default(false),
  deadlinesAndEstimates: z.boolean().default(false),
  subtasksAndProgress: z.boolean().default(false),
  pomodoroHistory: z.boolean().default(false),
  canvasGrades: z.boolean().default(false),
  calendarBusy: z.boolean().default(false),
});
export type AiPermissions = z.infer<typeof AiPermissions>;
export const defaultAiPermissions = (): AiPermissions => AiPermissions.parse({});

export const AiProviderKind = z.enum(["local-ollama", "openai-compatible", "gemini"]);
export type AiProviderKind = z.infer<typeof AiProviderKind>;

/** Navigation tabs, in the order used by the mockup. */
export const NAV_TABS = [
  "timeline", "kanban", "backlog", "sprints", "pomodoro",
  "activity", "integrations", "members", "settings",
] as const;
export type NavTab = (typeof NAV_TABS)[number];
