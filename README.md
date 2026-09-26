# MAILTRACE AI
### AI-Powered Email Threat Detection, GeoLocation & Forensic Intelligence Platform

**Smart India Hackathon 2026 — Problem Statement:** `SIH26106`  
**Organization:** All India Council for Technical Education (AICTE), Cyber Security Cell  
**Theme:** Blockchain & Cybersecurity  

---

## 1. Project Overview

**MAILTRACE AI** is a professional, courtroom- and SOC-grade email threat investigation and digital forensics intelligence platform. Built for security operations center (SOC) analysts, cyber cell investigators, and incident responders, the platform moves far beyond traditional binary spam filtering by executing a continuous, end-to-end investigative lifecycle:

$$\textbf{DETECT} \longrightarrow \textbf{ANALYZE} \longrightarrow \textbf{TRACE} \longrightarrow \textbf{CORRELATE} \longrightarrow \textbf{EXPLAIN} \longrightarrow \textbf{PRESERVE} \longrightarrow \textbf{REPORT}$$

The platform ingests suspicious `.eml` files, raw email headers, or plain message bodies, extracts Indicators of Compromise (IOCs), validates SPF/DKIM/DMARC domain alignment, chronologically reconstructs intermediate mail transfer agent (MTA) hops, isolates the **Earliest Reliable Origin Candidate**, geocodes threat infrastructure, inspects lookalike domain typosquatting and URL redirect chains, extracts static attachment hashes, measures linguistic and psychological coercion levers, clusters correlated threat campaigns, commits cryptographic evidence fingerprints to an **Immutable Blockchain Evidence Ledger**, and generates an official digital forensic investigation report (PDF).

---

## 2. Core Forensic & Security Principles

In strict adherence to digital forensics standards and evidentiary admissibility guidelines:
* **Demarcation of Evidence Levels**: The platform rigorously distinguishes between:
  * **FACT**: Cryptographic hashes, DKIM signatures, physical RFC 5322 byte sequences.
  * **OBSERVATION**: Intermediate MTA Received headers, resolved DNS A/MX records.
  * **INDICATOR**: Anomalous Reply-To discrepancies, typosquatted brand strings.
  * **AI INFERENCE**: Social engineering intent, BEC payment diversion directives.
  * **INVESTIGATIVE HYPOTHESIS**: Campaign clustering and infrastructure attribution.
* **Non-Attribution Disclaimer**: The platform strictly avoids asserting that an IP address identifies an individual person. Geolocation displays the *observed sending infrastructure* and includes transparent disclaimers noting that IP network location is approximate and does not establish physical identity.
* **Defensive Safety Guarantee**: No uploaded attachments or payloads are ever executed. Attachments undergo static metadata inspection only (MIME verification, SHA-256/SHA-1 generation, double-extension detection). Hyperlinks are inspected safely without opening active malicious browser sessions.
* **Technical Honesty**: Simulated or offline demonstration datasets are transparently tagged with `DEMO / SIMULATED DATA` to ensure academic and courtroom integrity.

---

## 3. Architecture & Technology Stack

```
                     ┌─────────────────────────────────────────────────────────┐
                     │          MAILTRACE AI FRONTEND (Vite + React + TS)      │
                     │  - Dark SOC Visual Language (Slate/Navy, Contrast HUD)   │
                     │  - Dashboard, Analyzer, Cases, Ledger, Campaigns, Alerts│
                     │  - Leaflet GeoLocation Map & Relay Visualizer           │
                     │  - Interactive SVG Node-Link Infrastructure Graph       │
                     │  - Blockchain Ledger Explorer & Verification Engine     │
                     └────────────────────────────┬────────────────────────────┘
                                                  │ REST API / Multipart Form
                                                  ▼
                     ┌─────────────────────────────────────────────────────────┐
                     │            FASTAPI FORENSIC BACKEND ENGINE              │
                     │                                                         │
                     │  1. Email Parser (Python email, MIME, RFC 2047 decode)  │
                     │  2. Authentication Engine (SPF, DKIM, DMARC alignment)  │
                     │  3. Routing Engine (Chronological Received hop trace)   │
                     │  4. GeoIP & ASN Provider (GeoCoordinates, ISP, ASN)     │
                     │  5. Domain & URL Intel (Typosquatting, Redirect chains) │
                     │  6. Attachment Risk Analyzer (Hashes, Double Extension) │
                     │  7. BEC & NLP Social Engineering Detector               │
                     │  8. Risk Fusion & Explainable AI (0-100 Matrix)         │
                     │  9. Campaign Correlation Engine (Clustering by IOCs)    │
                     │ 10. Immutable Evidence Ledger (SHA-256 Merkle Chain)    │
                     │ 11. ReportLab Forensic PDF Report Generator             │
                     └────────────────────────────┬────────────────────────────┘
                                                  │
                                      ┌───────────┴───────────┐
                                      ▼                       ▼
                             SQLite Database         Synthetic .EML Samples
                           (Pre-seeded SOC Cases)    (5 realistic scenarios)
```

### Technology Matrix
* **Backend**: Python 3.14+, FastAPI, Uvicorn, Pydantic v2, SQLite3, ReportLab, dnspython.
* **Frontend**: React 18, TypeScript 5, Vite 6, Tailwind CSS, Lucide React, Leaflet 1.9.
* **Blockchain**: SHA-256 cryptographic Merkle tree ledger with block mining, transaction references, and local append-only verification.
* **Reporting**: ReportLab PDF Generation engine formatted with formal SOC banners, tables, and chain of custody logs.

---

## 4. Key Features & Capabilities

1. **10-Tier Ingestion & Parsing Pipeline**: Handles `.eml` files, raw email headers, pasted content, and multipart MIME streams with RFC 2047 decoding.
2. **Cryptographic Authentication Forensics**: Evaluates SPF, DKIM, and DMARC alignment against the `From` domain, diagnosing unauthorized relaying and spoofed identities.
3. **MTA Relay-Path Reconstruction**: Traces all `Received` headers from sender to destination, distinguishes private RFC 1918 hops, and identifies the **Earliest Reliable Origin Candidate** with an assigned confidence score.
4. **Interactive Leaflet Geolocation Map**: Visualizes the sending infrastructure on an interactive dark-mode global map with origin, intermediate relay, and destination nodes.
5. **Typosquatting & Lookalike Detection**: Heuristic detection of homoglyphs, character substitutions (e.g. `paypa1`, `micros0ft`), combosquatting, and brand impersonation (SBI, ICICI, HDFC, PayPal, Microsoft, Google, AICTE).
6. **URL Intelligence & Redirect Chains**: Unrolls shortened links (e.g. `bit.ly`), detects credential-harvesting patterns, identifies raw IP destinations, and displays the full redirect hop sequence.
7. **Safe Attachment Forensics**: Calculates SHA-256 and SHA-1 fingerprints, identifies dangerous double extensions (e.g. `.pdf.exe`), and flags macro-enabled office documents (`.docm`, `.xlsm`).
8. **BEC & Executive Impersonation Detector**: Identifies wire transfer directives, RTGS/NEFT payment diversion, fake overdue invoices, and executive display-name spoofing.
9. **Social Engineering Psychology Meters**: Measures 5 psychological pressure levers (Urgency, Authority, Fear, Credential Harvesting, Financial Pressure) on a 0–10 scale.
10. **Explainable AI (XAI)**: Replaces opaque predictions with structured, evidence-backed findings detailing *why* an email was flagged, including severity level, confidence, and source snippets.
11. **Infrastructure Correlation Graph**: Renders an interactive node-link relationship diagram displaying connections between Email, Senders, Domains, IPs, URLs, Attachments, and Campaigns.
12. **Campaign Threat Correlation**: Groups isolated security cases into campaign clusters based on shared IOCs, infrastructure footprints, and subject templates.
13. **Blockchain Immutable Evidence Ledger**: Commits canonical artifact hashes into an append-only cryptographic ledger with Merkle root validation and provides a 1-click **Verify Evidence Integrity** button.
14. **Formal Forensic Dossier Export**: Produces a comprehensive, courtroom-ready PDF report stamped with chain-of-custody metadata, executive summary, and recommended SOC playbooks.

---

## 5. Pre-Loaded Synthetic Demo Scenarios

The platform includes 5 realistic, internally consistent synthetic `.eml` scenarios (containing zero private personal data):

| Scenario | File Name | Key Threat Characteristics | Expected Verdict |
| :--- | :--- | :--- | :--- |
| **Banking Phishing** | `bank_phishing.eml` | Typosquatted `sbii-security-update.com`, Tor exit node hop, `.pdf.exe` double extension payload, KYC account freeze threats | **HIGH-RISK PHISHING (100/100)** |
| **CEO BEC** | `ceo_bec.eml` | Executive display-name spoofing, confidential wire transfer request for INR 18,50,000, SPF softfail | **BUSINESS EMAIL COMPROMISE (100/100)** |
| **Fake Invoice** | `fake_invoice.eml` | Overdue invoice coercion, bank account diversion, macro-enabled `.docm` payload attachment | **MALWARE / PHISHING (100/100)** |
| **Microsoft 365** | `microsoft_impersonation.eml` | Password expiry lure, bit.ly URL shortener redirect chain to credential harvesting landing portal | **HIGH-RISK PHISHING (100/100)** |
| **Legitimate Corporate** | `legitimate_corporate.eml` | AICTE circular, aligned SPF/DKIM/DMARC pass, legitimate ERNET/NIC gateway routing, 0 threat markers | **LEGITIMATE (0/100 - SAFE)** |

---

## 6. Setup & Installation Instructions

### Prerequisites
* **Python**: 3.11 or higher (Python 3.14 compatible)
* **Node.js**: v18.0 or higher
* **npm**: v9.0 or higher

### Step 1: Clone or Navigate to Project
```bash
cd mailtrace-ai
```

### Step 2: Set Up Backend
```bash
cd backend
python -m pip install -r requirements.txt
python test_backend.py
python run_backend.py
```
*The backend API will start on `http://127.0.0.1:8000`.*  
*Interactive Swagger documentation is available at `http://127.0.0.1:8000/docs`.*

### Step 3: Set Up Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend application will start on `http://localhost:5173`.*

---

## 7. Environment Variables & API Configuration

MAILTRACE AI runs out-of-the-box in **Offline Forensic Demo Mode** without requiring any external API keys. To connect optional live threat intelligence feeds, create a `.env` file in the `backend/` directory:

```env
# Optional External Threat Intelligence Keys
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
ABUSEIPDB_API_KEY=your_abuseipdb_api_key_here
IPGEOLOCATION_API_KEY=your_ipgeolocation_key_here

# Operational Mode
DEMO_MODE=True
PII_MASKING_DEFAULT=False
DATA_RETENTION_DAYS=90
```

> **Zero Crash Fallback:** If any API key is missing or an external lookup fails, the platform automatically routes the query to the high-fidelity simulated threat feed and labels the result with `DEMO / SIMULATED DATA`.

---

## 8. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analyze/email` | Analyzes JSON email payload (raw text, subject/body, or demo key) |
| `POST` | `/api/analyze/eml` | Multipart upload for `.eml` / RFC 5322 files |
| `GET` | `/api/cases` | Lists cases with search and status/severity filters |
| `POST` | `/api/cases` | Creates a new investigation case |
| `GET` | `/api/cases/{id}` | Retrieves full case investigation dossier |
| `POST` | `/api/cases/{id}/status` | Updates case status and adds investigator notes |
| `GET` | `/api/cases/{id}/report` | Downloads court-ready PDF forensic dossier |
| `GET` | `/api/dashboard/stats` | Returns real-time SOC metrics, KPI counts, and map hotspots |
| `GET` | `/api/evidence/ledger` | Returns full blockchain immutable ledger blocks and Merkle summary |
| `POST` | `/api/evidence/verify` | Recalculates SHA-256 hash and verifies integrity against ledger |
| `GET` | `/api/threat-intel/{indicator}` | Queries reputation for an IP, domain, or file hash |
| `GET` | `/api/geo/{ip}` | Returns enriched geolocation, ASN, and hosting telemetry for an IP |
| `GET` | `/api/campaigns` | Lists correlated threat campaigns and shared IOC clusters |
| `GET` | `/api/alerts` | Lists real-time SOC alerts |
| `POST` | `/api/alerts/{id}/read` | Marks an alert notification as read |
| `GET` | `/api/audit-logs` | Retrieves chronological audit trail entries |
| `GET` | `/api/demo/samples` | Lists synthetic demonstration email samples |
| `GET` | `/api/health` | System health check and status |

---

## 9. SIH 2026 Presentation Flow (2–4 Minutes)

1. **Open Dashboard**: Walk through the SOC KPIs (Emails Analyzed, High Risk Threats, Active Cases), Threat Distribution breakdown, and interactive Leaflet map.
2. **Start Investigation**: Navigate to the **Email Analyzer** page.
3. **Select Demo Case**: Click the **Banking Phishing** button (or upload `bank_phishing.eml`).
4. **Observe Progress**: Watch the 10-stage forensic decoding animation complete.
5. **Review Verdict**: Examine the **100/100 CRITICAL (MALWARE / PHISHING)** score with 95.5% confidence.
6. **Explainable AI**: Show the "Why Was This Email Flagged?" indicators (typosquatted SBI domain, double extension payload, Reply-To redirection).
7. **Authentication & Relay**: Review the failed SPF/DKIM/DMARC panel, the hop-by-hop relay timeline, and the Earliest Reliable Origin candidate.
8. **Geolocation Map**: Inspect the Leaflet map showing the Tor exit node and bulletproof VPS in Russia/Netherlands.
9. **Infrastructure Graph**: Demonstrate the interactive node-link graph correlating Email $\rightarrow$ Domain $\rightarrow$ IP $\rightarrow$ Attachment $\rightarrow$ Campaign.
10. **Verify Blockchain Evidence**: Scroll to the **Evidence Custody** panel and click **Verify Evidence Integrity** to confirm the SHA-256 match in the immutable ledger.
11. **Download Dossier**: Click **Export PDF Report** to download and present the official courtroom forensic document.

---

## 10. Limitations & Future Roadmap

* **Live E-Discovery Connectors**: Future versions will integrate Microsoft 365 Graph API and Google Workspace IMAP push webhooks for zero-touch inbox auto-quarantine.
* **On-Chain EVM Contract Deployment**: While the current platform implements a local cryptographic Merkle tree ledger, the architecture includes an EVM adapter for anchoring batch roots to Ethereum or Polygon PoS.
* **Deep Dynamic Sandbox Integration**: Adding automated Cuckoo or CAPE Sandbox API connectors for behavioral dynamic detonation of observed payloads.

---

## 11. Ethical & Legal Notice

This application was engineered solely for defensive cybersecurity investigation, education, and digital forensics research under the Smart India Hackathon 2026 initiative for the All India Council for Technical Education (AICTE), Cyber Security Cell.
