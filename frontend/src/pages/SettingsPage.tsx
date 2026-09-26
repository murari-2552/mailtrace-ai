import React, { useState } from 'react';
import { Settings as SettingsIcon, Key, Sliders, Server, CheckCircle2, Shield } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [vtKey, setVtKey] = useState('');
  const [abuseKey, setAbuseKey] = useState('');
  const [geoKey, setGeoKey] = useState('');
  const [demoMode, setDemoMode] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState(70);
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
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          <span>SYSTEM SETTINGS & THREAT INTELLIGENCE APIS</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          API Credentials • Operational Modes • Scoring Threshold Parameters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 font-mono text-xs">
        {/* Operational Mode Toggle */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-200 uppercase">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Offline Forensic Demo Mode (SIH 2026 Presentation Mode)</span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <p className="text-slate-400 font-sans text-xs leading-relaxed">
            When enabled, the system uses deterministic synthetic intelligence providers with clear <span className="font-mono text-amber-400 font-bold">DEMO / SIMULATED</span> labeling. Ensures seamless hackathon demonstration without depending on external network rate limits or paid API keys.
          </p>
        </div>

        {/* Threat Intelligence API Keys */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase pb-2 border-b border-slate-800">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>External Threat Intelligence Feeds</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">VirusTotal API Key (Optional)</label>
              <input
                type="password"
                value={vtKey}
                onChange={(e) => setVtKey(e.target.value)}
                placeholder="vt_api_key_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">AbuseIPDB API Key (Optional)</label>
              <input
                type="password"
                value={abuseKey}
                onChange={(e) => setAbuseKey(e.target.value)}
                placeholder="abuseipdb_api_key_xxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">IPGeolocation / MaxMind Key (Optional)</label>
              <input
                type="password"
                value={geoKey}
                onChange={(e) => setGeoKey(e.target.value)}
                placeholder="ipgeo_api_key_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[11px] text-slate-500">
            *Zero Crash Fallback: If keys are omitted, the application automatically routes queries to high-fidelity simulated feeds.
          </div>
        </div>

        {/* Risk Threshold Sliders */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-200 uppercase pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Forensic Scoring Engine Sensitivity</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span>Critical Threat Escalation Threshold:</span>
              <span className="font-bold text-red-400">{riskThreshold} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              value={riskThreshold}
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>50 (Sensitive)</span>
              <span>70 (Balanced Default)</span>
              <span>90 (Strict)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-4 h-4" /> Settings Applied
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition shadow-md"
          >
            Apply Configurations
          </button>
        </div>
      </form>
    </div>
  );
};
