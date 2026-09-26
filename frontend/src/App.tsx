import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { CasesPage } from './pages/CasesPage';
import { ThreatIntelPage } from './pages/ThreatIntelPage';
import { LedgerPage } from './pages/LedgerPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { AlertsPage } from './pages/AlertsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SettingsPage } from './pages/SettingsPage';
import { InfraGraph } from './components/investigation/InfraGraph';
import { fetchAlerts } from './services/api';
import { AlertNotification, InfrastructureGraph } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [userRole, setUserRole] = useState<string>('Analyst');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  useEffect(() => {
    fetchAlerts().then(setAlerts).catch(console.error);
  }, []);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentPage('analyzer');
  };

  const handleLaunchDemoCase = (demoKey: string) => {
    setSelectedCaseId(null);
    setCurrentPage('analyzer');
  };

  // Mock global infrastructure graph data for standalone graph view
  const demoGlobalGraph: InfrastructureGraph = {
    nodes: [
      { id: 'node-email-1', label: 'State Bank Phish', type: 'email', risk: 'critical' },
      { id: 'node-email-2', label: 'CEO Wire BEC', type: 'email', risk: 'critical' },
      { id: 'node-email-3', label: 'M365 SSO Harvest', type: 'email', risk: 'high' },
      { id: 'node-dom-1', label: 'sbii-security-update.com', type: 'domain', risk: 'critical' },
      { id: 'node-dom-2', label: 'gmail-executive-portal.com', type: 'domain', risk: 'high' },
      { id: 'node-dom-3', label: 'micros0ft-security-portal.com', type: 'domain', risk: 'critical' },
      { id: 'node-ip-1', label: '194.26.29.112 (RU)', type: 'ip', risk: 'critical' },
      { id: 'node-ip-2', label: '185.220.101.45 (NL)', type: 'ip', risk: 'critical' },
      { id: 'node-ip-3', label: '45.142.214.88 (SC)', type: 'ip', risk: 'high' },
      { id: 'node-camp-1', label: 'Operation PhishVault', type: 'campaign', risk: 'critical' },
      { id: 'node-camp-2', label: 'Operation SilentTransfer', type: 'campaign', risk: 'critical' }
    ],
    edges: [
      { id: 'e1', source: 'node-email-1', target: 'node-dom-1', label: 'FROM_DOMAIN' },
      { id: 'e2', source: 'node-dom-1', target: 'node-ip-1', label: 'RESOLVES_TO' },
      { id: 'e3', source: 'node-email-1', target: 'node-ip-2', label: 'RELAY_HOP' },
      { id: 'e4', source: 'node-email-1', target: 'node-camp-1', label: 'BELONGS_TO' },
      { id: 'e5', source: 'node-email-2', target: 'node-dom-2', label: 'FROM_DOMAIN' },
      { id: 'e6', source: 'node-dom-2', target: 'node-ip-3', label: 'RESOLVES_TO' },
      { id: 'e7', source: 'node-email-2', target: 'node-camp-2', label: 'BELONGS_TO' },
      { id: 'e8', source: 'node-email-3', target: 'node-dom-3', label: 'FROM_DOMAIN' }
    ]
  };

  return (
    <div className="flex h-screen bg-[#0B0F19] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        alertCount={alerts.filter(a => !a.is_read).length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          userRole={userRole}
          setUserRole={setUserRole}
          alerts={alerts}
          onSelectCase={handleSelectCase}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentPage === 'landing' && (
            <LandingPage
              onStartInvestigation={() => setCurrentPage('analyzer')}
              onViewDemoCase={handleLaunchDemoCase}
              onGoToDashboard={() => setCurrentPage('dashboard')}
            />
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage
              onSelectCase={handleSelectCase}
              onStartAnalysis={() => setCurrentPage('analyzer')}
            />
          )}

          {currentPage === 'analyzer' && (
            <AnalyzerPage
              initialCaseId={selectedCaseId}
              onClearInitialCase={() => setSelectedCaseId(null)}
              onNavigateToLedger={() => setCurrentPage('ledger')}
            />
          )}

          {currentPage === 'cases' && (
            <CasesPage onSelectCase={handleSelectCase} />
          )}

          {currentPage === 'threat-intel' && (
            <ThreatIntelPage />
          )}

          {currentPage === 'infrastructure' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight">
                  GLOBAL INFRASTRUCTURE CORRELATION GRAPH
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Multi-Incident Threat Topology • Domain-IP Resolution Map • Campaign Associations
                </p>
              </div>
              <InfraGraph graph={demoGlobalGraph} />
            </div>
          )}

          {currentPage === 'campaigns' && (
            <CampaignsPage onSelectCase={handleSelectCase} />
          )}

          {currentPage === 'ledger' && (
            <LedgerPage />
          )}

          {currentPage === 'alerts' && (
            <AlertsPage onSelectCase={handleSelectCase} />
          )}

          {currentPage === 'audit-logs' && (
            <AuditLogsPage />
          )}

          {currentPage === 'privacy' && (
            <PrivacyPage />
          )}

          {currentPage === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
