"""Pydantic models for request/response validation"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class EmergencyRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    location: Optional[dict] = None


class HealthData(BaseModel):
    heart_rate: Optional[float] = None
    temperature: Optional[float] = None
    user_id: str


class RelationshipAnalysisRequest(BaseModel):
    user_id: int
    relationship_bond_id: int


class PDFGenerationRequest(BaseModel):
    user_id: int
    relationship_bond_id: int


class RelationshipAnalysisResponse(BaseModel):
    relationship_classification: str  # HEALTHY, STRUGGLING, TOXIC, ABUSIVE, etc.
    toxicity_score: int  # 0-100
    attachment_style: str  # Based on Attachment Theory
    communication_patterns: List[str]
    emotional_health_indicators: Dict[str, Any]
    red_flags: List[str]
    green_flags: List[str]
    relationship_stage: str  # Knapp's stages
    love_languages_assessment: Dict[str, Any]
    conflict_resolution_style: str
    codependency_indicators: List[str]
    gaslighting_score: int  # 0-100
    trust_level: int  # 0-100
    recommendations: List[str]
    confidence_score: float