import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Trash2, Clock, Lock, CheckCircle2 } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const [piiMasking, setPiiMasking] = useState(false);
  const [retentionDays, setRetentionDays] = useState('90');
  const [allowExternalFeeds, setAllowExternalFeeds] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-4xl">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>PRIVACY CONTROLS & COMPLIANCE CONFIGURATION</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Data Protection Policy • PII Redaction • Configurable Retention Periods
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 font-mono text-xs">
        {/* PII Masking */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-200 uppercase">
              {piiMasking ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
              <span>Personally Identifiable Information (PII) Redaction</span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={piiMasking}
                onChange={(e) => setPiiMasking(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <p className="text-slate-400 font-sans leading-relaxed text-xs">
            When enabled, all recipient mailboxes and non-adversary corporate user addresses are dynamically sanitized across the analyst view (e.g. <span className="font-mono text-cyan-300">john.doe@corporate.in</span> displays as <span className="font-mono text-cyan-300">j***@corporate.in</span>).
          </p>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] text-slate-300">
            Example Preview: <span className="text-emerald-400 font-bold">{piiMasking ? 'u***@corporate.in' : 'user.executive@corporate.in'}</span>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase pb-2 border-b border-slate-800">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Telemetry & Ingestion Data Retention Policy</span>
          </div>

          <p className="text-slate-400 font-sans text-xs">
            Select the statutory archival duration for parsed email headers, extracted IOCs, and cached PDF dossiers. Immutable blockchain evidence records remain preserved permanently.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {['30', '60', '90', '180'].map((days) => (
              <label
                key={days}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${
                  retentionDays === days
                    ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{days} Days</span>
                <input
                  type="radio"
                  name="retention"
                  value={days}
                  checked={retentionDays === days}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  className="hidden"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Outbound Intelligence Privacy */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-200 uppercase">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>External Threat Feed Telemetry Privacy</span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowExternalFeeds}
                onChange={(e) => setAllowExternalFeeds(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <p className="text-slate-400 font-sans text-xs">
            Restricts sending raw email bodies or confidential corporate domains to third-party public reputation APIs. Only public IP addresses and anonymized file hashes are transmitted.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-4 h-4" /> Policy Saved
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition shadow-md"
          >
            Save Privacy Policy
          </button>
        </div>
      </form>
    </div>
  );
};
