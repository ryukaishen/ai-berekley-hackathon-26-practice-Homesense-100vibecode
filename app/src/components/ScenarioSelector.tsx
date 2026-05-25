import { Check, Clock3, UserRound } from "lucide-react";
import type { PatientScenario } from "../types";

interface ScenarioSelectorProps {
  scenarios: PatientScenario[];
  selectedScenarioId: string;
  onSelect: (scenarioId: string) => void;
}

const concernClass = {
  Low: "chip-green",
  Moderate: "chip-blue",
  Elevated: "chip-amber",
  High: "chip-red",
};

const testLabel = {
  "sit-to-stand": "Sit-to-stand",
  "walk-and-turn": "Walk and turn",
  both: "Both",
};

export function ScenarioSelector({ scenarios, selectedScenarioId, onSelect }: ScenarioSelectorProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Demo scenarios</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Choose a mock patient.</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Each scenario changes baseline mobility, symptom trend, warning signs, generated metrics, caregiver tasks,
          clinician summary, and dashboard priority.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scenarios.map((scenario) => {
          const active = scenario.id === selectedScenarioId;
          return (
            <button
              key={scenario.id}
              type="button"
              className={`scenario-card ${active ? "scenario-card-active" : ""}`}
              onClick={() => onSelect(scenario.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-white text-teal-700 shadow-sm">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </span>
                {active ? (
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-950 text-white">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-left text-lg font-black leading-6 text-slate-950">{scenario.shortTitle}</h3>
              <p className="mt-1 text-left text-sm font-bold text-slate-500">
                {scenario.name}, {scenario.age}
              </p>
              <p className="mt-3 text-left text-sm leading-6 text-slate-600">{scenario.profile}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`status-chip ${concernClass[scenario.concernLevel]}`}>
                  {scenario.concernLevel} concern
                </span>
                <span className="status-chip chip-slate">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  {testLabel[scenario.recommendedTest]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
