from abc import ABC, abstractmethod
from app.schemas.intelligence import SatelliteResult
from app.core.config import settings

class SatelliteProvider(ABC):
    @abstractmethod
    def get_satellite_data(self, farm_id: str) -> SatelliteResult:
        pass

class DemoSatelliteProvider(SatelliteProvider):
    def get_satellite_data(self, farm_id: str) -> SatelliteResult:
        return SatelliteResult(
            ndvi=0.58,
            ndvi_change_14d=-8.2,
            vegetation_health=67,
            trend="declining"
        )

class EarthEngineSatelliteProvider(SatelliteProvider):
    def get_satellite_data(self, farm_id: str) -> SatelliteResult:
        # TODO: Implement real Earth Engine integration
        pass

def get_satellite_provider() -> SatelliteProvider:
    if settings.PROVIDER_MODE == "demo":
        return DemoSatelliteProvider()
    return EarthEngineSatelliteProvider()
