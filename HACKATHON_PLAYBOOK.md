# StandWise Hackathon Playbook

## Product Story

StandWise focuses on the dangerous gap after discharge. Patients are sent home with instructions, but the real recovery happens in chairs, hallways, bathrooms, kitchens, stairs, and caregiver handoffs.

The product has two sides:

- A consumer app that tells a patient or caregiver what to do today, with a low-literacy Big Button Mode.
- A care-team dashboard that turns home checks into outreach priority.

## Winning Demo Arc

1. Start on `Today`.
2. Say: "This is not another dashboard for doctors. It is built for someone tired, older, overwhelmed, or not comfortable with apps."
3. Show `Big Button Mode`: `I feel okay`, `Something changed`, and `I need help`.
4. Tap `I need help`, then show `Read aloud` and `Tell my helper`.
5. Show the selected patient scenario.
6. Walk through the daily checklist and home safety setup.
7. Use the friction reducer to show how the app adapts if the patient is alone, in pain, short on time, worried about stairs, or struggling with transportation.
8. Copy the family care card.
9. Click `Run 45-sec Check`.
10. Run the mock mobility check.
11. Show recovery friction score, mobility confidence, findings, and caregiver mode.
12. Copy a clinic or PT/OT message draft.
13. Open `Care Team` and show outreach priority.
14. Close with: "StandWise gives families concrete next steps and gives care teams earlier signal before a preventable fall or readmission."

## What To Emphasize

- It is useful before the check, during the check, and after the check.
- It respects the actual user: big buttons, little reading, read-aloud support, and caregiver handoff.
- It is not a diagnostic device.
- It organizes recovery friction, symptoms, caregiver tasks, and follow-up language.
- It has a consumer wedge and a B2B path.
- It feels physical because the demo uses movement, home setup, and optional device-motion inputs.

## What To Avoid Saying

- "We diagnose fall risk."
- "We prescribe treatment."
- "This replaces a clinician."
- "This is HIPAA compliant."
- "Patients should change medication based on this."

## Technical Story

The prototype uses:

- React + TypeScript.
- Mock mobility sensor streams.
- Optional webcam, browser device motion, and ESP32 signal modes.
- Recovery friction scoring.
- Rule-based finding generation.
- Caregiver task generation.
- Backend triage summary and dashboard sync.
- Accessibility modes and Spanish summary support.

## Business Story

Start consumer-facing with family recovery plans. Expand B2B into:

- Rehab clinics.
- Home health agencies.
- Hospital discharge programs.
- Value-based care teams.
- Remote patient monitoring programs.

## Rebuild Plan For The Hackathon

1. Build the `Today` screen first.
2. Add mock scenarios and caregiver tasks.
3. Add the 45-second mobility check.
4. Add recovery friction scoring.
5. Add result summaries and message drafts.
6. Add the care-team dashboard.
7. Polish accessibility, copy, and demo flow.

## Local Commands

```powershell
cd app
npm install
npm run dev
npm run build
npm run lint
```
