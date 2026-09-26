import React from 'react';
import {
  ShieldAlert,
  Terminal,
  Play,
  ArrowRight,
  Database,
  Lock,
  Cpu,
  Route,
  Share2,
  FileCheck2,
  CheckCircle2,
  Globe2
} from 'lucide-react';

interface LandingPageProps {
  onStartInvestigation: () => void;
  onViewDemoCase: (demoKey: string) => void;
  onGoToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartInvestigation,
  onViewDemoCase,
  onGoToDashboard
}) => {
  const steps = [
    { title: 'DETECT', desc: 'MIME decoding, SPF/DKIM/DMARC cryptographic validation & header anomaly detection' },
    { title: 'TRACE', desc: 'MTA hop sequence reconstruction & Earliest Reliable Origin IP candidate isolation' },
    { title: 'CORRELATE', desc: 'Cross-case infrastructure graph linking domains, IPs, URLs & campaign clusters' },
    { title: 'EXPLAIN', desc: 'Explainable AI scoring (0-100) isolating exact linguistic & behavioral cues' },
    { title: 'PRESERVE', desc: 'Cryptographic SHA-256 proof committed to immutable blockchain evidence ledger' },
    { title: 'REPORT', desc: 'Official courtroom & SOC-compliant digital forensic incident dossier generation' }
  ];

  return (
    <div className="space-y-12 pb-16 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0F172A] via-[#0B0F19] to-[#0B0F19] border border-slate-800/80 p-8 sm:p-14 text-center">
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>SMART INDIA HACKATHON 2026 // PROBLEM SIH26106</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 font-mono leading-tight">
            Turn suspicious emails into <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              actionable forensic intelligence.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            MAILTRACE AI is an enterprise-grade digital forensics platform engineered for security operations centers, cyber cells, and incident responders to detect, trace, correlate, explain, and preserve email threats.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartInvestigation}
              className="inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-cyan-950/50 transition-all hover:scale-105"
            >
              <Terminal className="w-4 h-4" />
              <span>START INVESTIGATION</span>
            </button>

            <button
              onClick={() => onViewDemoCase('bank_phishing')}
              className="inline-flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono font-medium text-sm px-6 py-3.5 rounded-xl transition"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-current" />
              <span>LAUNCH BANK PHISHING DEMO</span>
            </button>

            <button
              onClick={onGoToDashboard}
              className="inline-flex items-center gap-2 bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 font-mono text-sm px-4 py-3 rounded-xl transition"
            >
              <span>View SOC Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6-Stage Forensic Pipeline Visual */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            THE INVESTIGATIVE LIFECYCLE
          </h2>
          <p className="text-xl font-bold text-slate-100 font-mono">
            DETECT → ANALYZE → TRACE → CORRELATE → EXPLAIN → PRESERVE → REPORT
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2 hover:border-cyan-500/40 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold font-mono text-cyan-400 group-hover:text-cyan-300">
                  0{idx + 1}. {st.title}
                </span>
                <span className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-3">
          <Cpu className="w-8 h-8 text-cyan-400" />
          <h3 className="text-base font-bold font-mono text-slate-100">
            Explainable AI & NLP Fusion
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Never accept black-box assertions. Our 4-tier risk fusion engine provides transparent scoring (0-100) with line-by-line evidence justification, SPF/DKIM alignment logs, and psychological cue meters.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-3">
          <Route className="w-8 h-8 text-cyan-400" />
          <h3 className="text-base font-bold font-mono text-slate-100">
            Relay-Path & GeoLocation
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Chronological inspection of intermediate Received headers separates private RFC1918 networks from public routable infrastructure to designate the Earliest Reliable Origin Candidate.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-3">
          <Database className="w-8 h-8 text-purple-400" />
          <h3 className="text-base font-bold font-mono text-slate-100">
            Blockchain Immutable Ledger
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Aligns directly with SIH 2026 Theme: Blockchain & Cybersecurity. Every ingested email generates a canonical SHA-256 block in an immutable append-only ledger for evidentiary court admissibility.
          </p>
        </div>
      </section>

      {/* Security & Privacy Statement */}
      <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-xs text-slate-400 font-mono space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-bold uppercase text-xs">
          <Lock className="w-4 h-4 text-cyan-400" />
          <span>Cybersecurity Defensive Safe-Handling Assurance</span>
        </div>
        <p className="leading-relaxed">
          MAILTRACE AI operates under strict forensic safety protocols. No binary attachment payloads are executed, dynamic macros are inspected statically in isolation, and URLs are emulated safely without dangerous endpoint script execution.
        </p>
        <p className="text-slate-500 pt-1">
          Developed for All India Council for Technical Education (AICTE), Cyber Security Cell • Smart India Hackathon 2026.
        </p>
      </section>
    </div>
  );
};
