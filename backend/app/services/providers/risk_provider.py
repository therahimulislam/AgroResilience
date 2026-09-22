from abc import ABC, abstractmethod
from app.schemas.intelligence import RiskResult
from app.core.config import settings

class RiskProvider(ABC):
    @abstractmethod
    def get_risk_assessment(self, farm_id: str) -> RiskResult:
        pass

class DemoRiskProvider(RiskProvider):
    def get_risk_assessment(self, farm_id: str) -> RiskResult:
        return RiskResult(
            crop_stress=63,
            soil_risk=41,
            climate_risk=72,
            water_risk=61,
            overall_risk=68,
            risk_level="Moderate"
        )

class MLRiskProvider(RiskProvider):
    def get_risk_assessment(self, farm_id: str) -> RiskResult:
        # TODO: Implement real ML model inference
        pass

def get_risk_provider() -> RiskProvider:
    if settings.PROVIDER_MODE == "demo":
        return DemoRiskProvider()
    return MLRiskProvider()
