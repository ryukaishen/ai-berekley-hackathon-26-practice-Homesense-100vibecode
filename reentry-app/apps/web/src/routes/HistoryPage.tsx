import { Activity, CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { PageHeader, SurfaceCard } from "@reentry/ui";

type CompletedAction = {
  id: string;
  title: string;
  kind: "stabilizing" | "practical" | "support";
  completedAt: string;
};

type HistoryEpisode = {
  id: string;
  title: string;
  scenario: string;
  date: string;
  status: "active" | "completed";
  recoveryFrictionScore: number;
  note: string;
  completedActions: CompletedAction[];
};

const historyEpisodes: HistoryEpisode[] = [
  {
    id: "history-finals",
    title: "Finals Burnout",
    scenario: "Finals Burnout",
    date: "2026-05-26",
    status: "active",
    recoveryFrictionScore: 43,
    note: "Two-hour sprint helped turn the biggest task into a first slice.",
    completedActions: [
      {
        id: "history-finals-action-1",
        title: "Opened the assignment and wrote the first three bullets",
        kind: "practical",
        completedAt: "7:40 PM"
      }
    ]
  },
  {
    id: "history-city",
    title: "New City Loneliness",
    scenario: "New City Loneliness",
    date: "2026-05-25",
    status: "completed",
    recoveryFrictionScore: 31,
    note: "Tiny outing lowered the weekend isolation spiral.",
    completedActions: [
      {
        id: "history-city-action-1",
        title: "Walked to the same coffee shop twice",
        kind: "stabilizing",
        completedAt: "11:15 AM"
      },
      {
        id: "history-city-action-2",
        title: "Texted one local acquaintance a low-pressure invite",
        kind: "support",
        completedAt: "4:25 PM"
      }
    ]
  },
  {
    id: "history-flare",
    title: "Bad Health Week",
    scenario: "Chronic flare / bad health week",
    date: "2026-05-24",
    status: "active",
    recoveryFrictionScore: 58,
    note: "Minimum viable day kept chores from becoming a shame spiral.",
    completedActions: [
      {
        id: "history-flare-action-1",
        title: "Sent a copy-only help request for grocery backup",
        kind: "support",
        completedAt: "5:50 PM"
      }
    ]
  },
  {
    id: "history-surgery",
    title: "Returning After Surgery",
    scenario: "Post-surgery return",
    date: "2026-05-23",
    status: "completed",
    recoveryFrictionScore: 37,
    note: "Recovery buffer made class/work expectations easier to explain.",
    completedActions: [
      {
        id: "history-surgery-action-1",
        title: "Drafted a short accommodations ask",
        kind: "practical",
        completedAt: "2:05 PM"
      }
    ]
  },
  {
    id: "history-breakup",
    title: "Breakup Stabilizer",
    scenario: "Breakup",
    date: "2026-05-22",
    status: "completed",
    recoveryFrictionScore: 49,
    note: "Evening anchor reduced the late-night rumination window.",
    completedActions: [
      {
        id: "history-breakup-action-1",
        title: "Muted social feeds and set a 10 PM replacement routine",
        kind: "stabilizing",
        completedAt: "9:55 PM"
      }
    ]
  },
  {
    id: "history-discharge",
    title: "First Week After Discharge",
    scenario: "Post-discharge",
    date: "2026-05-21",
    status: "completed",
    recoveryFrictionScore: 64,
    note: "Appointment prep and ride confirmation lowered the next-day scramble.",
    completedActions: [
      {
        id: "history-discharge-action-1",
        title: "Confirmed Friday ride and wrote down appointment questions",
        kind: "practical",
        completedAt: "6:10 PM"
      }
    ]
  }
];

const trendPoints = [...historyEpisodes]
  .reverse()
  .map((episode) => ({
    id: episode.id,
    label: formatShortDate(episode.date),
    score: episode.recoveryFrictionScore,
    title: episode.title
  }));

export function HistoryPage() {
  const firstPoint = trendPoints[0];
  const latestPoint = trendPoints[trendPoints.length - 1];
  const scoreDelta =
    firstPoint && latestPoint ? latestPoint.score - firstPoint.score : 0;
  const completedActionCount = historyEpisodes.reduce(
    (total, episode) => total + episode.completedActions.length,
    0
  );

  return (
    <>
      <PageHeader
        eyebrow="History"
        title="See what has already helped"
        subtitle="A timeline of episodes, completed actions, and recovery friction trends. The emphasis is progress, not perfection."
      />

      <section className="history-overview" aria-label="History overview">
        <SurfaceCard title="Recovery friction trend" subtitle="Lower scores mean the day is carrying less friction.">
          <div className="history-trend-summary">
            <div>
              <span className="history-score">{latestPoint?.score ?? 0}</span>
              <span className="re-meta"> latest score</span>
            </div>
            <p className="m-0">
              {scoreDelta < 0
                ? `Down ${Math.abs(scoreDelta)} points from the first logged episode.`
                : scoreDelta > 0
                  ? `Up ${scoreDelta} points from the first logged episode.`
                  : "Steady compared with the first logged episode."}
            </p>
          </div>
          <div className="history-trend-bars" role="list" aria-label="Recovery friction by episode">
            {trendPoints.map((point) => (
              <div key={point.id} className="history-trend-point" role="listitem">
                <div className="history-trend-track" aria-hidden="true">
                  <span
                    className="history-trend-fill"
                    style={{ height: `${Math.max(10, point.score)}%` }}
                  />
                </div>
                <span className="history-trend-label">{point.label}</span>
                <span className="sr-only">
                  {point.title}: recovery friction score {point.score} out of 100.
                </span>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard title="Completed actions" subtitle="Small things count when they reduce tomorrow's load.">
          <div className="history-metric-row">
            <CheckCircle2 aria-hidden="true" size={28} />
            <span className="history-score">{completedActionCount}</span>
          </div>
          <p className="m-0 re-meta">
            Actions finished across {historyEpisodes.length} episodes, including support asks,
            practical resets, and stabilizing routines.
          </p>
        </SurfaceCard>
      </section>

      <section className="history-timeline" aria-label="Episode timeline">
        {historyEpisodes.map((episode) => (
          <article key={episode.id} className="history-timeline-item">
            <div className="history-rail" aria-hidden="true">
              <span />
            </div>
            <div className="history-card">
              <div className="history-card-topline">
                <span className="history-date">
                  <CalendarDays aria-hidden="true" size={16} />
                  {formatLongDate(episode.date)}
                </span>
                <span className={`history-status history-status-${episode.status}`}>
                  {episode.status}
                </span>
              </div>
              <div className="history-card-heading">
                <div>
                  <p className="re-eyebrow">{episode.scenario}</p>
                  <h2>{episode.title}</h2>
                </div>
                <div className="history-friction-pill" aria-label={`Recovery friction score ${episode.recoveryFrictionScore}`}>
                  <Activity aria-hidden="true" size={17} />
                  {episode.recoveryFrictionScore}
                </div>
              </div>
              <p className="history-note">{episode.note}</p>
              <div className="history-action-list">
                <h3>
                  <Clock3 aria-hidden="true" size={16} />
                  Completed actions
                </h3>
                <ul>
                  {episode.completedActions.map((action) => (
                    <li key={action.id}>
                      <CheckCircle2 aria-hidden="true" size={16} />
                      <span>
                        <strong>{action.title}</strong>
                        <small>{formatActionKind(action.kind)} at {action.completedAt}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(toLocalNoon(value));
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(toLocalNoon(value));
}

function formatActionKind(value: CompletedAction["kind"]) {
  return `${value[0]?.toUpperCase() ?? ""}${value.slice(1)} action`;
}

function toLocalNoon(value: string) {
  return new Date(`${value}T12:00:00`);
}
