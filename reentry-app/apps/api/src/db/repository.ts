import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { scoreCheckIn, type SharingTopic, type SupportCircleProfile } from "@reentry/shared";
import type {
  CreateCheckInInput,
  CreateEpisodeInput,
  CreateHandoffNoteInput,
  CreateHelpRequestDraftInput,
  CreateSupportCircleMemberInput,
  UpdateSupportCircleMemberInput
} from "../schemas.js";

type CountRow = { count: number };

export function getDatabaseCounts(db: DatabaseSync) {
  const count = (table: string) =>
    (db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as CountRow).count;

  return {
    users: count("users"),
    transitionEpisodes: count("transition_episodes"),
    checkIns: count("check_ins"),
    planCards: count("plan_cards"),
    supportCircleMembers: count("support_circle_members"),
    helpRequestDrafts: count("help_request_drafts"),
    handoffNotes: count("handoff_notes"),
    eventLogs: count("event_logs")
  };
}

export function getUser(db: DatabaseSync, userId: string) {
  return db
    .prepare(
      `
        SELECT
          id,
          email,
          display_name AS displayName,
          pronouns,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM users
        WHERE id = ?
      `
    )
    .get(userId);
}

export function listEpisodes(db: DatabaseSync, userId: string) {
  return db
    .prepare(
      `
        SELECT
          id,
          user_id AS userId,
          scenario_pack_id AS scenarioPackId,
          title,
          context,
          status,
          started_at AS startedAt,
          ended_at AS endedAt,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM transition_episodes
        WHERE user_id = ?
        ORDER BY started_at DESC
      `
    )
    .all(userId);
}

export function createEpisode(db: DatabaseSync, input: CreateEpisodeInput) {
  const now = new Date().toISOString();
  const id = `episode_${randomUUID()}`;

  db.prepare(
    `
      INSERT INTO transition_episodes (
        id,
        user_id,
        scenario_pack_id,
        title,
        context,
        status,
        started_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    id,
    input.userId,
    input.scenarioPackId,
    input.title,
    input.context,
    input.status ?? "active",
    input.startedAt ?? now,
    now,
    now
  );

  logEvent(db, {
    userId: input.userId,
    episodeId: id,
    eventType: "created",
    entityType: "transition_episode",
    entityId: id,
    metadata: { scenarioPackId: input.scenarioPackId }
  });

  return db
    .prepare(
      `
        SELECT
          id,
          user_id AS userId,
          scenario_pack_id AS scenarioPackId,
          title,
          context,
          status,
          started_at AS startedAt,
          ended_at AS endedAt,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM transition_episodes
        WHERE id = ?
      `
    )
    .get(id);
}

export function listCheckIns(db: DatabaseSync, episodeId: string) {
  const rows = db
    .prepare(
      `
        SELECT
          id,
          user_id AS userId,
          episode_id AS episodeId,
          energy,
          sleep_quality AS sleepQuality,
          cognitive_load AS cognitiveLoad,
          social_load AS socialLoad,
          body_state_tags_json AS bodyStateTagsJson,
          practical_blocker_tags_json AS practicalBlockerTagsJson,
          standwise_flags_json AS standWiseFlagsJson,
          note,
          recovery_friction_score AS recoveryFrictionScore,
          recovery_mode AS mode,
          top_blockers_json AS topBlockersJson,
          confidence,
          evidence_json AS evidenceJson,
          checked_in_at AS checkedInAt,
          created_at AS createdAt
        FROM check_ins
        WHERE episode_id = ?
        ORDER BY checked_in_at DESC
      `
    )
    .all(episodeId);

  return rows.map(normalizeCheckInRow);
}

export function createCheckIn(db: DatabaseSync, input: CreateCheckInInput) {
  const now = new Date().toISOString();
  const id = `checkin_${randomUUID()}`;
  const score = scoreCheckIn(input);

  db.prepare(
    `
      INSERT INTO check_ins (
        id,
        user_id,
        episode_id,
        energy,
        sleep_quality,
        cognitive_load,
        social_load,
        body_state_tags_json,
        practical_blocker_tags_json,
        standwise_flags_json,
        note,
        recovery_friction_score,
        recovery_mode,
        top_blockers_json,
        confidence,
        evidence_json,
        checked_in_at,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    id,
    input.userId,
    input.episodeId ?? null,
    input.energy,
    input.sleepQuality,
    input.cognitiveLoad,
    input.socialLoad,
    JSON.stringify(input.bodyStateTags),
    JSON.stringify(input.practicalBlockerTags),
    JSON.stringify(input.standWiseFlags ?? []),
    input.note ?? null,
    score.recoveryFrictionScore,
    score.mode,
    JSON.stringify(score.topBlockers),
    score.confidence,
    JSON.stringify(score.evidence),
    input.checkedInAt ?? now,
    now
  );

  logEvent(db, {
    userId: input.userId,
    episodeId: input.episodeId ?? null,
    eventType: "created",
    entityType: "check_in",
    entityId: id,
    metadata: { recoveryFrictionScore: score.recoveryFrictionScore, mode: score.mode }
  });

  const row = db
    .prepare(
      `
        SELECT
          id,
          user_id AS userId,
          episode_id AS episodeId,
          energy,
          sleep_quality AS sleepQuality,
          cognitive_load AS cognitiveLoad,
          social_load AS socialLoad,
          body_state_tags_json AS bodyStateTagsJson,
          practical_blocker_tags_json AS practicalBlockerTagsJson,
          standwise_flags_json AS standWiseFlagsJson,
          note,
          recovery_friction_score AS recoveryFrictionScore,
          recovery_mode AS mode,
          top_blockers_json AS topBlockersJson,
          confidence,
          evidence_json AS evidenceJson,
          checked_in_at AS checkedInAt,
          created_at AS createdAt
        FROM check_ins
        WHERE id = ?
      `
    )
    .get(id);

  return normalizeCheckInRow(row);
}

type StoredSupportCircleMember = SupportCircleProfile & {
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export function listSupportCircleMembers(db: DatabaseSync, userId: string) {
  const rows = db
    .prepare(
      `
        SELECT
          id,
          user_id AS userId,
          name,
          role,
          preferred_channel AS preferredChannel,
          what_they_can_help_with_json AS whatTheyCanHelpWithJson,
          what_should_not_be_shared_json AS whatShouldNotBeSharedJson,
          tone_preference AS tonePreference,
          emergency_only AS emergencyOnly,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM support_circle_members
        WHERE user_id = ?
        ORDER BY name ASC
      `
    )
    .all(userId);

  return rows.map(normalizeSupportCircleMemberRow);
}

export function getSupportCircleMember(db: DatabaseSync, memberId: string) {
  const row = db
    .prepare(
      `
        SELECT
          id,
          user_id AS userId,
          name,
          role,
          preferred_channel AS preferredChannel,
          what_they_can_help_with_json AS whatTheyCanHelpWithJson,
          what_should_not_be_shared_json AS whatShouldNotBeSharedJson,
          tone_preference AS tonePreference,
          emergency_only AS emergencyOnly,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM support_circle_members
        WHERE id = ?
      `
    )
    .get(memberId);

  return row ? normalizeSupportCircleMemberRow(row) : undefined;
}

export function createSupportCircleMember(db: DatabaseSync, input: CreateSupportCircleMemberInput) {
  const now = new Date().toISOString();
  const id = `scm_${randomUUID()}`;

  db.prepare(
    `
      INSERT INTO support_circle_members (
        id,
        user_id,
        name,
        role,
        relationship,
        contact_method,
        contact_value,
        consent_to_contact,
        preferred_channel,
        what_they_can_help_with_json,
        what_should_not_be_shared_json,
        tone_preference,
        emergency_only,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, '', 1, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    id,
    input.userId,
    input.name,
    input.role,
    input.role,
    input.preferredChannel,
    input.preferredChannel,
    JSON.stringify(input.whatTheyCanHelpWith),
    JSON.stringify(input.whatShouldNotBeShared),
    input.tonePreference,
    input.emergencyOnly ? 1 : 0,
    now,
    now
  );

  logEvent(db, {
    userId: input.userId,
    episodeId: null,
    eventType: "created",
    entityType: "support_circle_member",
    entityId: id,
    metadata: { preferredChannel: input.preferredChannel }
  });

  return getSupportCircleMember(db, id);
}

export function updateSupportCircleMember(
  db: DatabaseSync,
  memberId: string,
  input: UpdateSupportCircleMemberInput
) {
  const existing = getSupportCircleMember(db, memberId) as
    | (StoredSupportCircleMember & { userId: string })
    | undefined;
  if (!existing) return undefined;

  const merged = {
    ...existing,
    ...input
  };
  const now = new Date().toISOString();

  db.prepare(
    `
      UPDATE support_circle_members
      SET
        name = ?,
        role = ?,
        relationship = ?,
        contact_method = ?,
        preferred_channel = ?,
        what_they_can_help_with_json = ?,
        what_should_not_be_shared_json = ?,
        tone_preference = ?,
        emergency_only = ?,
        updated_at = ?
      WHERE id = ?
    `
  ).run(
    merged.name,
    merged.role,
    merged.role,
    merged.preferredChannel,
    merged.preferredChannel,
    JSON.stringify(merged.whatTheyCanHelpWith),
    JSON.stringify(merged.whatShouldNotBeShared),
    merged.tonePreference,
    merged.emergencyOnly ? 1 : 0,
    now,
    memberId
  );

  logEvent(db, {
    userId: existing.userId,
    episodeId: null,
    eventType: "updated",
    entityType: "support_circle_member",
    entityId: memberId,
    metadata: { fields: Object.keys(input) }
  });

  return getSupportCircleMember(db, memberId);
}

export function deleteSupportCircleMember(db: DatabaseSync, memberId: string) {
  const existing = getSupportCircleMember(db, memberId) as { userId: string } | undefined;
  if (!existing) return false;

  db.prepare("DELETE FROM support_circle_members WHERE id = ?").run(memberId);
  logEvent(db, {
    userId: existing.userId,
    episodeId: null,
    eventType: "deleted",
    entityType: "support_circle_member",
    entityId: memberId,
    metadata: {}
  });

  return true;
}

export function createHelpRequestDraft(db: DatabaseSync, input: CreateHelpRequestDraftInput) {
  const now = new Date().toISOString();
  const id = `help_${randomUUID()}`;

  db.prepare(
    `
      INSERT INTO help_request_drafts (
        id,
        user_id,
        episode_id,
        support_circle_member_id,
        title,
        message,
        urgency,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)
    `
  ).run(
    id,
    input.userId,
    input.episodeId ?? null,
    input.supportCircleMemberId ?? null,
    input.title,
    input.message,
    input.urgency,
    now,
    now
  );

  logEvent(db, {
    userId: input.userId,
    episodeId: input.episodeId ?? null,
    eventType: "created",
    entityType: "help_request_draft",
    entityId: id,
    metadata: { urgency: input.urgency }
  });

  return db
    .prepare(
      `
        SELECT
          id,
          user_id AS userId,
          episode_id AS episodeId,
          support_circle_member_id AS supportCircleMemberId,
          title,
          message,
          urgency,
          status,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM help_request_drafts
        WHERE id = ?
      `
    )
    .get(id);
}

export function createHandoffNote(db: DatabaseSync, input: CreateHandoffNoteInput) {
  const now = new Date().toISOString();
  const id = `handoff_${randomUUID()}`;

  db.prepare(
    `
      INSERT INTO handoff_notes (
        id,
        user_id,
        episode_id,
        recipient_type,
        summary,
        include_recent_checkins,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    id,
    input.userId,
    input.episodeId ?? null,
    input.recipientType,
    input.summary,
    input.includeRecentCheckins === false ? 0 : 1,
    now
  );

  logEvent(db, {
    userId: input.userId,
    episodeId: input.episodeId ?? null,
    eventType: "created",
    entityType: "handoff_note",
    entityId: id,
    metadata: { recipientType: input.recipientType }
  });

  return db
    .prepare(
      `
        SELECT
          id,
          user_id AS userId,
          episode_id AS episodeId,
          recipient_type AS recipientType,
          summary,
          include_recent_checkins AS includeRecentCheckins,
          created_at AS createdAt
        FROM handoff_notes
        WHERE id = ?
      `
    )
    .get(id);
}

export function listEventLogs(db: DatabaseSync, userId: string) {
  return db
    .prepare(
      `
        SELECT
          id,
          user_id AS userId,
          episode_id AS episodeId,
          event_type AS eventType,
          entity_type AS entityType,
          entity_id AS entityId,
          metadata_json AS metadataJson,
          created_at AS createdAt
        FROM event_logs
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 100
      `
    )
    .all(userId);
}

export function getUserHistory(db: DatabaseSync, userId: string) {
  const episodes = db
    .prepare(
      `
        SELECT
          id,
          scenario_pack_id AS scenarioPackId,
          title,
          context,
          status,
          started_at AS startedAt,
          ended_at AS endedAt
        FROM transition_episodes
        WHERE user_id = ?
        ORDER BY started_at DESC
      `
    )
    .all(userId) as Array<{
      id: string;
      scenarioPackId: string;
      title: string;
      context: string;
      status: string;
      startedAt: string;
      endedAt: string | null;
    }>;

  const trend = db
    .prepare(
      `
        SELECT
          id,
          episode_id AS episodeId,
          checked_in_at AS checkedInAt,
          recovery_friction_score AS recoveryFrictionScore,
          recovery_mode AS mode
        FROM check_ins
        WHERE user_id = ?
        ORDER BY checked_in_at ASC
      `
    )
    .all(userId) as Array<{
      id: string;
      episodeId: string | null;
      checkedInAt: string;
      recoveryFrictionScore: number;
      mode: string;
    }>;

  const completedActions = db
    .prepare(
      `
        SELECT
          id,
          episode_id AS episodeId,
          title,
          archetype AS kind,
          updated_at AS completedAt
        FROM plan_cards
        WHERE user_id = ? AND status = 'done'
        ORDER BY updated_at DESC
      `
    )
    .all(userId) as Array<{
      id: string;
      episodeId: string | null;
      title: string;
      kind: string;
      completedAt: string;
    }>;

  const latestScoreByEpisode = new Map<string, number>();
  for (const point of [...trend].reverse()) {
    if (point.episodeId && !latestScoreByEpisode.has(point.episodeId)) {
      latestScoreByEpisode.set(point.episodeId, point.recoveryFrictionScore);
    }
  }

  const actionsByEpisode = new Map<string, typeof completedActions>();
  for (const action of completedActions) {
    if (!action.episodeId) continue;
    const current = actionsByEpisode.get(action.episodeId) ?? [];
    current.push(action);
    actionsByEpisode.set(action.episodeId, current);
  }

  return {
    episodes: episodes.map((episode) => ({
      ...episode,
      latestRecoveryFrictionScore: latestScoreByEpisode.get(episode.id) ?? null,
      completedActions: actionsByEpisode.get(episode.id) ?? []
    })),
    trend
  };
}

function logEvent(
  db: DatabaseSync,
  input: {
    userId: string;
    episodeId: string | null;
    eventType: string;
    entityType: string;
    entityId: string;
    metadata: Record<string, unknown>;
  }
) {
  db.prepare(
    `
      INSERT INTO event_logs (
        id,
        user_id,
        episode_id,
        event_type,
        entity_type,
        entity_id,
        metadata_json,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    `event_${randomUUID()}`,
    input.userId,
    input.episodeId,
    input.eventType,
    input.entityType,
    input.entityId,
    JSON.stringify(input.metadata),
    new Date().toISOString()
  );
}

function normalizeCheckInRow(row: unknown) {
  const checkIn = row as {
    bodyStateTagsJson: string;
    practicalBlockerTagsJson: string;
    standWiseFlagsJson: string;
    topBlockersJson: string;
    evidenceJson: string;
  } & Record<string, unknown>;

  return {
    ...checkIn,
    bodyStateTags: parseJsonArray(checkIn.bodyStateTagsJson),
    practicalBlockerTags: parseJsonArray(checkIn.practicalBlockerTagsJson),
    standWiseFlags: parseJsonArray(checkIn.standWiseFlagsJson),
    topBlockers: parseJsonArray(checkIn.topBlockersJson),
    evidence: parseJsonArray(checkIn.evidenceJson),
    bodyStateTagsJson: undefined,
    practicalBlockerTagsJson: undefined,
    standWiseFlagsJson: undefined,
    topBlockersJson: undefined,
    evidenceJson: undefined
  };
}

function normalizeSupportCircleMemberRow(row: unknown): StoredSupportCircleMember {
  const member = row as {
    id: string;
    userId: string;
    name: string;
    role: string;
    preferredChannel: SupportCircleProfile["preferredChannel"];
    whatTheyCanHelpWithJson: string;
    whatShouldNotBeSharedJson: string;
    tonePreference: SupportCircleProfile["tonePreference"];
    emergencyOnly: number;
    createdAt: string;
    updatedAt: string;
  };

  return {
    id: member.id,
    userId: member.userId,
    name: member.name,
    role: member.role,
    preferredChannel: member.preferredChannel,
    whatTheyCanHelpWith: parseJsonArray<string>(member.whatTheyCanHelpWithJson),
    whatShouldNotBeShared: parseJsonArray<SharingTopic>(member.whatShouldNotBeSharedJson),
    tonePreference: member.tonePreference,
    emergencyOnly: Boolean(member.emergencyOnly),
    createdAt: member.createdAt,
    updatedAt: member.updatedAt
  };
}

function parseJsonArray<T = unknown>(value: string): T[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
