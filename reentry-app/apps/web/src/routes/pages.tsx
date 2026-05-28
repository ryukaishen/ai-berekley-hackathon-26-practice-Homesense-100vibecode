import { PageHeader, SurfaceCard } from "@reentry/ui";
import { Link } from "react-router-dom";
export { CheckInPage } from "./CheckInFlowPage";
export { AgentWorkflowPage } from "./AgentWorkflowPage";
export { DemoPage } from "./DemoPage";
export { EpisodeNewPage } from "./EpisodeNewPage";
export { FitbitDemoPage } from "./FitbitDemoPage";
export { OnboardingPage } from "./OnboardingPage";
export { ClinicDashboardPage } from "./ClinicDashboardPage";
export { HandoffPage } from "./HandoffPage";
export { PlanPage } from "./PlanPage";
export { ScenarioPickerPage } from "./ScenarioPickerPage";
export { SupportCirclePage } from "./SupportCirclePage";
export { HistoryPage } from "./HistoryPage";

function QuickStats() {
  return (
    <div className="re-grid">
      <SurfaceCard title="Check-ins this week">
        <p className="m-0 text-4xl font-bold">5</p>
        <p className="re-meta m-0 mt-1">2 more than last week</p>
      </SurfaceCard>
      <SurfaceCard title="Support circle messages">
        <p className="m-0 text-4xl font-bold">3</p>
        <p className="re-meta m-0 mt-1">All responded within 2 hours</p>
      </SurfaceCard>
      <SurfaceCard title="Plan completion">
        <p className="m-0 text-4xl font-bold">82%</p>
        <p className="re-meta m-0 mt-1">Strong consistency trend</p>
      </SurfaceCard>
    </div>
  );
}

export function HomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Welcome"
        title="Build steadier days with your own rhythm"
        subtitle="ReEntry helps you capture how things are going, track patterns, and line up support before things feel overwhelming."
        action={
          <Link className="focus-ring re-btn re-btn-solid" to="/check-in">
            Start New Check-In
          </Link>
        }
      />
      <QuickStats />
      <div className="re-grid mt-4">
        <SurfaceCard title="Keyboard Friendly" subtitle="Built for quick movement and focus">
          <p className="m-0">
            Navigate quickly with <span className="re-kbd">Tab</span>, <span className="re-kbd">Shift</span> +{" "}
            <span className="re-kbd">Tab</span>, and clear focus rings.
          </p>
        </SurfaceCard>
        <SurfaceCard title="Low-Stress Visual Design" subtitle="Calm, spacious, and readable">
          <p className="m-0">
            Large card surfaces and soft contrast help reduce visual overload while keeping important actions obvious.
          </p>
        </SurfaceCard>
      </div>
    </>
  );
}
