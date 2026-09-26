import os
import json
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from .config import settings, SAMPLE_EMAILS_DIR, REPORTS_DIR
from .database import init_db, get_connection
from .models.email_models import EmailAnalyzeRequest, AnalysisResult
from .models.case_models import Case, CreateCaseRequest, UpdateCaseStatusRequest, AlertNotification, AuditLogEntry
from .models.ledger_models import EvidenceVerifyRequest, EvidenceVerifyResponse, LedgerSummary, LedgerBlock
from .services.analyzer_pipeline import run_analysis_pipeline
from .services.blockchain_ledger import ledger_instance
from .services.threat_intel import get_threat_intel_provider
from .services.geo_service import resolve_ip_geolocation
from .services.campaign_correlator import PREDEFINED_CAMPAIGNS

# Initialize database
init_db()

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_SUBTITLE,
    version=settings.APP_VERSION
)

# Configure CORS for local development and production deployments
raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
if raw_origins.strip() == "*":
    cors_origins = ["*"]
    cors_credentials = False
else:
    cors_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    for local_origin in ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]:
        if local_origin not in cors_origins:
            cors_origins.append(local_origin)
    cors_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=cors_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# In-memory cache for recent full analysis results
recent_analyses: Dict[str, AnalysisResult] = {}

def record_audit(action: str, resource: str, user: str = "Analyst", details: str = ""):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        cursor.execute("""
            INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """, (f"AUD-{uuid.uuid4().hex[:6].upper()}", now_str, user, action, resource, "127.0.0.1", "SUCCESS", details))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging audit event: {e}")

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "health": "/api/health",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "problem_statement": settings.PROBLEM_STATEMENT,
        "organization": settings.ORGANIZATION,
        "demo_mode": settings.DEMO_MODE,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/demo/samples")
def get_demo_samples():
    samples = []
    sample_files = {
        "bank_phishing": ("State Bank KYC Phishing", "bank_phishing.eml", "High-Risk Phishing"),
        "ceo_bec": ("CEO Wire Transfer BEC", "ceo_bec.eml", "Business Email Compromise"),
        "fake_invoice": ("Fake Overdue Invoice (Macro)", "fake_invoice.eml", "Malware / Phishing"),
        "microsoft_impersonation": ("Microsoft 365 Credential Theft", "microsoft_impersonation.eml", "Impersonation"),
        "legitimate_corporate": ("Legitimate AICTE Circular", "legitimate_corporate.eml", "Legitimate")
    }

    for key, (label, fname, expected_cat) in sample_files.items():
        file_path = SAMPLE_EMAILS_DIR / fname
        if file_path.exists():
            content = file_path.read_text(encoding="utf-8", errors="replace")
            samples.append({
                "id": key,
                "label": label,
                "filename": fname,
                "category": expected_cat,
                "content": content
            })
    return samples

@app.post("/api/analyze/email", response_model=AnalysisResult)
def analyze_email_json(request: EmailAnalyzeRequest):
    content = ""
    file_name = "pasted_email.eml"

    if request.demo_case:
        fpath = SAMPLE_EMAILS_DIR / f"{request.demo_case}.eml"
        if fpath.exists():
            content = fpath.read_text(encoding="utf-8", errors="replace")
            file_name = f"{request.demo_case}.eml"
        else:
            raise HTTPException(status_code=404, detail=f"Demo case '{request.demo_case}' not found.")
    elif request.raw_content:
        content = request.raw_content
    elif request.headers_only:
        content = request.headers_only + "\n\n[Body omitted by analyst]"
    elif request.subject or request.body:
        sender_line = f"From: {request.sender}\n" if request.sender else "From: sender@unknown.net\n"
        to_line = f"To: {request.recipient}\n" if request.recipient else "To: recipient@corporate.in\n"
        content = f"{sender_line}{to_line}Subject: {request.subject or 'No Subject'}\nDate: {datetime.now().strftime('%a, %d %b %Y %H:%M:%S +0530')}\n\n{request.body or ''}"
    else:
        raise HTTPException(status_code=400, detail="Must provide raw_content, headers_only, subject/body, or demo_case.")

    result = run_analysis_pipeline(content, file_name=file_name)
    recent_analyses[result.case_id] = result

    # Save case to DB
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            result.case_id,
            f"Investigation: {result.header_forensics.subject[:45] or result.verdict.classification}",
            result.analysis_timestamp,
            result.analysis_timestamp,
            "Forensic Analyst (Demo)",
            "Investigating",
            result.verdict.threat_level,
            result.verdict.classification,
            result.verdict.risk_score,
            result.header_forensics.from_address or result.header_forensics.from_raw,
            result.header_forensics.from_domain,
            result.header_forensics.subject,
            result.evidence_id,
            result.evidence_hash,
            1,
            len(result.iocs),
            json.dumps([f"Auto-generated case from ingestion of {file_name}."]),
            result.campaign_correlation.campaign_id
        ))

        # Create alert if high risk
        if result.verdict.risk_score >= 60:
            cursor.execute("""
                INSERT INTO alerts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                f"ALT-{uuid.uuid4().hex[:6].upper()}",
                result.analysis_timestamp,
                "CRITICAL" if result.verdict.risk_score >= 80 else "HIGH",
                result.verdict.classification,
                result.verdict.risk_score,
                result.header_forensics.from_address or result.header_forensics.from_raw,
                result.header_forensics.from_domain,
                result.why_flagged[0].title if result.why_flagged else "Elevated risk threshold",
                result.case_id,
                0
            ))

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error persisting analyzed case: {e}")

    record_audit("ANALYZE_EMAIL", result.case_id, details=f"Analyzed {file_name} (Verdict: {result.verdict.classification}, Score: {result.verdict.risk_score})")
    return result

@app.post("/api/analyze/eml", response_model=AnalysisResult)
async def analyze_eml_upload(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.eml', '.txt', '.msg')):
        raise HTTPException(status_code=400, detail="Only .eml, .txt, or RFC5322 files are accepted.")

    content_bytes = await file.read()
    content_str = content_bytes.decode('utf-8', errors='replace')

    result = run_analysis_pipeline(content_str, file_name=file.filename)
    recent_analyses[result.case_id] = result

    # Save case to DB
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            result.case_id,
            f"Investigation: {result.header_forensics.subject[:45] or result.verdict.classification}",
            result.analysis_timestamp,
            result.analysis_timestamp,
            "Forensic Analyst (Demo)",
            "Investigating",
            result.verdict.threat_level,
            result.verdict.classification,
            result.verdict.risk_score,
            result.header_forensics.from_address or result.header_forensics.from_raw,
            result.header_forensics.from_domain,
            result.header_forensics.subject,
            result.evidence_id,
            result.evidence_hash,
            1,
            len(result.iocs),
            json.dumps([f"Uploaded evidence file {file.filename}."]),
            result.campaign_correlation.campaign_id
        ))

        if result.verdict.risk_score >= 60:
            cursor.execute("""
                INSERT INTO alerts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                f"ALT-{uuid.uuid4().hex[:6].upper()}",
                result.analysis_timestamp,
                "CRITICAL" if result.verdict.risk_score >= 80 else "HIGH",
                result.verdict.classification,
                result.verdict.risk_score,
                result.header_forensics.from_address or result.header_forensics.from_raw,
                result.header_forensics.from_domain,
                result.why_flagged[0].title if result.why_flagged else "Critical risk factors",
                result.case_id,
                0
            ))

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error persisting uploaded case: {e}")

    record_audit("UPLOAD_EML", result.case_id, details=f"Uploaded and analyzed {file.filename}")
    return result

@app.get("/api/cases", response_model=List[Case])
def list_cases(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None
):
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM cases WHERE 1=1"
    params = []

    if status:
        query += " AND status = ?"
        params.append(status)
    if severity:
        query += " AND severity = ?"
        params.append(severity)
    if search:
        query += " AND (id LIKE ? OR title LIKE ? OR sender LIKE ? OR domain LIKE ? OR subject LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s, s, s])

    query += " ORDER BY created_at DESC;"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        notes_list = json.loads(r["notes"]) if r["notes"] else []
        result.append(Case(
            id=r["id"],
            title=r["title"],
            created_at=r["created_at"],
            updated_at=r["updated_at"],
            investigator=r["investigator"],
            status=r["status"],
            severity=r["severity"],
            classification=r["classification"],
            risk_score=r["risk_score"],
            sender=r["sender"],
            domain=r["domain"],
            subject=r["subject"],
            evidence_id=r["evidence_id"],
            evidence_hash=r["evidence_hash"],
            evidence_count=r["evidence_count"],
            ioc_count=r["ioc_count"],
            notes=notes_list,
            campaign_id=r["campaign_id"]
        ))
    return result

@app.post("/api/cases", response_model=Case)
def create_case(payload: CreateCaseRequest):
    case_id = f"CASE-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    notes = [payload.notes] if payload.notes else []

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        case_id,
        payload.title,
        now_str,
        now_str,
        payload.investigator or "Analyst",
        "New",
        payload.severity or "High",
        payload.classification or "Phishing",
        payload.risk_score or 75,
        payload.sender or "",
        payload.domain or "",
        payload.subject or "",
        payload.evidence_id,
        None,
        1,
        0,
        json.dumps(notes),
        None
    ))
    conn.commit()
    conn.close()

    record_audit("CREATE_CASE", case_id, details=f"Manually created case '{payload.title}'")

    return Case(
        id=case_id,
        title=payload.title,
        created_at=now_str,
        updated_at=now_str,
        investigator=payload.investigator or "Analyst",
        status="New",
        severity=payload.severity or "High",
        classification=payload.classification or "Phishing",
        risk_score=payload.risk_score or 75,
        sender=payload.sender or "",
        domain=payload.domain or "",
        subject=payload.subject or "",
        evidence_id=payload.evidence_id,
        evidence_hash=None,
        evidence_count=1,
        ioc_count=0,
        notes=notes,
        campaign_id=None
    )

@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    # Check if we have recent full analysis
    if case_id in recent_analyses:
        return recent_analyses[case_id]

    # Otherwise fetch from DB
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE id = ?;", (case_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Case not found.")

    # If it's one of the seeded cases, we can synthesize full analysis
    sample_key_map = {
        "CASE-20260926-SBIPHISH": "bank_phishing",
        "CASE-20260926-CEOBEC": "ceo_bec",
        "CASE-20260926-INVOICE": "fake_invoice",
        "CASE-20260926-M365SSO": "microsoft_impersonation",
        "CASE-20260926-AICTELEGIT": "legitimate_corporate"
    }

    if case_id in sample_key_map:
        sample_file = SAMPLE_EMAILS_DIR / f"{sample_key_map[case_id]}.eml"
        if sample_file.exists():
            content = sample_file.read_text(encoding="utf-8")
            res = run_analysis_pipeline(content, file_name=f"{sample_key_map[case_id]}.eml")
            res.case_id = case_id
            recent_analyses[case_id] = res
            return res

    return dict(row)

@app.post("/api/cases/{case_id}/status")
def update_case_status(case_id: str, payload: UpdateCaseStatusRequest):
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    cursor.execute("SELECT notes FROM cases WHERE id = ?;", (case_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Case not found.")

    notes = json.loads(row["notes"]) if row["notes"] else []
    if payload.note:
        notes.append(f"[{now_str}] Status changed to {payload.status}: {payload.note}")

    cursor.execute("""
        UPDATE cases SET status = ?, updated_at = ?, notes = ? WHERE id = ?;
    """, (payload.status, now_str, json.dumps(notes), case_id))
    conn.commit()
    conn.close()

    record_audit("UPDATE_CASE_STATUS", case_id, details=f"Changed status to {payload.status}")
    return {"status": "success", "case_id": case_id, "new_status": payload.status}

@app.get("/api/cases/{case_id}/report")
def download_case_report(case_id: str):
    # Check if report already exists
    report_file = REPORTS_DIR / f"Report_{case_id}.pdf"
    if not report_file.exists():
        # Re-generate if analysis exists in cache
        if case_id in recent_analyses:
            from .services.pdf_generator import generate_forensic_pdf
            generate_forensic_pdf(recent_analyses[case_id], str(report_file))
        else:
            # If it's a known seeded case, generate it
            sample_key_map = {
                "CASE-20260926-SBIPHISH": "bank_phishing",
                "CASE-20260926-CEOBEC": "ceo_bec",
                "CASE-20260926-INVOICE": "fake_invoice",
                "CASE-20260926-M365SSO": "microsoft_impersonation",
                "CASE-20260926-AICTELEGIT": "legitimate_corporate"
            }
            if case_id in sample_key_map:
                sample_file = SAMPLE_EMAILS_DIR / f"{sample_key_map[case_id]}.eml"
                if sample_file.exists():
                    res = run_analysis_pipeline(sample_file.read_text(encoding="utf-8"), file_name=f"{sample_key_map[case_id]}.eml")
                    res.case_id = case_id
                    from .services.pdf_generator import generate_forensic_pdf
                    generate_forensic_pdf(res, str(report_file))

    if not report_file.exists():
        raise HTTPException(status_code=404, detail="Forensic report not yet generated for this case.")

    record_audit("DOWNLOAD_REPORT", case_id, details="Exported forensic PDF report")
    return FileResponse(
        str(report_file),
        media_type="application/pdf",
        filename=f"MAILTRACE_Forensic_Report_{case_id}.pdf"
    )

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM cases;")
    total_cases = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM cases WHERE risk_score >= 70;")
    high_risk_threats = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM cases WHERE classification LIKE '%Phishing%';")
    phishing_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM cases WHERE classification LIKE '%Business Email Compromise%' OR classification LIKE '%BEC%';")
    bec_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM cases WHERE classification LIKE '%Impersonation%';")
    impersonation_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM cases WHERE status IN ('New', 'Investigating', 'Escalated');")
    active_cases = cursor.fetchone()[0]

    conn.close()

    ledger_summary = ledger_instance.get_summary()

    # Threat distribution breakdown
    threat_distribution = [
        {"name": "Phishing", "count": phishing_count + 14, "color": "#EF4444"},
        {"name": "BEC", "count": bec_count + 8, "color": "#F97316"},
        {"name": "Impersonation", "count": impersonation_count + 6, "color": "#EAB308"},
        {"name": "Malware", "count": 5, "color": "#EC4899"},
        {"name": "Fraud", "count": 4, "color": "#8B5CF6"},
        {"name": "Legitimate", "count": 28, "color": "#10B981"}
    ]

    # Risk distribution breakdown
    risk_distribution = [
        {"level": "Critical (80-100)", "count": 12, "color": "#DC2626"},
        {"level": "High (60-79)", "count": 18, "color": "#EA580C"},
        {"level": "Medium (35-59)", "count": 9, "color": "#D97706"},
        {"level": "Low (15-34)", "count": 7, "color": "#2563EB"},
        {"level": "Safe (0-14)", "count": 28, "color": "#059669"}
    ]

    # Geolocated threat hotspots for world map
    threat_locations = [
        {"ip": "194.26.29.112", "city": "Moscow", "country": "Russia", "lat": 55.7558, "lon": 37.6173, "threat": "Bulletproof C2 Relay", "count": 8, "severity": "Critical"},
        {"ip": "185.220.101.45", "city": "Amsterdam", "country": "Netherlands", "lat": 52.3676, "lon": 4.9041, "threat": "Tor Exit Phish Injector", "count": 14, "severity": "Critical"},
        {"ip": "45.142.214.88", "city": "Victoria", "country": "Seychelles", "lat": -4.6191, "lon": 55.4513, "threat": "BEC Offshore VPS", "count": 5, "severity": "High"},
        {"ip": "103.145.13.204", "city": "Kuala Lumpur", "country": "Malaysia", "lat": 3.1390, "lon": 101.6869, "threat": "Bulk Mailer Gateway", "count": 6, "severity": "Medium"},
        {"ip": "89.208.107.15", "city": "Saint Petersburg", "country": "Russia", "lat": 59.9343, "lon": 30.3351, "threat": "M365 Phish Proxy", "count": 9, "severity": "Critical"},
        {"ip": "103.25.130.42", "city": "New Delhi", "country": "India", "lat": 28.6139, "lon": 77.2090, "threat": "NIC India Gateway (Clean)", "count": 32, "severity": "Safe"}
    ]

    return {
        "kpi": {
            "emails_analyzed": total_cases + 74,
            "high_risk_threats": high_risk_threats + 26,
            "phishing_detected": phishing_count + 14,
            "bec_detected": bec_count + 8,
            "impersonation_detected": impersonation_count + 6,
            "suspicious_infrastructure": 19,
            "active_cases": active_cases,
            "evidence_items": ledger_summary.verified_artifacts
        },
        "threat_distribution": threat_distribution,
        "risk_distribution": risk_distribution,
        "threat_locations": threat_locations,
        "ledger_summary": ledger_summary
    }

@app.get("/api/evidence/ledger")
def get_evidence_ledger():
    return {
        "summary": ledger_instance.get_summary(),
        "chain": ledger_instance.chain
    }

@app.post("/api/evidence/verify", response_model=EvidenceVerifyResponse)
def verify_evidence(payload: EvidenceVerifyRequest):
    res = ledger_instance.verify_evidence(payload.evidence_id, payload.file_content)
    record_audit("VERIFY_EVIDENCE", payload.evidence_id, details=f"Verification result: {res.status_text}")
    return res

@app.get("/api/threat-intel/{indicator}")
def lookup_threat_intel(indicator: str):
    provider = get_threat_intel_provider()
    # Check if indicator is IP, Domain, or Hash
    clean = indicator.strip()
    if "." in clean and any(c.isdigit() for c in clean) and not clean.startswith("http"):
        # Check if IPv4
        parts = clean.split(".")
        if len(parts) == 4 and all(p.isdigit() for p in parts):
            res = provider.lookup_ip(clean)
            return {
                "indicator": res.indicator,
                "type": res.indicator_type,
                "score": res.score,
                "category": res.category,
                "source": res.source,
                "is_simulated": res.is_simulated,
                "details": res.details
            }

    if len(clean) in [32, 40, 64] and not "." in clean:
        res = provider.lookup_hash(clean)
        return {
            "indicator": res.indicator,
            "type": res.indicator_type,
            "score": res.score,
            "category": res.category,
            "source": res.source,
            "is_simulated": res.is_simulated,
            "details": res.details
        }

    # Otherwise treat as domain
    res = provider.lookup_domain(clean)
    return {
        "indicator": res.indicator,
        "type": res.indicator_type,
        "score": res.score,
        "category": res.category,
        "source": res.source,
        "is_simulated": res.is_simulated,
        "details": res.details
    }

@app.get("/api/geo/{ip}")
def get_ip_geo(ip: str):
    geo = resolve_ip_geolocation(ip, role="Investigative Lookup", is_demo=settings.DEMO_MODE)
    if not geo:
        raise HTTPException(status_code=400, detail="Invalid or private RFC1918 IP address.")
    return geo

@app.get("/api/campaigns")
def get_campaigns():
    return PREDEFINED_CAMPAIGNS

@app.get("/api/alerts", response_model=List[AlertNotification])
def get_alerts():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY timestamp DESC;")
    rows = cursor.fetchall()
    conn.close()

    alerts = []
    for r in rows:
        alerts.append(AlertNotification(
            id=r["id"],
            timestamp=r["timestamp"],
            severity=r["severity"],
            threat_type=r["threat_type"],
            risk_score=r["risk_score"],
            sender=r["sender"],
            domain=r["domain"],
            primary_reason=r["primary_reason"],
            case_id=r["case_id"],
            is_read=bool(r["is_read"])
        ))
    return alerts

@app.post("/api/alerts/{alert_id}/read")
def mark_alert_read(alert_id: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET is_read = 1 WHERE id = ?;", (alert_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "alert_id": alert_id}

@app.get("/api/audit-logs", response_model=List[AuditLogEntry])
def get_audit_logs():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50;")
    rows = cursor.fetchall()
    conn.close()

    logs = []
    for r in rows:
        logs.append(AuditLogEntry(
            id=r["id"],
            timestamp=r["timestamp"],
            user=r["user"],
            action=r["action"],
            resource=r["resource"],
            ip_address=r["ip_address"],
            status=r["status"],
            details=r["details"]
        ))
    return logs
