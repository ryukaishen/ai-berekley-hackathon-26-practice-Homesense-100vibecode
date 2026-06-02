import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, ClipboardCheck, LockKeyhole, ShieldCheck, Users } from "lucide-react";
import {
  ageRangeOptions,
  buildOnboardingRecommendation,
  livingSituationOptions,
  recoveryFrictionDefinition,
  recoveryFrictionDomains,
  recoveryTracks,
  schoolWorkStatusOptions,
  sharingTopicOptions,
  supportAvailabilityOptions,
  tonePreferenceOptions,
  type RecoveryOnboardingProfile,
  type SharingTopic
} from "@reentry/shared";
import { Button, PageHeader, SurfaceCard } from "@reentry/ui";

const initialProfile: RecoveryOnboardingProfile = {
  ageRange: "18-24",
  schoolWorkStatus: "college",
  livingSituation: "campus-housing",
  primaryTrackId: "new-diabetes-diagnosis",
  supportAvailability: "some",
  hasWearable: true,
  dataUseConsent: true,
  caregiverShareConsent: false,
  clinicianSummaryConsent: true,
  privacyBoundaries: ["meds", "family"],
  preferredTone: "warm"
};

export function OnboardingPage() {
  const [profile, setProfile] = useState<RecoveryOnboardingProfile>(initialProfile);
  const [status, setStatus] = useState("Setup preview ready. Nothing is shared unless you opt in.");
  const recommendation = useMemo(() => buildOnboardingRecommendation(profile), [profile]);

  const updateProfile = <Key extends keyof RecoveryOnboardingProfile>(
    key: Key,
    value: RecoveryOnboardingProfile[Key]
  ) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const togglePrivacyBoundary = (topic: SharingTopic) => {
    setProfile((current) => ({
      ...current,
      privacyBoundaries: current.privacyBoundaries.includes(topic)
        ? current.privacyBoundaries.filter((item) => item !== topic)
        : [...current.privacyBoundaries, topic]
    }));
  };

  const saveSetup = () => {
    window.localStorage.setItem(
      "reentry-onboarding-profile",
      JSON.stringify({ profile, recommendation, savedAt: new Date().toISOString() })
    );
    setStatus("Recovery setup saved locally. The Fitbit/recovery workflow can now use this context.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Onboarding"
        title="Make ReEntry specific before it starts giving support"
        subtitle="This setup captures age range, school/work context, recovery track, support availability, and privacy boundaries before any wearable or AI workflow runs."
        action={
          <div className="action-row">
            <Button onClick={saveSetup}>
              <ClipboardCheck aria-hidden="true" size={16} />
              Generate recovery setup
            </Button>
            <Link className="focus-ring re-btn re-btn-ghost" to="/fitbit">
              Continue to Fitbit demo
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        }
      />

      <section className="onboarding-layout">
        <SurfaceCard title="Recovery profile" subtitle="Used for routing and tone, not diagnosis.">
          <div className="onboarding-form-grid">
            <label className="app-field">
              <span>Age range</span>
              <select
                value={profile.ageRange}
                onChange={(event) => updateProfile("ageRange", event.target.value as RecoveryOnboardingProfile["ageRange"])}
              >
                {ageRangeOptions.map((option) => (
                  <option key={option} value={option}>{formatLabel(option)}</option>
                ))}
              </select>
            </label>

            <label className="app-field">
              <span>School / work status</span>
              <select
                value={profile.schoolWorkStatus}
                onChange={(event) =>
                  updateProfile("schoolWorkStatus", event.target.value as RecoveryOnboardingProfile["schoolWorkStatus"])
                }
              >
                {schoolWorkStatusOptions.map((option) => (
                  <option key={option} value={option}>{formatLabel(option)}</option>
                ))}
              </select>
            </label>

            <label className="app-field">
              <span>Living situation</span>
              <select
                value={profile.livingSituation}
                onChange={(event) =>
                  updateProfile("livingSituation", event.target.value as RecoveryOnboardingProfile["livingSituation"])
                }
              >
                {livingSituationOptions.map((option) => (
                  <option key={option} value={option}>{formatLabel(option)}</option>
                ))}
              </select>
            </label>

            <label className="app-field">
              <span>Support availability</span>
              <select
                value={profile.supportAvailability}
                onChange={(event) =>
                  updateProfile("supportAvailability", event.target.value as RecoveryOnboardingProfile["supportAvailability"])
                }
              >
                {supportAvailabilityOptions.map((option) => (
                  <option key={option} value={option}>{formatLabel(option)}</option>
                ))}
              </select>
            </label>

            <label className="app-field">
              <span>Preferred tone</span>
              <select
                value={profile.preferredTone}
                onChange={(event) =>
                  updateProfile("preferredTone", event.target.value as RecoveryOnboardingProfile["preferredTone"])
                }
              >
                {tonePreferenceOptions.map((option) => (
                  <option key={option} value={option}>{formatLabel(option)}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="onboarding-track-grid" aria-label="Recovery track">
            {recoveryTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className={`onboarding-track-card focus-ring ${track.id === profile.primaryTrackId ? "onboarding-track-card-active" : ""}`}
                aria-pressed={track.id === profile.primaryTrackId}
                onClick={() => updateProfile("primaryTrackId", track.id)}
              >
                <span>{track.audience}</span>
                <strong>{track.title}</strong>
                <small>{track.context}</small>
              </button>
            ))}
          </div>
        </SurfaceCard>

        <aside className="onboarding-side-stack">
          <SurfaceCard title="Consent switches" subtitle="The default posture is permission first.">
            <ToggleRow
              icon={<Activity size={18} />}
              label="Has wearable data"
              checked={profile.hasWearable}
              onChange={(checked) => updateProfile("hasWearable", checked)}
            />
            <ToggleRow
              icon={<ShieldCheck size={18} />}
              label="Use data for scoring"
              checked={profile.dataUseConsent}
              onChange={(checked) => updateProfile("dataUseConsent", checked)}
            />
            <ToggleRow
              icon={<Users size={18} />}
              label="Allow caregiver drafts"
              checked={profile.caregiverShareConsent}
              onChange={(checked) => updateProfile("caregiverShareConsent", checked)}
            />
            <ToggleRow
              icon={<ClipboardCheck size={18} />}
              label="Allow clinician summaries"
              checked={profile.clinicianSummaryConsent}
              onChange={(checked) => updateProfile("clinicianSummaryConsent", checked)}
            />
          </SurfaceCard>

          <SurfaceCard title="Privacy boundaries" subtitle="These topics are blocked from message drafts by default.">
            <div className="scenario-chip-row">
              {sharingTopicOptions.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className={`support-chip-button focus-ring ${profile.privacyBoundaries.includes(topic) ? "support-chip-button-active" : ""}`}
                  aria-pressed={profile.privacyBoundaries.includes(topic)}
                  onClick={() => togglePrivacyBoundary(topic)}
                >
                  {formatLabel(topic)}
                </button>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard title="Friction profile" subtitle="The setup decides which barriers to watch first.">
            <p className="permission-notice">{recoveryFrictionDefinition}</p>
            <div className="onboarding-friction-list">
              {recoveryFrictionDomains.slice(0, 4).map((domain) => (
                <div key={domain.id}>
                  <strong>{domain.title}</strong>
                  <span>{domain.exampleSignals.slice(0, 3).join(", ")}</span>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </aside>
      </section>

      <section className="onboarding-recommendation">
        <SurfaceCard title="Generated recovery setup" subtitle="This is the bridge into the Fitbit and agent workflow.">
          <div className="onboarding-setup-hero">
            <LockKeyhole aria-hidden="true" size={24} />
            <div>
              <p className="re-eyebrow">{recommendation.track.title}</p>
              <h2>{recommendation.audienceFit}</h2>
              <p>{recommendation.careTeamFit}</p>
            </div>
          </div>

          <div className="onboarding-plan-columns">
            <RecommendationList title="Data plan" items={recommendation.dataPlan} />
            <RecommendationList title="Support plan" items={recommendation.supportPlan} />
            <div className="onboarding-recommend-card">
              <h3>Privacy summary</h3>
              <p>{recommendation.privacySummary}</p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard title="Next demo moves" subtitle="A clean path for judges: context, data, model, action.">
          <div className="route-action-list">
            <Link className="route-action" to="/fitbit">
              <Activity aria-hidden="true" size={18} />
              Run Fitbit recovery workflow
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link className="route-action" to="/clinic">
              <Users aria-hidden="true" size={18} />
              Open clinic/campus dashboard
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
          <p className="permission-notice mt-3" role="status">{status}</p>
        </SurfaceCard>
      </section>
    </>
  );
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange
}: {
  icon: ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="onboarding-toggle-row">
      <span>{icon}</span>
      <strong>{label}</strong>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function RecommendationList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="onboarding-recommend-card">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}
