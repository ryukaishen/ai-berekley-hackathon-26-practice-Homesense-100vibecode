import type { SharingTopic } from "@reentry/shared";

const diagnosisPatterns = [
  /\byou (?:have|are experiencing|seem to have|might have)\b.{0,60}\b(?:depression|anxiety|bipolar|ptsd|adhd|ocd|disorder|condition)\b/i,
  /\bthis (?:is|sounds like|means)\b.{0,40}\b(?:depression|anxiety|bipolar|ptsd|adhd|ocd)\b/i,
  /\bdiagnosis\s*[:=]/i,
  /\bi diagnose\b/i
];

const medicationAdvicePatterns = [
  /\b(?:start|stop|increase|decrease|change|adjust|skip|double|halve|take)\b.{0,50}\b(?:medication|medicine|meds|dose|dosage|prescription|pill|pills)\b/i,
  /\b(?:medication|medicine|meds|dose|dosage|prescription|pill|pills)\b.{0,50}\b(?:start|stop|increase|decrease|change|adjust|skip|double|halve|take)\b/i,
  /\bnext dose\b/i
];

const coercivePatterns = [
  /\byou must\b/i,
  /\byou have to\b/i,
  /\bno excuses\b/i,
  /\bjust push through\b/i,
  /\byou owe\b/i,
  /\bif you (?:cared|really wanted)\b/i,
  /\bshould be ashamed\b/i,
  /\bdon't let (?:them|people|everyone) down\b/i
];

const crisisPatterns = [
  /\bcrisis\b/i,
  /\bsuicid(?:e|al)\b/i,
  /\bself-harm\b/i,
  /\bharm myself\b/i,
  /\bend my life\b/i,
  /\bimmediate danger\b/i,
  /\bunsafe\b/i
];

const emergencySupportPatterns = [
  /\bemergency services\b/i,
  /\blocal emergency\b/i,
  /\btrusted human\b/i,
  /\btrusted person\b/i,
  /\bhuman backup\b/i,
  /\bcare contact\b/i,
  /\b911\b/,
  /\b988\b/
];

const restrictedAliases: Record<SharingTopic, string[]> = {
  health: ["health", "symptom", "symptoms", "pain", "flare", "medical"],
  meds: ["meds", "medication", "medicine", "dose", "dosage", "prescription", "pill", "pills"],
  appointments: ["appointment", "appointments", "follow-up", "follow up"],
  "school-work": ["school", "class", "work", "job", "professor", "teacher", "manager", "deadline"],
  emotions: ["emotion", "emotions", "panic", "sad", "lonely", "rumination"],
  money: ["money", "bill", "bills", "rent", "debt", "bank"],
  location: ["address", "location", "where i am", "home", "dorm"],
  family: ["family", "parent", "parents", "mom", "dad", "sibling", "partner"]
};

export function findDiagnosisLanguage(text: string) {
  return findMatches(text, diagnosisPatterns);
}

export function findMedicationAdvice(text: string) {
  return findMatches(text, medicationAdvicePatterns);
}

export function findCoerciveLanguage(text: string) {
  return findMatches(text, coercivePatterns);
}

export function mentionsCrisis(text: string) {
  return crisisPatterns.some((pattern) => pattern.test(text));
}

export function showsEmergencyHumanSupport(text: string) {
  return emergencySupportPatterns.some((pattern) => pattern.test(text));
}

export function findRestrictedLeaks(text: string, topics: SharingTopic[]) {
  return topics.flatMap((topic) =>
    restrictedAliases[topic]
      .filter((alias) => new RegExp(`\\b${escapeRegExp(alias)}\\b`, "i").test(text))
      .map((alias) => `${topic}:${alias}`)
  );
}

export function collectSafetyViolations(text: string) {
  const violations = [
    ...findDiagnosisLanguage(text).map((pattern) => `diagnosis language: ${pattern}`),
    ...findMedicationAdvice(text).map((pattern) => `medication advice: ${pattern}`),
    ...findCoerciveLanguage(text).map((pattern) => `coercive copy: ${pattern}`)
  ];

  if (mentionsCrisis(text) && !showsEmergencyHumanSupport(text)) {
    violations.push("crisis mention without emergency or human support");
  }

  return violations;
}

function findMatches(text: string, patterns: RegExp[]) {
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
