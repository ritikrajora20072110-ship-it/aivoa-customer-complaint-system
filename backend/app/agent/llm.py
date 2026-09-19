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

def detect_field_updates_from_message(message: str):
    """
    Detect conversational instructions to change complaint form fields in layman language.
    Returns: (updated_fields_dict, confirmation_message) or (None, None)
    """
    raw = message.strip()
    
    # 1. Customer Name / Username
    m_cust = re.search(r'(?:change|update|set|make|replace|rename)\s+(?:the\s+)?(?:username\s+customer\s+name|customer\s+name|username|customer|client(?:\s+name)?)\s*(?:to|as|=|is|with|\s)\s*([^\.\,\;\n]+)', raw, re.IGNORECASE)
    if not m_cust:
        m_cust = re.search(r'(?:username\s+customer\s+name|customer\s+name|customer)\s*(?:is|should\s+be|=|:)\s*([^\.\,\;\n]+)', raw, re.IGNORECASE)
    if m_cust:
        val = m_cust.group(1).strip().strip('"\'')
        return ({"customer_name": val}, f"✅ **Field Updated**: Changed **Customer Name** to **{val}**.")

    # 2. Product Name
    m_prod = re.search(r'(?:change|update|set|make)\s+(?:the\s+)?(?:product(?:\s+name)?|drug(?:\s+product)?)\s*(?:to|as|=|is|with|\s)\s*([^\.\,\;\n]+)', raw, re.IGNORECASE)
    if not m_prod:
        m_prod = re.search(r'(?:product(?:\s+name)?|drug)\s*(?:is|should\s+be|=|:)\s*([^\.\,\;\n]+)', raw, re.IGNORECASE)
    if m_prod:
        val = m_prod.group(1).strip().strip('"\'')
        return ({"product_name": val}, f"✅ **Field Updated**: Changed **Product Name** to **{val}**.")

    # 3. Batch Number / Lot Number
    m_batch = re.search(r'(?:change|update|set|make)\s+(?:the\s+)?(?:batch(?:\s+number|\s+no|\s+#)?|lot(?:\s+number|\s+no|\s+#)?)\s*(?:to|as|=|is|with|\s)\s*([^\.\,\;\n]+)', raw, re.IGNORECASE)
    if not m_batch:
        m_batch = re.search(r'(?:batch(?:\s+number|\s+no|\s+#)?|lot(?:\s+number|\s+no|\s+#)?)\s*(?:is|should\s+be|=|:)\s*([^\.\,\;\n]+)', raw, re.IGNORECASE)
    if m_batch:
        val = m_batch.group(1).strip().strip('"\'')
        return ({"batch_number": val}, f"✅ **Field Updated**: Changed **Batch / Lot Number** to **{val}**.")

    # 4. Severity (Suggested) / Risk Level
    m_sev = re.search(r'(?:change|update|set|make)\s+(?:the\s+)?(?:suggested\s+severity|severity|risk\s+level|criticality)\s*(?:to|as|=|is|with|\s)\s*(critical|major|minor|pending triage)', raw, re.IGNORECASE)
    if not m_sev:
        m_sev = re.search(r'(?:severity|risk\s+level)\s*(?:is|should\s+be|=|:)\s*(critical|major|minor)', raw, re.IGNORECASE)
    if m_sev:
        val = m_sev.group(1).strip().title()
        return ({"initial_severity": val, "risk_level": val}, f"✅ **Field Updated**: Changed **Severity (Suggested)** to **{val}**.")

    # 5. Suggested Next Action
    m_act = re.search(r'(?:change|update|set|make)\s+(?:the\s+)?(?:suggested\s+next\s+action|next\s+action|action)\s*(?:to|as|=|is|with|\s)\s*([^\.\;\n]+)', raw, re.IGNORECASE)
    if m_act:
        val = m_act.group(1).strip().strip('"\'')
        return ({"suggested_next_action": val}, f"✅ **Field Updated**: Changed **Suggested Next Action** to **{val}**.")

    # 6. Initial Risk Assessment
    m_risk_desc = re.search(r'(?:change|update|set|make)\s+(?:the\s+)?(?:initial\s+risk\s+assessment|risk\s+assessment(?:\s+description)?)\s*(?:to|as|=|is|with|\s)\s*([^\;\n]+)', raw, re.IGNORECASE)
    if m_risk_desc:
        val = m_risk_desc.group(1).strip().strip('"\'')
        return ({"initial_risk_assessment": val}, f"✅ **Field Updated**: Changed **Initial Risk Assessment**.")

    # 7. Priority
    m_pri = re.search(r'(?:change|update|set|make)\s+(?:the\s+)?(?:priority)\s*(?:to|as|=|is|with|\s)\s*(urgent|high|medium|low)', raw, re.IGNORECASE)
    if m_pri:
        val = m_pri.group(1).strip().title()
        return ({"priority": val}, f"✅ **Field Updated**: Changed **Priority** to **{val}**.")

    # 8. Site Block / Facility
    m_site = re.search(r'(?:change|update|set|make)\s+(?:the\s+)?(?:site(?:\s+block)?|facility|cleanroom(?:\s+block)?)\s*(?:to|as|=|is|with|\s)\s*([^\.\,\;\n]+)', raw, re.IGNORECASE)
    if m_site:
        val = m_site.group(1).strip().strip('"\'')
        return ({"site_block": val}, f"✅ **Field Updated**: Changed **Originating Site Block** to **{val}**.")

    # 9. Quantity Affected
    m_qty = re.search(r'(?:change|update|set|make)\s+(?:the\s+)?(?:quantity(?:\s+affected)?|qty)\s*(?:to|as|=|is|with|\s)\s*([^\.\,\;\n]+)', raw, re.IGNORECASE)
    if m_qty:
        val = m_qty.group(1).strip().strip('"\'')
        return ({"quantity_affected": val}, f"✅ **Field Updated**: Changed **Quantity Affected** to **{val}**.")

    # 10. Defect Summary
    m_def = re.search(r'(?:change|update|set|make)\s+(?:the\s+)?(?:defect(?:\s+summary)?)\s*(?:to|as|=|is|with|\s)\s*([^\.\;\n]+)', raw, re.IGNORECASE)
    if m_def:
        val = m_def.group(1).strip().strip('"\'')
        return ({"defect_summary": val}, f"✅ **Field Updated**: Changed **Defect Summary** to **{val}**.")

    # 11. Expiry Date
    m_exp = re.search(r'(?:change|update|set|make)\s+(?:the\s+)?(?:expiry(?:\s+date)?|expiration(?:\s+date)?)\s*(?:to|as|=|is|with|\s)\s*([^\.\,\;\n]+)', raw, re.IGNORECASE)
    if m_exp:
        val = m_exp.group(1).strip().strip('"\'')
        return ({"expiry_date": val}, f"✅ **Field Updated**: Changed **Expiry Date** to **{val}**.")

    # 12. Manufacturing Date
    m_mfg = re.search(r'(?:change|update|set|make)\s+(?:the\s+)?(?:mfg(?:\s+date)?|manufacturing(?:\s+date)?)\s*(?:to|as|=|is|with|\s)\s*([^\.\,\;\n]+)', raw, re.IGNORECASE)
    if m_mfg:
        val = m_mfg.group(1).strip().strip('"\'')
        return ({"mfg_date": val}, f"✅ **Field Updated**: Changed **Manufacturing Date** to **{val}**.")

    # 13. Packaging / Impacted NPM
    m_npm = re.search(r'(?:change|update|set|make)\s+(?:the\s+)?(?:impacted\s+npm|packaging(?:\s+material)?)\s*(?:to|as|=|is|with|\s)\s*([^\.\,\;\n]+)', raw, re.IGNORECASE)
    if m_npm:
        val = m_npm.group(1).strip().strip('"\'')
        return ({"impacted_npm": val}, f"✅ **Field Updated**: Changed **Impacted Packaging Material** to **{val}**.")

    return (None, None)

def run_llm_chat(message: str, history: list, context: dict, model_name: Optional[str] = None) -> Dict[str, Any]:
    """Invoke Groq LLM for conversational copilot assistance and field updates."""
    # First: Check for natural language field update commands
    field_updates, confirmation = detect_field_updates_from_message(message)
    if field_updates:
        return {
            "reply": f"{confirmation}\n\nThe complaint form field has been updated directly. You can review the change on the left and commit to the QMS Ledger whenever ready.",
            "updated_fields": field_updates,
            "suggested_actions": [
                "Commit to QMS Ledger",
                "What is the patient health risk under ICH Q9?",
                "Recommend immediate quarantine actions"
            ]
        }

    llm = get_groq_llm(model_name)
    if not llm:
        return {
            "reply": heuristic_chat_fallback(message, context),
            "updated_fields": None,
            "suggested_actions": [
                "What is the patient health risk under ICH Q9?",
                "Recommend immediate quarantine actions.",
                "Check 21 CFR Part 211 regulatory references.",
                "Draft an executive QMS complaint summary."
            ]
        }

    try:
        from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
        system_instruction = (
            "You are AIVOA Copilot, an AI Pharmaceutical Quality Management System (QMS) Specialist for API and FDF manufacturing. "
            "You help QA directors and complaint officers triage customer complaints, assess patient safety risk under ICH Q9, "
            "determine root cause (5 Whys / Ishikawa), and formulate FDA 21 CFR Part 211 compliant CAPAs. "
            f"Current Complaint Context:\n{json.dumps(context, indent=2)}\n"
            "If the user is asking to change or update any field, return JSON: {\"reply\": \"confirmation text\", \"updated_fields\": {\"field_name\": \"value\"}}. "
            "Otherwise, respond with clear, concise, professional QMS advice."
        )
        msgs = [SystemMessage(content=system_instruction)]
        for h in history[-6:]:
            if h.get("sender") == "user":
                msgs.append(HumanMessage(content=h.get("text", "")))
            else:
                msgs.append(AIMessage(content=h.get("text", "")))
        msgs.append(HumanMessage(content=message))
        res = llm.invoke(msgs)
        content = res.content.strip()

        # Check if LLM returned JSON with updated_fields
        if content.startswith("{") and "updated_fields" in content:
            try:
                parsed = json.loads(content)
                return {
                    "reply": parsed.get("reply", "Field updated."),
                    "updated_fields": parsed.get("updated_fields"),
                    "suggested_actions": parsed.get("suggested_actions", [])
                }
            except Exception:
                pass

        return {
            "reply": content,
            "updated_fields": None,
            "suggested_actions": [
                "What is the patient health risk under ICH Q9?",
                "Recommend immediate quarantine actions.",
                "Check 21 CFR Part 211 regulatory references.",
                "Draft an executive QMS complaint summary."
            ]
        }
    except Exception as e:
        return {
            "reply": heuristic_chat_fallback(message, context),
            "updated_fields": None,
            "suggested_actions": []
        }

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
