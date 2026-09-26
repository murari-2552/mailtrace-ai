import re
from urllib.parse import urlparse, parse_qs
from typing import List, Dict
from ..models.email_models import URLIntel

URL_REGEX = r'https?://[^\s<>"\')]+'
SHORTENER_DOMAINS = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly", "cutt.ly"]

# Synthetic known redirect chains for demo URLs
SYNTHETIC_REDIRECT_MAP: Dict[str, Dict] = {
    "http://sbii-security-update.com/kyc-verification/login.php?session=928194": {
        "chain": [
            "http://sbii-security-update.com/kyc-verification/login.php?session=928194",
            "http://194.26.29.112/auth-proxy/redirect?token=sbi-phish",
            "http://collector-portal.dark-relays.xyz/harvest/submit-creds.php"
        ],
        "final": "http://collector-portal.dark-relays.xyz/harvest/submit-creds.php",
        "reputation": "MALICIOUS",
        "risk_score": 96,
        "is_shortener": False,
        "is_ip": False,
        "has_params": True,
        "is_cred": True
    },
    "https://bit.ly/m365-keep-password-token": {
        "chain": [
            "https://bit.ly/m365-keep-password-token",
            "https://t.co/redirect-m365-bypass",
            "https://micros0ft-security-portal.com/login/auth-session?relay=89.208.107.15"
        ],
        "final": "https://micros0ft-security-portal.com/login/auth-session?relay=89.208.107.15",
        "reputation": "MALICIOUS",
        "risk_score": 94,
        "is_shortener": True,
        "is_ip": False,
        "has_params": True,
        "is_cred": True
    },
    "https://www.aicte-india.org/atal/fdp-calendar-2026": {
        "chain": [
            "https://www.aicte-india.org/atal/fdp-calendar-2026"
        ],
        "final": "https://www.aicte-india.org/atal/fdp-calendar-2026",
        "reputation": "SAFE",
        "risk_score": 5,
        "is_shortener": False,
        "is_ip": False,
        "has_params": False,
        "is_cred": False
    }
}

def extract_and_analyze_urls(html_body: str, plain_body: str, is_demo: bool = True) -> List[URLIntel]:
    combined = f"{html_body} {plain_body}"
    raw_urls = re.findall(URL_REGEX, combined)
    
    # Also extract href="..."
    hrefs = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html_body, re.IGNORECASE)
    for h in hrefs:
        if h.startswith("http://") or h.startswith("https://"):
            raw_urls.append(h)

    # Deduplicate preserving order
    unique_urls = []
    seen = set()
    for u in raw_urls:
        clean = u.rstrip(".,;)>\"'")
        if clean and clean not in seen:
            unique_urls.append(clean)
            seen.add(clean)

    results = []
    for u in unique_urls:
        # Check synthetic map first
        if u in SYNTHETIC_REDIRECT_MAP:
            m = SYNTHETIC_REDIRECT_MAP[u]
            parsed = urlparse(u)
            results.append(URLIntel(
                url=u,
                domain=parsed.netloc,
                protocol=parsed.scheme,
                redirect_count=len(m["chain"]) - 1,
                redirect_chain=m["chain"],
                final_destination=m["final"],
                reputation=m["reputation"],
                risk_score=m["risk_score"],
                is_shortener=m["is_shortener"],
                is_ip_based=m["is_ip"],
                has_suspicious_params=m["has_params"],
                is_credential_harvester=m["is_cred"],
                is_simulated=is_demo
            ))
            continue

        # Dynamic inspection
        parsed = urlparse(u)
        domain = parsed.netloc.lower()
        protocol = parsed.scheme.lower()
        path = parsed.path.lower()
        query = parsed.query

        is_shortener = any(domain == s or domain.endswith("." + s) for s in SHORTENER_DOMAINS)
        is_ip_based = bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?$', domain))
        
        # Check credential harvesting patterns
        cred_keywords = ["login", "signin", "verify", "account", "banking", "kyc", "security", "token", "auth", "session", "freeze"]
        is_cred = any(kw in path or kw in query.lower() for kw in cred_keywords)
        
        has_suspicious_params = any(p in query.lower() for p in ["session=", "token=", "relay=", "ref=", "redirect="])

        risk = 20
        rep = "SAFE"
        if is_ip_based:
            risk += 45
            rep = "SUSPICIOUS"
        if is_shortener:
            risk += 30
            rep = "SUSPICIOUS"
        if is_cred:
            risk += 35
            rep = "SUSPICIOUS"
        if has_suspicious_params:
            risk += 15
        if protocol == "http" and (is_cred or is_shortener):
            risk += 15

        risk = min(risk, 98)
        if risk > 70:
            rep = "MALICIOUS"
        elif risk > 40:
            rep = "SUSPICIOUS"

        # Synthetic redirect simulation if shortener
        chain = [u]
        final_dest = u
        if is_shortener:
            simulated_hop = f"https://unresolved-gateway.net/hop?target={domain}"
            simulated_final = f"https://hosted-destination.org{path}"
            chain = [u, simulated_hop, simulated_final]
            final_dest = simulated_final

        results.append(URLIntel(
            url=u,
            domain=domain,
            protocol=protocol,
            redirect_count=len(chain) - 1,
            redirect_chain=chain,
            final_destination=final_dest,
            reputation=rep,
            risk_score=risk,
            is_shortener=is_shortener,
            is_ip_based=is_ip_based,
            has_suspicious_params=has_suspicious_params,
            is_credential_harvester=is_cred,
            is_simulated=is_demo
        ))

    return results
