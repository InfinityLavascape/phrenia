/**
 * Suggested local models. Tags come from Google's Ollama page (Gemma 4) and public guides (Qwen 3.5);
 * confirm every tag with `ollama pull` in step 0, because Ollama's library changes quickly.
 * The browser cannot read the machine's RAM reliably, so the user picks a level.
 */
export interface LocalModelPreset {
  level: "light" | "standard" | "strong";
  label: string;
  tag: string;
  alternative?: string;
  note: string;
}

export const LOCAL_MODEL_PRESETS: LocalModelPreset[] = [
  { level: "light", label: "Light", tag: "gemma4:e2b", alternative: "qwen3.5:0.8b", note: "For older laptops. Fastest, simplest suggestions." },
  { level: "standard", label: "Standard", tag: "gemma4:e4b", alternative: "qwen3.5:4b", note: "A good default for most laptops." },
  { level: "strong", label: "Strong", tag: "gemma4:26b", note: "Needs a lot of memory or a good graphics card. Best quality." },
];

/** Accepts Ollama-style tags such as gemma4:e4b or qwen3.5:4b, so users can type any model they like. */
export const isValidModelTag = (tag: string): boolean => /^[a-z0-9][a-z0-9._-]*(:[a-z0-9._-]+)?$/i.test(tag);
