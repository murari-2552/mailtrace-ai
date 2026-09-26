from typing import Optional
from pydantic import BaseModel

class LedgerBlock(BaseModel):
    index: int
    timestamp: str
    evidence_id: str
    file_name: str
    file_hash: str
    previous_hash: str
    merkle_root: str
    hash: str
    investigator: str
    status: str = "Integrity Verified ✓"
    transaction_ref: str
    network: str = "Demo Immutable Evidence Ledger"

class EvidenceVerifyRequest(BaseModel):
    evidence_id: str
    file_content: Optional[str] = None

class EvidenceVerifyResponse(BaseModel):
    evidence_id: str
    file_name: str
    stored_hash: str
    calculated_hash: str
    is_valid: bool
    status_text: str
    timestamp: str
    block_index: int
    transaction_ref: str
    merkle_root: str
    details: str

class LedgerSummary(BaseModel):
    total_blocks: int
    verified_artifacts: int
    tampered_artifacts: int
    ledger_type: str = "Cryptographic SHA-256 Merkle Chain"
    last_block_hash: str
    is_operational: bool = True
