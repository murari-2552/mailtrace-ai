import React from 'react';
import { UserCheck, ShieldAlert, Zap, Flame, Award, KeyRound, CreditCard } from 'lucide-react';
import { BECIntel, SocialEngineeringIntel } from '../../types';

interface BecSocialEngProps {
  bec: BECIntel;
  social: SocialEngineeringIntel;
}

export const BecSocialEng: React.FC<BecSocialEngProps> = ({ bec, social }) => {
  const socialMetrics = [
    { label: 'Urgency Pressure', score: social.urgency, icon: Zap, color: 'bg-red-500' },
    { label: 'Authority Impersonation', score: social.authority, icon: Award, color: 'bg-purple-500' },
    { label: 'Fear & Coercion', score: social.fear, icon: Flame, color: 'bg-orange-500' },
    { label: 'Credential Harvesting', score: social.credential, icon: KeyRound, color: 'bg-cyan-500' },
    { label: 'Financial / Payment Divert', score: social.payment, icon: CreditCard, color: 'bg-amber-500' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            BUSINESS EMAIL COMPROMISE (BEC) & SOCIAL ENGINEERING SIGNALS
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">NLP Behavioral Forensics</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Dedicated BEC Detector */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-400" />
              <span>BEC Heuristics Engine</span>
            </span>

            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
              bec.risk_score >= 60
                ? 'bg-red-950 text-red-400 border-red-800'
                : bec.risk_score >= 30
                ? 'bg-amber-950 text-amber-400 border-amber-800'
                : 'bg-emerald-950 text-emerald-400 border-emerald-800'
            }`}>
              BEC Score: {bec.risk_score}/100
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Detected Pattern:</span>
              <span className="text-cyan-400 font-semibold uppercase">
                {bec.pattern_type ? bec.pattern_type.replace(/_/g, ' ') : 'None Detected'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Urgency Level:</span>
              <span className={`font-semibold ${bec.urgency_level === 'CRITICAL' ? 'text-red-400' : 'text-slate-300'}`}>
                {bec.urgency_level}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Analysis Confidence:</span>
              <span className="text-slate-200">{bec.confidence}%</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/90 rounded p-3 text-slate-300 leading-relaxed font-sans">
            <strong className="font-mono text-cyan-400 text-xs block mb-1 uppercase">Pattern Assessment:</strong>
            {bec.explanation}
          </div>
        </div>

        {/* Right: Psychological Levers & Meters */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              Social Engineering Vectors (0-10)
            </span>
            <span className="text-[10px] text-slate-500">Psychological Pressure Gauges</span>
          </div>

          <div className="space-y-3">
            {socialMetrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      {m.label}
                    </span>
                    <span className="font-bold font-mono text-slate-200">
                      {m.score} / 10
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${m.color} transition-all duration-500`}
                      style={{ width: `${m.score * 10}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {social.extracted_cues.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block mb-1 font-bold">
                Identified Linguistic Cues:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {social.extracted_cues.map((cue, cIdx) => (
                  <span
                    key={cIdx}
                    className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded"
                  >
                    {cue}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
