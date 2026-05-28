import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import "./index.css";
import {
  CheckInPage,
  AgentWorkflowPage,
  ClinicDashboardPage,
  DemoPage,
  EpisodeNewPage,
  FitbitDemoPage,
  HandoffPage,
  HistoryPage,
  HomePage,
  OnboardingPage,
  PlanPage,
  ScenarioPickerPage,
  SupportCirclePage
} from "./routes/pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "demo", element: <DemoPage /> },
      { path: "scenarios", element: <ScenarioPickerPage /> },
      { path: "onboarding", element: <OnboardingPage /> },
      { path: "episode/new", element: <EpisodeNewPage /> },
      { path: "check-in", element: <CheckInPage /> },
      { path: "plan", element: <PlanPage /> },
      { path: "agents", element: <AgentWorkflowPage /> },
      { path: "fitbit", element: <FitbitDemoPage /> },
      { path: "clinic", element: <ClinicDashboardPage /> },
      { path: "support-circle", element: <SupportCirclePage /> },
      { path: "handoff", element: <HandoffPage /> },
      { path: "history", element: <HistoryPage /> }
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
