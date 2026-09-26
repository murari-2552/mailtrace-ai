import React from 'react';
import { ShieldCheck, ShieldX, ShieldAlert, Check, X } from 'lucide-react';
import { EmailAuthentication, AuthStatus } from '../../types';

interface AuthPanelProps {
  auth: EmailAuthentication;
}

const renderAuthCard = (title: string, data: AuthStatus) => {
  const isPass = data.status === 'PASS';
  const isFail = data.status === 'FAIL' || data.status === 'SOFTFAIL';
  
  let statusBadgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = ShieldAlert;
  if (isPass) {
    statusBadgeColor = 'bg-emerald-950/70 text-emerald-400 border-emerald-800';
    Icon = ShieldCheck;
  } else if (isFail) {
    statusBadgeColor = 'bg-red-950/70 text-red-400 border-red-800';
    Icon = ShieldX;
  }

  return (
    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 font-mono">{title}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {data.is_simulated && (
              <span className="text-[9px] font-mono uppercase bg-slate-900 text-amber-400/90 px-1.5 py-0.2 rounded border border-amber-800/50">
                SIMULATED DATA
              </span>
            )}
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${statusBadgeColor}`}>
              {data.status}
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>Domain Alignment:</span>
            <span className={`font-semibold flex items-center gap-1 ${data.aligned ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.aligned ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              {data.aligned ? 'Aligned' : 'Misaligned'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Validated Domain:</span>
            <span className="text-slate-200 truncate max-w-[170px]">{data.domain || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/90 rounded p-2 text-[11px] font-mono text-slate-400 leading-tight">
        <span className="text-slate-500 block text-[9px] uppercase font-semibold mb-0.5">Forensic Finding:</span>
        {data.details}
      </div>
    </div>
  );
};

export const AuthPanel: React.FC<AuthPanelProps> = ({ auth }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            EMAIL AUTHENTICATION VERIFICATION // SPF • DKIM • DMARC
          </h3>
        </div>
        <span className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded border ${
          auth.overall_status === 'PASS'
            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
            : 'bg-red-950 text-red-400 border-red-800'
        }`}>
          Overall: {auth.overall_status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderAuthCard('SPF (Sender Policy Framework)', auth.spf)}
        {renderAuthCard('DKIM (DomainKeys Identified Mail)', auth.dkim)}
        {renderAuthCard('DMARC (Domain Message Authentication)', auth.dmarc)}
      </div>

      <div className="text-xs font-mono text-slate-400 bg-slate-950/40 border border-slate-800/60 p-2.5 rounded">
        <strong>Auth Summary:</strong> {auth.summary_explanation}
      </div>
    </div>
  );
};
