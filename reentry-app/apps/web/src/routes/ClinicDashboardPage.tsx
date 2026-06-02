import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, BrainCircuit, ClipboardCheck, GraduationCap, HeartPulse, ShieldCheck } from "lucide-react";
import {
  buildClinicDashboard,
  getFrictionDomainForLabel,
  recoveryFrictionDefinition,
  trainRecoveryRiskModel,
  type ClinicDashboardPerson
} from "@reentry/shared";
import { Button, PageHeader, SurfaceCard } from "@reentry/ui";

type DashboardFilter = "all" | ClinicDashboardPerson["program"];

export function ClinicDashboardPage() {
  const [model, setModel] = useState(() => trainRecoveryRiskModel());
  const [filter, setFilter] = useState<DashboardFilter>("all");
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(() => new Set());
  const [status, setStatus] = useState("Demo queue loaded. Train the model or copy a handoff summary.");
  const queue = useMemo(() => buildClinicDashboard(model), [model]);
  const visibleQueue = filter === "all" ? queue : queue.filter((person) => person.program === filter);
  const highCount = queue.filter((person) => person.prediction.label === "high").length;

  const trainModel = () => {
    const nextModel = trainRecoveryRiskModel();
    setModel(nextModel);
    setStatus(`Demo risk model trained on ${nextModel.metrics.examples} synthetic baseline-deviation examples.`);
  };

  const copyHandoff = async (person: ClinicDashboardPerson) => {
    const handoff = [
      `${person.displayName} - ${person.track.title}`,
      `Risk: ${person.prediction.label} (${Math.round(person.prediction.probability * 100)}%)`,
      `Drivers: ${person.prediction.drivers.join(", ")}`,
      person.workflow.clinicianSummary.summary,
      "Non-clinical support summary only. No diagnosis or medication advice generated."
    ].join("\n");

    await navigator.clipboard.writeText(handoff);
    setStatus(`${person.displayName}'s handoff summary copied with structured facts only.`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Clinic / Campus Dashboard"
        title="A triage queue for support teams, not another wellness chart"
        subtitle="This mock dashboard shows how ReEntry could help a campus clinic, chronic-care program, or rehab coordinator see who needs outreach and why."
        action={
          <div className="action-row">
            <Button onClick={trainModel}>
              <BrainCircuit aria-hidden="true" size={16} />
              Train demo model
            </Button>
            <Link className="focus-ring re-btn re-btn-ghost" to="/onboarding">
              Edit onboarding setup
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        }
      />

      <section className="clinic-overview">
        <SurfaceCard title="Demo model" subtitle="Logistic risk model trained on synthetic recovery-track examples.">
          <div className="clinic-model-grid">
            <ModelMetric label="Examples" value={`${model.metrics.examples}`} />
            <ModelMetric label="Accuracy" value={`${toPercent(model.metrics.accuracy)}%`} />
            <ModelMetric label="Precision" value={`${toPercent(model.metrics.precision)}%`} />
            <ModelMetric label="Recall" value={`${toPercent(model.metrics.recall)}%`} />
          </div>
          <p className="permission-notice mt-3">
            {recoveryFrictionDefinition} Prototype only: the model predicts support priority from baseline deviation. It is not clinically validated and does not diagnose.
          </p>
        </SurfaceCard>

        <SurfaceCard title="Queue snapshot" subtitle="Support teams get a small, explainable list.">
          <div className="clinic-snapshot">
            <div>
              <span>{queue.length}</span>
              <small>people monitored</small>
            </div>
            <div>
              <span>{highCount}</span>
              <small>high support priority</small>
            </div>
            <div>
              <span>{reviewedIds.size}</span>
              <small>reviewed this demo</small>
            </div>
          </div>
        </SurfaceCard>
      </section>

      <section className="clinic-filter-row" aria-label="Dashboard filters">
        {(["all", "campus", "clinic", "rehab"] as DashboardFilter[]).map((item) => (
          <button
            key={item}
            type="button"
            className={`support-chip-button focus-ring ${filter === item ? "support-chip-button-active" : ""}`}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {formatLabel(item)}
          </button>
        ))}
      </section>

      <section className="clinic-queue">
        {visibleQueue.map((person) => (
          <article key={person.id} className={`clinic-person-card clinic-risk-${person.prediction.label}`}>
            <div className="clinic-person-topline">
              <div>
                <p className="re-eyebrow">{formatLabel(person.program)} queue</p>
                <h2>{person.displayName}</h2>
                <p>{person.track.title} - {formatLabel(person.ageRange)}</p>
              </div>
              <div className="clinic-risk-score">
                <span>{Math.round(person.prediction.probability * 100)}%</span>
                <small>{person.prediction.label}</small>
              </div>
            </div>

            <div className="clinic-signal-grid">
              <SignalPill
                icon={<Activity size={16} />}
                label="Friction"
                value={`${person.analysis.recoveryFrictionScore}/100`}
              />
              <SignalPill
                icon={<HeartPulse size={16} />}
                label="Tomorrow risk"
                value={`${person.analysis.tomorrowHighFrictionRisk}%`}
              />
              <SignalPill
                icon={<GraduationCap size={16} />}
                label="Owner"
                value={person.suggestedOwner}
              />
            </div>

            <div className="clinic-driver-list">
              {person.prediction.drivers.map((driver) => (
                <span key={driver}>
                  {driver}
                  <small>{getFrictionDomainForLabel(driver).title}</small>
                </span>
              ))}
            </div>

            <div className="clinic-handoff-box">
              <ShieldCheck aria-hidden="true" size={18} />
              <p>{person.workflow.clinicianSummary.summary}</p>
            </div>

            <div className="clinic-card-actions">
              <Button
                variant={reviewedIds.has(person.id) ? "ghost" : "solid"}
                onClick={() => {
                  setReviewedIds((current) => new Set(current).add(person.id));
                  setStatus(`${person.displayName} marked reviewed. No outreach is auto-sent.`);
                }}
              >
                <ClipboardCheck aria-hidden="true" size={16} />
                {reviewedIds.has(person.id) ? "Reviewed" : "Mark reviewed"}
              </Button>
              <Button variant="ghost" onClick={() => copyHandoff(person)}>
                Copy handoff
              </Button>
            </div>
            <p className="permission-notice">{person.lastContact}</p>
          </article>
        ))}
      </section>

      <section className="clinic-footer-card">
        <SurfaceCard title="Business wedge" subtitle="This is where ReEntry becomes more than a consumer habit tracker.">
          <p>
            Buyer path: campus wellness teams, diabetes education programs, outpatient rehab, and post-discharge care coordinators.
            The product is not "AI therapy"; it is support-priority routing, caregiver coordination, and clinician-ready summaries.
          </p>
          <div className="route-action-list">
            <Link className="route-action" to="/fitbit">
              <Activity aria-hidden="true" size={18} />
              Open Fitbit workflow
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
          <p className="permission-notice mt-3" role="status">{status}</p>
        </SurfaceCard>
      </section>
    </>
  );
}

function ModelMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="clinic-model-metric">
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}

function SignalPill({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="clinic-signal-pill">
      {icon}
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function toPercent(value: number) {
  return Math.round(value * 100);
}

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}
