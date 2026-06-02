import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardCheck, Flag, RotateCcw } from "lucide-react";
import {
  bodyStateTagOptions,
  getFrictionDomainForLabel,
  practicalBlockerTagOptions,
  recoveryFrictionDefinition,
  recoveryFrictionDomains,
  scoreCheckIn,
  standWiseFlagOptions,
  type BodyStateTag,
  type CheckInPayload,
  type PracticalBlockerTag,
  type StandWiseFlag
} from "@reentry/shared";
import { Button, PageHeader, SurfaceCard } from "@reentry/ui";

const steps = ["Capacity", "Load", "Signals", "Notes", "Score"] as const;

const initialCheckIn: CheckInPayload = {
  energy: 3,
  sleepQuality: 3,
  cognitiveLoad: 3,
  socialLoad: 3,
  bodyStateTags: [],
  practicalBlockerTags: [],
  standWiseFlags: [],
  note: ""
};

const modeLabels: Record<ReturnType<typeof scoreCheckIn>["mode"], string> = {
  "routine-restart": "Routine restart",
  stabilize: "Stabilize",
  "ask-help": "Ask for help",
  "escalate-human": "Escalate to a human"
};

export function CheckInPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [checkIn, setCheckIn] = useState<CheckInPayload>(initialCheckIn);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const score = useMemo(() => scoreCheckIn(checkIn), [checkIn]);

  const canGoBack = stepIndex > 0;
  const canGoNext = stepIndex < steps.length - 1;

  const updateScale = (key: "energy" | "sleepQuality" | "cognitiveLoad" | "socialLoad", value: number) => {
    setCheckIn((current) => ({ ...current, [key]: value }));
    setSavedAt(null);
  };

  const toggleBodyTag = (tag: BodyStateTag) => {
    setCheckIn((current) => ({
      ...current,
      bodyStateTags: toggleValue(current.bodyStateTags, tag)
    }));
    setSavedAt(null);
  };

  const togglePracticalTag = (tag: PracticalBlockerTag) => {
    setCheckIn((current) => ({
      ...current,
      practicalBlockerTags: toggleValue(current.practicalBlockerTags, tag)
    }));
    setSavedAt(null);
  };

  const toggleStandWiseFlag = (flag: StandWiseFlag) => {
    setCheckIn((current) => ({
      ...current,
      standWiseFlags: toggleValue(current.standWiseFlags ?? [], flag)
    }));
    setSavedAt(null);
  };

  const reset = () => {
    setCheckIn(initialCheckIn);
    setStepIndex(0);
    setSavedAt(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Check-In"
        title="Name the friction, then choose the next mode"
        subtitle="Friction means the concrete drag on recovery: body capacity, routine stability, thinking load, social load, practical blockers, wearable drift, data freshness, and safety flags."
        action={
          <Button variant="ghost" onClick={reset}>
            <RotateCcw aria-hidden="true" size={16} />
            Reset
          </Button>
        }
      />

      <div className="checkin-shell">
        <aside className="checkin-steps" aria-label="Check-in progress">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              className={`checkin-step focus-ring ${index === stepIndex ? "checkin-step-active" : ""}`}
              onClick={() => setStepIndex(index)}
              aria-current={index === stepIndex ? "step" : undefined}
            >
              <span>{index + 1}</span>
              {step}
            </button>
          ))}
        </aside>

        <section className="checkin-stage">
          {stepIndex === 0 ? (
            <SurfaceCard title="Capacity" subtitle="Rate the basics from 1 to 5.">
              <div className="checkin-control-grid">
                <ScaleField
                  label="Energy"
                  lowLabel="empty"
                  highLabel="ready"
                  value={checkIn.energy}
                  onChange={(value) => updateScale("energy", value)}
                />
                <ScaleField
                  label="Sleep quality"
                  lowLabel="rough"
                  highLabel="rested"
                  value={checkIn.sleepQuality}
                  onChange={(value) => updateScale("sleepQuality", value)}
                />
              </div>
            </SurfaceCard>
          ) : null}

          {stepIndex === 1 ? (
            <SurfaceCard title="Load" subtitle="Capture how demanding today feels.">
              <div className="checkin-control-grid">
                <ScaleField
                  label="Cognitive load"
                  lowLabel="light"
                  highLabel="heavy"
                  value={checkIn.cognitiveLoad}
                  onChange={(value) => updateScale("cognitiveLoad", value)}
                />
                <ScaleField
                  label="Social load"
                  lowLabel="quiet"
                  highLabel="overfull"
                  value={checkIn.socialLoad}
                  onChange={(value) => updateScale("socialLoad", value)}
                />
              </div>
            </SurfaceCard>
          ) : null}

          {stepIndex === 2 ? (
            <SurfaceCard title="Signals" subtitle="Select anything currently making recovery harder.">
              <TagGroup title="Body state" values={bodyStateTagOptions} selected={checkIn.bodyStateTags} onToggle={toggleBodyTag} />
              <TagGroup
                title="Practical blockers"
                values={practicalBlockerTagOptions}
                selected={checkIn.practicalBlockerTags}
                onToggle={togglePracticalTag}
              />
            </SurfaceCard>
          ) : null}

          {stepIndex === 3 ? (
            <SurfaceCard title="Notes and imported flags" subtitle="Add context only if it helps.">
              <label className="checkin-note-label" htmlFor="checkin-note">
                Optional note
              </label>
              <textarea
                id="checkin-note"
                className="checkin-note focus-ring"
                value={checkIn.note ?? ""}
                onChange={(event) => {
                  setCheckIn((current) => ({ ...current, note: event.target.value }));
                  setSavedAt(null);
                }}
                rows={5}
                placeholder="Short context, reminder, or detail for later."
              />
              <TagGroup
                title="Imported StandWise flags"
                values={standWiseFlagOptions}
                selected={checkIn.standWiseFlags ?? []}
                onToggle={toggleStandWiseFlag}
              />
            </SurfaceCard>
          ) : null}

          {stepIndex === 4 ? (
            <SurfaceCard title="Recovery friction score" subtitle="Generated from deterministic rules.">
              <p className="checkin-friction-definition">{recoveryFrictionDefinition}</p>
              <div className="checkin-score-grid">
                <div className="checkin-score-ring" aria-label={`Recovery friction score ${score.recoveryFrictionScore} out of 100`}>
                  <span>{score.recoveryFrictionScore}</span>
                  <small>/100</small>
                </div>
                <div>
                  <p className="re-meta m-0">Mode</p>
                  <h2 className="checkin-mode">{modeLabels[score.mode]}</h2>
                  <p className="re-meta m-0">Confidence {Math.round(score.confidence * 100)}%</p>
                </div>
              </div>

              <div className="checkin-result-grid">
                <div>
                  <h3 className="checkin-section-title">Top blockers</h3>
                  <div className="checkin-tag-row">
                    {score.topBlockers.length ? (
                      score.topBlockers.map((blocker) => (
                        <span key={blocker} className="checkin-tag checkin-tag-active">
                          {blocker} - {getFrictionDomainForLabel(blocker).title}
                        </span>
                      ))
                    ) : (
                      <span className="re-meta">No strong blockers selected.</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="checkin-section-title">Evidence</h3>
                  <ul className="checkin-evidence">
                    {score.evidence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </SurfaceCard>
          ) : null}

          <div className="checkin-nav">
            <Button variant="ghost" onClick={() => setStepIndex((index) => Math.max(0, index - 1))} disabled={!canGoBack}>
              <ArrowLeft aria-hidden="true" size={16} />
              Back
            </Button>
            {canGoNext ? (
              <Button onClick={() => setStepIndex((index) => Math.min(steps.length - 1, index + 1))}>
                Next
                <ArrowRight aria-hidden="true" size={16} />
              </Button>
            ) : (
              <Button onClick={() => setSavedAt(new Date().toISOString())}>
                <ClipboardCheck aria-hidden="true" size={16} />
                Save check-in
              </Button>
            )}
          </div>
          {savedAt ? (
            <p className="checkin-saved" role="status">
              Saved locally at {new Date(savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.
            </p>
          ) : null}
        </section>

        <aside className="checkin-live-summary" aria-live="polite">
          <SurfaceCard title="Live score" subtitle="Updates as fields change.">
            <p className="checkin-live-score">{score.recoveryFrictionScore}</p>
            <p className="checkin-live-mode">{modeLabels[score.mode]}</p>
            <div className="checkin-mini-evidence">
              <Flag aria-hidden="true" size={16} />
              <span>{score.topBlockers[0] ?? "No dominant blocker yet"}</span>
            </div>
          </SurfaceCard>
          <SurfaceCard title="Friction domains" subtitle="What the score is scanning.">
            <div className="checkin-domain-stack">
              {recoveryFrictionDomains.slice(0, 5).map((domain) => (
                <div key={domain.id}>
                  <strong>{domain.title}</strong>
                  <span>{domain.plainMeaning}</span>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </aside>
      </div>
    </>
  );
}

function ScaleField({
  label,
  lowLabel,
  highLabel,
  value,
  onChange
}: {
  label: string;
  lowLabel: string;
  highLabel: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset className="checkin-scale">
      <legend>{label}</legend>
      <div className="checkin-scale-options" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((option) => (
          <button
            key={option}
            type="button"
            className={`checkin-scale-button focus-ring ${value === option ? "checkin-scale-button-active" : ""}`}
            role="radio"
            aria-checked={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="checkin-scale-labels">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </fieldset>
  );
}

function TagGroup<T extends string>({
  title,
  values,
  selected,
  onToggle
}: {
  title: string;
  values: readonly T[];
  selected: readonly T[];
  onToggle: (value: T) => void;
}) {
  return (
    <section className="checkin-tag-section">
      <h3 className="checkin-section-title">{title}</h3>
      <div className="checkin-tag-row">
        {values.map((value) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              className={`checkin-tag focus-ring ${active ? "checkin-tag-active" : ""}`}
              aria-pressed={active}
              onClick={() => onToggle(value)}
            >
              {formatTag(value)}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function toggleValue<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function formatTag(value: string) {
  return value.replaceAll("-", " ");
}
