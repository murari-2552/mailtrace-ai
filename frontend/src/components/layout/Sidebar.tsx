import React from 'react';
import {
  LayoutDashboard,
  MailSearch,
  Briefcase,
  Globe,
  Share2,
  FolderGit2,
  Database,
  Bell,
  ScrollText,
  ShieldCheck,
  Settings as SettingsIcon,
  Home,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, alertCount = 4 }) => {
  const navItems = [
    { id: 'landing', label: 'Home / Overview', icon: Home },
    { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard },
    { id: 'analyzer', label: 'Email Analyzer', icon: MailSearch, highlight: true },
    { id: 'cases', label: 'Investigations', icon: Briefcase },
    { id: 'threat-intel', label: 'Threat Intelligence', icon: Globe },
    { id: 'infrastructure', label: 'Infrastructure Graph', icon: Share2 },
    { id: 'campaigns', label: 'Threat Campaigns', icon: FolderGit2 },
    { id: 'ledger', label: 'Evidence Ledger', icon: Database, badge: 'Blockchain' },
    { id: 'alerts', label: 'SOC Alerts', icon: Bell, count: alertCount },
    { id: 'audit-logs', label: 'Audit Trail', icon: ScrollText },
    { id: 'privacy', label: 'Privacy & Retention', icon: ShieldCheck },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-950">
          <ShieldAlert className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-wider font-mono text-slate-100 flex items-center gap-1.5">
            MAILTRACE <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/50">AI</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight">SIH26106 // AICTE SOC</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              } ${item.highlight && !isActive ? 'border border-cyan-500/20 text-slate-300' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-950/70 border border-purple-800/60 text-purple-300">
                    {item.badge}
                  </span>
                )}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-red-950 border border-red-800 text-red-400 font-bold">
                    {item.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] font-mono text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Theme:</span>
          <span className="text-purple-400 font-semibold">Blockchain & Cyber</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Engine:</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Operational
          </span>
        </div>
        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/50">
          AICTE Cyber Security Cell
        </div>
      </div>
    </aside>
  );
};
