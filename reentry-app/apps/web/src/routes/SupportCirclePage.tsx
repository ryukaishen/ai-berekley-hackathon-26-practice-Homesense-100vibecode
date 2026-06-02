import { useMemo, useState } from "react";
import { Copy, Mail, MessageSquare, Plus, Save, Trash2, type LucideIcon } from "lucide-react";
import {
  composeHelpRequest,
  sharingTopicOptions,
  tonePreferenceOptions,
  type HelpRequestComposerOutput,
  type SharingTopic,
  type SupportChannel,
  type SupportCircleProfile,
} from "@reentry/shared";
import { Button, PageHeader, SurfaceCard } from "@reentry/ui";

const demoMembers: SupportCircleProfile[] = [
  {
    id: "scm_demo_maya",
    name: "Maya Chen",
    role: "trusted friend",
    preferredChannel: "sms",
    whatTheyCanHelpWith: ["rides", "food", "quick check-ins"],
    whatShouldNotBeShared: ["meds", "family"],
    tonePreference: "warm",
    emergencyOnly: false
  },
  {
    id: "scm_demo_rivera",
    name: "Dr. Rivera",
    role: "clinician",
    preferredChannel: "email",
    whatTheyCanHelpWith: ["symptom review", "appointments"],
    whatShouldNotBeShared: ["money", "family"],
    tonePreference: "direct",
    emergencyOnly: true
  },
  {
    id: "scm_demo_sam",
    name: "Sam Patel",
    role: "accountability buddy",
    preferredChannel: "call",
    whatTheyCanHelpWith: ["study sprint", "deadlines"],
    whatShouldNotBeShared: ["health", "meds"],
    tonePreference: "brief",
    emergencyOnly: false
  }
];

const supportChannelOptions: SupportChannel[] = ["sms", "email", "call", "in-person"];
const urgencyOptions: Array<"low" | "medium" | "high" | "emergency"> = ["low", "medium", "high", "emergency"];

const blankMember: Omit<SupportCircleProfile, "id"> = {
  name: "",
  role: "",
  preferredChannel: "sms",
  whatTheyCanHelpWith: [],
  whatShouldNotBeShared: [],
  tonePreference: "warm",
  emergencyOnly: false
};

export function SupportCirclePage() {
  const [members, setMembers] = useState<SupportCircleProfile[]>(demoMembers);
  const [selectedId, setSelectedId] = useState(demoMembers[0]!.id);
  const [form, setForm] = useState<Omit<SupportCircleProfile, "id">>(blankMember);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [need, setNeed] = useState("I am having a high-friction day and need one concrete assist.");
  const [requestedHelp, setRequestedHelp] = useState("checking in after dinner");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "emergency">("medium");
  const [shareTopics, setShareTopics] = useState<SharingTopic[]>(["emotions", "appointments"]);
  const [copyOnly, setCopyOnly] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const selectedMember = members.find((member) => member.id === selectedId) ?? members[0];
  const draft = useMemo<HelpRequestComposerOutput | null>(() => {
    if (!selectedMember) return null;
    return composeHelpRequest({
      member: selectedMember,
      need,
      requestedHelp,
      urgency,
      shareTopics,
      noSendJustCopy: copyOnly
    });
  }, [copyOnly, need, requestedHelp, selectedMember, shareTopics, urgency]);

  const saveMember = () => {
    if (!form.name.trim() || !form.role.trim()) return;

    if (editingId) {
      setMembers((current) =>
        current.map((member) => (member.id === editingId ? { ...member, ...form } : member))
      );
      setEditingId(null);
    } else {
      const newMember = { ...form, id: `scm_${crypto.randomUUID()}` };
      setMembers((current) => [...current, newMember]);
      setSelectedId(newMember.id);
    }

    setForm(blankMember);
  };

  const editMember = (member: SupportCircleProfile) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      role: member.role,
      preferredChannel: member.preferredChannel,
      whatTheyCanHelpWith: member.whatTheyCanHelpWith,
      whatShouldNotBeShared: member.whatShouldNotBeShared,
      tonePreference: member.tonePreference,
      emergencyOnly: member.emergencyOnly
    });
  };

  const deleteMember = (memberId: string) => {
    setMembers((current) => current.filter((member) => member.id !== memberId));
    if (selectedId === memberId) {
      setSelectedId(members.find((member) => member.id !== memberId)?.id ?? "");
    }
  };

  const copyDraft = async (label: string, value: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(label);
  };

  return (
    <>
      <PageHeader
        eyebrow="Support Circle"
        title="Keep support clear before you need it"
        subtitle="Manage who can help, what they should know, and what should stay private."
      />

      <div className="support-layout">
        <section className="support-member-grid" aria-label="Support-circle members">
          {members.map((member) => (
            <article
              key={member.id}
              className={`support-member-card ${member.id === selectedId ? "support-member-card-active" : ""}`}
            >
              <button type="button" className="support-member-main focus-ring" onClick={() => setSelectedId(member.id)}>
                <span>
                  <strong>{member.name}</strong>
                  <small>{member.role}</small>
                </span>
                <span className="support-channel">{member.preferredChannel}</span>
              </button>
              <div className="support-chip-row">
                {member.whatTheyCanHelpWith.map((item) => (
                  <span key={item} className="support-chip">{item}</span>
                ))}
              </div>
              <p className="support-private">
                Do not share: {member.whatShouldNotBeShared.map(formatLabel).join(", ") || "none set"}
              </p>
              <div className="support-card-actions">
                <Button variant="ghost" onClick={() => editMember(member)}>Edit</Button>
                <Button variant="ghost" onClick={() => deleteMember(member.id)}>
                  <Trash2 aria-hidden="true" size={15} />
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </section>

        <section className="support-workbench">
          <SurfaceCard title={editingId ? "Edit member" : "Add member"} subtitle="Set boundaries and preferred contact style.">
            <div className="support-form-grid">
              <TextInput label="Name" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} />
              <TextInput label="Role" value={form.role} onChange={(role) => setForm((current) => ({ ...current, role }))} />
              <SelectInput
                label="Preferred channel"
                value={form.preferredChannel}
                options={supportChannelOptions}
                onChange={(preferredChannel) => setForm((current) => ({ ...current, preferredChannel }))}
              />
              <SelectInput
                label="Tone preference"
                value={form.tonePreference}
                options={tonePreferenceOptions}
                onChange={(tonePreference) => setForm((current) => ({ ...current, tonePreference }))}
              />
            </div>
            <TagTextInput
              label="What they can help with"
              value={form.whatTheyCanHelpWith}
              onChange={(whatTheyCanHelpWith) => setForm((current) => ({ ...current, whatTheyCanHelpWith }))}
            />
            <SharingTopicPicker
              title="What should not be shared"
              selected={form.whatShouldNotBeShared}
              onToggle={(topic) =>
                setForm((current) => ({
                  ...current,
                  whatShouldNotBeShared: toggleValue(current.whatShouldNotBeShared, topic)
                }))
              }
            />
            <label className="support-checkbox">
              <input
                type="checkbox"
                checked={form.emergencyOnly}
                onChange={(event) => setForm((current) => ({ ...current, emergencyOnly: event.target.checked }))}
              />
              Emergency-only contact
            </label>
            <Button onClick={saveMember}>
              {editingId ? <Save aria-hidden="true" size={16} /> : <Plus aria-hidden="true" size={16} />}
              {editingId ? "Save changes" : "Add member"}
            </Button>
          </SurfaceCard>

          <SurfaceCard title="Help-request composer" subtitle="Drafts follow the selected member's sharing rules.">
            {selectedMember ? (
              <>
                <div className="support-form-grid">
                  <TextInput label="Need" value={need} onChange={setNeed} />
                  <TextInput label="Requested help" value={requestedHelp} onChange={setRequestedHelp} />
                  <SelectInput
                    label="Urgency"
                    value={urgency}
                    options={urgencyOptions}
                    onChange={setUrgency}
                  />
                </div>
                <SharingTopicPicker
                  title="Topics to include"
                  selected={shareTopics}
                  onToggle={(topic) => setShareTopics((current) => toggleValue(current, topic))}
                />
                <label className="support-checkbox">
                  <input type="checkbox" checked={copyOnly} onChange={(event) => setCopyOnly(event.target.checked)} />
                  No send, just copy
                </label>
                {draft ? (
                  <div className="draft-grid">
                    <DraftBox
                      title="Short SMS-style draft"
                      icon={MessageSquare}
                      value={draft.shortSmsDraft}
                      onCopy={() => copyDraft("SMS draft", draft.shortSmsDraft)}
                    />
                    <DraftBox
                      title="Fuller text or email draft"
                      icon={Mail}
                      value={draft.fullerDraft}
                      onCopy={() => copyDraft("Full draft", draft.fullerDraft)}
                    />
                    <p className="permission-notice">{draft.permissionNotice}</p>
                    {draft.noSendJustCopy ? <p className="permission-notice">Prepared as copy-only.</p> : null}
                    {copied ? <p className="permission-notice" role="status">{copied} copied.</p> : null}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="re-meta">Add a member before composing a request.</p>
            )}
          </SurfaceCard>
        </section>
      </div>
    </>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="support-field">
      <span>{label}</span>
      <input className="focus-ring" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectInput<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="support-field">
      <span>{label}</span>
      <select className="focus-ring" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>{formatLabel(option)}</option>
        ))}
      </select>
    </label>
  );
}

function TagTextInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <label className="support-field">
      <span>{label}</span>
      <input
        className="focus-ring"
        value={value.join(", ")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          )
        }
      />
    </label>
  );
}

function SharingTopicPicker({
  title,
  selected,
  onToggle
}: {
  title: string;
  selected: SharingTopic[];
  onToggle: (topic: SharingTopic) => void;
}) {
  return (
    <section className="support-topic-picker">
      <h3>{title}</h3>
      <div className="support-chip-row">
        {sharingTopicOptions.map((topic) => {
          const active = selected.includes(topic);
          return (
            <button
              key={topic}
              type="button"
              className={`support-chip-button focus-ring ${active ? "support-chip-button-active" : ""}`}
              aria-pressed={active}
              onClick={() => onToggle(topic)}
            >
              {formatLabel(topic)}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DraftBox({
  title,
  icon: Icon,
  value,
  onCopy
}: {
  title: string;
  icon: LucideIcon;
  value: string;
  onCopy: () => void;
}) {
  return (
    <article className="draft-box">
      <h3>
        <Icon aria-hidden="true" size={17} />
        {title}
      </h3>
      <p>{value}</p>
      <Button variant="ghost" onClick={onCopy}>
        <Copy aria-hidden="true" size={15} />
        Copy
      </Button>
    </article>
  );
}

function toggleValue<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}
