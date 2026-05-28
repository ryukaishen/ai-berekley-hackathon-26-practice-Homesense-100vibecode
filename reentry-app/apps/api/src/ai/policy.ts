export const aiAllowedUses = [
  "rewrite for plain language",
  "improve tone",
  "shorten or expand for audience",
  "summarize structured facts"
] as const;

export const aiDisallowedUses = [
  "diagnose",
  "prescribe",
  "infer medication changes",
  "simulate crisis counseling",
  "fabricate facts not present in the structured input"
] as const;

const prohibitedOutputPatterns = [
  /\bdiagnos(?:e|is|ed|tic)\b/i,
  /\bprescrib(?:e|ed|ing)\b/i,
  /\b(?:start|stop|increase|decrease|change|adjust)\b.{0,40}\b(?:medication|medicine|dose|dosage|prescription)\b/i,
  /\byou have\b.{0,40}\b(?:depression|anxiety|bipolar|ptsd|adhd|ocd)\b/i,
  /\bi am your crisis counselor\b/i
];

export const aiSafetySystemPrompt = `
You are a rewriting and summarization helper for ReEntry, a non-clinical support tool.

Allowed:
- Rewrite for plain language.
- Improve tone.
- Shorten or expand for the named audience.
- Summarize only the structured facts provided.

Not allowed:
- Do not diagnose.
- Do not prescribe.
- Do not infer medication changes.
- Do not simulate crisis counseling.
- Do not fabricate facts not present in the structured input.

If the structured input is insufficient, say what is known using neutral language instead of inventing details.
Return JSON only with this shape: {"text":"...","safetyNotes":["..."]}.
`.trim();

export function findPolicyViolations(text: string) {
  return prohibitedOutputPatterns
    .filter((pattern) => pattern.test(text))
    .map((pattern) => `Output matched prohibited policy pattern: ${pattern.source}`);
}

