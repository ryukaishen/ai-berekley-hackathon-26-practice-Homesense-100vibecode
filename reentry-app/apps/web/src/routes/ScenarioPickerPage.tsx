import { useMemo, useState } from "react";
import { Check, Circle, Import, Sparkles } from "lucide-react";
import { scenarioPacks, type ScenarioPack, type ScenarioPackId } from "@reentry/shared";
import { Button, PageHeader, SurfaceCard } from "@reentry/ui";

const importedScenarioId: ScenarioPackId = "post-discharge";

function Chip({ children, variant = "soft" }: { children: string; variant?: "soft" | "tone" }) {
  return <span className={`scenario-chip scenario-chip-${variant}`}>{children}</span>;
}

function DemoToggle({
  enabled,
  onChange
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`scenario-toggle focus-ring ${enabled ? "scenario-toggle-on" : ""}`}
      aria-pressed={enabled}
      onClick={() => onChange(!enabled)}
    >
      <Sparkles aria-hidden="true" size={18} />
      <span>Demo mode</span>
    </button>
  );
}

function StandWisePanel({
  isOpen,
  onClose,
  onPreview
}: {
  isOpen: boolean;
  onClose: () => void;
  onPreview: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="scenario-import-panel" role="dialog" aria-modal="false" aria-labelledby="standwise-title">
      <div>
        <p className="re-eyebrow">StandWise</p>
        <h2 id="standwise-title" className="scenario-panel-title">
          Import preview
        </h2>
        <p className="re-meta m-0">
          StandWise import is shown here as a preview-only flow. No external account or data connection is used.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onPreview}>
          <Import aria-hidden="true" size={16} />
          Preview import
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function ScenarioCard({
  pack,
  isSelected,
  isImported,
  demoMode,
  onSelect
}: {
  pack: ScenarioPack;
  isSelected: boolean;
  isImported: boolean;
  demoMode: boolean;
  onSelect: (packId: ScenarioPackId) => void;
}) {
  const Icon = isSelected ? Check : Circle;

  return (
    <article className={`scenario-card ${isSelected ? "scenario-card-selected" : ""}`}>
      <button
        type="button"
        className="scenario-card-button focus-ring"
        aria-pressed={isSelected}
        onClick={() => onSelect(pack.id)}
      >
        <span className="scenario-card-heading">
          <span>
            <span className="scenario-card-title">{pack.title}</span>
            <span className="scenario-card-context">{pack.context}</span>
          </span>
          <Icon aria-hidden="true" size={22} />
        </span>
      </button>

      <div className="scenario-card-body">
        <div className="scenario-chip-row">
          <Chip variant="tone">{pack.interventionTone}</Chip>
          {isImported ? <Chip variant="tone">StandWise preview</Chip> : null}
        </div>

        <div className="scenario-section">
          <h3>Friction</h3>
          <div className="scenario-chip-row">
            {pack.frictionAreas.map((area) => (
              <Chip key={area}>{area}</Chip>
            ))}
          </div>
        </div>

        <div className="scenario-section">
          <h3>Support</h3>
          <div className="scenario-chip-row">
            {pack.supportRoles.map((role) => (
              <Chip key={role}>{role}</Chip>
            ))}
          </div>
        </div>

        {demoMode ? (
          <ul className="scenario-demo-list">
            {pack.demoDetails.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        ) : null}

        <div className="scenario-plan-row" aria-label={`${pack.title} quick plan archetypes`}>
          {pack.planArchetypes.map((archetype) => (
            <button
              key={archetype.title}
              type="button"
              className="scenario-plan-button focus-ring"
              onClick={() => onSelect(pack.id)}
              title={archetype.focus}
            >
              {archetype.title}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

export function ScenarioPickerPage() {
  const [selectedId, setSelectedId] = useState<ScenarioPackId>("finals-burnout");
  const [demoMode, setDemoMode] = useState(false);
  const [standWiseOpen, setStandWiseOpen] = useState(false);
  const [importedId, setImportedId] = useState<ScenarioPackId | null>(null);

  const selectedPack = useMemo(
    () => scenarioPacks.find((pack) => pack.id === selectedId) ?? scenarioPacks[0]!,
    [selectedId]
  );

  const previewStandWiseImport = () => {
    setDemoMode(true);
    setImportedId(importedScenarioId);
    setSelectedId(importedScenarioId);
    setStandWiseOpen(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Scenarios"
        title="Choose the right support shape"
        subtitle="Start from the situation that best matches the week, then turn it into a practical plan."
        action={
          <div className="scenario-actions">
            <DemoToggle enabled={demoMode} onChange={setDemoMode} />
            <Button variant="ghost" onClick={() => setStandWiseOpen((open) => !open)}>
              <Import aria-hidden="true" size={16} />
              Import from StandWise
            </Button>
          </div>
        }
      />

      <StandWisePanel
        isOpen={standWiseOpen}
        onClose={() => setStandWiseOpen(false)}
        onPreview={previewStandWiseImport}
      />

      <section className="scenario-selected" aria-live="polite">
        <SurfaceCard title={selectedPack.title} subtitle={selectedPack.context}>
          <div className="scenario-selected-grid">
            <div>
              <p className="re-meta m-0 mb-2">Recommended tone</p>
              <p className="scenario-selected-copy">{selectedPack.interventionTone}</p>
            </div>
            <div>
              <p className="re-meta m-0 mb-2">Next plan starts with</p>
              <p className="scenario-selected-copy">
                {demoMode
                  ? selectedPack.demoDetails[0] ?? selectedPack.context
                  : selectedPack.planArchetypes.map((plan) => plan.title).join(", ")}
              </p>
            </div>
          </div>
        </SurfaceCard>
      </section>

      <section className="scenario-grid" aria-label="Scenario packs">
        {scenarioPacks.map((pack) => (
          <ScenarioCard
            key={pack.id}
            pack={pack}
            isSelected={pack.id === selectedId}
            isImported={pack.id === importedId}
            demoMode={demoMode}
            onSelect={setSelectedId}
          />
        ))}
      </section>
    </>
  );
}
