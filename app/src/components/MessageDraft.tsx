import { Copy, MessageSquareText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MessageDraft as Draft } from "../types";

interface MessageDraftProps {
  drafts: Draft[];
}

export function MessageDraft({ drafts }: MessageDraftProps) {
  const [activeDraftId, setActiveDraftId] = useState(drafts[0]?.id ?? "");
  const activeDraft = useMemo(
    () => drafts.find((draft) => draft.id === activeDraftId) ?? drafts[0],
    [activeDraftId, drafts],
  );
  const [body, setBody] = useState(activeDraft?.body ?? "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveDraftId(drafts[0]?.id ?? "");
  }, [drafts]);

  useEffect(() => {
    setBody(activeDraft?.body ?? "");
  }, [activeDraft]);

  const copyDraft = async () => {
    if (!activeDraft) return;
    try {
      await navigator.clipboard.writeText(`Subject: ${activeDraft.subject}\n\n${body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  if (!activeDraft) return null;

  return (
    <section className="info-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Generated messages</p>
          <h2 className="mt-2 flex items-center gap-2 text-2xl font-black text-slate-950">
            <MessageSquareText className="h-6 w-6 text-teal-700" aria-hidden="true" />
            Editable drafts
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            These drafts do not send anything. They are scenario-specific starting points for human review.
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={copyDraft}>
          <Copy className="h-4 w-4" aria-hidden="true" />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {drafts.map((draft) => (
          <button
            key={draft.id}
            type="button"
            className={`draft-tab ${draft.id === activeDraft.id ? "draft-tab-active" : ""}`}
            onClick={() => setActiveDraftId(draft.id)}
          >
            {draft.title}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="status-chip chip-slate">To: {activeDraft.audience}</span>
          <span className="status-chip chip-blue">Subject: {activeDraft.subject}</span>
        </div>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className="min-h-56 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />
      </div>
    </section>
  );
}
