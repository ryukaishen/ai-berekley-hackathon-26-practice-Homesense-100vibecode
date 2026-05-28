import { useEffect, useMemo, useState } from "react";
import { AssessmentFlow } from "./components/AssessmentFlow";
import { DashboardPreview } from "./components/DashboardPreview";
import { HomePlanPage } from "./components/HomePlanPage";
import { LandingPage } from "./components/LandingPage";
import { ResultsPage } from "./components/ResultsPage";
import { TopNav } from "./components/TopNav";
import { mockScenarios, getScenarioById } from "./data/mockScenarios";
import type { AppView } from "./components/TopNav";
import type { BackendStatus } from "./components/TopNav";
import type { AccessibilityPrefs, AssessmentMode, AssessmentResult, AssessmentTest, PatientScenario, SymptomInput } from "./types";
import { generateDashboardRows } from "./utils/generateDashboardRows";
import { fetchBackendHealth, fetchDashboardRows } from "./services/backendApi";

const defaultPrefs: AccessibilityPrefs = {
  largeText: false,
  plainLanguage: false,
  highContrast: false,
  spanishSummary: false,
};

const emptySymptoms: SymptomInput = {
  dizziness: false,
  weakness: false,
  pain: false,
  numbness: false,
  shortnessOfBreath: false,
  otherNote: "",
};

const symptomsFromScenario = (scenario: PatientScenario): SymptomInput =>
  scenario.symptomDefaults.reduce(
    (current, symptom) => ({
      ...current,
      [symptom.id]: true,
    }),
    { ...emptySymptoms },
  );

function App() {
  const [view, setView] = useState<AppView>("home");
  const [selectedScenarioId, setSelectedScenarioId] = useState(mockScenarios[0].id);
  const scenario = useMemo(() => getScenarioById(selectedScenarioId), [selectedScenarioId]);
  const [symptoms, setSymptoms] = useState<SymptomInput>(() => symptomsFromScenario(mockScenarios[0]));
  const [test, setTest] = useState<AssessmentTest>(mockScenarios[0].recommendedTest);
  const [mode, setMode] = useState<AssessmentMode>("mock");
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [caregiverMode, setCaregiverMode] = useState(false);
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(defaultPrefs);
  const [dashboardRows, setDashboardRows] = useState(() => generateDashboardRows(mockScenarios));
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("degraded");

  const navigate = (nextView: AppView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectScenario = (scenarioId: string) => {
    const nextScenario = getScenarioById(scenarioId);
    setSelectedScenarioId(scenarioId);
    setSymptoms(symptomsFromScenario(nextScenario));
    setTest(nextScenario.recommendedTest);
    setResult(null);
    setCaregiverMode(false);
    setView("check");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseScenarioForPlan = (scenarioId: string) => {
    const nextScenario = getScenarioById(scenarioId);
    setSelectedScenarioId(scenarioId);
    setSymptoms(symptomsFromScenario(nextScenario));
    setTest(nextScenario.recommendedTest);
    setResult(null);
    setCaregiverMode(false);
  };

  const completeAssessment = (nextResult: AssessmentResult) => {
    setResult(nextResult);
    window.setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const runAgain = () => {
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [health, rows] = await Promise.all([fetchBackendHealth(), fetchDashboardRows()]);
        if (!isMounted) return;
        setDashboardRows(rows);
        setBackendStatus(health.status === "ok" ? "online" : "degraded");
      } catch {
        if (!isMounted) return;
        setDashboardRows(generateDashboardRows(mockScenarios));
        setBackendStatus("offline");
      }
    };

    void loadDashboard();
    const interval = window.setInterval(() => {
      void loadDashboard();
    }, 20000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`min-h-screen app-background text-slate-950 ${prefs.largeText ? "large-text" : ""} ${
        prefs.highContrast ? "high-contrast" : ""
      } ${prefs.plainLanguage ? "plain-language" : ""}`}
    >
      <TopNav activeView={view} backendStatus={backendStatus} prefs={prefs} onPrefsChange={setPrefs} onNavigate={navigate} />

      {view === "home" ? (
        <HomePlanPage
          scenarios={mockScenarios}
          scenario={scenario}
          selectedScenarioId={selectedScenarioId}
          onScenarioSelect={chooseScenarioForPlan}
          onStartCheck={() => navigate("check")}
          onOpenDashboard={() => navigate("dashboard")}
          onOpenStory={() => navigate("landing")}
        />
      ) : null}

      {view === "landing" ? (
        <LandingPage onTryLiveCheck={() => navigate("check")} onViewDashboard={() => navigate("dashboard")} />
      ) : null}

      {view === "dashboard" ? <DashboardPreview rows={dashboardRows} onOpenScenario={selectScenario} /> : null}

      {view === "check" ? (
        <>
          <AssessmentFlow
            scenarios={mockScenarios}
            scenario={scenario}
            symptoms={symptoms}
            test={test}
            mode={mode}
            onScenarioSelect={selectScenario}
            onSymptomsChange={(nextSymptoms) => {
              setSymptoms(nextSymptoms);
              setResult(null);
            }}
            onTestChange={(nextTest) => {
              setTest(nextTest);
              setResult(null);
            }}
            onModeChange={(nextMode) => {
              setMode(nextMode);
              setResult(null);
            }}
            onComplete={completeAssessment}
          />

          {result ? (
            <div id="results">
              <ResultsPage
                scenario={scenario}
                result={result}
                prefs={prefs}
                caregiverMode={caregiverMode}
                onCaregiverModeChange={setCaregiverMode}
                onRunAgain={runAgain}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export default App;
