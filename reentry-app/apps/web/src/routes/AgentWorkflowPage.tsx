import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BellRing,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import {
  getFrictionDomain,
  recoveryFrictionDefinition,
  recoveryFrictionDomains,
  runRecoveryAgentWorkflow,
  scenarioPacks,
  type CheckInPayload,
  type ScenarioPackId,
  type WearableSignalInput
} from "@reentry/shared";
import { Button, PageHeader, SurfaceCard } from "@reentry/ui";

type AgentDemoState = {
  checkIn: CheckInPayload;
  wearable: WearableSignalInput;
};

const agentDemoStates: Record<ScenarioPackId, AgentDemoState> = {
  "post-discharge": {
    checkIn: {
      energy: 2,
      sleepQuality: 2,
      cognitiveLoad: 4,
      socialLoad: 3,
      bodyStateTags: ["fatigue", "brain-fog"],
      practicalBlockerTags: ["appointments", "transportation", "meals"],
      standWiseFlags: ["missed-appointment", "limited-mobility", "needs-human-follow-up"],
      note: "Two appointments this week, one ride gap, and meals have been inconsistent."
    },
    wearable: {
      sleepHours: 5.1,
      sleepDeltaHours: -1.8,
      steps: 2100,
      baselineSteps: 6100,
      stepDeltaPercent: -66,
      restingHeartRate: 84,
      baselineRestingHeartRate: 72,
      missedRoutineCount: 3,
      daysObserved: 3
    }
  },
  "post-surgery-return": {
    checkIn: {
      energy: 2,
      sleepQuality: 3,
      cognitiveLoad: 3,
      socialLoad: 2,
      bodyStateTags: ["pain", "fatigue"],
      practicalBlockerTags: ["transportation", "deadlines", "appointments"],
      standWiseFlags: ["limited-mobility"],
      note: "Energy drops after 2pm and getting across campus is the hard part."
    },
    wearable: {
      sleepHours: 6.2,
      steps: 2800,
      baselineSteps: 7200,
      stepDeltaPercent: -61,
      restingHeartRateDelta: 9,
      missedRoutineCount: 1,
      daysObserved: 2
    }
  },
  breakup: {
    checkIn: {
      energy: 3,
      sleepQuality: 1,
      cognitiveLoad: 4,
      socialLoad: 5,
      bodyStateTags: ["tension", "low-appetite"],
      practicalBlockerTags: ["meals", "chores"],
      standWiseFlags: [],
      note: "Late-night rumination is making sleep and food harder."
    },
    wearable: {
      sleepHours: 4.4,
      sleepDeltaHours: -2.1,
      steps: 4300,
      baselineSteps: 6500,
      stepDeltaPercent: -34,
      restingHeartRateDelta: 7,
      missedRoutineCount: 2,
      daysObserved: 3
    }
  },
  "finals-burnout": {
    checkIn: {
      energy: 2,
      sleepQuality: 2,
      cognitiveLoad: 5,
      socialLoad: 3,
      bodyStateTags: ["brain-fog", "sensory-overload"],
      practicalBlockerTags: ["deadlines", "meals"],
      standWiseFlags: [],
      note: "Three deadlines before Friday and no clean first step."
    },
    wearable: {
      sleepHours: 5,
      sleepDeltaHours: -1.4,
      steps: 3900,
      baselineSteps: 6800,
      stepDeltaPercent: -43,
      restingHeartRateDelta: 10,
      missedRoutineCount: 2,
      daysObserved: 3
    }
  },
  "new-city-loneliness": {
    checkIn: {
      energy: 3,
      sleepQuality: 3,
      cognitiveLoad: 3,
      socialLoad: 5,
      bodyStateTags: ["tension"],
      practicalBlockerTags: ["chores", "money"],
      standWiseFlags: [],
      note: "Sunday is the hardest day and leaving the apartment feels awkward."
    },
    wearable: {
      sleepHours: 6.8,
      steps: 5200,
      baselineSteps: 6900,
      stepDeltaPercent: -25,
      restingHeartRateDelta: 4,
      missedRoutineCount: 1,
      daysObserved: 3
    }
  },
  "chronic-flare": {
    checkIn: {
      energy: 1,
      sleepQuality: 2,
      cognitiveLoad: 4,
      socialLoad: 4,
      bodyStateTags: ["pain", "fatigue", "brain-fog"],
      practicalBlockerTags: ["meals", "appointments", "chores"],
      standWiseFlags: ["needs-human-follow-up", "limited-mobility"],
      note: "Pain is high after errands, and chores are stacking up."
    },
    wearable: {
      sleepHours: 5.6,
      steps: 1800,
      baselineSteps: 5800,
      stepDeltaPercent: -69,
      restingHeartRateDelta: 13,
      missedRoutineCount: 4,
      daysObserved: 4
    }
  }
};

export function AgentWorkflowPage() {
  const [scenarioId, setScenarioId] = useState<ScenarioPackId>("post-discharge");
  const [status, setStatus] = useState("Workflow ready. Run it, simulate a red flag, or copy the helper draft.");
  const [crisisDemo, setCrisisDemo] = useState(false);

  const selectedPack = useMemo(
    () => scenarioPacks.find((scenario) => scenario.id === scenarioId) ?? scenarioPacks[0]!,
    [scenarioId]
  );
  const demoState = agentDemoStates[scenarioId];
  const workflow = useMemo(() => {
    const checkIn = crisisDemo
      ? {
          ...demoState.checkIn,
          standWiseFlags: [...(demoState.checkIn.standWiseFlags ?? []), "urgent-message" as const],
          note: `${demoState.checkIn.note ?? ""} I mentioned self-harm language in the check-in.`
        }
      : demoState.checkIn;

    return runRecoveryAgentWorkflow({
      scenarioId,
      checkIn,
      wearable: demoState.wearable
    });
  }, [crisisDemo, demoState, scenarioId]);
  const heartRateDelta =
    demoState.wearable.restingHeartRateDelta ??
    (demoState.wearable.restingHeartRate !== undefined && demoState.wearable.baselineRestingHeartRate !== undefined
      ? demoState.wearable.restingHeartRate - demoState.wearable.baselineRestingHeartRate
      : 0);

  const copyCaregiverDraft = async () => {
    await navigator.clipboard.writeText(workflow.caregiver.shortMessage);
    setStatus("Caregiver draft copied. It still requires user permission before sending.");
  };

  const saveWorkflow = () => {
    window.localStorage.setItem(
      "reentry-agent-workflow",
      JSON.stringify({ scenarioId, workflow, savedAt: new Date().toISOString() })
    );
    setStatus("Agent workflow snapshot saved locally for the demo.");
  };

  const runWorkflow = () => {
    setStatus(`${selectedPack.title} routed through all five agents with deterministic safety checks.`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Agent Workflow"
        title="Multi-agent recovery support that judges can actually understand"
        subtitle="Rules decide risk. AI only explains, rewrites, or summarizes structured facts. The workflow observes friction, routes safety, creates a plan, coordinates helpers, and prepares handoff notes."
        action={
          <div className="action-row">
            <Button onClick={runWorkflow}>
              <Sparkles aria-hidden="true" size={16} />
              Run workflow
            </Button>
            <Button variant="ghost" onClick={() => setCrisisDemo((value) => !value)}>
              <AlertTriangle aria-hidden="true" size={16} />
              {crisisDemo ? "Clear red flag" : "Simulate red flag"}
            </Button>
          </div>
        }
      />

      <section className="agent-hero-grid">
        <SurfaceCard title="Demo scenario" subtitle={selectedPack.context}>
          <div className="scenario-chip-row">
            {scenarioPacks.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className={`support-chip-button focus-ring ${scenario.id === scenarioId ? "support-chip-button-active" : ""}`}
                aria-pressed={scenario.id === scenarioId}
                onClick={() => {
                  setScenarioId(scenario.id);
                  setCrisisDemo(false);
                  setStatus(`${scenario.title} loaded into the recovery workflow.`);
                }}
              >
                {scenario.title}
              </button>
            ))}
          </div>
          <div className="agent-signal-strip" aria-label="Current wearable and check-in signals">
            <Metric icon={<Activity size={18} />} label="Steps" value={`${demoState.wearable.steps ?? 0}`} detail={`${demoState.wearable.stepDeltaPercent ?? 0}% vs baseline`} />
            <Metric icon={<HeartPulse size={18} />} label="Resting HR" value={`+${heartRateDelta}`} detail="bpm above baseline" />
            <Metric icon={<ClipboardList size={18} />} label="Missed routine" value={`${demoState.wearable.missedRoutineCount ?? 0}`} detail={`${demoState.wearable.daysObserved ?? 3} day window`} />
          </div>
        </SurfaceCard>

        <SurfaceCard title="Friction map" subtitle="What the Signal Agent is looking for.">
          <p className="agent-friction-definition">{recoveryFrictionDefinition}</p>
          <div className="agent-domain-grid">
            {recoveryFrictionDomains.slice(0, 6).map((domain) => (
              <div key={domain.id}>
                <strong>{domain.title}</strong>
                <span>{domain.actionQuestion}</span>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Safety routing" subtitle="The Safety Agent can override the rest of the flow.">
          <div className={`agent-safety-card agent-safety-${workflow.safety.status}`}>
            <ShieldCheck aria-hidden="true" size={24} />
            <div>
              <p className="re-eyebrow">Route</p>
              <h2>{formatLabel(workflow.safety.status)}</h2>
              <p>{workflow.safety.message}</p>
            </div>
          </div>
          <p className="permission-notice mt-3">
            AI blocked: <strong>{workflow.safety.blockedAi ? "yes" : "no"}</strong>. Human support required:{" "}
            <strong>{workflow.safety.humanSupportRequired ? "yes" : "not automatically"}</strong>.
          </p>
        </SurfaceCard>
      </section>

      <section className="agent-stage-grid" aria-label="Five recovery agents">
        {workflow.agentTrace.map((agent, index) => (
          <article key={agent.name} className="agent-stage-card">
            <span className="agent-stage-number">{index + 1}</span>
            <h2>{agent.name}</h2>
            <p>{agent.output}</p>
            <small>{agent.rule}</small>
            <span className="agent-ai-pill">{agent.usedAi ? "AI wording" : "Rules only"}</span>
          </article>
        ))}
      </section>

      <section className="agent-workbench">
        <SurfaceCard title="Signal Agent output" subtitle="Readable recovery friction signals, not a vague wellness score.">
          <div className="agent-signal-list">
            {workflow.signals.map((signal) => (
              <div key={signal.id} className={`agent-signal-item agent-signal-${signal.severity}`}>
                <strong>{signal.label}</strong>
                <em>{getFrictionDomain(signal.domain).title}</em>
                <span>{signal.evidence}</span>
                <small>{signal.source} - {signal.severity}</small>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Care Plan Agent output" subtitle="Exactly three cards, with one smallest safe action.">
          <div className="agent-smallest-action">
            <p className="re-eyebrow">Today's smallest safe action</p>
            <h2>{workflow.carePlan.smallestSafeAction}</h2>
          </div>
          <div className="agent-plan-list">
            {workflow.carePlan.planCards.map((card) => (
              <div key={card.id} className="agent-plan-item">
                <strong>{card.title}</strong>
                <span>{card.whyThisHelps}</span>
                <small>{card.kind} - {card.estimatedTime}</small>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Caregiver Agent output" subtitle="Message drafts are permission-gated and never auto-sent.">
          <div className="agent-message-box">
            <p>{workflow.caregiver.shortMessage}</p>
          </div>
          <div className="action-row">
            <Button onClick={copyCaregiverDraft}>
              <Users aria-hidden="true" size={16} />
              Copy caregiver draft
            </Button>
            <Button variant="ghost" onClick={saveWorkflow}>
              <BellRing aria-hidden="true" size={16} />
              Save workflow
            </Button>
          </div>
          <p className="permission-notice mt-3" role="status">{workflow.caregiver.permissionNotice}</p>
        </SurfaceCard>

        <SurfaceCard title="Clinician Summary Agent output" subtitle="Concise handoff, bounded by structured facts.">
          <div className="agent-message-box">
            <p>{workflow.clinicianSummary.summary}</p>
          </div>
          <ul className="agent-fact-list">
            {workflow.clinicianSummary.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
          <Link className="route-action mt-3" to="/handoff">
            <ClipboardList aria-hidden="true" size={18} />
            Open handoff builder
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </SurfaceCard>
      </section>

      <section className="agent-story-card" aria-label="Hackathon technical story">
        <div>
          <p className="re-eyebrow">Pitch line</p>
          <h2>ReEntry uses a multi-agent recovery workflow: signal detection, safety routing, plan generation, caregiver coordination, and clinician handoff.</h2>
          <p>
            It is fancy but not fake: deterministic rules handle safety and scoring, while optional AI is constrained to plain-language rewrites and summaries.
          </p>
        </div>
        <p className="permission-notice" role="status">{status}</p>
      </section>
    </>
  );
}

function Metric({
  icon,
  label,
  value,
  detail
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="agent-metric">
      {icon}
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}
