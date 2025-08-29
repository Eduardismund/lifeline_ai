from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="Lifeline AI")


class EmergencyRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    location: Optional[dict] = None


class HealthData(BaseModel):
    heart_rate: Optional[float] = None
    temperature: Optional[float] = None
    user_id: str


@app.get("/")
def home():
    return {"service": "Lifeline AI", "status": "running"}



@app.post("/health/check")
def check_health(data: HealthData):
    alerts = []
    
    if data.heart_rate:
        if data.heart_rate < 50 or data.heart_rate > 120:
            alerts.append("Abnormal heart rate")
    
    if data.temperature:
        if data.temperature < 36 or data.temperature > 38:
            alerts.append("Abnormal temperature")
    
    return {
        "user_id": data.user_id,
        "alerts": alerts,
        "status": "critical" if alerts else "normal"
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)