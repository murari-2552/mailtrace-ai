import React, { useState } from 'react';
import { Globe, Search, ShieldCheck, AlertTriangle, ShieldX, RefreshCw, Server, Tag, Info } from 'lucide-react';
import { lookupThreatIntel } from '../services/api';

export const ThreatIntelPage: React.FC = () => {
  const [indicator, setIndicator] = useState('194.26.29.112');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!indicator.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await lookupThreatIntel(indicator.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  const quickSamples = [
    '194.26.29.112',
    '185.220.101.45',
    'sbii-security-update.com',
    'micros0ft-security-portal.com',
    'aicte-india.org'
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <span>THREAT INTELLIGENCE & IOC REPUTATION LOOKUP</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Multi-Provider Feed Aggregator (VirusTotal, AbuseIPDB, SafeBrowsing, RDAP) with Demo Fallback
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              placeholder="Enter IP address, domain name, or file SHA-256 hash..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs px-6 py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>QUERY INTELLIGENCE</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-500 text-[11px]">Quick Samples:</span>
          {quickSamples.map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setIndicator(sample);
                lookupThreatIntel(sample).then(setResult);
              }}
              className="bg-slate-950 border border-slate-800 hover:border-cyan-500 text-slate-300 px-2 py-0.5 rounded text-[11px] transition"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100">{result.indicator}</span>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Type: {result.type}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {result.is_simulated && (
                <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  DEMO / SIMULATED FEED
                </span>
              )}
              <span className={`text-xs font-bold px-2.5 py-1 rounded border ${
                result.category === 'MALICIOUS'
                  ? 'bg-red-950 text-red-400 border-red-800'
                  : result.category === 'SUSPICIOUS'
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}>
                {result.category} ({result.score}/100)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Telemetry Source:</span>
                <span className="text-slate-300">{result.source}</span>
              </div>

              {result.details?.detections && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Engine Detections:</span>
                  <span className="text-red-400 font-bold">{result.details.detections}</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase mb-1">Associated Threat Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {(result.details?.tags || ['Uncategorized']).map((t: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-slate-950 border border-slate-800 text-cyan-300 px-2 py-0.5 rounded text-[11px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-slate-400 text-[11px] leading-relaxed">
            <Info className="w-3.5 h-3.5 text-cyan-400 inline mr-1.5" />
            Integrates multi-feed threat intelligence abstraction. When external API keys are configured, live responses from AbuseIPDB, VirusTotal, and Google Safe Browsing replace the demo simulation provider automatically.
          </div>
        </div>
      )}
    </div>
  );
};
