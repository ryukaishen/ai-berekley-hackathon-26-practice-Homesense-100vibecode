import { AlertCircle, CalendarPlus, ClipboardList, Stethoscope } from "lucide-react";
import type { AssessmentResult, AccessibilityPrefs } from "../types";

interface FindingsCardProps {
  result: AssessmentResult;
  prefs: AccessibilityPrefs;
}

const severityClass = {
  Low: "chip-green",
  Moderate: "chip-blue",
  Elevated: "chip-amber",
  High: "chip-red",
};

export function FindingsCard({ result, prefs }: FindingsCardProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <article className="info-card">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-teal-700" aria-hidden="true" />
          <h2 className="text-2xl font-black text-slate-950">Key Findings</h2>
        </div>
        <div className="mt-5 grid gap-3">
          {result.findings.map((finding) => (
            <div key={finding.id} className="finding-row">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-slate-950">{finding.title}</h3>
                <span className={`status-chip ${severityClass[finding.severity]}`}>{finding.severity}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {prefs.plainLanguage ? finding.plainDetail : finding.detail}
              </p>
            </div>
          ))}
        </div>
      </article>

      <div className="grid gap-5">
        <article className="info-card">
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-6 w-6 text-plum" aria-hidden="true" />
            <h2 className="text-2xl font-black text-slate-950">What To Do Today</h2>
          </div>
          <ul className="mt-4 grid gap-3">
            {result.whatToDoToday.map((action) => (
              <li key={action} className="flex gap-3 text-sm font-semibold leading-6 text-slate-700">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-700" />
                {action}
              </li>
            ))}
          </ul>
        </article>

        <article className="info-card">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-coral" aria-hidden="true" />
            <h2 className="text-2xl font-black text-slate-950">When To Contact A Clinician</h2>
          </div>
          <ul className="mt-4 grid gap-3">
            {result.contactClinician.map((item) => (
              <li key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-700">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-coral" />
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="info-card">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-amber" aria-hidden="true" />
            <h2 className="text-2xl font-black text-slate-950">What To Bring Up At Follow-Up</h2>
          </div>
          <ul className="mt-4 grid gap-3">
            {result.followUpTopics.map((topic) => (
              <li key={topic} className="flex gap-3 text-sm font-semibold leading-6 text-slate-700">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber" />
                {topic}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
