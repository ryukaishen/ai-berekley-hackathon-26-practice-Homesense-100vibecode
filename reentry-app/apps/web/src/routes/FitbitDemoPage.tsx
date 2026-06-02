import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  ClipboardCheck,
  HeartPulse,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import {
  analyzeRecoveryTrend,
  getFrictionDomain,
  recoveryFrictionDefinition,
  recoveryFrictionDomains,
  recoveryTracks,
  runRecoveryAgentWorkflow,
  trendAnalysisToWorkflowInput,
  type DailyRecoverySignal,
  type RecoveryTrackId
} from "@reentry/shared";
import { Button, PageHeader, SurfaceCard } from "@reentry/ui";

const metricConfig = [
  { key: "sleepHours", label: "Sleep", suffix: "h" },
  { key: "steps", label: "Steps", suffix: "" },
  { key: "activeMinutes", label: "Active min", suffix: "m" },
  { key: "restingHeartRate", label: "Resting HR", suffix: "bpm" }
] as const;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

type GoogleHealthStatus = {
  configured: boolean;
  redirectUri: string;
  scopes: string[];
  connectedUsers: string[];
  storage: string;
  message: string;
};

type GoogleHealthSummary = {
  source: "mock" | "google-health";
  configured: boolean;
  connected: boolean;
  trackId: RecoveryTrackId;
  days: DailyRecoverySignal[];
  message: string;
};

type WearableDataSource = "preview" | "fitbit-demo" | "google-health" | "mock-fallback";

export function FitbitDemoPage() {
  const [trackId, setTrackId] = useState<RecoveryTrackId>("new-diabetes-diagnosis");
  const [imported, setImported] = useState(false);
  const [status, setStatus] = useState("Connect Google Health or use the Fitbit demo to import 14 days of recovery signals.");
  const [googleStatus, setGoogleStatus] = useState<GoogleHealthStatus | null>(null);
  const [syncedDays, setSyncedDays] = useState<DailyRecoverySignal[] | null>(null);
  const [dataSource, setDataSource] = useState<WearableDataSource>("preview");
  const [isSyncing, setIsSyncing] = useState(false);

  const track = useMemo(
    () => recoveryTracks.find((item) => item.id === trackId) ?? recoveryTracks[0]!,
    [trackId]
  );
  const displayedDays = syncedDays ?? track.days;
  const analysis = useMemo(() => analyzeRecoveryTrend(displayedDays, track.id), [displayedDays, track.id]);
  const workflow = useMemo(
    () => runRecoveryAgentWorkflow(trendAnalysisToWorkflowInput(analysis)),
    [analysis]
  );
  const connectorState = googleStatus?.connectedUsers.length
    ? "connected"
    : googleStatus?.configured
      ? "configured"
      : "mock fallback";

  useEffect(() => {
    void refreshGoogleHealthStatus();
  }, []);

  const refreshGoogleHealthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/google-health/status`);
      if (!response.ok) throw new Error(`Status request failed: ${response.status}`);
      const nextStatus = (await response.json()) as GoogleHealthStatus;
      setGoogleStatus(nextStatus);
      setStatus(nextStatus.message);
    } catch (error) {
      setGoogleStatus(null);
      setStatus(
        `Could not reach the API at ${API_BASE_URL}. Keep npm.cmd run dev:api running before importing live wearable data.`
      );
    }
  };

  const connectDemo = () => {
    setImported(true);
    setSyncedDays(track.days);
    setDataSource("fitbit-demo");
    setStatus(`${track.title} Fitbit-style data imported. Baseline engine and agents are running.`);
  };

  const importGoogleHealth = async () => {
    setIsSyncing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/google-health/summary?trackId=${track.id}`);
      if (!response.ok) throw new Error(`Google Health summary failed: ${response.status}`);
      const summary = (await response.json()) as GoogleHealthSummary;

      setSyncedDays(summary.days);
      setImported(true);
      setDataSource(summary.source === "google-health" ? "google-health" : "mock-fallback");
      setStatus(summary.message);
      await refreshGoogleHealthStatus();
    } catch (error) {
      setStatus(
        `Google Health import could not complete. ${error instanceof Error ? error.message : "Unknown error"}.`
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const saveImport = () => {
    window.localStorage.setItem(
      "reentry-fitbit-demo",
      JSON.stringify({
        trackId,
        source: dataSource,
        days: displayedDays,
        analysis,
        workflow,
        savedAt: new Date().toISOString()
      })
    );
    setStatus("Fitbit demo import saved locally with baseline deltas, forecast, and agent outputs.");
  };

  const copyClinicianSummary = async () => {
    await navigator.clipboard.writeText(workflow.clinicianSummary.summary);
    setStatus("Clinician summary copied. It contains structured facts only, not diagnosis language.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Fitbit Demo"
        title="Turn Google Health and Fitbit drift into coordinated recovery action"
        subtitle="Live wearable access now goes through Google Health OAuth. The demo still imports Fitbit-style data, compares against personal baseline, forecasts recovery friction, routes safety, and produces support/handoff outputs."
        action={
          <div className="action-row">
            <Button onClick={connectDemo}>
              <Sparkles aria-hidden="true" size={16} />
              Connect Fitbit Demo
            </Button>
            <a className="focus-ring re-btn re-btn-ghost" href={`${API_BASE_URL}/google-health/login`}>
              <HeartPulse aria-hidden="true" size={16} />
              Connect Google Health
            </a>
            <Button variant="ghost" onClick={importGoogleHealth} disabled={isSyncing}>
              <LineChart aria-hidden="true" size={16} />
              {isSyncing ? "Importing..." : "Import Google Health"}
            </Button>
            <Button variant="ghost" onClick={saveImport}>
              <ClipboardCheck aria-hidden="true" size={16} />
              Save import
            </Button>
          </div>
        }
      />

      <section className="fitbit-track-grid">
        {recoveryTracks.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`fitbit-track-card focus-ring ${item.id === trackId ? "fitbit-track-card-active" : ""}`}
            aria-pressed={item.id === trackId}
            onClick={() => {
              setTrackId(item.id);
              setImported(false);
              setSyncedDays(null);
              setDataSource("preview");
              setStatus(`${item.title} loaded. Connect the demo to run the data loop.`);
            }}
          >
            <span>{item.audience}</span>
            <strong>{item.title}</strong>
            <small>{item.context}</small>
          </button>
        ))}
      </section>

      <section className="fitbit-overview">
        <SurfaceCard title="What friction means" subtitle="The score is not a diagnosis. It is drag on recovery.">
          <p className="fitbit-friction-definition">{recoveryFrictionDefinition}</p>
          <div className="fitbit-domain-grid">
            {recoveryFrictionDomains.slice(0, 4).map((domain) => (
              <div key={domain.id} className="fitbit-domain-card">
                <strong>{domain.title}</strong>
                <span>{domain.exampleSignals.slice(0, 2).join(" / ")}</span>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Live connector" subtitle="Fitbit registration has moved under Google Health.">
          <div className="fitbit-connector-grid">
            <ConnectorStat label="API" value={googleStatus ? "reachable" : "check needed"} />
            <ConnectorStat label="OAuth" value={connectorState} />
            <ConnectorStat label="Users" value={`${googleStatus?.connectedUsers.length ?? 0}`} />
          </div>
          <div className="fitbit-wedge">
            <p className="re-eyebrow">OAuth redirect</p>
            <h2>{googleStatus?.redirectUri ? new URL(googleStatus.redirectUri).pathname : "/google-health/callback"}</h2>
            <p>
              {googleStatus?.message ??
                "Use your Google Health API OAuth client with the ngrok HTTPS callback. If live OAuth is not configured, ReEntry falls back to demo data."}
            </p>
          </div>
          <div className="route-action-list mt-3">
            <button className="route-action focus-ring" type="button" onClick={refreshGoogleHealthStatus}>
              <ShieldCheck aria-hidden="true" size={18} />
              Refresh Google Health status
              <ArrowRight aria-hidden="true" size={17} />
            </button>
            <button className="route-action focus-ring" type="button" onClick={importGoogleHealth} disabled={isSyncing}>
              <HeartPulse aria-hidden="true" size={18} />
              Import connected wearable data
              <ArrowRight aria-hidden="true" size={17} />
            </button>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Specific wedge" subtitle="This is no longer generic wellness advice.">
          <div className="fitbit-wedge">
            <p className="re-eyebrow">Buyer</p>
            <h2>{track.buyer}</h2>
            <p>{track.whyItMatters}</p>
          </div>
          <p className="permission-notice mt-3" role="status">{status}</p>
        </SurfaceCard>

        <SurfaceCard title="Forecast" subtitle="Baseline deviation, not generic goals.">
          <div className={`fitbit-score-card fitbit-level-${analysis.level}`}>
            <div>
              <span>{analysis.recoveryFrictionScore}</span>
              <small>friction score</small>
            </div>
            <div>
              <p className="re-eyebrow">Tomorrow risk</p>
              <h2>{analysis.tomorrowHighFrictionRisk}%</h2>
              <p>{formatLabel(analysis.level)} - confidence {analysis.confidence}</p>
            </div>
          </div>
          <p className="permission-notice mt-3">{analysis.dataFreshness}</p>
        </SurfaceCard>
      </section>

      <section className="fitbit-dashboard">
        <SurfaceCard title="14-day wearable trend" subtitle={describeDataSource(dataSource, imported)}>
          <div className="fitbit-chart-grid">
            {metricConfig.map((metric) => (
              <TrendChart key={metric.key} days={displayedDays} metric={metric.key} label={metric.label} suffix={metric.suffix} />
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Signal Agent" subtitle="Top deviations from this user's own baseline.">
          <div className="fitbit-signal-stack">
            {analysis.topSignals.map((signal) => (
              <div key={signal.label} className={`fitbit-signal-card fitbit-signal-${signal.direction}`}>
                <strong>{signal.label}</strong>
                <em>{getFrictionDomain(signal.domain).title}</em>
                <span>{signal.value}</span>
                <small>{signal.explanation}</small>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>

      <section className="fitbit-agent-grid">
        <AgentOutput
          icon={<ShieldCheck size={20} />}
          title="Safety Agent"
          eyebrow={workflow.safety.status}
          body={workflow.safety.message}
        />
        <AgentOutput
          icon={<Brain size={20} />}
          title="Care Plan Agent"
          eyebrow={workflow.carePlan.mode}
          body={workflow.carePlan.smallestSafeAction}
        />
        <AgentOutput
          icon={<Users size={20} />}
          title="Caregiver Agent"
          eyebrow="permission-gated"
          body={workflow.caregiver.shortMessage}
        />
        <AgentOutput
          icon={<LineChart size={20} />}
          title="Clinician Summary Agent"
          eyebrow="facts only"
          body={workflow.clinicianSummary.summary}
        />
      </section>

      <section className="fitbit-actions">
        <SurfaceCard title="Demo close" subtitle="This is the exact loop judges understand.">
          <div className="route-action-list">
            <Link className="route-action" to="/agents">
              <BarChart3 aria-hidden="true" size={18} />
              Open full agent workflow
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="route-action" to="/support-circle">
              <Users aria-hidden="true" size={18} />
              Edit support permissions
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Handoff-ready output" subtitle="Claude can rewrite this later, but it cannot add facts.">
          <div className="fitbit-summary-box">
            <p>{workflow.clinicianSummary.summary}</p>
          </div>
          <Button variant="ghost" onClick={copyClinicianSummary}>
            <ClipboardCheck aria-hidden="true" size={16} />
            Copy summary
          </Button>
        </SurfaceCard>
      </section>
    </>
  );
}

function ConnectorStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="fitbit-connector-stat">
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}

function TrendChart({
  days,
  metric,
  label,
  suffix
}: {
  days: DailyRecoverySignal[];
  metric: "sleepHours" | "steps" | "activeMinutes" | "restingHeartRate";
  label: string;
  suffix: string;
}) {
  const values = days.map((day) => Number(day[metric] ?? 0));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const latest = values[values.length - 1] ?? 0;

  return (
    <div className="fitbit-chart-card">
      <div className="fitbit-chart-heading">
        <Activity aria-hidden="true" size={16} />
        <strong>{label}</strong>
        <span>{formatMetric(latest, suffix)}</span>
      </div>
      <div className="fitbit-bars" aria-label={`${label} trend`}>
        {values.map((value, index) => {
          const height = max === min ? 55 : 18 + ((value - min) / (max - min)) * 72;
          return (
            <span
              key={`${metric}-${index}`}
              style={{ height: `${height}%` }}
              title={`${label}: ${formatMetric(value, suffix)}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function AgentOutput({
  icon,
  title,
  eyebrow,
  body
}: {
  icon: ReactNode;
  title: string;
  eyebrow: string;
  body: string;
}) {
  return (
    <article className="fitbit-agent-card">
      <div className="fitbit-agent-icon">{icon}</div>
      <p className="re-eyebrow">{formatLabel(eyebrow)}</p>
      <h2>{title}</h2>
      <p>{body}</p>
    </article>
  );
}

function formatMetric(value: number, suffix: string) {
  if (suffix === "") return Math.round(value).toLocaleString();
  return `${Math.round(value * 10) / 10}${suffix}`;
}

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}

function describeDataSource(source: WearableDataSource, imported: boolean) {
  if (source === "google-health") return "Imported from connected Google Health API.";
  if (source === "mock-fallback") return "Google Health connected, but API returned demo fallback data.";
  if (source === "fitbit-demo") return "Imported from Fitbit-style demo data.";
  return imported ? "Imported wearable data." : "Preview data waiting for a connector.";
}
