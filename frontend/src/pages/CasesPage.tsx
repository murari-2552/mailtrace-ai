import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  FileText,
  X
} from 'lucide-react';
import { fetchCases, createCase, updateCaseStatus, getReportDownloadUrl } from '../services/api';
import { Case } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

interface CasesPageProps {
  onSelectCase: (caseId: string) => void;
}

export const CasesPage: React.FC<CasesPageProps> = ({ onSelectCase }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSeverity, setNewSeverity] = useState('High');
  const [newClassification, setNewClassification] = useState('Phishing');
  const [newSender, setNewSender] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await fetchCases({
        search: search || undefined,
        status: statusFilter || undefined,
        severity: severityFilter || undefined
      });
      setCases(data);
    } catch (e) {
      console.error('Error fetching cases:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [search, statusFilter, severityFilter]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await createCase({
        title: newTitle,
        severity: newSeverity,
        classification: newClassification,
        sender: newSender,
        notes: newNotes,
        investigator: 'Analyst (Demo)'
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewSender('');
      setNewNotes('');
      loadCases();
    } catch (e) {
      console.error('Error creating case:', e);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            <span>CASE MANAGEMENT & FORENSIC DOSSIERS</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active Incident Workflows • Chain-of-Custody Tracking • Multi-Evidence Correlation
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE NEW CASE</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Case ID, title, sender, or domain..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Investigating">Investigating</option>
            <option value="Escalated">Escalated</option>
            <option value="Resolved">Resolved</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Safe">Safe</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Investigation Title</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No investigation cases match current filters.
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-cyan-400">
                      {c.id}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-100 truncate">{c.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{c.sender || 'No sender address'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {c.created_at.slice(0, 16)}
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={c.severity} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {c.classification}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={c.risk_score >= 70 ? 'text-red-400' : (c.risk_score >= 35 ? 'text-amber-400' : 'text-emerald-400')}>
                        {c.risk_score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-950 text-slate-300">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectCase(c.id)}
                          className="p-1.5 hover:bg-slate-800 rounded text-cyan-400 hover:text-cyan-300 transition"
                          title="Open in Email Analyzer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <a
                          href={getReportDownloadUrl(c.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition"
                          title="Download PDF Dossier"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4 font-sans shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 uppercase font-mono">Create Investigation Case</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Finance Wire Impersonation Alert"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Classification</label>
                  <select
                    value={newClassification}
                    onChange={(e) => setNewClassification(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="Phishing">Phishing</option>
                    <option value="BEC">BEC</option>
                    <option value="Impersonation">Impersonation</option>
                    <option value="Malware">Malware</option>
                    <option value="Fraud">Fraud</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target / Suspicious Sender</label>
                <input
                  type="text"
                  value={newSender}
                  onChange={(e) => setNewSender(e.target.value)}
                  placeholder="e.g. sender@suspicious-domain.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Initial Analyst Notes</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Document initial incident indicators or SIEM alert ID..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
