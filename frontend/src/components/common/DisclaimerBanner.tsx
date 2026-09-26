import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded flex items-center gap-2 font-mono">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>
          <strong>Investigative Forensics Standard:</strong> Geolocation and infrastructure attributions represent probabilistic technical associations, not proof of individual human identity.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 font-mono shadow-sm">
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>Forensic Evidence Standard</span>
            <span className="text-[10px] bg-slate-800 text-cyan-400 px-1.5 py-0.2 rounded border border-slate-700">SIH 2026 Core Principle</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            MAILTRACE AI strictly demarcates between <strong className="text-emerald-400">FACT</strong> (cryptographic signatures, header hashes), <strong className="text-cyan-400">OBSERVATION</strong> (MTA hops, resolved DNS records), <strong className="text-amber-400">INDICATOR</strong> (anomalous reply-to, typosquatting), <strong className="text-purple-400">AI INFERENCE</strong> (social engineering intent, BEC cues), and <strong className="text-rose-400">INVESTIGATIVE HYPOTHESIS</strong> (campaign attribution). Observed sending infrastructure does not definitively establish individual physical location or culpability.
          </p>
        </div>
      </div>
    </div>
  );
};
