import { useState, useEffect } from 'react';
import type { FrictionLevel, SafetyLevel } from '../types/index';

interface Props {
  draft: string;
  patientLabel: string;
  frictionLevel: FrictionLevel;
  safetyLevel: SafetyLevel;
}

export function CaregiverPanel({ draft, patientLabel, frictionLevel, safetyLevel }: Props) {
  const [editedDraft, setEditedDraft] = useState(draft);
  const [hasCopied, setHasCopied] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  // Sync when parent provides a new draft
  useEffect(() => {
    setEditedDraft(draft);
    setHasSent(false);
  }, [draft]);

  const wordCount = editedDraft.trim().split(/\s+/).filter(Boolean).length;

  const handleCopy = () => {
    void navigator.clipboard.writeText(editedDraft).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
      {(safetyLevel === 'red' || safetyLevel === 'emergency') && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          Safety alert detected. Review the escalation message above before sharing this draft.
        </div>
      )}

      <h3 className="font-semibold text-slate-800 mb-1">Caregiver message draft</h3>
      <p className="text-xs text-slate-500 mb-3">
        Edit this message before sharing. It was drafted from today's recovery signals.
      </p>

      <textarea
        value={editedDraft}
        onChange={e => setEditedDraft(e.target.value)}
        rows={6}
        className="w-full text-sm border border-slate-200 rounded-lg p-3 text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-400">{wordCount} words</span>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition-colors"
          >
            {hasCopied ? 'Copied!' : 'Copy to clipboard'}
          </button>
          <button
            onClick={() => setHasSent(true)}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"
          >
            Simulate send
          </button>
        </div>
      </div>

      {hasSent && (
        <p className="mt-2 text-sm text-green-700">
          Message marked as sent. In a real deployment, this would notify {patientLabel}'s support
          contact.
        </p>
      )}

      {frictionLevel === 'high' && (
        <p className="mt-3 text-xs text-orange-600">
          High friction day — consider reaching out sooner rather than later.
        </p>
      )}

      <p className="mt-4 text-xs text-slate-400 border-t border-slate-100 pt-3">
        This draft was generated from patient-reported data. Always review before sharing. ReEntry
        does not send messages automatically.
      </p>
    </div>
  );
}
