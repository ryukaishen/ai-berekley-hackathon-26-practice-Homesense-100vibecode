import cors from "@fastify/cors";
import Fastify, { type FastifyReply } from "fastify";
import { z } from "zod";
import {
  buildClinicDashboard,
  buildOnboardingRecommendation,
  composeHelpRequest,
  generatePlanCards,
  predictRecoveryRisk,
  runRecoveryAgentWorkflow,
  trainRecoveryRiskModel
} from "@reentry/shared";
import { createAiAdapter } from "./ai/adapter.js";
import {
  explainPlanWithAi,
  rewriteSupportRequestWithAi,
  summarizeCareHandoffWithAi
} from "./ai/tasks.js";
import { getApiDocsHtml, getApiDocsJson } from "./docs.js";
import {
  createFitbitAuthorizationUrl,
  exchangeFitbitCode,
  getFitbitDailySummary,
  getFitbitStatus
} from "./fitbit.js";
import {
  createGoogleHealthAuthorizationUrl,
  exchangeGoogleHealthCode,
  getGoogleHealthDailySummary,
  getGoogleHealthStatus
} from "./googleHealth.js";
import { closeDatabase, getDatabase, getDatabasePath } from "./db/client.js";
import { getMigrationStatus, runMigrations } from "./db/migrate.js";
import {
  createCheckIn,
  createEpisode,
  createHandoffNote,
  createHelpRequestDraft,
  createSupportCircleMember,
  deleteSupportCircleMember,
  getDatabaseCounts,
  getSupportCircleMember,
  getUser,
  getUserHistory,
  listCheckIns,
  listEpisodes,
  listEventLogs,
  listSupportCircleMembers,
  updateSupportCircleMember
} from "./db/repository.js";
import { seedDemoData } from "./db/seed.js";
import {
  createCheckInSchema,
  createEpisodeSchema,
  createHandoffNoteSchema,
  createHelpRequestDraftSchema,
  composeHelpRequestSchema,
  createSupportCircleMemberSchema,
  aiCareHandoffSummaryInputSchema,
  aiPlanExplanationInputSchema,
  aiSupportRequestRewriteInputSchema,
  fitbitCallbackQuerySchema,
  fitbitLoginQuerySchema,
  fitbitSummaryQuerySchema,
  googleHealthCallbackQuerySchema,
  googleHealthLoginQuerySchema,
  googleHealthSummaryQuerySchema,
  onboardingProfileSchema,
  paramsWithEpisodeIdSchema,
  paramsWithMemberIdSchema,
  paramsWithUserIdSchema,
  recoveryAgentWorkflowInputSchema,
  riskModelPredictionInputSchema,
  riskModelTrainingInputSchema,
  scoredCheckInSchema,
  updateSupportCircleMemberSchema
} from "./schemas.js";

const app = Fastify({ logger: true });
const db = getDatabase();
const aiAdapter = createAiAdapter();
let demoRiskModel = trainRecoveryRiskModel();

runMigrations(db);
if (process.env.REENTRY_SEED_DEMO !== "false") {
  seedDemoData(db);
}

app.register(cors, { origin: true });

app.setErrorHandler((error, _request, reply) => {
  const message = error instanceof Error ? error.message : "Unexpected API error.";
  const isConstraintError = message.toLowerCase().includes("constraint");

  reply.status(isConstraintError ? 409 : 500).send({
    ok: false,
    message: isConstraintError ? "Database constraint failed." : "Unexpected API error.",
    detail: message
  });
});

app.get("/health", async () => {
  return {
    ok: true,
    service: "reentry-api",
    timestamp: new Date().toISOString(),
    database: {
      ok: true,
      path: getDatabasePath(),
      migrations: getMigrationStatus(db),
      counts: getDatabaseCounts(db)
    },
    ai: {
      provider: aiAdapter.name,
      configured: aiAdapter.isConfigured()
    }
  };
});

app.get("/docs", async (_request, reply) => {
  reply.type("text/html; charset=utf-8");
  return getApiDocsHtml();
});

app.get("/docs.json", async () => getApiDocsJson());

app.get("/users/:userId", async (request, reply) => {
  const params = parseRequest(paramsWithUserIdSchema, request.params, reply);
  if (!params) return;

  const user = getUser(db, params.userId);
  if (!user) {
    reply.status(404);
    return { ok: false, message: "User not found." };
  }

  return user;
});

app.get("/users/:userId/episodes", async (request, reply) => {
  const params = parseRequest(paramsWithUserIdSchema, request.params, reply);
  if (!params) return;

  return listEpisodes(db, params.userId);
});

app.post("/episodes", async (request, reply) => {
  const body = parseRequest(createEpisodeSchema, request.body, reply);
  if (!body) return;

  reply.status(201);
  return createEpisode(db, body);
});

app.get("/episodes/:episodeId/check-ins", async (request, reply) => {
  const params = parseRequest(paramsWithEpisodeIdSchema, request.params, reply);
  if (!params) return;

  return listCheckIns(db, params.episodeId);
});

app.post("/check-ins", async (request, reply) => {
  const body = parseRequest(createCheckInSchema, request.body, reply);
  if (!body) return;

  reply.status(201);
  return createCheckIn(db, body);
});

app.post("/plan-cards/generate", async (request, reply) => {
  const body = parseRequest(scoredCheckInSchema, request.body, reply);
  if (!body) return;

  return generatePlanCards(body);
});

app.post("/agents/recovery-workflow", async (request, reply) => {
  const body = parseRequest(recoveryAgentWorkflowInputSchema, request.body, reply);
  if (!body) return;

  return runRecoveryAgentWorkflow(body);
});

app.get("/fitbit/status", async () => getFitbitStatus());

app.get("/fitbit/login", async (request, reply) => {
  const query = parseRequest(fitbitLoginQuerySchema, request.query, reply);
  if (!query) return;

  const login = createFitbitAuthorizationUrl(query.userId);
  if (!login.configured || !login.url) {
    return login;
  }

  return reply.redirect(login.url);
});

app.get("/fitbit/callback", async (request, reply) => {
  const query = parseRequest(fitbitCallbackQuerySchema, request.query, reply);
  if (!query) return;

  const result = await exchangeFitbitCode(query.code, query.state);
  if (!result.ok) {
    reply.status(400);
    return result;
  }

  reply.type("text/html; charset=utf-8");
  return `<!doctype html>
    <html lang="en">
      <head><meta charset="utf-8" /><title>Fitbit Connected</title></head>
      <body style="font-family: system-ui, sans-serif; padding: 2rem;">
        <h1>Fitbit connected</h1>
        <p>ReEntry stored this prototype token in memory. You can close this tab and return to the app.</p>
        <p><a href="http://localhost:5173/fitbit">Open the Fitbit demo</a></p>
      </body>
    </html>`;
});

app.get("/fitbit/summary", async (request, reply) => {
  const query = parseRequest(fitbitSummaryQuerySchema, request.query, reply);
  if (!query) return;

  return getFitbitDailySummary(query);
});

app.get("/google-health/status", async () => getGoogleHealthStatus());

app.get("/google-health/login", async (request, reply) => {
  const query = parseRequest(googleHealthLoginQuerySchema, request.query, reply);
  if (!query) return;

  const login = createGoogleHealthAuthorizationUrl(query.userId);
  if (!login.configured || !login.url) {
    return login;
  }

  return reply.redirect(login.url);
});

app.get("/google-health/callback", async (request, reply) => {
  const query = parseRequest(googleHealthCallbackQuerySchema, request.query, reply);
  if (!query) return;

  const result = await exchangeGoogleHealthCode(query.code, query.state);
  if (!result.ok) {
    reply.status(400);
    return result;
  }

  reply.type("text/html; charset=utf-8");
  return `<!doctype html>
    <html lang="en">
      <head><meta charset="utf-8" /><title>Google Health Connected</title></head>
      <body style="font-family: system-ui, sans-serif; padding: 2rem;">
        <h1>Google Health connected</h1>
        <p>ReEntry stored this prototype token in memory. You can close this tab and return to the app.</p>
        <p><a href="http://localhost:5173/fitbit">Open the wearable recovery demo</a></p>
      </body>
    </html>`;
});

app.get("/google-health/summary", async (request, reply) => {
  const query = parseRequest(googleHealthSummaryQuerySchema, request.query, reply);
  if (!query) return;

  return getGoogleHealthDailySummary(query);
});

app.post("/onboarding/recommend", async (request, reply) => {
  const body = parseRequest(onboardingProfileSchema, request.body, reply);
  if (!body) return;

  return buildOnboardingRecommendation(body);
});

app.post("/model/train", async (request, reply) => {
  const body = parseRequest(riskModelTrainingInputSchema, request.body ?? {}, reply);
  if (!body) return;

  demoRiskModel = trainRecoveryRiskModel(body.examples);
  return demoRiskModel;
});

app.post("/model/predict", async (request, reply) => {
  const body = parseRequest(riskModelPredictionInputSchema, request.body, reply);
  if (!body) return;

  return predictRecoveryRisk(body.model ?? demoRiskModel, body.features);
});

app.get("/clinic/dashboard", async () => buildClinicDashboard(demoRiskModel));

app.get("/users/:userId/support-circle", async (request, reply) => {
  const params = parseRequest(paramsWithUserIdSchema, request.params, reply);
  if (!params) return;

  return listSupportCircleMembers(db, params.userId);
});

app.get("/support-circle-members/:memberId", async (request, reply) => {
  const params = parseRequest(paramsWithMemberIdSchema, request.params, reply);
  if (!params) return;

  const member = getSupportCircleMember(db, params.memberId);
  if (!member) {
    reply.status(404);
    return { ok: false, message: "Support-circle member not found." };
  }

  return member;
});

app.post("/support-circle-members", async (request, reply) => {
  const body = parseRequest(createSupportCircleMemberSchema, request.body, reply);
  if (!body) return;

  reply.status(201);
  return createSupportCircleMember(db, body);
});

app.patch("/support-circle-members/:memberId", async (request, reply) => {
  const params = parseRequest(paramsWithMemberIdSchema, request.params, reply);
  const body = parseRequest(updateSupportCircleMemberSchema, request.body, reply);
  if (!params || !body) return;

  const member = updateSupportCircleMember(db, params.memberId, body);
  if (!member) {
    reply.status(404);
    return { ok: false, message: "Support-circle member not found." };
  }

  return member;
});

app.delete("/support-circle-members/:memberId", async (request, reply) => {
  const params = parseRequest(paramsWithMemberIdSchema, request.params, reply);
  if (!params) return;

  const deleted = deleteSupportCircleMember(db, params.memberId);
  if (!deleted) {
    reply.status(404);
    return { ok: false, message: "Support-circle member not found." };
  }

  return { ok: true, deletedId: params.memberId };
});

app.post("/help-request-drafts/compose", async (request, reply) => {
  const body = parseRequest(composeHelpRequestSchema, request.body, reply);
  if (!body) return;

  const member = getSupportCircleMember(db, body.memberId);
  if (!member || member.userId !== body.userId) {
    reply.status(404);
    return { ok: false, message: "Support-circle member not found." };
  }

  return composeHelpRequest({
    member,
    need: body.need,
    requestedHelp: body.requestedHelp,
    urgency: body.urgency,
    shareTopics: body.shareTopics,
    privateContext: body.privateContext,
    noSendJustCopy: body.noSendJustCopy
  });
});

app.post("/ai/plan-explanation", async (request, reply) => {
  const body = parseRequest(aiPlanExplanationInputSchema, request.body, reply);
  if (!body) return;

  return explainPlanWithAi(aiAdapter, body);
});

app.post("/ai/support-request-rewrite", async (request, reply) => {
  const body = parseRequest(aiSupportRequestRewriteInputSchema, request.body, reply);
  if (!body) return;

  return rewriteSupportRequestWithAi(aiAdapter, body);
});

app.post("/ai/care-handoff-summary", async (request, reply) => {
  const body = parseRequest(aiCareHandoffSummaryInputSchema, request.body, reply);
  if (!body) return;

  return summarizeCareHandoffWithAi(aiAdapter, body);
});

app.post("/help-request-drafts", async (request, reply) => {
  const body = parseRequest(createHelpRequestDraftSchema, request.body, reply);
  if (!body) return;

  reply.status(201);
  return createHelpRequestDraft(db, body);
});

app.post("/handoff-notes", async (request, reply) => {
  const body = parseRequest(createHandoffNoteSchema, request.body, reply);
  if (!body) return;

  reply.status(201);
  return createHandoffNote(db, body);
});

app.get("/users/:userId/event-logs", async (request, reply) => {
  const params = parseRequest(paramsWithUserIdSchema, request.params, reply);
  if (!params) return;

  return listEventLogs(db, params.userId);
});

app.get("/users/:userId/history", async (request, reply) => {
  const params = parseRequest(paramsWithUserIdSchema, request.params, reply);
  if (!params) return;

  return getUserHistory(db, params.userId);
});

app.get("/routes", async () => {
  return {
    webRoutes: [
      "/",
      "/demo",
      "/scenarios",
      "/onboarding",
      "/episode/new",
      "/check-in",
      "/plan",
      "/agents",
      "/fitbit",
      "/google-health",
      "/clinic",
      "/support-circle",
      "/handoff",
      "/history"
    ]
  };
});

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? "0.0.0.0";

const start = async () => {
  try {
    const address = await app.listen({ port, host });
    app.log.info(`API listening at ${address}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

function parseRequest<T>(schema: z.ZodType<T>, value: unknown, reply: FastifyReply): T | undefined {
  const parsed = schema.safeParse(value);
  if (parsed.success) return parsed.data;

  reply.status(400);
  reply.send({
    ok: false,
    message: "Invalid request payload.",
    issues: parsed.error.issues
  });

  return undefined;
}

process.on("SIGINT", () => {
  closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", () => {
  closeDatabase();
  process.exit(0);
});

start();
