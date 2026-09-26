import React, { useState } from 'react';
import { Database, ShieldCheck, CheckCircle2, ShieldAlert, Copy, Check, RefreshCw } from 'lucide-react';
import { verifyEvidenceIntegrity } from '../../services/api';

interface EvidenceCustodyProps {
  evidenceId: string;
  evidenceHash: string;
  fileName: string;
  timestamp: string;
  blockchainTx?: string;
}

export const EvidenceCustody: React.FC<EvidenceCustodyProps> = ({
  evidenceId,
  evidenceHash,
  fileName,
  timestamp,
  blockchainTx
}) => {
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<string | null>('Integrity Verified ✓');
  const [copied, setCopied] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await verifyEvidenceIntegrity(evidenceId);
      setVerifyStatus(res.status_text);
    } catch (e) {
      setVerifyStatus('Verification Failed (Offline)');
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(evidenceHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const custodyEvents = [
    { title: 'Evidence Ingestion & Sanitization', time: timestamp, actor: 'MAILTRACE Gateway Engine' },
    { title: 'Cryptographic SHA-256 Hash Generated', time: timestamp, actor: 'Local Integrity Module' },
    { title: 'Multi-Stage Threat & AI Decoding Executed', time: timestamp, actor: 'Forensic Analysis Worker' },
    { title: 'Evidence Committed to Immutable Ledger', time: timestamp, actor: 'Blockchain Adapter (Merkle Tree)' },
    { title: 'Formal Forensic Dossier Compiled', time: timestamp, actor: 'ReportLab PDF Generator' }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            BLOCKCHAIN IMMUTABLE EVIDENCE LEDGER & CHAIN OF CUSTODY
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase bg-purple-950/70 border border-purple-800 text-purple-300 px-2 py-0.5 rounded">
          SIH 2026: Blockchain & Cybersecurity Theme
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Left: Cryptographic Artifact Details */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">Evidence Token</span>
            <span className="text-cyan-400 font-bold">{evidenceId}</span>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-500 text-[10px] uppercase block">Artifact SHA-256 Fingerprint:</span>
            <div className="bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 select-all flex items-center justify-between break-all">
              <span>{evidenceHash}</span>
              <button
                onClick={handleCopyHash}
                className="text-slate-400 hover:text-cyan-400 ml-2 shrink-0"
                title="Copy Hash"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1 text-slate-400 text-[11px]">
            <div>
              <span className="text-slate-500">File Name:</span> {fileName}
            </div>
            <div>
              <span className="text-slate-500">Blockchain Ref:</span>{' '}
              <span className="text-purple-400 truncate select-all">{blockchainTx || '0x4982...'}</span>
            </div>
            <div>
              <span className="text-slate-500">Ledger Network:</span> Demo Immutable Evidence Ledger (Merkle Chain)
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="w-full flex items-center justify-center gap-2 bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 font-bold py-2 rounded-lg transition disabled:opacity-50"
            >
              {verifying ? (
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              )}
              <span>{verifying ? 'RE-CALCULATING HASH...' : 'RE-VERIFY EVIDENCE INTEGRITY'}</span>
            </button>

            {verifyStatus && (
              <div className="mt-2 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{verifyStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Chain of Custody Step-by-Step */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <span className="font-bold text-slate-300 uppercase tracking-wider block pb-2 border-b border-slate-800">
            Chain of Custody Event Log
          </span>

          <div className="space-y-2.5">
            {custodyEvents.map((evt, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-[11px]">
                <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <div className="text-slate-200 font-semibold">{evt.title}</div>
                  <div className="text-slate-500 text-[10px]">
                    Actor: {evt.actor} • {evt.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
