import React, { useState } from 'react';
import { Database, Search, Download, Copy, Check, PlusCircle } from 'lucide-react';
import { IOCItem } from '../../types';
import { RiskBadge } from '../common/RiskBadge';

interface IocTableProps {
  iocs: IOCItem[];
  caseId: string;
}

export const IocTable: React.FC<IocTableProps> = ({ iocs, caseId }) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = iocs.filter(item =>
    item.ioc.toLowerCase().includes(search.toLowerCase()) ||
    item.type.toLowerCase().includes(search.toLowerCase()) ||
    item.source.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (ioc: string, id: string) => {
    navigator.clipboard.writeText(ioc);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "IOC,Type,Source,Risk,Confidence,Status\n"
      + iocs.map(i => `"${i.ioc}","${i.type}","${i.source}","${i.risk}","${i.confidence}%","${i.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `IOC_Artifacts_${caseId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            INDICATORS OF COMPROMISE (IOC) ARTIFACTS ({iocs.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter IOCs..."
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg text-xs font-mono transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60 font-mono text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Indicator of Compromise</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Source Header/Body</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition">
                <td className="py-2.5 px-3 font-medium text-cyan-300 max-w-xs truncate" title={item.ioc}>
                  {item.ioc}
                </td>
                <td className="py-2.5 px-3 text-slate-400">{item.type}</td>
                <td className="py-2.5 px-3 text-slate-400">{item.source}</td>
                <td className="py-2.5 px-3">
                  <RiskBadge level={item.risk} size="sm" />
                </td>
                <td className="py-2.5 px-3 text-slate-300">{item.confidence}%</td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => handleCopy(item.ioc, item.id)}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition"
                    title="Copy to Clipboard"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
