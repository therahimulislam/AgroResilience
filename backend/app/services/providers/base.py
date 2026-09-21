from abc import ABC, abstractmethod
from typing import List
from app.schemas.intelligence import (
    SatelliteResult,
    WeatherResult,
    SoilResult,
    RiskResult,
    CropSuitability,
    Recommendation,
)

class IntelligenceProvider(ABC):
    @abstractmethod
    def get_satellite_data(self, farm_id: str) -> SatelliteResult:
        pass

    @abstractmethod
    def get_weather_data(self, farm_id: str) -> WeatherResult:
        pass

    @abstractmethod
    def get_soil_data(self, farm_id: str) -> SoilResult:
        pass

    @abstractmethod
    def get_risk_assessment(self, farm_id: str) -> RiskResult:
        pass

    @abstractmethod
    def get_crop_suitability(self, farm_id: str) -> List[CropSuitability]:
        pass

    @abstractmethod
    def get_recommendations(self, farm_id: str) -> List[Recommendation]:
        pass
