import { ArrowUpRight, ClipboardCheck, PhoneCall, SearchCheck } from "lucide-react";
import type { DashboardPatient } from "../types";

interface DashboardPreviewProps {
  rows: DashboardPatient[];
  onOpenScenario: (scenarioId: string) => void;
}

const priorityClass = {
  Routine: "chip-green",
  Elevated: "chip-amber",
  Urgent: "chip-red",
};

const concernClass = {
  Low: "chip-green",
  Moderate: "chip-blue",
  Elevated: "chip-amber",
  High: "chip-red",
};

export function DashboardPreview({ rows, onOpenScenario }: DashboardPreviewProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Care-team dashboard preview</p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-slate-950 md:text-6xl">
            Outreach priority from the checks patients finish at home.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
            A hospital, rehab, or home-health team sees who is trending toward higher recovery friction, what changed,
            and what action is appropriate. No real patient data is stored in this demo.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["4", "active demos"],
            ["2", "24h calls"],
            ["0", "diagnoses made"],
          ].map(([value, label]) => (
            <div key={label} className="dashboard-stat">
              <p className="text-3xl font-black text-slate-950">{value}</p>
              <p className="text-sm font-bold text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {[
          { icon: PhoneCall, title: "Outreach queue", detail: "Call patient within 24h when friction and symptoms rise." },
          { icon: SearchCheck, title: "Trend review", detail: "See symptom trend, turn confidence, and supportive indicators." },
          { icon: ClipboardCheck, title: "Follow-up prep", detail: "Draft clinic, PT/OT, and home-health summaries." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="info-card">
              <Icon className="h-6 w-6 text-teal-700" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-black text-slate-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase text-slate-500 lg:grid-cols-[1.15fr_0.7fr_0.8fr_0.8fr_0.85fr_1.2fr_0.45fr]">
          <span>Patient</span>
          <span>Last check</span>
          <span>Friction</span>
          <span>Fall concern</span>
          <span>Symptom trend</span>
          <span>Suggested next action</span>
          <span>Open</span>
        </div>
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-1 gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[1.15fr_0.7fr_0.8fr_0.8fr_0.85fr_1.2fr_0.45fr] lg:items-center"
          >
            <div>
              <p className="font-black text-slate-950">{row.name}</p>
              <span className={`mt-2 inline-flex status-chip ${priorityClass[row.outreachPriority]}`}>
                {row.outreachPriority} outreach
              </span>
            </div>
            <p className="font-semibold text-slate-600">{row.lastCheckDate}</p>
            <p className="text-2xl font-black text-slate-950">{row.recoveryFrictionScore}</p>
            <span className={`status-chip ${concernClass[row.fallConcernLevel]}`}>{row.fallConcernLevel}</span>
            <p className="font-semibold text-slate-700">{row.symptomTrend}</p>
            <p className="font-semibold leading-6 text-slate-700">{row.suggestedNextAction}</p>
            <button
              type="button"
              className="icon-button"
              onClick={() => onOpenScenario(row.scenarioId)}
              title={`Open ${row.name}`}
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
