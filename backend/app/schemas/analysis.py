from typing import List, Optional
from pydantic import BaseModel

class FarmSummary(BaseModel):
    id: str
    name: str
    area_acres: Optional[float] = None
    current_crop: Optional[str] = None
    season: Optional[str] = None
    irrigation_type: Optional[str] = None

class AnalysisFarmPayload(BaseModel):
    farm: FarmSummary
    satellite: dict
    weather: dict
    soil: dict
    risk: dict
    crop_suitability: List[dict]
    recommendations: List[dict]
    data_mode: str  # "demo" or "live"
    analyzed_at: str
