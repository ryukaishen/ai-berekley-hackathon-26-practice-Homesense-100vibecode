import type { CareTask, PatientScenario, SymptomInput } from "../types";

export const generateCaregiverTasks = (
  scenario: PatientScenario,
  symptoms: SymptomInput,
): CareTask[] => {
  const tasks = [...scenario.caregiverTasks];

  if (symptoms.dizziness) {
    tasks.push({
      id: `${scenario.id}-dizziness-pause`,
      label: "Use a pause-and-check routine before walking after sitting or standing.",
      plainLabel: "Pause before walking.",
      detail: "Have the patient sit or stand still briefly and report whether dizziness is present.",
      category: "mobility",
      owner: "Caregiver",
      urgency: "Elevated",
    });
  }

  if (symptoms.shortnessOfBreath) {
    tasks.push({
      id: `${scenario.id}-breathing-escalation`,
      label: "Keep emergency guidance visible and escalate severe or sudden breathing symptoms.",
      plainLabel: "Know when breathing symptoms need urgent help.",
      detail: "This prototype does not assess emergencies. Use emergency services when symptoms are life-threatening.",
      category: "symptom",
      owner: "Caregiver",
      urgency: "High",
    });
  }

  if (symptoms.numbness) {
    tasks.push({
      id: `${scenario.id}-numbness-log`,
      label: "Track numbness pattern and any near-falls in a short daily note.",
      plainLabel: "Track numbness and near-falls.",
      detail: "Bring the trend to oncology, primary care, PT, OT, or home health as appropriate.",
      category: "symptom",
      owner: "Patient",
      urgency: "Elevated",
    });
  }

  return tasks;
};
