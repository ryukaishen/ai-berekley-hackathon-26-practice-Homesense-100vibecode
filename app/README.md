# StandWise / ReEntry / StandUnited

**An AI-powered early warning system for families of elderly patients with chronic conditions —
built to detect the decline before it becomes a hospitalization.**

> *My grandmother has diabetes, cardiovascular disease, and a stent. She was readmitted to
> the hospital repeatedly — not because her treatment was wrong, but because no one detected
> the early warning signs at home before the next crisis. When she finally got a caretaker,
> she became happier, more active, and her readmissions dropped. One person showing up
> changed everything. I built this because most families can't afford that person —
> but everyone deserves that signal.*

---

## The Problem

Hospital readmissions for elderly patients with chronic conditions (heart disease, diabetes,
hypertension) are one of the most expensive and preventable problems in healthcare. The
clinical system does its job — surgery, treatment, discharge. Then the patient goes home,
and the monitoring stops.

The decline that leads to readmission doesn't happen overnight. It builds over days:
activity drops, sleep patterns change, heart rate variability decreases. A family member
might sense something is wrong, but they have no data — no specific, concrete signal to
point to when a stubborn elderly parent refuses to go to the doctor.

**This app gives families that signal before the 11pm ER call.**

---

## What It Does

StandWise / ReEntry / StandUnited is a three-layer platform sharing a common engine.

### StandUnited — Elder Care Early Warning
For families of elderly patients with chronic conditions.

- **Passive wearable monitoring** — steps, sleep, resting HR, HRV, SpO₂, breathing rate
- **Baseline deviation engine** — 7-day rolling z-scores against the patient's own history, not population averages
- **Pattern matching** — detects when this week's trajectory mirrors a previous pre-hospitalization window
- **Family alert dashboard** — shows the family what changed, why it matters, and what to do — before the crisis
- **Patient check-in** — one question, three large buttons. No dashboards for the patient.
- **Automated agent pipeline** — when a pattern is detected, Claude agents automatically draft a family alert and clinical summary without waiting for a button press

### ReEntry — Youth Recovery Tracking
For 18–26 year olds navigating the gap between hospital discharge and full recovery —
where most people fall through without support.

- **Three recovery tracks** — post-concussion, post-hospitalization, burnout recovery
- **Wearable data import** — scenario-based Fitbit integration with realistic patient data
- **Same baseline + friction engine** as StandUnited — z-score deviation from personal baseline, weighted friction score across sleep, HRV, activity, and check-in
- **Deterministic safety router** — zero AI calls for the safety layer; hard thresholds for SpO₂, HR, HRV, and emergency keyword detection
- **5-agent Claude pipeline** — Signal Agent → Care Plan Agent → Caregiver Agent → Clinician Agent, only fires after safety clearance
- **Outreach priority table** — care team view ranking patients by friction score with one-tap draft messages
- **Evaluation page** — live scoring demo with full transparency into how thresholds and weights are calculated

### StandWise — Recovery Mobility Checks
The original layer. For post-discharge patients doing at-home recovery.

- Guided mobility assessments (sit-to-stand, balance, range of motion)
- Mock sensor streams simulating wearable data in real time
- Caregiver mode with draft message generation
- Care team dashboard with patient rows synced from backend
- Accessibility features: large text, plain language, high contrast, Spanish summary

---

All three layers share the same underlying engines:

```
baseline.ts → frictionScorer.ts → safetyRouter.ts → agentWorkflow.ts
```

ReEntry was built first and proved the architecture. StandUnited reused it entirely —
no new engine code, just new screens and a 90-day elder care patient simulation grounded
in real medical data.

---

## How It's Built

### The Engine — No AI Where It Shouldn't Be

The most important architectural decision in this project: **the safety router contains
zero AI calls.**

```
Wearable Data
    ↓
Baseline Engine       7-day rolling z-score per metric vs patient's own history
    ↓
Friction Scorer       Weighted 0–100 score
                      sleep (25%) · HRV (25%) · activity (25%) · check-in (25%)
    ↓
Safety Router         Deterministic rules only — no LLM
                      SpO₂, HR, HRV thresholds → clear / yellow / red / emergency
    ↓
Agent Pipeline        Only runs if safety router clears it
                      Signal → CarePlan → Caregiver → Clinician
```

The safety layer uses hard rules — not AI judgment — to decide whether agents should run.
If SpO₂ drops below 92%, heart rate exceeds 130, or HRV is critically low, the system
escalates immediately without waiting for a model. This is the correct architecture for
a health application: AI where it adds value, rules where it cannot be wrong.

If asked in an interview: *"I knew when not to use AI. That decision is more important
than any feature."*

### Data Grounding

The patient simulation is calibrated from real medical datasets:

- **SHARE-DB** (PhysioNet) — 139 hypertensive patients, ages 46–92, with Holter ECG
  recordings, blood pressure, ejection fraction, and vascular event outcomes. Used to
  calibrate realistic HR and HRV ranges for a 72-year-old female post-stent cardiac patient.
- **Fitbit Public Dataset** (Kaggle) — real wearable activity and sleep data from 30 users.
  Daily step counts (10k–17k for healthy adults) scaled down to realistic elderly ranges
  (2,200–3,400 baseline) for the patient simulation.
- **Hospital Readmission SHAP Analysis** — RandomForest model on 25,000 patient records.
  SHAP values confirm that prior inpatient visits, heart failure diagnosis (ICD-428), and
  diabetes medication are the strongest predictors of 30-day readmission. The demo patient
  profile hits all three.

### Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Cloudflare Workers (optional — app fully functional without it)
- **AI**: Anthropic Claude (claude-sonnet-4-6) via direct API
- **Icons**: Lucide React

---

## Who This Helps

**Families** who live apart from an elderly parent and cannot be physically present every day.
They need data, not just a feeling, to know when to intervene.

**Home health agencies** who need to know which patients are trending toward readmission
before it happens. The care team outreach dashboard ranks patients by friction score
with one-tap draft messages.

**Hospital discharge programs** that need lightweight monitoring for high-risk patients
in the weeks after discharge — without requiring clinical staff to check in daily.

**Young adults in recovery** (18–26) who are discharged from hospital or navigating a
major health setback with no structured follow-up until their next appointment. ReEntry
addresses this gap directly.

---

## What's Next

- [ ] Real wearable integration — direct Fitbit / Apple Watch / Garmin API replacing mock data
- [ ] Voice check-in — Web Speech API or Whisper so elderly patients speak their daily check-in
- [ ] Push notifications — SMS/email alerts so family doesn't need to open the app; the app comes to them
- [ ] Longitudinal pattern library — store prior hospitalization windows to improve pattern matching accuracy over time
- [ ] Care team B2B dashboard — institutional version for home health agencies and hospital discharge coordinators
- [ ] Caregiver matching — when decline is detected and family is unavailable, connect to local caregiver networks
- [ ] Clinical validation — validate the friction scoring model against real readmission outcomes with a university health system partner

---

## Running Locally

```bash
git clone https://github.com/YOUR_USERNAME/standwise
cd standwise/app
npm install
npm run dev:web
```

Open `http://localhost:5173`

To use live Claude agents, create `.env.local`:

```
VITE_ANTHROPIC_API_KEY=your_key_here
```

Without an API key, the agent pipeline runs in mock mode — all UI features work normally.

---

## Disclaimer

This is a prototype built for educational and research purposes at the AI Berkeley Hackathon
2026. It is not a medical device and is not intended for clinical use. Severe symptoms always
require emergency services. Patient data used in demos is entirely simulated.

---

## Built By

Adam Tang — Statistics BA + Computer Science, University of Florida
AI Berkeley Hackathon 2026
