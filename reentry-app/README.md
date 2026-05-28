# reentry-app

Monorepo scaffold for **ReEntry**, a non-clinical support app with a shared design system.

## Stack

- `apps/web`: Vite + React + TypeScript + Tailwind + React Router
- `apps/api`: Node + Fastify + TypeScript + Zod
- `packages/ui`: shared UI components and design tokens
- `packages/shared`: shared enums and types

## Monorepo layout

```text
reentry-app/
  apps/
    web/
    api/
  packages/
    ui/
    shared/
  scripts/
```

## Routes (web)

- `/`
- `/demo`
- `/agents`
- `/fitbit`
- `/clinic`
- `/scenarios`
- `/onboarding`
- `/episode/new`
- `/check-in`
- `/plan`
- `/support-circle`
- `/handoff`
- `/history`

## Global disclaimer banner

Rendered at the top of every route:

> ReEntry is a non-clinical support tool. It does not diagnose, treat, prescribe, or replace a licensed professional.

## Design system goals implemented

- Calm visual tone (soft gradients + muted palette) without a clinical feel
- Large card surfaces with generous spacing
- Keyboard accessibility (skip link, focus-visible rings, semantic landmarks)
- Dark mode (`data-theme="dark"` toggle persisted in localStorage)
- Reduced motion support (`prefers-reduced-motion`)
- Scenario picker with six reusable packs and a preview-only StandWise import flow
- Multi-agent recovery workflow for signal detection, safety routing, plan generation, caregiver coordination, and clinician handoff
- Fitbit demo import with 14-day recovery tracks, baseline deviation, domain-labeled friction forecast, data freshness, and agent outputs
- Demographic + recovery-track onboarding for age range, school/work context, support availability, and privacy boundaries
- Google Health OAuth adapter for live Fitbit/Pixel Watch data, with mock fallback when credentials are not configured
- Deterministic demo model training and clinic/campus support-priority dashboard
- Multi-step check-in flow with deterministic recovery friction scoring
- History view with episode timeline, completed actions, and a lightweight recovery friction trend

## What "recovery friction" means

Recovery friction is the measurable drag that makes a normal day harder during a setback. ReEntry does not treat friction as a diagnosis. It treats friction as a practical support signal: what is making recovery harder today, what can be made smaller, and who may need to help.

The score combines eight concrete friction domains:

- **Body capacity:** low energy, fatigue, pain, dizziness, nausea, low appetite, or sensory overload.
- **Routine stability:** sleep disruption, missed meals, missed appointments, no meals today, or routine blockers stacking up.
- **Cognitive load:** brain fog, decision fatigue, deadlines, focus problems, panic loops, or task-start paralysis.
- **Social load:** loneliness, overfull social demands, support avoidance, or needing help but not knowing how to ask.
- **Practical blockers:** transportation, money, meals, housing, chores, deadlines, appointment prep, or school/work accommodations.
- **Wearable drift:** steps down, active minutes down, resting heart rate up, HRV down, or sleep below the user's own baseline.
- **Data confidence:** stale wearable sync, missing data, manual-only check-ins, or incomplete context.
- **Safety flags:** crisis language, urgent-message flags, or anything that should route to emergency, clinician, or trusted-person support instead of normal coaching.

In plain language:

> Most wearable apps say, "Your sleep was bad." ReEntry says, "Your sleep, activity, routine, and support capacity changed from your baseline. Here is the smallest next action, who could help, and what a care team needs to know without over-sharing."

## Current capability map

ReEntry is a recovery coordination prototype, not a passive wellness tracker. The working app currently:

- Runs demographic and recovery-track onboarding for age range, school/work context, living situation, support availability, consent, and privacy boundaries.
- Connects to Google Health OAuth for Fitbit/Pixel Watch-style wearable access, with mock data fallback for demo reliability.
- Imports wearable-style recovery signals: sleep, steps, active minutes, resting heart rate, HRV-style recovery data, and sync freshness.
- Compares today against the user's own baseline instead of generic goals.
- Calculates deterministic recovery friction and tomorrow high-friction risk from named friction domains.
- Runs a five-stage workflow: Signal Agent, Safety Agent, Care Plan Agent, Caregiver Agent, and Clinician Summary Agent.
- Supports specific recovery tracks such as new diabetes diagnosis, burnout spiral, post-surgery fatigue, and stable recovery.
- Manages a support circle with sharing boundaries and permission-gated help-request drafts.
- Shows a clinic/campus dashboard with synthetic model training, support-priority labels, model drivers, and handoff summaries.
- Provides history, completed actions, and recovery friction trend views.
- Includes safety tests for diagnosis language, medication advice, coercive copy, crisis handling, and permission leaks.

## Scenario packs

- First Week After Discharge
- Returning After Surgery
- Breakup Stabilizer
- Finals Burnout
- New City Loneliness
- Bad Health Week

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Run both apps in development:

```bash
npm run dev
```

3. Individual app dev commands:

```bash
npm run dev:web
npm run dev:api
```

## Available scripts (root)

- `npm run dev` - run `web` and `api` concurrently
- `npm run dev:web` - run web app only
- `npm run dev:api` - run API only
- `npm run build` - build all workspaces that expose `build`
- `npm run typecheck` - run workspace typechecks
- `npm run test:safety` - run deterministic safety checks against the eval dataset
- `npm run clean` - remove generated `dist` folders

## Database

The API uses Node's built-in SQLite driver and stores local data at `apps/api/data/reentry.sqlite` by default. Override the path with `REENTRY_DB_PATH`.

API startup runs migrations automatically. Demo seed data is inserted idempotently unless `REENTRY_SEED_DEMO=false` is set.

API workspace commands:

```bash
npm run db:migrate --workspace @reentry/api
npm run db:seed --workspace @reentry/api
npm run db:status --workspace @reentry/api
```

Seed data includes:

- 1 demo user: `user_demo_001`
- 6 transition episodes, one per scenario pack
- 3 support-circle members

## Check-in scoring

The check-in score is rule-based only. It does not call or depend on an AI model.

Inputs:

- Energy, sleep quality, cognitive load, and social load on 1-5 scales
- Body state tags
- Practical blocker tags
- Optional note
- Optional imported StandWise flags

Outputs:

- `recoveryFrictionScore` from 0-100
- `mode`: `stabilize`, `ask-help`, `routine-restart`, or `escalate-human`
- Top blockers, confidence, and evidence list

The score is a support-priority signal. It is intentionally about barriers to action, not a mental-health label.

## Plan generation

`POST /plan-cards/generate` accepts a scored check-in and returns exactly three deterministic plan cards:

- One stabilizing action
- One practical action
- One support action

Each card includes title, why it helps, estimated time, effort level, optional message target, and a lighter fallback.

## Multi-agent recovery workflow

The `/agents` route and `POST /agents/recovery-workflow` endpoint demonstrate the hackathon-ready recovery pipeline:

- Signal Agent: reads structured check-in and wearable-style data to identify recovery friction signals
- Safety Agent: uses deterministic red-flag rules and blocks unsafe AI coaching for crisis language
- Care Plan Agent: turns the scored check-in into exactly three next-step cards
- Caregiver Agent: drafts a helper message with permission and sharing boundaries
- Clinician Summary Agent: creates a concise handoff summary from structured facts only

Important design principle:

> Rules decide risk. AI explains and communicates.

No agent diagnoses, prescribes, changes medication instructions, auto-sends messages, or fabricates facts.

## Fitbit demo import

The `/fitbit` route demonstrates a wearable-powered recovery loop without depending on live OAuth during a demo.

It includes four focused recovery tracks:

- New Diabetes Diagnosis
- Burnout Spiral
- Post-Surgery Fatigue
- Stable Recovery

The demo imports 14 days of Fitbit-style daily summaries, compares today against the user's recent baseline, and outputs:

- baseline averages
- today-vs-baseline deltas
- recovery friction score
- tomorrow high-friction risk
- data freshness and confidence
- Signal Agent findings
- Safety Agent route
- caregiver draft
- clinician summary

This is intentionally framed as recovery coordination, not general wellness tracking.

## Demographic onboarding

The `/onboarding` route asks for:

- Age range
- School/work status
- Living situation
- Recovery track
- Support availability
- Wearable availability
- Data-use consent
- Caregiver-sharing consent
- Clinician-summary consent
- Privacy boundaries
- Tone preference

The generated setup is used to choose a recovery workflow and sharing posture. It does not diagnose or infer treatment.

## Google Health and Fitbit OAuth

The live wearable path uses Google Health API OAuth because Fitbit developer registration has moved into Google's newer health platform. Mock data remains available as a safe demo fallback.

Preferred Google Health routes:

- `GET /google-health/status`
- `GET /google-health/login`
- `GET /google-health/callback`
- `GET /google-health/summary`

Environment variables:

```bash
GOOGLE_HEALTH_CLIENT_ID=
GOOGLE_HEALTH_CLIENT_SECRET=
GOOGLE_HEALTH_REDIRECT_URI=https://your-ngrok-or-api-host.example.com/google-health/callback
```

Legacy Fitbit-compatible routes are still present for migration demos:

- `GET /fitbit/status`
- `GET /fitbit/login`
- `GET /fitbit/callback`
- `GET /fitbit/summary`

Prototype note: Google Health and Fitbit tokens are stored in memory only. Production needs encrypted token storage, refresh handling, audit logs, and a clear revocation flow.

## Demo model training and care dashboard

The `/clinic` route shows a mock clinic/campus queue powered by a deterministic demo logistic model trained on synthetic recovery-track examples.

It displays:

- Model examples, accuracy, precision, and recall
- Campus/clinic/rehab queue filters
- Domain-labeled recovery friction and tomorrow-risk scores
- Top model drivers
- Suggested owner
- Clinician-ready handoff copy

This is a business wedge for campus wellness teams, diabetes education programs, outpatient rehab, and post-discharge coordination. It predicts support priority, not diagnosis.

## Planned next builds

- Real Google Health data normalization for more metric types, missing-data cases, and API edge cases.
- Persistent encrypted token storage instead of in-memory prototype tokens.
- More recovery tracks: diabetes diagnosis, depression relapse risk, anxiety/panic recovery, ADHD/executive crash, substance-craving relapse, PTSD flashback support, and post-discharge confusion.
- Better model training with labeled synthetic data first, then real consented datasets when available.
- Caregiver portal where approved helpers can see assigned tasks without private details.
- Campus/clinic admin dashboard with outreach status, filters, reviewed/resolved workflows, and owner assignment.
- Notification system for check-ins, stale wearable sync, and consented support nudges.
- Anthropic/Claude integration for structured rewrites, summaries, and tone adjustment only. Rules still decide risk.
- Stronger demo script: onboard -> connect Google Health -> import data -> detect friction -> run agents -> create caregiver and clinician handoff.

## Support circle

Support-circle members include name, role, preferred channel, help categories, sharing exclusions, tone preference, and emergency-only status.

The help-request composer can generate:

- Short SMS-style draft
- Fuller text or email draft
- Copy-only draft when the user chooses not to send or the member is emergency-only for non-urgent asks

Draft generation omits topics listed in that member's sharing exclusions.

## History

The `/history` route shows a timeline of episodes and completed actions alongside a lightweight recovery friction trend. The API also exposes `GET /users/:userId/history` for reusable timeline and trend data.

## AI adapter

The API includes a provider-agnostic AI adapter for optional language help. If no API key is present, it uses a deterministic no-op fallback.

Configuration:

- `AI_API_KEY` or `OPENAI_API_KEY` - enables the provider adapter
- `AI_BASE_URL` - optional OpenAI-compatible chat completions URL
- `AI_MODEL` - optional model name

AI endpoints accept structured JSON only:

- `POST /ai/plan-explanation`
- `POST /ai/support-request-rewrite`
- `POST /ai/care-handoff-summary`

Allowed AI behavior:

- Rewrite for plain language
- Improve tone
- Shorten or expand for audience
- Summarize structured facts

Disallowed AI behavior:

- Diagnose
- Prescribe
- Infer medication changes
- Simulate crisis counseling
- Fabricate facts not present in the structured input

## Safety tests and evals

The safety suite is deterministic and uses `apps/api/evals/safety.eval.json`.

Run it with:

```bash
npm run test:safety
```

The suite checks:

- No diagnosis-style assertions
- No medication advice
- No coercive or guilt-inducing copy
- Crisis mentions include emergency or human support language
- Permission-restricted fields do not leak into message drafts

## Production artifacts

- `Dockerfile` - Docker backend image for the API service
- `.env.production.example` - production environment template
- `docs/deployment.md` - Render or Railway API deployment plus Vercel web deployment notes

## API endpoints

- `GET /health`
- `GET /docs`
- `GET /docs.json`
- `GET /users/:userId`
- `GET /users/:userId/episodes`
- `POST /episodes`
- `GET /episodes/:episodeId/check-ins`
- `POST /check-ins`
- `POST /plan-cards/generate`
- `POST /agents/recovery-workflow`
- `GET /fitbit/status`
- `GET /fitbit/login`
- `GET /fitbit/callback`
- `GET /fitbit/summary`
- `GET /google-health/status`
- `GET /google-health/login`
- `GET /google-health/callback`
- `GET /google-health/summary`
- `POST /onboarding/recommend`
- `POST /model/train`
- `POST /model/predict`
- `GET /clinic/dashboard`
- `GET /users/:userId/support-circle`
- `GET /support-circle-members/:memberId`
- `POST /support-circle-members`
- `PATCH /support-circle-members/:memberId`
- `DELETE /support-circle-members/:memberId`
- `POST /help-request-drafts/compose`
- `POST /ai/plan-explanation`
- `POST /ai/support-request-rewrite`
- `POST /ai/care-handoff-summary`
- `POST /help-request-drafts`
- `POST /handoff-notes`
- `GET /users/:userId/event-logs`
- `GET /users/:userId/history`
- `GET /routes`

Default API dev port: `8787`.
Default web dev port: `5173`.
