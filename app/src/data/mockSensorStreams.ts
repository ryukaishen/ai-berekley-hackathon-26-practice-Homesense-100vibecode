import type { AssessmentTest, PatientScenario, SensorFrame, SensorPhase } from "../types";

interface StreamProfile {
  swayBase: number;
  swaySpike: number;
  turnJitter: number;
  standDelay: number;
  confidenceDrop: number;
  pulseLift: number;
}

const streamProfiles: Record<string, StreamProfile> = {
  "knee-recovery": {
    swayBase: 0.36,
    swaySpike: 0.5,
    turnJitter: 0.32,
    standDelay: 0.3,
    confidenceDrop: 0.16,
    pulseLift: 14,
  },
  "ed-dizziness": {
    swayBase: 0.32,
    swaySpike: 0.62,
    turnJitter: 0.22,
    standDelay: 0.08,
    confidenceDrop: 0.18,
    pulseLift: 22,
  },
  "new-medication": {
    swayBase: 0.26,
    swaySpike: 0.35,
    turnJitter: 0.36,
    standDelay: 0.16,
    confidenceDrop: 0.14,
    pulseLift: 8,
  },
  "oncology-neuropathy": {
    swayBase: 0.34,
    swaySpike: 0.42,
    turnJitter: 0.5,
    standDelay: 0.05,
    confidenceDrop: 0.2,
    pulseLift: 12,
  },
};

const phaseForProgress = (progress: number, test: AssessmentTest): SensorPhase => {
  if (test === "sit-to-stand") {
    if (progress < 0.24) return "seated";
    if (progress < 0.64) return "stand";
    return "recover";
  }

  if (test === "walk-and-turn") {
    if (progress < 0.18) return "walk";
    if (progress < 0.58) return "turn";
    if (progress < 0.84) return "walk";
    return "recover";
  }

  if (progress < 0.16) return "seated";
  if (progress < 0.36) return "stand";
  if (progress < 0.58) return "walk";
  if (progress < 0.78) return "turn";
  return "recover";
};

const pulseAt = (scenario: PatientScenario, progress: number, lift: number) => {
  if (!scenario.pulseRange) return undefined;
  const [low, high] = scenario.pulseRange;
  const effortCurve = Math.sin(progress * Math.PI);
  return Math.round(Math.min(high, low + lift * Math.max(0, effortCurve)));
};

export const getMockSensorStream = (
  scenario: PatientScenario,
  test: AssessmentTest,
): SensorFrame[] => {
  const profile = streamProfiles[scenario.id] ?? streamProfiles["knee-recovery"];
  const frameCount = test === "both" ? 132 : 96;
  const frames: SensorFrame[] = [];

  for (let index = 0; index < frameCount; index += 1) {
    const progress = index / (frameCount - 1);
    const phase = phaseForProgress(progress, test);
    const standWindow = phase === "stand" ? 1 : 0;
    const turnWindow = phase === "turn" ? 1 : 0;
    const recoverWindow = phase === "recover" ? 1 : 0;
    const wave = Math.sin(progress * Math.PI * 12);
    const micro = Math.sin(progress * Math.PI * 31 + profile.turnJitter);
    const verticalPeak = standWindow * Math.sin(Math.min(1, progress * 3 + profile.standDelay) * Math.PI);
    const sway =
      profile.swayBase +
      standWindow * profile.swaySpike * 0.72 +
      turnWindow * profile.turnJitter +
      recoverWindow * profile.swayBase * 0.24 +
      Math.abs(micro) * 0.08;
    const confidence = Math.max(
      0.45,
      0.96 - sway * 0.34 - turnWindow * profile.confidenceDrop - standWindow * profile.confidenceDrop * 0.6,
    );

    frames.push({
      t: index * 90,
      accelX: Number((wave * 0.18 + turnWindow * micro * 0.18).toFixed(3)),
      accelY: Number((0.96 + verticalPeak * 0.52 + Math.abs(wave) * 0.07).toFixed(3)),
      accelZ: Number((micro * 0.22 + sway * 0.08).toFixed(3)),
      sway: Number(sway.toFixed(3)),
      turnVelocity: Number((turnWindow * (0.24 + Math.abs(micro) * profile.turnJitter)).toFixed(3)),
      verticalMotion: Number((verticalPeak + Math.abs(wave) * 0.08).toFixed(3)),
      confidence: Number(confidence.toFixed(3)),
      phase,
      pulse: pulseAt(scenario, progress, profile.pulseLift),
      spo2: scenario.id === "ed-dizziness" ? 97 : scenario.id === "oncology-neuropathy" ? 96 : 98,
    });
  }

  return frames;
};
