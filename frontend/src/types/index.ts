export interface EmailHeaderInfo {
  from_raw: string;
  from_name: string;
  from_address: string;
  from_domain: string;
  to_raw: string;
  to_addresses: string[];
  cc_addresses: string[];
  reply_to_raw?: string;
  reply_to_address?: string;
  reply_to_domain?: string;
  return_path?: string;
  return_path_domain?: string;
  subject: string;
  date_raw: string;
  message_id: string;
  mime_version?: string;
  content_type?: string;
  user_agent?: string;
  x_mailer?: string;
  has_reply_to_mismatch: boolean;
  has_return_path_mismatch: boolean;
}

export interface AuthStatus {
  status: string; // PASS, FAIL, SOFTFAIL, NEUTRAL, NONE, UNKNOWN
  domain?: string;
  aligned: boolean;
  details: string;
  raw_header?: string;
  is_simulated: boolean;
}

export interface EmailAuthentication {
  spf: AuthStatus;
  dkim: AuthStatus;
  dmarc: AuthStatus;
  overall_status: string;
  summary_explanation: string;
}

export interface RelayHop {
  hop_index: number;
  from_host?: string;
  from_ip?: string;
  by_host?: string;
  protocol?: string;
  timestamp_raw?: string;
  delay_seconds?: number;
  is_private_ip: boolean;
  is_origin_candidate: boolean;
  origin_confidence: number;
  country?: string;
  city?: string;
  lat?: number;
  lon?: number;
  asn?: string;
  isp?: string;
  anomaly_detected?: string;
}

export interface GeoLocationInfo {
  ip: string;
  country: string;
  region?: string;
  city?: string;
  lat: number;
  lon: number;
  isp?: string;
  asn?: string;
  organization?: string;
  hosting_provider?: string;
  is_vpn: boolean;
  is_tor: boolean;
  is_proxy: boolean;
  confidence: number;
  role: string;
  disclaimer: string;
  is_simulated: boolean;
}

export interface DomainIntel {
  domain: string;
  age_days?: number;
  registrar?: string;
  registration_date?: string;
  expiry_date?: string;
  nameservers: string[];
  mx_records: string[];
  a_records: string[];
  reputation_score: number;
  is_lookalike: boolean;
  impersonated_brand?: string;
  similarity_type?: string;
  similarity_explanation?: string;
  dns_status: string;
  is_simulated: boolean;
}

export interface URLIntel {
  url: string;
  domain: string;
  protocol: string;
  redirect_count: number;
  redirect_chain: string[];
  final_destination: string;
  reputation: string;
  risk_score: number;
  is_shortener: boolean;
  is_ip_based: boolean;
  has_suspicious_params: boolean;
  is_credential_harvester: boolean;
  is_simulated: boolean;
}

export interface AttachmentIntel {
  filename: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  sha1?: string;
  extension: string;
  risk_level: string;
  is_double_extension: boolean;
  is_macro_enabled: boolean;
  is_archive: boolean;
  is_executable: boolean;
  anomaly_note?: string;
}

export interface BECIntel {
  detected: boolean;
  risk_score: number;
  pattern_type?: string;
  primary_indicator?: string;
  urgency_level: string;
  confidence: number;
  explanation: string;
}

export interface SocialEngineeringIntel {
  urgency: number;
  authority: number;
  fear: number;
  credential: number;
  payment: number;
  extracted_cues: string[];
}

export interface IOCItem {
  id: string;
  ioc: string;
  type: string;
  source: string;
  risk: string;
  confidence: number;
  status: string;
}

export interface ExplainableIndicator {
  id: string;
  severity: string;
  title: string;
  explanation: string;
  evidence: string;
  confidence: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  risk: string;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface InfrastructureGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TimelineEvent {
  time_str: string;
  event_type: string;
  title: string;
  description: string;
  evidence: string;
}

export interface ThreatVerdict {
  risk_score: number;
  classification: string;
  confidence_pct: number;
  threat_level: string;
  executive_summary: string;
}

export interface CampaignCorrelation {
  campaign_id?: string;
  campaign_name?: string;
  campaign_confidence: number;
  shared_indicators: string[];
  correlated_cases_count: number;
  explanation: string;
}

export interface AttributionIntel {
  probable_infrastructure: string;
  probable_origin: string;
  hosting_provider?: string;
  attribution_confidence: string;
  disclaimer: string;
  observations: string[];
}

export interface AnalysisResult {
  case_id: string;
  evidence_id: string;
  evidence_hash: string;
  file_name: string;
  analysis_timestamp: string;
  verdict: ThreatVerdict;
  why_flagged: ExplainableIndicator[];
  authentication: EmailAuthentication;
  header_forensics: EmailHeaderInfo;
  relay_path: RelayHop[];
  origin_candidate?: RelayHop;
  geolocations: GeoLocationInfo[];
  domain_intelligence: DomainIntel[];
  url_intelligence: URLIntel[];
  attachment_intelligence: AttachmentIntel[];
  bec_analysis: BECIntel;
  social_engineering: SocialEngineeringIntel;
  iocs: IOCItem[];
  infrastructure_graph: InfrastructureGraph;
  campaign_correlation: CampaignCorrelation;
  attribution: AttributionIntel;
  timeline: TimelineEvent[];
  recommended_actions: string[];
  blockchain_tx?: string;
  report_filename?: string;
  is_demo: boolean;
}

export interface Case {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  investigator: string;
  status: string;
  severity: string;
  classification: string;
  risk_score: number;
  sender: string;
  domain: string;
  subject: string;
  evidence_id?: string;
  evidence_hash?: string;
  evidence_count: number;
  ioc_count: number;
  notes: string[];
  campaign_id?: string;
}

export interface LedgerBlock {
  index: number;
  timestamp: string;
  evidence_id: string;
  file_name: string;
  file_hash: string;
  previous_hash: string;
  merkle_root: string;
  hash: string;
  investigator: string;
  status: string;
  transaction_ref: string;
  network: string;
}

export interface LedgerSummary {
  total_blocks: number;
  verified_artifacts: number;
  tampered_artifacts: number;
  ledger_type: string;
  last_block_hash: string;
  is_operational: boolean;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  severity: string;
  threat_type: string;
  risk_score: number;
  sender: string;
  domain: string;
  primary_reason: string;
  case_id: string;
  is_read: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ip_address: string;
  status: string;
  details: string;
}
