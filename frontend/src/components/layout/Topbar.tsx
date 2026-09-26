import React, { useState } from 'react';
import { Search, Bell, Shield, UserCheck, Terminal, ExternalLink, X } from 'lucide-react';
import { AlertNotification } from '../../types';

interface TopbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole: string;
  setUserRole: (role: string) => void;
  alerts: AlertNotification[];
  onSelectCase?: (caseId: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentPage,
  onNavigate,
  userRole,
  setUserRole,
  alerts,
  onSelectCase
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.is_read);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    // Route to cases or threat intel based on input format
    if (searchTerm.startsWith('CASE-')) {
      onSelectCase?.(searchTerm.trim());
      onNavigate('analyzer');
    } else {
      onNavigate('threat-intel');
    }
  };

  const pageTitles: Record<string, string> = {
    'landing': 'Platform Overview',
    'dashboard': 'Security Operations Center (SOC) Dashboard',
    'analyzer': 'Email Threat Analyzer & Forensic Investigation',
    'cases': 'Case Management & Investigation Dossiers',
    'threat-intel': 'Threat Intelligence & IOC Lookup',
    'infrastructure': 'Infrastructure Relationship Graph',
    'campaigns': 'Correlated Threat Campaigns',
    'ledger': 'Blockchain Immutable Evidence Ledger',
    'alerts': 'SOC Alert Management',
    'audit-logs': 'Cryptographic Forensic Audit Trail',
    'privacy': 'Privacy Controls & Data Retention',
    'settings': 'System Configuration & API Feeds',
  };

  return (
    <header className="h-16 bg-[#0F172A]/90 backdrop-blur border-b border-slate-800/80 px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono uppercase text-cyan-400 font-semibold tracking-wider">
          {pageTitles[currentPage] || 'Forensic Workspace'}
        </span>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Global search: Case ID, IP, domain, URL, or hash..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
          />
        </form>
      </div>

      {/* Actions & Role Switcher */}
      <div className="flex items-center gap-4">
        {/* Quick Launch Investigation */}
        <button
          onClick={() => onNavigate('analyzer')}
          className="hidden sm:inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shadow-sm shadow-cyan-900"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>START INVESTIGATION</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-slate-700 transition relative"
            title="SOC Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center font-mono animate-pulse">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Drawer */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 uppercase font-mono">SOC Threat Alerts</span>
                <button
                  onClick={() => setShowAlertsDropdown(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto mt-2">
                {alerts.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      setShowAlertsDropdown(false);
                      onSelectCase?.(a.case_id);
                      onNavigate('analyzer');
                    }}
                    className="py-2 px-1 hover:bg-slate-800/50 rounded cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-red-400 font-mono text-[11px]">{a.threat_type}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{a.risk_score}/100</span>
                    </div>
                    <p className="text-slate-300 text-[11px] truncate mt-0.5">{a.primary_reason}</p>
                    <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center justify-between">
                      <span>{a.domain}</span>
                      <span className="text-cyan-400 hover:underline">View Case →</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    setShowAlertsDropdown(false);
                    onNavigate('alerts');
                  }}
                  className="text-xs text-cyan-400 hover:underline font-mono"
                >
                  View All Alerts ({alerts.length})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <Shield className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="bg-transparent text-xs font-mono text-slate-200 focus:outline-none cursor-pointer pr-2"
          >
            <option value="Analyst" className="bg-slate-900 text-slate-200">Role: Analyst</option>
            <option value="Investigator" className="bg-slate-900 text-slate-200">Role: Investigator</option>
            <option value="Administrator" className="bg-slate-900 text-slate-200">Role: Administrator</option>
          </select>
        </div>
      </div>
    </header>
  );
};
