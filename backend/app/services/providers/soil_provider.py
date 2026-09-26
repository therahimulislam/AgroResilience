from abc import ABC, abstractmethod
from app.schemas.intelligence import SoilResult
from app.core.config import settings
from app.services.providers.demo_utils import _seed, _jitter, get_crop_water_need

NUTRIENT_LEVELS = ["low", "medium", "high"]

def _nutrient(s: float) -> str:
    if s < 0.33: return "low"
    elif s < 0.66: return "medium"
    else: return "high"

class SoilProvider(ABC):
    @abstractmethod
    def get_soil_data(self, farm_id: str, farm=None) -> SoilResult:
        pass

class DemoSoilProvider(SoilProvider):
    def get_soil_data(self, farm_id: str, farm=None) -> SoilResult:
        s = _seed(farm_id, farm)
        crop = getattr(farm, 'current_crop', None) or 'Rice'
        irrigation = getattr(farm, 'irrigation_type', None) or 'rainfed'

        water_need = get_crop_water_need(crop)

        # pH varies by location seed — tropical soils slightly acidic
        ph = round(_jitter(6.0, s * 0.8, 0.8), 1)
        ph = max(4.5, min(8.5, ph))

        # Nutrients vary deterministically per farm
        s2 = _seed(farm_id + "N", farm)
        s3 = _seed(farm_id + "P", farm)
        s4 = _seed(farm_id + "K", farm)
        s5 = _seed(farm_id + "OC", farm)

        nitrogen = _nutrient(s2)
        phosphorus = _nutrient(s3)
        potassium = _nutrient(s4)
        organic_carbon = _nutrient(s5)

        # Moisture — higher for irrigated farms and high water-need crops
        base_moisture = 40.0 + water_need * 20.0
        if "drip" in (irrigation or "").lower():
            base_moisture += 10
        elif "flood" in (irrigation or "").lower():
            base_moisture += 18
        moisture = round(_jitter(base_moisture, s * 0.9, 12), 1)
        moisture = max(10.0, min(95.0, moisture))

        # Soil risk: penalize low nitrogen and extreme pH
        soil_risk = 30
        if nitrogen == "low": soil_risk += 20
        if phosphorus == "low": soil_risk += 10
        if ph < 5.5 or ph > 8.0: soil_risk += 15
        soil_risk += int((s - 0.5) * 20)
        soil_risk = max(10, min(90, soil_risk))

        return SoilResult(
            ph=ph,
            nitrogen=nitrogen,
            phosphorus=phosphorus,
            potassium=potassium,
            organic_carbon=organic_carbon,
            moisture=moisture,
            soil_risk=soil_risk,
        )

class RealSoilProvider(SoilProvider):
    def get_soil_data(self, farm_id: str, farm=None) -> SoilResult:
        pass  # TODO: Implement real Soil Health API

def get_soil_provider() -> SoilProvider:
    if settings.PROVIDER_MODE == "demo":
        return DemoSoilProvider()
    return RealSoilProvider()
