import { useState, useMemo } from 'react';
import type { DailyRecoverySignal } from '../types/index';
import type { BaselineResult } from '../engine/baseline';
import { computeFrictionScore } from '../engine/frictionScorer';

// Stub baseline with adjustable z-scores for the live demo
function makeBaseline(sleepZ: number, hrvZ: number, stepsZ: number): BaselineResult {
  return {
    sleepHours: { mean: 7.0, stdDev: 0.8, zScore: sleepZ },
    sleepEfficiency: { mean: 0.78, stdDev: 0.05, zScore: 0 },
    steps: { mean: 6000, stdDev: 2000, zScore: stepsZ },
    activeMinutes: { mean: 35, stdDev: 12, zScore: 0 },
    restingHeartRate: { mean: 72, stdDev: 5, zScore: 0 },
    hrvRmssd: { mean: 38, stdDev: 10, zScore: hrvZ },
    breathingRate: { mean: 15, stdDev: 2, zScore: 0 },
    windowDays: 7,
    computedAt: new Date().toISOString(),
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-slate-800 mb-3 border-b border-slate-200 pb-2">{title}</h2>
      {children}
    </section>
  );
}

export function EvaluationPage() {
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepZ, setSleepZ] = useState(0);
  const [hrvRmssd, setHrvRmssd] = useState(38);
  const [hrvZ, setHrvZ] = useState(0);
  const [stepsZ, setStepsZ] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(35);
  const [cognitiveLoad, setCognitiveLoad] = useState(2 as 1 | 2 | 3 | 4 | 5);
  const [energy, setEnergy] = useState(4 as 1 | 2 | 3 | 4 | 5);

  const liveScore = useMemo(() => {
    const today: DailyRecoverySignal = {
      date: new Date().toISOString().slice(0, 10),
      sleepHours,
      sleepEfficiency: 0.78,
      steps: Math.max(0, 6000 + stepsZ * 2000),
      activeMinutes,
      restingHeartRate: 72,
      hrvRmssd,
      breathingRate: 15,
      spo2Avg: 0.97,
      deviceSyncedAt: new Date().toISOString(),
      routineCompleted: activeMinutes >= 20,
      checkIn: {
        energy,
        cognitiveLoad,
        socialLoad: 2,
        bodyState: ['none'],
        practicalBlockers: ['none'],
        note: '',
      },
    };
    const baseline = makeBaseline(sleepZ, hrvZ, stepsZ);
    return computeFrictionScore(today, baseline);
  }, [sleepHours, sleepZ, hrvRmssd, hrvZ, stepsZ, activeMinutes, cognitiveLoad, energy]);

  const LEVEL_COLORS: Record<string, string> = {
    low: 'text-green-600',
    moderate: 'text-yellow-600',
    elevated: 'text-orange-500',
    high: 'text-red-600',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">How ReEntry works</h1>
        <p className="text-slate-500 text-sm mb-8">
          Technical transparency for hackathon judges, sponsors, and clinical reviewers.
        </p>

        <Section title="1. How the friction score is computed">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="text-left px-4 py-2">Component</th>
                <th className="text-left px-4 py-2">Points</th>
                <th className="text-left px-4 py-2">Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-medium">Sleep</td>
                <td className="px-4 py-3">0 – 25</td>
                <td className="px-4 py-3 text-slate-500">z &lt; −1.0 → +10, z &lt; −1.5 → +5, z &lt; −2.0 → +5; efficiency &lt; 0.75 → +5</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">HRV</td>
                <td className="px-4 py-3">0 – 25</td>
                <td className="px-4 py-3 text-slate-500">z &lt; −1.0 → +10, z &lt; −1.5 → +8, z &lt; −2.0 → +7</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Activity</td>
                <td className="px-4 py-3">0 – 25</td>
                <td className="px-4 py-3 text-slate-500">Steps z &lt; −1.0 → +8; active minutes &lt; 10 → +10; routine not completed → +7</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Check-in</td>
                <td className="px-4 py-3">0 – 25</td>
                <td className="px-4 py-3 text-slate-500">(5 − energy) × 2; (cogLoad − 1) × 2; headache +3, brain fog +3, pain +2, dizziness +3; null check-in → 15</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">
            Level mapping: 0–24 low · 25–49 moderate · 50–74 elevated · 75–100 high
          </p>
        </Section>

        <Section title="2. Safety router thresholds">
          <p className="text-sm text-slate-600 mb-3 font-medium">
            The safety router contains zero AI model calls. All thresholds are hard-coded deterministic
            rules. The same input always produces the same output.
          </p>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-red-700 mb-1">Emergency (agents blocked, escalation shown)</dt>
              <dd className="text-slate-600 ml-3 space-y-0.5">
                <p>• Check-in note contains: "chest pain", "shortness of breath", "suicide", "self harm", "want to die", "hurt myself", "kill myself", etc.</p>
                <p>• SpO2 &lt; 92%</p>
                <p>• Resting HR &gt; 130 bpm</p>
                <p>• Breathing rate &gt; 30 br/min</p>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-orange-700 mb-1">Red (agents blocked, care team message shown)</dt>
              <dd className="text-slate-600 ml-3 space-y-0.5">
                <p>• SpO2 &lt; 94%</p>
                <p>• Resting HR &gt; 110 bpm</p>
                <p>• HRV &lt; 15 ms</p>
                <p>• Friction score ≥ 85</p>
                <p>• Dizziness reported + steps &lt; 500</p>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-yellow-700 mb-1">Yellow (agents proceed, caution flag shown)</dt>
              <dd className="text-slate-600 ml-3 space-y-0.5">
                <p>• Friction score ≥ 60</p>
                <p>• Sleep &lt; 4 hours</p>
                <p>• Energy = 1/5</p>
                <p>• Device did not sync</p>
              </dd>
            </div>
          </dl>
        </Section>

        <Section title="3. What the AI agents do and don't do">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="text-left px-4 py-2">Agent</th>
                <th className="text-left px-4 py-2">Allowed</th>
                <th className="text-left px-4 py-2">Not allowed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {[
                ['Signal Agent', 'Describe wearable deviation in plain language', 'Diagnose, make clinical claims, mention medication'],
                ['Friction Model', 'Explain score components in plain language', 'Override the deterministic score'],
                ['Safety Agent', 'Check hard-coded thresholds (no AI)', 'Nothing — it contains zero model calls'],
                ['Care Plan Agent', 'Generate 3 concrete non-medical daily steps', 'Prescribe, recommend treatment, say "see a doctor"'],
                ['Caregiver Agent', 'Draft a specific support message in patient voice', 'Diagnose, use medical jargon, auto-send'],
                ['Clinician Summary', 'Produce structured patient-reported data summary', 'Diagnose, recommend treatment, claim clinical validity'],
              ].map(([agent, allowed, blocked]) => (
                <tr key={agent}>
                  <td className="px-4 py-2 font-medium text-slate-800">{agent}</td>
                  <td className="px-4 py-2 text-green-700">{allowed}</td>
                  <td className="px-4 py-2 text-red-600">{blocked}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">
            AI agents only receive structured numerical data and pre-validated text. They have no
            access to raw patient records, previous conversations, or data beyond the current day's signal.
          </p>
        </Section>

        <Section title="4. What this system never claims">
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>Does not diagnose any condition</li>
            <li>Does not recommend treatment, medication, or dosage</li>
            <li>Does not replace clinical evaluation</li>
            <li>Does not claim HIPAA compliance</li>
            <li>Does not store real patient data</li>
            <li>Severe or life-threatening symptoms are routed to emergency services, not managed by AI</li>
          </ul>
        </Section>

        <Section title="5. Try the scoring engine live">
          <p className="text-sm text-slate-500 mb-4">
            Adjust the sliders to see how the friction score responds. This is the same engine used in the app.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {[
              { label: 'Sleep hours', value: sleepHours, min: 3, max: 10, step: 0.5, set: setSleepHours },
              { label: 'Sleep z-score vs baseline', value: sleepZ, min: -3, max: 2, step: 0.1, set: setSleepZ },
              { label: 'HRV RMSSD (ms)', value: hrvRmssd, min: 10, max: 80, step: 1, set: setHrvRmssd },
              { label: 'HRV z-score vs baseline', value: hrvZ, min: -3, max: 2, step: 0.1, set: setHrvZ },
              { label: 'Steps z-score vs baseline', value: stepsZ, min: -3, max: 2, step: 0.1, set: setStepsZ },
              { label: 'Active minutes', value: activeMinutes, min: 0, max: 90, step: 5, set: setActiveMinutes },
              { label: `Cognitive load (${cognitiveLoad}/5)`, value: cognitiveLoad, min: 1, max: 5, step: 1, set: (v: number) => setCognitiveLoad(v as 1|2|3|4|5) },
              { label: `Energy (${energy}/5)`, value: energy, min: 1, max: 5, step: 1, set: (v: number) => setEnergy(v as 1|2|3|4|5) },
            ].map(({ label, value, min, max, step, set }) => (
              <div key={label}>
                <label className="text-xs text-slate-500 block mb-1">
                  {label}: <strong className="text-slate-700">{value}</strong>
                </label>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={e => set(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Live score</p>
            <p className={`text-5xl font-bold ${LEVEL_COLORS[liveScore.level]} mb-1`}>
              {liveScore.total}
              <span className="text-xl font-normal text-slate-400"> / 100</span>
            </p>
            <p className="text-sm font-medium text-slate-700 mb-2">{liveScore.level.toUpperCase()}</p>
            <div className="text-xs text-slate-500 space-y-0.5">
              <p>Sleep: {liveScore.components.sleep} pts · HRV: {liveScore.components.hrv} pts · Activity: {liveScore.components.activity} pts · Check-in: {liveScore.components.checkin} pts</p>
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-0.5">
              {liveScore.topDrivers.map((d, i) => (
                <p key={i} className="before:content-['→'] before:mr-1">{d}</p>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
