export const scenarioCatalog = [
  {
    id: "knee-recovery",
    shortTitle: "Knee recovery",
    patientName: "Evelyn Brooks",
    age: 72,
    concernLevel: "Elevated",
    recommendedTest: "both",
    dashboardAction: "PT follow-up recommended",
    caregiverSummary:
      "Needs more help standing today. Keep the walker ready, clear the path, and ask PT whether the slower chair rise should be reviewed.",
    clinicianSummary:
      "Slower sit-to-stand with cautious turning after knee replacement. Use this as a follow-up signal, not a diagnosis.",
    warningSigns: [
      "New or worsening leg weakness compared with the last check",
      "More help needed for sit-to-stand than expected",
      "Dizziness, shortness of breath, or severe sudden symptoms",
    ],
  },
  {
    id: "ed-dizziness",
    shortTitle: "ED dizziness",
    patientName: "Rosa Martinez",
    age: 80,
    concernLevel: "Elevated",
    recommendedTest: "sit-to-stand",
    dashboardAction: "Call patient within 24h",
    caregiverSummary:
      "Most unsteady right after standing. Stay close, use pauses, keep paths clear, and contact the care team if dizziness keeps returning.",
    clinicianSummary:
      "Post-ED trend suggests dizziness with transient sway after standing and fatigue after a short mobility check.",
    warningSigns: [
      "Dizziness that is sudden, severe, or worsening",
      "Shortness of breath, chest pain, fainting, or confusion",
      "Unable to safely stand or walk without hands-on help",
    ],
  },
  {
    id: "new-medication",
    shortTitle: "New medication",
    patientName: "Harold Chen",
    age: 76,
    concernLevel: "Moderate",
    recommendedTest: "walk-and-turn",
    dashboardAction: "Review medication timing",
    caregiverSummary:
      "Track morning grogginess and walking changes, clear routes, and ask a clinician or pharmacist about medication timing.",
    clinicianSummary:
      "Medication-adjacent recovery friction with reduced walk and turn confidence. No medication recommendations are made.",
    warningSigns: [
      "New confusion, severe sleepiness, fainting, or trouble breathing",
      "A fall, near-fall, or unexpected hands-on help needed",
      "Medication questions should be confirmed with a clinician or pharmacist",
    ],
  },
  {
    id: "oncology-neuropathy",
    shortTitle: "Oncology gait",
    patientName: "Nadia Patel",
    age: 67,
    concernLevel: "Elevated",
    recommendedTest: "walk-and-turn",
    dashboardAction: "PT/OT follow-up recommended",
    caregiverSummary:
      "Turning while feet are numb is the main concern. Clear turning areas, track changes, and update oncology or rehab.",
    clinicianSummary:
      "Worsening numbness with reduced turn confidence and higher sway variability. Route for oncology or rehab follow-up.",
    warningSigns: [
      "Worsening numbness, new weakness, or new trouble walking",
      "A fall, near-fall, or inability to safely complete activities",
      "Severe, sudden, or life-threatening symptoms",
    ],
  },
];

export const scenarioById = new Map(scenarioCatalog.map((scenario) => [scenario.id, scenario]));
