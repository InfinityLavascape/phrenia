import { describe, expect, it, vi } from "vitest";
import { defaultAiPermissions } from "@phrenia/shared";
import {
  AiDisabledError, EstimateOutput, LOCAL_MODEL_PRESETS, buildEstimateRequest, detectOllama,
  isValidModelTag, minimizeInput, ollamaProvider, openAiCompatible, parseModelJson, pullModel,
} from "./index";

const goodEstimate = { minutesLow: 180, minutesHigh: 360, steps: [{ title: "Practice", minutes: 120 }], assumptions: ["no history"], confidence: "low", usedHistory: false };
const json = (body: unknown, init?: ResponseInit) => new Response(JSON.stringify(body), { status: 200, ...init });

describe("minimizeInput", () => {
  const raw = { title: "calc revision", description: "chapters 3-5", deadline: "2026-12-06", estimateMinutes: 240, pomodoroHistory: [{ minutes: 25, taskTitle: "x" }], email: "a@b.c", documentText: "secret" };
  it("refuses when AI is off", () => {
    expect(() => minimizeInput(defaultAiPermissions(), raw)).toThrow(AiDisabledError);
  });
  it("sends nothing the user did not allow", () => {
    const perm = { ...defaultAiPermissions(), enabled: true, taskText: true };
    expect(minimizeInput(perm, raw)).toEqual({ title: "calc revision", description: "chapters 3-5" });
  });
  it("never copies emails or document text even when everything is on", () => {
    const perm = { enabled: true, taskText: true, deadlinesAndEstimates: true, subtasksAndProgress: true, pomodoroHistory: true, canvasGrades: true, calendarBusy: true };
    const out = minimizeInput(perm, raw);
    expect(out).not.toHaveProperty("email");
    expect(out).not.toHaveProperty("documentText");
    expect(out).toHaveProperty("pomodoroHistory");
  });
});

describe("parseModelJson", () => {
  it("reads fenced and chatty output", () => {
    expect(parseModelJson("Sure!\n```json\n" + JSON.stringify(goodEstimate) + "\n```", EstimateOutput).confidence).toBe("low");
    expect(parseModelJson("Here you go: " + JSON.stringify(goodEstimate) + " Done.", EstimateOutput).minutesLow).toBe(180);
  });
  it("rejects the wrong shape", () => {
    expect(() => parseModelJson('{"minutesLow": -1}', EstimateOutput)).toThrow();
  });
});

describe("providers", () => {
  it("openai-compatible retries once after bad JSON, then succeeds", async () => {
    const f = vi.fn()
      .mockResolvedValueOnce(json({ choices: [{ message: { content: "not json" } }] }))
      .mockResolvedValueOnce(json({ choices: [{ message: { content: JSON.stringify(goodEstimate) } }] }));
    const p = openAiCompatible({ id: "nim", baseUrl: "https://example.test/v1", model: "m", apiKey: "k", fetch: f });
    const out = await p.generate(buildEstimateRequest({ title: "calc revision" }));
    expect(out.minutesHigh).toBe(360);
    expect(f).toHaveBeenCalledTimes(2);
    expect((f.mock.calls[0]![1] as RequestInit).headers).toMatchObject({ authorization: "Bearer k" });
  });
  it("surfaces 429 as a rate limit error", async () => {
    const f = vi.fn().mockResolvedValue(new Response("", { status: 429 }));
    const p = openAiCompatible({ id: "nim", baseUrl: "https://example.test/v1", model: "m", fetch: f });
    await expect(p.generate(buildEstimateRequest({}))).rejects.toThrow(/429/);
  });
  it("ollama provider uses the chat endpoint with JSON format", async () => {
    const f = vi.fn().mockResolvedValue(json({ message: { content: JSON.stringify(goodEstimate) } }));
    const p = ollamaProvider({ model: "gemma4:e4b", fetch: f });
    await p.generate(buildEstimateRequest({}));
    expect(f.mock.calls[0]![0]).toBe("http://localhost:11434/api/chat");
    expect(JSON.parse((f.mock.calls[0]![1] as RequestInit).body as string)).toMatchObject({ model: "gemma4:e4b", format: "json", stream: false });
  });
});

describe("local model management", () => {
  it("detects a running Ollama and lists models", async () => {
    const f = vi.fn().mockResolvedValue(json({ models: [{ name: "gemma4:e4b", size: 123 }] }));
    const s = await detectOllama("http://localhost:11434", f);
    expect(s).toEqual({ running: true, models: [{ name: "gemma4:e4b", sizeBytes: 123 }] });
  });
  it("reports a helpful hint instead of throwing when Ollama is unreachable", async () => {
    const s = await detectOllama("http://localhost:11434", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    expect(s.running).toBe(false);
    expect(s.hint).toMatch(/OLLAMA_ORIGINS/);
  });
  it("reports pull progress from streamed lines", async () => {
    const lines = ['{"status":"pulling manifest"}', '{"status":"downloading","completed":50,"total":100}', '{"status":"success"}'].join("\n") + "\n";
    const f = vi.fn().mockResolvedValue(new Response(lines));
    const seen: string[] = [];
    await pullModel("gemma4:e4b", (p) => seen.push(`${p.status}:${p.done}`), "http://localhost:11434", f);
    expect(seen).toEqual(["pulling manifest:false", "downloading:false", "success:true"]);
  });
  it("accepts gemma and qwen style tags and rejects junk", () => {
    for (const p of LOCAL_MODEL_PRESETS) expect(isValidModelTag(p.tag)).toBe(true);
    expect(isValidModelTag("qwen3.5:4b")).toBe(true);
    expect(isValidModelTag("bad tag; rm -rf")).toBe(false);
  });
});
