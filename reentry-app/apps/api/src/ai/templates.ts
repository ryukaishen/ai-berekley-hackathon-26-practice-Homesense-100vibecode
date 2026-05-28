import type {
  AiCareHandoffSummaryInput,
  AiPlanExplanationInput,
  AiSupportRequestRewriteInput,
  AiTask
} from "../schemas.js";
import { aiSafetySystemPrompt } from "./policy.js";

export type PromptTemplate = {
  task: AiTask;
  system: string;
  user: string;
};

export function buildPlanExplanationPrompt(input: AiPlanExplanationInput): PromptTemplate {
  return buildPrompt("plan-explanation", {
    instruction:
      "Explain why this plan card may help. Use plain, non-clinical language for the requested audience.",
    structuredInput: input,
    outputRules: [
      "Reference only the plan card and optional scored check-in fields.",
      "Do not add new actions beyond the provided plan card.",
      "Keep the explanation aligned to the requested length."
    ]
  });
}

export function buildSupportRequestRewritePrompt(input: AiSupportRequestRewriteInput): PromptTemplate {
  return buildPrompt("support-request-rewrite", {
    instruction:
      "Rewrite the provided support request for the requested channel, tone, audience, and length.",
    structuredInput: input,
    outputRules: [
      "Use only the draft and allowedFacts fields.",
      "Do not include topics listed in doNotShare.",
      "Do not imply the recipient has agreed to help."
    ]
  });
}

export function buildCareHandoffSummaryPrompt(input: AiCareHandoffSummaryInput): PromptTemplate {
  return buildPrompt("care-handoff-summary", {
    instruction:
      "Summarize the structured handoff facts for the recipient type using concise, neutral language.",
    structuredInput: input,
    outputRules: [
      "Summarize only supplied facts.",
      "Keep boundaries visible when provided.",
      "Do not interpret symptoms, diagnose, prescribe, or recommend medication changes."
    ]
  });
}

function buildPrompt(
  task: AiTask,
  input: {
    instruction: string;
    structuredInput: unknown;
    outputRules: string[];
  }
): PromptTemplate {
  return {
    task,
    system: aiSafetySystemPrompt,
    user: JSON.stringify(
      {
        task,
        instruction: input.instruction,
        outputRules: input.outputRules,
        structuredInput: input.structuredInput
      },
      null,
      2
    )
  };
}

