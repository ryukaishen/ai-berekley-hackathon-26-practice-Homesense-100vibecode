import { NavLink, Outlet } from "react-router-dom";
import { RouteId, type AppRoute } from "@reentry/shared";
import { DisclaimerBanner, ThemeToggle } from "@reentry/ui";

const appRoutes: AppRoute[] = [
  {
    id: RouteId.HOME,
    path: "/",
    label: "Home",
    description: "Overview and quick start"
  },
  {
    id: RouteId.DEMO,
    path: "/demo",
    label: "Demo",
    description: "Walkthrough flow"
  },
  {
    id: RouteId.AGENTS,
    path: "/agents",
    label: "Agents",
    description: "Multi-agent recovery workflow"
  },
  {
    id: RouteId.FITBIT_DEMO,
    path: "/fitbit",
    label: "Fitbit Demo",
    description: "Wearable baseline import"
  },
  {
    id: RouteId.CLINIC_DASHBOARD,
    path: "/clinic",
    label: "Care Desk",
    description: "Clinic and campus support queue"
  },
  {
    id: RouteId.SCENARIOS,
    path: "/scenarios",
    label: "Scenarios",
    description: "Choose a scenario pack"
  },
  {
    id: RouteId.ONBOARDING,
    path: "/onboarding",
    label: "Onboarding",
    description: "Demographic and recovery setup"
  },
  {
    id: RouteId.EPISODE_NEW,
    path: "/episode/new",
    label: "Episode",
    description: "Capture context"
  },
  {
    id: RouteId.CHECK_IN,
    path: "/check-in",
    label: "Check-In",
    description: "Daily baseline check"
  },
  {
    id: RouteId.PLAN,
    path: "/plan",
    label: "Plan",
    description: "Action plan builder"
  },
  {
    id: RouteId.SUPPORT_CIRCLE,
    path: "/support-circle",
    label: "Support Circle",
    description: "Trusted contacts"
  },
  {
    id: RouteId.HANDOFF,
    path: "/handoff",
    label: "Handoff",
    description: "Share summary"
  },
  {
    id: RouteId.HISTORY,
    path: "/history",
    label: "History",
    description: "Timeline and trends"
  }
];

const disclaimerText =
  "ReEntry is a non-clinical support tool. It does not diagnose, treat, prescribe, or replace a licensed professional.";

export function AppLayout() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <DisclaimerBanner>{disclaimerText}</DisclaimerBanner>
      <div className="re-container">
        <header className="py-4 md:py-6">
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="re-eyebrow">ReEntry</p>
              <h2 className="m-0 text-2xl font-bold">Daily support, built for real life</h2>
              <p className="re-meta m-0 mt-1">
                Calm structure, clear next steps, and easy handoff when you need more support.
              </p>
            </div>
            <ThemeToggle />
          </div>
          <nav aria-label="Primary" className="re-top-nav">
            {appRoutes.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  isActive ? "re-nav-link re-nav-link-active" : "re-nav-link"
                }
              >
                {route.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main id="main-content" className="re-page">
          <Outlet />
        </main>
      </div>
    </>
  );
}
