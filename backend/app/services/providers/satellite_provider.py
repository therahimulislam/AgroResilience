from abc import ABC, abstractmethod
from app.schemas.intelligence import SatelliteResult
from app.core.config import settings
from app.services.providers.demo_utils import _seed, _jitter, get_crop_water_need

class SatelliteProvider(ABC):
    @abstractmethod
    def get_satellite_data(self, farm_id: str, farm=None) -> SatelliteResult:
        pass

class DemoSatelliteProvider(SatelliteProvider):
    def get_satellite_data(self, farm_id: str, farm=None) -> SatelliteResult:
        s = _seed(farm_id, farm)
        crop = getattr(farm, 'current_crop', None) or 'Rice'
        water_need = get_crop_water_need(crop)

        # High water-need crops tend to have better NDVI in monsoon areas
        base_ndvi = 0.45 + water_need * 0.25
        ndvi = round(_jitter(base_ndvi, s, 0.12), 2)
        ndvi = max(0.18, min(0.92, ndvi))

        # NDVI change — varies by seed
        ndvi_change = round((s - 0.5) * 20, 1)  # -10 to +10

        # Vegetation health as percentage
        veg_health = int(ndvi * 100 + (s - 0.5) * 15)
        veg_health = max(20, min(95, veg_health))

        trend = "improving" if ndvi_change > 2 else "declining" if ndvi_change < -2 else "stable"

        return SatelliteResult(
            ndvi=ndvi,
            ndvi_change_14d=ndvi_change,
            vegetation_health=veg_health,
            trend=trend,
        )

class EarthEngineSatelliteProvider(SatelliteProvider):
    def get_satellite_data(self, farm_id: str, farm=None) -> SatelliteResult:
        pass  # TODO: Real Earth Engine integration

def get_satellite_provider() -> SatelliteProvider:
    if settings.PROVIDER_MODE == "demo":
        return DemoSatelliteProvider()
    return EarthEngineSatelliteProvider()
