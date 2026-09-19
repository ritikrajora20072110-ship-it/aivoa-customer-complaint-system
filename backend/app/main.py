from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import Complaint
from .routers import complaints, agent

# Create DB tables
Base.metadata.create_all(bind=engine)
try:
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE complaints ADD COLUMN qms_ledger VARCHAR(255) DEFAULT 'LEDGER-2026-QA'"))
        conn.commit()
except Exception:
    pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed realistic historical complaints on startup if empty
    db = SessionLocal()
    try:
        count = db.query(Complaint).count()
        if count == 0:
            sample_1 = Complaint(
                complaint_source="Regional Hospital Network",
                customer_name="Metro Valley Health System",
                product_name="Amoxicillin Trihydrate Capsules 500mg (FDF)",
                product_strength_grade="500mg Oral Capsule (USP Grade)",
                batch_number="AMX-2024-089A",
                mfg_date="2024-03-15",
                expiry_date="2026-03-14",
                quantity_affected="500 units",
                site_block="Sterile FDF Formulation Block C",
                impacted_npm="PVC/PVDC Blister Foil Backing",
                complaint_type="Capsule Discoloration",
                complaint_date="2024-09-08",
                defect_summary="Discolored capsule shells in blister cavities.",
                description="Minor speckling observed during routine pharmacy stock intake.",
                initial_severity="Major",
                priority="High",
                status="Under Investigation",
                risk_level="Major",
                completeness_score=90
            )
            sample_2 = Complaint(
                complaint_source="Commercial Wholesaler",
                customer_name="Apex BioPharma Finished Dosage Manufacturing Ltd.",
                product_name="Metformin Hydrochloride API",
                product_strength_grade="Bulk Pharmaceutical Grade (USP/Ph.Eur)",
                batch_number="MET-API-9921",
                mfg_date="2024-01-10",
                expiry_date="2028-01-09",
                quantity_affected="80 kg",
                site_block="API Chemical Synthesis Block 2",
                impacted_npm="Double Polyethylene Drum Liners",
                complaint_type="Foreign Particulate Defect",
                complaint_date="2024-08-15",
                defect_summary="Dark foreign matter detected during raw material testing.",
                description="Dark particulate matter flagged in drum 1 during incoming inspection.",
                initial_severity="Critical",
                priority="Urgent",
                status="Escalated",
                risk_level="Critical",
                completeness_score=95
            )
            db.add(sample_1)
            db.add(sample_2)
            db.commit()
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title="AIVOA AI-Powered Customer Complaint Management System",
    description="QMS Complaint Intake, LangGraph AI Agent & ICH Q9 Risk Assessment for API & FDF Pharma Manufacturing",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router)
app.include_router(agent.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AIVOA Customer Complaint QMS Engine",
        "framework": "LangGraph + FastAPI",
        "database": str(engine.url)
    }
