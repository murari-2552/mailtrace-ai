import {
  AnalysisResult, Case, LedgerBlock, LedgerSummary,
  AlertNotification, AuditLogEntry
} from '../types';

const rawApiUrl = import.meta.env.VITE_API_URL;
const BASE_URL = rawApiUrl ? String(rawApiUrl).replace(/\/+$/, '') : '';

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/api/health`);
  return res.json();
}

export async function fetchDemoSamples(): Promise<Array<{ id: string; label: string; filename: string; category: string; content: string }>> {
  const res = await fetch(`${BASE_URL}/api/demo/samples`);
  return res.json();
}

export async function analyzeEmail(payload: {
  raw_content?: string;
  headers_only?: string;
  subject?: string;
  body?: string;
  sender?: string;
  recipient?: string;
  demo_case?: string;
}): Promise<AnalysisResult> {
  const res = await fetch(`${BASE_URL}/api/analyze/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Email analysis failed');
  }
  return res.json();
}

export async function analyzeEmlFile(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/api/analyze/eml`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'EML file analysis failed');
  }
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${BASE_URL}/api/dashboard/stats`);
  return res.json();
}

export async function fetchCases(params?: { status?: string; severity?: string; search?: string }): Promise<Case[]> {
  const q = new URLSearchParams();
  if (params?.status) q.append('status', params.status);
  if (params?.severity) q.append('severity', params.severity);
  if (params?.search) q.append('search', params.search);
  const res = await fetch(`${BASE_URL}/api/cases?${q.toString()}`);
  return res.json();
}

export async function fetchCaseDetails(caseId: string): Promise<AnalysisResult | Case> {
  const res = await fetch(`${BASE_URL}/api/cases/${caseId}`);
  if (!res.ok) throw new Error('Case not found');
  return res.json();
}

export async function updateCaseStatus(caseId: string, status: string, note?: string) {
  const res = await fetch(`${BASE_URL}/api/cases/${caseId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note })
  });
  return res.json();
}

export async function createCase(data: {
  title: string;
  investigator?: string;
  severity?: string;
  classification?: string;
  risk_score?: number;
  sender?: string;
  domain?: string;
  subject?: string;
  notes?: string;
}): Promise<Case> {
  const res = await fetch(`${BASE_URL}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export function getReportDownloadUrl(caseId: string): string {
  return `${BASE_URL}/api/cases/${caseId}/report`;
}

export async function fetchEvidenceLedger(): Promise<{ summary: LedgerSummary; chain: LedgerBlock[] }> {
  const res = await fetch(`${BASE_URL}/api/evidence/ledger`);
  return res.json();
}

export async function verifyEvidenceIntegrity(evidenceId: string, fileContent?: string) {
  const res = await fetch(`${BASE_URL}/api/evidence/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evidence_id: evidenceId, file_content: fileContent })
  });
  return res.json();
}

export async function lookupThreatIntel(indicator: string) {
  const res = await fetch(`${BASE_URL}/api/threat-intel/${encodeURIComponent(indicator)}`);
  return res.json();
}

export async function lookupIpGeo(ip: string) {
  const res = await fetch(`${BASE_URL}/api/geo/${encodeURIComponent(ip)}`);
  return res.json();
}

export async function fetchCampaigns() {
  const res = await fetch(`${BASE_URL}/api/campaigns`);
  return res.json();
}

export async function fetchAlerts(): Promise<AlertNotification[]> {
  const res = await fetch(`${BASE_URL}/api/alerts`);
  return res.json();
}

export async function markAlertRead(alertId: string) {
  const res = await fetch(`${BASE_URL}/api/alerts/${alertId}/read`, { method: 'POST' });
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await fetch(`${BASE_URL}/api/audit-logs`);
  return res.json();
}
