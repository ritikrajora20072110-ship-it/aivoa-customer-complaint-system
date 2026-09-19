import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_list_complaints():
    res = client.get("/api/complaints")
    assert res.status_code == 200
    items = res.json()
    assert isinstance(items, list)

def test_text_extraction():
    sample_text = """
    URGENT COMPLAINT
    Customer: Saint Jude Medical
    Product: Amoxicillin Trihydrate 500mg
    Batch: AMX-TEST-001
    Mfg Date: 2024-02-01
    Expiry Date: 2026-02-01
    Quantity Affected: 100 boxes
    Defect: Black discoloration on capsules. Critical risk.
    """
    res = client.post("/api/agent/extract", data={"text": sample_text})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "extracted_data" in data
    assert "risk_assessment" in data
    assert "completeness" in data
    assert "capa_recommendations" in data

def test_chat():
    res = client.post("/api/agent/chat", json={
        "message": "What is the batch number?",
        "complaint_context": {"batch_number": "AMX-TEST-001", "product_name": "Amoxicillin"},
        "chat_history": []
    })
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 0

def test_conversational_field_update():
    res = client.post("/api/agent/chat", json={
        "message": "change username customer name to Rithvik Kumar",
        "complaint_context": {},
        "chat_history": []
    })
    assert res.status_code == 200
    data = res.json()
    assert data["updated_fields"] is not None
    assert data["updated_fields"].get("customer_name") == "Rithvik Kumar"
    assert "Rithvik Kumar" in data["reply"]

def test_sample_file_download():
    res = client.get("/api/agent/sample-files/ciprofloxacin_sterile_vial_leak.pdf")
    assert res.status_code == 200
    assert len(res.content) > 1000

    res2 = client.get("/api/agent/sample-files/amoxicillin_capsule_discoloration.pdf")
    assert res2.status_code == 200
    assert len(res2.content) > 1000

def test_sample_pdf_upload_extraction():
    import os
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../samples/ciprofloxacin_sterile_vial_leak.pdf"))
    with open(pdf_path, "rb") as f:
        res = client.post("/api/agent/extract", files={"file": ("ciprofloxacin_sterile_vial_leak.pdf", f, "application/pdf")})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    ext = data["extracted_data"]
    risk = data.get("risk_assessment", {})
    assert "Ciprofloxacin" in ext.get("product_name", "") or "CIP" in ext.get("batch_number", "")
    assert ext.get("initial_severity") == "Critical" or risk.get("suggested_severity") == "Critical"


