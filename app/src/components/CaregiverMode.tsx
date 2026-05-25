import { HeartHandshake, Home, MessageSquareText, ShieldAlert } from "lucide-react";
import type { AssessmentResult } from "../types";

interface CaregiverModeProps {
  result: AssessmentResult;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const urgencyClass = {
  Low: "chip-green",
  Moderate: "chip-blue",
  Elevated: "chip-amber",
  High: "chip-red",
};

export function CaregiverMode({ result, enabled, onToggle }: CaregiverModeProps) {
  const clinicDraft = result.messageDrafts.find((draft) => draft.id === "caregiver-clinic");

  return (
    <section className="info-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Caregiver mode</p>
          <h2 className="mt-2 flex items-center gap-2 text-2xl font-black text-slate-950">
            <HeartHandshake className="h-6 w-6 text-teal-700" aria-hidden="true" />
            {enabled ? "Help needed today" : "Patient summary"}
          </h2>
        </div>
        <button
          type="button"
          className={`switch-button ${enabled ? "switch-button-on" : ""}`}
          onClick={() => onToggle(!enabled)}
          aria-pressed={enabled}
        >
          <span />
          Caregiver
        </button>
      </div>

      <p className="mt-4 text-base font-semibold leading-7 text-slate-700">
        {enabled ? result.caregiverFriendlySummary : result.supportiveSummary}
      </p>

      {enabled ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h3 className="flex items-center gap-2 font-black text-slate-950">
              <Home className="h-5 w-5 text-teal-700" aria-hidden="true" />
              Home safety and support tasks
            </h3>
            <div className="mt-3 grid gap-3">
              {result.caregiverTasks.map((task) => (
                <div key={task.id} className="task-row">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-slate-950">{task.plainLabel}</p>
                      <span className={`status-chip ${urgencyClass[task.urgency]}`}>{task.urgency}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{task.detail}</p>
                    <p className="mt-2 text-xs font-black uppercase text-slate-500">Owner: {task.owner}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <h3 className="flex items-center gap-2 font-black text-slate-950">
                <ShieldAlert className="h-5 w-5 text-coral" aria-hidden="true" />
                Red flags to watch
              </h3>
              <ul className="mt-3 grid gap-2">
                {result.contactClinician.map((item) => (
                  <li key={item} className="flex gap-2 text-sm font-semibold leading-6 text-slate-700">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-coral" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="flex items-center gap-2 font-black text-slate-950">
                <MessageSquareText className="h-5 w-5 text-plum" aria-hidden="true" />
                Draft update to clinic
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{clinicDraft?.body}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
