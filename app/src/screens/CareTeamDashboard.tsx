import { useState, useMemo } from 'react';
import { mockTracks } from '../data/mockTracks';
import { computeBaseline } from '../engine/baseline';
import { computeFrictionScore } from '../engine/frictionScorer';
import { runSafetyRouter } from '../engine/safetyRouter';
import type { FrictionLevel, SafetyLevel } from '../types/index';

interface PatientRow {
  name: string;
  age: number;
  trackLabel: string;
  daysInRecovery: number;
  frictionScore: number;
  frictionLevel: FrictionLevel;
  safetyLevel: SafetyLevel;
  lastCheckIn: string;
  outreachDraft: string;
}

const FRICTION_BADGE: Record<FrictionLevel, string> = {
  low: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  elevated: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

const SAFETY_BADGE: Record<SafetyLevel, string> = {
  clear: 'bg-slate-100 text-slate-600',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-600 text-white font-bold',
};

function frictionLevel(score: number): FrictionLevel {
  if (score <= 24) return 'low';
  if (score <= 49) return 'moderate';
  if (score <= 74) return 'elevated';
  return 'high';
}

export function CareTeamDashboard() {
  const [sortBy, setSortBy] = useState<'friction' | 'days'>('friction');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const realRows: PatientRow[] = useMemo(() => {
    return mockTracks.map(track => {
      const today = track.days[track.days.length - 1];
      let frictionScore = 50;
      let safetyLevel: SafetyLevel = 'clear';
      try {
        const baseline = computeBaseline(track.days);
        const friction = computeFrictionScore(today, baseline);
        const safety = runSafetyRouter(today, friction);
        frictionScore = friction.total;
        safetyLevel = safety.level;
      } catch { /* use defaults */ }

      const names: Record<string, string> = {
        concussion_college: 'Jordan M.',
        post_hospital: 'Alex T.',
        burnout_worker: 'Sam K.',
      };
      const ages: Record<string, number> = {
        concussion_college: 20,
        post_hospital: 22,
        burnout_worker: 26,
      };

      return {
        name: names[track.id] ?? track.label,
        age: ages[track.id] ?? 21,
        trackLabel: track.label,
        daysInRecovery: track.days.length,
        frictionScore,
        frictionLevel: frictionLevel(frictionScore),
        safetyLevel,
        lastCheckIn: today.checkIn ? today.date : 'No check-in',
        outreachDraft: `Draft message for ${names[track.id] ?? track.label}: Their recovery signals suggest ${frictionLevel(frictionScore)} friction today. Consider checking in.`,
      };
    });
  }, []);

  // 3 additional hardcoded rows for a fuller dashboard
  const fakeRows: PatientRow[] = [
    {
      name: 'Marcus T.',
      age: 24,
      trackLabel: 'Post-Hospital Return',
      daysInRecovery: 4,
      frictionScore: 78,
      frictionLevel: 'high',
      safetyLevel: 'yellow',
      lastCheckIn: '2025-05-13',
      outreachDraft: 'Draft message for Marcus T.: Their recovery signals suggest high friction today. Consider checking in.',
    },
    {
      name: 'Priya K.',
      age: 19,
      trackLabel: 'Concussion — College Student',
      daysInRecovery: 2,
      frictionScore: 85,
      frictionLevel: 'high',
      safetyLevel: 'red',
      lastCheckIn: '2025-05-03',
      outreachDraft: 'Draft message for Priya K.: Their recovery signals suggest high friction today. Consider checking in.',
    },
    {
      name: 'Devon L.',
      age: 28,
      trackLabel: 'Burnout Recovery — Early Career',
      daysInRecovery: 10,
      frictionScore: 38,
      frictionLevel: 'moderate',
      safetyLevel: 'clear',
      lastCheckIn: '2025-05-12',
      outreachDraft: 'Draft message for Devon L.: Their recovery signals suggest moderate friction today. Consider checking in.',
    },
  ];

  const allRows = [...realRows, ...fakeRows];

  const sorted = [...allRows].sort((a, b) =>
    sortBy === 'friction'
      ? b.frictionScore - a.frictionScore
      : b.daysInRecovery - a.daysInRecovery,
  );

  const highFrictionCount = allRows.filter(r => r.frictionScore >= 75).length;
  const redEmergencyCount = allRows.filter(r => r.safetyLevel === 'red' || r.safetyLevel === 'emergency').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Care team — outreach priority</h1>
        <p className="text-sm text-slate-500 mb-5">
          Sorted by recovery friction. High-friction patients appear first.
        </p>

        {/* Summary row */}
        <div className="flex gap-4 mb-5">
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-800">{allRows.length}</p>
            <p className="text-xs text-slate-500">Total patients</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-red-700">{highFrictionCount}</p>
            <p className="text-xs text-red-500">High friction</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-orange-700">{redEmergencyCount}</p>
            <p className="text-xs text-orange-500">Red / emergency</p>
          </div>
        </div>

        {/* Sort controls */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSortBy('friction')}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              sortBy === 'friction'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            By friction (default)
          </button>
          <button
            onClick={() => setSortBy('days')}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              sortBy === 'days'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            By days in recovery
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Patient</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Track</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Days</th>
                <th className="text-left px-4 py-3">Friction</th>
                <th className="text-left px-4 py-3">Safety</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Last check-in</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map(row => (
                <>
                  <tr
                    key={row.name}
                    className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                      row.frictionScore >= 75 ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {row.name}
                      <span className="text-slate-400 font-normal ml-1 text-xs">age {row.age}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{row.trackLabel}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">Day {row.daysInRecovery}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${FRICTION_BADGE[row.frictionLevel]}`}>
                        {row.frictionScore} — {row.frictionLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${SAFETY_BADGE[row.safetyLevel]}`}>
                        {row.safetyLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{row.lastCheckIn}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpandedRow(expandedRow === row.name ? null : row.name)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
                      >
                        Outreach
                      </button>
                    </td>
                  </tr>
                  {expandedRow === row.name && (
                    <tr key={`${row.name}-expanded`} className="bg-blue-50 border-b border-slate-100">
                      <td colSpan={7} className="px-4 py-3 text-sm text-slate-700 italic">
                        {row.outreachDraft}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-slate-400 text-center">
          This dashboard uses simulated data only. Not for clinical use. Real deployment requires
          HIPAA-compliant infrastructure and clinician oversight.
        </p>
      </div>
    </div>
  );
}
