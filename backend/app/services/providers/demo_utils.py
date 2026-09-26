"""
Shared utility for generating deterministic but varied demo data
based on farm properties (crop, location, season, irrigation).
"""
import hashlib

# Water needs per crop (higher = more water sensitive)
CROP_WATER_NEEDS = {
    "Rice": 0.95, "Sugarcane": 0.85, "Cotton": 0.65, "Maize": 0.60,
    "Wheat": 0.50, "Soybean": 0.55, "Groundnut": 0.50, "Sunflower": 0.45,
    "Potato": 0.60, "Onion": 0.55,
}

# Drought tolerance per crop (higher = more drought-tolerant)
CROP_DROUGHT_TOLERANCE = {
    "Rice": 0.10, "Sugarcane": 0.25, "Cotton": 0.55, "Maize": 0.50,
    "Wheat": 0.65, "Soybean": 0.60, "Groundnut": 0.70, "Sunflower": 0.75,
    "Potato": 0.45, "Onion": 0.50,
}

# Kharif (monsoon) crops
KHARIF_CROPS = {"Rice", "Maize", "Cotton", "Soybean", "Groundnut", "Sugarcane"}
# Rabi (winter) crops
RABI_CROPS = {"Wheat", "Onion", "Potato", "Sunflower"}

def _seed(farm_id: str, farm=None) -> float:
    """Returns a 0-1 float deterministically seeded from farm_id + crop + location."""
    key = farm_id
    if farm:
        key += f"{farm.current_crop or ''}{farm.season or ''}{farm.latitude or ''}{farm.longitude or ''}"
    return int(hashlib.md5(key.encode()).hexdigest(), 16) % 10000 / 10000.0

def _jitter(base: float, seed: float, spread: float = 0.15) -> float:
    """Add deterministic jitter to a base value."""
    return round(base + (seed - 0.5) * 2 * spread, 2)

def get_crop_water_need(crop: str) -> float:
    return CROP_WATER_NEEDS.get(crop or "Rice", 0.60)

def get_crop_drought_tolerance(crop: str) -> float:
    return CROP_DROUGHT_TOLERANCE.get(crop or "Rice", 0.50)

def is_season_match(crop: str, season: str) -> bool:
    """Check if crop matches its ideal season."""
    season_lower = (season or "").lower()
    if crop in KHARIF_CROPS and "kharif" in season_lower:
        return True
    if crop in RABI_CROPS and "rabi" in season_lower:
        return True
    return False

def latitude_to_rainfall_factor(lat) -> float:
    """Higher latitudes = less tropical rainfall in South Asia context."""
    lat = float(lat or 20.0)
    if lat < 15:    return 1.3   # very tropical
    elif lat < 20:  return 1.1   # tropical
    elif lat < 25:  return 1.0   # sub-tropical
    elif lat < 30:  return 0.85  # semi-arid
    else:           return 0.70  # arid/semi-arid north
