import React from 'react';
import { Clock, ShieldCheck, Server, AlertTriangle } from 'lucide-react';
import { TimelineEvent } from '../../types';

interface ForensicTimelineProps {
  events: TimelineEvent[];
}

export const ForensicTimeline: React.FC<ForensicTimelineProps> = ({ events }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            FORENSIC TIMELINE & EVENT CHRONOLOGY
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">{events.length} Telemetry Points</span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800 font-mono text-xs">
        {events.map((evt, idx) => (
          <div key={idx} className="relative group">
            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-cyan-400 bg-slate-950" />
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-200">{evt.title}</span>
                <span className="text-[10px] text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {evt.time_str}
                </span>
              </div>
              <p className="text-slate-400 text-xs font-sans">{evt.description}</p>
              <div className="text-[10px] text-slate-500 pt-1">
                Source Evidence: <span className="text-slate-400">{evt.evidence}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
