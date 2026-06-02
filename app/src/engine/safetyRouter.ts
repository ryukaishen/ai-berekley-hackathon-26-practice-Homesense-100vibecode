import type { DailyRecoverySignal, FrictionScore, SafetyResult } from '../types/index';

// Zero AI calls. All thresholds are hard-coded deterministic rules.

const EMERGENCY_PHRASES = [
  'chest pain', "can't breathe", 'cannot breathe', 'shortness of breath',
  'passing out', 'fainting', 'unconscious', 'suicide', 'self harm',
  'self-harm', 'kill myself', 'end my life', 'want to die', 'hurt myself',
];

export function runSafetyRouter(today: DailyRecoverySignal, friction: FrictionScore): SafetyResult {
  const flags: string[] = [];
  const note = (today.checkIn?.note ?? '').toLowerCase();

  // Emergency: note phrases
  const matchedPhrase = EMERGENCY_PHRASES.find(p => note.includes(p));
  if (matchedPhrase) flags.push(`Serious phrase detected in check-in note: "${matchedPhrase}"`);

  // Emergency: biometric thresholds
  if (today.spo2Avg < 0.92) flags.push('Blood oxygen below 92% — emergency threshold.');
  if (today.restingHeartRate > 130) flags.push('Resting heart rate above 130 bpm — emergency threshold.');
  if (today.breathingRate > 30) flags.push('Breathing rate above 30 — emergency threshold.');

  const isEmergency = flags.length > 0;

  if (isEmergency) {
    return {
      level: 'emergency',
      flags,
      blockedAgents: true,
      escalationMessage:
        'This response includes a serious symptom that needs immediate attention. Please call 911 or go to your nearest emergency room now.',
    };
  }

  // Red conditions
  const redFlags: string[] = [];
  if (today.spo2Avg < 0.94) redFlags.push('Blood oxygen below 94%.');
  if (today.restingHeartRate > 110) redFlags.push('Resting heart rate above 110 bpm.');
  if (today.hrvRmssd < 15) redFlags.push('HRV critically low (below 15 ms).');
  if (friction.total >= 85) redFlags.push('Recovery friction score critically elevated (85+).');
  if (today.checkIn?.bodyState.includes('dizziness') && today.steps < 500) {
    redFlags.push('Dizziness reported with very low movement today.');
  }

  if (redFlags.length > 0) {
    return {
      level: 'red',
      flags: redFlags,
      blockedAgents: true,
      escalationMessage:
        'Your recovery signals suggest you may need support today. Please contact your care team, a family member, or call your provider\'s nurse line.',
    };
  }

  // Yellow conditions
  const yellowFlags: string[] = [];
  if (friction.total >= 60) yellowFlags.push('Recovery friction score elevated (60+).');
  if (today.sleepHours < 4.0) yellowFlags.push('Sleep below 4 hours.');
  if (today.checkIn?.energy === 1) yellowFlags.push('Energy reported at minimum (1/5).');
  if (today.deviceSyncedAt === null) yellowFlags.push('Device did not sync today — missing wearable data.');

  if (yellowFlags.length > 0) {
    return { level: 'yellow', flags: yellowFlags, blockedAgents: false, escalationMessage: null };
  }

  return { level: 'clear', flags: [], blockedAgents: false, escalationMessage: null };
}
