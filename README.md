# StandWise

StandWise is a home recovery copilot for people who are trying to recover safely after discharge, surgery, illness, or a mobility setback. It is designed for low-energy, low-literacy, caregiver-assisted use: huge buttons first, plain next steps, read-aloud support, and simple helper handoff.

## what is ts? 

StandWise helps patients and caregivers know what to do today, when to ask for help, and how a care team should prioritize follow-up before recovery friction becomes a fall or readmission.

## the demo

- `Today` screen that opens directly into a usable recovery plan.
- `Big Button Mode` for older adults or overwhelmed users: "I feel okay", "Something changed", or "I need help."
- Read-aloud instructions using browser speech synthesis.
- One-tap helper note for family or caregivers.
- Scenario-specific daily checklist and home safety setup.
- Friction reducer for common real-world blockers: alone at home, pain, time, stairs, and transportation.
- Copyable family care card.
- Appointment-prep questions for PT, clinic, or home health.
- 45-second mock mobility check with sit-to-stand, walking, turning, webcam, device motion, and optional ESP32 modes.
- Prototype mobility metrics and recovery friction score.
- Caregiver mode with task owners and red flags.
- Editable clinic, PT/OT, and home-health message drafts.
- Care-team dashboard with outreach priority.
- Accessibility toggles for large text, high contrast, plain language, and Spanish summary.

## It's not just a gpt wrapper I swear

The app has local scoring and workflow logic:

- Mock sensor stream generation.
- Motion metrics for sit-to-stand, sway, turn confidence, completion trend, and symptom burden.
- Recovery friction scoring.
- Rule-based finding generation.
- Caregiver task generation.
- Backend triage summary and dashboard sync with local fallback.
- Human-review message drafting.

Any future LLM layer should translate structured results into plain language, not replace the scoring or safety workflow.

## Safety 

StandWise is a only prototype for organizing recovery check information for now. It does not yet diagnose, treat, prescribe, replace a licensed clinician, claim HIPAA compliance, store real patient data, or tell users to start, stop, or change medication. Severe, sudden, or life-threatening symptoms require emergency services.

## Tech Stack

- React + TypeScript frontend
- Vite + Tailwind CSS
- Node.js backend API with native HTTP server
- Lucide icons
- Local mock scenarios and sensor streams

## Run Locally

From the `app` directory:

```powershell
npm install
npm run dev
```

This starts:

- Frontend at `http://127.0.0.1:5173`
- Backend API at `http://127.0.0.1:8787`

Build and lint:

```powershell
npm run build
npm run lint
```

## 60-Second Judge Demo Script

1. Open `Today`.
2. Say: "The audience may be tired, older, scared, or not comfortable with apps, so the first screen is three huge choices."
3. Tap `I need help`, show the plain next step, then press `Read aloud` and `Tell my helper`.
4. Pick a scenario and show the daily plan, home scan, friction reducer, family care card, and appointment prep.
5. Click `Run 45-sec Check`.
6. Run the mock mobility check.
7. Show recovery friction score, mobility confidence, findings, caregiver mode, and red flags.
8. Copy an editable message draft for clinic or PT/OT.
9. Open `Care Team`.
10. Say: "The same home checks become an outreach queue for hospitals, rehab teams, and home health."

## Resume Bullet

Built StandWise, a React/TypeScript home recovery copilot that simulates mobility sensor streams, computes recovery friction metrics, generates caregiver tasks and care-team summaries, and provides a dashboard for post-discharge outreach prioritization.
