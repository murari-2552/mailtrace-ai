import React, { useState, useEffect } from 'react';
import { ScrollText, RefreshCw, CheckCircle2, ShieldCheck, Search } from 'lucide-react';
import { fetchAuditLogs } from '../services/api';
import { AuditLogEntry } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.resource.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-cyan-400" />
            <span>CRYPTOGRAPHIC FORENSIC AUDIT TRAIL</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Immutable Chain of User Actions • Evidence Custody Operations • Compliance Tracking
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs px-3.5 py-2 rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by user, action, target resource, or details..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">User / Persona</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Forensic Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching audit log entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-500 text-[11px]">{l.id}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">{l.timestamp}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{l.user}</td>
                    <td className="py-3 px-4 text-cyan-400 font-bold">{l.action}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-[150px] truncate" title={l.resource}>{l.resource}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{l.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-sans text-xs max-w-xs truncate" title={l.details}>
                      {l.details}
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
