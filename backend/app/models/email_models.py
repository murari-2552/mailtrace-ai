from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class EmailAnalyzeRequest(BaseModel):
    raw_content: Optional[str] = None
    headers_only: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    sender: Optional[str] = None
    recipient: Optional[str] = None
    demo_case: Optional[str] = None  # e.g., 'bank_phishing', 'ceo_bec', etc.

class EmailHeaderInfo(BaseModel):
    from_raw: str = ""
    from_name: str = ""
    from_address: str = ""
    from_domain: str = ""
    to_raw: str = ""
    to_addresses: List[str] = []
    cc_addresses: List[str] = []
    reply_to_raw: Optional[str] = None
    reply_to_address: Optional[str] = None
    reply_to_domain: Optional[str] = None
    return_path: Optional[str] = None
    return_path_domain: Optional[str] = None
    subject: str = ""
    date_raw: str = ""
    message_id: str = ""
    mime_version: Optional[str] = None
    content_type: Optional[str] = None
    user_agent: Optional[str] = None
    x_mailer: Optional[str] = None
    has_reply_to_mismatch: bool = False
    has_return_path_mismatch: bool = False

class AuthStatus(BaseModel):
    status: str = "UNKNOWN"  # PASS, FAIL, SOFTFAIL, NEUTRAL, NONE, UNKNOWN
    domain: Optional[str] = None
    aligned: bool = False
    details: str = ""
    raw_header: Optional[str] = None
    is_simulated: bool = False

class EmailAuthentication(BaseModel):
    spf: AuthStatus
    dkim: AuthStatus
    dmarc: AuthStatus
    overall_status: str = "FAIL"
    summary_explanation: str = ""

class RelayHop(BaseModel):
    hop_index: int
    from_host: Optional[str] = None
    from_ip: Optional[str] = None
    by_host: Optional[str] = None
    protocol: Optional[str] = None
    timestamp_raw: Optional[str] = None
    delay_seconds: Optional[int] = 0
    is_private_ip: bool = False
    is_origin_candidate: bool = False
    origin_confidence: float = 0.0
    country: Optional[str] = None
    city: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    asn: Optional[str] = None
    isp: Optional[str] = None
    anomaly_detected: Optional[str] = None

class GeoLocationInfo(BaseModel):
    ip: str
    country: str = "Unknown"
    region: Optional[str] = None
    city: Optional[str] = None
    lat: float = 0.0
    lon: float = 0.0
    isp: Optional[str] = None
    asn: Optional[str] = None
    organization: Optional[str] = None
    hosting_provider: Optional[str] = None
    is_vpn: bool = False
    is_tor: bool = False
    is_proxy: bool = False
    confidence: float = 85.0
    role: str = "Observed Infrastructure"  # Origin, Intermediate Relay, Destination
    disclaimer: str = "IP geolocation provides an estimated network location and does not establish the physical location or identity of an individual."
    is_simulated: bool = False

class DomainIntel(BaseModel):
    domain: str
    age_days: Optional[int] = None
    registrar: Optional[str] = None
    registration_date: Optional[str] = None
    expiry_date: Optional[str] = None
    nameservers: List[str] = []
    mx_records: List[str] = []
    a_records: List[str] = []
    reputation_score: int = 50  # 0 (malicious) to 100 (clean)
    is_lookalike: bool = False
    impersonated_brand: Optional[str] = None
    similarity_type: Optional[str] = None  # typosquatting, character_substitution, hyphenation, homoglyph
    similarity_explanation: Optional[str] = None
    dns_status: str = "RESOLVED"
    is_simulated: bool = False

class URLIntel(BaseModel):
    url: str
    domain: str
    protocol: str = "http"
    redirect_count: int = 0
    redirect_chain: List[str] = []
    final_destination: str = ""
    reputation: str = "UNKNOWN"  # SAFE, SUSPICIOUS, MALICIOUS, UNKNOWN
    risk_score: int = 50
    is_shortener: bool = False
    is_ip_based: bool = False
    has_suspicious_params: bool = False
    is_credential_harvester: bool = False
    is_simulated: bool = False

class AttachmentIntel(BaseModel):
    filename: str
    mime_type: str
    size_bytes: int
    sha256: str
    sha1: Optional[str] = None
    extension: str
    risk_level: str = "SAFE"  # SAFE, SUSPICIOUS, HIGH, CRITICAL
    is_double_extension: bool = False
    is_macro_enabled: bool = False
    is_archive: bool = False
    is_executable: bool = False
    anomaly_note: Optional[str] = None

class BECIntel(BaseModel):
    detected: bool = False
    risk_score: int = 0  # 0 to 100
    pattern_type: Optional[str] = None  # payment_diversion, fake_invoice, executive_impersonation, credential_harvesting, gift_card_fraud
    primary_indicator: Optional[str] = None
    urgency_level: str = "LOW"
    confidence: float = 0.0
    explanation: str = ""

class SocialEngineeringIntel(BaseModel):
    urgency: int = 0      # 0 to 10
    authority: int = 0    # 0 to 10
    fear: int = 0         # 0 to 10
    credential: int = 0   # 0 to 10
    payment: int = 0      # 0 to 10
    extracted_cues: List[str] = []

class IOCItem(BaseModel):
    id: str
    ioc: str
    type: str  # IP, Domain, URL, Email, Hash, Attachment, Message-ID
    source: str
    risk: str  # CRITICAL, HIGH, MEDIUM, LOW, SAFE
    confidence: float
    status: str = "Active"

class ExplainableIndicator(BaseModel):
    id: str
    severity: str  # RED, ORANGE, YELLOW, GREEN, BLUE
    title: str
    explanation: str
    evidence: str
    confidence: float

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # email, sender, reply_to, domain, ip, asn, url, destination, attachment, hash, campaign
    risk: str = "info"  # critical, high, medium, safe, info
    metadata: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str  # SENT_FROM, REPLIED_TO, RESOLVES_TO, REDIRECTS_TO, HOSTED_ON, ASSOCIATED_WITH, CONTAINS, BELONGS_TO

class InfrastructureGraph(BaseModel):
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []

class TimelineEvent(BaseModel):
    time_str: str
    event_type: str
    title: str
    description: str
    evidence: str

class AttributionIntel(BaseModel):
    probable_infrastructure: str = "Unknown"
    probable_origin: str = "Unknown"
    hosting_provider: Optional[str] = None
    attribution_confidence: str = "LOW"  # LOW, MEDIUM, HIGH
    disclaimer: str = "Investigative attribution reflects observed technical infrastructure relationships and does not establish individual human identity or legal culpability."
    observations: List[str] = []

class CampaignCorrelation(BaseModel):
    campaign_id: Optional[str] = None
    campaign_name: Optional[str] = None
    campaign_confidence: float = 0.0
    shared_indicators: List[str] = []
    correlated_cases_count: int = 0
    explanation: str = ""

class ThreatVerdict(BaseModel):
    risk_score: int = 0  # 0 to 100
    classification: str = "UNKNOWN"  # LEGITIMATE, SUSPICIOUS, HIGH-RISK PHISHING, BUSINESS EMAIL COMPROMISE, IMPERSONATION, FRAUD, MALWARE
    confidence_pct: float = 90.0
    threat_level: str = "LOW"  # SAFE, LOW, MEDIUM, HIGH, CRITICAL
    executive_summary: str = ""

class AnalysisResult(BaseModel):
    case_id: str
    evidence_id: str
    evidence_hash: str
    file_name: str
    analysis_timestamp: str
    verdict: ThreatVerdict
    why_flagged: List[ExplainableIndicator]
    authentication: EmailAuthentication
    header_forensics: EmailHeaderInfo
    relay_path: List[RelayHop]
    origin_candidate: Optional[RelayHop] = None
    geolocations: List[GeoLocationInfo]
    domain_intelligence: List[DomainIntel]
    url_intelligence: List[URLIntel]
    attachment_intelligence: List[AttachmentIntel]
    bec_analysis: BECIntel
    social_engineering: SocialEngineeringIntel
    iocs: List[IOCItem]
    infrastructure_graph: InfrastructureGraph
    campaign_correlation: CampaignCorrelation
    attribution: AttributionIntel
    timeline: List[TimelineEvent]
    recommended_actions: List[str]
    blockchain_tx: Optional[str] = None
    report_filename: Optional[str] = None
    is_demo: bool = True
