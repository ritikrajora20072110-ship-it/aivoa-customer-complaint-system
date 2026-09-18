import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from ..schemas import ExtractionResponse, ChatRequest, ChatResponse
from ..agent.parsers import extract_text_from_file
from ..agent.graph import complaint_agent_graph
from ..agent.llm import run_llm_chat

router = APIRouter(prefix="/api/agent", tags=["AI Agent"])

@router.post("/extract", response_model=ExtractionResponse)
async def extract_complaint(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Ingest a raw complaint string or document (PDF, DOCX, TXT, EML)
    and execute the LangGraph complaint intake multi-node workflow.
    """
    raw_content = ""
    filename = None
    
    if file and file.filename:
        filename = file.filename
        content_bytes = await file.read()
        raw_content = extract_text_from_file(content_bytes, file.filename)
    elif text:
        raw_content = text
    else:
        raise HTTPException(status_code=400, detail="Please provide either a text body or upload a file.")
        
    if not raw_content.strip():
        raise HTTPException(status_code=400, detail="Document appears to be empty or unreadable.")

    # Initialize LangGraph State
    initial_state = {
        "raw_text": raw_content,
        "filename": filename,
        "extracted_data": {},
        "risk_assessment": {},
        "completeness": {},
        "capa_recommendations": {},
        "duplicate_detection": {},
        "copilot_message": "",
        "workflow_steps": []
    }

    try:
        # Execute the compiled LangGraph workflow
        final_state = complaint_agent_graph.invoke(initial_state)
        
        return ExtractionResponse(
            success=True,
            extracted_data=final_state.get("extracted_data", {}),
            risk_assessment=final_state.get("risk_assessment", {}),
            completeness=final_state.get("completeness", {}),
            capa_recommendations=final_state.get("capa_recommendations", {}),
            duplicate_detection=final_state.get("duplicate_detection", {}),
            copilot_message=final_state.get("copilot_message", "Intake analysis complete."),
            workflow_steps=final_state.get("workflow_steps", [])
        )
    except Exception as e:
        print(f"Error during LangGraph execution: {e}")
        raise HTTPException(status_code=500, detail=f"Agent workflow error: {str(e)}")

@router.post("/chat", response_model=ChatResponse)
def copilot_chat(request: ChatRequest):
    """
    Interactive conversational Copilot endpoint for asking questions,
    refining complaint data, and querying QMS regulations.
    """
    reply = run_llm_chat(
        message=request.message,
        history=request.chat_history or [],
        context=request.complaint_context or {}
    )
    
    # Suggested follow-up prompt chips
    suggestions = [
        "What is the patient health risk under ICH Q9?",
        "Recommend immediate quarantine actions.",
        "Check 21 CFR Part 211 regulatory references.",
        "Draft an executive QMS complaint summary."
    ]
    
    return ChatResponse(
        reply=reply,
        suggested_actions=suggestions
    )
