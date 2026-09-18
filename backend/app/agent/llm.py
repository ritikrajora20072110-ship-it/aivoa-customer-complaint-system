import os
import json
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
PREFERRED_MODEL = os.getenv("GROQ_MODEL", "gemma2-9b-it") # Or llama-3.3-70b-versatile

def get_groq_llm(model_name: Optional[str] = None):
    """Instantiate Groq Chat client if API key is present."""
    if not GROQ_API_KEY:
        return None
    try:
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=model_name or PREFERRED_MODEL,
            groq_api_key=GROQ_API_KEY,
            temperature=0.1
        )
    except Exception as e:
        print(f"Warning: Failed to initialize ChatGroq: {e}")
        return None

def run_llm_json_generation(prompt: str, system_prompt: str, model_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Invoke Groq LLM with system and user prompt, parse JSON output."""
    llm = get_groq_llm(model_name)
    if not llm:
        return None
    try:
        from langchain_core.messages import HumanMessage, SystemMessage
        messages = [
            SystemMessage(content=system_prompt + "\n\nCRITICAL: You MUST respond ONLY with valid, parseable JSON. Do not include markdown codeblocks or conversational preamble."),
            HumanMessage(content=prompt)
        ]
        response = llm.invoke(messages)
        content = response.content.strip()
        # Clean markdown wrappers if present
        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?\n?", "", content)
            content = re.sub(r"\n?```$", "", content)
        return json.loads(content)
    except Exception as e:
        print(f"Groq LLM invocation or parsing error: {e}")
        return None

def run_llm_chat(message: str, history: list, context: dict, model_name: Optional[str] = None) -> str:
    """Invoke Groq LLM for conversational copilot assistance."""
    llm = get_groq_llm(model_name)
    if not llm:
        return heuristic_chat_fallback(message, context)
    try:
        from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
        system_instruction = (
            "You are AIVOA Copilot, an AI Pharmaceutical Quality Management System (QMS) Specialist for API and FDF manufacturing. "
            "You help QA directors and complaint officers triage customer complaints, assess patient safety risk under ICH Q9, "
            "determine root cause (5 Whys / Ishikawa), and formulate FDA 21 CFR Part 211 compliant CAPAs. "
            f"Current Complaint Context:\n{json.dumps(context, indent=2)}\n"
            "Be professional, precise, regulatory-focused, and concise."
        )
        msgs = [SystemMessage(content=system_instruction)]
        for h in history[-6:]:
            if h.get("sender") == "user":
                msgs.append(HumanMessage(content=h.get("text", "")))
            else:
                msgs.append(AIMessage(content=h.get("text", "")))
        msgs.append(HumanMessage(content=message))
        res = llm.invoke(msgs)
        return res.content.strip()
    except Exception as e:
        return heuristic_chat_fallback(message, context)

def heuristic_chat_fallback(message: str, context: dict) -> str:
    """Intelligent QMS conversational assistant fallback."""
    msg = message.lower()
    product = context.get("product_name", "the reported drug product")
    batch = context.get("batch_number", "the reported batch")
    severity = context.get("initial_severity", "Major")
    
    if "batch" in msg or "lot" in msg:
        return f"The complaint references batch number **{batch}**. In accordance with 21 CFR 211.192, we must verify batch release records, review environmental monitoring logs for that manufacturing window, and check for any open deviations."
    elif "risk" in msg or "safety" in msg or "patient" in msg:
        return f"This complaint is currently triaged as **{severity}** severity. Patient health risk involves potential sterility compromise or compromised efficacy. Under ICH Q9 Quality Risk Management, containment requires immediate quarantine of affected inventory and reserve sample inspection."
    elif "capa" in msg or "action" in msg or "corrective" in msg:
        return f"Recommended immediate actions: (1) Place all inventory of lot {batch} into physical and SAP quarantine; (2) Request physical samples from the customer for analytical assay; (3) Initiate Ishikawa Fishbone analysis on the originating line."
    elif "recall" in msg or "fda" in msg:
        return f"Based on the preliminary defect severity ({severity}), a Field Alert Report (FAR) or health hazard evaluation (HHE) should be drafted within 3 working days if customer samples confirm container integrity failure."
    elif "summary" in msg or "summarize" in msg:
        return f"Summary: Complaint logged for **{product}** (Batch: {batch}). Defect reported: {context.get('defect_summary', 'Quality deviation')}. Initial severity is flagged as **{severity}**."
    else:
        return f"Regarding your inquiry about {product} (Batch: {batch}): The complaint data has been verified. You can review the AI Copilot Risk Assessment card on the left, check the Completeness Scorecard, or save the record to initiate formal QMS investigation."
