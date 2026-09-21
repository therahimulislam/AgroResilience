from pydantic import BaseModel
from typing import List, Optional

class SatelliteResult(BaseModel):
    ndvi: float
    ndvi_change_14d: float
    vegetation_health: int
    trend: str

class WeatherResult(BaseModel):
    rainfall_72h: float
    temperature_max: float
    humidity: float
    heavy_rain_risk: float
    climate_risk: int

class SoilResult(BaseModel):
    ph: float
    nitrogen: str
    phosphorus: str
    potassium: str
    organic_carbon: str
    moisture: float
    soil_risk: int

class RiskResult(BaseModel):
    crop_stress: int
    soil_risk: int
    climate_risk: int
    water_risk: int
    overall_risk: int
    risk_level: str

class CropSuitability(BaseModel):
    crop: str
    suitability: int
    water_requirement: str
    risk: str

class Recommendation(BaseModel):
    title: str
    reason: Optional[str] = None
    priority: str
    related_risk: Optional[str] = None
    data_source: Optional[str] = None

class AnalysisResponse(BaseModel):
    farm_id: str
    satellite: SatelliteResult
    weather: WeatherResult
    soil: SoilResult
    risk: RiskResult
    crop_suitability: List[CropSuitability]
    recommendations: List[Recommendation]
