import type { MobilityMetric, PatientScenario, RecoveryFinding, SymptomInput } from "../types";
import { concernFromScore, symptomBurdenFromInput } from "./calculateRecoveryScore";

export const generateFindings = (
  scenario: PatientScenario,
  symptoms: SymptomInput,
  metrics: MobilityMetric[],
): RecoveryFinding[] => {
  const findings = [...scenario.keyFindings];
  const symptomBurden = symptomBurdenFromInput(symptoms);
  const sitToStand = metrics.find((metric) => metric.id === "sit-to-stand-time");
  const steadiness = metrics.find((metric) => metric.id === "steadiness-score");

  if (symptoms.shortnessOfBreath) {
    findings.unshift({
      id: "shortness-of-breath",
      title: "Shortness of breath was reported",
      detail:
        "StandWise treats shortness of breath as a symptom trend to escalate when severe, sudden, or worsening.",
      plainDetail: "Shortness of breath can be important. Call for help if it is severe or sudden.",
      severity: "High",
    });
  }

  if (symptomBurden >= 45) {
    findings.push({
      id: "symptom-burden",
      title: "Symptom burden is adding recovery friction",
      detail:
        "Multiple symptoms were selected during the check. This increases the follow-up priority even when the movement test is completed.",
      plainDetail: "Several symptoms were selected, so follow-up is more important.",
      severity: concernFromScore(symptomBurden + 20),
    });
  }

  if (sitToStand && sitToStand.value - scenario.baselineMobility.sitToStandTime > 1.4) {
    findings.push({
      id: "slower-stand",
      title: "Sit-to-stand slowed compared with baseline",
      detail:
        "A slower chair-rise pattern can indicate recovery friction, fatigue, pain, dizziness, or deconditioning to discuss with the care team.",
      plainDetail: "Standing from the chair is slower than the last check.",
      severity: "Elevated",
    });
  }

  if (steadiness && steadiness.value < 58) {
    findings.push({
      id: "steadiness-low",
      title: "Steadiness indicator is below the demo target",
      detail:
        "The supportive steadiness indicator is low for this check. It should be interpreted with symptoms and clinician guidance.",
      plainDetail: "The steadiness indicator is low today.",
      severity: "Elevated",
    });
  }

  return findings;
};

