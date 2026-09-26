import React from 'react';
import { ShieldCheck, AlertTriangle, FileWarning, KeyRound, Building2 } from 'lucide-react';

interface DemoSelectorProps {
  onSelectDemo: (demoKey: string) => void;
  isLoading: boolean;
}

export const DemoSelector: React.FC<DemoSelectorProps> = ({ onSelectDemo, isLoading }) => {
  const demos = [
    {
      key: 'bank_phishing',
      title: 'Banking Phishing',
      subtitle: 'State Bank KYC / .pdf.exe payload',
      badge: 'Critical Phishing',
      badgeColor: 'border-red-800 text-red-400 bg-red-950/50',
      icon: AlertTriangle
    },
    {
      key: 'ceo_bec',
      title: 'CEO BEC Wire Fraud',
      subtitle: 'Director General RTGS directive',
      badge: 'BEC Coercion',
      badgeColor: 'border-orange-800 text-orange-400 bg-orange-950/50',
      icon: FileWarning
    },
    {
      key: 'fake_invoice',
      title: 'Fake Overdue Invoice',
      subtitle: 'Payment diversion / .docm macro',
      badge: 'Macro Dropper',
      badgeColor: 'border-amber-800 text-amber-400 bg-amber-950/50',
      icon: Building2
    },
    {
      key: 'microsoft_impersonation',
      title: 'Microsoft 365 Phishing',
      subtitle: 'Password expiry / redirect chain',
      badge: 'Credential Theft',
      badgeColor: 'border-red-800 text-red-400 bg-red-950/50',
      icon: KeyRound
    },
    {
      key: 'legitimate_corporate',
      title: 'Legitimate Corporate',
      subtitle: 'AICTE Faculty Development circular',
      badge: 'Safe Clean',
      badgeColor: 'border-emerald-800 text-emerald-400 bg-emerald-950/50',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
          <span>Pre-loaded Forensic Demo Scenarios</span>
          <span className="text-[10px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded border border-slate-700">1-Click Live Analysis</span>
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">Realistic Synthetic Datasets</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
        {demos.map((d) => {
          const Icon = d.icon;
          return (
            <button
              key={d.key}
              disabled={isLoading}
              onClick={() => onSelectDemo(d.key)}
              className="flex flex-col text-left p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 transition group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${d.badgeColor}`}>
                  {d.badge}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                {d.title}
              </span>
              <span className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                {d.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
