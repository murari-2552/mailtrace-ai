import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, BrainCircuit } from 'lucide-react';
import { ExplainableIndicator } from '../../types';

interface ExplainableAiProps {
  indicators: ExplainableIndicator[];
}

export const ExplainableAi: React.FC<ExplainableAiProps> = ({ indicators }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            EXPLAINABLE AI // WHY WAS THIS EMAIL FLAGGED?
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {indicators.length} Primary Risk Vector{indicators.length !== 1 ? 's' : ''} Identified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {indicators.map((ind) => {
          let borderClass = 'border-slate-800 bg-slate-950/40';
          let tagColor = 'bg-slate-800 text-slate-300 border-slate-700';
          let Icon = Info;

          if (ind.severity === 'RED') {
            borderClass = 'border-red-900/60 bg-red-950/20';
            tagColor = 'bg-red-950 text-red-400 border-red-800';
            Icon = AlertCircle;
          } else if (ind.severity === 'ORANGE') {
            borderClass = 'border-orange-900/60 bg-orange-950/20';
            tagColor = 'bg-orange-950 text-orange-400 border-orange-800';
            Icon = AlertTriangle;
          } else if (ind.severity === 'YELLOW') {
            borderClass = 'border-amber-900/50 bg-amber-950/15';
            tagColor = 'bg-amber-950 text-amber-400 border-amber-800';
            Icon = AlertTriangle;
          } else if (ind.severity === 'GREEN') {
            borderClass = 'border-emerald-900/50 bg-emerald-950/15';
            tagColor = 'bg-emerald-950 text-emerald-400 border-emerald-800';
            Icon = CheckCircle;
          }

          return (
            <div
              key={ind.id}
              className={`border rounded-lg p-4 space-y-2 transition-all ${borderClass}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" />
                  <h4 className="text-xs font-bold text-slate-100 font-mono">
                    {ind.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${tagColor}`}>
                    {ind.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {ind.confidence}% Conf.
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {ind.explanation}
              </p>

              <div className="bg-slate-950/80 border border-slate-800/80 rounded p-2 text-[11px] font-mono text-cyan-300/90 break-all">
                <span className="text-slate-500 block text-[10px] uppercase">Forensic Evidence:</span>
                {ind.evidence}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
