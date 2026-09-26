from typing import List, Dict, Tuple, Optional
from ..models.email_models import CampaignCorrelation, AttributionIntel, RelayHop, DomainIntel, URLIntel, AttachmentIntel

PREDEFINED_CAMPAIGNS = [
    {
        "id": "CAMP-2026-IN-FIN01",
        "name": "Operation PhishVault (Indian Banking KYC Harvesting)",
        "domains": ["sbii-security-update.com", "sbi-kyc-verify.net", "hdfc-portal-update.com"],
        "ips": ["194.26.29.112", "185.220.101.45"],
        "keywords": ["mandatory kyc", "account freeze", "re-kyc verification"],
        "summary": "Coordinated banking credential harvesting campaign targeting Indian retail accounts utilizing Tor exit nodes and bulletproof Eastern European VPS relays."
    },
    {
        "id": "CAMP-2026-GLOBAL-BEC",
        "name": "Operation SilentTransfer (Executive Wire Diversion)",
        "domains": ["gmail-executive-portal.com", "corporate-executive-desk.com"],
        "ips": ["45.142.214.88"],
        "keywords": ["urgent wire transfer", "in an executive session", "confidential vendor"],
        "summary": "Targeted Business Email Compromise cluster impersonating directors and C-suite personnel to solicit rapid RTGS transfers to overseas entities."
    },
    {
        "id": "CAMP-2026-M365-HARVEST",
        "name": "Operation CloudCreds (Enterprise SSO Hijacking)",
        "domains": ["micros0ft-security-portal.com", "m365-verify-portal.online"],
        "ips": ["89.208.107.15"],
        "keywords": ["password expires in 4 hours", "keep current password"],
        "summary": "Credential harvesting wave utilizing shortened redirect chains and lookalike Microsoft branding."
    }
]

def correlate_campaign(
    domains: List[str],
    ips: List[str],
    subject: str,
    body_text: str
) -> CampaignCorrelation:
    text_lower = f"{subject} {body_text}".lower()
    
    best_match = None
    max_shared = []
    highest_score = 0

    for camp in PREDEFINED_CAMPAIGNS:
        shared = []
        # Domain matches
        for d in domains:
            if d.lower() in [cd.lower() for cd in camp["domains"]]:
                shared.append(f"Domain: {d}")
        
        # IP matches
        for ip in ips:
            if ip in camp["ips"]:
                shared.append(f"Infrastructure IP: {ip}")

        # Keyword matches
        for kw in camp["keywords"]:
            if kw in text_lower:
                shared.append(f"Campaign Template Cue: '{kw}'")

        if len(shared) > len(max_shared):
            max_shared = shared
            best_match = camp
            highest_score = min(len(shared) * 26 + 18, 92)

    if best_match and len(max_shared) >= 2:
        return CampaignCorrelation(
            campaign_id=best_match["id"],
            campaign_name=best_match["name"],
            campaign_confidence=float(highest_score),
            shared_indicators=max_shared,
            correlated_cases_count=4,
            explanation=f"Correlates with known threat cluster '{best_match['name']}'. Shared indicators include {', '.join(max_shared[:3])}. {best_match['summary']}"
        )

    return CampaignCorrelation(
        campaign_id=None,
        campaign_name="Uncorrelated / Isolated Threat Occurrence",
        campaign_confidence=15.0,
        shared_indicators=[],
        correlated_cases_count=0,
        explanation="Observed indicators do not currently meet minimum clustering thresholds for historical campaign attribution."
    )

def assess_attribution(
    origin_candidate: Optional[RelayHop],
    domain_intels: List[DomainIntel],
    campaign: CampaignCorrelation
) -> AttributionIntel:
    observations = []

    if origin_candidate:
        if origin_candidate.country and origin_candidate.country != "Unknown":
            observations.append(f"Observed sending infrastructure geolocates approximately to {origin_candidate.city or origin_candidate.country}. Geolocation is approximate and does not establish physical identity.")
        if origin_candidate.isp:
            observations.append(f"Traffic originated via {origin_candidate.isp} ({origin_candidate.asn or 'Unspecified ASN'}).")
        if origin_candidate.anomaly_detected:
            observations.append(f"Infrastructure anomaly: {origin_candidate.anomaly_detected}")

    for d in domain_intels:
        if d.is_lookalike:
            observations.append(f"Threat infrastructure relies on typosquatted branding ({d.domain} mimicking {d.impersonated_brand}).")
        if d.registrar:
            observations.append(f"Domain registered via {d.registrar}.")

    conf_level = "LOW"
    if campaign.campaign_id and campaign.campaign_confidence >= 75:
        conf_level = "HIGH"
    elif origin_candidate and origin_candidate.from_ip and domain_intels:
        conf_level = "MEDIUM"

    probable_infra = origin_candidate.isp if (origin_candidate and origin_candidate.isp) else "Unclassified External VPS Hosting"
    probable_origin = origin_candidate.country if (origin_candidate and origin_candidate.country) else "Undetermined Geo-Cluster"

    return AttributionIntel(
        probable_infrastructure=probable_infra,
        probable_origin=probable_origin,
        hosting_provider=origin_candidate.isp if origin_candidate else None,
        attribution_confidence=conf_level,
        observations=observations
    )
