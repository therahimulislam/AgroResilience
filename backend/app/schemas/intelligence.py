from typing import List, Optional

from pydantic import BaseModel


class AnalysisRequest(BaseModel):
    latitude: float
    longitude: float
    crop: str
    state: str
    season: str

    crop_year: Optional[int] = None
    area: Optional[float] = None
    annual_rainfall: Optional[float] = None
    fertilizer: Optional[float] = None
    pesticide: Optional[float] = None
    annual_rainfall: Optional[float] = None
    fertilizer: Optional[float] = None
    pesticide: Optional[float] = None


class SatelliteResult(BaseModel):
    ndvi: Optional[float] = None
    ndvi_change_14d: Optional[float] = None
    vegetation_health: Optional[int] = None
    trend: str = "unavailable"


class WeatherResult(BaseModel):
    rainfall_72h: float
    temperature_max: float
    humidity: float
    heavy_rain_risk: float
    climate_risk: int


class SoilResult(BaseModel):
    ph: Optional[float] = None
    nitrogen: Optional[str] = None
    phosphorus: Optional[str] = None
    potassium: Optional[str] = None
    organic_carbon: Optional[str] = None
    moisture: Optional[float] = None
    soil_risk: int = 0


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

    yield_prediction: Optional[float] = None
    ai_advice: Optional[str] = None