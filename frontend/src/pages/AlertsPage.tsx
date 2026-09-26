import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, ShieldAlert, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { fetchAlerts, markAlertRead } from '../services/api';
import { AlertNotification } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const AlertsPage: React.FC<{ onSelectCase?: (caseId: string) => void }> = ({ onSelectCase }) => {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAlerts();
      setAlerts(data);
    } catch (e) {
      console.error('Error fetching alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkRead = async (id: string) => {
    await markAlertRead(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <span>SOC THREAT ALERTS & REAL-TIME INCIDENT FEED</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Automated Gateway Detections • High-Risk Threshold Notifications • Priority Response
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs px-3.5 py-2 rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading alerts feed...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
            No active threat alerts registered.
          </div>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className={`border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
                alt.is_read
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                  : 'bg-slate-900/90 border-red-800/60 shadow-md shadow-red-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${
                  alt.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'
                }`} />

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{alt.threat_type}</span>
                    <RiskBadge level={alt.severity} size="sm" />
                    <span className="text-slate-500 text-[10px]">{alt.timestamp}</span>
                    {!alt.is_read && (
                      <span className="text-[9px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 rounded font-bold uppercase">
                        Unread
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 font-sans text-xs">{alt.primary_reason}</p>

                  <div className="text-[11px] text-slate-400 flex flex-wrap gap-4 pt-1">
                    <span>Sender: <strong className="text-slate-200">{alt.sender}</strong></span>
                    <span>Domain: <strong className="text-cyan-400">{alt.domain}</strong></span>
                    <span>Score: <strong className="text-red-400">{alt.risk_score}/100</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {!alt.is_read && (
                  <button
                    onClick={() => handleMarkRead(alt.id)}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    Mark Read
                  </button>
                )}

                <button
                  onClick={() => onSelectCase?.(alt.case_id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition"
                >
                  <span>Open Investigation</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
