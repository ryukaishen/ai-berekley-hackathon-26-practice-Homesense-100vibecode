import type { RecoveryTrack, DailyRecoverySignal, CheckIn } from '../types/index';

// Period markers — used by StandUnited dashboard to annotate timeline
export const MARIA_HOSPITALIZATION   = { start: '2026-04-26', end: '2026-05-02' };
export const MARIA_FIRST_DECLINE_START  = '2026-04-12';
export const MARIA_SECOND_DECLINE_START = '2026-05-17';

// ─── helpers ─────────────────────────────────────────────────────────────────

function sv(a: number, b: number): number {
  const x = Math.sin(a * 47.31 + b * 113.7) * 29341.9;
  return x - Math.floor(x);
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function r1(n: number): number { return Math.round(n * 10) / 10; }

function dateStr(offset: number): string {
  return new Date(Date.UTC(2026, 2, 1) + offset * 86400000).toISOString().slice(0, 10);
}

function syncStr(offset: number, day: number): string {
  const h = String(6 + Math.floor(sv(day, 50) * 4)).padStart(2, '0');
  const m = String(Math.floor(sv(day, 51) * 60)).padStart(2, '0');
  return `${dateStr(offset)}T${h}:${m}:00Z`;
}

function rating(v: number): 1 | 2 | 3 | 4 | 5 {
  return clamp(Math.round(v), 1, 5) as 1 | 2 | 3 | 4 | 5;
}

// ─── phases ───────────────────────────────────────────────────────────────────
//
// Five phases in Maria's 90-day story:
//   0  Baseline   Days  0–41   Mar 01 – Apr 11   Stable chronic disease management
//   1  Decline 1  Days 42–55   Apr 12 – Apr 25   Gradual deterioration (pre-hospitalization)
//   2  Hospital   Days 56–62   Apr 26 – May 02   Admitted; wearable largely offline
//   3  Recovery   Days 63–76   May 03 – May 16   Post-discharge slow rebuild
//   4  Decline 2  Days 77–89   May 17 – May 29   ← NOW — pattern matches Decline 1

type Phase = {
  s: number; e: number;
  stepsS: number; stepsE: number;
  sleepS: number; sleepE: number;
  effS: number;   effE: number;
  rhrS: number;   rhrE: number;
  hrvS: number;   hrvE: number;
  brS: number;    brE: number;
  spo2S: number;  spo2E: number;
  actS: number;   actE: number;
  routR: number; syncR: number; ciR: number;
};

const PHASES: Phase[] = [
  // Baseline — stable but low-activity elderly cardiac patient
  { s:  0, e: 41, stepsS: 2800, stepsE: 2800, sleepS:  7.0, sleepE:  7.0, effS: 0.78, effE: 0.78, rhrS: 70, rhrE: 70, hrvS: 24, hrvE: 24, brS: 14.8, brE: 14.8, spo2S: 0.963, spo2E: 0.963, actS: 20, actE: 20, routR: 0.65, syncR: 0.85, ciR: 0.75 },
  // Decline 1 — steps crater, sleep balloons, HR and BR spike, HRV crashes
  { s: 42, e: 55, stepsS: 2200, stepsE:  520, sleepS:  7.5, sleepE: 11.2, effS: 0.74, effE: 0.62, rhrS: 73, rhrE: 91, hrvS: 20, hrvE:  8, brS: 15.2, brE: 21.0, spo2S: 0.952, spo2E: 0.924, actS: 16, actE:  3, routR: 0.10, syncR: 0.60, ciR: 0.50 },
  // Hospitalization — in hospital; few syncs, no check-ins
  { s: 56, e: 62, stepsS:  220, stepsE:  380, sleepS:  6.0, sleepE:  6.5, effS: 0.62, effE: 0.66, rhrS: 89, rhrE: 85, hrvS:  9, hrvE: 11, brS: 20.0, brE: 18.5, spo2S: 0.926, spo2E: 0.932, actS:  4, actE:  7, routR: 0.00, syncR: 0.30, ciR: 0.00 },
  // Recovery — slow linear climb back to near-baseline
  { s: 63, e: 76, stepsS:  560, stepsE: 2600, sleepS:  9.8, sleepE:  7.2, effS: 0.64, effE: 0.79, rhrS: 83, rhrE: 70, hrvS: 10, hrvE: 22, brS: 18.0, brE: 14.5, spo2S: 0.934, spo2E: 0.958, actS:  5, actE: 22, routR: 0.40, syncR: 0.80, ciR: 0.70 },
  // Decline 2 — same trajectory as Decline 1; app should catch this
  { s: 77, e: 89, stepsS: 2400, stepsE:  780, sleepS:  7.2, sleepE: 10.5, effS: 0.79, effE: 0.63, rhrS: 71, rhrE: 88, hrvS: 22, hrvE:  9, brS: 14.5, brE: 20.5, spo2S: 0.958, spo2E: 0.930, actS: 20, actE:  4, routR: 0.15, syncR: 0.65, ciR: 0.55 },
];

// ─── narrative notes (keyed by day offset) ───────────────────────────────────

const NOTES: Partial<Record<number, string>> = {
  0:  "Started wearing my daughter's watch. It keeps beeping at me.",
  3:  "Walked to the corner and back. Tired after but I did it.",
  7:  "Went to church. Knees were okay. Good to see my friends.",
  14: "Grandchildren visited today. Very happy.",
  21: "Blood pressure a little high at the pharmacy. I told them I was fine.",
  28: "Tried to cook arroz con pollo. Had to sit down halfway through.",
  35: "Routine day. Took my pills. Watched my shows.",
  42: "Legs feel heavy today. Did not go for my walk.",
  45: "Did not sleep well. Too warm. Very tired all day.",
  48: "Knees hurt more than usual. Skipped walk again.",
  51: "My daughter called. I told her I was fine. Did not want to worry her.",
  53: "Hard to get up today. Everything aches.",
  55: "Very tired. Did not eat much. Daughter is coming tomorrow.",
  63: "Finally home. Happy to see my cats.",
  65: "Too tired to do much. My daughter is staying with me.",
  68: "Walked to the garden with help. Good to be outside.",
  70: "Ate a real meal. Feeling a little better.",
  73: "First night I slept through without waking up.",
  76: "Doctor says I am doing well. Back on my routine.",
  78: "First full week back. Tired but okay.",
  80: "Skipped my walk. Legs feel heavy again.",
  82: "Woke up three times last night. Not feeling rested.",
  84: "Stayed on the couch most of the day. Not hungry.",
  86: "My daughter called. I said I was fine.",
  88: "Not hungry. Everything aches. Very tired.",
  89: "Hard to get up this morning. Feet are a little swollen.",
};

// ─── check-in builder ────────────────────────────────────────────────────────

type BS = 'headache' | 'fatigue' | 'nausea' | 'dizziness' | 'pain' | 'brain_fog' | 'none';
type PB = 'no_transport' | 'alone_at_home' | 'no_caregiver' | 'financial' | 'work_conflict' | 'none';

function buildCheckIn(day: number, phaseIdx: number, t: number): CheckIn | null {
  const ph = PHASES[phaseIdx];
  if (ph.ciR === 0 || sv(day, 20) > ph.ciR) return null;

  const isDecline  = phaseIdx === 1 || phaseIdx === 4;
  const isRecovery = phaseIdx === 3;

  const energyRaw = isRecovery
    ? 1.5 + t * 2.0
    : isDecline
    ? 3.0 - t * 2.2
    : 2.5 + sv(day, 21) * 0.8;

  const energy        = rating(energyRaw + (sv(day, 22) - 0.5) * 0.8);
  const cognitiveLoad = rating(1 + sv(day, 23) * 1.2);
  const socialLoad    = rating(1 + sv(day, 24) * 1.8);

  const bodyState: BS[] = [];
  if (energy <= 2) bodyState.push('fatigue');
  if (isDecline && t > 0.3 && sv(day, 25) > 0.40) bodyState.push('pain');
  if (isDecline && t > 0.6 && sv(day, 26) > 0.55) bodyState.push('dizziness');
  if (bodyState.length === 0) bodyState.push('none');

  const practicalBlockers: PB[] = [];
  if (sv(day, 27) > 0.55) practicalBlockers.push('alone_at_home');
  if (isDecline && t > 0.5 && sv(day, 28) > 0.65) practicalBlockers.push('no_caregiver');
  if (practicalBlockers.length === 0) practicalBlockers.push('none');

  return {
    energy,
    cognitiveLoad,
    socialLoad,
    bodyState,
    practicalBlockers,
    note: NOTES[day] ?? '',
  };
}

// ─── day builder ─────────────────────────────────────────────────────────────

function buildDay(i: number): DailyRecoverySignal {
  const phaseIdx = PHASES.findIndex(p => i >= p.s && i <= p.e);
  const ph       = PHASES[phaseIdx];
  const t        = ph.e === ph.s ? 0 : (i - ph.s) / (ph.e - ph.s);

  function m(startV: number, endV: number, field: number, mag: number): number {
    return startV + (endV - startV) * t + (sv(i, field) - 0.5) * 2 * mag;
  }

  return {
    date:             dateStr(i),
    sleepHours:       r1(clamp(m(ph.sleepS, ph.sleepE, 1, 0.28), 4.0, 13.0)),
    sleepEfficiency:  Math.round(clamp(m(ph.effS,   ph.effE,   2, 0.025), 0.55, 0.90) * 100) / 100,
    steps:            Math.round(clamp(m(ph.stepsS, ph.stepsE, 3, 190),   80,   5000)),
    activeMinutes:    Math.round(clamp(m(ph.actS,   ph.actE,   4, 3.5),   1,    60)),
    restingHeartRate: Math.round(clamp(m(ph.rhrS,   ph.rhrE,   5, 1.8),   50,   110)),
    hrvRmssd:         Math.round(clamp(m(ph.hrvS,   ph.hrvE,   6, 1.8),   4,    45)),
    breathingRate:    r1(clamp(m(ph.brS,    ph.brE,    7, 0.45),  11,   25)),
    spo2Avg:          Math.round(clamp(m(ph.spo2S,  ph.spo2E,  8, 0.0045), 0.88, 0.99) * 1000) / 1000,
    deviceSyncedAt:   sv(i, 9) < ph.syncR ? syncStr(i, i) : null,
    routineCompleted: ph.routR > 0 && sv(i, 10) < ph.routR,
    checkIn:          buildCheckIn(i, phaseIdx, t),
  };
}

// ─── export ───────────────────────────────────────────────────────────────────

export const mariaTrack: RecoveryTrack = {
  id: 'maria_cardiac',
  label: 'Maria — 72F, Post-Stent, T2 Diabetes',
  description:
    '90-day history. Hospitalized Apr 26–May 2 (readmission #3). ' +
    'Second decline active since May 17 — pattern matches pre-hospitalization trajectory.',
  days: Array.from({ length: 90 }, (_, i) => buildDay(i)),
};
