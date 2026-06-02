import type { PatientScenario } from "../types";

export const mockScenarios: PatientScenario[] = [
  {
    id: "knee-recovery",
    title: "Post-knee-surgery patient weaker than expected",
    shortTitle: "Knee recovery",
    name: "Evelyn Brooks",
    age: 72,
    profile:
      "Five days after knee replacement, using a walker, and reporting that standing up from a chair feels harder than yesterday.",
    dischargeContext:
      "Recent orthopedic discharge with home PT planned. Family is unsure whether slower sit-to-stand is expected recovery friction or a reason to call.",
    baselineMobility: {
      sitToStandTime: 13.8,
      steadinessScore: 66,
      turnConfidence: 64,
      mobilityConfidence: 68,
      recoveryFrictionScore: 48,
      completionTrend: 76,
    },
    symptomDefaults: [
      { id: "weakness", label: "Leg weakness", detail: "Needs both hands and extra time to stand." },
      { id: "pain", label: "Pain", detail: "Pain is limiting confidence during the chair rise." },
    ],
    warningSigns: [
      "New or worsening leg weakness compared with the last check",
      "More help needed for sit-to-stand than expected",
      "Dizziness, shortness of breath, or severe sudden symptoms",
    ],
    keyFindings: [
      {
        id: "chair-rise",
        title: "Sit-to-stand is slower than her baseline check",
        detail:
          "The mock stream shows extra time in the chair-rise phase and more sway after standing. This suggests recovery friction to review with PT.",
        plainDetail: "Standing up is taking longer and looks less steady than the last check.",
        severity: "Elevated",
      },
      {
        id: "walker-turn",
        title: "Turn confidence is reduced when starting to walk",
        detail:
          "The turn segment has a cautious pattern. StandWise organizes this as a mobility concern, not a diagnosis.",
        plainDetail: "Turning after standing looks cautious.",
        severity: "Moderate",
      },
    ],
    todayActions: [
      "Use the safest chair height already approved by the care team.",
      "Keep the walker within reach before standing.",
      "Ask PT whether the sit-to-stand pattern should be reviewed.",
    ],
    contactClinician: [
      "Call the care team if weakness is new, worsening, or paired with dizziness.",
      "Seek emergency help for severe, sudden, or life-threatening symptoms.",
    ],
    followUpTopics: [
      "Chair height and hand placement during sit-to-stand",
      "Walker timing and safe turn strategy",
      "Pain pattern and whether current recovery plan still fits",
    ],
    caregiverTasks: [
      {
        id: "knee-chair",
        label: "Confirm the recovery chair is high, firm, and easy to reach from the walker.",
        plainLabel: "Use the safest chair setup.",
        detail: "Do not improvise equipment changes; ask PT or the discharge team if unsure.",
        category: "mobility",
        owner: "Caregiver",
        urgency: "Elevated",
      },
      {
        id: "knee-walker",
        label: "Clear the first six feet of the walker path before every mobility check.",
        plainLabel: "Clear the walker path.",
        detail: "Remove cords, throw rugs, and side tables from the immediate route.",
        category: "home-safety",
        owner: "Caregiver",
        urgency: "Moderate",
      },
      {
        id: "knee-pt",
        label: "Send the PT a short update about slower standing and increased help needed today.",
        plainLabel: "Update PT about the change.",
        detail: "The app can draft the message, but the patient or caregiver decides whether to send it.",
        category: "follow-up",
        owner: "PT/OT",
        urgency: "Elevated",
      },
    ],
    caregiverSummary:
      "Evelyn may need more help standing today. Keep the walker ready, clear the path, and ask PT whether the slower chair rise should be reviewed.",
    clinicianSummary:
      "Prototype check flags elevated recovery friction: slower sit-to-stand, transient sway after standing, and cautious turn initiation after knee replacement.",
    spanishSummary:
      "La revision simulada muestra mas dificultad para levantarse de la silla y mas inestabilidad breve. StandWise organiza esta informacion para seguimiento; no diagnostica.",
    businessFit: "Orthopedic bundled-payment recovery, home PT triage, and post-discharge readmission prevention.",
    dashboardAction: "PT follow-up recommended",
    concernLevel: "Elevated",
    recommendedTest: "both",
    pulseRange: [76, 94],
  },
  {
    id: "ed-dizziness",
    title: "Older adult discharged from ED after dizziness/dehydration",
    shortTitle: "ED dizziness",
    name: "Rosa Martinez",
    age: 80,
    profile:
      "Discharged from the emergency department yesterday after dizziness and dehydration. She feels better sitting down but lightheaded when standing.",
    dischargeContext:
      "Family wants to know whether today's mobility check looks stable enough to keep monitoring at home or whether to call for guidance.",
    baselineMobility: {
      sitToStandTime: 11.4,
      steadinessScore: 72,
      turnConfidence: 70,
      mobilityConfidence: 73,
      recoveryFrictionScore: 42,
      completionTrend: 82,
    },
    symptomDefaults: [
      { id: "dizziness", label: "Dizziness", detail: "Lightheaded after standing up." },
      { id: "weakness", label: "Weakness", detail: "Feels drained after the short check." },
    ],
    warningSigns: [
      "Dizziness that is sudden, severe, or worsening",
      "Shortness of breath, chest pain, fainting, or confusion",
      "Unable to safely stand or walk without hands-on help",
    ],
    keyFindings: [
      {
        id: "standing-sway",
        title: "Stability dips right after standing",
        detail:
          "The mock sensor stream shows a brief sway spike after the stand phase, matching the dizziness symptom report.",
        plainDetail: "She looks least steady right after standing.",
        severity: "Elevated",
      },
      {
        id: "symptom-trend",
        title: "Dizziness is the symptom trend to monitor",
        detail:
          "StandWise cannot determine why dizziness is happening. It organizes the trend and recommends follow-up language.",
        plainDetail: "Track whether dizziness is getting better or worse.",
        severity: "Moderate",
      },
    ],
    todayActions: [
      "Pause after sitting up and again after standing before walking.",
      "Keep a caregiver nearby for the next check if dizziness continues.",
      "Write down when dizziness happens and what activity triggered it.",
    ],
    contactClinician: [
      "Contact the care team if dizziness worsens, returns repeatedly, or limits walking.",
      "Use emergency services for fainting, chest pain, severe shortness of breath, sudden confusion, or other life-threatening symptoms.",
    ],
    followUpTopics: [
      "Dizziness timing after standing",
      "Hydration instructions from the ED discharge paperwork",
      "Whether additional home health or PT support is appropriate",
    ],
    caregiverTasks: [
      {
        id: "ed-stand-pause",
        label: "Stand nearby during transfers and remind Rosa to pause before walking.",
        plainLabel: "Stay close when she stands.",
        detail: "Hands-on help should follow the care team's instructions.",
        category: "mobility",
        owner: "Caregiver",
        urgency: "Elevated",
      },
      {
        id: "ed-path",
        label: "Clear the bathroom route and keep night lighting on.",
        plainLabel: "Clear and light the bathroom path.",
        detail: "Night bathroom trips can be risky when dizziness is still present.",
        category: "home-safety",
        owner: "Caregiver",
        urgency: "Moderate",
      },
      {
        id: "ed-notes",
        label: "Prepare a short clinic update if dizziness repeats after standing.",
        plainLabel: "Make a short clinic note.",
        detail: "Include timing, symptoms, and whether help was needed.",
        category: "follow-up",
        owner: "Clinician",
        urgency: "Moderate",
      },
    ],
    caregiverSummary:
      "Rosa looks most unsteady right after standing. Stay close, use pauses, keep paths clear, and contact the care team if dizziness keeps returning.",
    clinicianSummary:
      "Prototype check flags post-ED recovery friction: dizziness paired with transient post-stand sway and fatigue after a short mobility check.",
    spanishSummary:
      "La revision simulada muestra mareo al ponerse de pie y un aumento breve de balanceo. StandWise ayuda a organizar la informacion; no reemplaza al equipo medico.",
    businessFit: "ED discharge follow-up, dehydration/dizziness monitoring, and avoidable return-visit reduction.",
    dashboardAction: "Call patient within 24h",
    concernLevel: "Elevated",
    recommendedTest: "sit-to-stand",
    pulseRange: [78, 104],
  },
  {
    id: "new-medication",
    title: "Patient on new medication with possible sedation or imbalance concerns",
    shortTitle: "New medication",
    name: "Harold Chen",
    age: 76,
    profile:
      "Started a new evening medication this week. Family notices morning grogginess and slower walking, but nobody wants the app to make medication decisions.",
    dischargeContext:
      "The goal is to organize observations for a clinician or pharmacist, not to stop or change medication.",
    baselineMobility: {
      sitToStandTime: 10.2,
      steadinessScore: 76,
      turnConfidence: 75,
      mobilityConfidence: 78,
      recoveryFrictionScore: 36,
      completionTrend: 86,
    },
    symptomDefaults: [
      { id: "weakness", label: "Morning grogginess", detail: "Feels slow and sleepy during the first walk." },
      { id: "dizziness", label: "Light imbalance", detail: "Feels less steady after the first turn." },
    ],
    warningSigns: [
      "New confusion, severe sleepiness, fainting, or trouble breathing",
      "A fall, near-fall, or needing unexpected help to walk",
      "Medication questions that have not been confirmed with a clinician or pharmacist",
    ],
    keyFindings: [
      {
        id: "sedation-pattern",
        title: "Morning mobility confidence is lower than baseline",
        detail:
          "The mock check shows slower reaction during walking and turn phases. This is organized as a medication-timing question for the care team.",
        plainDetail: "Walking looks slower and less confident this morning.",
        severity: "Moderate",
      },
      {
        id: "med-review",
        title: "Medication concern should be confirmed by a professional",
        detail:
          "StandWise never recommends changing medication. It creates a concise observation for a clinician or pharmacist.",
        plainDetail: "Do not change medicine based on the app. Ask a professional.",
        severity: "Elevated",
      },
    ],
    todayActions: [
      "Avoid rushing the first walk of the morning.",
      "Record when grogginess is noticed and how long it lasts.",
      "Ask a clinician or pharmacist to review medication timing questions.",
    ],
    contactClinician: [
      "Contact the care team for new confusion, excessive sleepiness, near-falls, or worsening imbalance.",
      "Medication concerns should be confirmed with a clinician or pharmacist.",
    ],
    followUpTopics: [
      "Medication timing and morning grogginess",
      "Any near-falls or extra help needed",
      "Whether home safety or PT review is recommended",
    ],
    caregiverTasks: [
      {
        id: "med-morning",
        label: "Track morning grogginess, walking confidence, and any near-fall events.",
        plainLabel: "Write down morning grogginess and walking changes.",
        detail: "Include time of day and whether hands-on help was needed.",
        category: "symptom",
        owner: "Caregiver",
        urgency: "Moderate",
      },
      {
        id: "med-pharmacist",
        label: "Ask the clinician or pharmacist to review medication timing concerns.",
        plainLabel: "Ask a professional about medication timing.",
        detail: "Do not stop, skip, or change medication because of this prototype.",
        category: "medication",
        owner: "Clinician",
        urgency: "Elevated",
      },
      {
        id: "med-route",
        label: "Keep the morning bathroom and kitchen routes uncluttered.",
        plainLabel: "Clear the morning walking routes.",
        detail: "Grogginess and clutter are a bad pairing during early-day walking.",
        category: "home-safety",
        owner: "Caregiver",
        urgency: "Moderate",
      },
    ],
    caregiverSummary:
      "Harold may be slower and less steady in the morning. Track timing, clear the route, and ask a clinician or pharmacist about medication concerns.",
    clinicianSummary:
      "Prototype check flags medication-adjacent recovery friction: reported morning grogginess with reduced walk/turn confidence. No medication recommendation is made.",
    spanishSummary:
      "La revision simulada muestra menos confianza al caminar por la manana. Las preguntas de medicina deben revisarse con un profesional; la app no cambia medicinas.",
    businessFit: "Medication safety follow-up, caregiver triage, pharmacy-supported transitional care, and home health visit preparation.",
    dashboardAction: "Review medication timing",
    concernLevel: "Moderate",
    recommendedTest: "walk-and-turn",
    pulseRange: [68, 86],
  },
  {
    id: "oncology-neuropathy",
    title: "Oncology patient with worsening numbness and gait instability",
    shortTitle: "Oncology gait",
    name: "Nadia Patel",
    age: 67,
    profile:
      "Undergoing cancer treatment and reporting more numbness in both feet. She has not fallen, but turns feel less predictable.",
    dischargeContext:
      "The oncology team needs a plain, structured trend summary before the next visit, especially around numbness and walking stability.",
    baselineMobility: {
      sitToStandTime: 9.8,
      steadinessScore: 74,
      turnConfidence: 68,
      mobilityConfidence: 71,
      recoveryFrictionScore: 44,
      completionTrend: 79,
    },
    symptomDefaults: [
      { id: "numbness", label: "Foot numbness", detail: "Numbness feels worse than last week." },
      { id: "weakness", label: "Unsteady turns", detail: "Needs to slow down before changing direction." },
    ],
    warningSigns: [
      "Worsening numbness, new weakness, or new trouble walking",
      "A fall, near-fall, or inability to safely complete daily activities",
      "Severe, sudden, or life-threatening symptoms",
    ],
    keyFindings: [
      {
        id: "turn-instability",
        title: "Turn confidence is the main mobility concern",
        detail:
          "The mock stream shows greater variability during the turn segment than the straight walk segment.",
        plainDetail: "Turning looks less steady than walking straight.",
        severity: "Elevated",
      },
      {
        id: "numbness-trend",
        title: "Worsening numbness is a follow-up topic",
        detail:
          "StandWise does not diagnose neuropathy. It turns the symptom trend into a clear oncology or rehab discussion point.",
        plainDetail: "Tell the care team the numbness is getting worse.",
        severity: "Elevated",
      },
    ],
    todayActions: [
      "Use a clear, well-lit walking path for turns and bathroom trips.",
      "Avoid carrying items while walking if numbness feels worse.",
      "Send the oncology or rehab team a short update before the next visit.",
    ],
    contactClinician: [
      "Contact the care team if numbness worsens, walking becomes unsafe, or a near-fall occurs.",
      "Use emergency services for severe, sudden, or life-threatening symptoms.",
    ],
    followUpTopics: [
      "Worsening numbness in both feet",
      "Turn instability and any near-falls",
      "Whether PT/OT, assistive device review, or home health support is appropriate",
    ],
    caregiverTasks: [
      {
        id: "oncology-turn-path",
        label: "Create a clear turning area near the bed, bathroom, and kitchen.",
        plainLabel: "Make room for safer turns.",
        detail: "Remove small mats, cords, and narrow obstacles along frequent routes.",
        category: "home-safety",
        owner: "Caregiver",
        urgency: "Elevated",
      },
      {
        id: "oncology-symptom-log",
        label: "Track numbness, walking confidence, and any near-falls each day.",
        plainLabel: "Track numbness and near-falls.",
        detail: "A short trend is more useful than a long note.",
        category: "symptom",
        owner: "Patient",
        urgency: "Elevated",
      },
      {
        id: "oncology-rehab",
        label: "Ask the oncology team whether rehab or home safety support should be added.",
        plainLabel: "Ask about rehab or home safety help.",
        detail: "Bring up numbness, turns, and daily activity limitations.",
        category: "follow-up",
        owner: "Clinician",
        urgency: "Elevated",
      },
    ],
    caregiverSummary:
      "Nadia's main concern is turning while her feet feel more numb. Clear turning areas, track changes, and update oncology or rehab.",
    clinicianSummary:
      "Prototype check flags elevated recovery friction: worsening numbness report plus reduced turn confidence and higher sway variability.",
    spanishSummary:
      "La revision simulada muestra mas preocupacion al girar y mas entumecimiento reportado. StandWise organiza el seguimiento; no diagnostica.",
    businessFit: "Oncology navigation, rehab referral triage, home health planning, and functional decline monitoring.",
    dashboardAction: "PT/OT follow-up recommended",
    concernLevel: "Elevated",
    recommendedTest: "walk-and-turn",
    pulseRange: [74, 98],
  },
];

export const getScenarioById = (scenarioId: string) =>
  mockScenarios.find((scenario) => scenario.id === scenarioId) ?? mockScenarios[0];

