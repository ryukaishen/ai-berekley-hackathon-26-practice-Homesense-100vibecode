import type { DashboardPatient, PatientScenario } from "../types";

const trendForIndex = (index: number): DashboardPatient["symptomTrend"] => {
  if (index === 0 || index === 3) return "Worsening";
  if (index === 1) return "Stable";
  return "Improving";
};

const priorityForScore = (score: number): DashboardPatient["outreachPriority"] => {
  if (score >= 66) return "Urgent";
  if (score >= 50) return "Elevated";
  return "Routine";
};

export const generateDashboardRows = (scenarios: PatientScenario[]): DashboardPatient[] =>
  scenarios.map((scenario, index) => {
    const score = Math.min(94, scenario.baselineMobility.recoveryFrictionScore + 12 + index * 3);

    return {
      id: `dash-${scenario.id}`,
      name: `${scenario.name}, ${scenario.age}`,
      scenarioId: scenario.id,
      lastCheckDate: index === 0 ? "Today 9:20 AM" : index === 1 ? "Today 7:45 AM" : index === 2 ? "Yesterday 6:10 PM" : "Yesterday 2:35 PM",
      recoveryFrictionScore: score,
      fallConcernLevel: scenario.concernLevel,
      symptomTrend: trendForIndex(index),
      outreachPriority: priorityForScore(score),
      suggestedNextAction: scenario.dashboardAction,
    };
  });
