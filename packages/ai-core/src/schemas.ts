import { z } from "zod";

export const EstimateOutput = z.object({
  minutesLow: z.number().int().positive(),
  minutesHigh: z.number().int().positive(),
  steps: z.array(z.object({ title: z.string().min(1), minutes: z.number().int().positive() })).min(1),
  assumptions: z.array(z.string()),
  confidence: z.enum(["low", "medium", "high"]),
  /** True only when personal history was actually provided. Never pretend otherwise. */
  usedHistory: z.boolean(),
});
export type EstimateOutput = z.infer<typeof EstimateOutput>;
