import re
import hashlib
import email
from email import policy
from email.utils import parseaddr, getaddresses
from typing import Dict, Any, List, Tuple, Optional
from ..models.email_models import EmailHeaderInfo, AttachmentIntel

class ParsedEmailData:
    def __init__(self):
        self.raw_text: str = ""
        self.headers: Dict[str, Any] = {}
        self.header_info: EmailHeaderInfo = EmailHeaderInfo()
        self.received_headers: List[str] = []
        self.body_plain: str = ""
        self.body_html: str = ""
        self.all_text: str = ""
        self.attachments: List[AttachmentIntel] = []
        self.sha256_hash: str = ""
        self.sha1_hash: str = ""
        self.size_bytes: int = 0

def extract_domain(email_str: str) -> str:
    if not email_str:
        return ""
    _, addr = parseaddr(email_str)
    if "@" in addr:
        return addr.split("@")[-1].strip().lower()
    if "@" in email_str:
        return email_str.split("@")[-1].strip().lower().rstrip(">")
    return ""

def parse_email_content(raw_content: str) -> ParsedEmailData:
    result = ParsedEmailData()
    result.raw_text = raw_content
    result.size_bytes = len(raw_content.encode('utf-8'))
    result.sha256_hash = hashlib.sha256(raw_content.encode('utf-8')).hexdigest()
    result.sha1_hash = hashlib.sha1(raw_content.encode('utf-8')).hexdigest()

    try:
        msg = email.message_from_string(raw_content, policy=policy.default)
    except Exception:
        msg = email.message_from_string(raw_content)

    # Extract all headers
    headers_dict = {}
    received_list = []
    for k, v in msg.items():
        headers_dict[k.lower()] = str(v)
        if k.lower() == 'received':
            received_list.append(str(v))
            
    result.headers = headers_dict
    result.received_headers = received_list

    # Sender info
    from_raw = msg.get('From', '')
    from_name, from_addr = parseaddr(from_raw)
    from_domain = extract_domain(from_addr or from_raw)

    to_raw = msg.get('To', '')
    to_addrs = [addr for _, addr in getaddresses([to_raw])]
    
    cc_raw = msg.get('Cc', '')
    cc_addrs = [addr for _, addr in getaddresses([cc_raw])] if cc_raw else []

    reply_to_raw = msg.get('Reply-To')
    reply_to_addr = parseaddr(reply_to_raw)[1] if reply_to_raw else None
    reply_to_domain = extract_domain(reply_to_addr or "") if reply_to_addr else None

    return_path = msg.get('Return-Path')
    return_path_domain = extract_domain(return_path or "") if return_path else None

    subject = str(msg.get('Subject', ''))
    date_raw = str(msg.get('Date', ''))
    message_id = str(msg.get('Message-ID', ''))
    mime_ver = msg.get('MIME-Version')
    content_type = msg.get('Content-Type')
    user_agent = msg.get('User-Agent')
    x_mailer = msg.get('X-Mailer')

    # Detect domain mismatches (allow aligned subdomains)
    def are_domains_related(d1: str, d2: str) -> bool:
        if not d1 or not d2:
            return False
        d1_l, d2_l = d1.lower(), d2.lower()
        return d1_l == d2_l or d1_l.endswith("." + d2_l) or d2_l.endswith("." + d1_l)

    has_reply_to_mismatch = False
    if reply_to_domain and from_domain:
        has_reply_to_mismatch = not are_domains_related(reply_to_domain, from_domain)

    has_return_path_mismatch = False
    if return_path_domain and from_domain:
        has_return_path_mismatch = not are_domains_related(return_path_domain, from_domain)

    result.header_info = EmailHeaderInfo(
        from_raw=from_raw,
        from_name=from_name,
        from_address=from_addr,
        from_domain=from_domain,
        to_raw=to_raw,
        to_addresses=to_addrs,
        cc_addresses=cc_addrs,
        reply_to_raw=reply_to_raw,
        reply_to_address=reply_to_addr,
        reply_to_domain=reply_to_domain,
        return_path=return_path,
        return_path_domain=return_path_domain,
        subject=subject,
        date_raw=date_raw,
        message_id=message_id,
        mime_version=mime_ver,
        content_type=content_type,
        user_agent=user_agent,
        x_mailer=x_mailer,
        has_reply_to_mismatch=has_reply_to_mismatch,
        has_return_path_mismatch=has_return_path_mismatch
    )

    # Extract bodies and attachments
    plain_parts = []
    html_parts = []
    attachments = []

    if msg.is_multipart():
        for part in msg.walk():
            c_type = part.get_content_type()
            c_disp = str(part.get('Content-Disposition', ''))
            filename = part.get_filename()

            if filename or 'attachment' in c_disp.lower():
                # Process attachment metadata
                fname = filename or "unnamed_attachment"
                payload = part.get_payload(decode=True) or b""
                att_size = len(payload)
                att_sha256 = hashlib.sha256(payload).hexdigest()
                att_sha1 = hashlib.sha1(payload).hexdigest()
                ext = ("." + fname.split(".")[-1].lower()) if "." in fname else ""

                # Double extension check (e.g. .pdf.exe)
                is_double_ext = False
                lower_fname = fname.lower()
                if re.search(r'\.(pdf|doc|docx|jpg|png|xlsx|txt)\.(exe|vbs|scr|bat|cmd|ps1|iso|hta|js)$', lower_fname):
                    is_double_ext = True

                is_executable = ext in ['.exe', '.vbs', '.scr', '.bat', '.cmd', '.ps1', '.iso', '.hta', '.dll', '.js']
                is_macro = ext in ['.docm', '.xlsm', '.pptm']
                is_archive = ext in ['.zip', '.rar', '.7z', '.tar', '.gz']

                risk = "SAFE"
                anomaly = None
                if is_double_ext or is_executable:
                    risk = "CRITICAL"
                    anomaly = "Dangerous executable / double extension pattern detected."
                elif is_macro:
                    risk = "HIGH"
                    anomaly = "Macro-enabled office document detected."
                elif is_archive:
                    risk = "MEDIUM"
                    anomaly = "Compressed archive attachment requiring inspection."

                attachments.append(AttachmentIntel(
                    filename=fname,
                    mime_type=c_type,
                    size_bytes=att_size,
                    sha256=att_sha256,
                    sha1=att_sha1,
                    extension=ext,
                    risk_level=risk,
                    is_double_extension=is_double_ext,
                    is_macro_enabled=is_macro,
                    is_archive=is_archive,
                    is_executable=is_executable,
                    anomaly_note=anomaly
                ))
            else:
                if c_type == 'text/plain':
                    try:
                        content = part.get_payload(decode=True).decode('utf-8', errors='replace')
                        plain_parts.append(content)
                    except Exception:
                        pass
                elif c_type == 'text/html':
                    try:
                        content = part.get_payload(decode=True).decode('utf-8', errors='replace')
                        html_parts.append(content)
                    except Exception:
                        pass
    else:
        c_type = msg.get_content_type()
        payload = msg.get_payload(decode=True)
        if payload:
            text = payload.decode('utf-8', errors='replace')
            if c_type == 'text/html':
                html_parts.append(text)
            else:
                plain_parts.append(text)
        else:
            text = str(msg.get_payload() or "")
            plain_parts.append(text)

    result.body_plain = "\n".join(plain_parts)
    result.body_html = "\n".join(html_parts)
    result.all_text = f"{result.header_info.subject} {result.body_plain} {result.body_html}"
    result.attachments = attachments

    return result
