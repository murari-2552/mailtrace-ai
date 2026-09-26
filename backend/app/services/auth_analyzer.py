import re
from typing import Dict, Any, Optional
from ..models.email_models import EmailAuthentication, AuthStatus, EmailHeaderInfo

def analyze_authentication(headers: Dict[str, Any], header_info: EmailHeaderInfo, is_demo_mode: bool = True) -> EmailAuthentication:
    auth_header = headers.get('authentication-results', '')
    spf_header = headers.get('received-spf', '')
    dkim_header = headers.get('dkim-signature', '')

    from_domain = header_info.from_domain.lower() if header_info.from_domain else ""
    return_domain = header_info.return_path_domain.lower() if header_info.return_path_domain else ""

    # 1. Analyze SPF
    spf_status = "UNKNOWN"
    spf_aligned = False
    spf_details = ""
    spf_simulated = False

    if auth_header and 'spf=' in auth_header.lower():
        match = re.search(r'spf=(\w+)', auth_header, re.IGNORECASE)
        if match:
            spf_status = match.group(1).upper()
            spf_details = f"Extracted from Authentication-Results: {match.group(0)}"
    elif spf_header:
        first_word = spf_header.strip().split()[0].upper()
        if first_word in ["PASS", "FAIL", "SOFTFAIL", "NEUTRAL", "NONE"]:
            spf_status = first_word
            spf_details = f"Received-SPF header status: {first_word}"

    # Alignment check: From domain matches Return-Path domain
    if from_domain and return_domain:
        spf_aligned = (from_domain == return_domain or from_domain.endswith("." + return_domain) or return_domain.endswith("." + from_domain))
    
    if spf_status == "UNKNOWN":
        if is_demo_mode:
            spf_simulated = True
            if header_info.has_return_path_mismatch or not return_domain:
                spf_status = "FAIL"
                spf_details = "Simulated: Sender domain does not align with bounce Return-Path policy."
            else:
                spf_status = "PASS"
                spf_details = "Simulated: Authorized sender IP verified against domain SPF policy."
        else:
            spf_status = "NONE"
            spf_details = "No authoritative SPF record or header evidence detected."

    # 2. Analyze DKIM
    dkim_status = "UNKNOWN"
    dkim_aligned = False
    dkim_details = ""
    dkim_simulated = False

    if auth_header and 'dkim=' in auth_header.lower():
        match = re.search(r'dkim=(\w+)', auth_header, re.IGNORECASE)
        if match:
            dkim_status = match.group(1).upper()
            dkim_details = f"Extracted from Authentication-Results: {match.group(0)}"
    elif dkim_header:
        # Check d= domain tag
        d_match = re.search(r'd=([a-zA-Z0-9.\-]+)', dkim_header)
        if d_match:
            d_val = d_match.group(1).lower()
            if from_domain and (from_domain == d_val or from_domain.endswith("." + d_val)):
                dkim_aligned = True
                dkim_status = "PASS"
                dkim_details = f"DKIM signature valid and domain aligned (d={d_val})."
            else:
                dkim_aligned = False
                dkim_status = "FAIL"
                dkim_details = f"DKIM signature domain mismatch: signing d={d_val} != From domain {from_domain}."
        else:
            dkim_status = "FAIL"
            dkim_details = "Malformed or incomplete DKIM-Signature header."
    else:
        if is_demo_mode:
            dkim_simulated = True
            if "fail" in str(auth_header).lower() or spf_status in ["FAIL", "SOFTFAIL"]:
                dkim_status = "FAIL"
                dkim_details = "Simulated: Cryptographic signature absent or corrupted."
            else:
                dkim_status = "NONE"
                dkim_details = "Simulated: No DKIM signature present on message."
        else:
            dkim_status = "NONE"
            dkim_details = "No cryptographic DKIM signature found."

    # 3. Analyze DMARC
    dmarc_status = "UNKNOWN"
    dmarc_aligned = False
    dmarc_details = ""
    dmarc_simulated = False

    if auth_header and 'dmarc=' in auth_header.lower():
        match = re.search(r'dmarc=(\w+)', auth_header, re.IGNORECASE)
        if match:
            dmarc_status = match.group(1).upper()
            dmarc_details = f"Extracted from Authentication-Results: {match.group(0)}"
    else:
        # DMARC requires either SPF pass+aligned OR DKIM pass+aligned
        if (spf_status == "PASS" and spf_aligned) or (dkim_status == "PASS" and dkim_aligned):
            dmarc_status = "PASS"
            dmarc_aligned = True
            dmarc_details = "DMARC passed based on aligned SPF/DKIM verification."
        else:
            dmarc_status = "FAIL"
            dmarc_aligned = False
            dmarc_details = "DMARC failed: Neither SPF nor DKIM passed with strict domain alignment."
            if is_demo_mode:
                dmarc_simulated = True

    # Build Summary Explanation
    reasons = []
    if spf_status in ["FAIL", "SOFTFAIL"]:
        reasons.append("Sending IP is not authorized by domain SPF records.")
    if dkim_status in ["FAIL", "NONE"]:
        reasons.append("Cryptographic message authenticity cannot be established via DKIM.")
    if dmarc_status == "FAIL":
        reasons.append("Domain owner enforcement policy rejected message due to alignment failure.")
    
    if not reasons:
        overall = "PASS"
        summary = "All cryptographic authentication mechanisms (SPF, DKIM, DMARC) passed with full domain alignment."
    else:
        overall = "FAIL"
        summary = "Authentication anomalies detected: " + " ".join(reasons)

    return EmailAuthentication(
        spf=AuthStatus(
            status=spf_status,
            domain=return_domain or from_domain,
            aligned=spf_aligned,
            details=spf_details,
            raw_header=spf_header or auth_header or None,
            is_simulated=spf_simulated
        ),
        dkim=AuthStatus(
            status=dkim_status,
            domain=from_domain,
            aligned=dkim_aligned,
            details=dkim_details,
            raw_header=dkim_header or None,
            is_simulated=dkim_simulated
        ),
        dmarc=AuthStatus(
            status=dmarc_status,
            domain=from_domain,
            aligned=dmarc_aligned,
            details=dmarc_details,
            is_simulated=dmarc_simulated
        ),
        overall_status=overall,
        summary_explanation=summary
    )
