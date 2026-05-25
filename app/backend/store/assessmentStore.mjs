const MAX_STORED_RUNS = 240;
const runs = [];

export const addAssessmentRun = (run) => {
  runs.unshift(run);
  if (runs.length > MAX_STORED_RUNS) {
    runs.length = MAX_STORED_RUNS;
  }
};

export const getAssessmentRunById = (runId) => runs.find((run) => run.id === runId) ?? null;

export const getRecentAssessmentRuns = (limit = 20) => runs.slice(0, Math.max(1, Math.min(limit, 100)));
