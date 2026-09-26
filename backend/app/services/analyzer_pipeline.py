import os
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from ..config import settings, REPORTS_DIR
from ..models.email_models import (
    AnalysisResult, IOCItem, GraphNode, GraphEdge,
    InfrastructureGraph, TimelineEvent
)
from .email_parser import parse_email_content
from .auth_analyzer import analyze_authentication
from .relay_tracer import trace_relay_path
from .geo_service import extract_and_locate_ips
from .domain_intel import analyze_domain
from .url_analyzer import extract_and_analyze_urls
from .bec_detector import analyze_bec
from .social_engineering import analyze_social_engineering
from .risk_engine import evaluate_risk
from .campaign_correlator import correlate_campaign, assess_attribution
from .blockchain_ledger import ledger_instance
from .pdf_generator import generate_forensic_pdf

def run_analysis_pipeline(
    raw_content: str,
    file_name: str = "uploaded_email.eml",
    investigator: str = "Forensic Analyst (Demo)"
) -> AnalysisResult:
    case_id = f"CASE-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    evidence_id = f"EVD-{uuid.uuid4().hex[:8].upper()}"
    analysis_time = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    # 1. Parse Email Content & Headers
    parsed = parse_email_content(raw_content)

    # 2. Authentication Analysis (SPF, DKIM, DMARC)
    auth = analyze_authentication(parsed.headers, parsed.header_info, is_demo_mode=settings.DEMO_MODE)

    # 3. Relay Path Reconstruction & Origin Candidate
    relay_hops, origin_candidate = trace_relay_path(parsed.received_headers)

    # 4. IP Geolocation Intelligence
    geolocations = extract_and_locate_ips(parsed.raw_text, relay_hops, is_demo=settings.DEMO_MODE)

    # 5. Domain Forensics (Collect all unique domains)
    domain_set = set()
    if parsed.header_info.from_domain:
        domain_set.add(parsed.header_info.from_domain)
    if parsed.header_info.reply_to_domain:
        domain_set.add(parsed.header_info.reply_to_domain)
    if parsed.header_info.return_path_domain:
        domain_set.add(parsed.header_info.return_path_domain)

    # 6. URL Forensics & Redirection Chains
    url_intels = extract_and_analyze_urls(parsed.body_html, parsed.body_plain, is_demo=settings.DEMO_MODE)
    for u in url_intels:
        if u.domain:
            domain_set.add(u.domain)

    domain_intels = [analyze_domain(d, is_demo=settings.DEMO_MODE) for d in sorted(list(domain_set))]

    # 7. BEC Detection
    bec = analyze_bec(parsed.header_info, parsed.all_text)

    # 8. Social Engineering Signals
    social_eng = analyze_social_engineering(parsed.all_text)

    # 9. Risk Scoring & Explainable AI
    verdict, why_flagged, recommended_actions = evaluate_risk(
        parsed.header_info, auth, relay_hops, origin_candidate,
        domain_intels, url_intels, parsed.attachments, bec, social_eng
    )

    # 10. Campaign Correlation & Attribution
    observed_ips = [g.ip for g in geolocations]
    observed_domains = [d.domain for d in domain_intels]
    campaign = correlate_campaign(observed_domains, observed_ips, parsed.header_info.subject, parsed.all_text)
    attribution = assess_attribution(origin_candidate, domain_intels, campaign)

    # 11. Extract IOCs
    iocs: List[IOCItem] = []
    ioc_counter = 1

    # Sender address
    if parsed.header_info.from_address:
        iocs.append(IOCItem(
            id=f"ioc-{ioc_counter}",
            ioc=parsed.header_info.from_address,
            type="Email Address",
            source="From Header",
            risk="HIGH" if verdict.risk_score >= 60 else "SAFE",
            confidence=95.0,
            status="Active"
        ))
        ioc_counter += 1

    # Domains
    for d in domain_intels:
        iocs.append(IOCItem(
            id=f"ioc-{ioc_counter}",
            ioc=d.domain,
            type="Domain",
            source="Header / Body URL",
            risk="CRITICAL" if d.is_lookalike else ("HIGH" if d.reputation_score < 30 else "SAFE"),
            confidence=90.0,
            status="Active"
        ))
        ioc_counter += 1

    # IPs
    for g in geolocations:
        iocs.append(IOCItem(
            id=f"ioc-{ioc_counter}",
            ioc=g.ip,
            type="IP Address",
            source=g.role,
            risk="CRITICAL" if (g.is_tor or g.is_vpn or "malicious" in g.role.lower()) else "MEDIUM",
            confidence=g.confidence,
            status="Active"
        ))
        ioc_counter += 1

    # URLs
    for u in url_intels:
        iocs.append(IOCItem(
            id=f"ioc-{ioc_counter}",
            ioc=u.url,
            type="URL",
            source="Email Hyperlink",
            risk=u.reputation if u.reputation in ["CRITICAL", "HIGH", "MEDIUM", "SAFE"] else "HIGH",
            confidence=88.0,
            status="Active"
        ))
        ioc_counter += 1

    # Attachments
    for att in parsed.attachments:
        iocs.append(IOCItem(
            id=f"ioc-{ioc_counter}",
            ioc=att.sha256,
            type="File Hash (SHA-256)",
            source=f"Attachment: {att.filename}",
            risk=att.risk_level,
            confidence=99.0,
            status="Active"
        ))
        ioc_counter += 1

    # 12. Build Infrastructure Graph
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []

    # Center Node: Email
    email_node_id = "node-email"
    nodes.append(GraphNode(
        id=email_node_id,
        label=f"Email ({verdict.classification})",
        type="email",
        risk="critical" if verdict.risk_score >= 70 else ("high" if verdict.risk_score >= 40 else "safe"),
        metadata={"subject": parsed.header_info.subject, "score": verdict.risk_score}
    ))

    # Sender Node
    if parsed.header_info.from_address:
        sender_id = "node-sender"
        nodes.append(GraphNode(
            id=sender_id,
            label=parsed.header_info.from_address,
            type="sender",
            risk="high" if verdict.risk_score >= 50 else "safe"
        ))
        edges.append(GraphEdge(
            id="edge-email-sender",
            source=email_node_id,
            target=sender_id,
            label="SENT_FROM"
        ))

    # Reply-To Node
    if parsed.header_info.reply_to_address:
        reply_id = "node-reply-to"
        nodes.append(GraphNode(
            id=reply_id,
            label=parsed.header_info.reply_to_address,
            type="reply_to",
            risk="critical" if parsed.header_info.has_reply_to_mismatch else "info"
        ))
        edges.append(GraphEdge(
            id="edge-email-reply",
            source=email_node_id,
            target=reply_id,
            label="REPLIED_TO"
        ))

    # Domain Nodes
    for idx, d in enumerate(domain_intels[:4]):
        d_id = f"node-dom-{idx}"
        nodes.append(GraphNode(
            id=d_id,
            label=d.domain,
            type="domain",
            risk="critical" if d.is_lookalike else ("high" if d.reputation_score < 30 else "safe"),
            metadata={"registrar": d.registrar, "lookalike": d.is_lookalike}
        ))
        edges.append(GraphEdge(
            id=f"edge-email-dom-{idx}",
            source=email_node_id,
            target=d_id,
            label="BELONGS_TO" if idx == 0 else "REFERENCES"
        ))

    # IP Nodes
    for idx, g in enumerate(geolocations[:4]):
        ip_id = f"node-ip-{idx}"
        nodes.append(GraphNode(
            id=ip_id,
            label=f"{g.ip} ({g.country})",
            type="ip",
            risk="critical" if (g.is_tor or g.is_vpn) else "medium",
            metadata={"isp": g.isp, "asn": g.asn}
        ))
        edges.append(GraphEdge(
            id=f"edge-dom-ip-{idx}",
            source="node-dom-0" if nodes else email_node_id,
            target=ip_id,
            label="RESOLVES_TO"
        ))

    # URL Nodes
    for idx, u in enumerate(url_intels[:3]):
        u_id = f"node-url-{idx}"
        nodes.append(GraphNode(
            id=u_id,
            label=u.url[:32] + "...",
            type="url",
            risk="critical" if u.reputation == "MALICIOUS" else "medium"
        ))
        edges.append(GraphEdge(
            id=f"edge-email-url-{idx}",
            source=email_node_id,
            target=u_id,
            label="CONTAINS"
        ))

        # Final destination edge if redirected
        if u.redirect_count > 0:
            final_id = f"node-dest-{idx}"
            nodes.append(GraphNode(
                id=final_id,
                label=u.final_destination[:32] + "...",
                type="destination",
                risk="critical"
            ))
            edges.append(GraphEdge(
                id=f"edge-url-dest-{idx}",
                source=u_id,
                target=final_id,
                label="REDIRECTS_TO"
            ))

    # Attachment Nodes
    for idx, att in enumerate(parsed.attachments[:2]):
        att_id = f"node-att-{idx}"
        nodes.append(GraphNode(
            id=att_id,
            label=att.filename,
            type="attachment",
            risk="critical" if att.risk_level in ["CRITICAL", "HIGH"] else "safe"
        ))
        edges.append(GraphEdge(
            id=f"edge-email-att-{idx}",
            source=email_node_id,
            target=att_id,
            label="CONTAINS"
        ))

    # Campaign Node
    if campaign.campaign_id:
        camp_id = "node-campaign"
        nodes.append(GraphNode(
            id=camp_id,
            label=campaign.campaign_name[:30],
            type="campaign",
            risk="critical",
            metadata={"confidence": campaign.campaign_confidence}
        ))
        edges.append(GraphEdge(
            id="edge-email-camp",
            source=email_node_id,
            target=camp_id,
            label="ASSOCIATED_WITH"
        ))

    infra_graph = InfrastructureGraph(nodes=nodes, edges=edges)

    # 13. Build Forensic Timeline
    timeline: List[TimelineEvent] = []
    
    # Hop timeline events
    for hop in relay_hops:
        timeline.append(TimelineEvent(
            time_str=hop.timestamp_raw or "In-transit",
            event_type="RELAY_HOP",
            title=f"MTA Relay Hop #{hop.hop_index}",
            description=f"Received by {hop.by_host or 'Gateway'} from {hop.from_host or hop.from_ip} ({hop.protocol or 'SMTP'}).",
            evidence=f"IP: {hop.from_ip or 'Private/N/A'} | Location: {hop.city or ''}, {hop.country or 'Unknown'}"
        ))

    # Evidence ingestion event
    timeline.append(TimelineEvent(
        time_str=analysis_time,
        event_type="FORENSIC_ANALYSIS",
        title="Email Ingestion & Forensic Processing",
        description="MAILTRACE AI completed 10-tier forensic decoding, indicator extraction, and cryptographic verification.",
        evidence=f"Evidence ID: {evidence_id} | Hash: {parsed.sha256_hash[:16]}..."
    ))

    # 14. Commit to Immutable Blockchain Ledger
    block = ledger_instance.commit_evidence(
        evidence_id=evidence_id,
        file_name=file_name,
        file_hash=parsed.sha256_hash,
        raw_bytes=raw_content.encode('utf-8'),
        investigator=investigator
    )

    # 15. Create AnalysisResult structure
    result = AnalysisResult(
        case_id=case_id,
        evidence_id=evidence_id,
        evidence_hash=parsed.sha256_hash,
        file_name=file_name,
        analysis_timestamp=analysis_time,
        verdict=verdict,
        why_flagged=why_flagged,
        authentication=auth,
        header_forensics=parsed.header_info,
        relay_path=relay_hops,
        origin_candidate=origin_candidate,
        geolocations=geolocations,
        domain_intelligence=domain_intels,
        url_intelligence=url_intels,
        attachment_intelligence=parsed.attachments,
        bec_analysis=bec,
        social_engineering=social_eng,
        iocs=iocs,
        infrastructure_graph=infra_graph,
        campaign_correlation=campaign,
        attribution=attribution,
        timeline=timeline,
        recommended_actions=recommended_actions,
        blockchain_tx=block.transaction_ref,
        report_filename=f"Report_{case_id}.pdf",
        is_demo=settings.DEMO_MODE
    )

    # 16. Generate PDF report
    pdf_path = str(REPORTS_DIR / f"Report_{case_id}.pdf")
    try:
        generate_forensic_pdf(result, pdf_path)
    except Exception as e:
        print(f"PDF generation error (handled gracefully): {e}")

    return result
