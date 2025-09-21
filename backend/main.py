"""
GlobalMedTriage FastAPI backend entrypoint.
- Orchestrates Coral Protocol agents
- Provides WebSocket for real-time agent communication
- JWT authentication
- API endpoints for triage, logs, and protocols
"""
import os
from fastapi import FastAPI, WebSocket, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from dotenv import load_dotenv
# Support running both as a package (backend.main) and as a script (python backend/main.py)
try:
    from .utils import redact_pii  # type: ignore
except ImportError:  # pragma: no cover
    from utils import redact_pii  # type: ignore

load_dotenv()

app = FastAPI(title="GlobalMedTriage API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

JWT_SECRET = os.getenv("JWT_SECRET", "changeme")
ALGORITHM = "HS256"

# --- Auth utils ---
def verify_jwt(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/api/health")
def health():
    return {"status": "ok"}

# --- Persistence helper for triage_logs ---
import json
import asyncpg
from datetime import datetime

async def save_triage_log(*, user_id: int | None, language: str | None, symptoms: str, esi_level: int | None, agent_responses: dict):
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        return
    try:
        conn = await asyncpg.connect(db_url)
    except Exception:
        return
    try:
        await conn.execute(
            """
            INSERT INTO triage_logs (user_id, language, symptoms, esi_level, agent_responses)
            VALUES ($1, $2, $3, $4, $5)
            """,
            user_id,
            language,
            redact_pii(symptoms) if symptoms else None,
            esi_level if esi_level is not None else None,
            json.dumps(agent_responses),
        )
    except Exception:
        pass
    finally:
        await conn.close()

# --- WebSocket for agent orchestration ---
@app.websocket("/ws/triage")
async def ws_triage(websocket: WebSocket):
    # Support both package (backend.agent_orchestrator) and script execution contexts
    try:
        from .agent_orchestrator import run_emergency_flow  # type: ignore
    except ImportError:  # pragma: no cover
        from agent_orchestrator import run_emergency_flow  # type: ignore
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        import base64
        audio_b64 = data.get("audio")
        if not audio_b64:
            await websocket.send_json({"error": "No audio provided."})
            continue
        try:
            audio_bytes = base64.b64decode(audio_b64.split(",")[-1])
            result = await run_emergency_flow(audio_bytes)
            # Persist triage log (best effort, non-blocking critical path)
            try:
                voice_text = result.get("voice", {}).get("text", "")
                language = result.get("voice", {}).get("language", "en")
                esi_level = result.get("triage", {}).get("esi_level")
                await save_triage_log(user_id=None, language=language, symptoms=voice_text, esi_level=esi_level, agent_responses=result)
            except Exception:
                pass
            await websocket.send_json(result)
        except Exception as e:
            await websocket.send_json({"error": str(e)})


# --- Production REST API endpoints ---
from pydantic import BaseModel
from typing import List, Optional
import asyncpg

# Database connection utility
async def get_db():
    db_url = os.getenv("DATABASE_URL")
    conn = await asyncpg.connect(db_url)
    try:
        yield conn
    finally:
        await conn.close()

# --- Models ---
class TriageRequest(BaseModel):
    symptoms: str
    language: Optional[str] = "en"

class TriageLog(BaseModel):
    user_id: Optional[int]
    language: Optional[str]
    symptoms: str
    esi_level: int
    agent_responses: dict

# --- Pydantic Models for all tables ---
from datetime import datetime, date

class UserBase(BaseModel):
    username: str
    email: str
    role: str

class UserCreate(UserBase):
    password_hash: str

class User(UserBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class PatientBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class MedicalStaffBase(BaseModel):
    user_id: int | None = None
    staff_type: str
    license_number: str | None = None
    department: str | None = None

class MedicalStaffCreate(MedicalStaffBase):
    pass

class MedicalStaff(MedicalStaffBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class InsuranceBase(BaseModel):
    patient_id: int
    provider: str
    policy_number: str
    valid_until: date | None = None

class InsuranceCreate(InsuranceBase):
    pass

class Insurance(InsuranceBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class TriageRecordBase(BaseModel):
    patient_id: int
    staff_id: int | None = None
    chief_complaint: str | None = None
    triage_level: str | None = None
    notes: str | None = None

class TriageRecordCreate(TriageRecordBase):
    pass

class TriageRecord(TriageRecordBase):
    id: int
    triage_time: datetime
    class Config:
        orm_mode = True

class VitalSignBase(BaseModel):
    triage_record_id: int
    heart_rate: int | None = None
    blood_pressure_systolic: int | None = None
    blood_pressure_diastolic: int | None = None
    respiratory_rate: int | None = None
    spo2: int | None = None
    temperature_c: float | None = None
    stress_level: str | None = None

class VitalSignCreate(VitalSignBase):
    pass

class VitalSign(VitalSignBase):
    id: int
    measured_at: datetime
    class Config:
        orm_mode = True

class AuditLogBase(BaseModel):
    user_id: int | None = None
    action: str
    details: str | None = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLog(AuditLogBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class AgentLogBase(BaseModel):
    agent_name: str
    user_id: int | None = None
    patient_id: int | None = None
    action: str | None = None
    message: str | None = None

class AgentLogCreate(AgentLogBase):
    pass

class AgentLog(AgentLogBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

# --- Triage endpoint ---
@app.post("/api/triage")
async def triage(request: TriageRequest):
    # Support both package (backend.agent_orchestrator) and script execution contexts
    try:
        from .agent_orchestrator import run_emergency_flow  # type: ignore
    except ImportError:  # pragma: no cover
        from agent_orchestrator import run_emergency_flow  # type: ignore
    voice_result = {"text": request.symptoms, "language": request.language, "panic": False}
    from agents import medical_triage_agent, translation_coordinator_agent, medical_office_triage_voice_agent, vital_signs_monitor_agent, insurance_verification_agent
    triage_result = await medical_triage_agent.analyze_symptoms(request.symptoms, language=request.language)
    translation = await translation_coordinator_agent.translate_medical(f"ESI Level: {triage_result['esi_level']}", request.language)
    history = {"history": "No audio provided."}
    vitals = {"stress_level": "unknown", "heart_rate": 0}
    dispatch = {"status": "pending", "location": "unknown"}
    insurance = {"verified": False, "provider": "Unknown"}
    aggregated = {
        "voice": voice_result,
        "triage": triage_result,
        "translation": translation,
        "history": history,
        "vitals": vitals,
        "dispatch": dispatch,
        "insurance": insurance
    }
    # Persist REST triage as well (best effort)
    try:
        await save_triage_log(user_id=None, language=request.language, symptoms=request.symptoms, esi_level=triage_result.get("esi_level"), agent_responses=aggregated)
    except Exception:
        pass
    return aggregated

# --- Triage logs endpoints ---
@app.get("/api/logs")
async def get_logs():
    import asyncpg
    db_url = os.getenv("DATABASE_URL")
    conn = await asyncpg.connect(db_url)
    try:
        rows = await conn.fetch("SELECT * FROM triage_logs ORDER BY created_at DESC LIMIT 100")
        logs = [dict(row) for row in rows]
        return {"logs": logs}
    finally:
        await conn.close()

@app.post("/api/logs")
async def add_log(log: TriageLog):
    import asyncpg
    db_url = os.getenv("DATABASE_URL")
    conn = await asyncpg.connect(db_url)
    try:
        await conn.execute(
            """
            INSERT INTO triage_logs (user_id, language, symptoms, esi_level, agent_responses)
            VALUES ($1, $2, $3, $4, $5)
            """,
            log.user_id, log.language, log.symptoms, log.esi_level, log.agent_responses
        )
        return {"status": "ok"}
    finally:
        await conn.close()

# --- Protocols endpoint ---
@app.get("/api/protocols")
async def get_protocols():
    import asyncpg
    db_url = os.getenv("DATABASE_URL")
    conn = await asyncpg.connect(db_url)
    try:
        rows = await conn.fetch("SELECT id, name, description, steps FROM protocols ORDER BY id")
        protocols = [dict(row) for row in rows]
        return {"protocols": protocols}
    finally:
        await conn.close()

# --- Users CRUD endpoints ---
from fastapi import Path

@app.post("/api/users", response_model=User)
async def create_user(user: UserCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        INSERT INTO users (username, password_hash, email, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, role, created_at
        """,
        user.username, user.password_hash, user.email, user.role
    )
    return User(**row)

@app.get("/api/users", response_model=List[User])
async def list_users(db=Depends(get_db)):
    rows = await db.fetch("SELECT id, username, email, role, created_at FROM users ORDER BY id")
    return [User(**row) for row in rows]

@app.get("/api/users/{user_id}", response_model=User)
async def get_user(user_id: int = Path(..., gt=0), db=Depends(get_db)):
    row = await db.fetchrow("SELECT id, username, email, role, created_at FROM users WHERE id=$1", user_id)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**row)

@app.put("/api/users/{user_id}", response_model=User)
async def update_user(user_id: int, user: UserCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        UPDATE users SET username=$1, password_hash=$2, email=$3, role=$4
        WHERE id=$5 RETURNING id, username, email, role, created_at
        """,
        user.username, user.password_hash, user.email, user.role, user_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**row)

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: int, db=Depends(get_db)):
    result = await db.execute("DELETE FROM users WHERE id=$1", user_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}

# --- Patients CRUD endpoints ---
@app.post("/api/patients", response_model=Patient)
async def create_patient(patient: PatientCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, created_at
        """,
        patient.first_name, patient.last_name, patient.date_of_birth, patient.gender, patient.phone, patient.email, patient.address, patient.emergency_contact_name, patient.emergency_contact_phone
    )
    return Patient(**row)

@app.get("/api/patients", response_model=List[Patient])
async def list_patients(db=Depends(get_db)):
    rows = await db.fetch("SELECT id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, created_at FROM patients ORDER BY id")
    return [Patient(**row) for row in rows]

@app.get("/api/patients/{patient_id}", response_model=Patient)
async def get_patient(patient_id: int = Path(..., gt=0), db=Depends(get_db)):
    row = await db.fetchrow("SELECT id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, created_at FROM patients WHERE id=$1", patient_id)
    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")
    return Patient(**row)

@app.put("/api/patients/{patient_id}", response_model=Patient)
async def update_patient(patient_id: int, patient: PatientCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        UPDATE patients SET first_name=$1, last_name=$2, date_of_birth=$3, gender=$4, phone=$5, email=$6, address=$7, emergency_contact_name=$8, emergency_contact_phone=$9
        WHERE id=$10 RETURNING id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, created_at
        """,
        patient.first_name, patient.last_name, patient.date_of_birth, patient.gender, patient.phone, patient.email, patient.address, patient.emergency_contact_name, patient.emergency_contact_phone, patient_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="Patient not found")
    return Patient(**row)

@app.delete("/api/patients/{patient_id}")
async def delete_patient(patient_id: int, db=Depends(get_db)):
    result = await db.execute("DELETE FROM patients WHERE id=$1", patient_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"ok": True}

# --- Medical Staff CRUD endpoints ---
@app.post("/api/medical_staff", response_model=MedicalStaff)
async def create_medical_staff(staff: MedicalStaffCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        INSERT INTO medical_staff (user_id, staff_type, license_number, department)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, staff_type, license_number, department, created_at
        """,
        staff.user_id, staff.staff_type, staff.license_number, staff.department
    )
    return MedicalStaff(**row)

@app.get("/api/medical_staff", response_model=List[MedicalStaff])
async def list_medical_staff(db=Depends(get_db)):
    rows = await db.fetch("SELECT id, user_id, staff_type, license_number, department, created_at FROM medical_staff ORDER BY id")
    return [MedicalStaff(**row) for row in rows]

@app.get("/api/medical_staff/{staff_id}", response_model=MedicalStaff)
async def get_medical_staff(staff_id: int = Path(..., gt=0), db=Depends(get_db)):
    row = await db.fetchrow("SELECT id, user_id, staff_type, license_number, department, created_at FROM medical_staff WHERE id=$1", staff_id)
    if not row:
        raise HTTPException(status_code=404, detail="Medical staff not found")
    return MedicalStaff(**row)

@app.put("/api/medical_staff/{staff_id}", response_model=MedicalStaff)
async def update_medical_staff(staff_id: int, staff: MedicalStaffCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        UPDATE medical_staff SET user_id=$1, staff_type=$2, license_number=$3, department=$4
        WHERE id=$5 RETURNING id, user_id, staff_type, license_number, department, created_at
        """,
        staff.user_id, staff.staff_type, staff.license_number, staff.department, staff_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="Medical staff not found")
    return MedicalStaff(**row)

@app.delete("/api/medical_staff/{staff_id}")
async def delete_medical_staff(staff_id: int, db=Depends(get_db)):
    result = await db.execute("DELETE FROM medical_staff WHERE id=$1", staff_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Medical staff not found")
    return {"ok": True}

# --- Insurance CRUD endpoints ---
@app.post("/api/insurance", response_model=Insurance)
async def create_insurance(insurance: InsuranceCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        INSERT INTO insurance (patient_id, provider, policy_number, valid_until)
        VALUES ($1, $2, $3, $4)
        RETURNING id, patient_id, provider, policy_number, valid_until, created_at
        """,
        insurance.patient_id, insurance.provider, insurance.policy_number, insurance.valid_until
    )
    return Insurance(**row)

@app.get("/api/insurance", response_model=List[Insurance])
async def list_insurance(db=Depends(get_db)):
    rows = await db.fetch("SELECT id, patient_id, provider, policy_number, valid_until, created_at FROM insurance ORDER BY id")
    return [Insurance(**row) for row in rows]

@app.get("/api/insurance/{insurance_id}", response_model=Insurance)
async def get_insurance(insurance_id: int = Path(..., gt=0), db=Depends(get_db)):
    row = await db.fetchrow("SELECT id, patient_id, provider, policy_number, valid_until, created_at FROM insurance WHERE id=$1", insurance_id)
    if not row:
        raise HTTPException(status_code=404, detail="Insurance not found")
    return Insurance(**row)

@app.put("/api/insurance/{insurance_id}", response_model=Insurance)
async def update_insurance(insurance_id: int, insurance: InsuranceCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        UPDATE insurance SET patient_id=$1, provider=$2, policy_number=$3, valid_until=$4
        WHERE id=$5 RETURNING id, patient_id, provider, policy_number, valid_until, created_at
        """,
        insurance.patient_id, insurance.provider, insurance.policy_number, insurance.valid_until, insurance_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="Insurance not found")
    return Insurance(**row)

@app.delete("/api/insurance/{insurance_id}")
async def delete_insurance(insurance_id: int, db=Depends(get_db)):
    result = await db.execute("DELETE FROM insurance WHERE id=$1", insurance_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Insurance not found")
    return {"ok": True}

# --- Triage Records CRUD endpoints ---
@app.post("/api/triage_records", response_model=TriageRecord)
async def create_triage_record(record: TriageRecordCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        INSERT INTO triage_records (patient_id, staff_id, chief_complaint, triage_level, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, patient_id, staff_id, triage_time, chief_complaint, triage_level, notes
        """,
        record.patient_id, record.staff_id, record.chief_complaint, record.triage_level, record.notes
    )
    return TriageRecord(**row)

@app.get("/api/triage_records", response_model=List[TriageRecord])
async def list_triage_records(db=Depends(get_db)):
    rows = await db.fetch("SELECT id, patient_id, staff_id, triage_time, chief_complaint, triage_level, notes FROM triage_records ORDER BY id")
    return [TriageRecord(**row) for row in rows]

@app.get("/api/triage_records/{record_id}", response_model=TriageRecord)
async def get_triage_record(record_id: int = Path(..., gt=0), db=Depends(get_db)):
    row = await db.fetchrow("SELECT id, patient_id, staff_id, triage_time, chief_complaint, triage_level, notes FROM triage_records WHERE id=$1", record_id)
    if not row:
        raise HTTPException(status_code=404, detail="Triage record not found")
    return TriageRecord(**row)

@app.put("/api/triage_records/{record_id}", response_model=TriageRecord)
async def update_triage_record(record_id: int, record: TriageRecordCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        UPDATE triage_records SET patient_id=$1, staff_id=$2, chief_complaint=$3, triage_level=$4, notes=$5
        WHERE id=$6 RETURNING id, patient_id, staff_id, triage_time, chief_complaint, triage_level, notes
        """,
        record.patient_id, record.staff_id, record.chief_complaint, record.triage_level, record.notes, record_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="Triage record not found")
    return TriageRecord(**row)

@app.delete("/api/triage_records/{record_id}")
async def delete_triage_record(record_id: int, db=Depends(get_db)):
    result = await db.execute("DELETE FROM triage_records WHERE id=$1", record_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Triage record not found")
    return {"ok": True}

# --- Vital Signs CRUD endpoints ---
@app.post("/api/vital_signs", response_model=VitalSign)
async def create_vital_sign(vital: VitalSignCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        INSERT INTO vital_signs (triage_record_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, respiratory_rate, spo2, temperature_c, stress_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, triage_record_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, respiratory_rate, spo2, temperature_c, stress_level, measured_at
        """,
        vital.triage_record_id, vital.heart_rate, vital.blood_pressure_systolic, vital.blood_pressure_diastolic, vital.respiratory_rate, vital.spo2, vital.temperature_c, vital.stress_level
    )
    return VitalSign(**row)

@app.get("/api/vital_signs", response_model=List[VitalSign])
async def list_vital_signs(db=Depends(get_db)):
    rows = await db.fetch("SELECT id, triage_record_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, respiratory_rate, spo2, temperature_c, stress_level, measured_at FROM vital_signs ORDER BY id")
    return [VitalSign(**row) for row in rows]

@app.get("/api/vital_signs/{vital_id}", response_model=VitalSign)
async def get_vital_sign(vital_id: int = Path(..., gt=0), db=Depends(get_db)):
    row = await db.fetchrow("SELECT id, triage_record_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, respiratory_rate, spo2, temperature_c, stress_level, measured_at FROM vital_signs WHERE id=$1", vital_id)
    if not row:
        raise HTTPException(status_code=404, detail="Vital sign not found")
    return VitalSign(**row)

@app.put("/api/vital_signs/{vital_id}", response_model=VitalSign)
async def update_vital_sign(vital_id: int, vital: VitalSignCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        UPDATE vital_signs SET triage_record_id=$1, heart_rate=$2, blood_pressure_systolic=$3, blood_pressure_diastolic=$4, respiratory_rate=$5, spo2=$6, temperature_c=$7, stress_level=$8
        WHERE id=$9 RETURNING id, triage_record_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, respiratory_rate, spo2, temperature_c, stress_level, measured_at
        """,
        vital.triage_record_id, vital.heart_rate, vital.blood_pressure_systolic, vital.blood_pressure_diastolic, vital.respiratory_rate, vital.spo2, vital.temperature_c, vital.stress_level, vital_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="Vital sign not found")
    return VitalSign(**row)

@app.delete("/api/vital_signs/{vital_id}")
async def delete_vital_sign(vital_id: int, db=Depends(get_db)):
    result = await db.execute("DELETE FROM vital_signs WHERE id=$1", vital_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Vital sign not found")
    return {"ok": True}

# --- Audit Logs CRUD endpoints ---
@app.post("/api/audit_logs", response_model=AuditLog)
async def create_audit_log(log: AuditLogCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        INSERT INTO audit_logs (user_id, action, details)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, action, details, created_at
        """,
        log.user_id, log.action, log.details
    )
    return AuditLog(**row)

@app.get("/api/audit_logs", response_model=List[AuditLog])
async def list_audit_logs(db=Depends(get_db)):
    rows = await db.fetch("SELECT id, user_id, action, details, created_at FROM audit_logs ORDER BY id")
    return [AuditLog(**row) for row in rows]

@app.get("/api/audit_logs/{log_id}", response_model=AuditLog)
async def get_audit_log(log_id: int = Path(..., gt=0), db=Depends(get_db)):
    row = await db.fetchrow("SELECT id, user_id, action, details, created_at FROM audit_logs WHERE id=$1", log_id)
    if not row:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return AuditLog(**row)

@app.put("/api/audit_logs/{log_id}", response_model=AuditLog)
async def update_audit_log(log_id: int, log: AuditLogCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        UPDATE audit_logs SET user_id=$1, action=$2, details=$3
        WHERE id=$4 RETURNING id, user_id, action, details, created_at
        """,
        log.user_id, log.action, log.details, log_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="Audit log not found")
    return AuditLog(**row)

@app.delete("/api/audit_logs/{log_id}")
async def delete_audit_log(log_id: int, db=Depends(get_db)):
    result = await db.execute("DELETE FROM audit_logs WHERE id=$1", log_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Audit log not found")
    return {"ok": True}

# --- Agent Logs CRUD endpoints ---
@app.post("/api/agent_logs", response_model=AgentLog)
async def create_agent_log(log: AgentLogCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        INSERT INTO agent_logs (agent_name, user_id, patient_id, action, message)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, agent_name, user_id, patient_id, action, message, created_at
        """,
        log.agent_name, log.user_id, log.patient_id, log.action, log.message
    )
    return AgentLog(**row)

@app.get("/api/agent_logs", response_model=List[AgentLog])
async def list_agent_logs(db=Depends(get_db)):
    rows = await db.fetch("SELECT id, agent_name, user_id, patient_id, action, message, created_at FROM agent_logs ORDER BY id")
    return [AgentLog(**row) for row in rows]

@app.get("/api/agent_logs/{log_id}", response_model=AgentLog)
async def get_agent_log(log_id: int = Path(..., gt=0), db=Depends(get_db)):
    row = await db.fetchrow("SELECT id, agent_name, user_id, patient_id, action, message, created_at FROM agent_logs WHERE id=$1", log_id)
    if not row:
        raise HTTPException(status_code=404, detail="Agent log not found")
    return AgentLog(**row)

@app.put("/api/agent_logs/{log_id}", response_model=AgentLog)
async def update_agent_log(log_id: int, log: AgentLogCreate, db=Depends(get_db)):
    row = await db.fetchrow(
        """
        UPDATE agent_logs SET agent_name=$1, user_id=$2, patient_id=$3, action=$4, message=$5
        WHERE id=$6 RETURNING id, agent_name, user_id, patient_id, action, message, created_at
        """,
        log.agent_name, log.user_id, log.patient_id, log.action, log.message, log_id
    )
    if not row:
        raise HTTPException(status_code=404, detail="Agent log not found")
    return AgentLog(**row)

@app.delete("/api/agent_logs/{log_id}")
async def delete_agent_log(log_id: int, db=Depends(get_db)):
    result = await db.execute("DELETE FROM agent_logs WHERE id=$1", log_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Agent log not found")
    return {"ok": True}

# --- Mock ML API endpoint for vital sign analysis (free, local) ---
from fastapi import UploadFile, File
import random

@app.post("/mock-ml-api")
async def mock_ml_api(file: UploadFile = File(...)):
    # Simulate analysis: return random or fixed values
    stress_levels = ["low", "medium", "high"]
    return {
        "stress_level": random.choice(stress_levels),
        "heart_rate": random.randint(60, 100)
    }

# Added fallback runner so `python main.py` works if used outside Dockerfile CMD
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
