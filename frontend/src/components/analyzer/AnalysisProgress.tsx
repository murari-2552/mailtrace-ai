import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface AnalysisProgressProps {
  onComplete?: () => void;
}

const STAGES = [
  "Parsing RFC 5322 MIME structure & canonical headers",
  "Extracting sender, Reply-To, and Return-Path headers",
  "Validating cryptographic SPF, DKIM & DMARC alignment",
  "Extracting Indicators of Compromise (IOCs)",
  "Inspecting URLs, shorteners & redirect chains",
  "Checking IP infrastructure, ASN, and GeoLocation",
  "Running AI/NLP social engineering & BEC detectors",
  "Correlating threat intelligence feeds & campaigns",
  "Calculating multi-tier explainable risk score (0-100)",
  "Committing evidence to blockchain ledger & compiling dossier"
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ onComplete }) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          onComplete?.();
          return prev;
        }
      });
    }, 280);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-6 shadow-2xl space-y-5 max-w-xl mx-auto my-8 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            MAILTRACE FORENSIC ENGINE EXECUTING
          </h3>
        </div>
        <span className="text-xs text-cyan-400 font-bold">
          {Math.round(((currentStage + 1) / STAGES.length) * 100)}%
        </span>
      </div>

      <div className="space-y-2">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;
          const isPending = idx > currentStage;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs py-1 px-2 rounded transition-colors ${
                isCurrent ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30' : isDone ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-slate-700 shrink-0 flex items-center justify-center text-[10px] text-slate-600">
                  {idx + 1}
                </span>
              )}
              <span className={isCurrent ? 'font-semibold' : ''}>{stage}</span>
            </div>
          );
        })}
      </div>

      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-cyan-500 h-full transition-all duration-300"
          style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
