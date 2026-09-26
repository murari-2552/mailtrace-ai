import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft, Terminal, ShieldAlert } from 'lucide-react';
import { AnalysisResult } from '../types';
import { analyzeEmail, analyzeEmlFile, fetchCaseDetails } from '../services/api';

import { DemoSelector } from '../components/analyzer/DemoSelector';
import { EmailDropzone } from '../components/analyzer/EmailDropzone';
import { AnalysisProgress } from '../components/analyzer/AnalysisProgress';

import { ThreatVerdict } from '../components/investigation/ThreatVerdict';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { ExplainableAi } from '../components/investigation/ExplainableAi';
import { AuthPanel } from '../components/investigation/AuthPanel';
import { HeaderForensics } from '../components/investigation/HeaderForensics';
import { RelayPathTimeline } from '../components/investigation/RelayPathTimeline';
import { GeoLocationMap } from '../components/investigation/GeoLocationMap';
import { DomainUrlIntel } from '../components/investigation/DomainUrlIntel';
import { AttachmentTable } from '../components/investigation/AttachmentTable';
import { BecSocialEng } from '../components/investigation/BecSocialEng';
import { IocTable } from '../components/investigation/IocTable';
import { InfraGraph } from '../components/investigation/InfraGraph';
import { ForensicTimeline } from '../components/investigation/ForensicTimeline';
import { EvidenceCustody } from '../components/investigation/EvidenceCustody';
import { RecommendedActions } from '../components/investigation/RecommendedActions';

interface AnalyzerPageProps {
  initialCaseId?: string | null;
  onClearInitialCase?: () => void;
  onNavigateToLedger?: () => void;
}

export const AnalyzerPage: React.FC<AnalyzerPageProps> = ({
  initialCaseId,
  onClearInitialCase,
  onNavigateToLedger
}) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingResult, setPendingResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If initialCaseId is passed from Dashboard, load it immediately
  useEffect(() => {
    if (initialCaseId) {
      loadCaseById(initialCaseId);
    }
  }, [initialCaseId]);

  const loadCaseById = async (caseId: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const data: any = await fetchCaseDetails(caseId);
      if (data.verdict) {
        setPendingResult(data as AnalysisResult);
      } else {
        // If not cached, analyze demo case
        const sampleMap: Record<string, string> = {
          'CASE-20260926-SBIPHISH': 'bank_phishing',
          'CASE-20260926-CEOBEC': 'ceo_bec',
          'CASE-20260926-INVOICE': 'fake_invoice',
          'CASE-20260926-M365SSO': 'microsoft_impersonation',
          'CASE-20260926-AICTELEGIT': 'legitimate_corporate'
        };
        const demoKey = sampleMap[caseId] || 'bank_phishing';
        const res = await analyzeEmail({ demo_case: demoKey });
        setPendingResult(res);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error loading case details.');
      setIsAnalyzing(false);
    }
  };

  const handleSelectDemo = async (demoKey: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await analyzeEmail({ demo_case: demoKey });
      setPendingResult(res);
    } catch (e: any) {
      setErrorMessage(e.message || 'Error running demo analysis.');
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeRaw = async (content: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await analyzeEmail({ raw_content: content });
      setPendingResult(res);
    } catch (e: any) {
      setErrorMessage(e.message || 'Analysis failed. Please verify email format.');
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await analyzeEmlFile(file);
      setPendingResult(res);
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to parse .eml file payload.');
      setIsAnalyzing(false);
    }
  };

  // Called when 10-step animation finishes
  const handleProgressComplete = () => {
    if (pendingResult) {
      setAnalysisResult(pendingResult);
      setPendingResult(null);
    }
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setPendingResult(null);
    setErrorMessage(null);
    onClearInitialCase?.();
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>EMAIL THREAT ANALYZER & FORENSIC DOSSIER</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            MIME Parsing • Multi-Tier Heuristic AI • Routing Trace • Blockchain Evidence Ledger
          </p>
        </div>

        {analysisResult && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs px-3.5 py-2 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Analyze Another Email</span>
          </button>
        )}
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="bg-red-950/40 border border-red-800 rounded-xl p-4 text-xs font-mono text-red-300 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Stage: Demo Selector + Email Dropzone */}
      {!analysisResult && !isAnalyzing && (
        <div className="space-y-6">
          <DemoSelector onSelectDemo={handleSelectDemo} isLoading={isAnalyzing} />
          <EmailDropzone
            onAnalyzeRaw={handleAnalyzeRaw}
            onAnalyzeFile={handleAnalyzeFile}
            isLoading={isAnalyzing}
          />
        </div>
      )}

      {/* 10-Stage Progress Animation */}
      {isAnalyzing && (
        <AnalysisProgress onComplete={handleProgressComplete} />
      )}

      {/* Unified Investigation Results View */}
      {analysisResult && !isAnalyzing && (
        <div className="space-y-6 animate-fadeIn">
          {/* 1. Threat Verdict & Action Bar */}
          <ThreatVerdict
            result={analysisResult}
            onVerifyLedger={onNavigateToLedger}
          />

          {/* 2. Core Forensic Standard Disclaimer */}
          <DisclaimerBanner />

          {/* 3. Explainable AI ("Why was this email flagged?") */}
          <ExplainableAi indicators={analysisResult.why_flagged} />

          {/* 4. Authentication Panel (SPF, DKIM, DMARC) */}
          <AuthPanel auth={analysisResult.authentication} />

          {/* 5. Header Forensics & Flow */}
          <HeaderForensics
            headers={analysisResult.header_forensics}
            origin={analysisResult.origin_candidate || undefined}
          />

          {/* 6. Relay Path Timeline */}
          <RelayPathTimeline
            hops={analysisResult.relay_path}
            originCandidate={analysisResult.origin_candidate || undefined}
          />

          {/* 7. IP Geolocation Intelligence Map */}
          <GeoLocationMap locations={analysisResult.geolocations} />

          {/* 8. Domain & URL Forensics */}
          <DomainUrlIntel
            domains={analysisResult.domain_intelligence}
            urls={analysisResult.url_intelligence}
          />

          {/* 9. Attachment Forensics */}
          <AttachmentTable attachments={analysisResult.attachment_intelligence} />

          {/* 10. BEC & Social Engineering Meters */}
          <BecSocialEng
            bec={analysisResult.bec_analysis}
            social={analysisResult.social_engineering}
          />

          {/* 11. Indicators of Compromise (IOC) Table */}
          <IocTable
            iocs={analysisResult.iocs}
            caseId={analysisResult.case_id}
          />

          {/* 12. Infrastructure Correlation Graph */}
          <InfraGraph graph={analysisResult.infrastructure_graph} />

          {/* 13. Forensic Timeline */}
          <ForensicTimeline events={analysisResult.timeline} />

          {/* 14. Blockchain Evidence Ledger & Chain of Custody */}
          <EvidenceCustody
            evidenceId={analysisResult.evidence_id}
            evidenceHash={analysisResult.evidence_hash}
            fileName={analysisResult.file_name}
            timestamp={analysisResult.analysis_timestamp}
            blockchainTx={analysisResult.blockchain_tx}
          />

          {/* 15. SOC Incident Response Recommendations */}
          <RecommendedActions actions={analysisResult.recommended_actions} />
        </div>
      )}
    </div>
  );
};
