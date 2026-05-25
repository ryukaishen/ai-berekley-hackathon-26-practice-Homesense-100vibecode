export type RiskLevel = "Low" | "Moderate" | "Elevated" | "High";

export type AssessmentMode = "mock" | "webcam" | "motion" | "esp32";

export type AssessmentTest = "sit-to-stand" | "walk-and-turn" | "both";

export type SensorPhase = "seated" | "stand" | "walk" | "turn" | "recover";

export interface AccessibilityPrefs {
  largeText: boolean;
  plainLanguage: boolean;
  highContrast: boolean;
  spanishSummary: boolean;
}

export interface SymptomInput {
  dizziness: boolean;
  weakness: boolean;
  pain: boolean;
  numbness: boolean;
  shortnessOfBreath: boolean;
  otherNote: string;
}

export interface BaselineMobility {
  sitToStandTime: number;
  steadinessScore: number;
  turnConfidence: number;
  mobilityConfidence: number;
  recoveryFrictionScore: number;
  completionTrend: number;
}

export interface ScenarioSymptom {
  id: keyof Omit<SymptomInput, "otherNote">;
  label: string;
  detail: string;
}

export interface CareTask {
  id: string;
  label: string;
  plainLabel: string;
  detail: string;
  category: "home-safety" | "mobility" | "symptom" | "follow-up" | "medication";
  owner: "Patient" | "Caregiver" | "Clinician" | "PT/OT" | "Home health";
  urgency: RiskLevel;
}

export interface RecoveryFinding {
  id: string;
  title: string;
  detail: string;
  plainDetail: string;
  severity: RiskLevel;
}

export interface PatientScenario {
  id: string;
  title: string;
  shortTitle: string;
  name: string;
  age: number;
  profile: string;
  dischargeContext: string;
  baselineMobility: BaselineMobility;
  symptomDefaults: ScenarioSymptom[];
  warningSigns: string[];
  keyFindings: RecoveryFinding[];
  todayActions: string[];
  contactClinician: string[];
  followUpTopics: string[];
  caregiverTasks: CareTask[];
  caregiverSummary: string;
  clinicianSummary: string;
  spanishSummary: string;
  businessFit: string;
  dashboardAction: string;
  concernLevel: RiskLevel;
  recommendedTest: AssessmentTest;
  pulseRange?: [number, number];
}

export interface SensorFrame {
  t: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  sway: number;
  turnVelocity: number;
  verticalMotion: number;
  confidence: number;
  phase: SensorPhase;
  pulse?: number;
  spo2?: number;
}

export interface MobilityMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  direction: "up" | "down" | "flat";
  status: RiskLevel;
  description: string;
}

export interface RecoveryScore {
  recoveryFrictionScore: number;
  mobilityConfidence: number;
  changeFromBaseline: number;
  concernLevel: RiskLevel;
  symptomBurdenScore: number;
}

export interface MessageDraft {
  id: string;
  title: string;
  audience: "Clinic" | "PT/OT" | "Home health" | "Caregiver";
  subject: string;
  body: string;
}

export interface BackendAssessmentSummary {
  id: string;
  concernScore: number;
  concernLevel: RiskLevel;
  outreachPriority: "Routine" | "Elevated" | "Urgent";
  symptomBurdenScore: number;
  summary: string;
  rationale: string[];
  recommendedActions: string[];
  escalationGuidance: string[];
  createdAt: string;
}

export interface AssessmentResult {
  scenarioId: string;
  mode: AssessmentMode;
  test: AssessmentTest;
  metrics: MobilityMetric[];
  score: RecoveryScore;
  findings: RecoveryFinding[];
  whatToDoToday: string[];
  caregiverTasks: CareTask[];
  contactClinician: string[];
  followUpTopics: string[];
  messageDrafts: MessageDraft[];
  supportiveSummary: string;
  caregiverFriendlySummary: string;
  clinicianSummary: string;
  spanishSummary: string;
  framesAnalyzed: number;
  completedAt: string;
  backendSummary?: BackendAssessmentSummary;
}

export interface DashboardPatient {
  id: string;
  name: string;
  scenarioId: string;
  lastCheckDate: string;
  recoveryFrictionScore: number;
  fallConcernLevel: RiskLevel;
  symptomTrend: "Improving" | "Stable" | "Worsening";
  outreachPriority: "Routine" | "Elevated" | "Urgent";
  suggestedNextAction: string;
}
