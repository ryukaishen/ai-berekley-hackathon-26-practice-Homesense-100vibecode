import { Activity, RadioTower } from "lucide-react";
import type { AssessmentMode, SensorFrame } from "../types";

interface MotionGaugeProps {
  frames: SensorFrame[];
  progress: number;
  mode: AssessmentMode;
  liveMotion?: { x: number; y: number; z: number };
}

const modeLabel: Record<AssessmentMode, string> = {
  mock: "Mock sensor stream",
  webcam: "Webcam pose overlay",
  motion: "Phone motion listener",
  esp32: "ESP32 WebSocket stream",
};

export function MotionGauge({ frames, progress, mode, liveMotion }: MotionGaugeProps) {
  const latest = frames.length > 0 ? frames[frames.length - 1] : undefined;
  const bars = frames.slice(-34);
  const stability = latest ? Math.round(latest.confidence * 100) : 88;

  return (
    <div className="motion-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-slate-500">Signal</p>
          <h3 className="text-lg font-black text-slate-950">{modeLabel[mode]}</h3>
        </div>
        <div
          className="radial-mini"
          style={{ background: `conic-gradient(#0f766e ${stability * 3.6}deg, #e2e8f0 0deg)` }}
          aria-label={`Signal confidence ${stability} percent`}
        >
          <span>{stability}</span>
        </div>
      </div>

      <div className="mt-5 h-28 rounded-lg border border-slate-200 bg-white p-3">
        <div className="waveform" aria-hidden="true">
          {bars.map((frame, index) => (
            <span
              key={`${frame.t}-${index}`}
              style={{
                height: `${Math.max(14, Math.min(96, frame.verticalMotion * 72 + frame.sway * 48))}%`,
                backgroundColor: frame.phase === "turn" ? "#f9735b" : frame.phase === "stand" ? "#0f766e" : "#6366f1",
              }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="metric-strip">
          <Activity className="h-4 w-4 text-teal-700" aria-hidden="true" />
          <span>{latest ? latest.phase : "ready"}</span>
        </div>
        <div className="metric-strip">
          <RadioTower className="h-4 w-4 text-coral" aria-hidden="true" />
          <span>{Math.round(progress)}% captured</span>
        </div>
        <div className="metric-strip">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>
            {liveMotion
              ? `${liveMotion.x.toFixed(1)}, ${liveMotion.y.toFixed(1)}, ${liveMotion.z.toFixed(1)}`
              : "supportive indicators"}
          </span>
        </div>
      </div>
    </div>
  );
}
