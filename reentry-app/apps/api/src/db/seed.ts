import type { DatabaseSync } from "node:sqlite";
import {
  scoreCheckIn,
  type BodyStateTag,
  type CheckInPayload,
  type PracticalBlockerTag,
  type ScenarioPackId,
  type StandWiseFlag
} from "@reentry/shared";

export const demoUserId = "user_demo_001";

const now = "2026-05-27T12:00:00.000Z";

const supportCircleMembers = [
  {
    id: "scm_demo_maya",
    name: "Maya Chen",
    role: "trusted friend",
    relationship: "roommate",
    contactMethod: "sms",
    contactValue: "+1-555-0142",
    whatTheyCanHelpWith: ["rides", "food", "quick check-ins"],
    whatShouldNotBeShared: ["meds", "family"],
    tonePreference: "warm",
    emergencyOnly: false
  },
  {
    id: "scm_demo_rivera",
    name: "Dr. Rivera",
    role: "clinician",
    relationship: "care team",
    contactMethod: "email",
    contactValue: "rivera@example.test",
    whatTheyCanHelpWith: ["symptom review", "med questions", "appointments"],
    whatShouldNotBeShared: ["money", "family"],
    tonePreference: "direct",
    emergencyOnly: true
  },
  {
    id: "scm_demo_sam",
    name: "Sam Patel",
    role: "accountability buddy",
    relationship: "classmate",
    contactMethod: "call",
    contactValue: "+1-555-0198",
    whatTheyCanHelpWith: ["study sprint", "deadlines", "body doubling"],
    whatShouldNotBeShared: ["health", "meds"],
    tonePreference: "brief",
    emergencyOnly: false
  }
] as const;

const demoEpisodePacks: {
  id: ScenarioPackId;
  title: string;
  context: string;
  demoDetails: string[];
  planArchetypes: { title: string; focus: string }[];
}[] = [
  {
    id: "post-discharge",
    title: "First Week After Discharge",
    context: "A steady landing plan for the first days back home.",
    demoDetails: ["2 appointments this week"],
    planArchetypes: [{ title: "24-hour reset", focus: "Stabilize the next day with existing care reminders, meals, and rest." }]
  },
  {
    id: "post-surgery-return",
    title: "Returning After Surgery",
    context: "A low-pressure return to class or work while the body catches up.",
    demoDetails: ["energy dips after 2pm"],
    planArchetypes: [{ title: "energy budget", focus: "Set a realistic cap for standing, travel, and screen time." }]
  },
  {
    id: "breakup",
    title: "Breakup Stabilizer",
    context: "A short-term plan for emotional spikes and daily functioning.",
    demoDetails: ["hardest window is 10pm-midnight"],
    planArchetypes: [{ title: "no-contact scaffold", focus: "Reduce impulsive contact with replacement actions." }]
  },
  {
    id: "finals-burnout",
    title: "Finals Burnout",
    context: "A realistic plan for pressure, fatigue, and unfinished work.",
    demoDetails: ["3 deadlines before Friday"],
    planArchetypes: [{ title: "two-hour sprint", focus: "Pick one task and create a low-friction start." }]
  },
  {
    id: "new-city-loneliness",
    title: "New City Loneliness",
    context: "A gentle structure for isolation during a big transition.",
    demoDetails: ["Sunday is the loneliest day"],
    planArchetypes: [{ title: "tiny outing", focus: "Choose one nearby place and make leaving home easier." }]
  },
  {
    id: "chronic-flare",
    title: "Bad Health Week",
    context: "A flexible plan for flare days without shame or overreach.",
    demoDetails: ["pain is highest after errands"],
    planArchetypes: [{ title: "minimum viable day", focus: "Keep essentials small enough for low-capacity moments." }]
  }
];

export function seedDemoData(db: DatabaseSync) {
  db.exec("BEGIN");

  try {
    db.prepare(
      `
        INSERT OR IGNORE INTO users (id, email, display_name, pronouns, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `
    ).run(demoUserId, "demo@reentry.local", "Jordan Lee", "they/them", now, now);

    for (const member of supportCircleMembers) {
      db.prepare(
        `
          INSERT OR IGNORE INTO support_circle_members (
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
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
        `
      ).run(
        member.id,
        demoUserId,
        member.name,
        member.role,
        member.relationship,
        member.contactMethod,
        member.contactValue,
        member.contactMethod,
        JSON.stringify(member.whatTheyCanHelpWith),
        JSON.stringify(member.whatShouldNotBeShared),
        member.tonePreference,
        member.emergencyOnly ? 1 : 0,
        now,
        now
      );
    }

    demoEpisodePacks.forEach((pack, index) => {
      const episodeId = `episode_demo_${pack.id}`;
      const demoDetail = pack.demoDetails[0] ?? pack.context;
      const plan = pack.planArchetypes[0] ?? {
        title: "24-hour reset",
        focus: "Choose one realistic action for the next day."
      };
      const day = String(21 + index).padStart(2, "0");
      const bodyStateTags: BodyStateTag[] = index % 2 === 0 ? ["fatigue", "brain-fog"] : ["tension"];
      const practicalBlockerTags: PracticalBlockerTag[] =
        index % 3 === 0 ? ["appointments", "transportation"] : ["deadlines"];
      const standWiseFlags: StandWiseFlag[] = index === 0 ? ["missed-appointment"] : [];
      const checkInPayload: CheckInPayload = {
        energy: Math.max(1, 4 - (index % 4)),
        sleepQuality: Math.max(1, 5 - (index % 3)),
        cognitiveLoad: Math.min(5, 2 + (index % 4)),
        socialLoad: Math.min(5, 2 + (index % 3)),
        bodyStateTags,
        practicalBlockerTags,
        standWiseFlags,
        note: demoDetail
      };
      const score = scoreCheckIn(checkInPayload);

      db.prepare(
        `
          INSERT OR IGNORE INTO transition_episodes (
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
        episodeId,
        demoUserId,
        pack.id,
        pack.title,
        pack.context,
        index < 4 ? "active" : "completed",
        `2026-05-${day}T09:00:00.000Z`,
        now,
        now
      );

      db.prepare(
        `
          INSERT OR IGNORE INTO check_ins (
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
        `checkin_demo_${pack.id}`,
        demoUserId,
        episodeId,
        checkInPayload.energy,
        checkInPayload.sleepQuality,
        checkInPayload.cognitiveLoad,
        checkInPayload.socialLoad,
        JSON.stringify(bodyStateTags),
        JSON.stringify(practicalBlockerTags),
        JSON.stringify(standWiseFlags),
        demoDetail,
        score.recoveryFrictionScore,
        score.mode,
        JSON.stringify(score.topBlockers),
        score.confidence,
        JSON.stringify(score.evidence),
        `2026-05-${day}T18:00:00.000Z`,
        now
      );

      db.prepare(
        `
          INSERT OR IGNORE INTO plan_cards (
            id,
            user_id,
            episode_id,
            title,
            archetype,
            body,
            status,
            due_at,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      ).run(
        `plan_demo_${pack.id}`,
        demoUserId,
        episodeId,
        plan.title,
        plan.title,
        plan.focus,
        index % 2 === 0 ? "done" : "active",
        `2026-05-${day}T21:00:00.000Z`,
        now,
        now
      );

      db.prepare(
        `
          INSERT OR IGNORE INTO event_logs (
            id,
            user_id,
            episode_id,
            event_type,
            entity_type,
            entity_id,
            metadata_json,
            created_at
          )
          VALUES (?, ?, ?, 'seeded', 'transition_episode', ?, ?, ?)
        `
      ).run(
        `event_demo_${pack.id}`,
        demoUserId,
        episodeId,
        episodeId,
        JSON.stringify({ scenarioPackId: pack.id }),
        now
      );
    });

    db.prepare(
      `
        INSERT OR IGNORE INTO help_request_drafts (
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
        VALUES (?, ?, ?, ?, ?, ?, 'medium', 'draft', ?, ?)
      `
    ).run(
      "help_demo_001",
      demoUserId,
      "episode_demo_post-discharge",
      "scm_demo_maya",
      "Ride and check-in help",
      "Could you help me get to my follow-up appointment and check in that evening?",
      now,
      now
    );

    db.prepare(
      `
        INSERT OR IGNORE INTO handoff_notes (
          id,
          user_id,
          episode_id,
          recipient_type,
          summary,
          include_recent_checkins,
          created_at
        )
        VALUES (?, ?, ?, 'clinician', ?, 1, ?)
      `
    ).run(
      "handoff_demo_001",
      demoUserId,
      "episode_demo_post-discharge",
      "Jordan is tracking sleep, medication routine, and appointment logistics after discharge.",
      now
    );

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return {
    demoUserId,
    episodes: demoEpisodePacks.length,
    supportCircleMembers: supportCircleMembers.length
  };
}
