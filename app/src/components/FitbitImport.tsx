import { useState } from 'react';
import { mockTracks } from '../data/mockTracks';
import type { RecoveryTrack } from '../types/index';

interface Props {
  onImport: (track: RecoveryTrack) => void;
}

export function FitbitImport({ onImport }: Props) {
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [showFakeOAuth, setShowFakeOAuth] = useState(false);

  const handleLoad = (track: RecoveryTrack) => {
    setLoadedId(track.id);
    onImport(track);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h2 className="text-xl font-semibold text-slate-800 mb-1">Connect your wearable data</h2>
      <p className="text-slate-600 text-sm mb-6">
        ReEntry works with Fitbit and Fitbit-compatible devices. For this demo, choose a recovery
        scenario to simulate imported data.
      </p>

      <div className="space-y-3 mb-6">
        {mockTracks.map(track => (
          <div
            key={track.id}
            className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">{track.label}</p>
                <p className="text-sm text-slate-500 mt-0.5">{track.description}</p>
                <p className="text-xs text-slate-400 mt-1">{track.days.length} days of data</p>
              </div>
              <button
                onClick={() => handleLoad(track)}
                className="shrink-0 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Load this scenario
              </button>
            </div>
            {loadedId === track.id && (
              <p className="mt-2 text-sm text-green-700 font-medium">
                Loaded: {track.label} — {track.days.length} days of data ready.
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-slate-400 text-sm">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <button
        onClick={() => setShowFakeOAuth(v => !v)}
        className="w-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm py-2.5 rounded-lg transition-colors"
      >
        Connect Fitbit account (demo)
      </button>
      {showFakeOAuth && (
        <p className="mt-2 text-sm text-slate-500 text-center">
          Fitbit OAuth would launch here. This prototype uses simulated data.
        </p>
      )}

      <p className="mt-6 text-xs text-slate-400 text-center">
        This prototype uses simulated data only. No real health data is collected or stored.
      </p>
    </div>
  );
}
