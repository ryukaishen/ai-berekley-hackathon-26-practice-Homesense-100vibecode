import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, Save, Sparkles } from "lucide-react";
import { scenarioPacks, type ScenarioPackId } from "@reentry/shared";
import { Button, PageHeader, SurfaceCard } from "@reentry/ui";

type EpisodeDraft = {
  id: string;
  scenarioId: ScenarioPackId;
  title: string;
  context: string;
  frictionAreas: string[];
  supportRoles: string[];
  nextStep: string;
  savedAt: string;
};

export function EpisodeNewPage() {
  const navigate = useNavigate();
  const [scenarioId, setScenarioId] = useState<ScenarioPackId>("finals-burnout");
  const selectedPack = useMemo(
    () => scenarioPacks.find((pack) => pack.id === scenarioId) ?? scenarioPacks[0]!,
    [scenarioId]
  );
  const [title, setTitle] = useState("Finals week is getting away from me");
  const [context, setContext] = useState(
    "Three deadlines are stacked together, sleep is short, and I need a first step that does not require a full reset."
  );
  const [selectedFriction, setSelectedFriction] = useState<string[]>(["deadlines", "sleep debt", "focus"]);
  const [nextStep, setNextStep] = useState("Open the highest-impact task and write the first three bullets.");
  const [status, setStatus] = useState("");

  const draft: EpisodeDraft = {
    id: "episode_local_draft",
    scenarioId,
    title: title.trim() || selectedPack.title,
    context: context.trim() || selectedPack.context,
    frictionAreas: selectedFriction,
    supportRoles: selectedPack.supportRoles,
    nextStep: nextStep.trim() || (selectedPack.planArchetypes[0]?.focus ?? "Pick one small next step."),
    savedAt: new Date().toISOString()
  };

  const changeScenario = (value: ScenarioPackId) => {
    const pack = scenarioPacks.find((item) => item.id === value) ?? scenarioPacks[0]!;
    setScenarioId(value);
    setTitle(pack.title);
    setContext(pack.context);
    setSelectedFriction(pack.frictionAreas.slice(0, 3));
    setNextStep(pack.planArchetypes[0]?.focus ?? "Pick one small next step.");
    setStatus(`${pack.title} loaded. Edit it until it sounds like the real situation.`);
  };

  const saveDraft = () => {
    window.localStorage.setItem("reentry-episode-draft", JSON.stringify(draft));
    setStatus("Episode draft saved locally. You can now run a check-in from this context.");
  };

  const viewExample = () => {
    setScenarioId("post-surgery-return");
    setTitle("Getting back to class without overdoing it");
    setContext(
      "I can attend some classes, but walking across campus and keeping up with assignments is draining fast after surgery."
    );
    setSelectedFriction(["stamina", "transportation", "workload"]);
    setNextStep("Email the professor with one clear accommodation ask and one realistic catch-up block.");
    setStatus("Example loaded. You can edit it, save it, or start a check-in from this version.");
  };

  const saveAndCheckIn = () => {
    window.localStorage.setItem("reentry-episode-draft", JSON.stringify(draft));
    navigate("/check-in");
  };

  const toggleFriction = (area: string) => {
    setSelectedFriction((current) =>
      current.includes(area) ? current.filter((item) => item !== area) : [...current, area]
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Episode"
        title="Capture the situation without writing an essay"
        subtitle="A useful episode draft should answer: what changed, what is making life harder, who can help, and what is the smallest next move?"
        action={
          <div className="action-row">
            <Button onClick={saveDraft}>
              <Save aria-hidden="true" size={16} />
              Save draft
            </Button>
            <Button variant="ghost" onClick={viewExample}>
              <Eye aria-hidden="true" size={16} />
              View example
            </Button>
            <Button variant="ghost" onClick={saveAndCheckIn}>
              Start check-in
              <ArrowRight aria-hidden="true" size={16} />
            </Button>
          </div>
        }
      />

      <section className="episode-layout">
        <SurfaceCard title="Episode builder" subtitle="Make the messy part concrete enough to act on.">
          <label className="app-field">
            <span>Scenario pack</span>
            <select
              className="focus-ring"
              value={scenarioId}
              onChange={(event) => changeScenario(event.target.value as ScenarioPackId)}
            >
              {scenarioPacks.map((pack) => (
                <option key={pack.id} value={pack.id}>{pack.title}</option>
              ))}
            </select>
          </label>

          <label className="app-field">
            <span>Episode title</span>
            <input
              className="focus-ring"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What should this episode be called?"
            />
          </label>

          <label className="app-field">
            <span>What is happening?</span>
            <textarea
              className="focus-ring"
              rows={5}
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder="Keep it practical: what changed, what is hard, and what would make today easier?"
            />
          </label>

          <div className="app-field">
            <span>Friction areas</span>
            <div className="scenario-chip-row">
              {selectedPack.frictionAreas.map((area) => {
                const active = selectedFriction.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    className={`support-chip-button focus-ring ${active ? "support-chip-button-active" : ""}`}
                    aria-pressed={active}
                    onClick={() => toggleFriction(area)}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="app-field">
            <span>Minimum useful next step</span>
            <input
              className="focus-ring"
              value={nextStep}
              onChange={(event) => setNextStep(event.target.value)}
            />
          </label>
        </SurfaceCard>

        <aside className="episode-side-panel">
          <SurfaceCard title="Live draft preview" subtitle="This is what ReEntry can carry into check-ins, plans, and handoffs.">
            <div className="preview-note">
              <p className="re-eyebrow">{selectedPack.title}</p>
              <h2>{draft.title}</h2>
              <p>{draft.context}</p>
              <div className="scenario-chip-row">
                {draft.frictionAreas.map((area) => (
                  <span key={area} className="scenario-chip">{area}</span>
                ))}
              </div>
            </div>
            <div className="insight-stack">
              <div>
                <strong>Suggested tone</strong>
                <span>{selectedPack.interventionTone}</span>
              </div>
              <div>
                <strong>Support roles</strong>
                <span>{selectedPack.supportRoles.slice(0, 3).join(", ")}</span>
              </div>
              <div>
                <strong>Next step</strong>
                <span>{draft.nextStep}</span>
              </div>
            </div>
            <div className="route-action-list mt-3">
              <Link className="route-action" to="/scenarios">
                <Sparkles aria-hidden="true" size={18} />
                Compare scenario packs
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link className="route-action" to="/plan">
                <Sparkles aria-hidden="true" size={18} />
                Jump to plan cards
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <Link className="route-action" to="/agents">
                <Sparkles aria-hidden="true" size={18} />
                See the agent workflow
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </div>
            {status ? <p className="permission-notice mt-3" role="status">{status}</p> : null}
          </SurfaceCard>
        </aside>
      </section>
    </>
  );
}
