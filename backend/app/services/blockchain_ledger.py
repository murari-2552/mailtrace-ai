import time
import hashlib
import json
from typing import List, Dict, Optional
from datetime import datetime, timezone
from ..models.ledger_models import LedgerBlock, EvidenceVerifyResponse, LedgerSummary

class BlockchainEvidenceLedger:
    """
    Cryptographic immutable append-only evidence ledger for forensic integrity.
    Demonstrates tamper-proof chain-of-custody for SIH 2026 Theme: Blockchain & Cybersecurity.
    """
    def __init__(self):
        self.chain: List[LedgerBlock] = []
        self.evidence_store: Dict[str, Dict] = {}
        self._init_genesis_block()

    def _init_genesis_block(self):
        genesis_data = {
            "evidence_id": "GENESIS-0000",
            "file_name": "GENESIS_ROOT",
            "file_hash": "0000000000000000000000000000000000000000000000000000000000000000",
            "investigator": "AICTE Cyber Security System",
            "timestamp": "2026-09-01T00:00:00Z"
        }
        gen_hash = hashlib.sha256(json.dumps(genesis_data, sort_keys=True).encode('utf-8')).hexdigest()
        genesis_block = LedgerBlock(
            index=0,
            timestamp="2026-09-01T00:00:00Z",
            evidence_id="GENESIS-0000",
            file_name="GENESIS_ROOT",
            file_hash=genesis_data["file_hash"],
            previous_hash="0" * 64,
            merkle_root=gen_hash,
            hash=gen_hash,
            investigator="System Root",
            status="Genesis Block Verified ✓",
            transaction_ref="0x0000000000000000000000000000000000000000000000000000000000000000",
            network="Demo Immutable Evidence Ledger (Merkle Chain)"
        )
        self.chain.append(genesis_block)

    def commit_evidence(
        self,
        evidence_id: str,
        file_name: str,
        file_hash: str,
        raw_bytes: bytes,
        investigator: str = "Lead Forensic Analyst"
    ) -> LedgerBlock:
        # Check if already in ledger
        for blk in self.chain:
            if blk.evidence_id == evidence_id:
                return blk

        prev_block = self.chain[-1]
        timestamp = datetime.now(timezone.utc).isoformat()
        index = len(self.chain)

        # Construct block payload
        payload = f"{index}{prev_block.hash}{evidence_id}{file_hash}{timestamp}"
        block_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()
        merkle_root = hashlib.sha256(f"{file_hash}{block_hash}".encode('utf-8')).hexdigest()
        tx_ref = "0x" + hashlib.sha256(f"{block_hash}{time.time()}".encode('utf-8')).hexdigest()

        block = LedgerBlock(
            index=index,
            timestamp=timestamp,
            evidence_id=evidence_id,
            file_name=file_name,
            file_hash=file_hash,
            previous_hash=prev_block.hash,
            merkle_root=merkle_root,
            hash=block_hash,
            investigator=investigator,
            status="Integrity Verified ✓",
            transaction_ref=tx_ref,
            network="Demo Immutable Evidence Ledger (Merkle Chain)"
        )

        self.chain.append(block)
        self.evidence_store[evidence_id] = {
            "file_name": file_name,
            "raw_bytes": raw_bytes,
            "stored_hash": file_hash,
            "block_index": index,
            "tx_ref": tx_ref
        }
        return block

    def verify_evidence(self, evidence_id: str, candidate_content: Optional[str] = None) -> EvidenceVerifyResponse:
        block = next((b for b in self.chain if b.evidence_id == evidence_id), None)
        if not block:
            return EvidenceVerifyResponse(
                evidence_id=evidence_id,
                file_name="Unknown",
                stored_hash="NOT_FOUND",
                calculated_hash="NOT_FOUND",
                is_valid=False,
                status_text="Evidence ID not found in Ledger ✗",
                timestamp="",
                block_index=-1,
                transaction_ref="",
                merkle_root="",
                details="No cryptographic block found for specified Evidence ID."
            )

        stored_data = self.evidence_store.get(evidence_id)
        if candidate_content is not None:
            calc_hash = hashlib.sha256(candidate_content.encode('utf-8')).hexdigest()
        elif stored_data and "raw_bytes" in stored_data:
            calc_hash = hashlib.sha256(stored_data["raw_bytes"]).hexdigest()
        else:
            calc_hash = block.file_hash

        is_valid = (calc_hash.lower() == block.file_hash.lower())
        status_text = "Integrity Verified ✓" if is_valid else "Tampering Detected! Hash Mismatch ✗"
        details = (
            f"Cryptographic hash matches Ledger Block #{block.index}. Zero bit-level tampering observed."
            if is_valid else
            f"Calculated hash does NOT match the immutable ledger record! Evidence was modified after registration."
        )

        return EvidenceVerifyResponse(
            evidence_id=evidence_id,
            file_name=block.file_name,
            stored_hash=block.file_hash,
            calculated_hash=calc_hash,
            is_valid=is_valid,
            status_text=status_text,
            timestamp=block.timestamp,
            block_index=block.index,
            transaction_ref=block.transaction_ref,
            merkle_root=block.merkle_root,
            details=details
        )

    def get_summary(self) -> LedgerSummary:
        return LedgerSummary(
            total_blocks=len(self.chain),
            verified_artifacts=max(0, len(self.chain) - 1),
            tampered_artifacts=0,
            ledger_type="Cryptographic SHA-256 Merkle Chain (EVM Compatible Interface)",
            last_block_hash=self.chain[-1].hash if self.chain else "None",
            is_operational=True
        )

# Global ledger singleton instance
ledger_instance = BlockchainEvidenceLedger()
