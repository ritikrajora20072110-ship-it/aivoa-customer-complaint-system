import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from .database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    
    # 1. ORIGIN & CUSTOMER DETAILS
    complaint_source = Column(String(255), default="")
    customer_name = Column(String(255), default="")
    qms_ledger = Column(String(255), default="LEDGER-2026-QA")
    
    # 2. PRODUCT & BATCH IDENTIFICATION
    product_name = Column(String(255), default="")
    product_strength_grade = Column(String(255), default="")
    batch_number = Column(String(100), index=True, default="")
    mfg_date = Column(String(50), default="")
    expiry_date = Column(String(50), default="")
    quantity_affected = Column(String(100), default="")
    
    # Facility & Material Impact (From Demo Video)
    site_block = Column(String(255), default="")
    impacted_npm = Column(String(255), default="")
    
    # 3. COMPLAINT DETAILS & DEFECT ANALYSIS
    complaint_type = Column(String(255), default="")
    complaint_date = Column(String(50), default="")
    defect_summary = Column(Text, default="")
    description = Column(Text, default="")
    
    # 4. INITIAL ASSESSMENT & PRIORITY
    initial_severity = Column(String(50), default="Pending Triage")
    priority = Column(String(50), default="Medium")
    status = Column(String(50), default="Pending Triage")  # Pending Triage, Under Investigation, Escalated, Closed
    
    # AI Analysis Payloads
    risk_level = Column(String(50), default="Moderate")
    risk_assessment_json = Column(Text, default="{}")
    capa_json = Column(Text, default="{}")
    completeness_score = Column(Integer, default=0)
    raw_input_text = Column(Text, default="")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, index=True)
    action = Column(String(100))
    actor = Column(String(100), default="AI Copilot / User")
    details = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
