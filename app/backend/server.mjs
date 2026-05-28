import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import { scenarioById, scenarioCatalog } from "./data/scenarioCatalog.mjs";
import { createAssessmentRun, parseAssessmentRequest, ValidationError } from "./services/assessmentService.mjs";
import { buildDashboardRows } from "./services/dashboardService.mjs";
import { addAssessmentRun, getAssessmentRunById, getRecentAssessmentRuns } from "./store/assessmentStore.mjs";

const PORT = Number(process.env.PORT ?? 8787);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

const allowCors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

const sendJson = (res, requestId, statusCode, payload) => {
  allowCors(res);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(
    JSON.stringify({
      requestId,
      ...payload,
    }),
  );
};

const readJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    throw new ValidationError("Request body must be valid JSON.");
  }
};

const listScenarioSummaries = () =>
  scenarioCatalog.map((scenario) => ({
    id: scenario.id,
    shortTitle: scenario.shortTitle,
    patientName: scenario.patientName,
    age: scenario.age,
    concernLevel: scenario.concernLevel,
    recommendedTest: scenario.recommendedTest,
    dashboardAction: scenario.dashboardAction,
  }));

const handleGetScenarioById = (scenarioId) => {
  const scenario = scenarioById.get(scenarioId);
  if (!scenario) return null;
  return scenario;
};

const parseLimit = (value, fallback = 20) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(Math.round(parsed), 100));
};

const server = createServer(async (req, res) => {
  const requestId = `req-${randomUUID()}`;
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const path = url.pathname;

  if (method === "OPTIONS") {
    allowCors(res);
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (method === "GET" && path === "/api/health") {
      sendJson(res, requestId, 200, {
        data: {
          status: "ok",
          service: "standwise-api",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    if (method === "GET" && path === "/api/scenarios") {
      sendJson(res, requestId, 200, {
        data: listScenarioSummaries(),
      });
      return;
    }

    if (method === "GET" && path.startsWith("/api/scenarios/")) {
      const scenarioId = path.replace("/api/scenarios/", "");
      const scenario = handleGetScenarioById(scenarioId);
      if (!scenario) {
        sendJson(res, requestId, 404, {
          error: {
            code: "SCENARIO_NOT_FOUND",
            message: `No scenario exists for id '${scenarioId}'.`,
          },
        });
        return;
      }
      sendJson(res, requestId, 200, {
        data: scenario,
      });
      return;
    }

    if (method === "POST" && path === "/api/assessments/run") {
      const body = await readJsonBody(req);
      const input = parseAssessmentRequest(body, scenarioById);
      const run = createAssessmentRun(input);
      addAssessmentRun(run);
      sendJson(res, requestId, 201, {
        data: run,
      });
      return;
    }

    if (method === "GET" && path === "/api/assessments") {
      const limit = parseLimit(url.searchParams.get("limit"), 20);
      sendJson(res, requestId, 200, {
        data: getRecentAssessmentRuns(limit),
      });
      return;
    }

    if (method === "GET" && path.startsWith("/api/assessments/")) {
      const runId = path.replace("/api/assessments/", "");
      const run = getAssessmentRunById(runId);
      if (!run) {
        sendJson(res, requestId, 404, {
          error: {
            code: "RUN_NOT_FOUND",
            message: `No assessment run exists for id '${runId}'.`,
          },
        });
        return;
      }
      sendJson(res, requestId, 200, {
        data: run,
      });
      return;
    }

    if (method === "GET" && path === "/api/dashboard") {
      const limit = parseLimit(url.searchParams.get("limit"), 60);
      const recentRuns = getRecentAssessmentRuns(limit);
      const rows = buildDashboardRows({ scenarios: scenarioCatalog, recentRuns });
      sendJson(res, requestId, 200, {
        data: rows,
      });
      return;
    }

    sendJson(res, requestId, 404, {
      error: {
        code: "NOT_FOUND",
        message: `Route '${method} ${path}' was not found.`,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      sendJson(res, requestId, error.statusCode, {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      });
      return;
    }

    sendJson(res, requestId, 500, {
      error: {
        code: "INTERNAL_ERROR",
        message: "Unexpected API error.",
      },
    });
  }
});

server.listen(PORT, () => {
  console.log(`StandWise API running on http://127.0.0.1:${PORT}`);
});
