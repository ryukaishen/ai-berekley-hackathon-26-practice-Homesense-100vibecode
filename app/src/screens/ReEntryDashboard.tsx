import { useState, useMemo } from 'react';
import { FitbitImport } from '../components/FitbitImport';
import { AgentPipeline } from '../components/AgentPipeline';
import { CaregiverPanel } from '../components/CaregiverPanel';
import { computeBaseline } from '../engine/baseline';
import { computeFrictionScore } from '../engine/frictionScorer';
import { runSafetyRouter } from '../engine/safetyRouter';
import { runAgentWorkflow } from '../agents/agentWorkflow';
import type { RecoveryTrack, AgentResult, FrictionLevel } from '../types/index';

const FRICTION_COLORS: Record<FrictionLevel, string> = {
  low: 'text-green-600',
  moderate: 'text-yellow-600',
  elevated: 'text-orange-500',
  high: 'text-red-600',
};

const FRICTION_BAR: Record<FrictionLevel, string> = {
  low: 'bg-green-500',
  moderate: 'bg-yellow-400',
  elevated: 'bg-orange-400',
  high: 'bg-red-500',
};

function ZScore({ z }: { z: number }) {
  const color = z > -0.5 ? 'text-green-600' : z >= -1.0 ? 'text-yellow-600' : 'text-red-500';
  const sign = z >= 0 ? '+' : '';
  return <span className={`text-xs ${color}`}>(z = {sign}{z.toFixed(1)})</span>;
}

interface MetricTileProps {
  label: string;
  value: string;
  zScore: number;
}

function MetricTile({ label, value, zScore }: MetricTileProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-slate-800">{value}</p>
      <ZScore z={zScore} />
    </div>
  );
}

interface Props {
  onNavigateCareTeam: () => void;
  onNavigateEval: () => void;
}

export function ReEntryDashboard({ onNavigateCareTeam, onNavigateEval }: Props) {
  const [selectedTrack, setSelectedTrack] = useState<RecoveryTrack | null>(null);
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);

  const apiKey = (import.meta as unknown as { env: Record<string, string> }).env.VITE_ANTHROPIC_API_KEY ?? null;

  const derived = useMemo(() => {
    if (!selectedTrack || selectedTrack.days.length < 4) return null;
    try {
      const today = selectedTrack.days[selectedTrack.days.length - 1];
      const baseline = computeBaseline(selectedTrack.days);
      const friction = computeFrictionScore(today, baseline);
      const safety = runSafetyRouter(today, friction);
      return { today, baseline, friction, safety };
    } catch {
      return null;
    }
  }, [selectedTrack]);

  const handleImport = (track: RecoveryTrack) => {
    setSelectedTrack(track);
    setAgentResult(null);
    setAgentError(null);

    // Compute derived values and run agents
    try {
      const today = track.days[track.days.length - 1];
      const baseline = computeBaseline(track.days);
      const friction = computeFrictionScore(today, baseline);
      const safety = runSafetyRouter(today, friction);

      if (!safety.blockedAgents) {
        setIsLoadingAgents(true);
        void runAgentWorkflow(today, baseline, friction, safety, apiKey || null)
          .then(result => {
            setAgentResult(result);
            setIsLoadingAgents(false);
          })
          .catch(err => {
            setAgentError(err instanceof Error ? err.message : 'Agent error');
            setIsLoadingAgents(false);
          });
      }
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : 'Scoring error');
    }
  };

  const handleReset = () => {
    setSelectedTrack(null);
    setAgentResult(null);
    setAgentError(null);
    setIsLoadingAgents(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <span className="font-semibold text-slate-900 text-lg">ReEntry</span>
          <span className="hidden sm:inline text-xs text-slate-400 ml-3">
            Recovery coordination for the gap between discharge and recovery
          </span>
        </div>
        <div className="flex gap-3 text-sm">
          <button onClick={onNavigateCareTeam} className="text-slate-600 hover:text-slate-900 transition-colors">
            Care Team
          </button>
          <button onClick={onNavigateEval} className="text-slate-600 hover:text-slate-900 transition-colors">
            How it works
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Disclaimer */}
        <div className="mb-4 text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded p-2 text-center">
          Prototype. Not a medical device. Not for clinical use.
          Severe symptoms require emergency services.
        </div>

        {!selectedTrack ? (
          <FitbitImport onImport={handleImport} />
        ) : (
          <>
            {/* Track header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-slate-800">{selectedTrack.label}</p>
                <p className="text-xs text-slate-500">{selectedTrack.days.length} days of data</p>
              </div>
              <button
                onClick={handleReset}
                className="text-sm text-slate-500 hover:text-slate-800 underline transition-colors"
              >
                Change scenario
              </button>
            </div>

            {derived ? (
              <>
                {/* Metric tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  <MetricTile
                    label="Sleep"
                    value={`${derived.today.sleepHours.toFixed(1)} hrs`}
                    zScore={derived.baseline.sleepHours.zScore}
                  />
                  <MetricTile
                    label="Resting HR"
                    value={`${derived.today.restingHeartRate} bpm`}
                    zScore={derived.baseline.restingHeartRate.zScore}
                  />
                  <MetricTile
                    label="HRV (RMSSD)"
                    value={`${derived.today.hrvRmssd} ms`}
                    zScore={derived.baseline.hrvRmssd.zScore}
                  />
                  <MetricTile
                    label="Steps"
                    value={derived.today.steps.toLocaleString()}
                    zScore={derived.baseline.steps.zScore}
                  />
                  <MetricTile
                    label="SpO2"
                    value={`${(derived.today.spo2Avg * 100).toFixed(0)}%`}
                    zScore={derived.baseline.sleepEfficiency.zScore}
                  />
                  <MetricTile
                    label="Breathing"
                    value={`${derived.today.breathingRate} br/min`}
                    zScore={derived.baseline.breathingRate.zScore}
                  />
                </div>

                {/* Friction score */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm mb-6">
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Recovery friction</p>
                  <div className="flex items-end gap-3 mb-2">
                    <span className={`text-6xl font-bold ${FRICTION_COLORS[derived.friction.level]}`}>
                      {derived.friction.total}
                    </span>
                    <span className="text-slate-400 text-lg mb-1">/ 100</span>
                    <span
                      className={`mb-2 text-sm font-medium px-2 py-0.5 rounded ${FRICTION_BAR[derived.friction.level]} text-white`}
                    >
                      {derived.friction.level.toUpperCase()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="flex h-3 rounded-full overflow-hidden mb-3">
                    <div className="flex-1 bg-green-200" />
                    <div className="flex-1 bg-yellow-200" />
                    <div className="flex-1 bg-orange-200" />
                    <div className="flex-1 bg-red-200" />
                  </div>
                  <div
                    className="relative h-3 -mt-3 mb-3"
                    style={{ pointerEvents: 'none' }}
                  >
                    <div
                      className="absolute top-0 w-3 h-3 bg-slate-700 rounded-full border-2 border-white shadow"
                      style={{ left: `calc(${derived.friction.total}% - 6px)` }}
                    />
                  </div>

                  <div className="text-xs text-slate-600 space-y-0.5 mt-2">
                    {derived.friction.topDrivers.map((d, i) => (
                      <p key={i} className="before:content-['→'] before:mr-1">{d}</p>
                    ))}
                  </div>
                </div>

                {/* Agent pipeline */}
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                    Agent Pipeline
                  </h2>
                  {agentError && (
                    <p className="text-sm text-red-600 mb-2">{agentError}</p>
                  )}
                  <AgentPipeline
                    result={agentResult}
                    safety={derived.safety}
                    isLoading={isLoadingAgents}
                  />
                </div>

                {/* Caregiver panel */}
                {agentResult && !isLoadingAgents && (
                  <div className="mb-6">
                    <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                      Caregiver Message
                    </h2>
                    <CaregiverPanel
                      draft={agentResult.caregiverDraft}
                      patientLabel={selectedTrack.label}
                      frictionLevel={derived.friction.level}
                      safetyLevel={derived.safety.level}
                    />
                  </div>
                )}

                {/* Clinician summary */}
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
              </>
            ) : (
              <p className="text-slate-500 text-sm">Not enough data to compute baseline. Need at least 4 days.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
