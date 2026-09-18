# AIVOA AI Product Engineer (Intern) — Video Submission Guide & Script

This guide provides the complete, structured recording plan and spoken dialogue for the **two required demo videos** (5–10 minutes each).

---

# VIDEO 1: Working Demonstration of AI Tools & Frontend Features (5–7 Mins)

**Objective**: Show the live system running, demonstrating document upload (PDF/EML/TXT), real-time LangGraph extraction progress, form auto-population, ICH Q9 risk assessment, interactive Copilot chat, and all bonus QMS features.

### Video 1 Timeline:
```mermaid
timeline
    title Video 1 Demonstration Timeline
    00:00 - 01:00 : Introduction & Pharmaceutical QMS Context
    01:00 - 02:30 : Document Upload (PDF) & Real-time LangGraph Extraction
    02:30 - 03:45 : Form Auto-Population & ICH Q9 Risk Assessment Review
    03:45 - 05:00 : Bonus AI Tools: 5-Whys, CAPA Plan, Completeness Scorecard
    05:00 - 06:00 : Copilot Interactive Chat & Duplicate Complaint Detection
    06:00 - 06:45 : Saving Record & Triage Dashboard Workflow
```

---

### Step-by-Step Director's Script for Video 1

#### 1. Introduction (0:00 – 1:00)
- **On Screen**: Browser open at `http://localhost:5173`. Show the clean, Google Inter typography interface: "Log Customer Complaint" on the left, "AI Complaint Intake Assistant" on the right.
- **Spoken Dialogue**:
  > *"Hello! Today I am presenting my submission for Round 1 of the AIVOA AI Product Engineer internship: an AI-Powered Customer Complaint Management System built specifically for pharmaceutical manufacturing across Active Pharmaceutical Ingredients (API) and Finished Dosage Forms (FDF).*
  >
  > *In pharmaceutical QMS, customer complaints are regulated under FDA 21 CFR Part 211.198 and ICH Q9. When a defect occurs—such as vial leaks, capsule discoloration, or particulate contamination—timely intake, accurate data extraction, patient health risk categorization, and corrective actions (CAPA) are mission critical.*
  >
  > *Our solution leverages a multi-node LangGraph agent powered by Groq's `gemma2-9b-it` model, React with Redux Toolkit on the frontend, and a FastAPI backend with SQLAlchemy database persistence."*

#### 2. Live Document Ingestion & LangGraph Progress (1:00 – 2:30)
- **On Screen**:
  1. Hover over the right panel: "AIVOA Copilot / AI Complaint Intake Assistant".
  2. Click on the Drag & Drop area or click "Paste Complaint Text / Email" or drag `samples/ciprofloxacin_sterile_vial_leak.pdf`.
  3. Show the animated Extraction Progress bar advancing from 10% to 100%, displaying dynamic status updates: *"Ingesting document..."*, *"Executing LangGraph QMS Entity Extraction..."*, *"Classifying ICH Q9 Risk & Formulating CAPA..."*.
- **Spoken Dialogue**:
  > *"Let's test this with a realistic pharmaceutical defect report. I'll drag and drop our sample file: `ciprofloxacin_sterile_vial_leak.pdf`—a critical defect report from a trauma center reporting hairline glass fractures and sterility loss.*
  >
  > *Notice the animated extraction progress bar. Under the hood, FastAPI receives the document, parses the PDF via our document ingestion pipeline, and triggers our LangGraph state graph. The agent proceeds through 6 specialized nodes: normalization, entity extraction, risk assessment, completeness audit, root cause formulation, and duplicate detection."*

#### 3. Form Auto-Population & AI Risk Assessment (2:30 – 3:45)
- **On Screen**:
  1. Point the mouse to the left panel ("Log Customer Complaint"):
     - Origin & Customer: Great Lakes Regional Trauma Center, Hospital Hotline.
     - Product & Batch: Ciprofloxacin Injection 200mg/100mL, Lot `CIP-INJ-2024-1102`.
     - Site Block: Aseptic Fill-Finish Block A (ISO 5).
     - Impacted NPM: Type I Borosilicate Glass Vial & Chlorobutyl Stopper.
     - Defect Summary: Hairline fractures along vial neck beneath aluminum flip-off crimp seal with confirmed solution seepage.
     - Initial Severity: **Critical**, Priority: **Urgent**.
  2. Scroll down to the **AI Copilot Risk Assessment** card:
     - Show the ICH Q9 Risk Score gauge (92/100).
     - Show Patient Safety Impact: *"High risk of acute adverse events, particulate embolism, or bacteremia if administered."*
     - Show Regulatory Evaluation: *"Mandatory Health Hazard Evaluation (HHE) under FDA 21 CFR Part 7."*
- **Spoken Dialogue**:
  > *"In just a few seconds, the entire form is populated with zero manual typing. Look at the precision of the extraction:*
  > *It identified the Product Name, the Batch Number, the Expiry Date, the exact Cleanroom Site Block (Block A), and the Non-Product Packaging Material (Type I Borosilicate Glass).*
  >
  > *Immediately below the form, our AI Copilot Risk Assessment evaluated the complaint under ICH Q9 principles. Because this is an injectable product with compromised container-closure integrity, it correctly escalated the severity to Critical and computed a risk index of 92/100, recommending an immediate Health Hazard Evaluation."*

#### 4. Bonus AI Quality Tools (3:45 – 5:00)
- **On Screen**: Click through the tabs in the **AI QMS Investigation & Copilot Tools** drawer:
  1. **Completeness Tab**: Show the 100% score and verified checklist.
  2. **Root Cause (5-Whys) Tab**: Show the 5-Whys chain tracing the defect to crimping head calibration on the capping station, plus Ishikawa 4M categories (Machine, Material, Method, Man).
  3. **CAPA Plan Tab**: Show Immediate Containment (quarantine hold, reserve sample inspection), Corrective Actions, and Long-Term Preventive Actions citing 21 CFR 211.192.
  4. **Duplicates Tab**: Show the historical batch matching engine.
  5. **Executive Summary Tab**: Click "Copy Summary" to show the audit-ready report.
- **Spoken Dialogue**:
  > *"We have also implemented all 5 bonus AI features requested in the assignment:*
  > *First, the **Complaint Completeness Checker** audits all mandatory fields under 21 CFR 211.198, verifying that all essential intake details are present.*
  > *Second, the **Root Cause Recommendation** module constructs a full 5-Whys diagnostic chain and maps findings across Ishikawa categories.*
  > *Third, the **CAPA Recommendation** engine details immediate containment actions, equipment corrective actions, and preventive monitoring to satisfy FDA inspectors.*
  > *Fourth, the **Duplicate Detection** engine checks our database to identify any recurring complaints on the same batch or manufacturing line.*
  > *And fifth, the **Executive Summary** creates a formal GMP briefing that QA directors can copy directly into committee minutes."*

#### 5. Copilot Chat & Saving Complaint (5:00 – 6:45)
- **On Screen**:
  1. Type in the chat input: *"What are the immediate quarantine steps?"* and press Enter.
  2. Show Copilot's instant contextual response.
  3. Click the blue **"Save Complaint"** button.
  4. Switch to the **"Complaints Dashboard"** tab in the top navigation.
  5. Show the complaint listed with ID `#0003`, filter by "Critical", and click "Inspect Record".
- **Spoken Dialogue**:
  > *"On the bottom right, we have an interactive Copilot chat. QA officers can ask questions like 'What are the immediate quarantine steps?' and receive instant regulatory guidance.*
  >
  > *Finally, clicking 'Save Complaint' commits the complete record and audit trail to our database. Switching to the Complaints Dashboard, we can monitor all active complaints across facilities, track triage statuses, and maintain complete compliance oversight."*

---

# VIDEO 2: Comprehensive Code Walkthrough & Architecture (6–9 Mins)

**Objective**: Walk through the complete end-to-end technical implementation, explaining the frontend React/Redux architecture, FastAPI endpoints, LangGraph multi-node state graph, Groq LLM integration, and database schema.

### Video 2 Timeline:
```mermaid
timeline
    title Video 2 Code Walkthrough Timeline
    00:00 - 01:15 : Codebase Architecture & Directory Overview
    01:15 - 02:45 : Frontend Code: React Components & Redux Store Slices
    02:45 - 04:15 : Backend Code: FastAPI Routers & Document Parsers
    04:15 - 06:15 : Deep Dive: LangGraph Multi-Node State Graph
    06:15 - 07:30 : Groq LLM Integration & Resilient Fallback Engine
    07:30 - 08:30 : Database Schema, 21 CFR Audit Trail & Summary
```

---

### Step-by-Step Director's Script for Video 2

#### 1. Codebase Overview (0:00 – 1:15)
- **On Screen**: VS Code showing the project directory tree:
  - `backend/` (`app/agent/`, `app/routers/`, `app/models.py`, `app/database.py`)
  - `frontend/` (`src/components/`, `src/store/`)
  - `samples/`
  - `docs/`
- **Spoken Dialogue**:
  > *"Welcome to Video 2. In this video, I will walk you through the codebase and architectural design of our AI-Powered Customer Complaint Management System.*
  >
  > *The project is organized into a clean decoupled architecture:*
  > *Our frontend is built with React 18, Redux Toolkit, Tailwind CSS, and Google Inter typography.*
  > *Our backend is powered by Python 3.13 and FastAPI, backed by an SQLAlchemy database.*
  > *Our AI orchestration is powered by LangGraph, integrating Groq's `gemma2-9b-it` model with a resilient fallback mechanism."*

#### 2. Frontend & Redux Store Walkthrough (1:15 – 2:45)
- **On Screen**: Open `frontend/src/store/complaintSlice.js` and `frontend/src/components/ComplaintForm.jsx`.
- **Spoken Dialogue**:
  > *"Let's begin on the frontend in `src/store/complaintSlice.js`.*
  > *State management is strictly handled using Redux Toolkit. The `complaintSlice` maintains the source of truth for all form fields—from Customer Details, Product Name, and Lot Number, to Site Block, Non-Product Materials, and Defect Summaries.*
  >
  > *When an AI extraction completes, the `populateFromAi` reducer updates every field immutably while flagging the state as dirty.*
  >
  > *In `ComplaintForm.jsx`, each input field binds directly to the Redux store. When the user reviews the AI-extracted data, they can make manual edits or adjustments, and clicking 'Save Complaint' dispatches an async thunk that persists the record to the backend."*

- **On Screen**: Open `frontend/src/components/AICopilot.jsx` and `frontend/src/store/copilotSlice.js`.
- **Spoken Dialogue**:
  > *"In `AICopilot.jsx` and `copilotSlice.js`, we manage the file intake and chat lifecycle.*
  > *The drag-and-drop zone supports PDF, DOCX, TXT, and EML files up to 10MB. When a file is dropped or text is pasted, it initiates `startExtraction`, displays progress feedback, and dispatches a multipart POST request to our backend API."*

#### 3. Backend Endpoints & Document Parsers (2:45 – 4:15)
- **On Screen**: Open `backend/app/routers/agent.py` and `backend/app/agent/parsers.py`.
- **Spoken Dialogue**:
  > *"Now let's trace the backend in `backend/app/routers/agent.py`.*
  > *The `/api/agent/extract` endpoint receives either a raw text body or an uploaded file. It invokes our document ingestion module in `parsers.py`, which uses `pypdf` for PDF documents, `python-docx` for Word files, and Python's standard `email` library to parse EML messages.*
  >
  > *Once clean text is extracted, the endpoint initializes an `AgentState` object and executes the LangGraph workflow: `complaint_agent_graph.invoke(initial_state)`."*

#### 4. Deep Dive: LangGraph Multi-Node State Graph (4:15 – 6:15)
- **On Screen**: Open `backend/app/agent/graph.py`. Highlight the `AgentState` definition and `build_complaint_intake_graph()`.
- **Spoken Dialogue**:
  > *"Here in `graph.py` is the core AI architecture: our LangGraph StateGraph.*
  > *The graph maintains an `AgentState` TypedDict containing the raw text, extracted fields, risk assessment, completeness metrics, CAPA plan, and workflow step logs.*
  >
  > *The graph is constructed as a 6-node sequential pipeline:*
  > *1. **`node_normalize_document`**: Sanitizes whitespace and strips formatting noise.*
  > *2. **`node_extract_qms_entities`**: Prompts the LLM with a strict JSON schema to extract origin, product, lot, site block, and defect attributes.*
  > *3. **`node_assess_risk`**: Evaluates the complaint under ICH Q9 principles, computing clinical severity and regulatory recall risk.*
  > *4. **`node_audit_completeness`**: Audits mandatory 21 CFR Part 211 intake requirements, computing a completeness percentage.*
  > *5. **`node_recommend_root_cause_and_capa`**: Builds a 5-Whys root cause tree and formulates immediate, corrective, and preventive actions.*
  > *6. **`node_detect_duplicates`**: Queries the database to identify matching batch numbers or product lines to catch recurring quality deviations.*
  >
  > *Because each node operates on a shared state and returns updates to that state, the pipeline is fully transparent, modular, and easy to extend."*

#### 5. Groq LLM Integration & Resilient Fallback (6:15 – 7:30)
- **On Screen**: Open `backend/app/agent/llm.py`.
- **Spoken Dialogue**:
  > *"Next, let's examine `llm.py`.*
  > *In accordance with the mandatory stack requirements, we utilize Groq via `langchain_groq.ChatGroq`, specifically configuring the `gemma2-9b-it` model with a low temperature of 0.1 for high-fidelity extraction. We also support `llama-3.3-70b-versatile` for broader QMS context.*
  >
  > *A key engineering highlight here is our resilient fallback architecture: if a developer tests without an API key or experiences network rate limits, the system falls back to a deterministic pharmaceutical regex and heuristic parser. This guarantees zero runtime crashes during evaluations or live presentations while maintaining full compliance."*

#### 6. Database Schema, Audit Trail & Conclusion (7:30 – 8:30)
- **On Screen**: Open `backend/app/models.py`.
- **Spoken Dialogue**:
  > *"Finally, in `models.py`, we define our SQLAlchemy data models.*
  > *The `Complaint` table stores all 16 core QMS fields alongside JSON payloads for risk assessments and CAPA plans.*
  > *Crucially for 21 CFR Part 11 electronic records, we also maintain an `AuditLog` table that logs every complaint creation, status change, and user action with timestamps and actor identities.*
  >
  > *To conclude: this system combines the speed of Groq's `gemma2-9b-it`, the structured reasoning of LangGraph, a responsive React-Redux frontend, and robust pharmaceutical compliance into a production-ready application. Thank you for your time!"*
