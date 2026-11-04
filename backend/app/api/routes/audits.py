# API Routes for Audits

from fastapi import APIRouter, HTTPException, status

from app.schemas.audit import AuditCreate
from app.services.audit_service import create_audit, get_audit

router = APIRouter(prefix="/audits", tags=["Audits"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def start_audit(data: AuditCreate):
    audit = create_audit(target=data.target, asset_type=data.asset_type)

    return audit


@router.get("/{audit_id}")
def read_audit(audit_id: str):
    audit = get_audit(audit_id)

    if audit is None:
        raise HTTPException(status_code=404, detail="Audit not found.")

    return audit
