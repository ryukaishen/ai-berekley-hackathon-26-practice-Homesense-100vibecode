import { Activity, Home, LayoutDashboard, ScanLine, ShieldPlus } from "lucide-react";
import type { AccessibilityPrefs } from "../types";
import { AccessibilityToggles } from "./AccessibilityToggles";

export type AppView = "home" | "landing" | "check" | "dashboard";
export type BackendStatus = "online" | "degraded" | "offline";

interface TopNavProps {
  activeView: AppView;
  backendStatus: BackendStatus;
  prefs: AccessibilityPrefs;
  onPrefsChange: (prefs: AccessibilityPrefs) => void;
  onNavigate: (view: AppView) => void;
}

const navItems = [
  { view: "home", label: "Today", icon: Home },
  { view: "check", label: "Live Check", icon: ScanLine },
  { view: "dashboard", label: "Care Team", icon: LayoutDashboard },
  { view: "landing", label: "Story", icon: ShieldPlus },
] as const;

const statusLabel = {
  online: "API online",
  degraded: "API syncing",
  offline: "API offline",
};

export function TopNav({ activeView, backendStatus, prefs, onPrefsChange, onNavigate }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="flex items-center gap-3 text-left" onClick={() => onNavigate("home")}>
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white shadow-sm">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-black text-slate-950">StandWise</span>
              <span className="block text-xs font-bold text-slate-500">Home recovery mobility checks</span>
            </span>
          </button>
          <div className="hidden items-center gap-2 md:flex">
            <span className={`backend-pill backend-pill-${backendStatus}`}>{statusLabel[backendStatus]}</span>
            <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">Mock mode ready</span>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                className={`nav-button ${active ? "nav-button-active" : ""}`}
                onClick={() => onNavigate(item.view)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <AccessibilityToggles prefs={prefs} onChange={onPrefsChange} />
      </div>
    </header>
  );
}
