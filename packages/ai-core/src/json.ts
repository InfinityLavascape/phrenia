import type { ZodType } from "zod";

/** Pulls a JSON object out of model text (handles code fences and chatter) and validates it. */
export function parseModelJson<T>(text: string, schema: ZodType<T>): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1] ?? text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return schema.parse(JSON.parse(candidate));
}

/** One retry with the validation problem appended, then give up with a clear error. */
export async function generateWithRetry<T>(
  call: (extraNote?: string) => Promise<string>,
  schema: ZodType<T>,
): Promise<T> {
  let note: string | undefined;
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await call(note);
    try { return parseModelJson(text, schema); }
    catch (e) { note = `Your last answer was not valid JSON for the required shape (${String(e).slice(0, 200)}). Reply with JSON only.`; }
  }
  throw new Error("The model did not return valid JSON after a retry");
}
