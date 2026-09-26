import React from 'react';
import { Download, ShieldCheck, Share2, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { CircularScore } from '../common/CircularScore';
import { RiskBadge } from '../common/RiskBadge';
import { getReportDownloadUrl } from '../../services/api';

interface ThreatVerdictProps {
  result: AnalysisResult;
  onVerifyLedger?: () => void;
}

export const ThreatVerdict: React.FC<ThreatVerdictProps> = ({ result, onVerifyLedger }) => {
  const downloadUrl = getReportDownloadUrl(result.case_id);

  const handleExportIOCs = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Indicator,Type,Source,Risk,Confidence\n"
      + result.iocs.map(i => `"${i.ioc}","${i.type}","${i.source}","${i.risk}","${i.confidence}%"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IOCs_${result.case_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
        {/* Left: Case Meta & Classification */}
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded">
              {result.case_id}
            </span>
            <RiskBadge level={result.verdict.threat_level} size="md" />
            {result.is_demo && (
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                Demo Mode
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-100 font-mono">
              VERDICT: {result.verdict.classification}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Investigated File: <span className="text-slate-200">{result.file_name}</span> | Timestamp: {result.analysis_timestamp}
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg text-xs text-slate-300 leading-relaxed font-sans">
            <strong className="text-cyan-400 uppercase font-mono text-[11px] block mb-1">
              Executive Forensic Summary:
            </strong>
            {result.verdict.executive_summary}
          </div>
        </div>

        {/* Center: Radial Risk Gauge */}
        <div className="shrink-0 bg-slate-950/50 border border-slate-800/80 rounded-xl p-2">
          <CircularScore
            score={result.verdict.risk_score}
            classification={result.verdict.classification}
            confidence={result.verdict.confidence_pct}
            size={170}
          />
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full md:w-56 shrink-0">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono text-xs font-bold py-2.5 px-4 rounded-lg shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT PDF REPORT</span>
          </a>

          <button
            onClick={onVerifyLedger}
            className="flex items-center justify-center gap-2 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800 font-mono text-xs font-medium py-2.5 px-4 rounded-lg transition"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>VERIFY LEDGER INTEGRITY</span>
          </button>

          <button
            onClick={handleExportIOCs}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-medium py-2 px-4 rounded-lg transition"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>EXPORT IOCs (CSV)</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Blockchain Evidence & Origin Quick Peek */}
      <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Evidence SHA-256:</span>
          <span className="text-slate-200 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {result.evidence_hash.slice(0, 20)}...
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Probable Origin:</span>
          <span className="text-cyan-400 font-semibold">
            {result.origin_candidate?.country || 'External Relay'} ({result.origin_candidate?.from_ip || 'N/A'})
          </span>
        </div>

        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Immutable Ledger Block Committed</span>
        </div>
      </div>
    </div>
  );
};
