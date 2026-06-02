# HomeSense AI Purpose

HomeSense AI is a polished healthcare AI hackathon demo that turns a mock phone photo or walking clip into a home recovery safety scan. It highlights fall risks, recovery hazards, caregiver tasks, score improvements, and clinic-ready follow-up summaries.

## purpose type shi

HomeSense AI turns a phone video or room photo into an AI-powered home recovery safety scan that detects fall risks, recovery hazards, caregiver tasks, and clinic follow-up needs before an injury happens.

## Current Features

- Landing page with patient, caregiver, clinic, rehab, and home health positioning.
- Four scenario-driven mock scans:
  - Elderly parent living alone
  - Post-knee-surgery recovery
  - Parkinson's mobility check
  - Post-hospital discharge home setup
- Animated AI scan timeline.
- Visual risk overlay with clickable hotspots.
- Home Safety, Fall Friction, and Recovery Readiness scores.
- Fall Risk Radar.
- Hazard cards with owners and time estimates.
- Mock pose/gait analysis.
- Caregiver checklist that improves scores as fixes are marked complete.
- Clinic dashboard preview with outreach priority.
- Clinic report generator and editable patient/caregiver message draft.
- Accessibility toggles for large text, high contrast, plain language, and Spanish summary.

## Safety 

HomeSense AI is currently only a prototype for organizing home safety observations. It does not diagnose, treat, prescribe, replace a licensed clinician, claim HIPAA compliance, store real patient data, or tell users to start, stop, or change medication. Severe, sudden, or life-threatening symptoms require emergency services.

## Tech Stack

- React + TypeScript frontend (Vite + Tailwind CSS)
- Node.js backend API (native HTTP server, validation, in-memory run store)
- Lucide icons
- Local demo data (no real patient storage)

## Run Locally

From the `app` directory:

```powershell
npm install
npm run dev
```

This now starts both:

- Frontend at `http://127.0.0.1:5173`
- Backend API at `http://127.0.0.1:8787`

If you want only one side:

```powershell
npm run dev:web
npm run dev:api
```

Open:

```text
http://127.0.0.1:5173
```

Build and lint:

```powershell
npm run build
npm run lint
```

npm was bootstrapped locally because the shell did not have npm on PATH. The app itself uses normal npm scripts once a Node/npm installation is available.

1. "Most patients do not recover in the hospital. They recover at home, where loose rugs, poor lighting, unclear medication routines, and missed caregiver tasks become real risks."
2. Open HomeSense AI and point to the headline: "Scan the home before recovery goes wrong."
3. Click `Try Safety Scan`.
4. Select `Elderly parent living alone` or `Post-knee-surgery recovery`.
5. Click `Scan Home Safety`.
6. During the animation, say: "The prototype simulates room mapping, hazard detection, gait confidence, caregiver task generation, and clinic summary creation."
7. When the overlay appears, click a hotspot: "This is the wow moment. A simple phone scan becomes a risk map with why it matters, what to fix, who owns it, and how long it takes."
8. Scroll to the checklist and mark a high-risk fix complete: "As caregivers complete tasks, the Home Safety, Fall Friction, and Recovery Readiness scores improve."
9. Show the mock gait panel: "This is not a diagnosis. It organizes mobility observations that should be discussed with a clinician or physical therapist."
10. Show the clinic report and message draft: "The same scan becomes a PT-ready summary and a patient-friendly follow-up message."
11. Open `Clinic Dashboard`: "The business workflow is prevention. Clinics can prioritize outreach instead of waiting for injuries or readmissions."

## Main Files

- `app/backend/server.mjs` - API server entrypoint and route handlers.
- `app/backend/services/assessmentService.mjs` - Backend validation + triage scoring logic.
- `app/backend/services/dashboardService.mjs` - Dashboard row generation from recent runs.
- `app/src/App.tsx` - Frontend navigation and backend-sync fallback logic.
- `app/src/services/backendApi.ts` - Typed fetch client for health/dashboard/assessment endpoints.
- `app/src/components/PoseCheckPanel.tsx` - Mobility run flow and backend assessment sync.
- `app/src/components/ResultsPage.tsx` - Result UI including backend triage explanation.
- `app/src/index.css` - Updated visual design system and animation styling.

## Future stuff to add

- Replace mock detections with object detection and segmentation for rugs, clutter, stairs, lighting, rails, and bathroom hazards.
- Add pose estimation for gait, turns, and support confidence.
- Add OCR for discharge instructions and medication labels with pharmacist/clinician confirmation workflows.
- Add human-in-the-loop review before clinical deployment.
- Integrate with EHR, patient portals, SMS check-ins, PT workflows, and remote patient monitoring.
