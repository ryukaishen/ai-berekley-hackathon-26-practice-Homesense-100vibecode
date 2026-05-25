import { ArrowDownRight, ArrowRight, ArrowUpRight, ShieldAlert } from "lucide-react";
import type { AssessmentResult } from "../types";

interface RecoveryScoreCardProps {
  result: AssessmentResult;
}

const concernClass = {
  Low: "chip-green",
  Moderate: "chip-blue",
  Elevated: "chip-amber",
  High: "chip-red",
};

export function RecoveryScoreCard({ result }: RecoveryScoreCardProps) {
  const score = result.score.recoveryFrictionScore;
  const change = result.score.changeFromBaseline;
  const ChangeIcon = change > 2 ? ArrowUpRight : change < -2 ? ArrowDownRight : ArrowRight;

  return (
    <section className="result-grid">
      <article className="score-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Supportive indicator</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Recovery Friction Score</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Higher means more friction to organize for follow-up. This is not a medical diagnosis.
            </p>
          </div>
          <ShieldAlert className="h-7 w-7 text-coral" aria-hidden="true" />
        </div>
        <div className="mt-6 flex items-center gap-5">
          <div
            className="radial-score"
            style={{ background: `conic-gradient(#f9735b ${score * 3.6}deg, #e2e8f0 0deg)` }}
          >
            <span>{score}</span>
          </div>
          <div>
            <span className={`status-chip ${concernClass[result.score.concernLevel]}`}>
              {result.score.concernLevel} follow-up priority
            </span>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{result.supportiveSummary}</p>
          </div>
        </div>
      </article>

      <article className="mini-result-card">
        <p className="text-sm font-black text-slate-500">Mobility Confidence</p>
        <p className="mt-3 text-4xl font-black text-slate-950">{result.score.mobilityConfidence}/100</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Confidence combines movement consistency, symptom burden, and baseline comparison.
        </p>
      </article>

      <article className="mini-result-card">
        <p className="text-sm font-black text-slate-500">Change Since Last Check</p>
        <div className="mt-3 flex items-center gap-2">
          <ChangeIcon className={`h-6 w-6 ${change > 0 ? "text-coral" : change < 0 ? "text-emerald-700" : "text-slate-500"}`} />
          <p className="text-4xl font-black text-slate-950">{change > 0 ? "+" : ""}{change}</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Positive change means more recovery friction than the previous mock baseline.
        </p>
      </article>
    </section>
  );
}
