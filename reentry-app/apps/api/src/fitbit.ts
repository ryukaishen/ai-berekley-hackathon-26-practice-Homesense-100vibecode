import { createHash, randomBytes } from "node:crypto";
import { recoveryTracks, type DailyRecoverySignal, type RecoveryTrackId } from "@reentry/shared";

const FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize";
const FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token";
const FITBIT_API_URL = "https://api.fitbit.com";
const FITBIT_SCOPES = ["activity", "heartrate", "sleep", "profile"];
const DEFAULT_USER_ID = "user_demo_001";
const DEFAULT_TRACK_ID: RecoveryTrackId = "new-diabetes-diagnosis";

type FitbitStateSession = {
  userId: string;
  codeVerifier: string;
  createdAt: string;
};

type FitbitTokenSet = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
  tokenType?: string;
  userId?: string;
  obtainedAt: string;
};

type FitbitTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  user_id?: string;
};

const stateStore = new Map<string, FitbitStateSession>();
const tokenStore = new Map<string, FitbitTokenSet>();

export function getFitbitStatus() {
  const config = getFitbitConfig();

  return {
    configured: config.configured,
    redirectUri: config.redirectUri,
    scopes: FITBIT_SCOPES,
    connectedUsers: [...tokenStore.keys()],
    storage: "in-memory prototype token store",
    message: config.configured
      ? "Fitbit OAuth is configured. Use /fitbit/login to begin consent."
      : "Fitbit OAuth is not configured. Set FITBIT_CLIENT_ID, FITBIT_CLIENT_SECRET, and FITBIT_REDIRECT_URI to use real Fitbit consent."
  };
}

export function createFitbitAuthorizationUrl(userId = DEFAULT_USER_ID) {
  const config = getFitbitConfig();

  if (!config.configured) {
    return {
      configured: false,
      url: null,
      message: "Fitbit credentials are missing, so the app will use mock Fitbit-style recovery data."
    };
  }

  const state = randomBytes(18).toString("hex");
  const codeVerifier = base64Url(randomBytes(48));
  const codeChallenge = base64Url(createHash("sha256").update(codeVerifier).digest());
  const url = new URL(FITBIT_AUTH_URL);

  stateStore.set(state, {
    userId,
    codeVerifier,
    createdAt: new Date().toISOString()
  });

  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", FITBIT_SCOPES.join(" "));
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return {
    configured: true,
    url: url.toString(),
    state,
    scopes: FITBIT_SCOPES,
    redirectUri: config.redirectUri,
    message: "Redirect the user to Fitbit for consent."
  };
}

export async function exchangeFitbitCode(code: string, state: string) {
  const config = getFitbitConfig();
  const session = stateStore.get(state);

  if (!config.configured) {
    return { ok: false, message: "Fitbit credentials are missing." };
  }

  if (!session) {
    return { ok: false, message: "Fitbit OAuth state is missing or expired." };
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    code,
    code_verifier: session.codeVerifier,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri
  });

  const response = await fetch(FITBIT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    return {
      ok: false,
      message: "Fitbit token exchange failed.",
      detail: await response.text()
    };
  }

  const token = (await response.json()) as FitbitTokenResponse;
  tokenStore.set(session.userId, {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresIn: token.expires_in,
    scope: token.scope,
    tokenType: token.token_type,
    userId: token.user_id,
    obtainedAt: new Date().toISOString()
  });
  stateStore.delete(state);

  return {
    ok: true,
    userId: session.userId,
    fitbitUserId: token.user_id,
    expiresIn: token.expires_in,
    message: "Fitbit connected. Tokens are stored in memory for this prototype only."
  };
}

export async function getFitbitDailySummary({
  userId = DEFAULT_USER_ID,
  trackId = DEFAULT_TRACK_ID
}: {
  userId?: string;
  trackId?: RecoveryTrackId;
}) {
  const config = getFitbitConfig();
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
        ? "Fitbit is configured, but this demo user has not completed OAuth yet. Returning mock data."
        : "Fitbit credentials are missing. Returning mock Fitbit-style recovery data."
    };
  }

  try {
    const days = await fetchFitbitDailySignals(token.accessToken, track.days);

    return {
      source: "fitbit",
      configured: true,
      connected: true,
      trackId: track.id,
      days,
      message: "Real Fitbit daily summaries normalized into ReEntry recovery signals."
    };
  } catch (error) {
    return {
      source: "mock",
      configured: true,
      connected: true,
      trackId: track.id,
      days: track.days,
      message: `Fitbit fetch failed, so the API returned mock data for demo continuity: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    };
  }
}

async function fetchFitbitDailySignals(accessToken: string, fallbackDays: DailyRecoverySignal[]) {
  const endDate = toDateString(new Date());
  const startDate = toDateString(new Date(Date.now() - 13 * 24 * 60 * 60 * 1000));
  const [steps, sleep, heart, hrv] = await Promise.all([
    fetchFitbitJson(accessToken, `/1/user/-/activities/steps/date/${startDate}/${endDate}.json`),
    fetchFitbitJson(accessToken, `/1.2/user/-/sleep/date/${startDate}/${endDate}.json`),
    fetchFitbitJson(accessToken, `/1/user/-/activities/heart/date/${startDate}/${endDate}.json`),
    fetchFitbitJson(accessToken, `/1/user/-/hrv/date/${startDate}/${endDate}.json`).catch(() => ({ hrv: [] }))
  ]);

  return normalizeFitbitDailySignals({ steps, sleep, heart, hrv }, fallbackDays);
}

async function fetchFitbitJson(accessToken: string, path: string) {
  const response = await fetch(`${FITBIT_API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Fitbit API request failed for ${path}: ${response.status}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

function normalizeFitbitDailySignals(
  payload: Record<"steps" | "sleep" | "heart" | "hrv", Record<string, unknown>>,
  fallbackDays: DailyRecoverySignal[]
): DailyRecoverySignal[] {
  const fallbackByIndex = fallbackDays.slice(-14);
  const stepMap = new Map(
    readArray(payload.steps["activities-steps"]).map((item) => [
      String(item.dateTime ?? ""),
      Number(item.value ?? 0)
    ])
  );
  const heartMap = new Map(
    readArray(payload.heart["activities-heart"]).map((item) => [
      String(item.dateTime ?? ""),
      Number(readObject(item.value).restingHeartRate ?? 0)
    ])
  );
  const sleepMap = new Map(
    readArray(payload.sleep.sleep).map((item) => [
      String(item.dateOfSleep ?? ""),
      {
        minutesAsleep: Number(item.minutesAsleep ?? 0),
        efficiency: Number(item.efficiency ?? 0)
      }
    ])
  );
  const hrvMap = new Map(
    readArray(payload.hrv.hrv).map((item) => [
      String(item.dateTime ?? ""),
      Number(readObject(item.value).dailyRmssd ?? 0)
    ])
  );

  return fallbackByIndex.map((fallback) => {
    const sleepDay = sleepMap.get(fallback.date);
    const sleepHours = sleepDay?.minutesAsleep ? roundOne(sleepDay.minutesAsleep / 60) : fallback.sleepHours;
    const steps = stepMap.get(fallback.date) ?? fallback.steps;
    const restingHeartRate = heartMap.get(fallback.date) || fallback.restingHeartRate;
    const hrvRmssd = hrvMap.get(fallback.date) || fallback.hrvRmssd;

    return {
      ...fallback,
      sleepHours,
      sleepEfficiency: sleepDay?.efficiency || fallback.sleepEfficiency,
      steps,
      restingHeartRate,
      hrvRmssd,
      deviceSyncedAt: new Date().toISOString()
    };
  });
}

function readArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null) : [];
}

function readObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function getFitbitConfig() {
  const clientId = process.env.FITBIT_CLIENT_ID ?? "";
  const clientSecret = process.env.FITBIT_CLIENT_SECRET ?? "";
  const redirectUri = process.env.FITBIT_REDIRECT_URI ?? "http://localhost:8787/fitbit/callback";

  return {
    clientId,
    clientSecret,
    redirectUri,
    configured: Boolean(clientId && clientSecret && redirectUri)
  };
}

function base64Url(value: Buffer) {
  return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}
