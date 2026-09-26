import React, { useState } from 'react';
import { ShieldCheck, CheckSquare, Square, AlertOctagon } from 'lucide-react';

interface RecommendedActionsProps {
  actions: string[];
}

export const RecommendedActions: React.FC<RecommendedActionsProps> = ({ actions }) => {
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  const toggleAction = (idx: number) => {
    setCompleted(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            INCIDENT RESPONSE & SOC PLAYBOOK RECOMMENDATIONS
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {Object.values(completed).filter(Boolean).length} / {actions.length} Executed
        </span>
      </div>

      <div className="space-y-2">
        {actions.map((act, idx) => {
          const isDone = completed[idx];
          return (
            <div
              key={idx}
              onClick={() => toggleAction(idx)}
              className={`flex items-start gap-3 p-3 rounded-lg border font-mono text-xs cursor-pointer transition ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <button type="button" className="mt-0.5 text-cyan-400 shrink-0">
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </button>
              <span className={`leading-relaxed ${isDone ? 'line-through text-slate-500' : ''}`}>
                {act}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span>Advisory Guidance: Implement remediation through authorized perimeter security controls in accordance with organizational SOC playbooks.</span>
      </div>
    </div>
  );
};
