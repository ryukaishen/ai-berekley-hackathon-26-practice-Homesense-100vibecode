import { Contrast, Languages, LetterText, MessageCircle } from "lucide-react";
import type { AccessibilityPrefs } from "../types";

interface AccessibilityTogglesProps {
  prefs: AccessibilityPrefs;
  onChange: (prefs: AccessibilityPrefs) => void;
}

const toggleMeta = [
  { key: "largeText", label: "Large text", icon: LetterText },
  { key: "plainLanguage", label: "Plain language", icon: MessageCircle },
  { key: "highContrast", label: "High contrast", icon: Contrast },
  { key: "spanishSummary", label: "Spanish summary", icon: Languages },
] as const;

export function AccessibilityToggles({ prefs, onChange }: AccessibilityTogglesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Accessibility toggles">
      {toggleMeta.map((item) => {
        const Icon = item.icon;
        const active = prefs[item.key];
        return (
          <button
            key={item.key}
            type="button"
            className={`toggle-button ${active ? "toggle-button-active" : ""}`}
            onClick={() => onChange({ ...prefs, [item.key]: !active })}
            aria-pressed={active}
            title={item.label}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
