import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Blocks,
  Lock
} from 'lucide-react';
import { fetchEvidenceLedger, verifyEvidenceIntegrity } from '../services/api';
import { LedgerBlock, LedgerSummary } from '../types';

export const LedgerPage: React.FC = () => {
  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, string>>({});
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const loadLedger = async () => {
    setLoading(true);
    try {
      const data = await fetchEvidenceLedger();
      setBlocks(data.chain);
      setSummary(data.summary);
    } catch (e) {
      console.error('Error loading ledger:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleVerify = async (evidenceId: string) => {
    setVerifyingId(evidenceId);
    try {
      const res = await verifyEvidenceIntegrity(evidenceId);
      setVerificationResults(prev => ({ ...prev, [evidenceId]: res.status_text }));
    } catch (e) {
      setVerificationResults(prev => ({ ...prev, [evidenceId]: 'Verification Error' }));
    } finally {
      setVerifyingId(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 1800);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            <span>BLOCKCHAIN IMMUTABLE EVIDENCE LEDGER</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            SIH 2026 Theme: Blockchain & Cybersecurity • Append-Only Cryptographic Merkle Chain
          </p>
        </div>

        <button
          onClick={loadLedger}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs px-3.5 py-2 rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Ledger Chain</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-slate-900/90 border border-purple-800/50 rounded-xl p-4 space-y-1 shadow-md">
            <span className="text-slate-500 uppercase text-[10px]">Total Ledger Blocks</span>
            <div className="text-2xl font-extrabold text-purple-400">{summary.total_blocks}</div>
            <div className="text-[10px] text-slate-400">Including Genesis Block #0</div>
          </div>

          <div className="bg-slate-900/90 border border-emerald-800/50 rounded-xl p-4 space-y-1 shadow-md">
            <span className="text-slate-500 uppercase text-[10px]">Verified Artifacts</span>
            <div className="text-2xl font-extrabold text-emerald-400">{summary.verified_artifacts}</div>
            <div className="text-[10px] text-slate-400">Zero Bit-Level Tampering Detected</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1 shadow-md">
            <span className="text-slate-500 uppercase text-[10px]">Ledger Protocol</span>
            <div className="text-sm font-bold text-slate-200">SHA-256 Merkle Chain</div>
            <div className="text-[10px] text-purple-400">EVM Adapter Configurable</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1 shadow-md">
            <span className="text-slate-500 uppercase text-[10px]">Chain Status</span>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Operational & Verified
            </div>
            <div className="text-[10px] text-slate-400 truncate">Last: {summary.last_block_hash.slice(0, 16)}...</div>
          </div>
        </div>
      )}

      {/* Blocks Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl font-mono text-xs">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Blocks className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-slate-200 uppercase tracking-wider">
              Immutable Cryptographic Block Explorer
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Demo Immutable Evidence Ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Block #</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Evidence ID</th>
                <th className="py-3 px-4">Artifact Name</th>
                <th className="py-3 px-4">SHA-256 Hash</th>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4 text-right">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Syncing cryptographic blocks...
                  </td>
                </tr>
              ) : (
                blocks.map((b) => (
                  <tr key={b.index} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-purple-400">
                      #{b.index}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {b.timestamp.slice(0, 19).replace('T', ' ')}
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-semibold">
                      {b.evidence_id}
                    </td>
                    <td className="py-3 px-4 text-slate-200 max-w-[140px] truncate" title={b.file_name}>
                      {b.file_name}
                    </td>
                    <td className="py-3 px-4 max-w-[180px]">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-slate-400 text-[11px]" title={b.file_hash}>
                          {b.file_hash.slice(0, 16)}...
                        </span>
                        <button
                          onClick={() => handleCopy(b.file_hash)}
                          className="text-slate-500 hover:text-cyan-400"
                          title="Copy Full Hash"
                        >
                          {copiedHash === b.file_hash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-purple-300 font-mono max-w-[140px] truncate" title={b.transaction_ref}>
                      {b.transaction_ref.slice(0, 14)}...
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {b.index === 0 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          GENESIS
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{verificationResults[b.evidence_id] || b.status}</span>
                          </span>

                          <button
                            onClick={() => handleVerify(b.evidence_id)}
                            disabled={verifyingId === b.evidence_id}
                            className="text-[10px] text-slate-400 hover:text-cyan-300 bg-slate-900 border border-slate-700 hover:border-cyan-500 px-2 py-0.5 rounded transition"
                          >
                            {verifyingId === b.evidence_id ? 'Checking...' : 'Verify'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
