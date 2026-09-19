from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class ComplaintBase(BaseModel):
    complaint_source: Optional[str] = ""
    customer_name: Optional[str] = ""
    product_name: Optional[str] = ""
    product_strength_grade: Optional[str] = ""
    batch_number: Optional[str] = ""
    mfg_date: Optional[str] = ""
    expiry_date: Optional[str] = ""
    quantity_affected: Optional[str] = ""
    site_block: Optional[str] = ""
    impacted_npm: Optional[str] = ""
    complaint_type: Optional[str] = ""
    complaint_date: Optional[str] = ""
    defect_summary: Optional[str] = ""
    description: Optional[str] = ""
    initial_severity: Optional[str] = "Pending Triage"
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Pending Triage"
    risk_level: Optional[str] = "Moderate"
    risk_assessment_json: Optional[str] = "{}"
    capa_json: Optional[str] = "{}"
    completeness_score: Optional[int] = 0
    raw_input_text: Optional[str] = ""

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    initial_severity: Optional[str] = None
    priority: Optional[str] = None

class ComplaintResponse(ComplaintBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Agent Extraction & Analysis schemas
class ExtractedComplaintData(BaseModel):
    complaint_source: Optional[str] = ""
    customer_name: Optional[str] = ""
    product_name: Optional[str] = ""
    product_strength_grade: Optional[str] = ""
    batch_number: Optional[str] = ""
    mfg_date: Optional[str] = ""
    expiry_date: Optional[str] = ""
    quantity_affected: Optional[str] = ""
    site_block: Optional[str] = ""
    impacted_npm: Optional[str] = ""
    complaint_type: Optional[str] = ""
    complaint_date: Optional[str] = ""
    defect_summary: Optional[str] = ""
    description: Optional[str] = ""
    initial_severity: Optional[str] = "Major"
    priority: Optional[str] = "High"

class RiskAssessmentData(BaseModel):
    risk_level: str = "Moderate"
    suggested_severity: str = "Major"
    suggested_next_action: str = "Route to QA Investigation & Issue Replacement"
    initial_risk_assessment: str = ""
    patient_safety_impact: str = ""
    defect_classification: str = ""
    regulatory_recall_risk: str = "Low"
    health_hazard_evaluation: str = ""
    ich_q9_score: int = 50

class CompletenessData(BaseModel):
    completeness_score: int = 80
    missing_fields: List[str] = []
    provided_fields: List[str] = []
    recommendations: List[str] = []

class CAPAData(BaseModel):
    immediate_actions: List[str] = []
    root_cause_analysis: Dict[str, Any] = {}
    corrective_actions: List[str] = []
    preventive_actions: List[str] = []
    fda_cfr_references: List[str] = []

class DuplicateMatchData(BaseModel):
    has_duplicates: bool = False
    duplicate_count: int = 0
    matched_complaints: List[Dict[str, Any]] = []

class ExtractionResponse(BaseModel):
    success: bool = True
    extracted_data: ExtractedComplaintData
    risk_assessment: RiskAssessmentData
    completeness: CompletenessData
    capa_recommendations: CAPAData
    duplicate_detection: DuplicateMatchData
    copilot_message: str
    workflow_steps: List[Dict[str, str]]

class ChatRequest(BaseModel):
    message: str
    complaint_context: Optional[Dict[str, Any]] = None
    chat_history: Optional[List[Dict[str, str]]] = []

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = []
    updated_fields: Optional[Dict[str, Any]] = None
