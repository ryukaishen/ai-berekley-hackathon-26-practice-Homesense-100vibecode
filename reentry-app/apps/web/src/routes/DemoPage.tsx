import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, HeartHandshake, Import, Save, Sparkles } from "lucide-react";
import {
  generatePlanCards,
  scenarioPacks,
  scoreCheckIn,
  type CheckInPayload,
  type ScenarioPackId
} from "@reentry/shared";
import { Button, PageHeader, SurfaceCard } from "@reentry/ui";

const demoCheckIns: Record<ScenarioPackId, CheckInPayload> = {
  "post-discharge": {
    energy: 2,
    sleepQuality: 2,
    cognitiveLoad: 4,
    socialLoad: 3,
    bodyStateTags: ["fatigue", "brain-fog"],
    practicalBlockerTags: ["appointments", "transportation"],
    standWiseFlags: ["missed-appointment", "needs-human-follow-up"],
    note: "Two appointments this week and a ride gap for Friday."
  },
  "post-surgery-return": {
    energy: 2,
    sleepQuality: 3,
    cognitiveLoad: 3,
    socialLoad: 2,
    bodyStateTags: ["pain", "fatigue"],
    practicalBlockerTags: ["transportation", "deadlines"],
    standWiseFlags: ["limited-mobility"],
    note: "Energy drops after 2pm, and getting across campus is the hard part."
  },
  breakup: {
    energy: 3,
    sleepQuality: 1,
    cognitiveLoad: 4,
    socialLoad: 5,
    bodyStateTags: ["tension", "low-appetite"],
    practicalBlockerTags: ["meals", "chores"],
    standWiseFlags: [],
    note: "Late-night rumination is making sleep and food harder."
  },
  "finals-burnout": {
    energy: 2,
    sleepQuality: 2,
    cognitiveLoad: 5,
    socialLoad: 3,
    bodyStateTags: ["brain-fog", "sensory-overload"],
    practicalBlockerTags: ["deadlines", "meals"],
    standWiseFlags: [],
    note: "Three deadlines before Friday and no clean first step."
  },
  "new-city-loneliness": {
    energy: 3,
    sleepQuality: 3,
    cognitiveLoad: 3,
    socialLoad: 5,
    bodyStateTags: ["tension"],
    practicalBlockerTags: ["chores", "money"],
    standWiseFlags: [],
    note: "Sunday is the hardest day and leaving the apartment feels awkward."
  },
  "chronic-flare": {
    energy: 1,
    sleepQuality: 2,
    cognitiveLoad: 4,
    socialLoad: 4,
    bodyStateTags: ["pain", "fatigue", "brain-fog"],
    practicalBlockerTags: ["meals", "appointments", "chores"],
    standWiseFlags: ["needs-human-follow-up"],
    note: "Pain is high after errands, and chores are stacking up."
  }
};

export function DemoPage() {
  const [scenarioId, setScenarioId] = useState<ScenarioPackId>("post-surgery-return");
  const [status, setStatus] = useState("Pick a scenario to see ReEntry turn mess into next steps.");
  const [supportDraft, setSupportDraft] = useState("");

  const pack = useMemo(
    () => scenarioPacks.find((scenario) => scenario.id === scenarioId) ?? scenarioPacks[0]!,
    [scenarioId]
  );
  const scoredCheckIn = useMemo(() => {
    const payload = demoCheckIns[scenarioId];
    return { ...payload, ...scoreCheckIn(payload) };
  }, [scenarioId]);
  const planCards = useMemo(() => generatePlanCards(scoredCheckIn), [scoredCheckIn]);

  const previewStandWise = () => {
    setScenarioId("post-discharge");
    setStatus("Imported a StandWise-style recovery context: appointments, ride friction, and human follow-up.");
  };

  const saveDraft = () => {
    window.localStorage.setItem(
      "reentry-demo-draft",
      JSON.stringify({
        scenarioId,
        checkIn: demoCheckIns[scenarioId],
        score: scoredCheckIn.recoveryFrictionScore,
        mode: scoredCheckIn.mode,
        plans: planCards,
        savedAt: new Date().toISOString()
      })
    );
    setStatus("Demo draft saved locally with the scenario, score, and three generated plan cards.");
  };

  const viewExample = () => {
    setScenarioId("finals-burnout");
    setSupportDraft(
      "Could you sit with me for one 25-minute sprint tonight? I only need help starting, not fixing everything."
    );
    setStatus("Loaded a complete finals burnout example with a support ask, blockers, and plan cards.");
  };

  const createSupportDraft = () => {
    const topBlocker = scoredCheckIn.topBlockers[0] ?? "the next step";
    setSupportDraft(
      `Could you help me with ${topBlocker.toLowerCase()} today? I do not need a big conversation, just one concrete assist.`
    );
    setStatus("Support request drafted with one specific ask instead of a vague distress signal.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Demo"
        title="Show the rescue loop, not a content library"
        subtitle="Pick a situation, watch the score explain friction, generate three actions, and draft a human ask without pretending this is therapy."
        action={
          <div className="action-row">
            <Button onClick={previewStandWise}>
              <Import aria-hidden="true" size={16} />
              Import StandWise demo
            </Button>
            <Button variant="ghost" onClick={viewExample}>
              <Eye aria-hidden="true" size={16} />
              View example
            </Button>
            <Button variant="ghost" onClick={saveDraft}>
              <Save aria-hidden="true" size={16} />
              Save draft
            </Button>
          </div>
        }
      />

      <section className="demo-console" aria-label="Interactive demo console">
        <SurfaceCard title="Scenario switchboard" subtitle="A judge should see the product adapt in seconds.">
          <div className="scenario-chip-row">
            {scenarioPacks.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                className={`support-chip-button focus-ring ${scenario.id === scenarioId ? "support-chip-button-active" : ""}`}
                aria-pressed={scenario.id === scenarioId}
                onClick={() => {
                  setScenarioId(scenario.id);
                  setStatus(`${scenario.title} loaded with local demo details.`);
                  setSupportDraft("");
                }}
              >
                {scenario.title}
              </button>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Live friction read" subtitle={pack.context}>
          <div className="signal-grid">
            <div className="signal-number">
              <span>{scoredCheckIn.recoveryFrictionScore}</span>
              <small>friction score</small>
            </div>
            <div>
              <p className="re-eyebrow">Mode</p>
              <h3 className="m-0">{formatLabel(scoredCheckIn.mode)}</h3>
              <p className="re-meta">{scoredCheckIn.evidence[0]}</p>
            </div>
          </div>
          <div className="scenario-chip-row">
            {scoredCheckIn.topBlockers.slice(0, 4).map((blocker) => (
              <span key={blocker} className="scenario-chip">{blocker}</span>
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className="demo-plan-grid" aria-label="Generated demo plan cards">
        {planCards.map((card) => (
          <article key={card.id} className="demo-plan-card">
            <p className="re-eyebrow">{card.kind} action</p>
            <h2>{card.title}</h2>
            <p>{card.whyThisHelps}</p>
            <small>{card.estimatedTime} - {card.effortLevel} effort</small>
          </article>
        ))}
      </section>

      <section className="demo-console demo-console-bottom">
        <SurfaceCard title="Human ask generator" subtitle="Turns stuckness into a specific, permission-aware request.">
          <p className="demo-draft">{supportDraft || "No support draft yet. Generate one from the current blockers."}</p>
          <div className="action-row">
            <Button onClick={createSupportDraft}>
              <HeartHandshake aria-hidden="true" size={16} />
              Draft support ask
            </Button>
            <Link className="focus-ring re-btn re-btn-ghost" to="/support-circle">
              Edit support circle
            </Link>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Continue the app flow" subtitle="These are real routes, not dead buttons.">
          <div className="route-action-list">
            <Link className="route-action" to="/check-in">
              <Sparkles aria-hidden="true" size={18} />
              Run the 60-second check-in
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="route-action" to="/plan">
              <Sparkles aria-hidden="true" size={18} />
              Review plan cards
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="route-action" to="/agents">
              <Sparkles aria-hidden="true" size={18} />
              Run the agent workflow
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="route-action" to="/handoff">
              <Sparkles aria-hidden="true" size={18} />
              Build a handoff summary
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
          <p className="permission-notice mt-3" role="status">{status}</p>
        </SurfaceCard>
      </section>
    </>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}
