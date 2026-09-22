from abc import ABC, abstractmethod
from app.schemas.intelligence import SoilResult
from app.core.config import settings

class SoilProvider(ABC):
    @abstractmethod
    def get_soil_data(self, farm_id: str) -> SoilResult:
        pass

class DemoSoilProvider(SoilProvider):
    def get_soil_data(self, farm_id: str) -> SoilResult:
        return SoilResult(
            ph=6.2,
            nitrogen="low",
            phosphorus="medium",
            potassium="high",
            organic_carbon="medium",
            moisture=48.0,
            soil_risk=41
        )

class RealSoilProvider(SoilProvider):
    def get_soil_data(self, farm_id: str) -> SoilResult:
        # TODO: Implement real Soil Health API integration
        pass

def get_soil_provider() -> SoilProvider:
    if settings.PROVIDER_MODE == "demo":
        return DemoSoilProvider()
    return RealSoilProvider()
