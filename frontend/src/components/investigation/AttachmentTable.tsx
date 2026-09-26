import React from 'react';
import { Paperclip, AlertTriangle, ShieldCheck, FileText, Copy, Check } from 'lucide-react';
import { AttachmentIntel } from '../../types';

interface AttachmentTableProps {
  attachments: AttachmentIntel[];
}

export const AttachmentTable: React.FC<AttachmentTableProps> = ({ attachments }) => {
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            ATTACHMENT METADATA & HASH FORENSICS
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {attachments.length} Embedded Payload{attachments.length !== 1 ? 's' : ''} Inspected
        </span>
      </div>

      {attachments.length === 0 ? (
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-6 text-center text-xs font-mono text-slate-500">
          No file attachments were included in this email transmission.
        </div>
      ) : (
        <div className="space-y-3">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className={`border rounded-xl p-4 font-mono text-xs space-y-3 ${
                att.risk_level === 'CRITICAL' || att.is_double_extension
                  ? 'bg-red-950/20 border-red-800/80 shadow-sm shadow-red-950'
                  : att.risk_level === 'HIGH' || att.is_macro_enabled
                  ? 'bg-amber-950/20 border-amber-800/80'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className={`w-5 h-5 ${att.risk_level === 'CRITICAL' ? 'text-red-400' : 'text-cyan-400'}`} />
                  <div>
                    <span className="font-bold text-sm text-slate-100 block">{att.filename}</span>
                    <span className="text-[11px] text-slate-400">
                      MIME: {att.mime_type} | Size: {(att.size_bytes / 1024).toFixed(1)} KB ({att.size_bytes} bytes)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {att.is_double_extension && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 animate-pulse">
                      DOUBLE EXTENSION DETECTED
                    </span>
                  )}
                  {att.is_macro_enabled && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      VBA MACRO ENABLED
                    </span>
                  )}
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    att.risk_level === 'CRITICAL'
                      ? 'bg-red-950 text-red-400 border-red-800'
                      : att.risk_level === 'HIGH'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}>
                    {att.risk_level} RISK
                  </span>
                </div>
              </div>

              {att.anomaly_note && (
                <div className="bg-slate-950/80 border border-red-800/60 rounded p-2.5 text-[11px] text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{att.anomaly_note}</span>
                </div>
              )}

              {/* Cryptographic Hashes */}
              <div className="bg-slate-950 border border-slate-800/90 rounded p-2.5 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-slate-500">SHA-256:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200 font-mono select-all">{att.sha256}</span>
                    <button
                      onClick={() => copyToClipboard(att.sha256)}
                      className="text-slate-400 hover:text-cyan-400 transition"
                      title="Copy SHA-256"
                    >
                      {copiedHash === att.sha256 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {att.sha1 && (
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-slate-500">SHA-1:</span>
                    <span className="text-slate-300 font-mono select-all">{att.sha1}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-[11px] font-mono text-slate-500 border-t border-slate-800/80 pt-2 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Safe Inspection Guarantee: Attachments are parsed in an isolated sandbox for static metadata only. No binary execution performed.</span>
      </div>
    </div>
  );
};
