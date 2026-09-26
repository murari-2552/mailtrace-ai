import React from 'react';
import { Globe, Link, ArrowRight, AlertTriangle, ShieldCheck, ExternalLink, Calendar, Server } from 'lucide-react';
import { DomainIntel, URLIntel } from '../../types';

interface DomainUrlIntelProps {
  domains: DomainIntel[];
  urls: URLIntel[];
}

export const DomainUrlIntel: React.FC<DomainUrlIntelProps> = ({ domains, urls }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            DOMAIN & URL THREAT INTELLIGENCE
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {domains.length} Domain{domains.length !== 1 ? 's' : ''} • {urls.length} URL{urls.length !== 1 ? 's' : ''} Extracted
        </span>
      </div>

      {/* Part 1: Domain Intelligence & Typosquatting */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider flex items-center gap-2">
          <span>1. Domain Forensics & Typosquatting Detection</span>
          <span className="text-[10px] bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-700">
            Brand Heuristics
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains.map((dom, idx) => (
            <div
              key={idx}
              className={`border rounded-xl p-4 space-y-3 font-mono text-xs ${
                dom.is_lookalike
                  ? 'bg-red-950/20 border-red-800/80 shadow-sm shadow-red-950'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <span className="font-bold text-sm text-slate-100 block">{dom.domain}</span>
                  <span className="text-[10px] text-slate-500">Registrar: {dom.registrar || 'Private Registration'}</span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    dom.reputation_score < 30
                      ? 'bg-red-950 text-red-400 border-red-800'
                      : dom.reputation_score < 70
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}>
                    Reputation: {dom.reputation_score}/100
                  </span>
                  {dom.age_days !== undefined && (
                    <span className="text-[10px] text-slate-400">
                      Age: {dom.age_days} day{dom.age_days !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Typosquatting Alert Box */}
              {dom.is_lookalike && (
                <div className="bg-red-950/50 border border-red-800/90 rounded-lg p-2.5 space-y-1 text-red-300">
                  <div className="flex items-center gap-1.5 font-bold text-red-400 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>TYPOSQUATTING ALERT: {dom.impersonated_brand}</span>
                  </div>
                  <div className="text-[11px] text-red-200">
                    <strong>Pattern:</strong> {dom.similarity_type}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {dom.similarity_explanation}
                  </div>
                </div>
              )}

              {/* DNS Records */}
              <div className="space-y-1 text-[11px] text-slate-400 pt-1">
                <div>
                  <span className="text-slate-500">MX Servers:</span> {dom.mx_records.length > 0 ? dom.mx_records[0] : 'None'}
                </div>
                <div>
                  <span className="text-slate-500">A Records:</span> {dom.a_records.join(', ') || 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: URL Intelligence & Redirect Chains */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider flex items-center gap-2">
          <span>2. URL Forensics & Redirect Chain Inspection</span>
          <span className="text-[10px] bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-700">
            Safe Emulation
          </span>
        </h4>

        {urls.length === 0 ? (
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-500 text-center">
            No active hyperlinks or external web addresses identified in email body.
          </div>
        ) : (
          <div className="space-y-3">
            {urls.map((u, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3 font-mono text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate max-w-lg">
                    <Link className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-slate-200 truncate">{u.url}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                      u.reputation === 'MALICIOUS'
                        ? 'bg-red-950 text-red-400 border-red-800'
                        : u.reputation === 'SUSPICIOUS'
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}>
                      {u.reputation}
                    </span>

                    {u.is_shortener && (
                      <span className="text-[10px] uppercase bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">
                        URL Shortener
                      </span>
                    )}

                    {u.is_credential_harvester && (
                      <span className="text-[10px] uppercase bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded">
                        Cred Harvester
                      </span>
                    )}
                  </div>
                </div>

                {/* Redirect Chain Visualization */}
                {u.redirect_count > 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Redirect Chain ({u.redirect_count} Hops to Final Destination):
                    </span>

                    <div className="space-y-1.5 pl-2 border-l-2 border-cyan-500/40 text-[11px]">
                      {u.redirect_chain.map((hopUrl, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-2 text-slate-300">
                          <span className="text-slate-500 font-bold shrink-0">#{hIdx + 1}</span>
                          <span className={`truncate ${hIdx === u.redirect_chain.length - 1 ? 'text-red-400 font-bold' : ''}`}>
                            {hopUrl}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Direct endpoint: no intermediary redirection hops detected.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
