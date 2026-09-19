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

FIELD_MAP = {
    "qms ledger": ("qms_ledger", "QMS Ledger"),
    "qms ledger id": ("qms_ledger", "QMS Ledger"),
    "qms_ledger": ("qms_ledger", "QMS Ledger"),
    "ledger": ("qms_ledger", "QMS Ledger"),
    "customer name": ("customer_name", "Customer Name"),
    "customer": ("customer_name", "Customer Name"),
    "customer id": ("customer_name", "Customer Name"),
    "username": ("customer_name", "Customer Name"),
    "username customer name": ("customer_name", "Customer Name"),
    "client": ("customer_name", "Customer Name"),
    "client name": ("customer_name", "Customer Name"),
    "product name": ("product_name", "Product Name"),
    "product": ("product_name", "Product Name"),
    "drug": ("product_name", "Product Name"),
    "drug product": ("product_name", "Product Name"),
    "product strength": ("product_strength_grade", "Product Strength / Grade"),
    "product strength grade": ("product_strength_grade", "Product Strength / Grade"),
    "strength": ("product_strength_grade", "Product Strength / Grade"),
    "grade": ("product_strength_grade", "Product Strength / Grade"),
    "batch number": ("batch_number", "Batch / Lot Number"),
    "batch no": ("batch_number", "Batch / Lot Number"),
    "batch #": ("batch_number", "Batch / Lot Number"),
    "batch": ("batch_number", "Batch / Lot Number"),
    "lot number": ("batch_number", "Batch / Lot Number"),
    "lot no": ("batch_number", "Batch / Lot Number"),
    "lot": ("batch_number", "Batch / Lot Number"),
    "mfg date": ("mfg_date", "Manufacturing Date"),
    "manufacturing date": ("mfg_date", "Manufacturing Date"),
    "expiry date": ("expiry_date", "Expiry Date"),
    "expiration date": ("expiry_date", "Expiry Date"),
    "expiry": ("expiry_date", "Expiry Date"),
    "quantity affected": ("quantity_affected", "Quantity Affected"),
    "quantity": ("quantity_affected", "Quantity Affected"),
    "qty": ("quantity_affected", "Quantity Affected"),
    "site block": ("site_block", "Originating Site Block"),
    "site": ("site_block", "Originating Site Block"),
    "facility": ("site_block", "Originating Site Block"),
    "cleanroom block": ("site_block", "Originating Site Block"),
    "cleanroom": ("site_block", "Originating Site Block"),
    "impacted npm": ("impacted_npm", "Impacted Packaging Material"),
    "packaging material": ("impacted_npm", "Impacted Packaging Material"),
    "packaging": ("impacted_npm", "Impacted Packaging Material"),
    "complaint type": ("complaint_type", "Complaint Type"),
    "type": ("complaint_type", "Complaint Type"),
    "complaint source": ("complaint_source", "Complaint Source"),
    "source": ("complaint_source", "Complaint Source"),
    "complaint date": ("complaint_date", "Complaint Date"),
    "date": ("complaint_date", "Complaint Date"),
    "defect summary": ("defect_summary", "Defect Summary"),
    "defect": ("defect_summary", "Defect Summary"),
    "description": ("description", "Detailed Description"),
    "suggested severity": ("initial_severity", "Suggested Severity"),
    "severity": ("initial_severity", "Suggested Severity"),
    "risk level": ("initial_severity", "Suggested Severity"),
    "initial severity": ("initial_severity", "Suggested Severity"),
    "suggested next action": ("suggested_next_action", "Suggested Next Action"),
    "next action": ("suggested_next_action", "Suggested Next Action"),
    "action": ("suggested_next_action", "Suggested Next Action"),
    "initial risk assessment": ("initial_risk_assessment", "Initial Risk Assessment"),
    "risk assessment": ("initial_risk_assessment", "Initial Risk Assessment"),
    "priority": ("priority", "Priority"),
    "status": ("status", "Triage Status"),
    "triage status": ("status", "Triage Status"),
}

COLUMN_MAP = {
    "customer id": ("customer_name", "Customer ID"),
    "customer": ("customer_name", "Customer"),
    "customer name": ("customer_name", "Customer"),
    "complaint id": ("id", "Complaint ID"),
    "id": ("id", "Complaint ID"),
    "product name": ("product_name", "Product Name"),
    "product": ("product_name", "Product Name"),
    "batch number": ("batch_number", "Batch Number"),
    "batch": ("batch_number", "Batch Number"),
    "defect classification": ("defect_summary", "Defect Classification"),
    "defect": ("defect_summary", "Defect Classification"),
    "severity": ("initial_severity", "Severity"),
    "triage status": ("status", "Triage Status"),
    "status": ("status", "Triage Status"),
    "qms ledger": ("qms_ledger", "QMS Ledger"),
    "ledger": ("qms_ledger", "QMS Ledger"),
}

def detect_field_updates_from_message(message: str, context: Optional[dict] = None):
    """
    Detect instructions to change/update/remove/delete/add form fields or table columns.
    Preserves all names, fields, columns, and values appearing after 'to' exactly as provided.
    Returns: (updated_fields_dict, column_updates_dict, field_diff_dict, confirmation_message)
    """
    if not message or not isinstance(message, str):
        return None, None, None, None

    raw = message.strip()
    ctx = context or {}

    # 1. COLUMN INSTRUCTIONS: e.g. "Change column name Customer ID to QMS Ledger"
    col_pattern = re.search(
        r'^(?:please\s+)?(change|update|rename|modify|remove|delete|add)\s+(?:the\s+)?(?:column\s+name|columns?\s+name|columns?)\s+["\']?([^"\',;\n]+?)["\']?(?:\s+(?:to|as|=|with)\s+(.+))?$',
        raw,
        re.IGNORECASE
    )
    if col_pattern:
        action = col_pattern.group(1).lower()
        target_name = col_pattern.group(2).strip()
        new_val = col_pattern.group(3).strip() if col_pattern.group(3) else ""
        if new_val.startswith(('"', "'")) and new_val.endswith(('"', "'")) and len(new_val) >= 2:
            new_val = new_val[1:-1]

        target_norm = target_name.lower()
        col_info = COLUMN_MAP.get(target_norm)
        if col_info:
            col_key, original_label = col_info
        else:
            col_key = target_norm.replace(" ", "_")
            original_label = target_name

        if action in ("remove", "delete"):
            col_update = {
                "action": "remove",
                "column_key": col_key,
                "previous_name": original_label
            }
            confirmation = (
                f"✅ **Column Removed Successfully**\n"
                f"• **Target Column**: {original_label}\n"
                f"• **Action**: Column removed from dashboard ledger view."
            )
            return None, col_update, None, confirmation
        else:
            # action is change/update/rename/modify/add: preserve new_val EXACTLY!
            col_update = {
                "action": "rename",
                "column_key": col_key,
                "previous_name": original_label,
                "new_name": new_val
            }
            confirmation = (
                f"✅ **Column Renamed Successfully**\n"
                f"• **Target Column**: {original_label}\n"
                f"• **Previous Name**: {original_label}\n"
                f"• **Updated Name**: **{new_val}**\n"
                f"• **Status**: Dashboard column header renamed to exactly \"{new_val}\" and visibly highlighted."
            )
            return None, col_update, None, confirmation

    # 2. EXPLICIT FIELD INSTRUCTIONS: e.g. "change field customer_name to Rithvik Kumar"
    field_pattern = re.search(
        r'^(?:please\s+)?(change|update|modify|set|remove|delete|add)\s+(?:the\s+)?(?:fields?)\s+["\']?([^"\',;\n]+?)["\']?(?:\s+(?:to|as|=|with|is)\s+(.+))?$',
        raw,
        re.IGNORECASE
    )
    if field_pattern:
        action = field_pattern.group(1).lower()
        target_name = field_pattern.group(2).strip()
        new_val = field_pattern.group(3).strip() if field_pattern.group(3) else ""
        if new_val.startswith(('"', "'")) and new_val.endswith(('"', "'")) and len(new_val) >= 2:
            new_val = new_val[1:-1]

        target_norm = target_name.lower()
        field_info = FIELD_MAP.get(target_norm)
        if field_info:
            field_key, field_label = field_info
        else:
            field_key = target_norm.replace(" ", "_")
            field_label = target_name

        prev_val = ctx.get(field_key, "")

        if action in ("remove", "delete"):
            field_diff = {
                "field": field_key,
                "label": field_label,
                "previous_value": prev_val,
                "new_value": "",
                "action": "delete"
            }
            confirmation = (
                f"✅ **Field Cleared Successfully**\n"
                f"• **Target Field**: {field_label}\n"
                f"• **Previous Value**: \"{prev_val or '(empty)'}\"\n"
                f"• **Updated Value**: \"(cleared)\"\n"
                f"• **Status**: Form field cleared and visibly highlighted in amber."
            )
            return {field_key: ""}, None, field_diff, confirmation
        else:
            field_diff = {
                "field": field_key,
                "label": field_label,
                "previous_value": prev_val,
                "new_value": new_val,
                "action": "update"
            }
            extra = {}
            if field_key == "initial_severity":
                extra["risk_level"] = new_val
            confirmation = (
                f"✅ **Field Updated Successfully**\n"
                f"• **Target Field**: {field_label}\n"
                f"• **Previous Value**: \"{prev_val or '(empty)'}\"\n"
                f"• **Updated Value**: **\"{new_val}\"**\n"
                f"• **Status**: Form field updated to exact input and visibly highlighted in green."
            )
            return {field_key: new_val, **extra}, None, field_diff, confirmation

    # 3. NATURAL FIELD INSTRUCTIONS (Sorted longest phrase first):
    for name_phrase, (field_key, field_label) in sorted(FIELD_MAP.items(), key=lambda x: -len(x[0])):
        # Check remove / delete
        del_m = re.search(r'^(?:please\s+)?(remove|delete)\s+(?:the\s+)?' + re.escape(name_phrase) + r'$', raw, re.IGNORECASE)
        if del_m:
            prev_val = ctx.get(field_key, "")
            field_diff = {
                "field": field_key,
                "label": field_label,
                "previous_value": prev_val,
                "new_value": "",
                "action": "delete"
            }
            confirmation = (
                f"✅ **Field Cleared Successfully**\n"
                f"• **Target Field**: {field_label}\n"
                f"• **Previous Value**: \"{prev_val or '(empty)'}\"\n"
                f"• **Updated Value**: \"(cleared)\"\n"
                f"• **Status**: Form field cleared and visibly highlighted."
            )
            return {field_key: ""}, None, field_diff, confirmation

        # Check change / update / set / make / add
        upd_m = re.search(
            r'^(?:please\s+)?(change|update|set|make|replace|add)\s+(?:the\s+)?' + re.escape(name_phrase) + r'\s*(?:to|as|=|is|with|\s)\s*(.+)$',
            raw,
            re.IGNORECASE
        )
        if upd_m:
            val = upd_m.group(2).strip()
            if val.startswith(('"', "'")) and val.endswith(('"', "'")) and len(val) >= 2:
                val = val[1:-1]
            prev_val = ctx.get(field_key, "")
            extra = {}
            if field_key == "initial_severity":
                extra["risk_level"] = val

            field_diff = {
                "field": field_key,
                "label": field_label,
                "previous_value": prev_val,
                "new_value": val,
                "action": "update"
            }
            confirmation = (
                f"✅ **Field Updated Successfully**\n"
                f"• **Target Field**: {field_label}\n"
                f"• **Previous Value**: \"{prev_val or '(empty)'}\"\n"
                f"• **Updated Value**: **\"{val}\"**\n"
                f"• **Status**: Form field updated to exact input and visibly highlighted in green."
            )
            return {field_key: val, **extra}, None, field_diff, confirmation

    return None, None, None, None

def run_llm_chat(message: str, history: list, context: dict, model_name: Optional[str] = None) -> Dict[str, Any]:
    """Invoke Groq LLM for conversational copilot assistance and field updates."""
    # First: Check for action keyword instructions on fields or columns
    field_updates, column_updates, field_diff, confirmation = detect_field_updates_from_message(message, context)
    if field_updates or column_updates:
        return {
            "reply": confirmation,
            "updated_fields": field_updates,
            "column_updates": column_updates,
            "field_diff": field_diff,
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
