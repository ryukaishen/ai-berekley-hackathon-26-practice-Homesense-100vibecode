export enum SupportLevel {
  STEADY = "steady",
  CAUTION = "caution",
  ELEVATED = "elevated"
}

export enum RouteId {
  HOME = "home",
  DEMO = "demo",
  AGENTS = "agents",
  FITBIT_DEMO = "fitbit-demo",
  ONBOARDING = "onboarding",
  CLINIC_DASHBOARD = "clinic-dashboard",
  SCENARIOS = "scenarios",
  EPISODE_NEW = "episode-new",
  CHECK_IN = "check-in",
  PLAN = "plan",
  SUPPORT_CIRCLE = "support-circle",
  HANDOFF = "handoff",
  HISTORY = "history"
}

export type AppRoute = {
  id: RouteId;
  path: string;
  label: string;
  description: string;
};

export type CheckInPayload = {
  energy: number;
  sleepQuality: number;
  cognitiveLoad: number;
  socialLoad: number;
  bodyStateTags: BodyStateTag[];
  practicalBlockerTags: PracticalBlockerTag[];
  note?: string;
  standWiseFlags?: StandWiseFlag[];
};

export type ApiHealth = {
  ok: true;
  service: "reentry-api";
  timestamp: string;
};

export type ScenarioPackId =
  | "post-discharge"
  | "post-surgery-return"
  | "breakup"
  | "finals-burnout"
  | "new-city-loneliness"
  | "chronic-flare";

export type InterventionTone =
  | "steady, validating, concrete"
  | "paced, practical, permission-giving"
  | "warm, grounding, nonjudgmental"
  | "calm, focused, momentum-oriented"
  | "encouraging, low-pressure, exploratory"
  | "compassionate, adaptive, body-aware";

export type PlanArchetype = {
  title: string;
  focus: string;
};

export type ScenarioPack = {
  id: ScenarioPackId;
  title: string;
  context: string;
  frictionAreas: string[];
  supportRoles: string[];
  interventionTone: InterventionTone;
  planArchetypes: PlanArchetype[];
  demoDetails: string[];
};

export const scenarioPacks: ScenarioPack[] = [
  {
    id: "post-discharge",
    title: "First Week After Discharge",
    context: "A steady landing plan for the first days back home.",
    frictionAreas: ["routines", "meds", "sleep", "appointments", "emotional whiplash"],
    supportRoles: ["trusted friend", "clinician", "family lead", "ride/helper"],
    interventionTone: "steady, validating, concrete",
    planArchetypes: [
      { title: "24-hour reset", focus: "Stabilize the next day with existing care reminders, meals, and rest." },
      { title: "appointment prep", focus: "Gather questions, symptoms, and logistics before follow-up." },
      { title: "support check-in", focus: "Ask one person for a specific, time-boxed assist." }
    ],
    demoDetails: ["2 appointments this week", "med reminders at 9am and 8pm", "ride support needed Friday"]
  },
  {
    id: "post-surgery-return",
    title: "Returning After Surgery",
    context: "A low-pressure return to class or work while the body catches up.",
    frictionAreas: ["stamina", "pain", "transportation", "workload", "boundaries"],
    supportRoles: ["supervisor/teacher", "peer note-taker", "caregiver", "clinician"],
    interventionTone: "paced, practical, permission-giving",
    planArchetypes: [
      { title: "energy budget", focus: "Set a realistic cap for standing, travel, and screen time." },
      { title: "accommodations ask", focus: "Draft a clear request for deadlines, seating, or remote time." },
      { title: "recovery buffer", focus: "Protect rest before and after higher-demand blocks." }
    ],
    demoDetails: ["energy dips after 2pm", "stairs are the hardest commute point", "one deadline needs a buffer"]
  },
  {
    id: "breakup",
    title: "Breakup Stabilizer",
    context: "A short-term plan for emotional spikes and daily functioning.",
    frictionAreas: ["rumination", "sleep", "appetite", "social media", "loneliness"],
    supportRoles: ["close friend", "roommate", "therapist", "accountability buddy"],
    interventionTone: "warm, grounding, nonjudgmental",
    planArchetypes: [
      { title: "no-contact scaffold", focus: "Reduce impulsive contact with replacement actions." },
      { title: "evening anchor", focus: "Make the hardest part of the day predictable and supported." },
      { title: "reach-out ladder", focus: "Use a tiered list for text, call, or in-person support." }
    ],
    demoDetails: ["hardest window is 10pm-midnight", "social media is muted for 48 hours", "two safe contacts ready"]
  },
  {
    id: "finals-burnout",
    title: "Finals Burnout",
    context: "A realistic plan for pressure, fatigue, and unfinished work.",
    frictionAreas: ["deadlines", "sleep debt", "focus", "food", "panic loops"],
    supportRoles: ["study partner", "professor/TA", "resident advisor", "campus support"],
    interventionTone: "calm, focused, momentum-oriented",
    planArchetypes: [
      { title: "two-hour sprint", focus: "Pick one task and create a low-friction start." },
      { title: "extension script", focus: "Prepare a direct request with status and proposed timeline." },
      { title: "recovery block", focus: "Schedule food, sleep, and decompression without negotiation." }
    ],
    demoDetails: ["3 deadlines before Friday", "sleep average is 5 hours", "one TA email queued"]
  },
  {
    id: "new-city-loneliness",
    title: "New City Loneliness",
    context: "A gentle structure for isolation during a big transition.",
    frictionAreas: ["routines", "local confidence", "social energy", "homesickness", "logistics"],
    supportRoles: ["long-distance friend", "local acquaintance", "mentor", "community group"],
    interventionTone: "encouraging, low-pressure, exploratory",
    planArchetypes: [
      { title: "tiny outing", focus: "Choose one nearby place and make leaving home easier." },
      { title: "connection prompt", focus: "Send a simple message that does not require a big explanation." },
      { title: "weekly rhythm", focus: "Anchor one repeatable local activity." }
    ],
    demoDetails: ["new commute feels draining", "Sunday is the loneliest day", "one local group bookmarked"]
  },
  {
    id: "chronic-flare",
    title: "Bad Health Week",
    context: "A flexible plan for flare days without shame or overreach.",
    frictionAreas: ["symptoms", "chores", "appointments", "energy", "guilt"],
    supportRoles: ["caregiver", "clinician", "work/school contact", "delivery/helper"],
    interventionTone: "compassionate, adaptive, body-aware",
    planArchetypes: [
      { title: "minimum viable day", focus: "Keep essentials small enough for low-capacity moments." },
      { title: "help request", focus: "Ask for one concrete task without overexplaining." },
      { title: "symptom notes", focus: "Capture useful details for later care decisions." }
    ],
    demoDetails: ["pain is highest after errands", "laundry and groceries need backup", "symptom log has 4 entries"]
  }
];

export type CheckInMode = "stabilize" | "ask-help" | "routine-restart" | "escalate-human";

export type BodyStateTag =
  | "fatigue"
  | "pain"
  | "nausea"
  | "brain-fog"
  | "dizziness"
  | "tension"
  | "low-appetite"
  | "sensory-overload";

export type PracticalBlockerTag =
  | "meals"
  | "meds"
  | "transportation"
  | "money"
  | "housing"
  | "appointments"
  | "deadlines"
  | "chores";

export type StandWiseFlag =
  | "missed-medication"
  | "missed-appointment"
  | "no-meals-today"
  | "limited-mobility"
  | "urgent-message"
  | "needs-human-follow-up";

export type CheckInScore = {
  recoveryFrictionScore: number;
  mode: CheckInMode;
  topBlockers: string[];
  confidence: number;
  evidence: string[];
};

export type ScoredCheckIn = CheckInPayload & CheckInScore;

export type GeneratedPlanCardKind = "stabilizing" | "practical" | "support";

export type EffortLevel = "low" | "medium" | "high";

export type GeneratedPlanCard = {
  id: string;
  kind: GeneratedPlanCardKind;
  title: string;
  whyThisHelps: string;
  estimatedTime: string;
  effortLevel: EffortLevel;
  messageTarget?: string;
  fallbackLighterVersion: string;
};

export type SupportChannel = "sms" | "email" | "call" | "in-person";

export type TonePreference = "warm" | "brief" | "direct" | "gentle";

export type SharingTopic =
  | "health"
  | "meds"
  | "appointments"
  | "school-work"
  | "emotions"
  | "money"
  | "location"
  | "family";

export type SupportCircleProfile = {
  id: string;
  userId?: string;
  name: string;
  role: string;
  preferredChannel: SupportChannel;
  whatTheyCanHelpWith: string[];
  whatShouldNotBeShared: SharingTopic[];
  tonePreference: TonePreference;
  emergencyOnly: boolean;
};

export type HelpRequestComposerInput = {
  member: SupportCircleProfile;
  need: string;
  requestedHelp: string;
  urgency: "low" | "medium" | "high" | "emergency";
  shareTopics: SharingTopic[];
  privateContext?: string;
  noSendJustCopy?: boolean;
};

export type HelpRequestComposerOutput = {
  shortSmsDraft: string;
  fullerDraft: string;
  noSendJustCopy: boolean;
  omittedTopics: SharingTopic[];
  permissionNotice: string;
};

export type WearableSignalInput = {
  sleepHours?: number;
  sleepDeltaHours?: number;
  steps?: number;
  baselineSteps?: number;
  stepDeltaPercent?: number;
  restingHeartRate?: number;
  baselineRestingHeartRate?: number;
  restingHeartRateDelta?: number;
  missedRoutineCount?: number;
  daysObserved?: number;
};

export type RecoveryAgentName =
  | "Signal Agent"
  | "Safety Agent"
  | "Care Plan Agent"
  | "Caregiver Agent"
  | "Clinician Summary Agent";

export type RecoverySignalSeverity = "low" | "medium" | "high";

export type RecoverySignal = {
  id: string;
  label: string;
  domain: RecoveryFrictionDomainId;
  source: "wearable" | "check-in" | "standwise";
  severity: RecoverySignalSeverity;
  evidence: string;
};

export type RecoveryAgentTrace = {
  name: RecoveryAgentName;
  rule: string;
  output: string;
  usedAi: boolean;
};

export type SafetyAgentStatus = "clear" | "watch" | "human-support" | "crisis";

export type SafetyAgentResult = {
  status: SafetyAgentStatus;
  blockedAi: boolean;
  humanSupportRequired: boolean;
  message: string;
  evidence: string[];
};

export type CarePlanAgentResult = {
  mode: CheckInMode;
  smallestSafeAction: string;
  planCards: [GeneratedPlanCard, GeneratedPlanCard, GeneratedPlanCard];
};

export type CaregiverAgentResult = {
  requiresPermission: true;
  noAutoSend: true;
  target: string;
  shortMessage: string;
  fullerMessage: string;
  permissionNotice: string;
  boundaries: string[];
};

export type ClinicianSummaryAgentResult = {
  summary: string;
  facts: string[];
  limitations: string[];
};

export type RecoveryAgentWorkflowInput = {
  checkIn: CheckInPayload;
  wearable?: WearableSignalInput;
  scenarioId?: ScenarioPackId;
  supportMember?: SupportCircleProfile;
};

export type RecoveryAgentWorkflowResult = {
  scoredCheckIn: ScoredCheckIn;
  signals: RecoverySignal[];
  safety: SafetyAgentResult;
  carePlan: CarePlanAgentResult;
  caregiver: CaregiverAgentResult;
  clinicianSummary: ClinicianSummaryAgentResult;
  agentTrace: RecoveryAgentTrace[];
};

export type RecoveryTrackId =
  | "new-diabetes-diagnosis"
  | "burnout-spiral"
  | "post-surgery-fatigue"
  | "stable-recovery";

export type DailyRecoverySignal = {
  date: string;
  sleepHours: number;
  sleepEfficiency: number;
  steps: number;
  activeMinutes: number;
  restingHeartRate?: number;
  hrvRmssd?: number;
  breathingRate?: number;
  spo2Avg?: number;
  deviceSyncedAt?: string;
  checkIn?: {
    energy: number;
    cognitiveLoad: number;
    socialLoad: number;
    bodyState: number;
    practicalBlockers: string[];
    note: string;
  };
};

export type RecoveryTrack = {
  id: RecoveryTrackId;
  title: string;
  audience: string;
  context: string;
  buyer: string;
  whyItMatters: string;
  days: DailyRecoverySignal[];
};

export type RecoverySignalDelta = {
  label: string;
  domain: RecoveryFrictionDomainId;
  value: string;
  direction: "better" | "worse" | "neutral";
  explanation: string;
  points: number;
};

export type RecoveryTrendAnalysis = {
  trackId?: RecoveryTrackId;
  baselineWindowDays: number;
  today: DailyRecoverySignal;
  baseline: {
    sleepHours: number;
    steps: number;
    activeMinutes: number;
    restingHeartRate?: number;
    hrvRmssd?: number;
  };
  deltas: {
    sleepDeltaHours: number;
    sleepDeltaPercent: number;
    stepsDeltaPercent: number;
    activeMinutesDeltaPercent: number;
    restingHeartRateDelta?: number;
    hrvDeltaPercent?: number;
  };
  recoveryFrictionScore: number;
  tomorrowHighFrictionRisk: number;
  level: "stable" | "watch" | "elevated" | "follow_up";
  confidence: "high" | "medium" | "low";
  topSignals: RecoverySignalDelta[];
  recommendedNextStep: string;
  dataFreshness: string;
};

export type AgeRange = "13-17" | "18-24" | "25-30" | "31-44" | "45-64" | "65-plus";

export type SchoolWorkStatus =
  | "high-school"
  | "college"
  | "early-career"
  | "caregiver"
  | "not-currently-working"
  | "other";

export type LivingSituation =
  | "alone"
  | "roommates"
  | "family"
  | "campus-housing"
  | "partner"
  | "temporary";

export type SupportAvailability = "strong" | "some" | "limited" | "none-yet";

export type RecoveryFrictionDomainId =
  | "body-capacity"
  | "routine-stability"
  | "cognitive-load"
  | "social-load"
  | "practical-blockers"
  | "wearable-drift"
  | "data-confidence"
  | "safety-flags";

export type RecoveryFrictionDomain = {
  id: RecoveryFrictionDomainId;
  title: string;
  plainMeaning: string;
  exampleSignals: string[];
  actionQuestion: string;
};

export type RecoveryOnboardingProfile = {
  ageRange: AgeRange;
  schoolWorkStatus: SchoolWorkStatus;
  livingSituation: LivingSituation;
  primaryTrackId: RecoveryTrackId;
  supportAvailability: SupportAvailability;
  hasWearable: boolean;
  dataUseConsent: boolean;
  caregiverShareConsent: boolean;
  clinicianSummaryConsent: boolean;
  privacyBoundaries: SharingTopic[];
  preferredTone: TonePreference;
};

export type OnboardingRecommendation = {
  track: RecoveryTrack;
  audienceFit: string;
  careTeamFit: string;
  dataPlan: string[];
  supportPlan: string[];
  privacySummary: string;
};

export type RiskModelFeatureVector = {
  sleepDeltaPercent: number;
  stepsDeltaPercent: number;
  activeMinutesDeltaPercent: number;
  restingHeartRateDelta: number;
  hrvDeltaPercent: number;
  cognitiveLoad: number;
  socialLoad: number;
  energy: number;
  routineBlockers: number;
};

export type RiskTrainingExample = {
  id: string;
  features: RiskModelFeatureVector;
  label: 0 | 1;
  source: string;
};

export type TrainedRiskModel = {
  version: string;
  trainedAt: string;
  intercept: number;
  weights: RiskModelFeatureVector;
  featureMeans: RiskModelFeatureVector;
  featureScales: RiskModelFeatureVector;
  metrics: {
    examples: number;
    accuracy: number;
    precision: number;
    recall: number;
  };
};

export type RiskModelPrediction = {
  probability: number;
  label: "low" | "watch" | "high";
  threshold: number;
  drivers: string[];
  modelVersion: string;
};

export type ClinicDashboardPerson = {
  id: string;
  displayName: string;
  ageRange: AgeRange;
  program: "campus" | "clinic" | "rehab";
  track: RecoveryTrack;
  analysis: RecoveryTrendAnalysis;
  prediction: RiskModelPrediction;
  workflow: RecoveryAgentWorkflowResult;
  lastContact: string;
  suggestedOwner: string;
};

export const sharingTopicOptions: SharingTopic[] = [
  "health",
  "meds",
  "appointments",
  "school-work",
  "emotions",
  "money",
  "location",
  "family"
];

export const tonePreferenceOptions: TonePreference[] = ["warm", "brief", "direct", "gentle"];

export const ageRangeOptions: AgeRange[] = ["13-17", "18-24", "25-30", "31-44", "45-64", "65-plus"];

export const schoolWorkStatusOptions: SchoolWorkStatus[] = [
  "high-school",
  "college",
  "early-career",
  "caregiver",
  "not-currently-working",
  "other"
];

export const livingSituationOptions: LivingSituation[] = [
  "alone",
  "roommates",
  "family",
  "campus-housing",
  "partner",
  "temporary"
];

export const supportAvailabilityOptions: SupportAvailability[] = ["strong", "some", "limited", "none-yet"];

export const recoveryFrictionDefinition =
  "Recovery friction is the measurable drag that makes a normal day harder during a setback: lower body capacity, disrupted routines, heavier thinking load, thin social support, practical blockers, wearable drift from baseline, stale data, or safety flags.";

export const recoveryFrictionDomains: RecoveryFrictionDomain[] = [
  {
    id: "body-capacity",
    title: "Body capacity",
    plainMeaning: "How much physical bandwidth the person has today.",
    exampleSignals: ["low energy", "pain", "fatigue", "dizziness", "low appetite"],
    actionQuestion: "Does the plan need to get physically smaller?"
  },
  {
    id: "routine-stability",
    title: "Routine stability",
    plainMeaning: "Whether basic anchors like sleep, meals, movement, and appointments are holding.",
    exampleSignals: ["sleep down", "no meals", "missed appointment", "routine blockers"],
    actionQuestion: "Which single routine anchor should be protected first?"
  },
  {
    id: "cognitive-load",
    title: "Cognitive load",
    plainMeaning: "How hard it is to think, decide, plan, or start tasks.",
    exampleSignals: ["brain fog", "deadline stack", "decision fatigue", "panic loop"],
    actionQuestion: "Can ReEntry reduce the number of decisions?"
  },
  {
    id: "social-load",
    title: "Social load",
    plainMeaning: "Whether people, messages, loneliness, or asking for help feels costly.",
    exampleSignals: ["loneliness", "overfull social demands", "support ask needed", "caregiver boundary"],
    actionQuestion: "Should the next step involve a person, or protect quiet?"
  },
  {
    id: "practical-blockers",
    title: "Practical blockers",
    plainMeaning: "Concrete logistics that can stop recovery even when motivation is present.",
    exampleSignals: ["transportation", "money", "meals", "chores", "school/work accommodations"],
    actionQuestion: "What is the smallest task someone else could help with?"
  },
  {
    id: "wearable-drift",
    title: "Wearable drift",
    plainMeaning: "Objective changes from the user's own baseline, not population averages.",
    exampleSignals: ["steps down", "active minutes down", "resting HR up", "HRV down"],
    actionQuestion: "Is the body trend asking for a lighter day or a handoff?"
  },
  {
    id: "data-confidence",
    title: "Data confidence",
    plainMeaning: "Whether the signal is fresh and complete enough to trust.",
    exampleSignals: ["last sync older than 3 days", "missing wearable data", "manual-only check-in"],
    actionQuestion: "Should the app ask for a quick manual check before acting?"
  },
  {
    id: "safety-flags",
    title: "Safety flags",
    plainMeaning: "Red flags that should override normal coaching and route to human support.",
    exampleSignals: ["crisis language", "urgent message", "needs human follow-up", "unsafe feeling"],
    actionQuestion: "Does this need emergency, clinician, or trusted-person support now?"
  }
];

export function getFrictionDomain(domainId: RecoveryFrictionDomainId): RecoveryFrictionDomain {
  return recoveryFrictionDomains.find((domain) => domain.id === domainId) ?? recoveryFrictionDomains[0]!;
}

type WeightedBlocker = {
  label: string;
  weight: number;
  evidence: string;
};

const bodyStateWeights: Record<BodyStateTag, number> = {
  fatigue: 6,
  pain: 7,
  nausea: 5,
  "brain-fog": 7,
  dizziness: 7,
  tension: 4,
  "low-appetite": 5,
  "sensory-overload": 6
};

const practicalBlockerWeights: Record<PracticalBlockerTag, number> = {
  meals: 7,
  meds: 10,
  transportation: 6,
  money: 6,
  housing: 9,
  appointments: 7,
  deadlines: 6,
  chores: 4
};

const standWiseFlagWeights: Record<StandWiseFlag, number> = {
  "missed-medication": 14,
  "missed-appointment": 10,
  "no-meals-today": 10,
  "limited-mobility": 8,
  "urgent-message": 12,
  "needs-human-follow-up": 18
};

export const bodyStateTagOptions: BodyStateTag[] = [
  "fatigue",
  "pain",
  "nausea",
  "brain-fog",
  "dizziness",
  "tension",
  "low-appetite",
  "sensory-overload"
];

export const practicalBlockerTagOptions: PracticalBlockerTag[] = [
  "meals",
  "meds",
  "transportation",
  "money",
  "housing",
  "appointments",
  "deadlines",
  "chores"
];

export const standWiseFlagOptions: StandWiseFlag[] = [
  "missed-medication",
  "missed-appointment",
  "no-meals-today",
  "limited-mobility",
  "urgent-message",
  "needs-human-follow-up"
];

export function scoreCheckIn(input: CheckInPayload): CheckInScore {
  const evidence: string[] = [];
  const blockers: WeightedBlocker[] = [];

  const energyRisk = (5 - clampScale(input.energy)) * 8;
  const sleepRisk = (5 - clampScale(input.sleepQuality)) * 7;
  const cognitiveRisk = (clampScale(input.cognitiveLoad) - 1) * 7;
  const socialRisk = (clampScale(input.socialLoad) - 1) * 6;

  addBlocker(blockers, "energy", energyRisk, `Energy ${input.energy}/5 contributed ${energyRisk} points.`);
  addBlocker(blockers, "sleep quality", sleepRisk, `Sleep quality ${input.sleepQuality}/5 contributed ${sleepRisk} points.`);
  addBlocker(
    blockers,
    "cognitive load",
    cognitiveRisk,
    `Cognitive load ${input.cognitiveLoad}/5 contributed ${cognitiveRisk} points.`
  );
  addBlocker(blockers, "social load", socialRisk, `Social load ${input.socialLoad}/5 contributed ${socialRisk} points.`);

  const bodyRisk = sumTaggedWeights(input.bodyStateTags, bodyStateWeights, "body state", blockers);
  const practicalRisk = sumTaggedWeights(input.practicalBlockerTags, practicalBlockerWeights, "practical blocker", blockers);
  const standWiseRisk = sumTaggedWeights(input.standWiseFlags ?? [], standWiseFlagWeights, "StandWise flag", blockers);

  const rawScore = energyRisk + sleepRisk + cognitiveRisk + socialRisk + bodyRisk + practicalRisk + standWiseRisk;
  const recoveryFrictionScore = Math.min(100, Math.round(rawScore));

  const sortedBlockers = blockers
    .filter((blocker) => blocker.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label));

  for (const blocker of sortedBlockers.slice(0, 6)) {
    evidence.push(blocker.evidence);
  }

  const mode = chooseMode(input, recoveryFrictionScore, practicalRisk, standWiseRisk);
  evidence.push(`Mode selected by deterministic rule: ${mode}.`);

  return {
    recoveryFrictionScore,
    mode,
    topBlockers: sortedBlockers.slice(0, 4).map((blocker) => blocker.label),
    confidence: calculateConfidence(input, sortedBlockers.length),
    evidence
  };
}

export function getFrictionDomainForLabel(label: string): RecoveryFrictionDomain {
  const normalized = label.toLowerCase();
  const domainId: RecoveryFrictionDomainId =
    normalized.includes("sleep") ||
    normalized.includes("meal") ||
    normalized.includes("appointment") ||
    normalized.includes("routine")
      ? "routine-stability"
      : normalized.includes("energy") ||
          normalized.includes("pain") ||
          normalized.includes("fatigue") ||
          normalized.includes("dizziness") ||
          normalized.includes("body")
        ? "body-capacity"
        : normalized.includes("cognitive") ||
            normalized.includes("brain") ||
            normalized.includes("deadline") ||
            normalized.includes("focus")
          ? "cognitive-load"
          : normalized.includes("social") ||
              normalized.includes("loneliness") ||
              normalized.includes("support")
            ? "social-load"
            : normalized.includes("transportation") ||
                normalized.includes("money") ||
                normalized.includes("chores") ||
                normalized.includes("housing")
              ? "practical-blockers"
              : normalized.includes("steps") ||
                  normalized.includes("activity") ||
                  normalized.includes("heart") ||
                  normalized.includes("hrv")
                ? "wearable-drift"
                : normalized.includes("sync") || normalized.includes("confidence")
                  ? "data-confidence"
                  : normalized.includes("urgent") || normalized.includes("human") || normalized.includes("crisis")
                    ? "safety-flags"
                    : "practical-blockers";

  return getFrictionDomain(domainId);
}

function chooseMode(
  input: CheckInPayload,
  score: number,
  practicalRisk: number,
  standWiseRisk: number
): CheckInMode {
  const hasHumanFlag = input.standWiseFlags?.includes("needs-human-follow-up") ?? false;
  const hasHighUrgencyFlag = input.standWiseFlags?.includes("urgent-message") ?? false;

  if (score >= 82 || hasHumanFlag || (score >= 70 && hasHighUrgencyFlag)) {
    return "escalate-human";
  }

  if (score >= 58 || practicalRisk >= 18 || standWiseRisk >= 18 || input.socialLoad >= 5) {
    return "ask-help";
  }

  if (score >= 34 || input.energy <= 2 || input.sleepQuality <= 2 || input.cognitiveLoad >= 4) {
    return "stabilize";
  }

  return "routine-restart";
}

function calculateConfidence(input: CheckInPayload, blockerCount: number) {
  const hasTags = input.bodyStateTags.length > 0 || input.practicalBlockerTags.length > 0;
  const hasNote = Boolean(input.note?.trim());
  const hasStandWise = Boolean(input.standWiseFlags?.length);
  const completeness = 0.68 + (hasTags ? 0.1 : 0) + (hasNote ? 0.07 : 0) + (hasStandWise ? 0.08 : 0);
  const blockerAdjustment = Math.min(0.07, blockerCount * 0.01);
  return Number(Math.min(0.96, completeness + blockerAdjustment).toFixed(2));
}

function clampScale(value: number) {
  return Math.min(5, Math.max(1, value));
}

function addBlocker(blockers: WeightedBlocker[], label: string, weight: number, evidence: string) {
  if (weight > 0) {
    blockers.push({ label, weight, evidence });
  }
}

function sumTaggedWeights<T extends string>(
  tags: T[],
  weights: Record<T, number>,
  prefix: string,
  blockers: WeightedBlocker[]
) {
  return tags.reduce((total, tag) => {
    const weight = weights[tag] ?? 0;
    addBlocker(blockers, `${prefix}: ${tag}`, weight, `${prefix} "${tag}" contributed ${weight} points.`);
    return total + weight;
  }, 0);
}

export function generatePlanCards(scoredCheckIn: ScoredCheckIn): [GeneratedPlanCard, GeneratedPlanCard, GeneratedPlanCard] {
  return [
    buildStabilizingCard(scoredCheckIn),
    buildPracticalCard(scoredCheckIn),
    buildSupportCard(scoredCheckIn)
  ];
}

function buildStabilizingCard(scoredCheckIn: ScoredCheckIn): GeneratedPlanCard {
  const hasBodyFriction = scoredCheckIn.bodyStateTags.length > 0;
  const hasLowEnergy = scoredCheckIn.energy <= 2 || scoredCheckIn.sleepQuality <= 2;

  if (hasBodyFriction || hasLowEnergy || scoredCheckIn.mode === "stabilize") {
    return {
      id: "stabilizing-reset-body",
      kind: "stabilizing",
      title: "Do a 10-minute body reset",
      whyThisHelps: "Lowering immediate body friction makes the next practical step less expensive.",
      estimatedTime: "10 minutes",
      effortLevel: scoredCheckIn.energy <= 2 ? "low" : "medium",
      fallbackLighterVersion: "Drink water, sit somewhere easier, and take three slow breaths."
    };
  }

  return {
    id: "stabilizing-reset-space",
    kind: "stabilizing",
    title: "Make the next hour quieter",
    whyThisHelps: "Reducing stimulation protects focus and gives your system a cleaner restart point.",
    estimatedTime: "8 minutes",
    effortLevel: "low",
    fallbackLighterVersion: "Silence one notification source and lower the lights or screen brightness."
  };
}

function buildPracticalCard(scoredCheckIn: ScoredCheckIn): GeneratedPlanCard {
  const blockers = scoredCheckIn.practicalBlockerTags;

  if (blockers.includes("meds")) {
    return {
      id: "practical-medication-check",
      kind: "practical",
      title: "Check the existing medication reminder",
      whyThisHelps: "Using the instructions you already have can reduce uncertainty without changing any care plan.",
      estimatedTime: "5 minutes",
      effortLevel: "low",
      fallbackLighterVersion: "Make the existing reminder easier to notice, or ask a clinician if instructions are unclear."
    };
  }

  if (blockers.includes("meals")) {
    return {
      id: "practical-food-anchor",
      kind: "practical",
      title: "Choose the easiest food option",
      whyThisHelps: "A small food anchor can improve energy and make the rest of the plan more doable.",
      estimatedTime: "12 minutes",
      effortLevel: "low",
      fallbackLighterVersion: "Eat or drink one shelf-stable thing that requires no prep."
    };
  }

  if (blockers.includes("transportation") || blockers.includes("appointments")) {
    return {
      id: "practical-logistics-confirm",
      kind: "practical",
      title: "Confirm one logistics detail",
      whyThisHelps: "A single confirmed ride, time, or address removes a blocker before it becomes urgent.",
      estimatedTime: "7 minutes",
      effortLevel: "medium",
      fallbackLighterVersion: "Write down the next appointment time and one possible ride option."
    };
  }

  if (blockers.includes("deadlines")) {
    return {
      id: "practical-deadline-slice",
      kind: "practical",
      title: "Shrink one deadline into a first slice",
      whyThisHelps: "A tiny concrete start lowers cognitive load without pretending the whole task is easy.",
      estimatedTime: "15 minutes",
      effortLevel: scoredCheckIn.cognitiveLoad >= 4 ? "medium" : "low",
      fallbackLighterVersion: "Open the task and write the first three words or bullets."
    };
  }

  return {
    id: "practical-surface-clear",
    kind: "practical",
    title: "Clear one surface or list",
    whyThisHelps: "A small visible reset creates momentum without requiring a full routine restart.",
    estimatedTime: "10 minutes",
    effortLevel: "low",
    fallbackLighterVersion: "Move three items or write one next step on paper."
  };
}

function buildSupportCard(scoredCheckIn: ScoredCheckIn): GeneratedPlanCard {
  const needsHuman =
    scoredCheckIn.mode === "ask-help" ||
    scoredCheckIn.mode === "escalate-human" ||
    scoredCheckIn.standWiseFlags?.includes("needs-human-follow-up") ||
    scoredCheckIn.socialLoad >= 5;

  if (scoredCheckIn.mode === "escalate-human") {
    return {
      id: "support-human-escalation",
      kind: "support",
      title: "Send a clear escalation message",
      whyThisHelps: "The score indicates the plan should not rely on solo effort today.",
      estimatedTime: "5 minutes",
      effortLevel: "medium",
      messageTarget: "Trusted person or care contact",
      fallbackLighterVersion: "Send: I could use human backup today. Can you check in when you can?"
    };
  }

  if (needsHuman) {
    return {
      id: "support-specific-ask",
      kind: "support",
      title: "Ask for one specific assist",
      whyThisHelps: "A concrete request is easier for someone to answer and easier for you to send.",
      estimatedTime: "6 minutes",
      effortLevel: "medium",
      messageTarget: "Support-circle member",
      fallbackLighterVersion: "Send: Can you help me choose the next small step?"
    };
  }

  return {
    id: "support-light-checkin",
    kind: "support",
    title: "Send a low-pressure check-in",
    whyThisHelps: "Light connection keeps support warm without turning the day into a bigger conversation.",
    estimatedTime: "3 minutes",
    effortLevel: "low",
    messageTarget: "Friend or accountability buddy",
    fallbackLighterVersion: "Send one emoji or short line that means you are checking in."
  };
}

export function composeHelpRequest(input: HelpRequestComposerInput): HelpRequestComposerOutput {
  const omittedTopics = input.shareTopics.filter((topic) => input.member.whatShouldNotBeShared.includes(topic));
  const allowedTopics = input.shareTopics.filter((topic) => !omittedTopics.includes(topic));
  const blockedByEmergencyOnly = input.member.emergencyOnly && !["high", "emergency"].includes(input.urgency);
  const shouldCopyOnly = Boolean(input.noSendJustCopy || blockedByEmergencyOnly);
  const safeNeed = redactRestrictedTopics(input.need, omittedTopics);
  const safeRequestedHelp = redactRestrictedTopics(input.requestedHelp, omittedTopics);
  const allowedContext = allowedTopics.length
    ? `Context I can share: ${allowedTopics.map(formatLabel).join(", ")}.`
    : "I am keeping the details light.";
  const tonePrefix = getTonePrefix(input.member.tonePreference);
  const privacyLine = omittedTopics.length
    ? "I am keeping some private details out."
    : "";
  const emergencyLine = blockedByEmergencyOnly
    ? `${input.member.name} is marked emergency-only, so this is prepared for copy/reference instead of sending.`
    : "";
  const crisisLine = hasCrisisLanguage([input.need, input.requestedHelp, input.privateContext].filter(Boolean).join(" "))
    ? "If this is immediate danger or a crisis, contact local emergency services or a trusted human now."
    : "";

  return {
    shortSmsDraft: compactText(joinParts([
      `${tonePrefix} ${input.member.name}, ${safeNeed}. Could you help with ${safeRequestedHelp}?`,
      privacyLine,
      crisisLine
    ])),
    fullerDraft: compactText(joinParts([
      `${tonePrefix} ${input.member.name},\n\n${safeNeed}. ${allowedContext} Could you help with ${safeRequestedHelp}?`,
      joinParts([privacyLine, emergencyLine, crisisLine]),
      "Thank you."
    ], "\n\n")),
    noSendJustCopy: shouldCopyOnly,
    omittedTopics,
    permissionNotice: blockedByEmergencyOnly
      ? emergencyLine
      : omittedTopics.length
        ? `Omitted: ${omittedTopics.map(formatLabel).join(", ")}.`
      : "Ready to copy or send based on your choice."
  };
}

export function runRecoveryAgentWorkflow(input: RecoveryAgentWorkflowInput): RecoveryAgentWorkflowResult {
  const score = scoreCheckIn(input.checkIn);
  const scoredCheckIn: ScoredCheckIn = { ...input.checkIn, ...score };
  const signals = detectRecoverySignals(scoredCheckIn, input.wearable);
  const safety = runSafetyAgent(scoredCheckIn, signals);
  const carePlan = runCarePlanAgent(scoredCheckIn, safety);
  const caregiver = runCaregiverAgent(scoredCheckIn, signals, carePlan, safety, input.supportMember);
  const clinicianSummary = runClinicianSummaryAgent(scoredCheckIn, signals, carePlan, safety);

  return {
    scoredCheckIn,
    signals,
    safety,
    carePlan,
    caregiver,
    clinicianSummary,
    agentTrace: [
      {
        name: "Signal Agent",
        rule: "Rule-based signal extraction from wearable deltas, check-in scales, tags, and StandWise flags.",
        output: signals.length
          ? signals.map((signal) => `${signal.label} (${signal.severity})`).join("; ")
          : "No elevated friction signal detected.",
        usedAi: false
      },
      {
        name: "Safety Agent",
        rule: "Deterministic red-flag routing. Crisis language blocks generative coaching and routes to human support.",
        output: `${safety.status}: ${safety.message}`,
        usedAi: false
      },
      {
        name: "Care Plan Agent",
        rule: "Deterministic plan generation returns exactly one stabilizing, one practical, and one support action.",
        output: carePlan.smallestSafeAction,
        usedAi: false
      },
      {
        name: "Caregiver Agent",
        rule: "Permission-aware message composition. Nothing is sent automatically.",
        output: caregiver.shortMessage,
        usedAi: false
      },
      {
        name: "Clinician Summary Agent",
        rule: "Structured-fact handoff summary. AI may later rewrite wording, but cannot add facts.",
        output: clinicianSummary.summary,
        usedAi: false
      }
    ]
  };
}

export function detectRecoverySignals(
  scoredCheckIn: ScoredCheckIn,
  wearable: WearableSignalInput = {}
): RecoverySignal[] {
  const signals: RecoverySignal[] = [];
  const addSignal = (signal: RecoverySignal) => signals.push(signal);

  if ((wearable.sleepHours ?? 8) < 6 || (wearable.sleepDeltaHours ?? 0) <= -1.5 || scoredCheckIn.sleepQuality <= 2) {
    addSignal({
      id: "sleep-down",
      label: "Sleep down",
      domain: "routine-stability",
      source: wearable.sleepHours !== undefined || wearable.sleepDeltaHours !== undefined ? "wearable" : "check-in",
      severity: scoredCheckIn.sleepQuality <= 1 || (wearable.sleepHours ?? 8) < 5 ? "high" : "medium",
      evidence: wearable.sleepHours !== undefined
        ? `${wearable.sleepHours} hours of sleep reported against a lower sleep-quality check-in.`
        : `Sleep quality was ${scoredCheckIn.sleepQuality}/5.`
    });
  }

  const hasStepDrop =
    (wearable.stepDeltaPercent ?? 0) <= -30 ||
    (wearable.steps !== undefined &&
      wearable.baselineSteps !== undefined &&
      wearable.steps < wearable.baselineSteps * 0.65);
  if (hasStepDrop || scoredCheckIn.standWiseFlags?.includes("limited-mobility")) {
    addSignal({
      id: "activity-down",
      label: "Activity down",
      domain: "wearable-drift",
      source: "wearable",
      severity: (wearable.stepDeltaPercent ?? 0) <= -50 ? "high" : "medium",
      evidence: wearable.steps !== undefined && wearable.baselineSteps !== undefined
        ? `${wearable.steps} steps vs baseline ${wearable.baselineSteps}.`
        : "Limited mobility was imported as a StandWise flag."
    });
  }

  const heartRateDelta = wearable.restingHeartRateDelta ??
    (wearable.restingHeartRate !== undefined && wearable.baselineRestingHeartRate !== undefined
      ? wearable.restingHeartRate - wearable.baselineRestingHeartRate
      : 0);
  if (heartRateDelta >= 8) {
    addSignal({
      id: "heart-rate-elevated",
      label: "Heart rate elevated",
      domain: "wearable-drift",
      source: "wearable",
      severity: heartRateDelta >= 14 ? "high" : "medium",
      evidence: `Resting heart rate is ${heartRateDelta} bpm above baseline.`
    });
  }

  if ((wearable.missedRoutineCount ?? 0) > 0) {
    addSignal({
      id: "missed-routine",
      label: "Missed routine",
      domain: "routine-stability",
      source: "wearable",
      severity: (wearable.missedRoutineCount ?? 0) >= 3 ? "high" : "medium",
      evidence: `${wearable.missedRoutineCount} routine item(s) missed over ${wearable.daysObserved ?? 3} day(s).`
    });
  }

  for (const blocker of scoredCheckIn.topBlockers) {
    addSignal({
      id: `blocker-${blocker.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
      label: formatLabel(blocker),
      domain: getFrictionDomainForLabel(blocker).id,
      source: blocker.startsWith("StandWise") ? "standwise" : "check-in",
      severity: scoredCheckIn.recoveryFrictionScore >= 75 ? "high" : scoredCheckIn.recoveryFrictionScore >= 45 ? "medium" : "low",
      evidence: `Top blocker from deterministic scoring: ${blocker}.`
    });
  }

  return dedupeSignals(signals).slice(0, 8);
}

export function runSafetyAgent(scoredCheckIn: ScoredCheckIn, signals: RecoverySignal[]): SafetyAgentResult {
  const evidence: string[] = [];
  const note = scoredCheckIn.note ?? "";
  const crisis = hasCrisisLanguage(note);
  const urgent = scoredCheckIn.standWiseFlags?.includes("urgent-message") ?? false;
  const humanFollowUp = scoredCheckIn.standWiseFlags?.includes("needs-human-follow-up") ?? false;
  const highSignals = signals.filter((signal) => signal.severity === "high");

  if (crisis) {
    evidence.push("Crisis or self-harm language appeared in the structured note.");
    return {
      status: "crisis",
      blockedAi: true,
      humanSupportRequired: true,
      message: "Use emergency or trusted human support now. ReEntry should not simulate crisis counseling.",
      evidence
    };
  }

  if (urgent || humanFollowUp || scoredCheckIn.mode === "escalate-human") {
    evidence.push("Urgent or human-follow-up flag requires a person in the loop.");
    return {
      status: "human-support",
      blockedAi: false,
      humanSupportRequired: true,
      message: "Route to a trusted person or care contact before relying on solo actions.",
      evidence
    };
  }

  if (highSignals.length > 0 || scoredCheckIn.recoveryFrictionScore >= 60) {
    evidence.push(`${highSignals.length} high-severity signal(s) or elevated friction score.`);
    return {
      status: "watch",
      blockedAi: false,
      humanSupportRequired: false,
      message: "Keep suggestions small, concrete, and permission-based.",
      evidence
    };
  }

  evidence.push("No crisis language, urgent flag, or high-severity routing condition found.");
  return {
    status: "clear",
    blockedAi: false,
    humanSupportRequired: false,
    message: "Safe to show routine-restart or stabilizing guidance.",
    evidence
  };
}

export function runCarePlanAgent(scoredCheckIn: ScoredCheckIn, safety: SafetyAgentResult): CarePlanAgentResult {
  const planCards = generatePlanCards(scoredCheckIn);
  const supportCard = planCards.find((card) => card.kind === "support") ?? planCards[2];
  const practicalCard = planCards.find((card) => card.kind === "practical") ?? planCards[1];
  const stabilizingCard = planCards.find((card) => card.kind === "stabilizing") ?? planCards[0];

  const smallestSafeAction =
    safety.status === "crisis"
      ? "Contact emergency or trusted human support now. Do not use an AI coach for crisis support."
      : safety.humanSupportRequired
        ? supportCard.fallbackLighterVersion
        : scoredCheckIn.mode === "routine-restart"
          ? practicalCard.fallbackLighterVersion
          : stabilizingCard.fallbackLighterVersion;

  return {
    mode: scoredCheckIn.mode,
    smallestSafeAction,
    planCards
  };
}

export function runCaregiverAgent(
  scoredCheckIn: ScoredCheckIn,
  signals: RecoverySignal[],
  carePlan: CarePlanAgentResult,
  safety: SafetyAgentResult,
  supportMember: SupportCircleProfile = defaultWorkflowSupportMember
): CaregiverAgentResult {
  const need = safety.status === "crisis"
    ? "I may need immediate human support"
    : `I am dealing with ${signals.slice(0, 3).map((signal) => signal.label.toLowerCase()).join(", ") || "some recovery friction"}`;
  const requestedHelp = safety.status === "crisis"
    ? "checking on me now and helping me contact emergency or trusted human support if needed"
    : carePlan.smallestSafeAction;
  const urgency: HelpRequestComposerInput["urgency"] =
    safety.status === "crisis" ? "emergency" : safety.humanSupportRequired ? "high" : "medium";
  const composed = composeHelpRequest({
    member: supportMember,
    need,
    requestedHelp,
    urgency,
    shareTopics: ["health", "appointments"],
    noSendJustCopy: true
  });

  return {
    requiresPermission: true,
    noAutoSend: true,
    target: `${supportMember.name} (${supportMember.role})`,
    shortMessage: composed.shortSmsDraft,
    fullerMessage: composed.fullerDraft,
    permissionNotice: `${composed.permissionNotice} ReEntry never sends this without user action.`,
    boundaries: [
      "Ask before sharing details with anyone else.",
      "Do not include restricted support-circle fields.",
      "Use emergency services or a trusted human immediately for crisis or immediate danger."
    ]
  };
}

export function runClinicianSummaryAgent(
  scoredCheckIn: ScoredCheckIn,
  signals: RecoverySignal[],
  carePlan: CarePlanAgentResult,
  safety: SafetyAgentResult
): ClinicianSummaryAgentResult {
  const facts = [
    `Recovery friction score: ${scoredCheckIn.recoveryFrictionScore}/100.`,
    `Mode: ${scoredCheckIn.mode}.`,
    `Top blockers: ${scoredCheckIn.topBlockers.map(formatLabel).join(", ") || "none captured"}.`,
    ...signals.slice(0, 4).map((signal) => `${signal.label}: ${signal.evidence}`)
  ];
  const summary = [
    `User reports ${signals.slice(0, 3).map((signal) => signal.label.toLowerCase()).join(", ") || "low-to-moderate friction signals"}.`,
    `Deterministic safety route: ${safety.status}.`,
    `Smallest next action: ${carePlan.smallestSafeAction}`
  ].join(" ");

  return {
    summary,
    facts,
    limitations: [
      "Non-clinical support summary only.",
      "No diagnosis, medication change, or treatment recommendation is inferred.",
      "Generated from structured user-provided and wearable-style demo data."
    ]
  };
}

const defaultWorkflowSupportMember: SupportCircleProfile = {
  id: "workflow_support_demo",
  name: "Maya",
  role: "trusted helper",
  preferredChannel: "sms",
  whatTheyCanHelpWith: ["food", "appointment prep", "check-ins"],
  whatShouldNotBeShared: ["meds", "money", "family"],
  tonePreference: "warm",
  emergencyOnly: false
};

function dedupeSignals(signals: RecoverySignal[]) {
  const seen = new Set<string>();
  return signals.filter((signal) => {
    if (seen.has(signal.id)) return false;
    seen.add(signal.id);
    return true;
  });
}

export const recoveryTracks: RecoveryTrack[] = [
  {
    id: "new-diabetes-diagnosis",
    title: "New Diabetes Diagnosis",
    audience: "16-30, newly diagnosed and trying to keep school/work stable",
    context: "A sudden diagnosis can disrupt food routines, appointments, sleep, identity, and support needs.",
    buyer: "College health centers, young-adult chronic care clinics, diabetes education programs",
    whyItMatters: "The product is not a glucose advisor; it coordinates routines, support, and handoffs when life changes fast.",
    days: makeRecoveryDays("new-diabetes-diagnosis")
  },
  {
    id: "burnout-spiral",
    title: "Burnout Spiral",
    audience: "Students and early-career workers with sleep debt and task overload",
    context: "Burnout often shows up as sleep loss, low activity, high cognitive load, and avoidance.",
    buyer: "Universities, employee assistance programs, student wellness teams",
    whyItMatters: "ReEntry catches routine collapse and turns it into one next step plus one support ask.",
    days: makeRecoveryDays("burnout-spiral")
  },
  {
    id: "post-surgery-fatigue",
    title: "Post-Surgery Fatigue",
    audience: "Young adults returning to class, work, or caregiving responsibilities",
    context: "Recovery friction spikes when activity drops, pain rises, and appointments pile up.",
    buyer: "Outpatient rehab, post-discharge programs, student disability offices",
    whyItMatters: "The app turns physical recovery signals into accommodations, helper tasks, and clinician summaries.",
    days: makeRecoveryDays("post-surgery-fatigue")
  },
  {
    id: "stable-recovery",
    title: "Stable Recovery",
    audience: "Users who need reassurance that today does not require escalation",
    context: "A stable baseline is useful because it teaches the system what normal looks like for this person.",
    buyer: "Any care program using ReEntry as a low-burden check-in layer",
    whyItMatters: "A good system should avoid unnecessary alarm and show confidence when signals are steady.",
    days: makeRecoveryDays("stable-recovery")
  }
];

export function analyzeRecoveryTrend(
  days: DailyRecoverySignal[],
  trackId?: RecoveryTrackId
): RecoveryTrendAnalysis {
  if (days.length < 4) {
    throw new Error("At least four days are required to analyze a recovery trend.");
  }

  const ordered = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const today = ordered[ordered.length - 1]!;
  const baselineDays = ordered.slice(Math.max(0, ordered.length - 8), ordered.length - 1);
  const baseline = {
    sleepHours: average(baselineDays.map((day) => day.sleepHours)),
    steps: average(baselineDays.map((day) => day.steps)),
    activeMinutes: average(baselineDays.map((day) => day.activeMinutes)),
    restingHeartRate: averageDefined(baselineDays.map((day) => day.restingHeartRate)),
    hrvRmssd: averageDefined(baselineDays.map((day) => day.hrvRmssd))
  };
  const deltas = {
    sleepDeltaHours: roundOne(today.sleepHours - baseline.sleepHours),
    sleepDeltaPercent: percentDelta(today.sleepHours, baseline.sleepHours),
    stepsDeltaPercent: percentDelta(today.steps, baseline.steps),
    activeMinutesDeltaPercent: percentDelta(today.activeMinutes, baseline.activeMinutes),
    restingHeartRateDelta:
      today.restingHeartRate !== undefined && baseline.restingHeartRate !== undefined
        ? roundOne(today.restingHeartRate - baseline.restingHeartRate)
        : undefined,
    hrvDeltaPercent:
      today.hrvRmssd !== undefined && baseline.hrvRmssd !== undefined
        ? percentDelta(today.hrvRmssd, baseline.hrvRmssd)
        : undefined
  };
  const topSignals = buildTrendSignals(today, deltas);
  const checkInPenalty = today.checkIn
    ? (5 - clampScale(today.checkIn.energy)) * 4 +
      (clampScale(today.checkIn.cognitiveLoad) - 1) * 4 +
      (clampScale(today.checkIn.socialLoad) - 1) * 3 +
      (5 - clampScale(today.checkIn.bodyState)) * 3
    : 0;
  const rawScore = topSignals.reduce((total, signal) => total + signal.points, 0) + checkInPenalty;
  const recoveryFrictionScore = Math.min(100, Math.max(0, Math.round(rawScore)));
  const tomorrowHighFrictionRisk = Math.min(
    95,
    Math.max(5, Math.round(recoveryFrictionScore * 0.82 + topSignals.filter((signal) => signal.direction === "worse").length * 4))
  );
  const level = chooseTrendLevel(recoveryFrictionScore, tomorrowHighFrictionRisk);
  const dataFreshness = describeDataFreshness(today.deviceSyncedAt);
  const confidence = chooseTrendConfidence(topSignals.length, dataFreshness);

  return {
    trackId,
    baselineWindowDays: baselineDays.length,
    today,
    baseline,
    deltas,
    recoveryFrictionScore,
    tomorrowHighFrictionRisk,
    level,
    confidence,
    topSignals: topSignals.sort((a, b) => b.points - a.points).slice(0, 5),
    recommendedNextStep: chooseTrendNextStep(level, today),
    dataFreshness
  };
}

export function trendAnalysisToWorkflowInput(analysis: RecoveryTrendAnalysis): RecoveryAgentWorkflowInput {
  const today = analysis.today;
  const checkIn: CheckInPayload = {
    energy: today.checkIn?.energy ?? (analysis.level === "stable" ? 4 : 2),
    sleepQuality: today.sleepHours >= 7 ? 4 : today.sleepHours >= 6 ? 3 : 2,
    cognitiveLoad: today.checkIn?.cognitiveLoad ?? (analysis.level === "follow_up" ? 5 : 4),
    socialLoad: today.checkIn?.socialLoad ?? 3,
    bodyStateTags: analysis.level === "stable" ? ["tension"] : ["fatigue", "brain-fog"],
    practicalBlockerTags: inferPracticalBlockers(today, analysis),
    standWiseFlags: analysis.level === "follow_up" ? ["needs-human-follow-up"] : [],
    note: today.checkIn?.note
  };

  return {
    checkIn,
    wearable: {
      sleepHours: today.sleepHours,
      sleepDeltaHours: analysis.deltas.sleepDeltaHours,
      steps: today.steps,
      baselineSteps: Math.round(analysis.baseline.steps),
      stepDeltaPercent: analysis.deltas.stepsDeltaPercent,
      restingHeartRate: today.restingHeartRate,
      baselineRestingHeartRate: analysis.baseline.restingHeartRate,
      restingHeartRateDelta: analysis.deltas.restingHeartRateDelta,
      missedRoutineCount: today.checkIn?.practicalBlockers.length ?? 0,
      daysObserved: analysis.baselineWindowDays + 1
    }
  };
}

export function buildOnboardingRecommendation(profile: RecoveryOnboardingProfile): OnboardingRecommendation {
  const track = recoveryTracks.find((item) => item.id === profile.primaryTrackId) ?? recoveryTracks[0]!;
  const audienceFit = describeAudienceFit(profile);
  const careTeamFit = describeCareTeamFit(profile);
  const dataPlan = buildDataPlan(profile);
  const supportPlan = buildSupportPlan(profile);
  const privacySummary = profile.privacyBoundaries.length
    ? `Do not include ${profile.privacyBoundaries.map(formatLabel).join(", ")} in helper messages unless the user changes this.`
    : "No restricted topics selected yet. ReEntry will still ask before sharing caregiver or care-team summaries.";

  return {
    track,
    audienceFit,
    careTeamFit,
    dataPlan,
    supportPlan,
    privacySummary
  };
}

export function featuresFromTrendAnalysis(analysis: RecoveryTrendAnalysis): RiskModelFeatureVector {
  const today = analysis.today;

  return {
    sleepDeltaPercent: analysis.deltas.sleepDeltaPercent,
    stepsDeltaPercent: analysis.deltas.stepsDeltaPercent,
    activeMinutesDeltaPercent: analysis.deltas.activeMinutesDeltaPercent,
    restingHeartRateDelta: analysis.deltas.restingHeartRateDelta ?? 0,
    hrvDeltaPercent: analysis.deltas.hrvDeltaPercent ?? 0,
    cognitiveLoad: today.checkIn?.cognitiveLoad ?? (analysis.level === "stable" ? 2 : 4),
    socialLoad: today.checkIn?.socialLoad ?? (analysis.level === "follow_up" ? 4 : 3),
    energy: today.checkIn?.energy ?? (analysis.level === "stable" ? 4 : 2),
    routineBlockers: today.checkIn?.practicalBlockers.length ?? 0
  };
}

export function buildDemoRiskTrainingSet(): RiskTrainingExample[] {
  const examples: RiskTrainingExample[] = [];

  for (const track of recoveryTracks) {
    for (let endIndex = 5; endIndex < track.days.length; endIndex += 1) {
      const window = track.days.slice(0, endIndex + 1);
      const analysis = analyzeRecoveryTrend(window, track.id);
      const label = analysis.recoveryFrictionScore >= 42 || analysis.tomorrowHighFrictionRisk >= 52 ? 1 : 0;

      examples.push({
        id: `${track.id}-${track.days[endIndex]!.date}`,
        features: featuresFromTrendAnalysis(analysis),
        label,
        source: `${track.title} demo day ${endIndex + 1}`
      });
    }
  }

  return examples;
}

export function trainRecoveryRiskModel(examples: RiskTrainingExample[] = buildDemoRiskTrainingSet()): TrainedRiskModel {
  const safeExamples = examples.length ? examples : buildDemoRiskTrainingSet();
  const featureMeans = calculateFeatureMeans(safeExamples);
  const featureScales = calculateFeatureScales(safeExamples, featureMeans);
  const weights = createZeroFeatureVector();
  let intercept = 0;
  const learningRate = 0.08;

  for (let iteration = 0; iteration < 420; iteration += 1) {
    for (const example of safeExamples) {
      const normalized = normalizeFeatureVector(example.features, featureMeans, featureScales);
      const prediction = sigmoid(intercept + dotFeatures(weights, normalized));
      const error = prediction - example.label;
      intercept -= (learningRate * error) / safeExamples.length;

      for (const key of riskFeatureKeys) {
        weights[key] -= (learningRate * error * normalized[key]) / safeExamples.length;
      }
    }
  }

  const metrics = evaluateRiskModel({ intercept, weights, featureMeans, featureScales }, safeExamples);

  return {
    version: "demo-logistic-v1",
    trainedAt: "2026-05-28T12:00:00.000Z",
    intercept: roundOne(intercept),
    weights: roundFeatureVector(weights),
    featureMeans: roundFeatureVector(featureMeans),
    featureScales: roundFeatureVector(featureScales),
    metrics
  };
}

export function predictRecoveryRisk(
  model: TrainedRiskModel,
  features: RiskModelFeatureVector
): RiskModelPrediction {
  const normalized = normalizeFeatureVector(features, model.featureMeans, model.featureScales);
  const probability = sigmoid(model.intercept + dotFeatures(model.weights, normalized));
  const threshold = 0.58;
  const label: RiskModelPrediction["label"] = probability >= threshold ? "high" : probability >= 0.35 ? "watch" : "low";
  const drivers = riskFeatureKeys
    .map((key) => ({
      key,
      score: model.weights[key] * normalized[key]
    }))
    .filter((driver) => driver.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((driver) => riskFeatureLabels[driver.key]);

  return {
    probability: Math.round(probability * 100) / 100,
    label,
    threshold,
    drivers: drivers.length ? drivers : ["Signals are close to baseline"],
    modelVersion: model.version
  };
}

export function buildClinicDashboard(model: TrainedRiskModel = trainRecoveryRiskModel()): ClinicDashboardPerson[] {
  return clinicDashboardSeeds.map((seed, index) => {
    const track = recoveryTracks.find((item) => item.id === seed.trackId) ?? recoveryTracks[0]!;
    const analysis = analyzeRecoveryTrend(track.days, track.id);
    const prediction = predictRecoveryRisk(model, featuresFromTrendAnalysis(analysis));
    const workflow = runRecoveryAgentWorkflow(trendAnalysisToWorkflowInput(analysis));

    return {
      id: `queue_${index + 1}`,
      displayName: seed.displayName,
      ageRange: seed.ageRange,
      program: seed.program,
      track,
      analysis,
      prediction,
      workflow,
      lastContact: seed.lastContact,
      suggestedOwner: seed.suggestedOwner
    };
  });
}

type RiskFeatureKey = keyof RiskModelFeatureVector;

const riskFeatureKeys: RiskFeatureKey[] = [
  "sleepDeltaPercent",
  "stepsDeltaPercent",
  "activeMinutesDeltaPercent",
  "restingHeartRateDelta",
  "hrvDeltaPercent",
  "cognitiveLoad",
  "socialLoad",
  "energy",
  "routineBlockers"
];

const riskFeatureLabels: Record<RiskFeatureKey, string> = {
  sleepDeltaPercent: "sleep dropped below baseline",
  stepsDeltaPercent: "steps dropped below baseline",
  activeMinutesDeltaPercent: "active minutes dropped",
  restingHeartRateDelta: "resting heart rate is elevated",
  hrvDeltaPercent: "HRV dropped below baseline",
  cognitiveLoad: "cognitive load is high",
  socialLoad: "support/social load is high",
  energy: "energy is low",
  routineBlockers: "routine blockers are stacking"
};

const clinicDashboardSeeds: Array<{
  displayName: string;
  ageRange: AgeRange;
  program: ClinicDashboardPerson["program"];
  trackId: RecoveryTrackId;
  lastContact: string;
  suggestedOwner: string;
}> = [
  {
    displayName: "Ari M.",
    ageRange: "18-24",
    program: "campus",
    trackId: "burnout-spiral",
    lastContact: "Checked in 18 minutes ago",
    suggestedOwner: "Campus wellness coach"
  },
  {
    displayName: "Jules R.",
    ageRange: "25-30",
    program: "clinic",
    trackId: "new-diabetes-diagnosis",
    lastContact: "Fitbit synced today",
    suggestedOwner: "Diabetes educator"
  },
  {
    displayName: "Mina K.",
    ageRange: "18-24",
    program: "rehab",
    trackId: "post-surgery-fatigue",
    lastContact: "No helper response yet",
    suggestedOwner: "Care coordinator"
  },
  {
    displayName: "Sam T.",
    ageRange: "31-44",
    program: "clinic",
    trackId: "stable-recovery",
    lastContact: "Checked in this morning",
    suggestedOwner: "No outreach needed"
  }
];

function describeAudienceFit(profile: RecoveryOnboardingProfile) {
  const status = formatLabel(profile.schoolWorkStatus);
  const ageCopy =
    profile.ageRange === "13-17"
      ? "teen"
      : profile.ageRange === "18-24"
        ? "young adult"
        : profile.ageRange === "25-30"
          ? "early adult"
          : "adult";

  return `Built for a ${ageCopy} ${status} context, with support language tuned ${profile.preferredTone}.`;
}

function describeCareTeamFit(profile: RecoveryOnboardingProfile) {
  if (profile.schoolWorkStatus === "high-school") {
    return "Best routed through a family-approved school counselor, pediatric/primary care contact, or trusted adult.";
  }
  if (profile.schoolWorkStatus === "college") {
    return "Best routed through campus wellness, disability support, an RA, or a student health clinician.";
  }
  if (profile.schoolWorkStatus === "early-career") {
    return "Best routed through primary care, outpatient rehab, EAP, or a trusted workplace accommodation contact.";
  }
  if (profile.schoolWorkStatus === "caregiver") {
    return "Best routed through a care coordinator or family support plan that respects the user's own capacity.";
  }

  return "Best routed through a trusted helper plus a clinician-ready summary if friction stays elevated.";
}

function buildDataPlan(profile: RecoveryOnboardingProfile) {
  if (!profile.dataUseConsent) {
    return [
      "Manual check-ins only until the user consents to data use.",
      "No wearable or demographic context should be used for scoring.",
      "The app can still generate support drafts from user-entered facts."
    ];
  }

  const plan = [
    "Use demographic context only to tailor routing and language, not to diagnose.",
    "Run the deterministic recovery-friction engine before any AI rewrite."
  ];

  if (profile.hasWearable) {
    plan.unshift("Connect Fitbit or mock Fitbit-style daily summaries for sleep, activity, and heart-rate trends.");
    plan.push("Compare signals against the user's own baseline instead of population averages.");
  } else {
    plan.unshift("Start with manual sleep, energy, routine, and blocker check-ins; wearable import can be added later.");
  }

  return plan;
}

function buildSupportPlan(profile: RecoveryOnboardingProfile) {
  const plan: string[] = [];

  if (profile.supportAvailability === "strong") {
    plan.push("Use the support circle immediately for practical asks and routine backup.");
  } else if (profile.supportAvailability === "some") {
    plan.push("Start with one low-pressure helper message and one no-send copy option.");
  } else if (profile.supportAvailability === "limited") {
    plan.push("Prioritize campus, clinic, or community support roles because personal support may be thin.");
  } else {
    plan.push("Build a support circle from scratch with one safe contact, one care role, and one emergency-only boundary.");
  }

  if (profile.caregiverShareConsent) {
    plan.push("Caregiver drafts are allowed, but every message remains editable and permission-gated.");
  } else {
    plan.push("Do not create caregiver-ready sharing copy until the user opts in.");
  }

  if (profile.clinicianSummaryConsent) {
    plan.push("Clinician summaries can include structured facts, trend deltas, and user-approved boundaries.");
  } else {
    plan.push("Keep clinician summaries local until the user explicitly allows handoff use.");
  }

  return plan;
}

function createZeroFeatureVector(): RiskModelFeatureVector {
  return {
    sleepDeltaPercent: 0,
    stepsDeltaPercent: 0,
    activeMinutesDeltaPercent: 0,
    restingHeartRateDelta: 0,
    hrvDeltaPercent: 0,
    cognitiveLoad: 0,
    socialLoad: 0,
    energy: 0,
    routineBlockers: 0
  };
}

function calculateFeatureMeans(examples: RiskTrainingExample[]) {
  const means = createZeroFeatureVector();

  for (const key of riskFeatureKeys) {
    means[key] = average(examples.map((example) => example.features[key]));
  }

  return means;
}

function calculateFeatureScales(examples: RiskTrainingExample[], means: RiskModelFeatureVector) {
  const scales = createZeroFeatureVector();

  for (const key of riskFeatureKeys) {
    const variance = average(examples.map((example) => (example.features[key] - means[key]) ** 2));
    scales[key] = Math.sqrt(variance) || 1;
  }

  return scales;
}

function normalizeFeatureVector(
  features: RiskModelFeatureVector,
  means: RiskModelFeatureVector,
  scales: RiskModelFeatureVector
) {
  const normalized = createZeroFeatureVector();

  for (const key of riskFeatureKeys) {
    normalized[key] = (features[key] - means[key]) / (scales[key] || 1);
  }

  return normalized;
}

function dotFeatures(left: RiskModelFeatureVector, right: RiskModelFeatureVector) {
  return riskFeatureKeys.reduce((total, key) => total + left[key] * right[key], 0);
}

function sigmoid(value: number) {
  if (value > 20) return 1;
  if (value < -20) return 0;
  return 1 / (1 + Math.exp(-value));
}

function evaluateRiskModel(
  core: Pick<TrainedRiskModel, "intercept" | "weights" | "featureMeans" | "featureScales">,
  examples: RiskTrainingExample[]
) {
  let truePositive = 0;
  let trueNegative = 0;
  let falsePositive = 0;
  let falseNegative = 0;

  for (const example of examples) {
    const probability = sigmoid(
      core.intercept + dotFeatures(core.weights, normalizeFeatureVector(example.features, core.featureMeans, core.featureScales))
    );
    const predicted = probability >= 0.58 ? 1 : 0;

    if (predicted === 1 && example.label === 1) truePositive += 1;
    if (predicted === 0 && example.label === 0) trueNegative += 1;
    if (predicted === 1 && example.label === 0) falsePositive += 1;
    if (predicted === 0 && example.label === 1) falseNegative += 1;
  }

  const total = Math.max(1, examples.length);

  return {
    examples: examples.length,
    accuracy: roundMetric((truePositive + trueNegative) / total),
    precision: roundMetric(truePositive / Math.max(1, truePositive + falsePositive)),
    recall: roundMetric(truePositive / Math.max(1, truePositive + falseNegative))
  };
}

function roundFeatureVector(vector: RiskModelFeatureVector) {
  const rounded = createZeroFeatureVector();

  for (const key of riskFeatureKeys) {
    rounded[key] = Math.round(vector[key] * 100) / 100;
  }

  return rounded;
}

function roundMetric(value: number) {
  return Math.round(value * 100) / 100;
}

function makeRecoveryDays(trackId: RecoveryTrackId): DailyRecoverySignal[] {
  const dates = Array.from({ length: 14 }, (_, index) => `2026-05-${String(14 + index).padStart(2, "0")}`);
  const synced = (day: string) => `${day}T22:30:00.000Z`;
  const base: DailyRecoverySignal[] = dates.map((date, index) => ({
    date,
    sleepHours: 7.3 - (index % 3) * 0.15,
    sleepEfficiency: 89 - (index % 4),
    steps: 7600 - (index % 4) * 180,
    activeMinutes: 42 - (index % 3) * 3,
    restingHeartRate: 68 + (index % 3),
    hrvRmssd: 54 - (index % 2) * 2,
    breathingRate: 15.5,
    spo2Avg: 97,
    deviceSyncedAt: synced(date),
    checkIn: {
      energy: 4,
      cognitiveLoad: 2,
      socialLoad: 2,
      bodyState: 4,
      practicalBlockers: [],
      note: "Routine is mostly steady."
    }
  }));

  if (trackId === "stable-recovery") return base;

  const updateLast = (updates: Partial<DailyRecoverySignal>[]) => {
    const copy = base.map((day) => ({ ...day, checkIn: day.checkIn ? { ...day.checkIn } : undefined }));
    updates.forEach((update, offset) => {
      const index = copy.length - updates.length + offset;
      copy[index] = {
        ...copy[index]!,
        ...update,
        checkIn: update.checkIn ? update.checkIn : copy[index]!.checkIn
      };
    });
    return copy;
  };

  if (trackId === "new-diabetes-diagnosis") {
    return updateLast([
      {
        sleepHours: 6.1,
        steps: 5600,
        activeMinutes: 28,
        restingHeartRate: 73,
        hrvRmssd: 46,
        checkIn: {
          energy: 3,
          cognitiveLoad: 4,
          socialLoad: 3,
          bodyState: 3,
          practicalBlockers: ["meal planning", "appointment prep"],
          note: "New diagnosis routines are making food, class, and appointments feel tangled."
        }
      },
      {
        sleepHours: 5.4,
        steps: 3900,
        activeMinutes: 18,
        restingHeartRate: 78,
        hrvRmssd: 39,
        checkIn: {
          energy: 2,
          cognitiveLoad: 5,
          socialLoad: 4,
          bodyState: 2,
          practicalBlockers: ["meals", "supplies", "follow-up questions"],
          note: "I am overwhelmed by food decisions and the appointment list."
        }
      },
      {
        sleepHours: 5.0,
        steps: 2800,
        activeMinutes: 12,
        restingHeartRate: 81,
        hrvRmssd: 34,
        checkIn: {
          energy: 2,
          cognitiveLoad: 5,
          socialLoad: 4,
          bodyState: 2,
          practicalBlockers: ["meals", "transportation", "appointments"],
          note: "Need help making a safe routine and questions for the educator visit."
        }
      }
    ]);
  }

  if (trackId === "burnout-spiral") {
    return updateLast([
      {
        sleepHours: 5.8,
        steps: 5200,
        activeMinutes: 20,
        restingHeartRate: 74,
        hrvRmssd: 42,
        checkIn: {
          energy: 2,
          cognitiveLoad: 5,
          socialLoad: 3,
          bodyState: 3,
          practicalBlockers: ["deadlines", "meals"],
          note: "Deadlines are stacked and I keep freezing before starting."
        }
      },
      {
        sleepHours: 4.9,
        steps: 3100,
        activeMinutes: 11,
        restingHeartRate: 79,
        hrvRmssd: 36,
        checkIn: {
          energy: 2,
          cognitiveLoad: 5,
          socialLoad: 4,
          bodyState: 2,
          practicalBlockers: ["deadlines", "food", "email"],
          note: "I am avoiding everything and staying up too late."
        }
      },
      {
        sleepHours: 4.6,
        steps: 2400,
        activeMinutes: 8,
        restingHeartRate: 82,
        hrvRmssd: 31,
        checkIn: {
          energy: 1,
          cognitiveLoad: 5,
          socialLoad: 5,
          bodyState: 2,
          practicalBlockers: ["deadline triage", "meals", "support ask"],
          note: "I need one tiny first step and probably a person to sit with me."
        }
      }
    ]);
  }

  return updateLast([
    {
      sleepHours: 6.2,
      steps: 4300,
      activeMinutes: 17,
      restingHeartRate: 74,
      hrvRmssd: 44,
      checkIn: {
        energy: 2,
        cognitiveLoad: 3,
        socialLoad: 2,
        bodyState: 2,
        practicalBlockers: ["transportation", "pain", "appointments"],
        note: "Getting across campus and setting up appointments is harder than expected."
      }
    },
    {
      sleepHours: 5.7,
      steps: 2600,
      activeMinutes: 10,
      restingHeartRate: 78,
      hrvRmssd: 37,
      checkIn: {
        energy: 2,
        cognitiveLoad: 4,
        socialLoad: 3,
        bodyState: 2,
        practicalBlockers: ["rides", "recovery buffer", "workload"],
        note: "Energy drops after 2pm and I need a recovery buffer."
      }
    },
    {
      sleepHours: 5.2,
      steps: 1900,
      activeMinutes: 7,
      restingHeartRate: 80,
      hrvRmssd: 32,
      checkIn: {
        energy: 1,
        cognitiveLoad: 4,
        socialLoad: 3,
        bodyState: 1,
        practicalBlockers: ["rides", "meals", "accommodations"],
        note: "I need help with food, transport, and a class/work accommodation ask."
      }
    }
  ]);
}

function buildTrendSignals(today: DailyRecoverySignal, deltas: RecoveryTrendAnalysis["deltas"]): RecoverySignalDelta[] {
  const signals: RecoverySignalDelta[] = [];
  const add = (signal: RecoverySignalDelta) => signals.push(signal);

  if (deltas.sleepDeltaPercent <= -25 || today.sleepHours < 6) {
    add({
      label: "Sleep down",
      domain: "routine-stability",
      value: `${deltas.sleepDeltaPercent}%`,
      direction: "worse",
      explanation: `Sleep is ${Math.abs(deltas.sleepDeltaPercent)}% below baseline.`,
      points: deltas.sleepDeltaPercent <= -35 ? 22 : 14
    });
  }

  if (deltas.stepsDeltaPercent <= -30) {
    add({
      label: "Activity down",
      domain: "wearable-drift",
      value: `${deltas.stepsDeltaPercent}%`,
      direction: "worse",
      explanation: `Steps are ${Math.abs(deltas.stepsDeltaPercent)}% below baseline.`,
      points: deltas.stepsDeltaPercent <= -55 ? 22 : 14
    });
  }

  if (deltas.activeMinutesDeltaPercent <= -35) {
    add({
      label: "Active minutes down",
      domain: "wearable-drift",
      value: `${deltas.activeMinutesDeltaPercent}%`,
      direction: "worse",
      explanation: `Active minutes are ${Math.abs(deltas.activeMinutesDeltaPercent)}% below baseline.`,
      points: deltas.activeMinutesDeltaPercent <= -60 ? 14 : 9
    });
  }

  if ((deltas.restingHeartRateDelta ?? 0) >= 8) {
    add({
      label: "Resting heart rate elevated",
      domain: "wearable-drift",
      value: `+${deltas.restingHeartRateDelta} bpm`,
      direction: "worse",
      explanation: `Resting heart rate is ${deltas.restingHeartRateDelta} bpm above baseline.`,
      points: (deltas.restingHeartRateDelta ?? 0) >= 12 ? 16 : 10
    });
  }

  if ((deltas.hrvDeltaPercent ?? 0) <= -20) {
    add({
      label: "HRV down",
      domain: "wearable-drift",
      value: `${deltas.hrvDeltaPercent}%`,
      direction: "worse",
      explanation: `HRV is ${Math.abs(deltas.hrvDeltaPercent ?? 0)}% below baseline.`,
      points: (deltas.hrvDeltaPercent ?? 0) <= -35 ? 14 : 8
    });
  }

  if (today.checkIn?.practicalBlockers.length) {
    add({
      label: "Routine blockers",
      domain: "practical-blockers",
      value: `${today.checkIn.practicalBlockers.length}`,
      direction: "worse",
      explanation: `Check-in lists ${today.checkIn.practicalBlockers.join(", ")} as blockers.`,
      points: Math.min(15, today.checkIn.practicalBlockers.length * 5)
    });
  }

  if (!signals.length) {
    add({
      label: "Stable baseline",
      domain: "data-confidence",
      value: "steady",
      direction: "neutral",
      explanation: "Today is close to the recent personal baseline.",
      points: 0
    });
  }

  return signals;
}

function chooseTrendLevel(score: number, tomorrowRisk: number): RecoveryTrendAnalysis["level"] {
  if (score >= 72 || tomorrowRisk >= 76) return "follow_up";
  if (score >= 52 || tomorrowRisk >= 58) return "elevated";
  if (score >= 28 || tomorrowRisk >= 35) return "watch";
  return "stable";
}

function chooseTrendConfidence(signalCount: number, freshness: string): RecoveryTrendAnalysis["confidence"] {
  if (freshness.includes("stale")) return "low";
  if (signalCount >= 3) return "high";
  return "medium";
}

function chooseTrendNextStep(level: RecoveryTrendAnalysis["level"], today: DailyRecoverySignal) {
  if (level === "follow_up") {
    return "Ask one trusted person for concrete help today and prepare a care-team summary if this continues.";
  }
  if (level === "elevated") {
    return "Pick the lowest-effort body action, protect one routine, and draft a helper message.";
  }
  if (level === "watch") {
    return "Keep the day lighter than normal and choose one routine anchor.";
  }
  return today.checkIn?.note ?? "Stay with the current routine and check again tomorrow.";
}

function inferPracticalBlockers(today: DailyRecoverySignal, analysis: RecoveryTrendAnalysis): PracticalBlockerTag[] {
  const blockers = new Set<PracticalBlockerTag>();
  if (analysis.deltas.sleepDeltaPercent <= -25) blockers.add("chores");
  if (analysis.deltas.stepsDeltaPercent <= -40) blockers.add("transportation");
  if (today.checkIn?.practicalBlockers.some((item) => item.includes("meal") || item.includes("food"))) blockers.add("meals");
  if (today.checkIn?.practicalBlockers.some((item) => item.includes("appointment"))) blockers.add("appointments");
  if (today.checkIn?.practicalBlockers.some((item) => item.includes("deadline") || item.includes("workload"))) blockers.add("deadlines");
  return [...blockers].slice(0, 4);
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function averageDefined(values: Array<number | undefined>) {
  const defined = values.filter((value): value is number => value !== undefined);
  return defined.length ? average(defined) : undefined;
}

function percentDelta(value: number, baseline: number) {
  if (!baseline) return 0;
  return Math.round(((value - baseline) / baseline) * 100);
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function describeDataFreshness(deviceSyncedAt?: string) {
  if (!deviceSyncedAt) return "unknown sync time";
  const syncedTime = Date.parse(deviceSyncedAt);
  if (Number.isNaN(syncedTime)) return "unknown sync time";
  const ageHours = Math.max(0, (Date.parse("2026-05-28T12:00:00.000Z") - syncedTime) / 36e5);
  if (ageHours <= 24) return "fresh: synced within 24h";
  if (ageHours <= 72) return "medium: synced within 3 days";
  return "stale: last sync is older than 3 days";
}

const restrictedTopicAliases: Record<SharingTopic, string[]> = {
  health: ["health", "symptom", "symptoms", "pain", "flare", "medical"],
  meds: ["meds", "medication", "medicine", "dose", "dosage", "prescription", "pill", "pills"],
  appointments: ["appointment", "appointments", "follow-up", "follow up"],
  "school-work": ["school", "class", "work", "job", "professor", "teacher", "manager", "deadline"],
  emotions: ["emotion", "emotions", "panic", "sad", "lonely", "rumination"],
  money: ["money", "bill", "bills", "rent", "debt", "bank"],
  location: ["address", "location", "where i am", "home", "dorm"],
  family: ["family", "parent", "parents", "mom", "dad", "sibling", "partner"]
};

export function redactRestrictedTopics(value: string, restrictedTopics: SharingTopic[]) {
  return restrictedTopics.reduce((text, topic) => {
    const aliases = restrictedTopicAliases[topic];
    return aliases.reduce((current, alias) => {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return current.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "private detail");
    }, text);
  }, value);
}

export function hasCrisisLanguage(value: string) {
  return /\b(?:crisis|suicid(?:e|al)|self-harm|harm myself|end my life|immediate danger|unsafe)\b/i.test(value);
}

function getTonePrefix(tone: TonePreference) {
  if (tone === "brief") return "Quick ask:";
  if (tone === "direct") return "Direct ask:";
  if (tone === "gentle") return "Gentle check-in:";
  return "Hey";
}

function compactText(value: string) {
  return value.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function joinParts(parts: Array<string | undefined>, separator = " ") {
  return parts.filter((part): part is string => Boolean(part?.trim())).join(separator);
}

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}
