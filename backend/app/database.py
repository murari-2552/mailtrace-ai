import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional

from .config import DATABASE_PATH, SAMPLE_EMAILS_DIR
from .models.case_models import Case, AuditLogEntry, AlertNotification
from .services.blockchain_ledger import ledger_instance

def get_connection():
    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at TEXT,
        updated_at TEXT,
        investigator TEXT,
        status TEXT,
        severity TEXT,
        classification TEXT,
        risk_score INTEGER,
        sender TEXT,
        domain TEXT,
        subject TEXT,
        evidence_id TEXT,
        evidence_hash TEXT,
        evidence_count INTEGER,
        ioc_count INTEGER,
        notes TEXT,
        campaign_id TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        user TEXT,
        action TEXT,
        resource TEXT,
        ip_address TEXT,
        status TEXT,
        details TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        severity TEXT,
        threat_type TEXT,
        risk_score INTEGER,
        sender TEXT,
        domain TEXT,
        primary_reason TEXT,
        case_id TEXT,
        is_read INTEGER
    );
    """)

    conn.commit()

    # Check if empty, then seed
    cursor.execute("SELECT COUNT(*) FROM cases;")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_data(conn)

    conn.close()

def seed_data(conn):
    cursor = conn.cursor()
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    # Initial SOC Cases
    cases_seed = [
        (
            "CASE-20260926-SBIPHISH",
            "State Bank Re-KYC Credential Harvesting Wave",
            "2026-09-26 08:35:10 UTC",
            now_str,
            "Forensic Analyst (SOC Lead)",
            "Investigating",
            "Critical",
            "High-Risk Phishing",
            92,
            "alerts@sbii-security-update.com",
            "sbii-security-update.com",
            "URGENT: Mandatory KYC Verification Required within 24 Hours",
            "EVD-SBI-9281A",
            "4a3821fb9d08e1b9920183182810928371902830198230198230198230198230",
            2,
            7,
            json.dumps(["Initial quarantine applied at mail gateway.", "Origin IP 194.26.29.112 associated with bulletproof VPS cluster."]),
            "CAMP-2026-IN-FIN01"
        ),
        (
            "CASE-20260926-CEOBEC",
            "Executive Impersonation & RTGS Wire Diversion",
            "2026-09-26 09:20:00 UTC",
            now_str,
            "Senior Investigator",
            "Escalated",
            "High",
            "Business Email Compromise",
            85,
            "dg.rajesh.sharma@gmail-executive-portal.com",
            "gmail-executive-portal.com",
            "CONFIDENTIAL: Urgent Wire Transfer Required for Strategic Vendor Acquisition",
            "EVD-BEC-7182B",
            "7b91028301982039182301982301982301982301982301982301982301982301",
            1,
            4,
            json.dumps(["Display name mimics AICTE Director General.", "Finance team contacted for out-of-band verification."]),
            "CAMP-2026-GLOBAL-BEC"
        ),
        (
            "CASE-20260926-INVOICE",
            "Overdue Invoice with Macro-Enabled Payload",
            "2026-09-26 10:15:30 UTC",
            now_str,
            "Security Analyst 2",
            "Investigating",
            "High",
            "Malware / Phishing",
            80,
            "billing@g1obal-cloud-billing.com",
            "g1obal-cloud-billing.com",
            "OVERDUE INVOICE NOTICE: Cloud Infrastructure Contract INV-99482",
            "EVD-INV-8821C",
            "1c82938102938102938102938102938102938102938102938102938102938102",
            1,
            5,
            json.dumps(["Payload Invoice_INV-99482_Sept2026.docm contains VBA macro loader."]),
            None
        ),
        (
            "CASE-20260926-M365SSO",
            "Corporate SSO Expiration Credential Harvester",
            "2026-09-26 11:30:00 UTC",
            now_str,
            "Forensic Analyst 1",
            "New",
            "High",
            "Impersonation",
            88,
            "account-protection@micros0ft-security-portal.com",
            "micros0ft-security-portal.com",
            "Action Required: Your Microsoft 365 Domain Password Expires in 4 Hours",
            "EVD-M365-1102D",
            "9d01823019823019823019823019823019823019823019823019823019823019",
            1,
            6,
            json.dumps(["Contains bit.ly redirect chain to credential harvesting portal."]),
            "CAMP-2026-M365-HARVEST"
        ),
        (
            "CASE-20260926-AICTELEGIT",
            "National Faculty Development Programme Circular",
            "2026-09-26 12:05:00 UTC",
            now_str,
            "Automated Ingestion",
            "Resolved",
            "Safe",
            "Legitimate",
            5,
            "notifications@aicte-india.org",
            "aicte-india.org",
            "Circular: National Faculty Development Programme (FDP) 2026-27 Schedule",
            "EVD-LEGIT-4491E",
            "3e91028301982301982301982301982301982301982301982301982301982301",
            1,
            2,
            json.dumps(["Full SPF/DKIM/DMARC alignment verified via NIC India gateways."]),
            None
        )
    ]

    cursor.executemany("""
    INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, cases_seed)

    # Initial Alerts
    alerts_seed = [
        ("ALT-001", "2026-09-26 08:31:00 UTC", "CRITICAL", "High-Risk Phishing", 92, "alerts@sbii-security-update.com", "sbii-security-update.com", "Double extension payload + SBI typosquatted domain", "CASE-20260926-SBIPHISH", 0),
        ("ALT-002", "2026-09-26 09:13:00 UTC", "HIGH", "Business Email Compromise", 85, "dg.rajesh.sharma@gmail-executive-portal.com", "gmail-executive-portal.com", "Authority impersonation with urgent wire transfer directive", "CASE-20260926-CEOBEC", 0),
        ("ALT-003", "2026-09-26 10:05:00 UTC", "HIGH", "Malware Dropper", 80, "billing@g1obal-cloud-billing.com", "g1obal-cloud-billing.com", "Macro-enabled invoice document from typosquatted domain", "CASE-20260926-INVOICE", 0),
        ("ALT-004", "2026-09-26 11:21:00 UTC", "HIGH", "Credential Phishing", 88, "account-protection@micros0ft-security-portal.com", "micros0ft-security-portal.com", "Shortener redirect chain to credential harvesting page", "CASE-20260926-M365SSO", 0)
    ]

    cursor.executemany("""
    INSERT INTO alerts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, alerts_seed)

    # Initial Audit Logs
    audit_seed = [
        ("AUD-001", "2026-09-26 08:00:00 UTC", "SOC Administrator", "SYSTEM_STARTUP", "FastAPI Core Engine", "127.0.0.1", "SUCCESS", "MAILTRACE AI forensics engine initialized."),
        ("AUD-002", "2026-09-26 08:35:12 UTC", "Analyst (Demo)", "EVIDENCE_INGESTION", "EVD-SBI-9281A", "10.0.4.15", "SUCCESS", "Ingested bank_phishing.eml; calculated SHA-256."),
        ("AUD-003", "2026-09-26 08:35:15 UTC", "Analyst (Demo)", "LEDGER_COMMIT", "Block #1", "10.0.4.15", "SUCCESS", "Committed evidence hash to Demo Immutable Evidence Ledger."),
        ("AUD-004", "2026-09-26 09:20:05 UTC", "Senior Investigator", "CASE_ESCALATION", "CASE-20260926-CEOBEC", "10.0.4.22", "SUCCESS", "Escalated BEC incident to fraud response unit.")
    ]

    cursor.executemany("""
    INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, audit_seed)

    conn.commit()

    # Pre-seed ledger blocks for seeded cases
    for case_tup in cases_seed:
        c_id = case_tup[0]
        ev_id = case_tup[12]
        ev_hash = case_tup[13]
        f_name = f"{c_id.lower()}.eml"
        ledger_instance.commit_evidence(
            evidence_id=ev_id,
            file_name=f_name,
            file_hash=ev_hash,
            raw_bytes=f"Sample raw forensic bytes for {c_id}".encode('utf-8'),
            investigator="Forensic Analyst (Demo)"
        )
