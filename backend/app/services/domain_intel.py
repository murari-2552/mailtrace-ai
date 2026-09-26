import re
from typing import List, Dict, Optional, Tuple
from ..models.email_models import DomainIntel

PROTECTED_BRANDS = [
    {"name": "State Bank of India (SBI)", "official_domains": ["sbi.co.in", "onlinesbi.sbi", "statebankofindia.com"], "keywords": ["sbi", "sbii", "statebank"]},
    {"name": "Microsoft", "official_domains": ["microsoft.com", "office.com", "office365.com", "live.com"], "keywords": ["microsoft", "micros0ft", "m365", "ms365", "office365"]},
    {"name": "PayPal", "official_domains": ["paypal.com"], "keywords": ["paypal", "paypa1", "pay-pal"]},
    {"name": "Google", "official_domains": ["google.com", "gmail.com"], "keywords": ["google", "g00gle", "gmail"]},
    {"name": "HDFC Bank", "official_domains": ["hdfcbank.com"], "keywords": ["hdfc", "hdfcbank"]},
    {"name": "ICICI Bank", "official_domains": ["icicibank.com"], "keywords": ["icici", "icicibank"]},
    {"name": "AICTE India", "official_domains": ["aicte-india.org"], "keywords": ["aicte", "aicte-india"]},
    {"name": "Amazon", "official_domains": ["amazon.com", "amazon.in"], "keywords": ["amazon", "amaz0n"]}
]

# Synthetic WHOIS/DNS intelligence lookup for realistic demonstration
SYNTHETIC_DOMAIN_DB: Dict[str, Dict] = {
    "sbii-security-update.com": {
        "age_days": 4, "registrar": "NameCheap Inc. / Privacy Protected",
        "reg_date": "2026-09-22", "expiry_date": "2027-09-22",
        "nameservers": ["ns1.bulletproof-dns.top", "ns2.bulletproof-dns.top"],
        "mx_records": ["mx.sbii-security-update.com (Priority 10)"],
        "a_records": ["194.26.29.112"],
        "reputation": 12, "dns_status": "ACTIVE_MALICIOUS"
    },
    "gmail-executive-portal.com": {
        "age_days": 11, "registrar": "Porkbun LLC / Private By Default",
        "reg_date": "2026-09-15", "expiry_date": "2027-09-15",
        "nameservers": ["ns1.porkbun.com", "ns2.porkbun.com"],
        "mx_records": ["mail.gmail-executive-portal.com (Priority 5)"],
        "a_records": ["45.142.214.88"],
        "reputation": 18, "dns_status": "ACTIVE_SUSPICIOUS"
    },
    "g1obal-cloud-billing.com": {
        "age_days": 8, "registrar": "Tucows Domains Inc.",
        "reg_date": "2026-09-18", "expiry_date": "2027-09-18",
        "nameservers": ["ns1.offshore-dns.cc", "ns2.offshore-dns.cc"],
        "mx_records": ["mail-relay-south.hosting-offshore.cc (Priority 10)"],
        "a_records": ["103.145.13.204"],
        "reputation": 22, "dns_status": "ACTIVE_SUSPICIOUS"
    },
    "micros0ft-security-portal.com": {
        "age_days": 2, "registrar": "Reg.ru Hosting Proxy",
        "reg_date": "2026-09-24", "expiry_date": "2027-09-24",
        "nameservers": ["ns1.fast-flux-dns.ru", "ns2.fast-flux-dns.ru"],
        "mx_records": ["mail-gateway.cloud-phish.ru (Priority 10)"],
        "a_records": ["89.208.107.15"],
        "reputation": 8, "dns_status": "ACTIVE_MALICIOUS"
    },
    "aicte-india.org": {
        "age_days": 7890, "registrar": "National Informatics Centre / ERNET India",
        "reg_date": "2005-01-14", "expiry_date": "2028-01-14",
        "nameservers": ["ns1.nic.in", "ns2.nic.in"],
        "mx_records": ["mail-relay-delhi01.aicte-india.org (Priority 10)"],
        "a_records": ["103.25.130.42"],
        "reputation": 99, "dns_status": "VERIFIED_LEGITIMATE"
    }
}

def detect_typosquatting(domain: str) -> Tuple[bool, Optional[str], Optional[str], Optional[str]]:
    """
    Detect character substitutions, hyphen additions, homoglyphs, and brand imitation.
    Returns: (is_lookalike, brand_name, similarity_type, explanation)
    """
    clean_domain = domain.lower().strip()
    root_part = clean_domain.split('.')[0] if '.' in clean_domain else clean_domain

    for brand in PROTECTED_BRANDS:
        # If it's the exact official domain or a valid subdomain of it, it's not a lookalike
        if any(clean_domain == off or clean_domain.endswith("." + off) for off in brand["official_domains"]):
            return False, None, None, None

        # Check for direct keyword containment in suspicious domain
        for kw in brand["keywords"]:
            if kw in clean_domain:
                # Character substitution check
                if '0' in clean_domain and 'o' in kw:
                    return True, brand["name"], "Character Substitution (0 for o)", f"Replaces letter 'o' with zero '0' to mimic {brand['name']}."
                if '1' in clean_domain and 'l' in kw:
                    return True, brand["name"], "Character Substitution (1 for l)", f"Replaces letter 'l' with numeral '1' to deceive recipients."
                if 'ii' in clean_domain and 'sbi' in kw:
                    return True, brand["name"], "Character Duplication (Double 'i')", f"Appends extra 'i' ('sbii') alongside financial terms to impersonate {brand['name']}."
                if '-' in clean_domain:
                    return True, brand["name"], "Hyphenated Typosquatting / Combosquatting", f"Appends deceptive trust keywords (e.g. '-security', '-portal', '-billing') to {brand['name']} name."
                
                return True, brand["name"], "Brand Impersonation / Keyword Hijacking", f"Domain contains {brand['name']} branding keywords but is not registered to authorized nameservers."

    # Generic check for substitution numbers in domain names
    if re.search(r'[a-z]+[01][a-z]+', root_part):
        return True, "Generic Brand", "Leet-speak Character Substitution", "Contains numbers substituted for letters within common English root words."

    return False, None, None, None

def analyze_domain(domain: str, is_demo: bool = True) -> DomainIntel:
    clean = domain.lower().strip()
    is_lookalike, brand, sim_type, sim_expl = detect_typosquatting(clean)

    # Check synthetic database
    intel = SYNTHETIC_DOMAIN_DB.get(clean)
    if intel:
        return DomainIntel(
            domain=clean,
            age_days=intel["age_days"],
            registrar=intel["registrar"],
            registration_date=intel["reg_date"],
            expiry_date=intel["expiry_date"],
            nameservers=intel["nameservers"],
            mx_records=intel["mx_records"],
            a_records=intel["a_records"],
            reputation_score=intel["reputation"],
            is_lookalike=is_lookalike,
            impersonated_brand=brand,
            similarity_type=sim_type,
            similarity_explanation=sim_expl,
            dns_status=intel["dns_status"],
            is_simulated=is_demo
        )

    # Default fallback calculation
    dom_hash = abs(hash(clean))
    age_days = (dom_hash % 600) + 1
    rep = 85 if age_days > 365 else 35
    if is_lookalike:
        rep = min(rep, 20)

    return DomainIntel(
        domain=clean,
        age_days=age_days,
        registrar="Commercial Domain Registrar / Cloudflare DNS",
        registration_date="2025-11-10",
        expiry_date="2027-11-10",
        nameservers=["ns1.generic-nameserver.net", "ns2.generic-nameserver.net"],
        mx_records=[f"mail.{clean} (Priority 10)"],
        a_records=[f"198.51.100.{dom_hash % 250}"],
        reputation_score=rep,
        is_lookalike=is_lookalike,
        impersonated_brand=brand,
        similarity_type=sim_type,
        similarity_explanation=sim_expl,
        dns_status="ACTIVE_RESOLVED",
        is_simulated=True
    )
