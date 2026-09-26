from typing import List, Tuple
from ..models.email_models import (
    ThreatVerdict, ExplainableIndicator, EmailAuthentication,
    EmailHeaderInfo, DomainIntel, URLIntel, AttachmentIntel,
    BECIntel, SocialEngineeringIntel, RelayHop
)

def evaluate_risk(
    header_info: EmailHeaderInfo,
    auth: EmailAuthentication,
    relay_hops: List[RelayHop],
    origin_candidate: RelayHop | None,
    domain_intels: List[DomainIntel],
    url_intels: List[URLIntel],
    attachments: List[AttachmentIntel],
    bec: BECIntel,
    social_eng: SocialEngineeringIntel
) -> Tuple[ThreatVerdict, List[ExplainableIndicator], List[str]]:
    
    indicators: List[ExplainableIndicator] = []
    actions: List[str] = []
    risk_score = 0

    # 1. Authentication signals
    if auth.spf.status in ["FAIL", "SOFTFAIL"]:
        risk_score += 20
        indicators.append(ExplainableIndicator(
            id="auth-spf-fail",
            severity="RED" if auth.spf.status == "FAIL" else "ORANGE",
            title="SPF Authentication Failure",
            explanation="The sending IP infrastructure is not authorized by the domain's SPF policy records, indicating unauthorized relay.",
            evidence=f"SPF Result: {auth.spf.status} | Domain: {auth.spf.domain}",
            confidence=92.0
        ))
    
    if auth.dkim.status in ["FAIL"]:
        risk_score += 15
        indicators.append(ExplainableIndicator(
            id="auth-dkim-fail",
            severity="RED",
            title="DKIM Signature Verification Failed",
            explanation="The cryptographic signature failed verification or domain alignment was violated, indicating potential in-transit message tampering.",
            evidence=f"DKIM Status: {auth.dkim.status} | Details: {auth.dkim.details}",
            confidence=89.0
        ))

    if auth.dmarc.status in ["FAIL"]:
        risk_score += 15
        indicators.append(ExplainableIndicator(
            id="auth-dmarc-fail",
            severity="RED",
            title="DMARC Policy Rejection / Alignment Mismatch",
            explanation="The sender domain failed DMARC alignment checks across both SPF and DKIM validation vectors.",
            evidence=f"DMARC: {auth.dmarc.status} for {auth.dmarc.domain}",
            confidence=94.0
        ))

    # 2. Header and Routing Mismatch
    if header_info.has_reply_to_mismatch:
        risk_score += 20
        indicators.append(ExplainableIndicator(
            id="header-reply-to-mismatch",
            severity="RED",
            title="Reply-To Channel Redirection",
            explanation="The Reply-To domain differs from the sender From domain, a common indicator of credential redirection or spoofed sender disguise.",
            evidence=f"From: @{header_info.from_domain} !== Reply-To: @{header_info.reply_to_domain}",
            confidence=95.0
        ))

    if header_info.has_return_path_mismatch:
        risk_score += 10
        indicators.append(ExplainableIndicator(
            id="header-return-path-mismatch",
            severity="ORANGE",
            title="Return-Path Domain Mismatch",
            explanation="Delivery bounce destination routes through an infrastructure domain distinct from the declared sender.",
            evidence=f"Sender: @{header_info.from_domain} | Return-Path: @{header_info.return_path_domain}",
            confidence=84.0
        ))

    # 3. Domain Lookalike / Typosquatting
    lookalike_found = False
    for d in domain_intels:
        if d.is_lookalike:
            lookalike_found = True
            risk_score += 25
            indicators.append(ExplainableIndicator(
                id=f"domain-lookalike-{d.domain}",
                severity="RED",
                title=f"Brand Lookalike Typosquatting: {d.impersonated_brand}",
                explanation=d.similarity_explanation or "Domain deceptively imitates a trusted corporate or banking brand.",
                evidence=f"Observed Domain: {d.domain} | Pattern: {d.similarity_type}",
                confidence=96.0
            ))
        elif d.age_days and d.age_days < 30:
            risk_score += 15
            indicators.append(ExplainableIndicator(
                id=f"domain-young-{d.domain}",
                severity="ORANGE",
                title="Newly Registered Sending Domain",
                explanation=f"Domain was registered only {d.age_days} days ago. Newly registered domains are disproportionately used in phishing and disposable campaigns.",
                evidence=f"Domain: {d.domain} | Age: {d.age_days} days | Registrar: {d.registrar}",
                confidence=87.0
            ))

    # 4. URL Inspection
    for u in url_intels:
        if u.is_shortener:
            risk_score += 10
            indicators.append(ExplainableIndicator(
                id=f"url-shortener-{abs(hash(u.url))}",
                severity="ORANGE",
                title="Obfuscated URL via Redirection Service",
                explanation="The email employs a public URL shortening service to conceal the ultimate landing destination from gateway scanners.",
                evidence=f"Shortened Link: {u.url} -> Final: {u.final_destination}",
                confidence=90.0
            ))
        if u.is_credential_harvester or u.reputation == "MALICIOUS":
            risk_score += 25
            indicators.append(ExplainableIndicator(
                id=f"url-malicious-{abs(hash(u.url))}",
                severity="RED",
                title="Deceptive / Credential Harvesting URL Destination",
                explanation="Destination web address correlates with known phishing landing templates or credential submission endpoints.",
                evidence=f"URL: {u.url}",
                confidence=93.0
            ))

    # 5. Attachment Analysis
    for att in attachments:
        if att.is_double_extension or att.is_executable:
            risk_score += 35
            indicators.append(ExplainableIndicator(
                id=f"att-executable-{att.filename}",
                severity="RED",
                title="Dangerous Double Extension / Executable Attachment",
                explanation="The attachment attempts to disguise a binary executable payload using dual file extensions (e.g. .pdf.exe).",
                evidence=f"File: {att.filename} (Size: {att.size_bytes} bytes | SHA256: {att.sha256[:16]}...)",
                confidence=99.0
            ))
        elif att.is_macro_enabled:
            risk_score += 25
            indicators.append(ExplainableIndicator(
                id=f"att-macro-{att.filename}",
                severity="ORANGE",
                title="Macro-Enabled Document Attachment",
                explanation="Office document contains active macro code modules frequently abused for staged malware loader execution.",
                evidence=f"File: {att.filename} ({att.mime_type})",
                confidence=91.0
            ))

    # 6. BEC / Social Engineering
    if bec.detected:
        risk_score += 25
        indicators.append(ExplainableIndicator(
            id="bec-signal-detected",
            severity="RED" if bec.risk_score > 70 else "ORANGE",
            title=f"Business Email Compromise Pattern: {bec.pattern_type or 'Coercion'}",
            explanation=bec.explanation,
            evidence=bec.primary_indicator or "Financial diversion or authority spoofing markers observed.",
            confidence=bec.confidence
        ))

    if social_eng.urgency >= 7:
        risk_score += 10
        indicators.append(ExplainableIndicator(
            id="social-urgency-high",
            severity="YELLOW",
            title="High Urgency Coercion Tactics",
            explanation="Message contains strict artificial deadlines and coercive phrasing to force impulsive recipient response.",
            evidence=f"Urgency Index: {social_eng.urgency}/10 | Cues: {', '.join(social_eng.extracted_cues[:2])}",
            confidence=85.0
        ))

    # 7. Origin & Relay Anomaly
    if origin_candidate and origin_candidate.anomaly_detected:
        risk_score += 15
        indicators.append(ExplainableIndicator(
            id="relay-origin-anomaly",
            severity="ORANGE",
            title="Suspicious Infrastructure Relay Hop",
            explanation=origin_candidate.anomaly_detected,
            evidence=f"Origin IP: {origin_candidate.from_ip} | Host: {origin_candidate.from_host}",
            confidence=origin_candidate.origin_confidence
        ))

    # Cap risk score between 0 and 100
    final_score = min(max(risk_score, 0), 100)

    # Determine Classification & Threat Level
    classification = "LEGITIMATE"
    threat_level = "SAFE"
    confidence_pct = 94.0

    if final_score >= 80:
        threat_level = "CRITICAL"
        if any(att.is_executable or att.is_macro_enabled for att in attachments):
            classification = "MALWARE / PHISHING"
        elif bec.detected and ("payment" in str(bec.pattern_type) or "executive" in str(bec.pattern_type)):
            classification = "BUSINESS EMAIL COMPROMISE"
        elif lookalike_found:
            classification = "HIGH-RISK PHISHING"
        else:
            classification = "HIGH-RISK PHISHING"
        confidence_pct = 95.5
    elif final_score >= 60:
        threat_level = "HIGH"
        if bec.detected:
            classification = "BUSINESS EMAIL COMPROMISE"
        elif lookalike_found:
            classification = "IMPERSONATION"
        else:
            classification = "PHISHING"
        confidence_pct = 91.0
    elif final_score >= 35:
        threat_level = "MEDIUM"
        classification = "SUSPICIOUS"
        confidence_pct = 86.5
    elif final_score >= 15:
        threat_level = "LOW"
        classification = "LOW-RISK SUSPICIOUS"
        confidence_pct = 88.0
    else:
        threat_level = "SAFE"
        classification = "LEGITIMATE"
        confidence_pct = 96.0

    # If legitimate email, add a clean indicator
    if final_score < 20 and not indicators:
        indicators.append(ExplainableIndicator(
            id="clean-indicators",
            severity="GREEN",
            title="Authentic Domain & Valid Cryptographic Signatures",
            explanation="The message originated from authorized IP infrastructure, passed SPF/DKIM/DMARC alignment checks, and contains no manipulative indicators.",
            evidence=f"From: @{header_info.from_domain} | All authentication vectors verified.",
            confidence=96.0
        ))

    # Executive Summary Construction
    if final_score >= 60:
        exec_summary = (
            f"The analyzed email has been designated as {classification} (Risk Score: {final_score}/100, Threat Level: {threat_level}). "
            f"Multiple critical anomalies were identified, including "
            f"{'authentication failures, ' if auth.overall_status == 'FAIL' else ''}"
            f"{'brand lookalike typosquatting, ' if lookalike_found else ''}"
            f"{'deceptive routing channels, ' if header_info.has_reply_to_mismatch else ''}"
            f"and social engineering pressure tactics. "
            f"Observed sending infrastructure traces to {origin_candidate.country if origin_candidate else 'external relay'}. "
            f"Immediate isolation and containment protocol is advised."
        )
    elif final_score >= 35:
        exec_summary = (
            f"The analyzed email presents moderate risk indicators (Risk Score: {final_score}/100, Classification: {classification}). "
            f"While no destructive payload was observed, minor authentication discrepancies and unverified relay hops require cautious review."
        )
    else:
        exec_summary = (
            f"The analyzed email displays normal operational characteristics (Risk Score: {final_score}/100, Classification: {classification}). "
            f"Authentication signatures (SPF, DKIM, DMARC) are aligned with the authoritative sender identity and no social engineering cues were identified."
        )

    # Recommended Actions Playbook
    if final_score >= 70:
        actions = [
            "Quarantine email across corporate mail gateway immediately.",
            f"Add sending domain '@{header_info.from_domain}' to perimeter blocklist.",
            f"Block observed origin IP '{origin_candidate.from_ip if origin_candidate else 'unknown'}' on firewall/SIEM rules.",
            "Revoke active session tokens and initiate password reset for targeted mailbox.",
            "Preserve cryptographic evidence record in immutable ledger for forensic chain-of-custody.",
            "Escalate incident to Tier-2 SOC for enterprise-wide IOC sweep and campaign threat hunting."
        ]
    elif final_score >= 40:
        actions = [
            "Route email to security quarantine for analyst inspection.",
            "Notify user regarding potential deceptive communication.",
            "Inspect URL click logs on corporate web proxy for any outbound traffic.",
            "Monitor sender address and domain for repeated targeting patterns."
        ]
    else:
        actions = [
            "No automated mitigation required; release email to recipient inbox.",
            "Maintain passive telemetry logging."
        ]

    verdict = ThreatVerdict(
        risk_score=final_score,
        classification=classification,
        confidence_pct=confidence_pct,
        threat_level=threat_level,
        executive_summary=exec_summary
    )

    return verdict, indicators, actions
