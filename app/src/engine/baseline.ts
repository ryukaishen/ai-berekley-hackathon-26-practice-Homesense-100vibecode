import type { DailyRecoverySignal } from '../types/index';

export interface MetricBaseline {
  mean: number;
  stdDev: number;
  zScore: number;
}

export interface BaselineResult {
  sleepHours: MetricBaseline;
  sleepEfficiency: MetricBaseline;
  steps: MetricBaseline;
  activeMinutes: MetricBaseline;
  restingHeartRate: MetricBaseline;
  hrvRmssd: MetricBaseline;
  breathingRate: MetricBaseline;
  windowDays: number;
  computedAt: string;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function stats(values: number[], todayValue: number): MetricBaseline {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  const zScore = stdDev === 0 ? 0 : (todayValue - mean) / stdDev;
  return { mean: round4(mean), stdDev: round4(stdDev), zScore: round4(zScore) };
}

export function computeBaseline(days: DailyRecoverySignal[], windowDays = 7): BaselineResult {
  if (days.length < 2) throw new Error('Insufficient data: need at least 3 days');

  const today = days[days.length - 1];
  const prior = days.slice(0, -1);
  const synced = prior.filter(d => d.deviceSyncedAt !== null);
  const window = synced.slice(-windowDays);

  if (window.length < 3) throw new Error('Insufficient data: need at least 3 days');

  return {
    sleepHours: stats(window.map(d => d.sleepHours), today.sleepHours),
    sleepEfficiency: stats(window.map(d => d.sleepEfficiency), today.sleepEfficiency),
    steps: stats(window.map(d => d.steps), today.steps),
    activeMinutes: stats(window.map(d => d.activeMinutes), today.activeMinutes),
    restingHeartRate: stats(window.map(d => d.restingHeartRate), today.restingHeartRate),
    hrvRmssd: stats(window.map(d => d.hrvRmssd), today.hrvRmssd),
    breathingRate: stats(window.map(d => d.breathingRate), today.breathingRate),
    windowDays: window.length,
    computedAt: new Date().toISOString(),
  };
}
