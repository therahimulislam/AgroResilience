from abc import ABC, abstractmethod
from typing import List
from app.schemas.intelligence import CropSuitability
from app.core.config import settings

class CropProvider(ABC):
    @abstractmethod
    def get_crop_suitability(self, farm_id: str) -> List[CropSuitability]:
        pass

class DemoCropProvider(CropProvider):
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

class MLCropProvider(CropProvider):
    def get_crop_suitability(self, farm_id: str) -> List[CropSuitability]:
        # TODO: Implement real ML inference for crop suitability
        pass

def get_crop_provider() -> CropProvider:
    if settings.PROVIDER_MODE == "demo":
        return DemoCropProvider()
    return MLCropProvider()
