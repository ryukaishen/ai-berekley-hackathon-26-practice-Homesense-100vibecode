import { randomUUID } from "node:crypto";

const validModes = new Set(["mock", "webcam", "motion", "esp32"]);
const validTests = new Set(["sit-to-stand", "walk-and-turn", "both"]);
const validRiskLevels = new Set(["Low", "Moderate", "Elevated", "High"]);

const symptomWeights = {
  dizziness: 24,
  weakness: 20,
  pain: 14,
  numbness: 22,
  shortnessOfBreath: 28,
};

const statusPenalty = {
  Low: 0,
  Moderate: 9,
  Elevated: 17,
  High: 24,
};

const modeAdjustment = {
  mock: 0,
  webcam: -1,
  motion: -2,
  esp32: -3,
};

export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.code = "INVALID_REQUEST";
    this.details = details;
  }
}

const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const concernFromScore = (score) => {
  if (score >= 72) return "High";
  if (score >= 55) return "Elevated";
  if (score >= 34) return "Moderate";
  return "Low";
};

const outreachPriorityFromScore = (score) => {
  if (score >= 68) return "Urgent";
  if (score >= 48) return "Elevated";
  return "Routine";
};

const symptomTrendFromScore = (score) => {
  if (score >= 56) return "Worsening";
  if (score >= 28) return "Stable";
  return "Improving";
};

const validateSymptoms = (value, issues) => {
  if (!isObject(value)) {
    issues.push("`symptoms` must be an object.");
    return null;
  }

  const output = {
    dizziness: Boolean(value.dizziness),
    weakness: Boolean(value.weakness),
    pain: Boolean(value.pain),
    numbness: Boolean(value.numbness),
    shortnessOfBreath: Boolean(value.shortnessOfBreath),
    otherNote: typeof value.otherNote === "string" ? value.otherNote.slice(0, 400) : "",
  };

  return output;
};

const validateMetrics = (value, issues) => {
  if (!Array.isArray(value)) {
    issues.push("`metrics` must be an array.");
    return [];
  }

  const cleaned = [];
  value.forEach((item, index) => {
    if (!isObject(item)) {
      issues.push(`metrics[${index}] must be an object.`);
      return;
    }
    const id = typeof item.id === "string" ? item.id : "";
    const status = typeof item.status === "string" ? item.status : "";
    const numericValue = Number(item.value);
    if (!id) issues.push(`metrics[${index}].id is required.`);
    if (!validRiskLevels.has(status)) issues.push(`metrics[${index}].status must be a valid risk level.`);
    if (!Number.isFinite(numericValue)) issues.push(`metrics[${index}].value must be numeric.`);
    if (id && validRiskLevels.has(status) && Number.isFinite(numericValue)) {
      cleaned.push({ id, status, value: numericValue });
    }
  });
  return cleaned;
};

const calculateSymptomBurden = (symptoms) => {
  let score = 0;
  if (symptoms.dizziness) score += symptomWeights.dizziness;
  if (symptoms.weakness) score += symptomWeights.weakness;
  if (symptoms.pain) score += symptomWeights.pain;
  if (symptoms.numbness) score += symptomWeights.numbness;
  if (symptoms.shortnessOfBreath) score += symptomWeights.shortnessOfBreath;
  if (symptoms.otherNote.trim()) score += 8;
  return clamp(Math.round(score), 0, 100);
};

const calculateMetricPenalty = (metrics) => {
  if (!metrics.length) return 0;
  const penalty = metrics.reduce((total, metric) => total + statusPenalty[metric.status], 0);
  return clamp(Math.round(penalty / metrics.length), 0, 100);
};

const buildRationale = ({ symptomBurden, metricPenalty, concernScore, scenario, mode, test }) => {
  const lines = [
    `${scenario.shortTitle}: ${test} in ${mode} mode generated a ${concernScore}/100 concern score.`,
    `Symptom burden contributed ${symptomBurden} points and movement metrics contributed ${metricPenalty} points.`,
  ];

  if (symptomBurden >= 55) {
    lines.push("Symptoms are the strongest driver of this score, so care-team follow-up should be prioritized.");
  } else if (metricPenalty >= 45) {
    lines.push("Movement signal variability is driving concern; review gait and sit-to-stand safety supports.");
  } else {
    lines.push("Current risk is moderate and better suited to routine monitoring with clear escalation rules.");
  }

  return lines;
};

const buildRecommendedActions = ({ symptoms, scenario, concernLevel }) => {
  const actions = [scenario.dashboardAction];

  if (symptoms.dizziness) {
    actions.push("Use pause-before-walk support and keep a caregiver nearby during transfers.");
  }
  if (symptoms.numbness) {
    actions.push("Track numbness and turning confidence daily and share trend notes with rehab or oncology.");
  }
  if (symptoms.shortnessOfBreath) {
    actions.push("Keep emergency escalation guidance visible for severe or sudden breathing changes.");
  }
  if (concernLevel === "High") {
    actions.push("Request same-day clinician review for worsening recovery friction.");
  }

  return Array.from(new Set(actions)).slice(0, 4);
};

const buildEscalationGuidance = (scenario) => {
  const warnings = Array.isArray(scenario.warningSigns) ? scenario.warningSigns : [];
  return warnings.slice(0, 3);
};

export const parseAssessmentRequest = (body, scenarioLookup) => {
  const issues = [];
  if (!isObject(body)) {
    throw new ValidationError("Request body must be a JSON object.");
  }

  const scenarioId = typeof body.scenarioId === "string" ? body.scenarioId : "";
  const scenario = scenarioLookup.get(scenarioId);
  if (!scenario) {
    issues.push("`scenarioId` is missing or invalid.");
  }

  const mode = typeof body.mode === "string" ? body.mode : "";
  if (!validModes.has(mode)) issues.push("`mode` must be one of: mock, webcam, motion, esp32.");

  const test = typeof body.test === "string" ? body.test : "";
  if (!validTests.has(test)) issues.push("`test` must be one of: sit-to-stand, walk-and-turn, both.");

  const framesAnalyzed = Number(body.framesAnalyzed);
  if (!Number.isFinite(framesAnalyzed) || framesAnalyzed <= 0) {
    issues.push("`framesAnalyzed` must be a positive number.");
  }

  const symptoms = validateSymptoms(body.symptoms, issues);
  const metrics = validateMetrics(body.metrics, issues);

  if (issues.length > 0 || !scenario || !symptoms) {
    throw new ValidationError("Assessment payload validation failed.", issues);
  }

  return {
    scenario,
    scenarioId: scenario.id,
    mode,
    test,
    framesAnalyzed: Math.round(framesAnalyzed),
    symptoms,
    metrics,
  };
};

export const createAssessmentRun = (input) => {
  const symptomBurden = calculateSymptomBurden(input.symptoms);
  const metricPenalty = calculateMetricPenalty(input.metrics);
  const baseScore = symptomBurden * 0.56 + metricPenalty * 0.52 + modeAdjustment[input.mode];
  const concernScore = clamp(Math.round(baseScore), 0, 100);
  const concernLevel = concernFromScore(concernScore);
  const outreachPriority = outreachPriorityFromScore(concernScore);
  const symptomTrend = symptomTrendFromScore(symptomBurden);

  const run = {
    id: `run-${randomUUID()}`,
    scenarioId: input.scenario.id,
    scenarioTitle: input.scenario.shortTitle,
    patientName: input.scenario.patientName,
    mode: input.mode,
    test: input.test,
    framesAnalyzed: input.framesAnalyzed,
    concernScore,
    concernLevel,
    outreachPriority,
    symptomBurdenScore: symptomBurden,
    symptomTrend,
    rationale: buildRationale({
      symptomBurden,
      metricPenalty,
      concernScore,
      scenario: input.scenario,
      mode: input.mode,
      test: input.test,
    }),
    recommendedActions: buildRecommendedActions({
      symptoms: input.symptoms,
      scenario: input.scenario,
      concernLevel,
    }),
    escalationGuidance: buildEscalationGuidance(input.scenario),
    summary:
      `${input.scenario.shortTitle}: ${concernLevel.toLowerCase()} concern ` +
      `(${concernScore}/100) with ${outreachPriority.toLowerCase()} outreach priority.`,
    createdAt: new Date().toISOString(),
  };

  return run;
};
