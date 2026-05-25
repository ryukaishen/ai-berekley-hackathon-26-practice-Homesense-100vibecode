import { Activity, Bluetooth, Camera, CheckCircle2, Footprints, ListChecks, Smartphone, Waves } from "lucide-react";
import type {
  AssessmentMode,
  AssessmentResult,
  AssessmentTest,
  PatientScenario,
  SymptomInput,
} from "../types";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { PoseCheckPanel } from "./PoseCheckPanel";
import { ScenarioSelector } from "./ScenarioSelector";

interface AssessmentFlowProps {
  scenarios: PatientScenario[];
  scenario: PatientScenario;
  symptoms: SymptomInput;
  test: AssessmentTest;
  mode: AssessmentMode;
  onScenarioSelect: (scenarioId: string) => void;
  onSymptomsChange: (symptoms: SymptomInput) => void;
  onTestChange: (test: AssessmentTest) => void;
  onModeChange: (mode: AssessmentMode) => void;
  onComplete: (result: AssessmentResult) => void;
}

const symptomOptions = [
  { id: "dizziness", label: "Dizziness" },
  { id: "weakness", label: "Weakness" },
  { id: "pain", label: "Pain" },
  { id: "numbness", label: "Numbness" },
  { id: "shortnessOfBreath", label: "Shortness of breath" },
] as const;

const tests = [
  { id: "sit-to-stand", label: "Sit-to-stand", icon: Activity },
  { id: "walk-and-turn", label: "Walk and turn", icon: Footprints },
  { id: "both", label: "Both", icon: ListChecks },
] as const;

const modes = [
  { id: "mock", label: "Mock", icon: Waves, detail: "Prerecorded stream" },
  { id: "webcam", label: "Webcam", icon: Camera, detail: "Live camera overlay" },
  { id: "motion", label: "Motion", icon: Smartphone, detail: "Browser device motion" },
  { id: "esp32", label: "ESP32", icon: Bluetooth, detail: "Optional WebSocket" },
] as const;

export function AssessmentFlow({
  scenarios,
  scenario,
  symptoms,
  test,
  mode,
  onScenarioSelect,
  onSymptomsChange,
  onTestChange,
  onModeChange,
  onComplete,
}: AssessmentFlowProps) {
  return (
    <main>
      <ScenarioSelector scenarios={scenarios} selectedScenarioId={scenario.id} onSelect={onScenarioSelect} />

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-8 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="flow-column">
          <div className="section-heading">
            <p className="eyebrow">Step A</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Enter symptoms.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use mock information only. These inputs change the recovery friction score and follow-up language.
            </p>
          </div>

          <div className="grid gap-3">
            {symptomOptions.map((option) => {
              const checked = symptoms[option.id];
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`symptom-button ${checked ? "symptom-button-active" : ""}`}
                  onClick={() => onSymptomsChange({ ...symptoms, [option.id]: !checked })}
                  aria-pressed={checked}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-current">
                    {checked ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : null}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          <label className="mt-4 block text-sm font-bold text-slate-700">
            Other note
            <textarea
              value={symptoms.otherNote}
              onChange={(event) => onSymptomsChange({ ...symptoms, otherNote: event.target.value })}
              placeholder="Example: more tired after breakfast, needs help after first turn..."
              className="mt-2 min-h-24 w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
          </label>
        </div>

        <div className="flow-column">
          <div className="section-heading">
            <p className="eyebrow">Step B</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Choose the check.</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {tests.map((item) => {
              const Icon = item.icon;
              const active = test === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`choice-card ${active ? "choice-card-active" : ""}`}
                  onClick={() => onTestChange(item.id)}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <p className="text-sm font-black text-slate-950">Signal mode</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {modes.map((item) => {
                const Icon = item.icon;
                const active = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`mode-card ${active ? "mode-card-active" : ""}`}
                    onClick={() => onModeChange(item.id)}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="font-black">{item.label}</span>
                    <span className="text-xs font-semibold text-slate-500">{item.detail}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-black text-slate-950">{scenario.name}'s current concern pattern</p>
            <div className="mt-3 grid gap-2">
              {scenario.warningSigns.slice(0, 3).map((warning) => (
                <p key={warning} className="flex gap-2 text-sm leading-6 text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  {warning}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-5">
        <DisclaimerBanner compact />
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12">
        <PoseCheckPanel scenario={scenario} symptoms={symptoms} test={test} mode={mode} onComplete={onComplete} />
      </div>
    </main>
  );
}
