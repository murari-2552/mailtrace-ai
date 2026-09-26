import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "app" / "data"
SAMPLE_EMAILS_DIR = DATA_DIR / "sample_emails"
REPORTS_DIR = BASE_DIR / "reports"
DATABASE_PATH = BASE_DIR / "mailtrace.db"

# Ensure reports directory exists
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    APP_NAME: str = "MAILTRACE AI"
    APP_SUBTITLE: str = "AI-Powered Email Threat Detection, GeoLocation & Forensic Intelligence Platform"
    APP_VERSION: str = "2.0.0-SIH2026"
    THEME: str = "Blockchain & Cybersecurity"
    ORGANIZATION: str = "All India Council for Technical Education (AICTE), Cyber Security Cell"
    PROBLEM_STATEMENT: str = "SIH26106"
    
    # Operational Mode
    DEMO_MODE: bool = True
    ALLOW_LIVE_LOOKUPS: bool = True
    
    # API Keys (optional; platform gracefully uses simulated fallback when unset)
    VIRUSTOTAL_API_KEY: str = os.getenv("VIRUSTOTAL_API_KEY", "")
    ABUSEIPDB_API_KEY: str = os.getenv("ABUSEIPDB_API_KEY", "")
    IPGEOLOCATION_API_KEY: str = os.getenv("IPGEOLOCATION_API_KEY", "")
    
    # Privacy & Compliance
    PII_MASKING_DEFAULT: bool = False
    DATA_RETENTION_DAYS: int = 90

settings = Settings()
