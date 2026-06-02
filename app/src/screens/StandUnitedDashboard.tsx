import { useEffect, useMemo, useState } from 'react';
import { FamilyAlertBanner } from '../components/FamilyAlertBanner';
import { PatternMatchCard } from '../components/PatternMatchCard';
import { AgentPipeline } from '../components/AgentPipeline';
import { CaregiverPanel } from '../components/CaregiverPanel';
import { mariaTrack, MARIA_FIRST_DECLINE_START } from '../data/mockMaria';
import { computeBaseline } from '../engine/baseline';
import { computeFrictionScore } from '../engine/frictionScorer';
import { runSafetyRouter } from '../engine/safetyRouter';
import { runAgentWorkflow } from '../agents/agentWorkflow';
import type { AgentResult, FrictionLevel } from '../types/index';

const FRICTION_COLORS: Record<FrictionLevel, string> = {
  low:      'text-green-600',
  moderate: 'text-yellow-600',
  elevated: 'text-orange-500',
  high:     'text-red-600',
};

const FRICTION_BAR: Record<FrictionLevel, string> = {
  low:      'bg-green-500',
  moderate: 'bg-yellow-400',
  elevated: 'bg-orange-400',
  high:     'bg-red-500',
};

function ZScore({ z }: { z: number }) {
  const color = z > -0.5 ? 'text-green-600' : z >= -1.0 ? 'text-yellow-600' : 'text-red-500';
  const sign  = z >= 0 ? '+' : '';
  return <span className={`text-xs ${color}`}>(z = {sign}{z.toFixed(1)})</span>;
}

function MetricTile({ label, value, zScore }: { label: string; value: string; zScore: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-slate-800">{value}</p>
      <ZScore z={zScore} />
    </div>
  );
}

interface Props {
  onNavigatePatient: () => void;
}

// Use stable 42-day period + today to show z-scores relative to Maria's "normal"
const STABLE_DAYS = mariaTrack.days.slice(0, 42);
const TODAY       = mariaTrack.days[mariaTrack.days.length - 1];
const REFERENCE   = [...STABLE_DAYS, TODAY];

// Pattern windows: last 7 days of decline 1 (days 49–55) vs last 7 days of decline 2 (days 83–89)
const PRIOR_WINDOW_START   = 49;
const CURRENT_WINDOW_START = 83;
const WINDOW_SIZE          = 7;

export function StandUnitedDashboard({ onNavigatePatient }: Props) {
  const [agentResult, setAgentResult]     = useState<AgentResult | null>(null);
  const [isLoadingAgents, setIsLoading]   = useState(false);
  const [agentError, setAgentError]       = useState<string | null>(null);

  const apiKey = (import.meta as unknown as { env: Record<string, string> }).env.VITE_ANTHROPIC_API_KEY ?? null;

  const derived = useMemo(() => {
    const baseline = computeBaseline(REFERENCE);
    const friction = computeFrictionScore(TODAY, baseline);
    const safety   = runSafetyRouter(TODAY, friction);
    return { baseline, friction, safety };
  }, []);

  const lastNote = useMemo(() =>
    mariaTrack.days.slice(77).reverse().find(d => d.checkIn?.note)?.checkIn?.note ?? null
  , []);

  // Auto-run agents on mount — the system acts without waiting for a button press
  useEffect(() => {
    if (derived.safety.blockedAgents) return;
    setIsLoading(true);
    void runAgentWorkflow(TODAY, derived.baseline, derived.friction, derived.safety, apiKey)
      .then(result => { setAgentResult(result); setIsLoading(false); })
      .catch(err  => { setAgentError(err instanceof Error ? err.message : 'Agent error'); setIsLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { baseline, friction, safety } = derived;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <span className="font-black text-slate-900 text-lg">StandUnited</span>
          <span className="hidden sm:inline text-xs text-slate-400 ml-3">
            Family dashboard — Maria's early warning system
          </span>
        </div>
        <button onClick={onNavigatePatient} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
          Maria's View →
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4 text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded p-2 text-center">
          Prototype. Not a medical device. Severe symptoms require emergency services.
        </div>

        {/* Alert banner — the product moment */}
        <div className="mb-4">
          <FamilyAlertBanner
            friction={friction}
            safety={safety}
            patientName="Maria"
            firstDeclineStart={MARIA_FIRST_DECLINE_START}
            lastNote={lastNote}
          />
        </div>

        {/* Pattern match — side-by-side comparison */}
        <div className="mb-6">
          <PatternMatchCard
            days={mariaTrack.days}
            priorStart={PRIOR_WINDOW_START}
            currentStart={CURRENT_WINDOW_START}
            windowSize={WINDOW_SIZE}
            hospitalizationLabel="her April 26 hospitalization"
          />
        </div>

        {/* Today's metrics */}
        <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
          Today's Readings — May 29
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <MetricTile label="Steps"        value={TODAY.steps.toLocaleString()}                        zScore={baseline.steps.zScore} />
          <MetricTile label="Sleep"        value={`${TODAY.sleepHours.toFixed(1)} hr`}                zScore={baseline.sleepHours.zScore} />
          <MetricTile label="Resting HR"   value={`${TODAY.restingHeartRate} bpm`}                    zScore={baseline.restingHeartRate.zScore} />
          <MetricTile label="HRV (RMSSD)"  value={`${TODAY.hrvRmssd} ms`}                             zScore={baseline.hrvRmssd.zScore} />
          <MetricTile label="SpO₂"         value={`${(TODAY.spo2Avg * 100).toFixed(0)}%`}             zScore={baseline.sleepEfficiency.zScore} />
          <MetricTile label="Breathing"    value={`${TODAY.breathingRate} br/min`}                    zScore={baseline.breathingRate.zScore} />
        </div>

        {/* Friction score */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm mb-6">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Recovery friction</p>
          <div className="flex items-end gap-3 mb-2">
            <span className={`text-6xl font-bold ${FRICTION_COLORS[friction.level]}`}>
              {friction.total}
            </span>
            <span className="text-slate-400 text-lg mb-1">/ 100</span>
            <span className={`mb-2 text-sm font-medium px-2 py-0.5 rounded ${FRICTION_BAR[friction.level]} text-white`}>
              {friction.level.toUpperCase()}
            </span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden mb-3">
            <div className="flex-1 bg-green-200" />
            <div className="flex-1 bg-yellow-200" />
            <div className="flex-1 bg-orange-200" />
            <div className="flex-1 bg-red-200" />
          </div>
          <div className="relative h-3 -mt-3 mb-3" style={{ pointerEvents: 'none' }}>
            <div
              className="absolute top-0 w-3 h-3 bg-slate-700 rounded-full border-2 border-white shadow"
              style={{ left: `calc(${friction.total}% - 6px)` }}
            />
          </div>
          <div className="text-xs text-slate-600 space-y-0.5 mt-2">
            {friction.topDrivers.map((d, i) => (
              <p key={i} className="before:content-['→'] before:mr-1">{d}</p>
            ))}
          </div>
        </div>

        {/* Agent pipeline — auto-fired on mount */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
            Agent Pipeline
            {isLoadingAgents && (
              <span className="ml-2 text-xs text-blue-500 font-normal normal-case animate-pulse">
                Running automatically…
              </span>
            )}
          </h2>
          {agentError && <p className="text-sm text-red-600 mb-2">{agentError}</p>}
          <AgentPipeline result={agentResult} safety={safety} isLoading={isLoadingAgents} />
        </div>

        {/* Caregiver message */}
        {agentResult && !isLoadingAgents && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
              Family Alert — Ready to Send
            </h2>
            <CaregiverPanel
              draft={agentResult.caregiverDraft}
              patientLabel="Maria"
              frictionLevel={friction.level}
              safetyLevel={safety.level}
            />
          </div>
        )}

        {/* Clinician note */}
        {agentResult && !isLoadingAgents && (
          <div className="mb-6 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-1 uppercase tracking-wide">
              Clinician Summary
            </h2>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded p-2 mb-3">
              PROTOTYPE — PATIENT-REPORTED DATA — FOR CLINICAL REVIEW ONLY
            </p>
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
              {agentResult.clinicianSummary}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
