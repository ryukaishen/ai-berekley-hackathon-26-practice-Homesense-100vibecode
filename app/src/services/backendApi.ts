import type {
  AssessmentMode,
  AssessmentTest,
  BackendAssessmentSummary,
  DashboardPatient,
  MobilityMetric,
  SymptomInput,
} from "../types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "/api";

interface ApiEnvelope<T> {
  data: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const json = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || json.error) {
    const message = json.error?.message ?? `Request failed with status ${response.status}.`;
    throw new Error(message);
  }
  return json.data;
};

export const fetchBackendHealth = () =>
  request<{ status: string; service: string; version: string; timestamp: string }>("/health");

export const fetchDashboardRows = () => request<DashboardPatient[]>("/dashboard?limit=80");

interface AssessmentRunPayload {
  scenarioId: string;
  mode: AssessmentMode;
  test: AssessmentTest;
  symptoms: SymptomInput;
  metrics: Array<Pick<MobilityMetric, "id" | "value" | "status">>;
  framesAnalyzed: number;
}

export const runBackendAssessment = (payload: AssessmentRunPayload) =>
  request<BackendAssessmentSummary>("/assessments/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });
