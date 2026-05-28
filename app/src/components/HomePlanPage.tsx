import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  ClipboardCopy,
  Footprints,
  HeartHandshake,
  Home,
  LifeBuoy,
  MessageSquareText,
  PhoneCall,
  ScanLine,
  ShieldAlert,
  Smile,
  Volume2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { PatientScenario, RiskLevel } from "../types";
import { DisclaimerBanner } from "./DisclaimerBanner";

interface HomePlanPageProps {
  scenarios: PatientScenario[];
  scenario: PatientScenario;
  selectedScenarioId: string;
  onScenarioSelect: (scenarioId: string) => void;
  onStartCheck: () => void;
  onOpenDashboard: () => void;
  onOpenStory: () => void;
}

type Barrier = "alone" | "pain" | "time" | "stairs" | "transport";
type SimpleChoice = "ok" | "changed" | "help";

const concernClass: Record<RiskLevel, string> = {
  Low: "chip-green",
  Moderate: "chip-blue",
  Elevated: "chip-amber",
  High: "chip-red",
};

const barrierCopy: Record<Barrier, { label: string; plan: string }> = {
  alone: {
    label: "I am alone today",
    plan: "Keep the check near a stable chair, skip stairs, and send the care card before trying anything harder.",
  },
  pain: {
    label: "Pain is worse",
    plan: "Use the smallest safe movement and write down where the pain changed before contacting the care team.",
  },
  time: {
    label: "Only 5 minutes",
    plan: "Do the safety scan, one sit-to-stand check, and copy the clinic update. Leave the longer plan for later.",
  },
  stairs: {
    label: "Stairs feel risky",
    plan: "Prioritize clear paths, hand support, and a caregiver check-in before stairs. Ask PT/OT about stair strategy.",
  },
  transport: {
    label: "Getting to care is hard",
    plan: "Ask about telehealth, home health, ride support, or a pharmacy/community clinic option before symptoms escalate.",
  },
};

const baseSafetyItems = [
  "Clear the walking path from chair to bathroom or kitchen.",
  "Move loose rugs, cords, bags, and low furniture out of the path.",
  "Use supportive shoes, walker, cane, or prescribed device before starting.",
  "Place water, phone, medications, and emergency contact within reach.",
  "Choose a stable chair with arms for sit-to-stand practice.",
];

const firstWords = (text: string, count = 11) => {
  const words = text.split(" ");
  return words.length <= count ? text : `${words.slice(0, count).join(" ")}...`;
};

const simpleChoiceMeta: Record<
  SimpleChoice,
  {
    label: string;
    detail: string;
    icon: typeof Smile;
    planTitle: string;
    steps: string[];
    tone: "calm" | "watch" | "urgent";
  }
> = {
  ok: {
    label: "I feel okay",
    detail: "Help me do one safe thing.",
    icon: Smile,
    planTitle: "Do one small check.",
    steps: ["Sit in a strong chair.", "Clear the path in front of you.", "Press Start check when ready."],
    tone: "calm",
  },
  changed: {
    label: "Something changed",
    detail: "I feel worse or less steady.",
    icon: AlertTriangle,
    planTitle: "Slow down and tell someone.",
    steps: ["Stay seated for a minute.", "Pick the symptom that changed.", "Send the helper card or call your clinic."],
    tone: "watch",
  },
  help: {
    label: "I need help",
    detail: "Get a person involved.",
    icon: LifeBuoy,
    planTitle: "Do not push through it.",
    steps: ["Sit down now.", "Call or message a helper.", "If symptoms are severe, sudden, or scary, call emergency services."],
    tone: "urgent",
  },
};

export function HomePlanPage({
  scenarios,
  scenario,
  selectedScenarioId,
  onScenarioSelect,
  onStartCheck,
  onOpenDashboard,
  onOpenStory,
}: HomePlanPageProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set(["safe-0"]));
  const [barrier, setBarrier] = useState<Barrier>("alone");
  const [copied, setCopied] = useState(false);
  const [helperCopied, setHelperCopied] = useState(false);
  const [simpleChoice, setSimpleChoice] = useState<SimpleChoice>("ok");

  const dailyActions = useMemo(
    () =>
      [
        ...scenario.todayActions.slice(0, 3),
        `Send a short update if ${scenario.warningSigns[0]?.toLowerCase() ?? "symptoms change"}.`,
      ].slice(0, 4),
    [scenario],
  );

  const safetyItems = useMemo(
    () =>
      [
        ...baseSafetyItems,
        ...scenario.caregiverTasks
          .filter((task) => task.category === "home-safety" || task.category === "mobility")
          .map((task) => task.plainLabel),
      ].slice(0, 7),
    [scenario],
  );

  const allCheckIds = [
    ...dailyActions.map((_, index) => `action-${index}`),
    ...safetyItems.map((_, index) => `safe-${index}`),
  ];
  const completedCount = allCheckIds.filter((id) => checked.has(id)).length;
  const completion = Math.round((completedCount / Math.max(allCheckIds.length, 1)) * 100);

  const careCard = [
    `StandWise care card for ${scenario.name}: ${scenario.concernLevel} recovery concern.`,
    `Today I am watching: ${scenario.warningSigns.slice(0, 2).join("; ")}.`,
    `Please help with: ${dailyActions.slice(0, 2).join(" ")}`,
    `If things worsen: ${scenario.contactClinician[0]}`,
  ].join(" ");

  const helperCard = [
    `StandWise helper note for ${scenario.name}.`,
    `I chose: ${simpleChoiceMeta[simpleChoice].label}.`,
    `Please help me with: ${simpleChoiceMeta[simpleChoice].steps.join(" ")}`,
    `Watch for: ${scenario.contactClinician[0]}`,
  ].join(" ");

  const toggleChecked = (id: string) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyCareCard = async () => {
    try {
      await navigator.clipboard.writeText(careCard);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const copyHelperCard = async () => {
    try {
      await navigator.clipboard.writeText(helperCard);
      setHelperCopied(true);
      window.setTimeout(() => setHelperCopied(false), 1400);
    } catch {
      setHelperCopied(false);
    }
  };

  const readSimplePlan = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const text = [
      "StandWise simple plan.",
      simpleChoiceMeta[simpleChoice].planTitle,
      ...simpleChoiceMeta[simpleChoice].steps,
      "This app does not diagnose. If symptoms are severe, sudden, or scary, call emergency services.",
    ].join(" ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.82;
    utterance.pitch = 0.94;
    window.speechSynthesis.speak(utterance);
  };

  const simplePlan = simpleChoiceMeta[simpleChoice];
  const SimpleIcon = simplePlan.icon;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className={`simple-mode simple-mode-${simplePlan.tone}`} aria-label="Simple mode">
        <div className="simple-mode-main">
          <p className="simple-kicker">Big Button Mode</p>
          <h1>How are you right now?</h1>
          <p>Pick one. StandWise will make the next step simple.</p>

          <div className="simple-choice-grid">
            {(Object.keys(simpleChoiceMeta) as SimpleChoice[]).map((choice) => {
              const item = simpleChoiceMeta[choice];
              const Icon = item.icon;
              const active = simpleChoice === choice;
              return (
                <button
                  key={choice}
                  type="button"
                  className={`simple-choice simple-choice-${item.tone} ${active ? "simple-choice-active" : ""}`}
                  onClick={() => setSimpleChoice(choice)}
                  aria-pressed={active}
                >
                  <Icon className="h-9 w-9" aria-hidden="true" />
                  <span>{item.label}</span>
                  <small>{item.detail}</small>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="simple-next-card">
          <div className="simple-next-heading">
            <SimpleIcon className="h-9 w-9" aria-hidden="true" />
            <div>
              <p>Next step</p>
              <h2>{simplePlan.planTitle}</h2>
            </div>
          </div>
          <ol>
            {simplePlan.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="simple-actions">
            <button type="button" className="simple-action-button simple-action-primary" onClick={simpleChoice === "help" ? copyHelperCard : onStartCheck}>
              {simpleChoice === "help" ? <PhoneCall className="h-6 w-6" aria-hidden="true" /> : <ScanLine className="h-6 w-6" aria-hidden="true" />}
              {simpleChoice === "help" ? (helperCopied ? "Helper note copied" : "Tell my helper") : "Start check"}
            </button>
            <button type="button" className="simple-action-button" onClick={readSimplePlan}>
              <Volume2 className="h-6 w-6" aria-hidden="true" />
              Read aloud
            </button>
          </div>
        </aside>
      </section>

      <section className="today-hero">
        <div>
          <p className="eyebrow text-teal-100">StandWise today</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
            Recovery feels safer when the next step is obvious.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-teal-50 md:text-lg">
            Pick a realistic home plan, run a quick mobility check, and create a care card someone can actually use.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" className="primary-button primary-button-light" onClick={onStartCheck}>
              <ScanLine className="h-5 w-5" aria-hidden="true" />
              Run 45-sec Check
            </button>
            <button type="button" className="secondary-button secondary-button-dark" onClick={onOpenDashboard}>
              <PhoneCall className="h-5 w-5" aria-hidden="true" />
              Care-Team Queue
            </button>
          </div>
        </div>

        <aside className="today-status-card">
          <div className="flex items-center justify-between gap-3">
            <span className={`status-chip ${concernClass[scenario.concernLevel]}`}>{scenario.concernLevel} concern</span>
            <span className="text-xs font-black uppercase text-slate-500">{completion}% ready</span>
          </div>
          <div className="mt-5">
            <p className="text-sm font-black text-slate-500">Current person</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">{scenario.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{scenario.profile}</p>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-teal-600" style={{ width: `${completion}%` }} />
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-slate-700">{firstWords(dailyActions[0], 18)}</p>
        </aside>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Choose a demo person</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Different homes, different recovery friction.</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onOpenStory}>
            Why this matters
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {scenarios.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`scenario-pill ${selectedScenarioId === item.id ? "scenario-pill-active" : ""}`}
              onClick={() => onScenarioSelect(item.id)}
            >
              <span>{item.shortTitle}</span>
              <small>{item.concernLevel} concern</small>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="today-panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Do first</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">A plan small enough to finish today.</h2>
            </div>
            <Footprints className="h-7 w-7 text-teal-700" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3">
            {dailyActions.map((action, index) => {
              const id = `action-${index}`;
              const done = checked.has(id);
              return (
                <button
                  key={action}
                  type="button"
                  className={`check-row ${done ? "check-row-done" : ""}`}
                  onClick={() => toggleChecked(id)}
                  aria-pressed={done}
                >
                  <span className="check-circle">{done ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : null}</span>
                  <span>{action}</span>
                </button>
              );
            })}
          </div>
        </article>

        <article className="today-panel">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Home scan</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Make the room recovery-ready.</h2>
            </div>
            <Home className="h-7 w-7 text-teal-700" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-2">
            {safetyItems.map((item, index) => {
              const id = `safe-${index}`;
              const done = checked.has(id);
              return (
                <button
                  key={item}
                  type="button"
                  className={`compact-check-row ${done ? "compact-check-row-done" : ""}`}
                  onClick={() => toggleChecked(id)}
                  aria-pressed={done}
                >
                  <span className="check-circle check-circle-small">
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                  </span>
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <article className="today-panel">
          <p className="eyebrow">Friction reducer</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">What is getting in the way?</h2>
          <div className="mt-4 grid gap-2">
            {(Object.keys(barrierCopy) as Barrier[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`barrier-button ${barrier === key ? "barrier-button-active" : ""}`}
                onClick={() => setBarrier(key)}
              >
                {barrierCopy[key].label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="font-black text-slate-950">Adjusted plan</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{barrierCopy[barrier].plan}</p>
          </div>
        </article>

        <div className="grid gap-5 lg:grid-cols-2">
          <article className="today-panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Share</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Family care card</h2>
              </div>
              <HeartHandshake className="h-7 w-7 text-teal-700" aria-hidden="true" />
            </div>
            <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-7 text-slate-700">
              {careCard}
            </p>
            <button type="button" className="mt-4 secondary-button" onClick={copyCareCard}>
              <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
              {copied ? "Copied" : "Copy care card"}
            </button>
          </article>

          <article className="today-panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Appointment prep</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Questions worth asking.</h2>
              </div>
              <CalendarCheck className="h-7 w-7 text-teal-700" aria-hidden="true" />
            </div>
            <ul className="mt-4 grid gap-3">
              {scenario.followUpTopics.slice(0, 4).map((topic) => (
                <li key={topic} className="flex gap-3 text-sm font-semibold leading-6 text-slate-700">
                  <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-plum" aria-hidden="true" />
                  {topic}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="today-panel">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-coral" aria-hidden="true" />
            <h2 className="text-2xl font-black text-slate-950">Call sooner if this shows up.</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {scenario.contactClinician.map((item) => (
              <p key={item} className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-semibold leading-6 text-slate-700">
                {item}
              </p>
            ))}
          </div>
        </article>

        <article className="today-panel today-panel-dark">
          <p className="eyebrow text-teal-100">Why judges understand it</p>
          <h2 className="mt-2 text-2xl font-black">It is useful before, during, and after the check.</h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-200">
            The daily plan helps patients and caregivers immediately. The live check adds signal. The dashboard helps a
            care team prioritize follow-up.
          </p>
        </article>
      </section>

      <div className="mt-6">
        <DisclaimerBanner compact />
      </div>
    </main>
  );
}
