from typing import List
from app.services.providers.base import IntelligenceProvider
from app.schemas.intelligence import (
    SatelliteResult,
    WeatherResult,
    SoilResult,
    RiskResult,
    CropSuitability,
    Recommendation,
)

class DemoProvider(IntelligenceProvider):
    def get_satellite_data(self, farm_id: str) -> SatelliteResult:
        return SatelliteResult(
            ndvi=0.58,
            ndvi_change_14d=-8.2,
            vegetation_health=67,
            trend="declining"
        )

    def get_weather_data(self, farm_id: str) -> WeatherResult:
        return WeatherResult(
            rainfall_72h=84.0,
            temperature_max=34.0,
            humidity=81.0,
            heavy_rain_risk=0.76,
            climate_risk=72
        )

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

    def get_risk_assessment(self, farm_id: str) -> RiskResult:
        return RiskResult(
            crop_stress=63,
            soil_risk=41,
            climate_risk=72,
            water_risk=61,
            overall_risk=68,
            risk_level="Moderate"
        )

    def get_crop_suitability(self, farm_id: str) -> List[CropSuitability]:
        return [
            CropSuitability(
                crop="Rice",
                suitability=82,
                water_requirement="High",
                risk="Moderate"
            ),
            CropSuitability(
                crop="Maize",
                suitability=78,
                water_requirement="Medium",
                risk="Lower estimated climate risk"
            )
        ]

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
