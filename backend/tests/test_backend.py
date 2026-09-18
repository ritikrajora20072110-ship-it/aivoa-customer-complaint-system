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
