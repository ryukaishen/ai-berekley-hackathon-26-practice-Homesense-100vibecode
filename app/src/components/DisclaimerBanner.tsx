import { AlertTriangle, ShieldCheck } from "lucide-react";

interface DisclaimerBannerProps {
  compact?: boolean;
}

export function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  return (
    <aside className={`disclaimer ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-teal-700">
          {compact ? <ShieldCheck className="h-5 w-5" aria-hidden="true" /> : <AlertTriangle className="h-5 w-5" aria-hidden="true" />}
        </div>
        <div className="grid gap-1 text-sm leading-6">
          <p className="font-black text-slate-950">Prototype safety note</p>
          <p className="text-slate-700">
            StandWise is a prototype for organizing recovery check information. It does not diagnose, treat,
            prescribe, change medication, or replace a licensed clinician. Do not enter real patient information into
            this demo.
          </p>
          {!compact ? (
            <p className="font-semibold text-slate-800">
              If symptoms are severe, sudden, or life-threatening, contact emergency services. Medication concerns
              should be confirmed with a clinician or pharmacist.
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

