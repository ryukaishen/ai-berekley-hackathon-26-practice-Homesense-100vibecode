import { Camera, CircleStop, Play, Radio, RotateCw, Smartphone } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getMockSensorStream } from "../data/mockSensorStreams";
import type { AssessmentMode, AssessmentResult, AssessmentTest, PatientScenario, SensorFrame, SymptomInput } from "../types";
import { analyzeAssessment } from "../utils/analyzeAssessment";
import { runBackendAssessment } from "../services/backendApi";
import { MotionGauge } from "./MotionGauge";

interface PoseCheckPanelProps {
  scenario: PatientScenario;
  symptoms: SymptomInput;
  test: AssessmentTest;
  mode: AssessmentMode;
  onComplete: (result: AssessmentResult) => void;
}

type RunPhase = "ready" | "countdown" | "measuring" | "complete";
type SyncStatus = "idle" | "syncing" | "synced" | "offline";

type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const coachingText = [
  "Tracking sit-to-stand pattern...",
  "Estimating stability...",
  "Checking recovery changes...",
  "Building caregiver checklist...",
  "Preparing care-team summary...",
];

const modeIcons = {
  mock: Play,
  webcam: Camera,
  motion: Smartphone,
  esp32: Radio,
};

export function PoseCheckPanel({ scenario, symptoms, test, mode, onComplete }: PoseCheckPanelProps) {
  const stream = useMemo(() => getMockSensorStream(scenario, test), [scenario, test]);
  const [phase, setPhase] = useState<RunPhase>("ready");
  const [countdown, setCountdown] = useState(3);
  const [frameIndex, setFrameIndex] = useState(0);
  const [capturedFrames, setCapturedFrames] = useState<SensorFrame[]>([]);
  const [webcamStatus, setWebcamStatus] = useState("Camera optional");
  const [motionStatus, setMotionStatus] = useState("Waiting for device motion");
  const [liveMotion, setLiveMotion] = useState<{ x: number; y: number; z: number } | undefined>();
  const [wsUrl, setWsUrl] = useState("ws://192.168.4.1:81");
  const [socketStatus, setSocketStatus] = useState("Mock stream active");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ModeIcon = modeIcons[mode];
  const progress = stream.length > 0 ? Math.min(100, (frameIndex / stream.length) * 100) : 0;
  const coachingIndex = Math.min(coachingText.length - 1, Math.floor((progress / 100) * coachingText.length));
  const isRunning = phase === "countdown" || phase === "measuring";

  useEffect(() => {
    setPhase("ready");
    setCountdown(3);
    setFrameIndex(0);
    setCapturedFrames([]);
    setSyncStatus("idle");
  }, [scenario.id, test, mode]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("measuring");
      return;
    }

    const timeout = window.setTimeout(() => setCountdown((value) => value - 1), 760);
    return () => window.clearTimeout(timeout);
  }, [countdown, phase]);

  useEffect(() => {
    if (phase !== "measuring") return;

    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      const nextFrames = stream.slice(0, index);
      setCapturedFrames(nextFrames);
      setFrameIndex(index);

      if (index >= stream.length) {
        window.clearInterval(interval);
        setPhase("complete");
        const localResult = analyzeAssessment(scenario, symptoms, test, mode, stream);
        onComplete(localResult);
        setSyncStatus("syncing");

        void (async () => {
          try {
            const backendSummary = await runBackendAssessment({
              scenarioId: scenario.id,
              mode,
              test,
              symptoms,
              metrics: localResult.metrics.map((metric) => ({
                id: metric.id,
                value: metric.value,
                status: metric.status,
              })),
              framesAnalyzed: localResult.framesAnalyzed,
            });

            onComplete({ ...localResult, backendSummary });
            setSyncStatus("synced");
          } catch {
            setSyncStatus("offline");
          }
        })();
      }
    }, 58);

    return () => window.clearInterval(interval);
  }, [mode, onComplete, phase, scenario, stream, symptoms, test]);

  useEffect(() => {
    if (mode !== "webcam" || (phase !== "countdown" && phase !== "measuring")) return;

    let localStream: MediaStream | undefined;
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setWebcamStatus("Webcam not available in this browser");
          return;
        }

        localStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
          await videoRef.current.play();
        }
        setWebcamStatus("Live camera connected");
      } catch {
        setWebcamStatus("Camera permission not granted; using mock stream");
      }
    };

    void startCamera();

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [mode, phase]);

  useEffect(() => {
    if (mode !== "motion" || (phase !== "countdown" && phase !== "measuring")) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const source = event.accelerationIncludingGravity ?? event.acceleration;
      setLiveMotion({
        x: source?.x ?? 0,
        y: source?.y ?? 0,
        z: source?.z ?? 0,
      });
      setMotionStatus("Device motion signal received");
    };

    const startMotion = async () => {
      if (typeof DeviceMotionEvent === "undefined") {
        setMotionStatus("Device motion is not available in this browser; using mock stream");
        return;
      }
      const motionEvent = DeviceMotionEvent as DeviceMotionEventWithPermission;
      try {
        if (typeof motionEvent.requestPermission === "function") {
          const permission = await motionEvent.requestPermission();
          if (permission !== "granted") {
            setMotionStatus("Motion permission not granted; using mock stream");
            return;
          }
        }
        window.addEventListener("devicemotion", handleMotion);
        setMotionStatus("Listening for phone motion");
      } catch {
        setMotionStatus("Motion sensor unavailable; using mock stream");
      }
    };

    void startMotion();
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [mode, phase]);

  useEffect(() => {
    if (mode !== "esp32" || phase !== "measuring") return;
    if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
      setSocketStatus("Enter a ws:// or wss:// endpoint; mock stream is running");
      return;
    }

    let socket: WebSocket | undefined;
    try {
      socket = new WebSocket(wsUrl);
      setSocketStatus("Connecting to ESP32 stream...");
      socket.onopen = () => setSocketStatus("ESP32 connected; JSON packets accepted");
      socket.onmessage = () => setSocketStatus("Live packet received; mock result remains demo-safe");
      socket.onerror = () => setSocketStatus("ESP32 unavailable; mock stream continues");
      socket.onclose = () => setSocketStatus("ESP32 stream closed; mock stream continues");
    } catch {
      setSocketStatus("Could not open WebSocket; mock stream continues");
    }

    return () => socket?.close();
  }, [mode, phase, wsUrl]);

  const startCheck = () => {
    setCountdown(3);
    setFrameIndex(0);
    setCapturedFrames([]);
    setPhase("countdown");
  };

  const resetCheck = () => {
    setPhase("ready");
    setCountdown(3);
    setFrameIndex(0);
    setCapturedFrames([]);
  };

  return (
    <section className="assessment-stage">
      <div className="stage-header">
        <div>
          <p className="eyebrow">Step C</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Run the mobility check.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Mock mode always works. Webcam, phone motion, and ESP32 are optional signal inputs that keep the same
            demo-safe analysis path.
          </p>
        </div>
        <div className="status-chip chip-green">
          <ModeIcon className="h-4 w-4" aria-hidden="true" />
          {mode} mode
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="sensor-stage">
          <div className="sensor-video">
            {mode === "webcam" ? (
              <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover opacity-80" muted playsInline />
            ) : null}
            <div className="pose-grid" />
            <div className="person-silhouette">
              <span className="head" />
              <span className="torso" />
              <span className="arm arm-left" />
              <span className="arm arm-right" />
              <span className="leg leg-left" />
              <span className="leg leg-right" />
            </div>
            <div className="floor-target" />
            {phase === "countdown" ? <div className="countdown">{countdown}</div> : null}
            {phase === "measuring" ? <div className="scan-line" /> : null}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="rounded-lg bg-slate-950/78 p-3 text-white backdrop-blur">
                <p className="text-sm font-black">{phase === "complete" ? "Assessment summary ready" : coachingText[coachingIndex]}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="primary-button" onClick={startCheck} disabled={isRunning}>
              <Play className="h-5 w-5" aria-hidden="true" />
              Start Check
            </button>
            <button type="button" className="secondary-button" onClick={resetCheck} disabled={isRunning && phase !== "measuring"}>
              {isRunning ? <CircleStop className="h-5 w-5" aria-hidden="true" /> : <RotateCw className="h-5 w-5" aria-hidden="true" />}
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <MotionGauge frames={capturedFrames} progress={progress} mode={mode} liveMotion={liveMotion} />

          <div className="info-card">
            <h3 className="font-black text-slate-950">Optional signal status</h3>
            <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
              <p>
                <span className="font-black text-slate-800">Webcam:</span> {webcamStatus}
              </p>
              <p>
                <span className="font-black text-slate-800">Phone motion:</span> {motionStatus}
              </p>
              <p>
                <span className="font-black text-slate-800">ESP32:</span> {socketStatus}
              </p>
              <p>
                <span className="font-black text-slate-800">Backend sync:</span>{" "}
                {syncStatus === "synced"
                  ? "Assessment saved to API"
                  : syncStatus === "syncing"
                    ? "Saving latest run..."
                    : syncStatus === "offline"
                      ? "API unavailable (local analysis still active)"
                      : "Waiting for run completion"}
              </p>
            </div>
            {mode === "esp32" ? (
              <label className="mt-4 block text-sm font-bold text-slate-700">
                ESP32 WebSocket URL
                <input
                  value={wsUrl}
                  onChange={(event) => setWsUrl(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </label>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
