from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
import time
import random
from decimal import Decimal

app = FastAPI(title="Clinic AI Triage Service", version="1.0.0")

class TriageInput(BaseModel):
    chiefComplaintText: str
    ageInYears: int
    vitals: Dict[str, float] = {}
    complaintTypes: List[str] = []

class TriageSuggestionResult(BaseModel):
    suggestedAcuity: str
    confidence: float
    explanation: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-triage"}

@app.post("/predict", response_model=TriageSuggestionResult)
async def predict_triage(input_data: TriageInput):
    """
    Enterprise Triage Analysis Logic
    Levels: 1 (Resuscitation), 2 (Emergent), 3 (Urgent), 4 (Less Urgent), 5 (Non-Urgent)
    """
    # Simulate processing time
    time.sleep(0.5)
    
    complaint = input_data.chiefComplaintText.lower()
    vitals = input_data.vitals
    
    # 1. Critical Rule Check (Level 1)
    if "ngừng tim" in complaint or "khó thở" in complaint or vitals.get("spo2", 100) < 90:
        return TriageSuggestionResult(
            suggestedAcuity="1",
            confidence=0.98,
            explanation="Phát hiện dấu hiệu đe dọa tính mạng (đường thở/hô hấp/tuần hoàn)."
        )

    # 2. Emergent Rule Check (Level 2)
    if "đau ngực" in complaint or "liệt" in complaint or vitals.get("temp", 37) > 39.5:
        return TriageSuggestionResult(
            suggestedAcuity="2",
            confidence=0.92,
            explanation="Triệu chứng nguy cơ cao cần can thiệp y tế khẩn cấp trong vòng 15 phút."
        )

    # 3. Urgent (Level 3)
    if vitals.get("sys_bp", 120) > 160 or "đau bụng dữ dội" in complaint:
        return TriageSuggestionResult(
            suggestedAcuity="3",
            confidence=0.85,
            explanation="Tình trạng ổn định nhưng cần xét nghiệm và chẩn đoán hình ảnh phức tạp."
        )

    # 4. Default to Level 4/5 for mild symptoms
    if "ho" in complaint or "sổ mũi" in complaint or "đau họng" in complaint:
        return TriageSuggestionResult(
            suggestedAcuity="5",
            confidence=0.95,
            explanation="Triệu chứng nhẹ, phù hợp chăm sóc sức khỏe ban đầu."
        )

    # 5. Smart Default
    return TriageSuggestionResult(
        suggestedAcuity="4",
        confidence=0.75,
        explanation="Dựa trên phân tích triệu chứng tổng quát, đề xuất mức độ ưu tiên trung bình."
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
