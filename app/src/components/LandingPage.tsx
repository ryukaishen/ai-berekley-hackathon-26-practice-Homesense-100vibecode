import {
  ArrowRight,
  Building2,
  CheckCircle2,
  HeartHandshake,
  Home,
  Hospital,
  Move3D,
  Radar,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { DisclaimerBanner } from "./DisclaimerBanner";

interface LandingPageProps {
  onTryLiveCheck: () => void;
  onViewDashboard: () => void;
}

const audiences = [
  {
    title: "For Patients",
    icon: Home,
    copy: "A short guided check turns symptoms and movement into plain next steps.",
  },
  {
    title: "For Caregivers",
    icon: HeartHandshake,
    copy: "Know what needs help today, what to watch, and what to send the clinic.",
  },
  {
    title: "For Home Health / Rehab",
    icon: Users,
    copy: "Use a structured trend before the visit: stand, walk, turn, symptoms, and home tasks.",
  },
  {
    title: "For Hospitals",
    icon: Hospital,
    copy: "Prioritize post-discharge outreach before recovery friction becomes a fall or readmission.",
  },
];

const whyItems = [
  "Falls after discharge often happen between visits.",
  "Mobility decline can be subtle until a caregiver notices too late.",
  "Families are often unsure when to call for help.",
  "Avoidable readmissions are expensive, scary, and operationally painful.",
];

const businessItems = [
  { label: "Post-discharge monitoring", detail: "Daily or weekly checks for high-risk recovery windows." },
  { label: "Rehab support", detail: "PT/OT teams get a consistent home mobility trend." },
  { label: "Transitional care", detail: "Care managers see which patients need outreach first." },
  { label: "Home-health visits", detail: "Visit prep captures symptoms, mobility friction, and caregiver tasks." },
];

function HeroVisual() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="home-scene">
        <div className="home-wall" />
        <div className="home-floor" />
        <div className="home-window" />
        <div className="home-chair" />
        <div className="home-rug" />
        <div className="home-walk-path" />
        <div className="home-phone">
          <div className="phone-bar" />
          <div className="pose-line pose-line-a" />
          <div className="pose-line pose-line-b" />
          <div className="pose-line pose-line-c" />
          <div className="pose-dot pose-dot-a" />
          <div className="pose-dot pose-dot-b" />
          <div className="pose-dot pose-dot-c" />
          <div className="phone-wave">
            {Array.from({ length: 22 }).map((_, index) => (
              <span key={index} style={{ height: `${28 + Math.abs(Math.sin(index * 0.72)) * 54}%` }} />
            ))}
          </div>
        </div>
        <div className="sensor-pill sensor-pill-a">
          <Radar className="h-4 w-4" />
          Stability trend
        </div>
        <div className="sensor-pill sensor-pill-b">
          <Move3D className="h-4 w-4" />
          Sit-to-stand
        </div>
      </div>
    </div>
  );
}

export function LandingPage({ onTryLiveCheck, onViewDashboard }: LandingPageProps) {
  return (
    <main>
      <section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#edf7f4]">
        <HeroVisual />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-9rem)] max-w-7xl items-center px-4 py-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/78 px-3 py-2 text-sm font-black text-teal-800 shadow-sm">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              HomeSense Rehab Radar
            </div>
            <h1 className="text-5xl font-black leading-[0.98] text-slate-950 md:text-7xl">
              Catch recovery problems before the next fall or readmission.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-700 md:text-xl">
              HomeSense turns a simple mobility check into a clearer recovery plan for patients, caregivers, and care
              teams.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="primary-button" onClick={onTryLiveCheck}>
                <ScanLine className="h-5 w-5" aria-hidden="true" />
                Try Live Check
              </button>
              <button type="button" className="secondary-button" onClick={onViewDashboard}>
                <Building2 className="h-5 w-5" aria-hidden="true" />
                View Care-Team Dashboard
              </button>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["45 sec", "guided check"],
                ["4 demos", "clinical stories"],
                ["API-backed", "triage + dashboard sync"],
              ].map(([value, label]) => (
                <div key={label} className="stat-tile">
                  <p className="text-2xl font-black text-slate-950">{value}</p>
                  <p className="text-sm font-bold text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Who HomeSense helps</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Built around the handoff home.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              The app organizes recovery friction instead of pretending to diagnose. It gives each stakeholder a
              focused next step.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {audiences.map((audience) => {
              const Icon = audience.icon;
              return (
                <article key={audience.title} className="info-card">
                  <Icon className="h-6 w-6 text-teal-700" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-black text-slate-950">{audience.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{audience.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">Why this matters</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">The problem shows up in motion before it shows up in the chart.</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Patients recover in living rooms, bathrooms, bedrooms, and hallways. HomeSense makes the first 30 seconds
            of a demo obvious: a simple check becomes a risk-organized plan.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {whyItems.map((item) => (
            <div key={item} className="reason-row">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
              <p className="font-semibold leading-6 text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="business-band">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow text-amber-800">Business story</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">A practical layer for post-discharge risk operations.</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">
              HomeSense can start as a no-backend patient demo, then become a B2B workflow for hospitals, rehab teams,
              home health agencies, and transitional-care programs.
            </p>
            <button type="button" className="mt-6 inline-flex items-center gap-2 font-black text-slate-950" onClick={onViewDashboard}>
              Open dashboard preview <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {businessItems.map((item) => (
              <article key={item.label} className="business-card">
                <Stethoscope className="h-5 w-5 text-coral" aria-hidden="true" />
                <h3 className="mt-3 font-black text-slate-950">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <DisclaimerBanner />
      </section>
    </main>
  );
}
