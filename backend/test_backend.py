import sys
import io
from pathlib import Path

# Set UTF-8 encoding for stdout on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.services.analyzer_pipeline import run_analysis_pipeline
from app.services.blockchain_ledger import ledger_instance
from app.config import SAMPLE_EMAILS_DIR, REPORTS_DIR

def run_tests():
    print("=== Testing MAILTRACE AI Backend Engine ===")
    sample_files = [
        "bank_phishing.eml",
        "ceo_bec.eml",
        "fake_invoice.eml",
        "microsoft_impersonation.eml",
        "legitimate_corporate.eml"
    ]

    for fname in sample_files:
        fpath = SAMPLE_EMAILS_DIR / fname
        assert fpath.exists(), f"Sample file {fname} not found!"
        content = fpath.read_text(encoding="utf-8")
        print(f"\n[+] Analyzing: {fname} ({len(content)} bytes)...")
        result = run_analysis_pipeline(content, file_name=fname)
        
        print(f"    - Case ID: {result.case_id}")
        print(f"    - Classification: {result.verdict.classification}")
        print(f"    - Risk Score: {result.verdict.risk_score} / 100 ({result.verdict.threat_level})")
        print(f"    - SPF: {result.authentication.spf.status} | DKIM: {result.authentication.dkim.status} | DMARC: {result.authentication.dmarc.status}")
        print(f"    - Hops: {len(result.relay_path)} | Geolocations: {len(result.geolocations)} | IOCs: {len(result.iocs)}")
        print(f"    - Blockchain Tx: {result.blockchain_tx[:20]}...")
        print(f"    - Report File: {result.report_filename}")

        # Check PDF was written
        pdf_path = REPORTS_DIR / result.report_filename
        assert pdf_path.exists(), f"Report PDF was not generated at {pdf_path}"
        assert pdf_path.stat().st_size > 1000, f"Report PDF is suspiciously small: {pdf_path.stat().st_size} bytes"
        print(f"    - PDF verified: {pdf_path.stat().st_size} bytes")

        # Test verification of evidence
        verify_res = ledger_instance.verify_evidence(result.evidence_id)
        assert verify_res.is_valid, f"Evidence verification failed for {result.evidence_id}"
        print(f"    - Evidence Verification: {verify_res.status_text}")

    print("\n[SUCCESS] All 5 sample scenarios analyzed, scored, verified against blockchain ledger, and forensic PDF generated successfully!")

if __name__ == "__main__":
    run_tests()
