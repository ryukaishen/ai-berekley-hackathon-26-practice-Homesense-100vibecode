import { z } from "zod";

const idSchema = z.string().min(3).max(120);
const isoDateTimeSchema = z.string().datetime();
const scenarioPackIdSchema = z.enum([
  "post-discharge",
  "post-surgery-return",
  "breakup",
  "finals-burnout",
  "new-city-loneliness",
  "chronic-flare"
]);
const recoveryTrackIdSchema = z.enum([
  "new-diabetes-diagnosis",
  "burnout-spiral",
  "post-surgery-fatigue",
  "stable-recovery"
]);
const recoveryFrictionDomainIdSchema = z.enum([
  "body-capacity",
  "routine-stability",
  "cognitive-load",
  "social-load",
  "practical-blockers",
  "wearable-drift",
  "data-confidence",
  "safety-flags"
]);
const ageRangeSchema = z.enum(["13-17", "18-24", "25-30", "31-44", "45-64", "65-plus"]);
const schoolWorkStatusSchema = z.enum([
  "high-school",
  "college",
  "early-career",
  "caregiver",
  "not-currently-working",
  "other"
]);
const livingSituationSchema = z.enum(["alone", "roommates", "family", "campus-housing", "partner", "temporary"]);
const supportAvailabilitySchema = z.enum(["strong", "some", "limited", "none-yet"]);
const bodyStateTagSchema = z.enum([
  "fatigue",
  "pain",
  "nausea",
  "brain-fog",
  "dizziness",
  "tension",
  "low-appetite",
  "sensory-overload"
]);
const practicalBlockerTagSchema = z.enum([
  "meals",
  "meds",
  "transportation",
  "money",
  "housing",
  "appointments",
  "deadlines",
  "chores"
]);
const standWiseFlagSchema = z.enum([
  "missed-medication",
  "missed-appointment",
  "no-meals-today",
  "limited-mobility",
  "urgent-message",
  "needs-human-follow-up"
]);
const wearableSignalInputSchema = z.object({
  sleepHours: z.number().min(0).max(24).optional(),
  sleepDeltaHours: z.number().min(-24).max(24).optional(),
  steps: z.number().int().min(0).optional(),
  baselineSteps: z.number().int().min(0).optional(),
  stepDeltaPercent: z.number().min(-100).max(500).optional(),
  restingHeartRate: z.number().int().min(20).max(220).optional(),
  baselineRestingHeartRate: z.number().int().min(20).max(220).optional(),
  restingHeartRateDelta: z.number().min(-120).max(120).optional(),
  missedRoutineCount: z.number().int().min(0).max(30).optional(),
  daysObserved: z.number().int().min(1).max(30).optional()
});
const recoveryModeSchema = z.enum(["stabilize", "ask-help", "routine-restart", "escalate-human"]);
const supportChannelSchema = z.enum(["sms", "email", "call", "in-person"]);
const tonePreferenceSchema = z.enum(["warm", "brief", "direct", "gentle"]);
const sharingTopicSchema = z.enum([
  "health",
  "meds",
  "appointments",
  "school-work",
  "emotions",
  "money",
  "location",
  "family"
]);

export const paramsWithUserIdSchema = z.object({
  userId: idSchema
});

export const paramsWithEpisodeIdSchema = z.object({
  episodeId: idSchema
});

export const paramsWithMemberIdSchema = z.object({
  memberId: idSchema
});

export const healthResponseSchema = z.object({
  ok: z.literal(true),
  service: z.literal("reentry-api"),
  timestamp: isoDateTimeSchema,
  database: z.object({
    ok: z.boolean(),
    path: z.string(),
    migrations: z.object({
      expected: z.array(z.string()),
      applied: z.array(z.unknown())
    }),
    counts: z.record(z.string(), z.number())
  }),
  ai: z.object({
    provider: z.string(),
    configured: z.boolean()
  })
});

export const userSchema = z.object({
  id: idSchema,
  email: z.string().email(),
  displayName: z.string(),
  pronouns: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const transitionEpisodeSchema = z.object({
  id: idSchema,
  userId: idSchema,
  scenarioPackId: scenarioPackIdSchema,
  title: z.string(),
  context: z.string(),
  status: z.enum(["active", "completed", "archived"]),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const createEpisodeSchema = z.object({
  userId: idSchema,
  scenarioPackId: scenarioPackIdSchema,
  title: z.string().min(3).max(120),
  context: z.string().min(3).max(400),
  status: z.enum(["active", "completed", "archived"]).optional(),
  startedAt: isoDateTimeSchema.optional()
});

export const checkInSchema = z.object({
  id: idSchema,
  userId: idSchema,
  episodeId: idSchema.nullable(),
  energy: z.number().int().min(1).max(5),
  sleepQuality: z.number().int().min(1).max(5),
  cognitiveLoad: z.number().int().min(1).max(5),
  socialLoad: z.number().int().min(1).max(5),
  bodyStateTags: z.array(bodyStateTagSchema),
  practicalBlockerTags: z.array(practicalBlockerTagSchema),
  standWiseFlags: z.array(standWiseFlagSchema),
  note: z.string().nullable(),
  recoveryFrictionScore: z.number().int().min(0).max(100),
  mode: recoveryModeSchema,
  topBlockers: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
  checkedInAt: z.string(),
  createdAt: z.string()
});

export const checkInPayloadSchema = z.object({
  energy: z.number().int().min(1).max(5),
  sleepQuality: z.number().int().min(1).max(5),
  cognitiveLoad: z.number().int().min(1).max(5),
  socialLoad: z.number().int().min(1).max(5),
  bodyStateTags: z.array(bodyStateTagSchema),
  practicalBlockerTags: z.array(practicalBlockerTagSchema),
  standWiseFlags: z.array(standWiseFlagSchema).default([]),
  note: z.string().max(800).optional()
});

export const scoredCheckInSchema = checkInPayloadSchema.extend({
  recoveryFrictionScore: z.number().int().min(0).max(100),
  mode: recoveryModeSchema,
  topBlockers: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string())
});

export const generatedPlanCardSchema = z.object({
  id: z.string(),
  kind: z.enum(["stabilizing", "practical", "support"]),
  title: z.string(),
  whyThisHelps: z.string(),
  estimatedTime: z.string(),
  effortLevel: z.enum(["low", "medium", "high"]),
  messageTarget: z.string().optional(),
  fallbackLighterVersion: z.string()
});

export const generatedPlanCardsSchema = z.tuple([
  generatedPlanCardSchema,
  generatedPlanCardSchema,
  generatedPlanCardSchema
]);

export const createCheckInSchema = z.object({
  userId: idSchema,
  episodeId: idSchema.optional(),
  energy: z.number().int().min(1).max(5),
  sleepQuality: z.number().int().min(1).max(5),
  cognitiveLoad: z.number().int().min(1).max(5),
  socialLoad: z.number().int().min(1).max(5),
  bodyStateTags: z.array(bodyStateTagSchema).default([]),
  practicalBlockerTags: z.array(practicalBlockerTagSchema).default([]),
  standWiseFlags: z.array(standWiseFlagSchema).default([]),
  note: z.string().max(800).optional(),
  checkedInAt: isoDateTimeSchema.optional()
});

export const supportCircleMemberSchema = z.object({
  id: idSchema,
  userId: idSchema,
  name: z.string(),
  role: z.string(),
  preferredChannel: supportChannelSchema,
  whatTheyCanHelpWith: z.array(z.string()),
  whatShouldNotBeShared: z.array(sharingTopicSchema),
  tonePreference: tonePreferenceSchema,
  emergencyOnly: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const recoveryAgentWorkflowInputSchema = z.object({
  checkIn: checkInPayloadSchema,
  wearable: wearableSignalInputSchema.optional(),
  scenarioId: scenarioPackIdSchema.optional(),
  supportMember: supportCircleMemberSchema.omit({ createdAt: true, updatedAt: true, userId: true }).extend({
    userId: idSchema.optional()
  }).optional()
});

const recoverySignalSchema = z.object({
  id: z.string(),
  label: z.string(),
  domain: recoveryFrictionDomainIdSchema,
  source: z.enum(["wearable", "check-in", "standwise"]),
  severity: z.enum(["low", "medium", "high"]),
  evidence: z.string()
});

const safetyAgentResultSchema = z.object({
  status: z.enum(["clear", "watch", "human-support", "crisis"]),
  blockedAi: z.boolean(),
  humanSupportRequired: z.boolean(),
  message: z.string(),
  evidence: z.array(z.string())
});

const carePlanAgentResultSchema = z.object({
  mode: recoveryModeSchema,
  smallestSafeAction: z.string(),
  planCards: generatedPlanCardsSchema
});

const caregiverAgentResultSchema = z.object({
  requiresPermission: z.literal(true),
  noAutoSend: z.literal(true),
  target: z.string(),
  shortMessage: z.string(),
  fullerMessage: z.string(),
  permissionNotice: z.string(),
  boundaries: z.array(z.string())
});

const clinicianSummaryAgentResultSchema = z.object({
  summary: z.string(),
  facts: z.array(z.string()),
  limitations: z.array(z.string())
});

const recoveryAgentTraceSchema = z.object({
  name: z.enum([
    "Signal Agent",
    "Safety Agent",
    "Care Plan Agent",
    "Caregiver Agent",
    "Clinician Summary Agent"
  ]),
  rule: z.string(),
  output: z.string(),
  usedAi: z.boolean()
});

export const recoveryAgentWorkflowResponseSchema = z.object({
  scoredCheckIn: scoredCheckInSchema,
  signals: z.array(recoverySignalSchema),
  safety: safetyAgentResultSchema,
  carePlan: carePlanAgentResultSchema,
  caregiver: caregiverAgentResultSchema,
  clinicianSummary: clinicianSummaryAgentResultSchema,
  agentTrace: z.array(recoveryAgentTraceSchema)
});

const dailyRecoverySignalSchema = z.object({
  date: z.string(),
  sleepHours: z.number(),
  sleepEfficiency: z.number(),
  steps: z.number().int().min(0),
  activeMinutes: z.number().min(0),
  restingHeartRate: z.number().optional(),
  hrvRmssd: z.number().optional(),
  breathingRate: z.number().optional(),
  spo2Avg: z.number().optional(),
  deviceSyncedAt: z.string().optional(),
  checkIn: z.object({
    energy: z.number().int().min(1).max(5),
    cognitiveLoad: z.number().int().min(1).max(5),
    socialLoad: z.number().int().min(1).max(5),
    bodyState: z.number().int().min(1).max(5),
    practicalBlockers: z.array(z.string()),
    note: z.string()
  }).optional()
});

const recoveryTrackSchema = z.object({
  id: recoveryTrackIdSchema,
  title: z.string(),
  audience: z.string(),
  context: z.string(),
  buyer: z.string(),
  whyItMatters: z.string(),
  days: z.array(dailyRecoverySignalSchema)
});

const recoverySignalDeltaSchema = z.object({
  label: z.string(),
  domain: recoveryFrictionDomainIdSchema,
  value: z.string(),
  direction: z.enum(["better", "worse", "neutral"]),
  explanation: z.string(),
  points: z.number()
});

export const recoveryTrendAnalysisSchema = z.object({
  trackId: recoveryTrackIdSchema.optional(),
  baselineWindowDays: z.number().int(),
  today: dailyRecoverySignalSchema,
  baseline: z.object({
    sleepHours: z.number(),
    steps: z.number(),
    activeMinutes: z.number(),
    restingHeartRate: z.number().optional(),
    hrvRmssd: z.number().optional()
  }),
  deltas: z.object({
    sleepDeltaHours: z.number(),
    sleepDeltaPercent: z.number(),
    stepsDeltaPercent: z.number(),
    activeMinutesDeltaPercent: z.number(),
    restingHeartRateDelta: z.number().optional(),
    hrvDeltaPercent: z.number().optional()
  }),
  recoveryFrictionScore: z.number().int().min(0).max(100),
  tomorrowHighFrictionRisk: z.number().int().min(0).max(100),
  level: z.enum(["stable", "watch", "elevated", "follow_up"]),
  confidence: z.enum(["high", "medium", "low"]),
  topSignals: z.array(recoverySignalDeltaSchema),
  recommendedNextStep: z.string(),
  dataFreshness: z.string()
});

export const onboardingProfileSchema = z.object({
  ageRange: ageRangeSchema,
  schoolWorkStatus: schoolWorkStatusSchema,
  livingSituation: livingSituationSchema,
  primaryTrackId: recoveryTrackIdSchema,
  supportAvailability: supportAvailabilitySchema,
  hasWearable: z.boolean(),
  dataUseConsent: z.boolean(),
  caregiverShareConsent: z.boolean(),
  clinicianSummaryConsent: z.boolean(),
  privacyBoundaries: z.array(sharingTopicSchema).default([]),
  preferredTone: tonePreferenceSchema.default("warm")
});

export const onboardingRecommendationSchema = z.object({
  track: recoveryTrackSchema,
  audienceFit: z.string(),
  careTeamFit: z.string(),
  dataPlan: z.array(z.string()),
  supportPlan: z.array(z.string()),
  privacySummary: z.string()
});

export const riskFeatureVectorSchema = z.object({
  sleepDeltaPercent: z.number(),
  stepsDeltaPercent: z.number(),
  activeMinutesDeltaPercent: z.number(),
  restingHeartRateDelta: z.number(),
  hrvDeltaPercent: z.number(),
  cognitiveLoad: z.number(),
  socialLoad: z.number(),
  energy: z.number(),
  routineBlockers: z.number()
});

export const riskTrainingExampleSchema = z.object({
  id: z.string(),
  features: riskFeatureVectorSchema,
  label: z.union([z.literal(0), z.literal(1)]),
  source: z.string()
});

export const riskModelSchema = z.object({
  version: z.string(),
  trainedAt: z.string(),
  intercept: z.number(),
  weights: riskFeatureVectorSchema,
  featureMeans: riskFeatureVectorSchema,
  featureScales: riskFeatureVectorSchema,
  metrics: z.object({
    examples: z.number().int(),
    accuracy: z.number(),
    precision: z.number(),
    recall: z.number()
  })
});

export const riskPredictionSchema = z.object({
  probability: z.number(),
  label: z.enum(["low", "watch", "high"]),
  threshold: z.number(),
  drivers: z.array(z.string()),
  modelVersion: z.string()
});

export const riskModelTrainingInputSchema = z.object({
  examples: z.array(riskTrainingExampleSchema).min(4).optional()
});

export const riskModelPredictionInputSchema = z.object({
  model: riskModelSchema.optional(),
  features: riskFeatureVectorSchema
});

export const fitbitLoginQuerySchema = z.object({
  userId: idSchema.optional()
});

export const fitbitCallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1)
});

export const fitbitSummaryQuerySchema = z.object({
  userId: idSchema.optional(),
  trackId: recoveryTrackIdSchema.optional()
});

export const fitbitStatusSchema = z.object({
  configured: z.boolean(),
  redirectUri: z.string(),
  scopes: z.array(z.string()),
  connectedUsers: z.array(z.string()),
  storage: z.string(),
  message: z.string()
});

export const fitbitSummarySchema = z.object({
  source: z.enum(["mock", "fitbit"]),
  configured: z.boolean(),
  connected: z.boolean(),
  trackId: recoveryTrackIdSchema,
  days: z.array(dailyRecoverySignalSchema),
  message: z.string()
});

export const googleHealthStatusSchema = fitbitStatusSchema.extend({
  message: z.string()
});

export const googleHealthLoginQuerySchema = fitbitLoginQuerySchema;

export const googleHealthCallbackQuerySchema = fitbitCallbackQuerySchema;

export const googleHealthSummaryQuerySchema = fitbitSummaryQuerySchema;

export const googleHealthSummarySchema = fitbitSummarySchema.extend({
  source: z.enum(["mock", "google-health"])
});

export const clinicDashboardPersonSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  ageRange: ageRangeSchema,
  program: z.enum(["campus", "clinic", "rehab"]),
  track: recoveryTrackSchema,
  analysis: recoveryTrendAnalysisSchema,
  prediction: riskPredictionSchema,
  workflow: recoveryAgentWorkflowResponseSchema,
  lastContact: z.string(),
  suggestedOwner: z.string()
});

export const createSupportCircleMemberSchema = z.object({
  userId: idSchema,
  name: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  preferredChannel: supportChannelSchema,
  whatTheyCanHelpWith: z.array(z.string().min(1).max(80)).default([]),
  whatShouldNotBeShared: z.array(sharingTopicSchema).default([]),
  tonePreference: tonePreferenceSchema.default("warm"),
  emergencyOnly: z.boolean().default(false)
});

export const updateSupportCircleMemberSchema = createSupportCircleMemberSchema
  .omit({ userId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required."
  });

export const composeHelpRequestSchema = z.object({
  userId: idSchema,
  memberId: idSchema,
  need: z.string().min(3).max(400),
  requestedHelp: z.string().min(3).max(400),
  urgency: z.enum(["low", "medium", "high", "emergency"]),
  shareTopics: z.array(sharingTopicSchema).default([]),
  privateContext: z.string().max(800).optional(),
  noSendJustCopy: z.boolean().default(false)
});

export const composedHelpRequestSchema = z.object({
  shortSmsDraft: z.string(),
  fullerDraft: z.string(),
  noSendJustCopy: z.boolean(),
  omittedTopics: z.array(sharingTopicSchema),
  permissionNotice: z.string()
});

export const aiTaskSchema = z.enum(["plan-explanation", "support-request-rewrite", "care-handoff-summary"]);

export const aiAudienceSchema = z.enum(["self", "support-person", "care-team", "school-work"]);

export const aiLengthSchema = z.enum(["short", "standard", "expanded"]);

export const aiPlanExplanationInputSchema = z.object({
  planCard: generatedPlanCardSchema,
  scoredCheckIn: scoredCheckInSchema.optional(),
  audience: aiAudienceSchema.default("self"),
  length: aiLengthSchema.default("standard")
});

export const aiSupportRequestRewriteInputSchema = z.object({
  draft: z.string().min(1).max(2000),
  audience: aiAudienceSchema.default("support-person"),
  channel: supportChannelSchema.default("sms"),
  tonePreference: tonePreferenceSchema.default("warm"),
  length: z.enum(["sms", "email", "expanded"]).default("sms"),
  allowedFacts: z.array(z.string().min(1).max(240)).default([]),
  doNotShare: z.array(sharingTopicSchema).default([])
});

export const aiCareHandoffSummaryInputSchema = z.object({
  recipientType: z.enum(["clinician", "trusted-person", "school-work", "other"]),
  userDisplayName: z.string().min(1).max(120).optional(),
  episodeTitle: z.string().min(1).max(160),
  scenarioContext: z.string().max(500).optional(),
  checkIn: scoredCheckInSchema.optional(),
  planCards: z.array(generatedPlanCardSchema).max(3).default([]),
  supportNeeds: z.array(z.string().min(1).max(240)).default([]),
  boundaries: z.array(z.string().min(1).max(240)).default([])
});

export const aiTextResponseSchema = z.object({
  task: aiTaskSchema,
  provider: z.string(),
  usedFallback: z.boolean(),
  text: z.string(),
  safetyNotes: z.array(z.string())
});

export const createHelpRequestDraftSchema = z.object({
  userId: idSchema,
  episodeId: idSchema.optional(),
  supportCircleMemberId: idSchema.optional(),
  title: z.string().min(3).max(120),
  message: z.string().min(10).max(1200),
  urgency: z.enum(["low", "medium", "high"]).default("medium")
});

export const helpRequestDraftSchema = z.object({
  id: idSchema,
  userId: idSchema,
  episodeId: idSchema.nullable(),
  supportCircleMemberId: idSchema.nullable(),
  title: z.string(),
  message: z.string(),
  urgency: z.enum(["low", "medium", "high"]),
  status: z.enum(["draft", "queued", "sent", "archived"]),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const createHandoffNoteSchema = z.object({
  userId: idSchema,
  episodeId: idSchema.optional(),
  recipientType: z.enum(["clinician", "trusted-person", "school-work", "other"]),
  summary: z.string().min(10).max(2000),
  includeRecentCheckins: z.boolean().default(true)
});

export const handoffNoteSchema = z.object({
  id: idSchema,
  userId: idSchema,
  episodeId: idSchema.nullable(),
  recipientType: z.enum(["clinician", "trusted-person", "school-work", "other"]),
  summary: z.string(),
  includeRecentCheckins: z.number().int().min(0).max(1),
  createdAt: z.string()
});

export const eventLogSchema = z.object({
  id: idSchema,
  userId: idSchema,
  episodeId: idSchema.nullable(),
  eventType: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  metadataJson: z.string(),
  createdAt: z.string()
});

export const completedHistoryActionSchema = z.object({
  id: idSchema,
  episodeId: idSchema.nullable(),
  title: z.string(),
  kind: z.string(),
  completedAt: z.string()
});

export const recoveryFrictionTrendPointSchema = z.object({
  id: idSchema,
  episodeId: idSchema.nullable(),
  checkedInAt: z.string(),
  recoveryFrictionScore: z.number().int().min(0).max(100),
  mode: recoveryModeSchema
});

export const historyEpisodeSchema = z.object({
  id: idSchema,
  scenarioPackId: scenarioPackIdSchema,
  title: z.string(),
  context: z.string(),
  status: z.enum(["active", "completed", "archived"]),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  latestRecoveryFrictionScore: z.number().int().min(0).max(100).nullable(),
  completedActions: z.array(completedHistoryActionSchema)
});

export const historyResponseSchema = z.object({
  episodes: z.array(historyEpisodeSchema),
  trend: z.array(recoveryFrictionTrendPointSchema)
});

export const apiRouteSchemas = [
  {
    method: "GET",
    path: "/health",
    summary: "Check API, database, migration, and seed status.",
    responseSchema: healthResponseSchema
  },
  {
    method: "GET",
    path: "/docs",
    summary: "Render human-readable API docs generated from Zod route schemas."
  },
  {
    method: "GET",
    path: "/docs.json",
    summary: "Return machine-readable API docs generated from Zod route schemas."
  },
  {
    method: "GET",
    path: "/users/:userId",
    summary: "Fetch one user profile.",
    paramsSchema: paramsWithUserIdSchema,
    responseSchema: userSchema
  },
  {
    method: "GET",
    path: "/users/:userId/episodes",
    summary: "List transition episodes for a user.",
    paramsSchema: paramsWithUserIdSchema,
    responseSchema: z.array(transitionEpisodeSchema)
  },
  {
    method: "POST",
    path: "/episodes",
    summary: "Create a transition episode.",
    bodySchema: createEpisodeSchema,
    responseSchema: transitionEpisodeSchema
  },
  {
    method: "GET",
    path: "/episodes/:episodeId/check-ins",
    summary: "List check-ins for an episode.",
    paramsSchema: paramsWithEpisodeIdSchema,
    responseSchema: z.array(checkInSchema)
  },
  {
    method: "POST",
    path: "/check-ins",
    summary: "Create a validated check-in.",
    bodySchema: createCheckInSchema,
    responseSchema: checkInSchema
  },
  {
    method: "POST",
    path: "/plan-cards/generate",
    summary: "Generate exactly three deterministic plan cards from a scored check-in.",
    bodySchema: scoredCheckInSchema,
    responseSchema: generatedPlanCardsSchema
  },
  {
    method: "POST",
    path: "/agents/recovery-workflow",
    summary: "Run the rule-based multi-agent recovery workflow: signals, safety, plan, caregiver draft, and clinician summary.",
    bodySchema: recoveryAgentWorkflowInputSchema,
    responseSchema: recoveryAgentWorkflowResponseSchema
  },
  {
    method: "GET",
    path: "/fitbit/status",
    summary: "Show whether real Fitbit OAuth is configured and which demo users have connected.",
    responseSchema: fitbitStatusSchema
  },
  {
    method: "GET",
    path: "/fitbit/login",
    summary: "Start Fitbit OAuth consent. Redirects to Fitbit when credentials are configured.",
    querySchema: fitbitLoginQuerySchema
  },
  {
    method: "GET",
    path: "/fitbit/callback",
    summary: "Receive Fitbit OAuth callback and exchange the code for an in-memory prototype token.",
    querySchema: fitbitCallbackQuerySchema
  },
  {
    method: "GET",
    path: "/fitbit/summary",
    summary: "Return normalized Fitbit daily recovery signals, falling back to mock data when OAuth is not connected.",
    querySchema: fitbitSummaryQuerySchema,
    responseSchema: fitbitSummarySchema
  },
  {
    method: "GET",
    path: "/google-health/status",
    summary: "Show whether live Google Health OAuth is configured and which demo users have connected.",
    responseSchema: googleHealthStatusSchema
  },
  {
    method: "GET",
    path: "/google-health/login",
    summary: "Start Google Health OAuth consent. Redirects to Google when credentials are configured.",
    querySchema: googleHealthLoginQuerySchema
  },
  {
    method: "GET",
    path: "/google-health/callback",
    summary: "Receive Google Health OAuth callback and exchange the code for an in-memory prototype token.",
    querySchema: googleHealthCallbackQuerySchema
  },
  {
    method: "GET",
    path: "/google-health/summary",
    summary: "Return normalized Google Health daily recovery signals, falling back to mock data when OAuth is not connected.",
    querySchema: googleHealthSummaryQuerySchema,
    responseSchema: googleHealthSummarySchema
  },
  {
    method: "POST",
    path: "/onboarding/recommend",
    summary: "Generate a demographic and recovery-track setup recommendation without diagnosis.",
    bodySchema: onboardingProfileSchema,
    responseSchema: onboardingRecommendationSchema
  },
  {
    method: "POST",
    path: "/model/train",
    summary: "Train the deterministic demo recovery-risk model on provided or built-in examples.",
    bodySchema: riskModelTrainingInputSchema,
    responseSchema: riskModelSchema
  },
  {
    method: "POST",
    path: "/model/predict",
    summary: "Predict next-step support priority using the deterministic demo risk model.",
    bodySchema: riskModelPredictionInputSchema,
    responseSchema: riskPredictionSchema
  },
  {
    method: "GET",
    path: "/clinic/dashboard",
    summary: "Return a mock clinic/campus triage queue with model predictions and agent handoff summaries.",
    responseSchema: z.array(clinicDashboardPersonSchema)
  },
  {
    method: "GET",
    path: "/users/:userId/support-circle",
    summary: "List support-circle members for a user.",
    paramsSchema: paramsWithUserIdSchema,
    responseSchema: z.array(supportCircleMemberSchema)
  },
  {
    method: "GET",
    path: "/support-circle-members/:memberId",
    summary: "Fetch one support-circle member.",
    paramsSchema: paramsWithMemberIdSchema,
    responseSchema: supportCircleMemberSchema
  },
  {
    method: "POST",
    path: "/support-circle-members",
    summary: "Create a support-circle member.",
    bodySchema: createSupportCircleMemberSchema,
    responseSchema: supportCircleMemberSchema
  },
  {
    method: "PATCH",
    path: "/support-circle-members/:memberId",
    summary: "Update a support-circle member.",
    paramsSchema: paramsWithMemberIdSchema,
    bodySchema: updateSupportCircleMemberSchema,
    responseSchema: supportCircleMemberSchema
  },
  {
    method: "DELETE",
    path: "/support-circle-members/:memberId",
    summary: "Delete a support-circle member.",
    paramsSchema: paramsWithMemberIdSchema,
    responseSchema: z.object({ ok: z.literal(true), deletedId: idSchema })
  },
  {
    method: "POST",
    path: "/help-request-drafts/compose",
    summary: "Compose SMS and longer help-request drafts while respecting member sharing permissions.",
    bodySchema: composeHelpRequestSchema,
    responseSchema: composedHelpRequestSchema
  },
  {
    method: "POST",
    path: "/ai/plan-explanation",
    summary: "Rewrite a structured plan explanation using the configured AI provider or no-op fallback.",
    bodySchema: aiPlanExplanationInputSchema,
    responseSchema: aiTextResponseSchema
  },
  {
    method: "POST",
    path: "/ai/support-request-rewrite",
    summary: "Rewrite a structured support request using allowed facts and member-safe sharing limits.",
    bodySchema: aiSupportRequestRewriteInputSchema,
    responseSchema: aiTextResponseSchema
  },
  {
    method: "POST",
    path: "/ai/care-handoff-summary",
    summary: "Summarize structured handoff facts using the configured AI provider or no-op fallback.",
    bodySchema: aiCareHandoffSummaryInputSchema,
    responseSchema: aiTextResponseSchema
  },
  {
    method: "POST",
    path: "/help-request-drafts",
    summary: "Create a help request draft.",
    bodySchema: createHelpRequestDraftSchema,
    responseSchema: helpRequestDraftSchema
  },
  {
    method: "POST",
    path: "/handoff-notes",
    summary: "Create a handoff note.",
    bodySchema: createHandoffNoteSchema,
    responseSchema: handoffNoteSchema
  },
  {
    method: "GET",
    path: "/users/:userId/event-logs",
    summary: "List recent event logs for a user.",
    paramsSchema: paramsWithUserIdSchema,
    responseSchema: z.array(eventLogSchema)
  },
  {
    method: "GET",
    path: "/users/:userId/history",
    summary: "Return episode timeline data and recovery friction trend points for history views.",
    paramsSchema: paramsWithUserIdSchema,
    responseSchema: historyResponseSchema
  }
] as const;

export type CreateEpisodeInput = z.infer<typeof createEpisodeSchema>;
export type CreateCheckInInput = z.infer<typeof createCheckInSchema>;
export type ScoredCheckInInput = z.infer<typeof scoredCheckInSchema>;
export type RecoveryAgentWorkflowInput = z.infer<typeof recoveryAgentWorkflowInputSchema>;
export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;
export type FitbitLoginQuery = z.infer<typeof fitbitLoginQuerySchema>;
export type FitbitCallbackQuery = z.infer<typeof fitbitCallbackQuerySchema>;
export type FitbitSummaryQuery = z.infer<typeof fitbitSummaryQuerySchema>;
export type GoogleHealthLoginQuery = z.infer<typeof googleHealthLoginQuerySchema>;
export type GoogleHealthCallbackQuery = z.infer<typeof googleHealthCallbackQuerySchema>;
export type GoogleHealthSummaryQuery = z.infer<typeof googleHealthSummaryQuerySchema>;
export type RiskModelTrainingInput = z.infer<typeof riskModelTrainingInputSchema>;
export type RiskModelPredictionInput = z.infer<typeof riskModelPredictionInputSchema>;
export type CreateSupportCircleMemberInput = z.infer<typeof createSupportCircleMemberSchema>;
export type UpdateSupportCircleMemberInput = z.infer<typeof updateSupportCircleMemberSchema>;
export type ComposeHelpRequestInput = z.infer<typeof composeHelpRequestSchema>;
export type AiTask = z.infer<typeof aiTaskSchema>;
export type AiPlanExplanationInput = z.infer<typeof aiPlanExplanationInputSchema>;
export type AiSupportRequestRewriteInput = z.infer<typeof aiSupportRequestRewriteInputSchema>;
export type AiCareHandoffSummaryInput = z.infer<typeof aiCareHandoffSummaryInputSchema>;
export type CreateHelpRequestDraftInput = z.infer<typeof createHelpRequestDraftSchema>;
export type CreateHandoffNoteInput = z.infer<typeof createHandoffNoteSchema>;
export type ParamsWithUserId = z.infer<typeof paramsWithUserIdSchema>;
export type ParamsWithEpisodeId = z.infer<typeof paramsWithEpisodeIdSchema>;
export type ParamsWithMemberId = z.infer<typeof paramsWithMemberIdSchema>;
