import React from 'react';
import { Mail, ArrowRight, AlertCircle, CheckCircle, Fingerprint, Calendar, Tag } from 'lucide-react';
import { EmailHeaderInfo, RelayHop } from '../../types';

interface HeaderForensicsProps {
  headers: EmailHeaderInfo;
  origin?: RelayHop;
}

export const HeaderForensics: React.FC<HeaderForensicsProps> = ({ headers, origin }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            EMAIL HEADER FORENSICS & ROUTING ANOMALIES
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">RFC 5322 Standards Inspection</span>
      </div>

      {/* Visual Identity Flow Chain */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
        <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2 font-bold tracking-wider">
          Identity Flow & Alignment Path
        </span>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs font-mono">
          {/* From */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-3">
            <span className="text-slate-500 text-[10px] uppercase block">Declared From</span>
            <span className="text-slate-200 font-semibold truncate block mt-0.5" title={headers.from_raw}>
              {headers.from_address || headers.from_raw}
            </span>
            <span className="text-[10px] text-cyan-400">@{headers.from_domain || 'unknown'}</span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 hidden lg:block shrink-0" />

          {/* Reply-To */}
          <div className={`flex-1 border rounded-lg p-3 ${
            headers.has_reply_to_mismatch
              ? 'bg-red-950/30 border-red-800/80'
              : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[10px] uppercase">Reply-To Target</span>
              {headers.has_reply_to_mismatch && (
                <span className="text-[9px] font-mono text-red-400 bg-red-950 px-1 rounded border border-red-800">
                  MISMATCH
                </span>
              )}
            </div>
            <span className={`font-semibold truncate block mt-0.5 ${headers.has_reply_to_mismatch ? 'text-red-300' : 'text-slate-200'}`} title={headers.reply_to_address || 'None'}>
              {headers.reply_to_address || 'Same as Sender'}
            </span>
            <span className="text-[10px] text-slate-400">
              {headers.reply_to_domain ? `@${headers.reply_to_domain}` : 'Aligned'}
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 hidden lg:block shrink-0" />

          {/* Return-Path */}
          <div className={`flex-1 border rounded-lg p-3 ${
            headers.has_return_path_mismatch
              ? 'bg-amber-950/20 border-amber-800/80'
              : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[10px] uppercase">Return-Path Bounce</span>
              {headers.has_return_path_mismatch && (
                <span className="text-[9px] font-mono text-amber-400 bg-amber-950 px-1 rounded border border-amber-800">
                  MISMATCH
                </span>
              )}
            </div>
            <span className="text-slate-200 font-semibold truncate block mt-0.5" title={headers.return_path || 'None'}>
              {headers.return_path || 'None Specified'}
            </span>
            <span className="text-[10px] text-slate-400">
              {headers.return_path_domain ? `@${headers.return_path_domain}` : 'None'}
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 hidden lg:block shrink-0" />

          {/* Origin Candidate */}
          <div className="flex-1 bg-slate-900 border border-cyan-800/60 rounded-lg p-3">
            <span className="text-slate-500 text-[10px] uppercase block">Observed Origin IP</span>
            <span className="text-cyan-400 font-bold block mt-0.5">
              {origin?.from_ip || 'N/A'}
            </span>
            <span className="text-[10px] text-slate-400 truncate block">
              {origin?.country || 'Unknown Geo'} ({origin?.origin_confidence || 0}% Conf.)
            </span>
          </div>
        </div>
      </div>

      {/* Canonical Headers Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
        <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg space-y-1">
          <span className="text-slate-500 text-[10px] uppercase block">Subject:</span>
          <span className="text-slate-200 font-medium break-words block">{headers.subject}</span>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg space-y-1">
          <span className="text-slate-500 text-[10px] uppercase block">Date:</span>
          <span className="text-slate-200 block">{headers.date_raw || 'Not specified'}</span>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg space-y-1">
          <span className="text-slate-500 text-[10px] uppercase block">Message-ID:</span>
          <span className="text-slate-300 break-all text-[11px] block">{headers.message_id || 'N/A'}</span>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg space-y-1">
          <span className="text-slate-500 text-[10px] uppercase block">User-Agent / Mailer:</span>
          <span className="text-slate-300 block">{headers.user_agent || headers.x_mailer || 'Standard Gateway / None'}</span>
        </div>
      </div>
    </div>
  );
};
