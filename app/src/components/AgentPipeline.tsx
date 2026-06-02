import { useState } from 'react';
import type { AgentResult, SafetyResult } from '../types/index';

interface Props {
  result: AgentResult | null;
  safety: SafetyResult;
  isLoading: boolean;
}

const SAFETY_COLORS: Record<string, string> = {
  clear: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  emergency: 'bg-red-600 text-white font-bold',
};

function Skeleton() {
  return <div className="animate-pulse h-4 bg-slate-200 rounded w-3/4 my-1" />;
}

function AgentCard({
  title,
  label,
  borderColor,
  bgClass,
  badge,
  children,
}: {
  title: string;
  label?: string;
  borderColor: string;
  bgClass?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={`border-l-4 ${borderColor} rounded-r-lg p-4 mb-3 ${bgClass ?? 'bg-white'} shadow-sm`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-slate-800 text-sm">{title}</span>
        {label && (
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{label}</span>
        )}
        {badge}
      </div>
      <div className="text-sm text-slate-700">{children}</div>
    </div>
  );
}

export function AgentPipeline({ result, safety, isLoading }: Props) {
  const [copied, setCopied] = useState(false);
  const blocked = safety.blockedAgents;

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const safetyBadge = (
    <span className={`text-xs px-2 py-0.5 rounded ${SAFETY_COLORS[safety.level]}`}>
      {safety.level.toUpperCase()}
    </span>
  );

  return (
    <div>
      {(safety.level === 'red' || safety.level === 'emergency') && safety.escalationMessage && (
        <div className="mb-4 p-4 bg-red-600 text-white rounded-lg font-medium text-sm">
          {safety.escalationMessage}
        </div>
      )}

      {/* Signal Agent */}
      <AgentCard
        title="Signal Agent"
        borderColor={blocked ? 'border-slate-400' : isLoading ? 'border-slate-300' : 'border-blue-500'}
      >
        {blocked ? (
          <span className="text-slate-500 italic">Blocked by safety router.</span>
        ) : isLoading ? (
          <><Skeleton /><Skeleton /></>
        ) : (
          result?.signalSummary ?? '—'
        )}
      </AgentCard>

      {/* Friction Model */}
      <AgentCard
        title="Friction Model"
        borderColor={blocked ? 'border-slate-400' : isLoading ? 'border-slate-300' : 'border-blue-500'}
      >
        {blocked ? (
          <span className="text-slate-500 italic">Blocked by safety router.</span>
        ) : isLoading ? (
          <Skeleton />
        ) : (
          result?.frictionExplanation ?? '—'
        )}
      </AgentCard>

      {/* Safety Agent — always shown, always deterministic */}
      <AgentCard
        title="Safety Agent"
        label="Deterministic — no AI"
        borderColor={safety.level === 'clear' ? 'border-green-400' : safety.level === 'yellow' ? 'border-yellow-400' : 'border-red-500'}
        bgClass="bg-slate-50"
        badge={safetyBadge}
      >
        {safety.flags.length === 0 ? (
          <span className="text-green-700">No flags detected. Agent pipeline cleared to proceed.</span>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {safety.flags.map((f, i) => (
              <li key={i} className="text-red-700">{f}</li>
            ))}
          </ul>
        )}
      </AgentCard>

      {/* Care Plan Agent */}
      <AgentCard
        title="Care Plan Agent"
        borderColor={blocked ? 'border-slate-400' : isLoading ? 'border-slate-300' : 'border-blue-500'}
      >
        {blocked ? (
          <span className="text-slate-500 italic">Blocked by safety router.</span>
        ) : isLoading ? (
          <><Skeleton /><Skeleton /><Skeleton /></>
        ) : result?.carePlanSteps ? (
          <ol className="list-decimal list-inside space-y-1">
            {result.carePlanSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        ) : (
          '—'
        )}
      </AgentCard>

      {/* Caregiver Agent */}
      <AgentCard
        title="Caregiver Agent"
        label="AI-generated — review before sharing"
        borderColor={blocked ? 'border-slate-400' : isLoading ? 'border-slate-300' : 'border-blue-500'}
      >
        {blocked ? (
          <span className="text-slate-500 italic">Blocked by safety router.</span>
        ) : isLoading ? (
          <><Skeleton /><Skeleton /></>
        ) : result?.caregiverDraft ? (
          <div>
            <p className="mb-2">{result.caregiverDraft}</p>
            <button
              onClick={() => copyToClipboard(result.caregiverDraft)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded transition-colors"
            >
              {copied ? 'Copied!' : 'Copy draft'}
            </button>
          </div>
        ) : (
          '—'
        )}
      </AgentCard>
    </div>
  );
}
