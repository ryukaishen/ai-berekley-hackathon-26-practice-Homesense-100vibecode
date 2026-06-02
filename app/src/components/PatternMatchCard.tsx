import type { DailyRecoverySignal } from '../types/index';

interface Props {
  days: DailyRecoverySignal[];
  priorStart: number;
  currentStart: number;
  windowSize: number;
  hospitalizationLabel: string;
}

function avg(vals: number[]): number {
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function windowAvgs(days: DailyRecoverySignal[], start: number, size: number) {
  const slice = days.slice(start, start + size);
  return {
    steps:    Math.round(avg(slice.map(d => d.steps))),
    sleep:    Math.round(avg(slice.map(d => d.sleepHours)) * 10) / 10,
    rhr:      Math.round(avg(slice.map(d => d.restingHeartRate))),
    hrv:      Math.round(avg(slice.map(d => d.hrvRmssd))),
    spo2:     Math.round(avg(slice.map(d => d.spo2Avg)) * 1000) / 10,
    routine:  Math.round(avg(slice.map(d => d.routineCompleted ? 1 : 0)) * 100),
    synced:   Math.round(avg(slice.map(d => d.deviceSyncedAt ? 1 : 0)) * 100),
  };
}

type Delta = 'up' | 'down' | 'same';

function delta(prior: number, current: number, higherIsBetter: boolean): Delta {
  const diff = current - prior;
  if (Math.abs(diff) < 0.5) return 'same';
  const isWorse = higherIsBetter ? diff < 0 : diff > 0;
  return isWorse ? 'down' : 'up';
}

function DeltaBadge({ d }: { d: Delta }) {
  if (d === 'same') return <span className="text-slate-400 text-xs">→</span>;
  if (d === 'down') return <span className="text-red-500 text-xs font-bold">↓</span>;
  return <span className="text-green-500 text-xs font-bold">↑</span>;
}

interface RowProps {
  label: string;
  unit: string;
  prior: number;
  current: number;
  higherIsBetter: boolean;
  isAlarmLow?: number;
}

function MetricRow({ label, unit, prior, current, higherIsBetter, isAlarmLow }: RowProps) {
  const d = delta(prior, current, higherIsBetter);
  const currentIsAlarm = isAlarmLow !== undefined && current <= isAlarmLow;
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2 pr-3 text-xs text-slate-500 whitespace-nowrap">{label}</td>
      <td className="py-2 px-3 text-sm font-mono text-slate-700 text-right">
        {prior}{unit}
      </td>
      <td className={`py-2 pl-3 text-sm font-mono font-semibold text-right ${currentIsAlarm ? 'text-red-600' : 'text-slate-800'}`}>
        {current}{unit} <DeltaBadge d={d} />
      </td>
    </tr>
  );
}

export function PatternMatchCard({ days, priorStart, currentStart, windowSize, hospitalizationLabel }: Props) {
  const prior   = windowAvgs(days, priorStart, windowSize);
  const current = windowAvgs(days, currentStart, windowSize);

  const priorDate   = days[priorStart]?.date ?? '';
  const priorEnd    = days[Math.min(priorStart + windowSize - 1, days.length - 1)]?.date ?? '';
  const currentDate = days[currentStart]?.date ?? '';
  const currentEnd  = days[Math.min(currentStart + windowSize - 1, days.length - 1)]?.date ?? '';

  function fmt(iso: string) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="bg-white border border-red-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-red-50 px-4 py-3 border-b border-red-200">
        <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Pattern Match</p>
        <p className="text-sm text-red-800 mt-0.5">
          This week's trajectory mirrors the {windowSize} days before {hospitalizationLabel}.
        </p>
      </div>

      <div className="px-4 pt-3 pb-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-2 text-left text-xs text-slate-400 font-medium w-1/3">Metric</th>
              <th className="pb-2 text-right text-xs text-amber-700 font-semibold w-1/3">
                {fmt(priorDate)}–{fmt(priorEnd)}
                <span className="block font-normal text-amber-600">before hospitalization</span>
              </th>
              <th className="pb-2 text-right text-xs text-red-700 font-semibold w-1/3">
                {fmt(currentDate)}–{fmt(currentEnd)}
                <span className="block font-normal text-red-600">this week</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <MetricRow label="Steps/day"     unit=""    prior={prior.steps}   current={current.steps}   higherIsBetter={true}  isAlarmLow={1000} />
            <MetricRow label="Sleep"         unit=" hr" prior={prior.sleep}   current={current.sleep}   higherIsBetter={false} />
            <MetricRow label="Resting HR"    unit=" bpm" prior={prior.rhr}   current={current.rhr}     higherIsBetter={false} isAlarmLow={0} />
            <MetricRow label="HRV (RMSSD)"   unit=" ms" prior={prior.hrv}    current={current.hrv}     higherIsBetter={true}  isAlarmLow={15} />
            <MetricRow label="SpO₂"          unit="%"   prior={prior.spo2}   current={current.spo2}    higherIsBetter={true}  isAlarmLow={94} />
            <MetricRow label="Routine done"  unit="%"   prior={prior.routine} current={current.routine} higherIsBetter={true} />
            <MetricRow label="Device synced" unit="%"   prior={prior.synced}  current={current.synced}  higherIsBetter={true} />
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Baseline (Mar 1–Apr 11): ~2,800 steps · 7.0 hr sleep · HR 70 bpm · HRV 24 ms
        </p>
      </div>
    </div>
  );
}
