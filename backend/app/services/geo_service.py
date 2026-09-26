import re
import ipaddress
from typing import List, Dict, Optional
from ..models.email_models import GeoLocationInfo, RelayHop
from .relay_tracer import IPV4_REGEX, is_private_ip

# Synthetic enriched IP database with realistic forensic data
KNOWN_GEO_DATABASE: Dict[str, Dict] = {
    "185.220.101.45": {
        "country": "Netherlands", "region": "North Holland", "city": "Amsterdam",
        "lat": 52.3676, "lon": 4.9041, "isp": "Tor Exit Relay Network",
        "asn": "AS208323", "org": "Zwiebelfreunde e.V.", "hosting": "Tor Project Node",
        "is_vpn": True, "is_tor": True, "is_proxy": True, "confidence": 92.0
    },
    "194.26.29.112": {
        "country": "Russia", "region": "Moscow", "city": "Moscow",
        "lat": 55.7558, "lon": 37.6173, "isp": "Bulletproof Hosting Cluster BV",
        "asn": "AS48282", "org": "Mir Telecom Spb", "hosting": "Bulletproof VPS Services",
        "is_vpn": True, "is_tor": False, "is_proxy": True, "confidence": 88.0
    },
    "45.142.214.88": {
        "country": "Seychelles", "region": "Mahe", "city": "Victoria",
        "lat": -4.6191, "lon": 55.4513, "isp": "Offshore Cloud VPS Ltd",
        "asn": "AS200052", "org": "Island Cloud Infrastructure", "hosting": "Unmanaged Cloud VPS",
        "is_vpn": False, "is_tor": False, "is_proxy": True, "confidence": 79.0
    },
    "103.145.13.204": {
        "country": "Malaysia", "region": "Federal Territory", "city": "Kuala Lumpur",
        "lat": 3.1390, "lon": 101.6869, "isp": "Asia Offshore Hosting Services",
        "asn": "AS133215", "org": "KL Data Hub Solutions", "hosting": "Virtual Dedicated Server",
        "is_vpn": False, "is_tor": False, "is_proxy": False, "confidence": 84.0
    },
    "89.208.107.15": {
        "country": "Russia", "region": "Leningrad", "city": "Saint Petersburg",
        "lat": 59.9343, "lon": 30.3351, "isp": "Selectel Hosting Networks",
        "asn": "AS49505", "org": "Network Operations Center", "hosting": "Phishing Proxy Gateway",
        "is_vpn": True, "is_tor": False, "is_proxy": True, "confidence": 91.0
    },
    "103.25.130.42": {
        "country": "India", "region": "Delhi", "city": "New Delhi",
        "lat": 28.6139, "lon": 77.2090, "isp": "National Informatics Centre (NIC)",
        "asn": "AS45820", "org": "Government of India ERNET", "hosting": "Official Government Gateway",
        "is_vpn": False, "is_tor": False, "is_proxy": False, "confidence": 96.0
    }
}

def resolve_ip_geolocation(ip: str, role: str = "Observed Infrastructure", is_demo: bool = True) -> Optional[GeoLocationInfo]:
    if not ip or is_private_ip(ip):
        return None

    geo = KNOWN_GEO_DATABASE.get(ip)
    if geo:
        return GeoLocationInfo(
            ip=ip,
            country=geo["country"],
            region=geo.get("region"),
            city=geo.get("city"),
            lat=geo["lat"],
            lon=geo["lon"],
            isp=geo.get("isp"),
            asn=geo.get("asn"),
            organization=geo.get("org"),
            hosting_provider=geo.get("hosting"),
            is_vpn=geo.get("is_vpn", False),
            is_tor=geo.get("is_tor", False),
            is_proxy=geo.get("is_proxy", False),
            confidence=geo.get("confidence", 80.0),
            role=role,
            is_simulated=is_demo
        )

    # General fallback for any other public IP
    # Generate deterministic coordinates based on IP hash if in demo mode
    ip_hash = hash(ip)
    lat = round(20.0 + (abs(ip_hash) % 40) - 20, 4)
    lon = round(70.0 + (abs(ip_hash >> 2) % 60) - 30, 4)

    return GeoLocationInfo(
        ip=ip,
        country="Global Transit / Demo",
        region="Regional Network",
        city="Autonomous Transit Node",
        lat=lat,
        lon=lon,
        isp="Autonomous Network Provider",
        asn=f"AS{abs(ip_hash % 60000)}",
        organization="Global Transit Entity",
        hosting_provider="Cloud Hosted Transit",
        is_vpn=False,
        is_tor=False,
        is_proxy=False,
        confidence=65.0,
        role=role,
        is_simulated=True
    )

def extract_and_locate_ips(raw_text: str, relay_hops: List[RelayHop], is_demo: bool = True) -> List[GeoLocationInfo]:
    geo_list = []
    seen_ips = set()

    # 1. First process IPs in relay hops with their designated role
    for hop in relay_hops:
        if hop.from_ip and hop.from_ip not in seen_ips and not hop.is_private_ip:
            role = "Probable Origin Infrastructure" if hop.is_origin_candidate else f"Intermediate Relay Hop #{hop.hop_index}"
            info = resolve_ip_geolocation(hop.from_ip, role=role, is_demo=is_demo)
            if info:
                geo_list.append(info)
                seen_ips.add(hop.from_ip)

    # 2. Extract any other public IPs found across headers and raw text
    all_ips = re.findall(IPV4_REGEX, raw_text)
    for ip in all_ips:
        if ip not in seen_ips and not is_private_ip(ip):
            info = resolve_ip_geolocation(ip, role="Referenced Infrastructure", is_demo=is_demo)
            if info:
                geo_list.append(info)
                seen_ips.add(ip)

    return geo_list
