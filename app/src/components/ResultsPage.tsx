import { BadgeCheck, Gauge, Info, RotateCcw } from "lucide-react";
import type { AccessibilityPrefs, AssessmentResult, PatientScenario } from "../types";
import { CaregiverMode } from "./CaregiverMode";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { FindingsCard } from "./FindingsCard";
import { MessageDraft } from "./MessageDraft";
import { RecoveryScoreCard } from "./RecoveryScoreCard";

interface ResultsPageProps {
  scenario: PatientScenario;
  result: AssessmentResult;
  prefs: AccessibilityPrefs;
  caregiverMode: boolean;
  onCaregiverModeChange: (enabled: boolean) => void;
  onRunAgain: () => void;
}

const statusClass = {
  Low: "chip-green",
  Moderate: "chip-blue",
  Elevated: "chip-amber",
  High: "chip-red",
};

export function ResultsPage({
  scenario,
  result,
  prefs,
  caregiverMode,
  onCaregiverModeChange,
  onRunAgain,
}: ResultsPageProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-12">
      <section className="results-header">
        <div>
          <p className="eyebrow">Results page</p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-slate-950 md:text-5xl">
            {scenario.shortTitle}: recovery friction organized.
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
            Completed {result.test} in {result.mode} mode at {result.completedAt}. {result.framesAnalyzed} frames were
            analyzed in the demo stream.
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={onRunAgain}>
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Run Another Check
        </button>
      </section>

      <div className="mt-5">
        <DisclaimerBanner compact />
      </div>

      <div className="mt-6">
        <RecoveryScoreCard result={result} />
      </div>

      <section className="mt-6">
        <div className="mb-4 flex items-center gap-2">
          <Gauge className="h-6 w-6 text-teal-700" aria-hidden="true" />
          <h2 className="text-2xl font-black text-slate-950">Prototype Metrics</h2>
          <span className="status-chip chip-slate">supportive indicators only</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.metrics.map((metric) => (
            <article key={metric.id} className="metric-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    {metric.value}
                    <span className="text-lg text-slate-500">{metric.unit}</span>
                  </p>
                </div>
                <span className={`status-chip ${statusClass[metric.status]}`}>{metric.status}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-6">
        <FindingsCard result={result} prefs={prefs} />
      </div>

      <div className="mt-6">
        <CaregiverMode result={result} enabled={caregiverMode} onToggle={onCaregiverModeChange} />
      </div>

      <section className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="info-card">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-6 w-6 text-teal-700" aria-hidden="true" />
            <h2 className="text-2xl font-black text-slate-950">Care-Team Summary</h2>
          </div>
          <p className="mt-4 text-sm font-semibold leading-7 text-slate-700">
            {prefs.spanishSummary ? result.spanishSummary : result.clinicianSummary}
          </p>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-sm font-black text-slate-950">
              <Info className="h-4 w-4 text-coral" aria-hidden="true" />
              Clinical framing
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              StandWise uses language like mobility concern, recovery friction, symptom trend to monitor, and
              follow-up recommended. It never confirms a diagnosis or changes treatment.
            </p>
          </div>
        </article>
        <MessageDraft drafts={result.messageDrafts} />
      </section>

      <section className="mt-6">
        <article className="info-card">
          <h2 className="text-2xl font-black text-slate-950">Backend triage engine</h2>
          {result.backendSummary ? (
            <>
              <p className="mt-3 text-sm leading-6 text-slate-700">{result.backendSummary.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`status-chip ${statusClass[result.backendSummary.concernLevel]}`}>
                  {result.backendSummary.concernLevel} concern
                </span>
                <span className="status-chip chip-slate">{result.backendSummary.outreachPriority} outreach</span>
                <span className="status-chip chip-slate">Burden {result.backendSummary.symptomBurdenScore}/100</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="font-black text-slate-900">Why this level</p>
                  {result.backendSummary.rationale.map((line) => (
                    <p key={line} className="mt-2 text-sm leading-6 text-slate-600">
                      {line}
                    </p>
                  ))}
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="font-black text-slate-900">Recommended next actions</p>
                  {result.backendSummary.recommendedActions.map((line) => (
                    <p key={line} className="mt-2 text-sm leading-6 text-slate-600">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Backend sync is unavailable, so this run is using local analysis only.
            </p>
          )}
        </article>
      </section>
    </main>
  );
}

