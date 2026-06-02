import type { DailyRecoverySignal, FrictionScore, FrictionLevel } from '../types/index';
import type { BaselineResult } from './baseline';

function clamp(value: number, max: number): number {
  return Math.min(value, max);
}

function frictionLevel(total: number): FrictionLevel {
  if (total <= 24) return 'low';
  if (total <= 49) return 'moderate';
  if (total <= 74) return 'elevated';
  return 'high';
}

export function computeFrictionScore(today: DailyRecoverySignal, baseline: BaselineResult): FrictionScore {
  // Sleep component (0–25)
  let sleepPts = 0;
  const sleepZ = baseline.sleepHours.zScore;
  if (sleepZ < -1.0) sleepPts += 10;
  if (sleepZ < -1.5) sleepPts += 5;
  if (sleepZ < -2.0) sleepPts += 5;
  if (today.sleepEfficiency < 0.75) sleepPts += 5;
  sleepPts = clamp(sleepPts, 25);

  // HRV component (0–25)
  let hrvPts = 0;
  const hrvZ = baseline.hrvRmssd.zScore;
  if (hrvZ < -1.0) hrvPts += 10;
  if (hrvZ < -1.5) hrvPts += 8;
  if (hrvZ < -2.0) hrvPts += 7;
  hrvPts = clamp(hrvPts, 25);

  // Activity component (0–25)
  let activityPts = 0;
  const stepsZ = baseline.steps.zScore;
  if (stepsZ < -1.0) activityPts += 8;
  if (today.activeMinutes < 10) activityPts += 10;
  if (!today.routineCompleted) activityPts += 7;
  activityPts = clamp(activityPts, 25);

  // Check-in component (0–25)
  let checkinPts = 0;
  if (today.checkIn === null) {
    checkinPts = 15;
  } else {
    const ci = today.checkIn;
    checkinPts += (5 - ci.energy) * 2;
    checkinPts += (ci.cognitiveLoad - 1) * 2;
    if (ci.bodyState.includes('headache')) checkinPts += 3;
    if (ci.bodyState.includes('brain_fog')) checkinPts += 3;
    if (ci.bodyState.includes('pain')) checkinPts += 2;
    if (ci.bodyState.includes('dizziness')) checkinPts += 3;
  }
  checkinPts = clamp(checkinPts, 25);

  const total = sleepPts + hrvPts + activityPts + checkinPts;

  // Build top drivers from highest components
  const scored = [
    { label: 'sleep', pts: sleepPts, desc: sleepZ < -1.5
      ? `Sleep significantly below baseline (z = ${baseline.sleepHours.zScore.toFixed(1)})`
      : 'Sleep mildly below baseline' },
    { label: 'hrv', pts: hrvPts, desc: hrvZ < -1.5
      ? `HRV reduced: autonomic recovery stress detected (z = ${baseline.hrvRmssd.zScore.toFixed(1)})`
      : 'HRV slightly below baseline' },
    { label: 'activity', pts: activityPts, desc: today.activeMinutes < 10
      ? 'Very low active minutes today'
      : 'Activity below typical baseline' },
    { label: 'checkin', pts: checkinPts, desc: today.checkIn === null
      ? 'No check-in completed today (missing data)'
      : `Check-in burden: energy ${today.checkIn.energy}/5, cognitive load ${today.checkIn.cognitiveLoad}/5` },
  ].sort((a, b) => b.pts - a.pts);

  const topDrivers = scored.filter(s => s.pts > 0).slice(0, 3).map(s => s.desc);

  return {
    total,
    level: frictionLevel(total),
    components: { sleep: sleepPts, hrv: hrvPts, activity: activityPts, checkin: checkinPts },
    topDrivers: topDrivers.length > 0 ? topDrivers : ['No significant friction factors today'],
  };
}
