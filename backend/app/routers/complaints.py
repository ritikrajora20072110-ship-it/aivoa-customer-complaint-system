import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Complaint, AuditLog
from ..schemas import ComplaintCreate, ComplaintResponse, ComplaintUpdate

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.get("", response_model=List[ComplaintResponse])
def list_complaints(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Complaint).order_by(Complaint.created_at.desc())
    if status:
        query = query.filter(Complaint.status == status)
    if severity:
        query = query.filter(Complaint.initial_severity == severity)
    if search:
        query = query.filter(
            (Complaint.product_name.ilike(f"%{search}%")) |
            (Complaint.batch_number.ilike(f"%{search}%")) |
            (Complaint.customer_name.ilike(f"%{search}%"))
        )
    return query.all()

@router.post("", response_model=ComplaintResponse)
def create_complaint(complaint_in: ComplaintCreate, db: Session = Depends(get_db)):
    db_complaint = Complaint(
        complaint_source=complaint_in.complaint_source,
        customer_name=complaint_in.customer_name,
        qms_ledger=complaint_in.qms_ledger or "LEDGER-2026-QA",
        product_name=complaint_in.product_name,
        product_strength_grade=complaint_in.product_strength_grade,
        batch_number=complaint_in.batch_number,
        mfg_date=complaint_in.mfg_date,
        expiry_date=complaint_in.expiry_date,
        quantity_affected=complaint_in.quantity_affected,
        site_block=complaint_in.site_block,
        impacted_npm=complaint_in.impacted_npm,
        complaint_type=complaint_in.complaint_type,
        complaint_date=complaint_in.complaint_date,
        defect_summary=complaint_in.defect_summary,
        description=complaint_in.description,
        initial_severity=complaint_in.initial_severity or "Pending Triage",
        priority=complaint_in.priority or "Medium",
        status=complaint_in.status or "Pending Triage",
        risk_level=complaint_in.risk_level or "Moderate",
        risk_assessment_json=complaint_in.risk_assessment_json or "{}",
        capa_json=complaint_in.capa_json or "{}",
        completeness_score=complaint_in.completeness_score or 0,
        raw_input_text=complaint_in.raw_input_text or ""
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    
    # Audit log entry for 21 CFR compliance
    audit = AuditLog(
        complaint_id=db_complaint.id,
        action="COMPLAINT_LOGGED",
        actor="Quality Officer",
        details=f"Logged customer complaint for {db_complaint.product_name} (Batch: {db_complaint.batch_number})"
    )
    db.add(audit)
    db.commit()
    
    return db_complaint

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint record not found")
    return c

@router.patch("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(complaint_id: int, update_data: ComplaintUpdate, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint record not found")
        
    if update_data.status is not None:
        c.status = update_data.status
    if update_data.initial_severity is not None:
        c.initial_severity = update_data.initial_severity
    if update_data.priority is not None:
        c.priority = update_data.priority
    if update_data.qms_ledger is not None:
        c.qms_ledger = update_data.qms_ledger
        
    db.commit()
    db.refresh(c)
    
    audit = AuditLog(
        complaint_id=c.id,
        action="COMPLAINT_STATUS_UPDATED",
        actor="Quality Manager",
        details=f"Status changed to {c.status}, Severity: {c.initial_severity}"
    )
    db.add(audit)
    db.commit()
    
    return c

@router.delete("/{complaint_id}")
def delete_complaint(complaint_id: int, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Complaint record not found")
    db.delete(c)
    db.commit()
    return {"message": f"Complaint {complaint_id} deleted successfully"}
