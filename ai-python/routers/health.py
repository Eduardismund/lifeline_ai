"""Health monitoring API endpoints"""

from fastapi import APIRouter
from models import HealthData

router = APIRouter()


@router.post("/health/check")
def check_health(data: HealthData):
    """Check health metrics and return alerts"""
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