const scoreByConcern = {
  Low: 28,
  Moderate: 44,
  Elevated: 63,
  High: 82,
};

const priorityFromScore = (score) => {
  if (score >= 68) return "Urgent";
  if (score >= 48) return "Elevated";
  return "Routine";
};

const formatRelativeTime = (isoString) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const minutesAgo = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutesAgo < 1) return "Just now";
  if (minutesAgo < 60) return `${minutesAgo} min ago`;
  if (minutesAgo < 24 * 60) return `${Math.floor(minutesAgo / 60)} hr ago`;
  return `${Math.floor(minutesAgo / (24 * 60))} day ago`;
};

const trendFromRuns = (latest, previous) => {
  if (!latest) return "Stable";
  if (!previous) return latest.symptomTrend ?? "Stable";
  if (latest.concernScore > previous.concernScore + 4) return "Worsening";
  if (latest.concernScore < previous.concernScore - 4) return "Improving";
  return "Stable";
};

export const buildDashboardRows = ({ scenarios, recentRuns }) =>
  scenarios.map((scenario) => {
    const scenarioRuns = recentRuns.filter((run) => run.scenarioId === scenario.id).slice(0, 2);
    const latestRun = scenarioRuns[0];
    const previousRun = scenarioRuns[1];

    const fallbackScore = scoreByConcern[scenario.concernLevel] ?? 44;
    const score = latestRun ? latestRun.concernScore : fallbackScore;
    const concernLevel = latestRun ? latestRun.concernLevel : scenario.concernLevel;
    const priority = latestRun ? latestRun.outreachPriority : priorityFromScore(score);
    const suggestedAction = latestRun?.recommendedActions?.[0] ?? scenario.dashboardAction;

    return {
      id: `dash-${scenario.id}`,
      name: `${scenario.patientName}, ${scenario.age}`,
      scenarioId: scenario.id,
      lastCheckDate: latestRun ? formatRelativeTime(latestRun.createdAt) : "No checks yet",
      recoveryFrictionScore: score,
      fallConcernLevel: concernLevel,
      symptomTrend: trendFromRuns(latestRun, previousRun),
      outreachPriority: priority,
      suggestedNextAction: suggestedAction,
    };
  });
