import type {
  AssessmentMode,
  AssessmentResult,
  AssessmentTest,
  MessageDraft,
  MobilityMetric,
  PatientScenario,
  RiskLevel,
  SensorFrame,
  SymptomInput,
} from "../types";
import { calculateRecoveryScore, concernFromScore, symptomBurdenFromInput } from "./calculateRecoveryScore";
import { generateCaregiverTasks } from "./generateCaregiverTasks";
import { generateFindings } from "./generateFindings";

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(value)));

const average = (values: number[]) => {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
};

const metricStatus = (value: number, highGood = true): RiskLevel => {
  const normalized = highGood ? value : 100 - value;
  if (normalized >= 78) return "Low";
  if (normalized >= 62) return "Moderate";
  if (normalized >= 44) return "Elevated";
  return "High";
};

const activeSymptomLabels = (symptoms: SymptomInput) =>
  [
    symptoms.dizziness ? "dizziness" : "",
    symptoms.weakness ? "weakness" : "",
    symptoms.pain ? "pain" : "",
    symptoms.numbness ? "numbness" : "",
    symptoms.shortnessOfBreath ? "shortness of breath" : "",
  ].filter(Boolean);

const buildMessageDrafts = (
  scenario: PatientScenario,
  metrics: MobilityMetric[],
  symptoms: SymptomInput,
): MessageDraft[] => {
  const symptomText = activeSymptomLabels(symptoms).join(", ") || "no severe symptoms selected";
  const sitTime = metrics.find((metric) => metric.id === "sit-to-stand-time")?.value.toFixed(1);
  const turn = metrics.find((metric) => metric.id === "turn-confidence")?.value;
  const steadiness = metrics.find((metric) => metric.id === "steadiness-score")?.value;

  return [
    {
      id: "caregiver-clinic",
      title: "Caregiver to clinic",
      audience: "Clinic",
      subject: `StandWise recovery check update: ${scenario.shortTitle}`,
      body: `Hello, I am helping ${scenario.name} organize home recovery check information. Today the selected symptoms were ${symptomText}. The supportive indicators showed ${sitTime}s for 5x sit-to-stand, ${steadiness}/100 steadiness, and ${turn}/100 turn confidence. We are not asking the app for a diagnosis or medication change. Should the care team review this trend or call us with next steps?`,
    },
    {
      id: "patient-pt",
      title: "Patient to PT",
      audience: "PT/OT",
      subject: `Mobility check question before follow-up`,
      body: `Hi, I completed a StandWise prototype mobility check for ${scenario.shortTitle}. The main concern is: ${scenario.followUpTopics[0]}. The app flagged this as recovery friction, not a diagnosis. At our next visit, can we review safe sit-to-stand, walking, turning, and home setup?`,
    },
    {
      id: "home-health-note",
      title: "Home-health note",
      audience: "Home health",
      subject: `Home recovery visit prep`,
      body: `Visit prep note: ${scenario.clinicianSummary} Current caregiver focus: ${scenario.caregiverSummary} Please verify symptoms, mobility support needs, home safety tasks, and whether clinician follow-up is recommended.`,
    },
  ];
};

export const analyzeAssessment = (
  scenario: PatientScenario,
  symptoms: SymptomInput,
  test: AssessmentTest,
  mode: AssessmentMode,
  frames: SensorFrame[],
): AssessmentResult => {
  const swayValues = frames.map((frame) => frame.sway);
  const turnValues = frames.filter((frame) => frame.phase === "turn").map((frame) => frame.turnVelocity);
  const confidenceValues = frames.map((frame) => frame.confidence);
  const burden = symptomBurdenFromInput(symptoms);
  const avgSway = average(swayValues);
  const maxSway = Math.max(...swayValues);
  const avgTurn = average(turnValues);
  const avgConfidence = average(confidenceValues);
  const pulseValues = frames.map((frame) => frame.pulse).filter((value): value is number => typeof value === "number");

  const symptomDelay =
    (symptoms.weakness ? 1.4 : 0) +
    (symptoms.pain ? 1.1 : 0) +
    (symptoms.dizziness ? 0.7 : 0) +
    (symptoms.shortnessOfBreath ? 1.2 : 0);
  const sitToStandTime = Number(
    Math.max(7.8, scenario.baselineMobility.sitToStandTime + symptomDelay + maxSway * 1.1 - avgConfidence).toFixed(1),
  );
  const steadinessScore = clamp(100 - avgSway * 86 - maxSway * 8 - (symptoms.dizziness ? 8 : 0));
  const turnConfidence = clamp(
    scenario.baselineMobility.turnConfidence -
      avgTurn * 58 -
      (symptoms.numbness ? 9 : 0) -
      (symptoms.weakness ? 5 : 0),
  );
  const completionTrend = clamp(
    scenario.baselineMobility.completionTrend -
      burden * 0.22 -
      Math.max(0, scenario.baselineMobility.steadinessScore - steadinessScore) * 0.22,
  );
  const pulseRecovery = pulseValues.length
    ? clamp(100 - (Math.max(...pulseValues) - Math.min(...pulseValues)) * 1.25)
    : undefined;

  const metrics: MobilityMetric[] = [
    {
      id: "sit-to-stand-time",
      label: "5x sit-to-stand time",
      value: sitToStandTime,
      unit: "sec",
      direction: sitToStandTime > scenario.baselineMobility.sitToStandTime + 0.5 ? "up" : "flat",
      status: concernFromScore(Math.max(0, sitToStandTime - 8) * 8),
      description:
        test === "walk-and-turn"
          ? "Estimated from baseline because this check focused on walking and turning."
          : "Supportive timing indicator from the mock chair-rise stream.",
    },
    {
      id: "steadiness-score",
      label: "Steadiness indicator",
      value: steadinessScore,
      unit: "/100",
      direction: steadinessScore < scenario.baselineMobility.steadinessScore - 3 ? "down" : "flat",
      status: metricStatus(steadinessScore),
      description: "Lower score means more sway in the prototype signal.",
    },
    {
      id: "turn-confidence",
      label: "Turn confidence",
      value: turnConfidence,
      unit: "/100",
      direction: turnConfidence < scenario.baselineMobility.turnConfidence - 3 ? "down" : "flat",
      status: metricStatus(turnConfidence),
      description:
        test === "sit-to-stand"
          ? "Estimated from baseline because this check focused on chair rise."
          : "Supportive turning indicator based on variability during the turn segment.",
    },
    {
      id: "symptom-burden",
      label: "Symptom burden",
      value: burden,
      unit: "/100",
      direction: burden > 28 ? "up" : "flat",
      status: concernFromScore(burden + 12),
      description: "Weighted symptom input for organizing follow-up priority.",
    },
    {
      id: "completion-trend",
      label: "Completion trend",
      value: completionTrend,
      unit: "/100",
      direction: completionTrend < scenario.baselineMobility.completionTrend - 4 ? "down" : "flat",
      status: metricStatus(completionTrend),
      description: "Prototype estimate of how cleanly the patient completed the selected check.",
    },
  ];

  if (pulseRecovery !== undefined) {
    metrics.push({
      id: "pulse-recovery",
      label: "Pulse recovery",
      value: pulseRecovery,
      unit: "/100",
      direction: pulseRecovery < 70 ? "down" : "flat",
      status: metricStatus(pulseRecovery),
      description: "Optional pulse card from mock or connected sensor stream.",
    });
  }

  const score = calculateRecoveryScore(scenario, symptoms, metrics, mode);
  const caregiverTasks = generateCaregiverTasks(scenario, symptoms);
  const findings = generateFindings(scenario, symptoms, metrics);

  return {
    scenarioId: scenario.id,
    mode,
    test,
    metrics,
    score,
    findings,
    whatToDoToday: scenario.todayActions,
    caregiverTasks,
    contactClinician: scenario.contactClinician,
    followUpTopics: scenario.followUpTopics,
    messageDrafts: buildMessageDrafts(scenario, metrics, symptoms),
    supportiveSummary: `StandWise organized this check as ${score.concernLevel.toLowerCase()} recovery friction with ${score.mobilityConfidence}/100 mobility confidence. These are supportive indicators, not a diagnosis.`,
    caregiverFriendlySummary: scenario.caregiverSummary,
    clinicianSummary: scenario.clinicianSummary,
    spanishSummary: scenario.spanishSummary,
    framesAnalyzed: frames.length,
    completedAt: new Date().toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
};

