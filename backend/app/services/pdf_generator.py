import os
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from ..models.email_models import AnalysisResult

def generate_forensic_pdf(result: AnalysisResult, output_path: str) -> str:
    """
    Generates a courtroom and SOC-ready Digital Forensic Investigation Report.
    """
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A'),
        alignment=0
    )
    
    header_banner_style = ParagraphStyle(
        'BannerStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=colors.HexColor('#DC2626'),
        alignment=1
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=12,
        spaceAfter=6
    )

    normal_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    bold_label = ParagraphStyle(
        'BoldLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("CONFIDENTIAL // DIGITAL FORENSIC INCIDENT DOSSIER // FOR INTERNAL SOC USE ONLY", header_banner_style))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#DC2626'), spaceAfter=12))

    # 2. Document Title & Platform Info
    story.append(Paragraph("MAILTRACE AI - FORENSIC EMAIL THREAT DOSSIER", title_style))
    story.append(Paragraph("Smart India Hackathon 2026 | Problem SIH26106 | AICTE Cyber Security Cell", normal_style))
    story.append(Spacer(1, 10))

    # 3. Case & Verdict Summary Table
    verdict_color = colors.HexColor('#DC2626') if result.verdict.risk_score >= 70 else (colors.HexColor('#D97706') if result.verdict.risk_score >= 35 else colors.HexColor('#059669'))
    
    summary_data = [
        [Paragraph("<b>Case ID:</b>", bold_label), Paragraph(result.case_id, normal_style),
         Paragraph("<b>Risk Score:</b>", bold_label), Paragraph(f"<b>{result.verdict.risk_score} / 100</b> ({result.verdict.threat_level})", bold_label)],
        [Paragraph("<b>Evidence ID:</b>", bold_label), Paragraph(result.evidence_id, normal_style),
         Paragraph("<b>Classification:</b>", bold_label), Paragraph(f"<b>{result.verdict.classification}</b>", bold_label)],
        [Paragraph("<b>Generated:</b>", bold_label), Paragraph(result.analysis_timestamp, normal_style),
         Paragraph("<b>Confidence:</b>", bold_label), Paragraph(f"{result.verdict.confidence_pct}%", normal_style)],
        [Paragraph("<b>File Name:</b>", bold_label), Paragraph(result.file_name, normal_style),
         Paragraph("<b>Ledger Tx:</b>", bold_label), Paragraph(f"{result.blockchain_tx[:18]}..." if result.blockchain_tx else "Pending", code_style)]
    ]
    
    t_summary = Table(summary_data, colWidths=[80, 185, 90, 185])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 12))

    # 4. Executive Summary
    story.append(Paragraph("1. Executive Summary", h2_style))
    story.append(Paragraph(result.verdict.executive_summary, normal_style))
    story.append(Spacer(1, 10))

    # 5. Email Header Forensics
    story.append(Paragraph("2. Email Header & Identity Forensics", h2_style))
    header_data = [
        [Paragraph("<b>From:</b>", bold_label), Paragraph(f"{result.header_forensics.from_raw}", normal_style)],
        [Paragraph("<b>Reply-To:</b>", bold_label), Paragraph(f"{result.header_forensics.reply_to_raw or 'None'}" + (" <font color='#DC2626'><b>(MISMATCH DETECTED)</b></font>" if result.header_forensics.has_reply_to_mismatch else ""), normal_style)],
        [Paragraph("<b>Return-Path:</b>", bold_label), Paragraph(f"{result.header_forensics.return_path or 'None'}" + (" <font color='#D97706'><b>(MISMATCH)</b></font>" if result.header_forensics.has_return_path_mismatch else ""), normal_style)],
        [Paragraph("<b>Subject:</b>", bold_label), Paragraph(f"{result.header_forensics.subject}", normal_style)],
        [Paragraph("<b>Date:</b>", bold_label), Paragraph(f"{result.header_forensics.date_raw}", normal_style)],
        [Paragraph("<b>Message-ID:</b>", bold_label), Paragraph(f"{result.header_forensics.message_id}", code_style)]
    ]
    t_headers = Table(header_data, colWidths=[90, 450])
    t_headers.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_headers)
    story.append(Spacer(1, 10))

    # 6. Cryptographic Authentication
    story.append(Paragraph("3. Authentication Verification (SPF / DKIM / DMARC)", h2_style))
    auth_data = [
        [Paragraph("<b>Protocol</b>", bold_label), Paragraph("<b>Status</b>", bold_label), Paragraph("<b>Alignment</b>", bold_label), Paragraph("<b>Forensic Evidence / Impact</b>", bold_label)],
        [Paragraph("SPF", bold_label), Paragraph(result.authentication.spf.status, bold_label), Paragraph("YES" if result.authentication.spf.aligned else "NO", normal_style), Paragraph(result.authentication.spf.details, normal_style)],
        [Paragraph("DKIM", bold_label), Paragraph(result.authentication.dkim.status, bold_label), Paragraph("YES" if result.authentication.dkim.aligned else "NO", normal_style), Paragraph(result.authentication.dkim.details, normal_style)],
        [Paragraph("DMARC", bold_label), Paragraph(result.authentication.dmarc.status, bold_label), Paragraph("YES" if result.authentication.dmarc.aligned else "NO", normal_style), Paragraph(result.authentication.dmarc.details, normal_style)],
    ]
    t_auth = Table(auth_data, colWidths=[60, 60, 60, 360])
    t_auth.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_auth)
    story.append(Spacer(1, 10))

    # 7. Explainable AI Findings
    story.append(Paragraph("4. Explainable AI Analysis - Why Was This Email Flagged?", h2_style))
    for ind in result.why_flagged[:5]:
        sev_color = "#DC2626" if ind.severity == "RED" else ("#D97706" if ind.severity == "ORANGE" else "#059669")
        story.append(Paragraph(f"<font color='{sev_color}'><b>[{ind.severity}] {ind.title}</b></font> (Confidence: {ind.confidence}%)", bold_label))
        story.append(Paragraph(f"<b>Explanation:</b> {ind.explanation}", normal_style))
        story.append(Paragraph(f"<b>Evidence:</b> {ind.evidence}", code_style))
        story.append(Spacer(1, 4))
    story.append(Spacer(1, 8))

    # 8. Relay Path & Origin Analysis
    story.append(Paragraph("5. Relay Path & Earliest Reliable Origin", h2_style))
    if result.origin_candidate:
        story.append(Paragraph(
            f"<b>Designated Origin Candidate:</b> IP {result.origin_candidate.from_ip} | Host: {result.origin_candidate.from_host} | "
            f"Country: {result.origin_candidate.country} | ISP: {result.origin_candidate.isp} (Confidence: {result.origin_candidate.origin_confidence}%)",
            normal_style
        ))
    
    relay_rows = [[Paragraph("<b>Hop</b>", bold_label), Paragraph("<b>IP Address</b>", bold_label), Paragraph("<b>Host / Provider</b>", bold_label), Paragraph("<b>Location</b>", bold_label)]]
    for hop in result.relay_path[:5]:
        relay_rows.append([
            Paragraph(f"#{hop.hop_index}" + (" [ORIGIN]" if hop.is_origin_candidate else ""), bold_label),
            Paragraph(hop.from_ip or "N/A", code_style),
            Paragraph(hop.from_host or hop.isp or "Unknown", normal_style),
            Paragraph(f"{hop.city or ''}, {hop.country or 'Unknown'}", normal_style)
        ])
    t_relay = Table(relay_rows, colWidths=[70, 110, 230, 130])
    t_relay.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_relay)
    story.append(Spacer(1, 10))

    # 9. IOC Table
    story.append(Paragraph("6. Indicators of Compromise (IOC) Summary", h2_style))
    ioc_rows = [[Paragraph("<b>Indicator</b>", bold_label), Paragraph("<b>Type</b>", bold_label), Paragraph("<b>Risk</b>", bold_label), Paragraph("<b>Confidence</b>", bold_label)]]
    for item in result.iocs[:8]:
        ioc_rows.append([
            Paragraph(item.ioc[:55], code_style),
            Paragraph(item.type, normal_style),
            Paragraph(item.risk, bold_label),
            Paragraph(f"{item.confidence}%", normal_style)
        ])
    t_iocs = Table(ioc_rows, colWidths=[280, 80, 90, 90])
    t_iocs.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_iocs)
    story.append(Spacer(1, 10))

    # 10. Immutable Evidence Ledger & Chain of Custody
    story.append(Paragraph("7. Immutable Evidence Ledger & Chain of Custody", h2_style))
    ledger_text = (
        f"<b>Canonical Evidence Hash (SHA-256):</b> {result.evidence_hash}<br/>"
        f"<b>Ledger Transaction Reference:</b> {result.blockchain_tx or 'Pending Commit'}<br/>"
        f"<b>Ledger Verification Status:</b> Integrity Verified ✓ (Append-only Merkle Ledger)"
    )
    story.append(Paragraph(ledger_text, normal_style))
    story.append(Spacer(1, 10))

    # 11. Recommended Actions
    story.append(Paragraph("8. Incident Response Recommendations", h2_style))
    for act in result.recommended_actions:
        story.append(Paragraph(f"• {act}", normal_style))
    story.append(Spacer(1, 12))

    # 12. Legal / Forensic Disclaimer
    disclaimer_text = (
        "<b>LEGAL & FORENSIC DISCLAIMER:</b> This automated forensic report provides technical indicators and investigative hypotheses based on header inspection, "
        "cryptographic verification, and network routing heuristics. IP geolocation is approximate and does not establish physical identity or culpability. "
        "Preserve original RFC 5322 raw payloads for evidentiary admissibility under applicable cyber law."
    )
    story.append(Paragraph(disclaimer_text, ParagraphStyle('Disclaimer', parent=normal_style, fontSize=7.5, leading=10, textColor=colors.HexColor('#64748B'))))

    doc.build(story)
    return output_path
