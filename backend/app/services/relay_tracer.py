import re
import ipaddress
from typing import List, Tuple, Optional, Dict
from ..models.email_models import RelayHop

IPV4_REGEX = r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b'

def is_private_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local
    except ValueError:
        return False

# Known synthetic geolocation/ASN mapping for demo hops
DEMO_IP_ENRICHMENT: Dict[str, Dict] = {
    "185.220.101.45": {
        "country": "Netherlands", "city": "Amsterdam", "lat": 52.3676, "lon": 4.9041,
        "asn": "AS208323", "isp": "Tor Exit Network Relay / Zwiebelfreunde",
        "anomaly": "Known public Tor exit node observed in injection chain."
    },
    "194.26.29.112": {
        "country": "Russia", "city": "Moscow", "lat": 55.7558, "lon": 37.6173,
        "asn": "AS48282", "isp": "Bulletproof Hosting Cluster BV",
        "anomaly": "Bulletproof hosting infrastructure with high abuse history."
    },
    "45.142.214.88": {
        "country": "Seychelles", "city": "Victoria", "lat": -4.6191, "lon": 55.4513,
        "asn": "AS200052", "isp": "Offshore Cloud VPS Ltd",
        "anomaly": "Offshore VPS frequently utilized for anonymous mail relay."
    },
    "103.145.13.204": {
        "country": "Malaysia", "city": "Kuala Lumpur", "lat": 3.1390, "lon": 101.6869,
        "asn": "AS133215", "isp": "Asia Offshore Hosting Services",
        "anomaly": "Unlisted mail sender relay with no reverse DNS PTR."
    },
    "89.208.107.15": {
        "country": "Russia", "city": "Saint Petersburg", "lat": 59.9343, "lon": 30.3351,
        "asn": "AS49505", "isp": "Selectel Hosting Networks",
        "anomaly": "Observed in prior credential harvesting phishing waves."
    },
    "103.25.130.42": {
        "country": "India", "city": "New Delhi", "lat": 28.6139, "lon": 77.2090,
        "asn": "AS45820", "isp": "National Informatics Centre (NIC) / ERNET India",
        "anomaly": None
    }
}

def parse_relay_hop(header_val: str, index: int) -> RelayHop:
    cleaned = " ".join(header_val.replace('\r', ' ').replace('\n', ' ').split())
    
    # Extract IP
    ips = re.findall(IPV4_REGEX, cleaned)
    hop_ip = ips[0] if ips else None
    
    # Extract "from <host>"
    from_match = re.search(r'from\s+([^\s;()]+)', cleaned, re.IGNORECASE)
    from_host = from_match.group(1) if from_match else None

    # Extract "by <host>"
    by_match = re.search(r'by\s+([^\s;()]+)', cleaned, re.IGNORECASE)
    by_host = by_match.group(1) if by_match else None

    # Extract protocol
    proto_match = re.search(r'with\s+([^\s;]+)', cleaned, re.IGNORECASE)
    protocol = proto_match.group(1) if proto_match else "SMTP"

    # Extract timestamp (after semicolon)
    timestamp = None
    if ';' in cleaned:
        timestamp = cleaned.split(';')[-1].strip()

    is_priv = False
    if hop_ip:
        is_priv = is_private_ip(hop_ip)

    # Enrich from demo dictionary or default
    enrich = DEMO_IP_ENRICHMENT.get(hop_ip, {})
    country = enrich.get("country", "Unknown") if hop_ip and not is_priv else ("Private Network" if is_priv else "Unknown")
    city = enrich.get("city", "Unknown") if hop_ip and not is_priv else None
    lat = enrich.get("lat") if hop_ip and not is_priv else None
    lon = enrich.get("lon") if hop_ip and not is_priv else None
    asn = enrich.get("asn", "AS Unknown") if hop_ip and not is_priv else None
    isp = enrich.get("isp", "Unknown ISP") if hop_ip and not is_priv else ("RFC1918 Private Range" if is_priv else None)
    anomaly = enrich.get("anomaly")

    return RelayHop(
        hop_index=index,
        from_host=from_host,
        from_ip=hop_ip,
        by_host=by_host,
        protocol=protocol,
        timestamp_raw=timestamp,
        is_private_ip=is_priv,
        is_origin_candidate=False,
        origin_confidence=0.0,
        country=country,
        city=city,
        lat=lat,
        lon=lon,
        asn=asn,
        isp=isp,
        anomaly_detected=anomaly
    )

def trace_relay_path(received_headers: List[str]) -> Tuple[List[RelayHop], Optional[RelayHop]]:
    """
    Standard email received headers are prepended by each MTA.
    Index 0 in raw headers is usually the closest to destination.
    Chronological route: reverse of received headers.
    """
    if not received_headers:
        return [], None

    # Chronological: oldest hop first
    chronological = list(reversed(received_headers))
    hops = []
    
    for idx, hdr in enumerate(chronological, start=1):
        hop = parse_relay_hop(hdr, idx)
        hops.append(hop)

    # Identify Earliest Reliable Origin Candidate
    # Find the earliest hop that has a non-private public IP address
    origin_candidate = None
    for hop in hops:
        if hop.from_ip and not hop.is_private_ip:
            hop.is_origin_candidate = True
            # Origin confidence: higher if hop is earliest and has valid MTA handshake
            hop.origin_confidence = 88.0 if hop.hop_index == 1 else 74.0
            origin_candidate = hop
            break

    # If all hops were private or no IP was in earliest hop, pick first available
    if not origin_candidate and hops:
        for hop in hops:
            if hop.from_ip:
                hop.is_origin_candidate = True
                hop.origin_confidence = 45.0
                origin_candidate = hop
                break

    return hops, origin_candidate
