import type { ZodType } from "zod";

export type AiTask = "estimate" | "prioritize" | "explain_conflict" | "draft_branch";

export interface GenerateRequest<T> {
  task: AiTask;
  system: string;
  /** Already minimized, permission-checked input. Never raw project data. */
  input: unknown;
  schema: ZodType<T>;
}

/** Providers return validated JSON or throw. They never write plans. */
export interface AiProvider {
  id: string;
  kind: "local-ollama" | "openai-compatible" | "gemini";
  generate<T>(req: GenerateRequest<T>): Promise<T>;
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;
