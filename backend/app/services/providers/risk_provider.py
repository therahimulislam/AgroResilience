from abc import ABC, abstractmethod
from app.schemas.intelligence import RiskResult
from app.core.config import settings
from app.services.providers.demo_utils import _seed, get_crop_water_need, get_crop_drought_tolerance, is_season_match

class RiskProvider(ABC):
    @abstractmethod
    def get_risk_assessment(self, farm_id: str, farm=None) -> RiskResult:
        pass

class DemoRiskProvider(RiskProvider):
    def get_risk_assessment(self, farm_id: str, farm=None) -> RiskResult:
        s = _seed(farm_id, farm)
        crop = getattr(farm, 'current_crop', None) or 'Rice'
        season = getattr(farm, 'season', None) or 'Kharif'
        irrigation = getattr(farm, 'irrigation_type', None) or 'rainfed'

        water_need = get_crop_water_need(crop)
        drought_tol = get_crop_drought_tolerance(crop)
        season_match = is_season_match(crop, season)

        # Crop stress: high water-need crops in drought-prone area = more stressed
        crop_stress = int(50 + (water_need - 0.5) * 40 + (s - 0.5) * 20)
        if not season_match:
            crop_stress = min(95, crop_stress + 15)

        # Soil risk: use seed variation
        soil_risk = int(35 + (s * 0.6 - 0.3) * 50)

        # Climate risk: bad if wrong season
        climate_risk = int(45 + (1 - drought_tol) * 30 + (s * 0.5 - 0.25) * 30)
        if not season_match:
            climate_risk = min(95, climate_risk + 20)

        # Water risk: rainfed farms are riskier than irrigated
        water_risk = int(40 + water_need * 30 + (s - 0.5) * 20)
        if "drip" in (irrigation or "").lower():
            water_risk = max(10, water_risk - 20)
        elif "flood" in (irrigation or "").lower():
            water_risk = max(15, water_risk - 10)

        # Clamp all to 10–95
        crop_stress = max(10, min(95, crop_stress))
        soil_risk = max(10, min(90, soil_risk))
        climate_risk = max(10, min(95, climate_risk))
        water_risk = max(10, min(95, water_risk))

        overall_risk = int((crop_stress * 0.3 + soil_risk * 0.2 + climate_risk * 0.3 + water_risk * 0.2))
        overall_risk = max(10, min(95, overall_risk))

        if overall_risk < 30: risk_level = "Low"
        elif overall_risk < 55: risk_level = "Moderate"
        elif overall_risk < 75: risk_level = "High"
        else: risk_level = "Critical"

        return RiskResult(
            crop_stress=crop_stress,
            soil_risk=soil_risk,
            climate_risk=climate_risk,
            water_risk=water_risk,
            overall_risk=overall_risk,
            risk_level=risk_level,
        )

class MLRiskProvider(RiskProvider):
    def get_risk_assessment(self, farm_id: str, farm=None) -> RiskResult:
        pass  # TODO: Real ML model inference

def get_risk_provider() -> RiskProvider:
    if settings.PROVIDER_MODE == "demo":
        return DemoRiskProvider()
    return MLRiskProvider()
