import type { AiProvider, FetchLike, GenerateRequest } from "./types";
import { generateWithRetry } from "./json";

export interface OpenAiCompatibleOptions {
  id: string;
  baseUrl: string;      // e.g. https://integrate.api.nvidia.com/v1, http://localhost:1234/v1, http://localhost:11434/v1
  model: string;
  apiKey?: string;
  fetch?: FetchLike;
}

/** One adapter covers NVIDIA's hosted API, LM Studio, llama.cpp servers and Ollama's /v1 endpoint. */
export function openAiCompatible(opts: OpenAiCompatibleOptions): AiProvider {
  const doFetch: FetchLike = opts.fetch ?? ((u, i) => fetch(u, i));
  return {
    id: opts.id,
    kind: "openai-compatible",
    async generate<T>(req: GenerateRequest<T>): Promise<T> {
      return generateWithRetry(async (note) => {
        const res = await doFetch(`${opts.baseUrl.replace(/\/$/, "")}/chat/completions`, {
          method: "POST",
          headers: { "content-type": "application/json", ...(opts.apiKey ? { authorization: `Bearer ${opts.apiKey}` } : {}) },
          body: JSON.stringify({
            model: opts.model,
            temperature: 0.2,
            messages: [
              { role: "system", content: `${req.system}\nReply with a single JSON object and nothing else.` },
              { role: "user", content: JSON.stringify(req.input) + (note ? `\n\n${note}` : "") },
            ],
          }),
        });
        if (res.status === 429) throw new RateLimitError();
        if (!res.ok) throw new Error(`AI provider returned ${res.status}`);
        const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        return data.choices?.[0]?.message?.content ?? "";
      }, req.schema);
    },
  };
}

export class RateLimitError extends Error {
  constructor() { super("The AI provider is rate limiting requests (429)"); }
}
