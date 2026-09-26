import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Mail,
  AlertTriangle,
  FileWarning,
  UserCheck,
  Server,
  Briefcase,
  Database,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { fetchDashboardStats, fetchCases } from '../services/api';
import { Case, GeoLocationInfo } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { GeoLocationMap } from '../components/investigation/GeoLocationMap';

interface DashboardPageProps {
  onSelectCase: (caseId: string) => void;
  onStartAnalysis: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectCase, onStartAnalysis }) => {
  const [stats, setStats] = useState<any>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsRes, casesRes] = await Promise.all([
        fetchDashboardStats(),
        fetchCases()
      ]);
      setStats(statsRes);
      setCases(casesRes);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-xs font-mono text-cyan-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        LOADING SOC TELEMETRY...
      </div>
    );
  }

  const kpis = [
    { label: 'Emails Analyzed', value: stats.kpi.emails_analyzed, icon: Mail, color: 'text-cyan-400', border: 'border-cyan-800/40' },
    { label: 'High Risk Threats', value: stats.kpi.high_risk_threats, icon: ShieldAlert, color: 'text-red-400', border: 'border-red-800/40' },
    { label: 'Phishing Detected', value: stats.kpi.phishing_detected, icon: AlertTriangle, color: 'text-rose-400', border: 'border-rose-800/40' },
    { label: 'BEC Detected', value: stats.kpi.bec_detected, icon: FileWarning, color: 'text-orange-400', border: 'border-orange-800/40' },
    { label: 'Impersonation', value: stats.kpi.impersonation_detected, icon: UserCheck, color: 'text-amber-400', border: 'border-amber-800/40' },
    { label: 'Suspicious Infra', value: stats.kpi.suspicious_infrastructure, icon: Server, color: 'text-blue-400', border: 'border-blue-800/40' },
    { label: 'Active Cases', value: stats.kpi.active_cases, icon: Briefcase, color: 'text-purple-400', border: 'border-purple-800/40' },
    { label: 'Evidence Ledger', value: stats.kpi.evidence_items, icon: Database, color: 'text-emerald-400', border: 'border-emerald-800/40' },
  ];

  // Convert threat locations to GeoLocationInfo for map
  const mapLocations: GeoLocationInfo[] = stats.threat_locations.map((loc: any) => ({
    ip: loc.ip,
    country: loc.country,
    city: loc.city,
    lat: loc.lat,
    lon: loc.lon,
    isp: loc.threat,
    asn: 'AS-BGP',
    is_vpn: loc.severity === 'Critical',
    is_tor: loc.threat.includes('Tor'),
    is_proxy: true,
    confidence: 90.0,
    role: `${loc.threat} (${loc.count} events)`,
    disclaimer: '',
    is_simulated: true
  }));

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`bg-slate-900/80 border ${kpi.border} rounded-xl p-3.5 space-y-1 shadow-sm font-mono`}
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] uppercase font-bold truncate">{kpi.label}</span>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <div className={`text-xl font-extrabold tracking-tight ${kpi.color}`}>
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Row: Threat & Risk Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Category Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Threat Category Classification
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">Total: 79 Events</span>
          </div>

          <div className="space-y-2.5">
            {stats.threat_distribution.map((td: any, idx: number) => {
              const pct = Math.round((td.count / 79) * 100);
              return (
                <div key={idx} className="space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: td.color }} />
                      {td.name}
                    </span>
                    <span className="font-bold text-slate-200">
                      {td.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: td.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Level Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Risk Score Spectrum Distribution
            </h3>
            <span className="text-[11px] font-mono text-slate-400">0 - 100 Fusion Matrix</span>
          </div>

          <div className="space-y-2.5">
            {stats.risk_distribution.map((rd: any, idx: number) => {
              const pct = Math.round((rd.count / 74) * 100);
              return (
                <div key={idx} className="space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: rd.color }} />
                      {rd.level}
                    </span>
                    <span className="font-bold text-slate-200">
                      {rd.count} incidents
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: rd.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Threat Geolocation World Map */}
      <GeoLocationMap locations={mapLocations} />

      {/* Recent Investigations Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              RECENT FORENSIC INVESTIGATIONS
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Click any case row to inspect full dossier</p>
          </div>

          <button
            onClick={onStartAnalysis}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300"
          >
            <span>+ New Investigation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Sender Identity</th>
                <th className="py-3 px-3">Domain</th>
                <th className="py-3 px-3">Classification</th>
                <th className="py-3 px-3">Risk Score</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {cases.slice(0, 6).map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c.id)}
                  className="hover:bg-cyan-950/20 hover:border-cyan-800 cursor-pointer transition"
                >
                  <td className="py-3 px-3 font-bold text-cyan-400">{c.id}</td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">{c.created_at.slice(0, 16)}</td>
                  <td className="py-3 px-3 truncate max-w-[200px]" title={c.sender}>
                    {c.sender}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{c.domain || 'N/A'}</td>
                  <td className="py-3 px-3">
                    <RiskBadge level={c.classification} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-bold">
                    <span className={c.risk_score >= 70 ? 'text-red-400' : (c.risk_score >= 35 ? 'text-amber-400' : 'text-emerald-400')}>
                      {c.risk_score} / 100
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-300">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
