import type {
  AssessmentMode,
  MobilityMetric,
  PatientScenario,
  RecoveryScore,
  RiskLevel,
  SymptomInput,
} from "../types";

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(value)));

export const symptomBurdenFromInput = (symptoms: SymptomInput) => {
  const weighted =
    (symptoms.dizziness ? 24 : 0) +
    (symptoms.weakness ? 20 : 0) +
    (symptoms.pain ? 14 : 0) +
    (symptoms.numbness ? 22 : 0) +
    (symptoms.shortnessOfBreath ? 28 : 0) +
    (symptoms.otherNote.trim().length > 0 ? 8 : 0);

  return clamp(weighted);
};

export const concernFromScore = (score: number): RiskLevel => {
  if (score >= 72) return "High";
  if (score >= 55) return "Elevated";
  if (score >= 34) return "Moderate";
  return "Low";
};

export const calculateRecoveryScore = (
  scenario: PatientScenario,
  symptoms: SymptomInput,
  metrics: MobilityMetric[],
  mode: AssessmentMode,
): RecoveryScore => {
  const symptomBurdenScore = symptomBurdenFromInput(symptoms);
  const sitStand = metrics.find((metric) => metric.id === "sit-to-stand-time")?.value ?? scenario.baselineMobility.sitToStandTime;
  const steadiness = metrics.find((metric) => metric.id === "steadiness-score")?.value ?? scenario.baselineMobility.steadinessScore;
  const turn = metrics.find((metric) => metric.id === "turn-confidence")?.value ?? scenario.baselineMobility.turnConfidence;
  const modeAdjustment = mode === "mock" ? 0 : mode === "esp32" ? -2 : -1;
  const mobilityPenalty =
    Math.max(0, sitStand - scenario.baselineMobility.sitToStandTime) * 2.2 +
    Math.max(0, scenario.baselineMobility.steadinessScore - steadiness) * 0.55 +
    Math.max(0, scenario.baselineMobility.turnConfidence - turn) * 0.5;

  const recoveryFrictionScore = clamp(
    scenario.baselineMobility.recoveryFrictionScore + symptomBurdenScore * 0.32 + mobilityPenalty + modeAdjustment,
  );
  const mobilityConfidence = clamp(
    scenario.baselineMobility.mobilityConfidence - symptomBurdenScore * 0.16 - mobilityPenalty * 0.72,
  );

  return {
    recoveryFrictionScore,
    mobilityConfidence,
    changeFromBaseline: recoveryFrictionScore - scenario.baselineMobility.recoveryFrictionScore,
    concernLevel: concernFromScore(recoveryFrictionScore),
    symptomBurdenScore,
  };
};
