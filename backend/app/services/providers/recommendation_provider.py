from abc import ABC, abstractmethod
from typing import List
from app.schemas.intelligence import Recommendation
from app.core.config import settings

class RecommendationProvider(ABC):
    @abstractmethod
    def get_recommendations(self, farm_id: str) -> List[Recommendation]:
        pass

class DemoRecommendationProvider(RecommendationProvider):
    def get_recommendations(self, farm_id: str) -> List[Recommendation]:
        return [
            Recommendation(
                title="Review irrigation timing",
                reason="High moisture variability detected.",
                priority="High"
            ),
            Recommendation(
                title="Inspect field drainage",
                reason="Heavy rain risk is elevated.",
                priority="Medium",
                related_risk="climate_risk"
            ),
            Recommendation(
                title="Monitor vegetation over the next 7 days",
                reason="NDVI trend is declining.",
                priority="Medium",
                data_source="Satellite"
            ),
            Recommendation(
                title="Review possible nutrient limitation",
                reason="Nitrogen is low.",
                priority="High",
                related_risk="soil_risk",
                data_source="Soil"
            )
        ]

class MLRecommendationProvider(RecommendationProvider):
    def get_recommendations(self, farm_id: str) -> List[Recommendation]:
        # TODO: Implement recommendation engine
        pass

def get_recommendation_provider() -> RecommendationProvider:
    if settings.PROVIDER_MODE == "demo":
        return DemoRecommendationProvider()
    return MLRecommendationProvider()
