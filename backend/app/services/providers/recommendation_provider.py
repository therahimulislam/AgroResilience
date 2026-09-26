from abc import ABC, abstractmethod
from typing import List
from app.schemas.intelligence import Recommendation
from app.core.config import settings
from app.services.providers.demo_utils import _seed, get_crop_water_need, is_season_match

class RecommendationProvider(ABC):
    @abstractmethod
    def get_recommendations(self, farm_id: str, farm=None) -> List[Recommendation]:
        pass

class DemoRecommendationProvider(RecommendationProvider):
    def get_recommendations(self, farm_id: str, farm=None) -> List[Recommendation]:
        crop = getattr(farm, 'current_crop', None) or 'Rice'
        season = getattr(farm, 'season', None) or 'Kharif'
        irrigation = getattr(farm, 'irrigation_type', None) or 'rainfed'
        s = _seed(farm_id, farm)

        water_need = get_crop_water_need(crop)
        season_match = is_season_match(crop, season)

        recs: List[Recommendation] = []

        # Season mismatch warning
        if not season_match:
            recs.append(Recommendation(
                title=f"Consider switching to a {season.lower()}-appropriate crop",
                reason=f"{crop} is not ideal for {season} season. This increases stress and lowers yield potential.",
                priority="High",
                related_risk="crop_stress"
            ))

        # Water management based on crop need and irrigation
        if water_need >= 0.80:
            recs.append(Recommendation(
                title=f"Ensure continuous water availability for {crop}",
                reason=f"{crop} has very high water requirements. Water stress at critical stages can severely impact yield.",
                priority="High",
                related_risk="water_risk",
                data_source="Crop Model"
            ))
        elif water_need <= 0.50 and "flood" in (irrigation or "").lower():
            recs.append(Recommendation(
                title=f"Reduce irrigation frequency for {crop}",
                reason=f"{crop} is drought-tolerant. Over-irrigation can cause waterlogging and nutrient leaching.",
                priority="Medium",
                related_risk="soil_risk",
                data_source="Soil"
            ))

        # Irrigation type recommendation
        if "rainfed" in (irrigation or "").lower() and water_need >= 0.70:
            recs.append(Recommendation(
                title="Install supplemental irrigation",
                reason=f"{crop} has high water needs and relies on rainfall alone. A drip or sprinkler system can increase yield by 30–50%.",
                priority="High",
                related_risk="water_risk"
            ))

        # Soil nutrient (seeded)
        soil_seed = _seed(farm_id + "N", farm)
        if soil_seed < 0.35:
            recs.append(Recommendation(
                title=f"Apply nitrogen-rich fertilizer before {crop} flowering",
                reason="Soil nitrogen is low. This limits protein synthesis and reduces grain filling.",
                priority="High",
                related_risk="soil_risk",
                data_source="Soil"
            ))

        # NDVI trend (seeded)
        sat_seed = _seed(farm_id + "ndvi_trend", farm)
        if sat_seed < 0.5:
            recs.append(Recommendation(
                title="Monitor vegetation stress over next 7 days",
                reason=f"Satellite NDVI trend is declining in the {crop} field. Early detection of disease or pest damage is critical.",
                priority="Medium",
                data_source="Satellite"
            ))
        else:
            recs.append(Recommendation(
                title="Vegetation health is improving — maintain current practices",
                reason=f"NDVI data shows a positive trend for {crop}. Continue current irrigation and nutrient management.",
                priority="Low",
                data_source="Satellite"
            ))

        # Generic drainage if heavy rain expected
        if s > 0.55:
            recs.append(Recommendation(
                title="Inspect and clear field drainage channels",
                reason="Heavy rain events are expected in the coming days. Poor drainage can cause root rot and soil compaction.",
                priority="Medium",
                related_risk="climate_risk"
            ))

        return recs[:5]

class MLRecommendationProvider(RecommendationProvider):
    def get_recommendations(self, farm_id: str, farm=None) -> List[Recommendation]:
        pass  # TODO: Real ML inference

def get_recommendation_provider() -> RecommendationProvider:
    if settings.PROVIDER_MODE == "demo":
        return DemoRecommendationProvider()
    return MLRecommendationProvider()
