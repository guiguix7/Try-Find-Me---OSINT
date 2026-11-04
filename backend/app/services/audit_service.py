from datetime import datetime, timezone
from uuid import uuid4

audits = {}


def create_audit(target: str, asset_type: str) -> dict:
    audit_id = str(uuid4())

    audit = {
        "id": audit_id,
        "target": target,
        "asset_type": asset_type,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "mode": "simulation",
    }

    audits[audit_id] = audit

    return audit


def get_audit(audit_id: str):
    return audits.get(audit_id)
