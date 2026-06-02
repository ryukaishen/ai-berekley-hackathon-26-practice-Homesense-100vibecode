import type {
  AiCareHandoffSummaryInput,
  AiPlanExplanationInput,
  AiSupportRequestRewriteInput,
  AiTask
} from "../schemas.js";
import { hasCrisisLanguage, redactRestrictedTopics } from "@reentry/shared";
import type { AiAdapter, AiTextResult } from "./adapter.js";
import {
  buildCareHandoffSummaryPrompt,
  buildPlanExplanationPrompt,
  buildSupportRequestRewritePrompt
} from "./templates.js";

export type AiTaskResponse = AiTextResult & {
  task: AiTask;
};

export async function explainPlanWithAi(
  adapter: AiAdapter,
  input: AiPlanExplanationInput
): Promise<AiTaskResponse> {
  const task = "plan-explanation";
  const result = await adapter.complete(buildPlanExplanationPrompt(input), () => fallbackPlanExplanation(input));
  return { task, ...result };
}

export async function rewriteSupportRequestWithAi(
  adapter: AiAdapter,
  input: AiSupportRequestRewriteInput
): Promise<AiTaskResponse> {
  const task = "support-request-rewrite";
  const result = await adapter.complete(buildSupportRequestRewritePrompt(input), () =>
    fallbackSupportRewrite(input)
  );
  return { task, ...result };
}

export async function summarizeCareHandoffWithAi(
  adapter: AiAdapter,
  input: AiCareHandoffSummaryInput
): Promise<AiTaskResponse> {
  const task = "care-handoff-summary";
  const result = await adapter.complete(buildCareHandoffSummaryPrompt(input), () =>
    fallbackCareHandoff(input)
  );
  return { task, ...result };
}

function fallbackPlanExplanation(input: AiPlanExplanationInput): AiTextResult {
  const card = input.planCard;
  const score = input.scoredCheckIn?.recoveryFrictionScore;
  const scoreLine = score === undefined ? "" : ` It matches a recovery friction score of ${score}/100.`;

  return deterministicResult(
    withCrisisSupport(
      `${card.title}: ${card.whyThisHelps}${scoreLine} It is estimated to take ${card.estimatedTime} with ${card.effortLevel} effort. Lighter version: ${card.fallbackLighterVersion}`,
      [
        card.title,
        card.whyThisHelps,
        card.fallbackLighterVersion,
        input.scoredCheckIn?.note ?? "",
        ...(input.scoredCheckIn?.evidence ?? [])
      ]
    )
  );
}

function fallbackSupportRewrite(input: AiSupportRequestRewriteInput): AiTextResult {
  const safeDraft = redactRestrictedTopics(input.draft, input.doNotShare);
  const safeFacts = input.allowedFacts.map((fact) => redactRestrictedTopics(fact, input.doNotShare));
  const facts = safeFacts.length ? ` Facts I can share: ${safeFacts.join("; ")}.` : "";
  const privacy = input.doNotShare.length
    ? " I am keeping some private details out."
    : "";
  const prefix = input.tonePreference === "brief" ? "Quick ask:" : input.tonePreference === "direct" ? "Direct ask:" : "Hey,";
  const text =
    input.length === "sms"
      ? `${prefix} ${safeDraft}${facts}${privacy}`
      : `${prefix}\n\n${safeDraft}${facts}${privacy}\n\nThank you.`;

  return deterministicResult(withCrisisSupport(text, [input.draft, ...input.allowedFacts]));
}

function fallbackCareHandoff(input: AiCareHandoffSummaryInput): AiTextResult {
  const name = input.userDisplayName ?? "The user";
  const score = input.checkIn
    ? ` Recent recovery friction score: ${input.checkIn.recoveryFrictionScore}/100, mode: ${input.checkIn.mode}.`
    : "";
  const plans = input.planCards.length
    ? ` Current plan cards: ${input.planCards.map((card) => card.title).join("; ")}.`
    : "";
  const needs = input.supportNeeds.length ? ` Support needs: ${input.supportNeeds.join("; ")}.` : "";
  const boundaries = input.boundaries.length ? ` Boundaries: ${input.boundaries.join("; ")}.` : "";

  return deterministicResult(
    withCrisisSupport(
      `${name} is in "${input.episodeTitle}". ${input.scenarioContext ?? ""}${score}${plans}${needs}${boundaries}`.trim(),
      [
        input.episodeTitle,
        input.scenarioContext ?? "",
        ...(input.checkIn?.evidence ?? []),
        ...(input.checkIn?.topBlockers ?? []),
        ...input.supportNeeds,
        ...input.boundaries
      ]
    )
  );
}

function deterministicResult(text: string): AiTextResult {
  return {
    provider: "deterministic-fallback",
    usedFallback: true,
    text: compactText(text),
    safetyNotes: ["Deterministic fallback used. No AI model output was applied."]
  };
}

function compactText(value: string) {
  return value.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function withCrisisSupport(text: string, sourceValues: string[]) {
  const source = sourceValues.join(" ");
  if (!hasCrisisLanguage(source) && !hasCrisisLanguage(text)) return text;

  return `${text} If this is immediate danger or a crisis, contact local emergency services or a trusted human now.`;
}
