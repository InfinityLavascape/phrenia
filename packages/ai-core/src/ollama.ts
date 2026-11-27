import type { AiProvider, FetchLike, GenerateRequest } from "./types";
import { generateWithRetry } from "./json";

export const DEFAULT_OLLAMA_URL = "http://localhost:11434";

export interface OllamaStatus {
  running: boolean;
  models: { name: string; sizeBytes?: number }[];
  /** Typical cause when the browser cannot reach a running Ollama. */
  hint?: string;
}

/** Windows PowerShell line that lets a web page reach Ollama. Must be set before Ollama starts. */
export const WINDOWS_ORIGINS_COMMAND = (origin: string) => `setx OLLAMA_ORIGINS "${origin}"`;

/** Detects Ollama and lists installed models. Never throws. */
export async function detectOllama(base = DEFAULT_OLLAMA_URL, doFetch: FetchLike = (u, i) => fetch(u, i)): Promise<OllamaStatus> {
  try {
    const res = await doFetch(`${base}/api/tags`);
    if (!res.ok) return { running: false, models: [], hint: `Ollama answered ${res.status}` };
    const data = (await res.json()) as { models?: { name: string; size?: number }[] };
    return { running: true, models: (data.models ?? []).map((m) => ({ name: m.name, sizeBytes: m.size })) };
  } catch {
    return {
      running: false,
      models: [],
      hint: "Ollama is not running, or the browser is blocked. Start Ollama, and set OLLAMA_ORIGINS to this site's address before starting it.",
    };
  }
}

export interface PullProgress { status: string; completed?: number; total?: number; done: boolean }

/** Downloads a model through Ollama, reporting progress. Ollama is the installer and model manager. */
export async function pullModel(
  tag: string,
  onProgress: (p: PullProgress) => void,
  base = DEFAULT_OLLAMA_URL,
  doFetch: FetchLike = (u, i) => fetch(u, i),
): Promise<void> {
  const res = await doFetch(`${base}/api/pull`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: tag, stream: true }),
  });
  if (!res.ok || !res.body) throw new Error(`Could not start the download (${res.status})`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines.filter(Boolean)) {
      const j = JSON.parse(line) as { status: string; completed?: number; total?: number; error?: string };
      if (j.error) throw new Error(j.error);
      onProgress({ status: j.status, completed: j.completed, total: j.total, done: j.status === "success" });
    }
  }
}

export async function deleteModel(tag: string, base = DEFAULT_OLLAMA_URL, doFetch: FetchLike = (u, i) => fetch(u, i)): Promise<void> {
  const res = await doFetch(`${base}/api/delete`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ model: tag }) });
  if (!res.ok) throw new Error(`Could not remove ${tag} (${res.status})`);
}

export function ollamaProvider(opts: { model: string; base?: string; fetch?: FetchLike }): AiProvider {
  const base = opts.base ?? DEFAULT_OLLAMA_URL;
  const doFetch: FetchLike = opts.fetch ?? ((u, i) => fetch(u, i));
  return {
    id: `ollama:${opts.model}`,
    kind: "local-ollama",
    async generate<T>(req: GenerateRequest<T>): Promise<T> {
      return generateWithRetry(async (note) => {
        const res = await doFetch(`${base}/api/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            model: opts.model,
            stream: false,
            format: "json",
            options: { temperature: 0.2 },
            messages: [
              { role: "system", content: req.system },
              { role: "user", content: JSON.stringify(req.input) + (note ? `\n\n${note}` : "") },
            ],
          }),
        });
        if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
        const data = (await res.json()) as { message?: { content?: string } };
        return data.message?.content ?? "";
      }, req.schema);
    },
  };
}
