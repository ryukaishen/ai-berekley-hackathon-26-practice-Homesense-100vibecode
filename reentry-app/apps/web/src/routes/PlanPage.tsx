import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, HeartHandshake, Moon, RotateCcw, type LucideIcon } from "lucide-react";
import {
  generatePlanCards,
  scoreCheckIn,
  type CheckInPayload,
  type GeneratedPlanCard,
  type GeneratedPlanCardKind,
  type ScoredCheckIn
} from "@reentry/shared";
import { Button, PageHeader } from "@reentry/ui";

type CardStatus = "open" | "picked" | "later";

const demoCheckIn: CheckInPayload = {
  energy: 2,
  sleepQuality: 2,
  cognitiveLoad: 4,
  socialLoad: 3,
  bodyStateTags: ["fatigue", "brain-fog"],
  practicalBlockerTags: ["meals", "deadlines"],
  standWiseFlags: [],
  note: "Need something realistic before the evening gets away from me."
};

const kindLabels: Record<GeneratedPlanCardKind, string> = {
  stabilizing: "Stabilizing action",
  practical: "Practical action",
  support: "Support action"
};

const kindIcons: Record<GeneratedPlanCardKind, LucideIcon> = {
  stabilizing: Moon,
  practical: Clock3,
  support: HeartHandshake
};

export function PlanPage() {
  const scoredCheckIn = useMemo<ScoredCheckIn>(() => {
    const score = scoreCheckIn(demoCheckIn);
    return { ...demoCheckIn, ...score };
  }, []);
  const cards = useMemo(() => generatePlanCards(scoredCheckIn), [scoredCheckIn]);
  const [statuses, setStatuses] = useState<Record<string, CardStatus>>(
    Object.fromEntries(cards.map((card) => [card.id, "open"]))
  );
  const [closed, setClosed] = useState(false);

  const pickedCard = cards.find((card) => statuses[card.id] === "picked");

  const setCardStatus = (cardId: string, status: CardStatus) => {
    setStatuses((current) => ({
      ...current,
      [cardId]: status
    }));
  };

  const reset = () => {
    setStatuses(Object.fromEntries(cards.map((card) => [card.id, "open"])));
    setClosed(false);
  };

  if (closed) {
    return (
      <section className="closure-screen" aria-live="polite">
        <CheckCircle2 aria-hidden="true" size={46} />
        <p className="re-eyebrow">Closed for today</p>
        <h1>That is enough for now.</h1>
        <p>
          {pickedCard
            ? `${pickedCard.title} is the plan you chose.`
            : "You marked today complete without choosing a card."}
        </p>
        <p className="re-meta">You can leave this here and come back another day.</p>
      </section>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Plan"
        title="Pick one useful next step"
        subtitle="Three options are enough for today: one to stabilize, one practical move, and one support move."
        action={
          <Button variant="ghost" onClick={reset}>
            <RotateCcw aria-hidden="true" size={16} />
            Reset
          </Button>
        }
      />

      <section className="plan-summary" aria-label="Current scored check-in summary">
        <div>
          <span className="plan-score">{scoredCheckIn.recoveryFrictionScore}</span>
          <span className="re-meta"> recovery friction</span>
        </div>
        <div className="plan-summary-copy">
          <strong>{formatMode(scoredCheckIn.mode)}</strong>
          <span>{scoredCheckIn.topBlockers.slice(0, 2).join(" and ")}</span>
        </div>
      </section>

      <section className="plan-card-grid" aria-label="Generated plan cards">
        {cards.map((card) => (
          <GeneratedPlanCardView
            key={card.id}
            card={card}
            status={statuses[card.id] ?? "open"}
            onPick={() => setCardStatus(card.id, "picked")}
            onLater={() => setCardStatus(card.id, "later")}
            onDone={() => setClosed(true)}
          />
        ))}
      </section>
    </>
  );
}

function GeneratedPlanCardView({
  card,
  status,
  onPick,
  onLater,
  onDone
}: {
  card: GeneratedPlanCard;
  status: CardStatus;
  onPick: () => void;
  onLater: () => void;
  onDone: () => void;
}) {
  const Icon = kindIcons[card.kind];

  return (
    <article className={`plan-card plan-card-${status}`}>
      <div className="plan-card-topline">
        <span className="plan-kind">
          <Icon aria-hidden="true" size={17} />
          {kindLabels[card.kind]}
        </span>
        <span className="plan-effort">{card.effortLevel} effort</span>
      </div>
      <h2>{card.title}</h2>
      <dl className="plan-details">
        <div>
          <dt>Why this helps</dt>
          <dd>{card.whyThisHelps}</dd>
        </div>
        <div>
          <dt>Estimated time</dt>
          <dd>{card.estimatedTime}</dd>
        </div>
        {card.messageTarget ? (
          <div>
            <dt>Message target</dt>
            <dd>{card.messageTarget}</dd>
          </div>
        ) : null}
        <div>
          <dt>Fallback lighter version</dt>
          <dd>{card.fallbackLighterVersion}</dd>
        </div>
      </dl>
      <div className="plan-actions">
        <Button onClick={onPick}>Pick one</Button>
        <Button variant="ghost" onClick={onLater}>Maybe later</Button>
        <Button variant="ghost" onClick={onDone}>Done for today</Button>
      </div>
      {status !== "open" ? <p className="plan-status">{status === "picked" ? "Picked" : "Set aside"}</p> : null}
    </article>
  );
}

function formatMode(mode: ScoredCheckIn["mode"]) {
  return mode.replaceAll("-", " ");
}
