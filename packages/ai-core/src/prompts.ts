import { EstimateOutput } from "./schemas";
import type { GenerateRequest } from "./types";

export function buildEstimateRequest(input: Record<string, unknown>): GenerateRequest<EstimateOutput> {
  return {
    task: "estimate",
    schema: EstimateOutput,
    input,
    system: [
      "You estimate how long a student task takes in hours of focused work, not calendar time.",
      "Break it into steps. List your assumptions. Say confidence is low when you have no personal history.",
      "Set usedHistory to true only if the input contains pomodoroHistory.",
      "Return JSON with: minutesLow, minutesHigh, steps[{title, minutes}], assumptions[], confidence, usedHistory.",
    ].join(" "),
  };
}
