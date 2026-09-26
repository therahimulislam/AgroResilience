from abc import ABC, abstractmethod
from typing import List
from app.schemas.intelligence import CropSuitability
from app.core.config import settings
from app.services.providers.demo_utils import _seed, is_season_match, latitude_to_rainfall_factor

# Crop catalogue with water requirements
CROP_CATALOGUE = [
    ("Rice",      "High",   0.85, {"kharif"}),
    ("Maize",     "Medium", 0.70, {"kharif"}),
    ("Wheat",     "Low",    0.75, {"rabi"}),
    ("Cotton",    "Medium", 0.65, {"kharif"}),
    ("Soybean",   "Medium", 0.70, {"kharif"}),
    ("Groundnut", "Low",    0.65, {"kharif"}),
    ("Sugarcane", "High",   0.60, {"kharif", "rabi"}),
    ("Potato",    "Medium", 0.68, {"rabi"}),
    ("Onion",     "Low",    0.62, {"rabi"}),
    ("Sunflower", "Low",    0.58, {"rabi"}),
]

class CropProvider(ABC):
    @abstractmethod
    def get_crop_suitability(self, farm_id: str, farm=None) -> List[CropSuitability]:
        pass

class DemoCropProvider(CropProvider):
    def get_crop_suitability(self, farm_id: str, farm=None) -> List[CropSuitability]:
        s = _seed(farm_id, farm)
        crop = getattr(farm, 'current_crop', None) or 'Rice'
        season = (getattr(farm, 'season', None) or 'Kharif').lower()
        lat = getattr(farm, 'latitude', None)
        rain_factor = latitude_to_rainfall_factor(lat)

        results = []
        for i, (name, water_req, base_suit, ideal_seasons) in enumerate(CROP_CATALOGUE):
            # Season match bonus
            season_match = any(s_key in season for s_key in ideal_seasons)
            suit = base_suit + (0.10 if season_match else -0.15)

            # Rainfall factor: adjust high-water crops
            if water_req == "High":
                suit += (rain_factor - 1.0) * 0.15
            elif water_req == "Low":
                suit -= (rain_factor - 1.0) * 0.10

            # Farm-seeded jitter
            local_seed = _seed(farm_id + name, farm)
            suit += (local_seed - 0.5) * 0.12

            suit_pct = int(max(20, min(98, suit * 100)))

            if suit_pct >= 70: risk = "Low"
            elif suit_pct >= 55: risk = "Moderate"
            else: risk = "High"

            results.append(CropSuitability(
                crop=name,
                suitability=suit_pct,
                water_requirement=water_req,
                risk=risk,
            ))

        # Sort by suitability descending, return top 5
        results.sort(key=lambda x: x.suitability, reverse=True)
        return results[:5]

class MLCropProvider(CropProvider):
    def get_crop_suitability(self, farm_id: str, farm=None) -> List[CropSuitability]:
        pass  # TODO: Real ML inference

def get_crop_provider() -> CropProvider:
    if settings.PROVIDER_MODE == "demo":
        return DemoCropProvider()
    return MLCropProvider()
