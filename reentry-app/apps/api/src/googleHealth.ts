import { randomBytes } from "node:crypto";
import { recoveryTracks, type DailyRecoverySignal, type RecoveryTrackId } from "@reentry/shared";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_HEALTH_API_URL = "https://health.googleapis.com/v4";
const DEFAULT_USER_ID = "user_demo_001";
const DEFAULT_TRACK_ID: RecoveryTrackId = "new-diabetes-diagnosis";

const GOOGLE_HEALTH_SCOPES = [
  "https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly",
  "https://www.googleapis.com/auth/googlehealth.sleep.readonly",
  "https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly",
  "https://www.googleapis.com/auth/googlehealth.profile.readonly"
];

type GoogleHealthStateSession = {
  userId: string;
  createdAt: string;
};

type GoogleHealthTokenSet = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
  tokenType?: string;
  obtainedAt: string;
  identity?: {
    legacyUserId?: string;
    healthUserId?: string;
  };
};

type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

const stateStore = new Map<string, GoogleHealthStateSession>();
const tokenStore = new Map<string, GoogleHealthTokenSet>();

export function getGoogleHealthStatus() {
  const config = getGoogleHealthConfig();

  return {
    configured: config.configured,
    redirectUri: config.redirectUri,
    scopes: GOOGLE_HEALTH_SCOPES,
    connectedUsers: [...tokenStore.keys()],
    storage: "in-memory prototype token store",
    message: config.configured
      ? "Google Health OAuth is configured. Use /google-health/login to begin consent."
      : "Google Health OAuth is not configured. Set GOOGLE_HEALTH_CLIENT_ID, GOOGLE_HEALTH_CLIENT_SECRET, and GOOGLE_HEALTH_REDIRECT_URI to use live consent."
  };
}

export function createGoogleHealthAuthorizationUrl(userId = DEFAULT_USER_ID) {
  const config = getGoogleHealthConfig();

  if (!config.configured) {
    return {
      configured: false,
      url: null,
      message: "Google Health credentials are missing, so the app will use mock wearable-style recovery data."
    };
  }

  const state = randomBytes(18).toString("hex");
  const url = new URL(GOOGLE_AUTH_URL);

  stateStore.set(state, {
    userId,
    createdAt: new Date().toISOString()
  });

  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_HEALTH_SCOPES.join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");

  return {
    configured: true,
    url: url.toString(),
    state,
    scopes: GOOGLE_HEALTH_SCOPES,
    redirectUri: config.redirectUri,
    message: "Redirect the user to Google for Google Health consent."
  };
}

export async function exchangeGoogleHealthCode(code: string, state: string) {
  const config = getGoogleHealthConfig();
  const session = stateStore.get(state);

  if (!config.configured) {
    return { ok: false, message: "Google Health credentials are missing." };
  }

  if (!session) {
    return { ok: false, message: "Google Health OAuth state is missing or expired." };
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    return {
      ok: false,
      message: "Google Health token exchange failed.",
      detail: await response.text()
    };
  }

  const token = (await response.json()) as GoogleTokenResponse;
  const identity = await fetchGoogleHealthIdentity(token.access_token).catch(() => undefined);

  tokenStore.set(session.userId, {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresIn: token.expires_in,
    scope: token.scope,
    tokenType: token.token_type,
    obtainedAt: new Date().toISOString(),
    identity
  });
  stateStore.delete(state);

  return {
    ok: true,
    userId: session.userId,
    identity,
    expiresIn: token.expires_in,
    message: "Google Health connected. Tokens are stored in memory for this prototype only."
  };
}

export async function getGoogleHealthDailySummary({
  userId = DEFAULT_USER_ID,
  trackId = DEFAULT_TRACK_ID
}: {
  userId?: string;
  trackId?: RecoveryTrackId;
}) {
  const config = getGoogleHealthConfig();
  const track = recoveryTracks.find((item) => item.id === trackId) ?? recoveryTracks[0]!;
  const token = tokenStore.get(userId);

  if (!config.configured || !token) {
    return {
      source: "mock",
      configured: config.configured,
      connected: Boolean(token),
      trackId: track.id,
      days: track.days,
      message: config.configured
        ? "Google Health is configured, but this demo user has not completed OAuth yet. Returning mock data."
        : "Google Health credentials are missing. Returning mock wearable-style recovery data."
    };
  }

  try {
    const days = await fetchGoogleHealthDailySignals(token.accessToken, track.days);

    return {
      source: "google-health",
      configured: true,
      connected: true,
      trackId: track.id,
      days,
      message: "Google Health daily summaries normalized into ReEntry recovery signals."
    };
  } catch (error) {
    return {
      source: "mock",
      configured: true,
      connected: true,
      trackId: track.id,
      days: track.days,
      message: `Google Health fetch failed, so the API returned mock data for demo continuity: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    };
  }
}

async function fetchGoogleHealthDailySignals(accessToken: string, fallbackDays: DailyRecoverySignal[]) {
  const fallbackByIndex = fallbackDays.slice(-14);
  const startDate = parseDateParts(fallbackByIndex[0]?.date ?? "2026-05-14");
  const endDate = parseDateParts(addDays(fallbackByIndex[fallbackByIndex.length - 1]?.date ?? "2026-05-27", 1));
  const body = {
    range: {
      start: { date: startDate, time: { hours: 0, minutes: 0, seconds: 0, nanos: 0 } },
      end: { date: endDate, time: { hours: 0, minutes: 0, seconds: 0, nanos: 0 } }
    },
    windowSizeDays: 1
  };

  const [steps, activeMinutes, restingHeartRate, hrv, sleep] = await Promise.all([
    postGoogleHealth(accessToken, "/users/me/dataTypes/steps/dataPoints:dailyRollUp", body),
    postGoogleHealth(accessToken, "/users/me/dataTypes/active-minutes/dataPoints:dailyRollUp", body),
    postGoogleHealth(accessToken, "/users/me/dataTypes/daily-resting-heart-rate/dataPoints:dailyRollUp", body),
    getGoogleHealth(accessToken, `/users/me/dataTypes/daily-heart-rate-variability/dataPoints?filter=daily_heart_rate_variability.date >= "${fallbackByIndex[0]?.date ?? "2026-05-14"}"`).catch(() => ({ dataPoints: [] })),
    getGoogleHealth(accessToken, `/users/me/dataTypes/sleep/dataPoints:reconcile?dataSourceFamily=users/me/dataSourceFamilies/google-wearables&filter=sleep.interval.civil_end_time >= "${fallbackByIndex[0]?.date ?? "2026-05-14"}"`).catch(() => ({ dataPoints: [] }))
  ]);

  return normalizeGoogleHealthDailySignals({ steps, activeMinutes, restingHeartRate, hrv, sleep }, fallbackByIndex);
}

async function fetchGoogleHealthIdentity(accessToken: string) {
  const response = await getGoogleHealth(accessToken, "/users/me/identity");

  return {
    legacyUserId: typeof response.legacyUserId === "string" ? response.legacyUserId : undefined,
    healthUserId: typeof response.healthUserId === "string" ? response.healthUserId : undefined
  };
}

async function getGoogleHealth(accessToken: string, path: string) {
  const response = await fetch(`${GOOGLE_HEALTH_API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Google Health API request failed for ${path}: ${response.status}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

async function postGoogleHealth(accessToken: string, path: string, body: unknown) {
  const response = await fetch(`${GOOGLE_HEALTH_API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Google Health API request failed for ${path}: ${response.status}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

function normalizeGoogleHealthDailySignals(
  payload: Record<"steps" | "activeMinutes" | "restingHeartRate" | "hrv" | "sleep", Record<string, unknown>>,
  fallbackDays: DailyRecoverySignal[]
) {
  const stepsByDate = readRollupMap(payload.steps, "steps", "countSum");
  const activeByDate = readRollupMap(payload.activeMinutes, "activeMinutes", "durationSeconds");
  const rhrByDate = readRollupMap(payload.restingHeartRate, "dailyRestingHeartRate", "beatsPerMinute");
  const hrvByDate = readDailyMap(payload.hrv, "dailyHeartRateVariability", "rmssd");
  const sleepByDate = readSleepMap(payload.sleep);

  return fallbackDays.map((fallback) => {
    const sleepMinutes = sleepByDate.get(fallback.date);
    const activeSeconds = activeByDate.get(fallback.date);

    return {
      ...fallback,
      sleepHours: sleepMinutes ? roundOne(sleepMinutes / 60) : fallback.sleepHours,
      sleepEfficiency: fallback.sleepEfficiency,
      steps: Math.round(stepsByDate.get(fallback.date) ?? fallback.steps),
      activeMinutes: Math.round(activeSeconds ? activeSeconds / 60 : fallback.activeMinutes),
      restingHeartRate: rhrByDate.get(fallback.date) ?? fallback.restingHeartRate,
      hrvRmssd: hrvByDate.get(fallback.date) ?? fallback.hrvRmssd,
      deviceSyncedAt: new Date().toISOString()
    };
  });
}

function readRollupMap(payload: Record<string, unknown>, dataKey: string, valueKey: string) {
  const map = new Map<string, number>();

  for (const item of readArray(payload.rollupDataPoints)) {
    const date = readCivilDate(item.civilStartTime);
    const value = Number(readObject(item[dataKey])[valueKey] ?? 0);
    if (date && value) map.set(date, value);
  }

  return map;
}

function readDailyMap(payload: Record<string, unknown>, dataKey: string, valueKey: string) {
  const map = new Map<string, number>();

  for (const item of readArray(payload.dataPoints)) {
    const value = readObject(item[dataKey]);
    const date = readCivilDate(value.date ?? item.date);
    const metric = Number(value[valueKey] ?? 0);
    if (date && metric) map.set(date, metric);
  }

  return map;
}

function readSleepMap(payload: Record<string, unknown>) {
  const map = new Map<string, number>();

  for (const item of readArray(payload.dataPoints)) {
    const sleep = readObject(item.sleep);
    const interval = readObject(sleep.interval);
    const date = readCivilDate(readObject(interval.civilEndTime).date) || toDateString(String(interval.endTime ?? ""));
    const summary = readObject(sleep.summary);
    const minutes = Number(summary.minutesAsleep ?? 0);
    if (date && minutes) map.set(date, (map.get(date) ?? 0) + minutes);
  }

  return map;
}

function readCivilDate(value: unknown) {
  const wrapper = readObject(value);
  const date = "date" in wrapper ? readObject(wrapper.date) : wrapper;
  const year = Number(date.year ?? 0);
  const month = Number(date.month ?? 0);
  const day = Number(date.day ?? 0);

  if (!year || !month || !day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function readArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null) : [];
}

function readObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function getGoogleHealthConfig() {
  const clientId = process.env.GOOGLE_HEALTH_CLIENT_ID ?? process.env.FITBIT_CLIENT_ID ?? "";
  const clientSecret = process.env.GOOGLE_HEALTH_CLIENT_SECRET ?? process.env.FITBIT_CLIENT_SECRET ?? "";
  const redirectUri =
    process.env.GOOGLE_HEALTH_REDIRECT_URI ??
    process.env.FITBIT_REDIRECT_URI ??
    "http://localhost:8787/google-health/callback";

  return {
    clientId,
    clientSecret,
    redirectUri,
    configured: Boolean(clientId && clientSecret && redirectUri)
  };
}

function parseDateParts(value: string) {
  const [year = "2026", month = "1", day = "1"] = value.split("-");

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day)
  };
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function toDateString(value: string) {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}
