from typing import List, Optional
from pydantic import BaseModel, Field

class ChainOfCustodyEvent(BaseModel):
    id: str
    evidence_id: str
    timestamp: str
    action: str  # Evidence Uploaded, Hash Generated, Analysis Started, Analysis Completed, Added to Case, Ledger Committed, Report Generated
    actor: str
    details: str
    hash_signature: str

class Case(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    investigator: str = "Analyst (Demo)"
    status: str = "Investigating"  # New, Investigating, Escalated, Resolved, Archived
    severity: str = "High"         # Critical, High, Medium, Low, Safe
    classification: str = "Phishing"
    risk_score: int = 85
    sender: str = ""
    domain: str = ""
    subject: str = ""
    evidence_id: Optional[str] = None
    evidence_hash: Optional[str] = None
    evidence_count: int = 1
    ioc_count: int = 0
    notes: List[str] = []
    campaign_id: Optional[str] = None

class CreateCaseRequest(BaseModel):
    title: str
    investigator: Optional[str] = "Analyst"
    severity: Optional[str] = "High"
    classification: Optional[str] = "Phishing"
    risk_score: Optional[int] = 75
    sender: Optional[str] = ""
    domain: Optional[str] = ""
    subject: Optional[str] = ""
    evidence_id: Optional[str] = None
    notes: Optional[str] = None

class UpdateCaseStatusRequest(BaseModel):
    status: str
    note: Optional[str] = None

class AlertNotification(BaseModel):
    id: str
    timestamp: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    threat_type: str
    risk_score: int
    sender: str
    domain: str
    primary_reason: str
    case_id: str
    is_read: bool = False

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    user: str
    action: str
    resource: str
    ip_address: str
    status: str = "SUCCESS"
    details: str
