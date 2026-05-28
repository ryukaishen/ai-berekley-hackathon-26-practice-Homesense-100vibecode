import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Copy, FileText, ShieldCheck } from "lucide-react";
import { Button, PageHeader, SurfaceCard } from "@reentry/ui";

type RecipientType = "trusted friend" | "clinician" | "school/work contact" | "family lead";

const recipientOptions: RecipientType[] = [
  "trusted friend",
  "clinician",
  "school/work contact",
  "family lead"
];

export function HandoffPage() {
  const [recipient, setRecipient] = useState<RecipientType>("trusted friend");
  const [includeScore, setIncludeScore] = useState(true);
  const [includePlan, setIncludePlan] = useState(true);
  const [includeSupportAsk, setIncludeSupportAsk] = useState(true);
  const [includePrivateDetails, setIncludePrivateDetails] = useState(false);
  const [currentState, setCurrentState] = useState(
    "Jordan is having a high-friction week after a destabilizing transition. Energy is low, cognitive load is high, and logistics are the main blocker."
  );
  const [boundaries, setBoundaries] = useState(
    "Please keep the response practical. Do not share this outside the support circle."
  );
  const [status, setStatus] = useState("");

  const summary = useMemo(() => {
    const lines = [
      `Recipient: ${recipient}.`,
      currentState.trim(),
      includeScore ? "Recent recovery friction score: 58/100. Mode: ask-help." : "",
      includePlan
        ? "Current plan: do a 10-minute body reset, confirm one logistics detail, and ask for one specific assist."
        : "",
      includeSupportAsk
        ? "Useful support right now: a check-in after dinner, help choosing the next step, or a ride/logistics confirmation."
        : "",
      includePrivateDetails
        ? "Private details included by user choice."
        : "Private health, family, money, and location details are intentionally omitted.",
      boundaries.trim() ? `Boundaries: ${boundaries.trim()}` : "",
      "ReEntry is a non-clinical support tool and this summary is not a diagnosis or treatment plan."
    ];

    return lines.filter(Boolean).join("\n\n");
  }, [boundaries, currentState, includePlan, includePrivateDetails, includeScore, includeSupportAsk, recipient]);

  const copySummary = async () => {
    await navigator.clipboard?.writeText(summary);
    setStatus("Handoff copied. You can paste it into a text, email, portal message, or notes app.");
  };

  const saveSummary = () => {
    window.localStorage.setItem("reentry-handoff-note", JSON.stringify({ summary, savedAt: new Date().toISOString() }));
    setStatus("Handoff saved locally for this session.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Handoff"
        title="Make asking for human backup less exhausting"
        subtitle="Build a short, privacy-aware summary for a trusted person, clinician, or school/work contact."
        action={
          <div className="action-row">
            <Button onClick={copySummary}>
              <Copy aria-hidden="true" size={16} />
              Copy handoff
            </Button>
            <Button variant="ghost" onClick={saveSummary}>
              <FileText aria-hidden="true" size={16} />
              Save note
            </Button>
          </div>
        }
      />

      <section className="handoff-layout">
        <SurfaceCard title="Summary builder" subtitle="Choose what is safe and useful to share.">
          <label className="app-field">
            <span>Recipient</span>
            <select
              className="focus-ring"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value as RecipientType)}
            >
              {recipientOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="app-field">
            <span>Current state</span>
            <textarea
              className="focus-ring"
              rows={5}
              value={currentState}
              onChange={(event) => setCurrentState(event.target.value)}
            />
          </label>

          <div className="handoff-toggle-grid" aria-label="Handoff fields">
            <Toggle checked={includeScore} label="Include recovery friction score" onChange={setIncludeScore} />
            <Toggle checked={includePlan} label="Include current plan cards" onChange={setIncludePlan} />
            <Toggle checked={includeSupportAsk} label="Include concrete support ask" onChange={setIncludeSupportAsk} />
            <Toggle checked={includePrivateDetails} label="Include private details" onChange={setIncludePrivateDetails} />
          </div>

          <label className="app-field">
            <span>Boundaries</span>
            <input
              className="focus-ring"
              value={boundaries}
              onChange={(event) => setBoundaries(event.target.value)}
            />
          </label>
        </SurfaceCard>

        <SurfaceCard title="Privacy-safe output" subtitle="Short enough to send, structured enough to be useful.">
          <div className="handoff-output" aria-label="Generated handoff summary">
            {summary}
          </div>
          <div className="handoff-safety-note">
            <ShieldCheck aria-hidden="true" size={18} />
            <span>Private details stay out unless you explicitly include them.</span>
          </div>
          <div className="route-action-list mt-3">
            <Link className="route-action" to="/support-circle">
              Review sharing permissions
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="route-action" to="/history">
              Check recent history
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
          {status ? <p className="permission-notice mt-3" role="status">{status}</p> : null}
        </SurfaceCard>
      </section>
    </>
  );
}

function Toggle({
  checked,
  label,
  onChange
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`handoff-toggle ${checked ? "handoff-toggle-on" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
