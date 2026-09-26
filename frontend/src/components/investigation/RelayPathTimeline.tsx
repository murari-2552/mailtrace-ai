import React from 'react';
import { Route, Server, AlertTriangle, CheckCircle, Clock, MapPin, Globe } from 'lucide-react';
import { RelayHop } from '../../types';

interface RelayPathTimelineProps {
  hops: RelayHop[];
  originCandidate?: RelayHop;
}

export const RelayPathTimeline: React.FC<RelayPathTimelineProps> = ({ hops, originCandidate }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Route className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            RELAY PATH & EMAIL ROUTING FORENSICS ({hops.length} HOPS DETECTED)
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Chronological Reconstruction</span>
      </div>

      {/* Earliest Origin Highlight */}
      {originCandidate && (
        <div className="bg-cyan-950/30 border border-cyan-500/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                EARLIEST RELIABLE ORIGIN CANDIDATE
              </span>
              <span className="text-slate-400">Confidence: <strong className="text-cyan-400">{originCandidate.origin_confidence}%</strong></span>
            </div>
            <div className="mt-1 text-slate-200">
              IP: <span className="font-bold text-cyan-400">{originCandidate.from_ip || 'Private Host'}</span> | Host: {originCandidate.from_host || 'N/A'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Approximate Location: {originCandidate.city || 'Unknown'}, {originCandidate.country || 'Unknown'} | Provider: {originCandidate.isp || 'N/A'}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 max-w-xs text-right">
            *Investigative hypothesis candidate derived from earliest valid public MTA injection boundary.
          </div>
        </div>
      )}

      {/* Vertical Hop Chain */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800 font-mono text-xs">
        {hops.map((hop, idx) => {
          const isOrigin = hop.is_origin_candidate;
          const isDest = idx === hops.length - 1;

          let badgeColor = 'bg-slate-800 border-slate-700 text-slate-300';
          if (isOrigin) badgeColor = 'bg-cyan-950 border-cyan-500 text-cyan-400 font-bold';
          if (isDest) badgeColor = 'bg-emerald-950 border-emerald-600 text-emerald-400';

          return (
            <div key={idx} className="relative group">
              {/* Timeline Dot */}
              <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-slate-950 ${
                isOrigin ? 'border-cyan-400' : isDest ? 'border-emerald-400' : 'border-slate-700'
              }`} />

              <div className={`border rounded-xl p-4 transition-all ${
                isOrigin
                  ? 'bg-slate-950/80 border-cyan-500/50 shadow-md shadow-cyan-950/30'
                  : 'bg-slate-950/40 border-slate-800/80'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-slate-200">
                      HOP #{hop.hop_index}: {isOrigin ? 'ORIGIN GATEWAY' : isDest ? 'DESTINATION MTA' : 'INTERMEDIATE RELAY'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hop.is_private_ip && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        RFC1918 Private IP
                      </span>
                    )}
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
                      {hop.protocol || 'SMTP'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase block">Routing Servers:</span>
                    <div className="text-slate-300">
                      From: <span className="text-slate-100">{hop.from_host || 'N/A'}</span> ({hop.from_ip || 'No IP'})
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      By: <span className="text-slate-300">{hop.by_host || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase block">Network & Location:</span>
                    <div className="text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{hop.city ? `${hop.city}, ` : ''}{hop.country || 'Undetermined'}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] truncate">
                      ISP / ASN: {hop.isp || 'N/A'} {hop.asn ? `(${hop.asn})` : ''}
                    </div>
                  </div>
                </div>

                {hop.timestamp_raw && (
                  <div className="mt-2.5 pt-2 border-t border-slate-900 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Header Date: {hop.timestamp_raw}</span>
                  </div>
                )}

                {hop.anomaly_detected && (
                  <div className="mt-2 bg-red-950/40 border border-red-800/60 rounded p-2 text-xs text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{hop.anomaly_detected}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
