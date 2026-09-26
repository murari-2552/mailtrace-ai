from typing import Dict, Any, Optional
from ..config import settings

class ThreatIntelResult:
    def __init__(self, indicator: str, indicator_type: str, score: int, category: str, source: str, is_simulated: bool, details: Dict[str, Any]):
        self.indicator = indicator
        self.indicator_type = indicator_type
        self.score = score  # 0 to 100
        self.category = category  # MALICIOUS, SUSPICIOUS, CLEAN, UNKNOWN
        self.source = source
        self.is_simulated = is_simulated
        self.details = details

class ThreatIntelProvider:
    def lookup_ip(self, ip: str) -> ThreatIntelResult:
        raise NotImplementedError

    def lookup_domain(self, domain: str) -> ThreatIntelResult:
        raise NotImplementedError

    def lookup_hash(self, file_hash: str) -> ThreatIntelResult:
        raise NotImplementedError

class DemoThreatIntelProvider(ThreatIntelProvider):
    """
    High-fidelity simulated threat intelligence provider for offline SIH demonstration.
    Transparently labels all output with 'DEMO / SIMULATED' in compliance with forensic ethics.
    """
    KNOWN_IOC_FEED = {
        "185.220.101.45": {"score": 94, "category": "MALICIOUS", "detections": "18/88 vendors", "tags": ["Tor Exit Node", "Phishing Proxy", "Scanner"]},
        "194.26.29.112": {"score": 98, "category": "MALICIOUS", "detections": "42/88 vendors", "tags": ["Bulletproof Hosting", "C2 Infrastructure", "Phishing Drop"]},
        "45.142.214.88": {"score": 78, "category": "SUSPICIOUS", "detections": "12/88 vendors", "tags": ["Offshore VPS", "Spam Relay", "BEC Infrastructure"]},
        "103.145.13.204": {"score": 72, "category": "SUSPICIOUS", "detections": "9/88 vendors", "tags": ["Unsolicited Bulk Mailer", "Hosting Cluster"]},
        "89.208.107.15": {"score": 92, "category": "MALICIOUS", "detections": "36/88 vendors", "tags": ["Credential Harvester", "Phishing Domain A Record"]},
        "103.25.130.42": {"score": 2, "category": "CLEAN", "detections": "0/88 vendors", "tags": ["Verified NIC India Government Gateway", "Whitelisted"]},
        "sbii-security-update.com": {"score": 96, "category": "MALICIOUS", "detections": "24/92 vendors", "tags": ["Phishing", "SBI Impersonation", "Credential Theft"]},
        "g1obal-cloud-billing.com": {"score": 82, "category": "SUSPICIOUS", "detections": "14/92 vendors", "tags": ["Invoice Fraud", "Typosquatting"]},
        "micros0ft-security-portal.com": {"score": 95, "category": "MALICIOUS", "detections": "31/92 vendors", "tags": ["Credential Harvesting", "Microsoft Impersonation"]},
        "gmail-executive-portal.com": {"score": 80, "category": "SUSPICIOUS", "detections": "11/92 vendors", "tags": ["BEC Spoofing", "Executive Impersonation"]},
        "aicte-india.org": {"score": 0, "category": "CLEAN", "detections": "0/92 vendors", "tags": ["Official Government Education Portal", "Safe"]}
    }

    def lookup_ip(self, ip: str) -> ThreatIntelResult:
        data = self.KNOWN_IOC_FEED.get(ip, {
            "score": 45, "category": "SUSPICIOUS", "detections": "3/88 vendors", "tags": ["Unclassified Infrastructure"]
        })
        return ThreatIntelResult(
            indicator=ip,
            indicator_type="IP",
            score=data["score"],
            category=data["category"],
            source="Demo Threat Intelligence Feed (Simulated AbuseIPDB / VT)",
            is_simulated=True,
            details=data
        )

    def lookup_domain(self, domain: str) -> ThreatIntelResult:
        clean = domain.lower().strip()
        data = self.KNOWN_IOC_FEED.get(clean, {
            "score": 30, "category": "UNKNOWN", "detections": "0/92 vendors", "tags": ["Unranked Domain"]
        })
        return ThreatIntelResult(
            indicator=clean,
            indicator_type="Domain",
            score=data["score"],
            category=data["category"],
            source="Demo Threat Intelligence Feed (Simulated VirusTotal / PhishTank)",
            is_simulated=True,
            details=data
        )

    def lookup_hash(self, file_hash: str) -> ThreatIntelResult:
        return ThreatIntelResult(
            indicator=file_hash,
            indicator_type="Hash",
            score=88,
            category="MALICIOUS",
            source="Demo Threat Intelligence Feed (Simulated VT File Hash)",
            is_simulated=True,
            details={"detections": "41/72 security engines flagged payload", "threat_name": "Trojan.Downloader.Phish"}
        )

# Factory function: returns real API provider if configured, else Demo provider
def get_threat_intel_provider() -> ThreatIntelProvider:
    # If API keys are set and demo mode is disabled, would return LiveThreatIntelProvider
    return DemoThreatIntelProvider()
