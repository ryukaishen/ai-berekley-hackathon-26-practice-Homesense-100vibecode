export interface CheckIn {
  energy: 1 | 2 | 3 | 4 | 5;
  cognitiveLoad: 1 | 2 | 3 | 4 | 5;
  socialLoad: 1 | 2 | 3 | 4 | 5;
  bodyState: Array<'headache' | 'fatigue' | 'nausea' | 'dizziness' | 'pain' | 'brain_fog' | 'none'>;
  practicalBlockers: Array<'no_transport' | 'alone_at_home' | 'no_caregiver' | 'financial' | 'work_conflict' | 'none'>;
  note: string;
}

export interface DailyRecoverySignal {
  date: string;
  sleepHours: number;
  sleepEfficiency: number;
  steps: number;
  activeMinutes: number;
  restingHeartRate: number;
  hrvRmssd: number;
  breathingRate: number;
  spo2Avg: number;
  deviceSyncedAt: string | null;
  routineCompleted: boolean;
  checkIn: CheckIn | null;
}

export type FrictionLevel = 'low' | 'moderate' | 'elevated' | 'high';

export interface FrictionScore {
  total: number;
  level: FrictionLevel;
  components: {
    sleep: number;
    hrv: number;
    activity: number;
    checkin: number;
  };
  topDrivers: string[];
}

export type SafetyLevel = 'clear' | 'yellow' | 'red' | 'emergency';

export interface SafetyResult {
  level: SafetyLevel;
  flags: string[];
  blockedAgents: boolean;
  escalationMessage: string | null;
}

export interface AgentResult {
  signalSummary: string;
  frictionExplanation: string;
  carePlanSteps: string[];
  caregiverDraft: string;
  clinicianSummary: string;
  generatedAt: string;
  modelUsed: string;
}

export interface RecoveryTrack {
  id: string;
  label: string;
  description: string;
  days: DailyRecoverySignal[];
}
