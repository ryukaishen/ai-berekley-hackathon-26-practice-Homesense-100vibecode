import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Mic, AlertCircle, Heart } from 'lucide-react';
import { mariaTrack } from '../data/mockMaria';

type Feeling = 'okay' | 'changed' | 'help';

const FEELINGS: Array<{ id: Feeling; label: string; sub: string; color: string; bg: string; border: string }> = [
  { id: 'okay',    label: 'I feel okay',       sub: 'Similar to yesterday',        color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-300' },
  { id: 'changed', label: 'Something changed',  sub: 'Not quite right today',       color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-300' },
  { id: 'help',    label: 'I need help',        sub: 'Please contact my family',    color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-400'   },
];

const VOICE_TRANSCRIPT = "Hard to get up this morning... feet are a little swollen. Didn't sleep well last night. Legs feel heavy.";

const RECENT_DAYS = mariaTrack.days.slice(83, 90);

interface Props {
  onNavigateDashboard: () => void;
}

export function PatientCheckIn({ onNavigateDashboard }: Props) {
  const [selected, setSelected]       = useState<Feeling | null>(null);
  const [transcript, setTranscript]   = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [done, setDone]               = useState(false);
  const intervalRef                   = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSelect = (feeling: Feeling) => {
    setSelected(feeling);
    if (feeling === 'changed') {
      setIsTyping(true);
      setTranscript('');
      let i = 0;
      intervalRef.current = setInterval(() => {
        i++;
        setTranscript(VOICE_TRANSCRIPT.slice(0, i));
        if (i >= VOICE_TRANSCRIPT.length) {
          clearInterval(intervalRef.current!);
          setIsTyping(false);
          setDone(true);
        }
      }, 38);
    } else {
      setDone(true);
    }
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  function fmtDate(iso: string) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  const energyLabel = (e: number) =>
    e === 5 ? 'Great' : e === 4 ? 'Good' : e === 3 ? 'Okay' : e === 2 ? 'Low' : 'Very low';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span className="font-black text-slate-900 text-lg">Maria's Check-In</span>
        </div>
        <button onClick={onNavigateDashboard} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
          ← Family View
        </button>
      </header>

      <div className="max-w-sm mx-auto px-4 py-8">

        {!selected ? (
          <>
            <p className="text-2xl font-bold text-slate-800 text-center mb-2">
              How are you feeling today, Maria?
            </p>
            <p className="text-sm text-slate-500 text-center mb-8">
              Tap one button. That's all.
            </p>

            <div className="flex flex-col gap-4">
              {FEELINGS.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleSelect(f.id)}
                  className={`w-full rounded-xl border-2 p-5 text-left transition-transform active:scale-95 ${f.bg} ${f.border}`}
                >
                  <p className={`text-xl font-bold ${f.color}`}>{f.label}</p>
                  <p className={`text-sm mt-0.5 ${f.color} opacity-75`}>{f.sub}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Confirmation */}
            <div className={`rounded-xl border-2 p-5 mb-6 ${
              selected === 'help'    ? 'bg-red-50 border-red-400' :
              selected === 'changed' ? 'bg-amber-50 border-amber-300' :
              'bg-green-50 border-green-300'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selected === 'help'
                  ? <AlertCircle className="h-5 w-5 text-red-600" />
                  : <CheckCircle className="h-5 w-5 text-green-600" />
                }
                <p className="font-bold text-slate-800">
                  {selected === 'okay'    ? 'Got it, Maria. Have a good day!'     :
                   selected === 'changed' ? 'Thanks for letting us know.'          :
                   'We\'re contacting your family now.'}
                </p>
              </div>
              {selected === 'help' && (
                <p className="text-sm text-red-700">Your daughter has been notified. Stay where you are.</p>
              )}
            </div>

            {/* Simulated voice transcript for "something changed" */}
            {selected === 'changed' && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Mic className={`h-4 w-4 ${isTyping ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                  <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                    {isTyping ? 'Listening…' : 'Transcript'}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed min-h-[3rem]">
                  {transcript}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
                {done && (
                  <p className="text-xs text-blue-600 mt-3">
                    ✓ Check-in logged and sent to family dashboard
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => { setSelected(null); setTranscript(''); setDone(false); }}
              className="w-full text-sm text-slate-500 hover:text-slate-700 underline mb-8"
            >
              Change my answer
            </button>
          </>
        )}

        {/* Recent check-in history */}
        <div className="mt-2">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">
            Recent check-ins
          </p>
          <div className="space-y-2">
            {RECENT_DAYS.map(day => (
              <div key={day.date} className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-slate-500">{fmtDate(day.date)}</span>
                {day.checkIn ? (
                  <span className={`text-xs font-semibold ${
                    day.checkIn.energy <= 2 ? 'text-red-600' :
                    day.checkIn.energy === 3 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {energyLabel(day.checkIn.energy)}
                  </span>
                ) : (
                  <span className="text-xs text-slate-300 italic">missed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
