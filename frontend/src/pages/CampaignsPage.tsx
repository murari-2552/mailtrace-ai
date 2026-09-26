import React, { useState, useEffect } from 'react';
import { FolderGit2, ShieldAlert, Layers, ExternalLink, Hash, Globe, Server } from 'lucide-react';
import { fetchCampaigns } from '../services/api';

export const CampaignsPage: React.FC<{ onSelectCase?: (caseId: string) => void }> = ({ onSelectCase }) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    fetchCampaigns().then(setCampaigns);
  }, []);

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-cyan-400" />
          <span>CAMPAIGN CORRELATION & THREAT CLUSTERS</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Multi-Incident Infrastructure Clustering • Attribution Support • Cross-Case Indicator Matching
        </p>
      </div>

      <div className="space-y-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4 font-mono text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold text-sm">{camp.id}</span>
                <span className="text-slate-100 font-bold text-sm">— {camp.name}</span>
              </div>

              <span className="text-[11px] uppercase bg-purple-950/80 border border-purple-800 text-purple-300 px-2.5 py-1 rounded">
                Active Threat Campaign
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed font-sans text-xs">
              {camp.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1.5">
                <span className="text-slate-500 uppercase text-[10px] block font-bold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Correlated Sending Domains:
                </span>
                <div className="space-y-1 text-slate-200">
                  {camp.domains.map((d: string) => (
                    <div key={d} className="truncate">@{d}</div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1.5">
                <span className="text-slate-500 uppercase text-[10px] block font-bold flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  Correlated Sending IPs:
                </span>
                <div className="space-y-1 text-slate-200">
                  {camp.ips.map((ip: string) => (
                    <div key={ip}>{ip}</div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1.5">
                <span className="text-slate-500 uppercase text-[10px] block font-bold flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-purple-400" />
                  Linguistic Template Markers:
                </span>
                <div className="space-y-1 text-slate-300">
                  {camp.keywords.map((kw: string) => (
                    <div key={kw} className="truncate">"{kw}"</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded text-[11px] text-slate-500 flex items-center justify-between">
              <span>*Investigative Support: Indicates shared infrastructure patterns across investigations. Does not establish legal identity.</span>
              <span className="text-cyan-400 font-bold">Attribution Confidence: HIGH</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
