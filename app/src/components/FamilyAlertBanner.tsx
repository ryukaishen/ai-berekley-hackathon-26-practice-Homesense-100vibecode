import type { FrictionScore, SafetyResult } from '../types/index';
import { AlertTriangle, Phone } from 'lucide-react';

interface Props {
  friction: FrictionScore;
  safety: SafetyResult;
  patientName: string;
  firstDeclineStart: string;
  lastNote: string | null;
}

function fmt(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export function FamilyAlertBanner({ friction, safety, patientName, firstDeclineStart, lastNote }: Props) {
  const isEmergency = safety.level === 'emergency';
  const isRed       = safety.level === 'red';
  const isElevated  = friction.level === 'elevated' || friction.level === 'high';

  const bg     = isEmergency ? 'bg-red-600'    : isRed ? 'bg-red-50 border border-red-300'    : 'bg-amber-50 border border-amber-300';
  const text   = isEmergency ? 'text-white'    : isRed ? 'text-red-900'   : 'text-amber-900';
  const sub    = isEmergency ? 'text-red-100'  : isRed ? 'text-red-700'   : 'text-amber-700';
  const badge  = isEmergency ? 'bg-white text-red-600' : isRed ? 'bg-red-600 text-white' : 'bg-amber-500 text-white';

  if (!isElevated && safety.level === 'clear') return null;

  return (
    <div className={`rounded-lg p-4 mb-4 ${bg}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-full p-1.5 ${badge}`}>
          {isEmergency
            ? <Phone className="h-4 w-4" />
            : <AlertTriangle className="h-4 w-4" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-sm font-bold ${text}`}>
              {isEmergency ? 'Call 911 now' : isRed ? 'Contact care team today' : 'Pattern detected'}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>
              {friction.level.toUpperCase()} · {friction.total}/100
            </span>
          </div>

          <p className={`text-sm ${text} mb-1`}>
            {isEmergency
              ? safety.escalationMessage
              : <>
                  <strong>{patientName}</strong>'s pattern this week matches the trajectory from{' '}
                  <strong>{fmt(firstDeclineStart)}</strong> — the 2 weeks before her last hospitalization.
                </>
            }
          </p>

          {safety.flags.length > 0 && (
            <p className={`text-xs ${sub} mb-1`}>
              Flags: {safety.flags.join(' · ')}
            </p>
          )}

          {lastNote && (
            <p className={`text-xs ${sub} italic mt-1`}>
              Last check-in: "{lastNote}"
            </p>
          )}

          <div className={`text-xs ${sub} mt-2`}>
            {friction.topDrivers.map((d, i) => (
              <span key={i} className="mr-3">→ {d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
