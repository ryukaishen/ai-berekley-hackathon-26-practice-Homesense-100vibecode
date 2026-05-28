import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  composeHelpRequest,
  generatePlanCards,
  scoreCheckIn,
  type CheckInPayload,
  type HelpRequestComposerInput,
  type SharingTopic
} from "@reentry/shared";
import { createAiAdapter } from "../ai/adapter.js";
import {
  rewriteSupportRequestWithAi,
  summarizeCareHandoffWithAi
} from "../ai/tasks.js";
import type {
  AiCareHandoffSummaryInput,
  AiSupportRequestRewriteInput
} from "../schemas.js";
import {
  collectSafetyViolations,
  findRestrictedLeaks,
  mentionsCrisis,
  showsEmergencyHumanSupport
} from "./safetyChecks.js";

type SafetyAssertion =
  | "no-diagnosis-language"
  | "no-medication-advice"
  | "no-coercive-copy"
  | "crisis-needs-emergency-human-support"
  | "no-restricted-leak";

type SafetyEvalCase = {
  id: string;
  task:
    | "support-request-compose"
    | "ai-support-request-rewrite"
    | "ai-care-handoff-summary"
    | "plan-generation";
  input: unknown;
  assertions: SafetyAssertion[];
};

type SafetyEvalDataset = {
  version: number;
  cases: SafetyEvalCase[];
};

const dataset = JSON.parse(
  readFileSync(new URL("../../evals/safety.eval.json", import.meta.url), "utf8")
) as SafetyEvalDataset;

const adapter = createAiAdapter({});
const failures: string[] = [];

for (const testCase of dataset.cases) {
  await runTest(testCase.id, async () => {
    const result = await evaluateCase(testCase);
    const combinedOutput = result.messageDrafts.join("\n\n");

    assertSafetyCopy(testCase, combinedOutput);

    if (testCase.assertions.includes("crisis-needs-emergency-human-support")) {
      assert.equal(
        mentionsCrisis(result.sourceText) || mentionsCrisis(combinedOutput),
        true,
        `${testCase.id} should include crisis language in source or output.`
      );
      assert.equal(
        showsEmergencyHumanSupport(combinedOutput),
        true,
        `${testCase.id} must show emergency or human support when crisis language appears.\n${combinedOutput}`
      );
    }

    if (testCase.assertions.includes("no-restricted-leak")) {
      for (const draft of result.messageDrafts) {
        const leaks = findRestrictedLeaks(draft, result.restrictedTopics);
        assert.deepEqual(
          leaks,
          [],
          `${testCase.id} leaked restricted fields into a message draft: ${leaks.join(", ")}\n${draft}`
        );
      }
    }
  });
}

if (failures.length > 0) {
  console.error(`\nSafety test failures (${failures.length}):`);
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log(`Safety tests passed (${dataset.cases.length} cases).`);

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    failures.push(`FAIL ${name}\n${message}`);
  }
}

async function evaluateCase(testCase: SafetyEvalCase) {
  switch (testCase.task) {
    case "support-request-compose": {
      const input = testCase.input as HelpRequestComposerInput;
      const output = composeHelpRequest(input);
      return {
        sourceText: [input.need, input.requestedHelp, input.privateContext ?? ""].join(" "),
        messageDrafts: [output.shortSmsDraft, output.fullerDraft],
        restrictedTopics: output.omittedTopics
      };
    }

    case "ai-support-request-rewrite": {
      const input = testCase.input as AiSupportRequestRewriteInput;
      const output = await rewriteSupportRequestWithAi(adapter, input);
      return {
        sourceText: [input.draft, ...input.allowedFacts].join(" "),
        messageDrafts: [output.text],
        restrictedTopics: input.doNotShare as SharingTopic[]
      };
    }

    case "ai-care-handoff-summary": {
      const input = testCase.input as AiCareHandoffSummaryInput;
      const output = await summarizeCareHandoffWithAi(adapter, input);
      return {
        sourceText: [
          input.episodeTitle,
          input.scenarioContext ?? "",
          ...input.supportNeeds,
          ...input.boundaries
        ].join(" "),
        messageDrafts: [output.text],
        restrictedTopics: []
      };
    }

    case "plan-generation": {
      const payload = testCase.input as CheckInPayload;
      const score = scoreCheckIn(payload);
      const cards = generatePlanCards({ ...payload, ...score });
      assert.equal(cards.length, 3, `${testCase.id} should generate exactly 3 plan cards.`);
      return {
        sourceText: payload.note ?? "",
        messageDrafts: cards.map((card) =>
          [
            card.title,
            card.whyThisHelps,
            card.estimatedTime,
            card.effortLevel,
            card.messageTarget ?? "",
            card.fallbackLighterVersion
          ].join(" ")
        ),
        restrictedTopics: []
      };
    }
  }
}

function assertSafetyCopy(testCase: SafetyEvalCase, text: string) {
  const violations = collectSafetyViolations(text);
  assert.deepEqual(
    violations,
    [],
    `${testCase.id} produced unsafe copy: ${violations.join(", ")}\n${text}`
  );
}
