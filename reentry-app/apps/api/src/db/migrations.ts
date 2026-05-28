export type Migration = {
  id: string;
  sql: string;
};

export const migrations: Migration[] = [
  {
    id: "001_initial_reentry_schema",
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        pronouns TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      ) STRICT;

      CREATE TABLE IF NOT EXISTS transition_episodes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scenario_pack_id TEXT NOT NULL,
        title TEXT NOT NULL,
        context TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
        started_at TEXT NOT NULL,
        ended_at TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      ) STRICT;

      CREATE TABLE IF NOT EXISTS check_ins (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        episode_id TEXT REFERENCES transition_episodes(id) ON DELETE SET NULL,
        mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 10),
        energy INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 10),
        sleep_hours REAL NOT NULL CHECK (sleep_hours BETWEEN 0 AND 24),
        support_level TEXT NOT NULL CHECK (support_level IN ('steady', 'caution', 'elevated')),
        note TEXT,
        checked_in_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      ) STRICT;

      CREATE TABLE IF NOT EXISTS plan_cards (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        episode_id TEXT REFERENCES transition_episodes(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        archetype TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'done', 'snoozed')),
        due_at TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      ) STRICT;

      CREATE TABLE IF NOT EXISTS support_circle_members (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        relationship TEXT NOT NULL,
        contact_method TEXT NOT NULL CHECK (contact_method IN ('sms', 'email', 'call', 'in-person')),
        contact_value TEXT NOT NULL,
        consent_to_contact INTEGER NOT NULL DEFAULT 1 CHECK (consent_to_contact IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      ) STRICT;

      CREATE TABLE IF NOT EXISTS help_request_drafts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        episode_id TEXT REFERENCES transition_episodes(id) ON DELETE SET NULL,
        support_circle_member_id TEXT REFERENCES support_circle_members(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'sent', 'archived')),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      ) STRICT;

      CREATE TABLE IF NOT EXISTS handoff_notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        episode_id TEXT REFERENCES transition_episodes(id) ON DELETE SET NULL,
        recipient_type TEXT NOT NULL CHECK (recipient_type IN ('clinician', 'trusted-person', 'school-work', 'other')),
        summary TEXT NOT NULL,
        include_recent_checkins INTEGER NOT NULL DEFAULT 1 CHECK (include_recent_checkins IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      ) STRICT;

      CREATE TABLE IF NOT EXISTS event_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        episode_id TEXT REFERENCES transition_episodes(id) ON DELETE SET NULL,
        event_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      ) STRICT;

      CREATE INDEX IF NOT EXISTS idx_transition_episodes_user_id ON transition_episodes(user_id);
      CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
      CREATE INDEX IF NOT EXISTS idx_check_ins_episode_id ON check_ins(episode_id);
      CREATE INDEX IF NOT EXISTS idx_plan_cards_episode_id ON plan_cards(episode_id);
      CREATE INDEX IF NOT EXISTS idx_support_circle_members_user_id ON support_circle_members(user_id);
      CREATE INDEX IF NOT EXISTS idx_help_request_drafts_user_id ON help_request_drafts(user_id);
      CREATE INDEX IF NOT EXISTS idx_handoff_notes_user_id ON handoff_notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_event_logs_user_id ON event_logs(user_id);
    `
  },
  {
    id: "002_check_in_recovery_friction_fields",
    sql: `
      DROP INDEX IF EXISTS idx_check_ins_user_id;
      DROP INDEX IF EXISTS idx_check_ins_episode_id;

      ALTER TABLE check_ins RENAME TO check_ins_old;

      CREATE TABLE check_ins (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        episode_id TEXT REFERENCES transition_episodes(id) ON DELETE SET NULL,
        energy INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 5),
        sleep_quality INTEGER NOT NULL CHECK (sleep_quality BETWEEN 1 AND 5),
        cognitive_load INTEGER NOT NULL CHECK (cognitive_load BETWEEN 1 AND 5),
        social_load INTEGER NOT NULL CHECK (social_load BETWEEN 1 AND 5),
        body_state_tags_json TEXT NOT NULL DEFAULT '[]',
        practical_blocker_tags_json TEXT NOT NULL DEFAULT '[]',
        standwise_flags_json TEXT NOT NULL DEFAULT '[]',
        note TEXT,
        recovery_friction_score INTEGER NOT NULL CHECK (recovery_friction_score BETWEEN 0 AND 100),
        recovery_mode TEXT NOT NULL CHECK (
          recovery_mode IN ('stabilize', 'ask-help', 'routine-restart', 'escalate-human')
        ),
        top_blockers_json TEXT NOT NULL DEFAULT '[]',
        confidence REAL NOT NULL CHECK (confidence BETWEEN 0 AND 1),
        evidence_json TEXT NOT NULL DEFAULT '[]',
        checked_in_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      ) STRICT;

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
      SELECT
        id,
        user_id,
        episode_id,
        CASE WHEN energy > 5 THEN 5 WHEN energy < 1 THEN 1 ELSE energy END,
        CASE
          WHEN sleep_hours >= 8 THEN 5
          WHEN sleep_hours >= 6.5 THEN 4
          WHEN sleep_hours >= 5 THEN 3
          WHEN sleep_hours >= 3 THEN 2
          ELSE 1
        END,
        3,
        3,
        '[]',
        '[]',
        '[]',
        note,
        CASE
          WHEN support_level = 'elevated' THEN 68
          WHEN support_level = 'caution' THEN 42
          ELSE 22
        END,
        CASE
          WHEN support_level = 'elevated' THEN 'ask-help'
          WHEN support_level = 'caution' THEN 'stabilize'
          ELSE 'routine-restart'
        END,
        '[]',
        0.72,
        '["Migrated from the original check-in shape."]',
        checked_in_at,
        created_at
      FROM check_ins_old;

      DROP TABLE check_ins_old;

      CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
      CREATE INDEX IF NOT EXISTS idx_check_ins_episode_id ON check_ins(episode_id);
    `
  },
  {
    id: "003_support_circle_permissions",
    sql: `
      ALTER TABLE support_circle_members
        ADD COLUMN preferred_channel TEXT NOT NULL DEFAULT 'sms'
        CHECK (preferred_channel IN ('sms', 'email', 'call', 'in-person'));

      ALTER TABLE support_circle_members
        ADD COLUMN what_they_can_help_with_json TEXT NOT NULL DEFAULT '[]';

      ALTER TABLE support_circle_members
        ADD COLUMN what_should_not_be_shared_json TEXT NOT NULL DEFAULT '[]';

      ALTER TABLE support_circle_members
        ADD COLUMN tone_preference TEXT NOT NULL DEFAULT 'warm'
        CHECK (tone_preference IN ('warm', 'brief', 'direct', 'gentle'));

      ALTER TABLE support_circle_members
        ADD COLUMN emergency_only INTEGER NOT NULL DEFAULT 0 CHECK (emergency_only IN (0, 1));

      UPDATE support_circle_members
      SET preferred_channel = contact_method
      WHERE preferred_channel = 'sms';
    `
  }
];
