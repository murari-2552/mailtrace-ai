import re
from typing import List, Tuple
from ..models.email_models import BECIntel, EmailHeaderInfo

PAYMENT_PATTERNS = [
    r'wire\s+transfer', r'rtgs', r'neft', r'bank\s+account', r'beneficiary\s+name',
    r'ifsc\s+code', r'routing\s+number', r'remit\s+funds', r'account\s+number:\s*\d+',
    r'change\s+(?:the\s+)?bank', r'updated\s+bank', r'payment\s+instructions'
]

INVOICE_PATTERNS = [
    r'overdue\s+invoice', r'invoice\s*#?[\w\-]+', r'past\s+due', r'unpaid',
    r'disruption\s+of\s+service', r'attached\s+invoice', r'outstanding\s+balance',
    r'payment\s+due'
]

EXECUTIVE_PATTERNS = [
    r'confidential', r'in\s+a\s+meeting', r'in\s+an?\s+executive\s+session',
    r'cannot\s+take\s+(?:phone\s+)?calls', r'do\s+not\s+call', r'keep\s+this\s+quiet',
    r'director\s+general', r'ceo', r'cfo', r'managing\s+director', r'board\s+meeting'
]

CREDENTIAL_PATTERNS = [
    r'password\s+expires?', r'verify\s+your\s+identity', r'account\s+will\s+be\s+frozen',
    r'account\s+restricted', r'mandatory\s+re-kyc', r'credential\s+rotation',
    r'keep\s+your\s+same\s+password', r'suspended?\s+within'
]

GIFT_CARD_PATTERNS = [
    r'gift\s+cards?', r'apple\s+card', r'google\s+play\s+card', r'steam\s+card',
    r'scratch\s+the\s+back', r'send\s+the\s+codes'
]

def analyze_bec(header_info: EmailHeaderInfo, all_text: str) -> BECIntel:
    text_lower = all_text.lower()
    from_name_lower = header_info.from_name.lower()
    subject_lower = header_info.subject.lower()

    detected_patterns = []
    score = 0
    primary_ind = None

    # Check 1: Payment diversion
    payment_matches = [p for p in PAYMENT_PATTERNS if re.search(p, text_lower)]
    if payment_matches:
        score += 35
        detected_patterns.append("Payment Diversion / Financial Transfer Directives")
        primary_ind = "Explicit bank routing or wire transfer directives detected."

    # Check 2: Executive impersonation
    exec_matches = [p for p in EXECUTIVE_PATTERNS if re.search(p, text_lower) or re.search(p, from_name_lower) or re.search(p, subject_lower)]
    if exec_matches:
        score += 30
        detected_patterns.append("Executive Impersonation / Secrecy Language")
        if not primary_ind:
            primary_ind = "Authority impersonation with communication isolation detected."

    # Check 3: Fake invoice pressure
    invoice_matches = [p for p in INVOICE_PATTERNS if re.search(p, text_lower) or re.search(p, subject_lower)]
    if invoice_matches:
        score += 25
        detected_patterns.append("Fraudulent Invoice / Overdue Debt Pressure")
        if not primary_ind:
            primary_ind = "Urgent demands regarding overdue commercial invoices detected."

    # Check 4: Credential harvesting
    cred_matches = [p for p in CREDENTIAL_PATTERNS if re.search(p, text_lower) or re.search(p, subject_lower)]
    if cred_matches:
        score += 25
        detected_patterns.append("Credential Harvesting / Account Freeze Coercion")
        if not primary_ind:
            primary_ind = "Account restriction threats demanding immediate re-authentication."

    # Check 5: Gift card fraud
    gift_matches = [p for p in GIFT_CARD_PATTERNS if re.search(p, text_lower)]
    if gift_matches:
        score += 45
        detected_patterns.append("Gift Card Advance-Fee Fraud")
        if not primary_ind:
            primary_ind = "Unorthodox gift card purchasing directive detected."

    # Amplifiers
    if header_info.has_reply_to_mismatch:
        score += 20
        detected_patterns.append("Reply-To Channel Redirection Mismatch")

    # Display name vs address check (e.g. executive name with generic domain)
    if ("director" in from_name_lower or "ceo" in from_name_lower or "dr." in from_name_lower) and ("gmail" in header_info.from_domain or "portal" in header_info.from_domain or "outlook" in header_info.from_domain):
        score += 20
        detected_patterns.append("Display-Name Executive Spoofing on External Domain")

    score = min(score, 98)
    detected = score >= 40

    urgency = "LOW"
    if score >= 75:
        urgency = "CRITICAL"
    elif score >= 50:
        urgency = "HIGH"
    elif score >= 30:
        urgency = "MEDIUM"

    explanation = ""
    if detected:
        pattern_str = " + ".join(detected_patterns[:3])
        explanation = f"Detected high-confidence Business Email Compromise indicators: {pattern_str}. Sender employs coercion tactics paired with deceptive routing."
    else:
        explanation = "No authoritative executive impersonation or payment diversion tactics identified."

    pattern_type = None
    if payment_matches and exec_matches:
        pattern_type = "executive_payment_diversion"
    elif payment_matches or invoice_matches:
        pattern_type = "fake_invoice_diversion"
    elif exec_matches:
        pattern_type = "executive_impersonation"
    elif cred_matches:
        pattern_type = "credential_harvesting"
    elif gift_matches:
        pattern_type = "gift_card_fraud"

    return BECIntel(
        detected=detected,
        risk_score=score,
        pattern_type=pattern_type,
        primary_indicator=primary_ind,
        urgency_level=urgency,
        confidence=min(round(score * 0.95 + 5.0, 1), 95.0) if detected else 15.0,
        explanation=explanation
    )
