# HomeSense AI Hackathon Playbook

## Product Story

HomeSense AI focuses on the dangerous gap after discharge. Patients are sent home with instructions, but the care team usually cannot see the actual hallway, bathroom, stairs, lighting, chair height, clutter, medication routine, or caregiver task handoff.

HomeSense AI turns a simple phone scan into a home recovery safety map so patients, caregivers, rehab teams, home health agencies, and clinics can prevent problems earlier.

## Winning Demo Arc

1. Start on the landing page.
2. Say: "Healthcare does not end at discharge. It continues in hallways, bathrooms, stairs, bedrooms, and kitchens."
3. Click `Try Safety Scan`.
4. Pick a scenario.
5. Click `Scan Home Safety`.
6. Let the analysis animation run.
7. Show the visual risk overlay.
8. Click a hazard hotspot.
9. Mark a caregiver fix complete.
10. Show score improvement.
11. Show gait/mobility mock analysis.
12. Show clinic report and patient message draft.
13. Open the clinic dashboard.
14. Close with: "HomeSense AI gives clinics scalable home context and gives caregivers concrete tasks before a preventable fall or readmission happens."

## What To Emphasize

- This is not an AI doctor.
- This is a home recovery safety scanner.
- The app solves a real workflow: after-discharge home risk, caregiver task clarity, and clinic outreach prioritization.
- The visible transformation is the memorable moment: room scene to risk map to checklist to clinic report.
- The business path is B2B SaaS for rehab clinics, home health agencies, hospitals, and value-based care programs.

## What To Avoid Saying

- "We diagnose fall risk."
- "We prescribe treatment."
- "This replaces a clinician."
- "This is HIPAA compliant."
- "The prototype analyzes real patient data."
- "Patients should change medication based on this."

## Technical Story

The prototype uses local mock detections. A production version could combine:

- Computer vision object detection for home hazards.
- Pose estimation for gait, turns, and support needs.
- OCR for medication labels and discharge instructions.
- Speech-to-text for caregiver notes.
- AI report generation for clinics and caregivers.
- Human-in-the-loop clinical safety review.

## Business Model

- Per-clinic monthly subscription.
- Per-scan fee for discharge and rehab programs.
- Enterprise contracts for hospitals and home health agencies.
- Future integrations with EHR, patient portals, SMS, PT workflows, and remote patient monitoring.

## Local Commands

```powershell
cd app
npm install
npm run dev
npm run build
npm run lint
```
