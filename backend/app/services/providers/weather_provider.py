from abc import ABC, abstractmethod
from app.schemas.intelligence import WeatherResult
from app.core.config import settings
from app.services.providers.demo_utils import _seed, _jitter, latitude_to_rainfall_factor, is_season_match

class WeatherProvider(ABC):
    @abstractmethod
    def get_weather_data(self, farm_id: str, farm=None) -> WeatherResult:
        pass

class DemoWeatherProvider(WeatherProvider):
    def get_weather_data(self, farm_id: str, farm=None) -> WeatherResult:
        s = _seed(farm_id, farm)
        crop = getattr(farm, 'current_crop', None) or 'Rice'
        season = getattr(farm, 'season', None) or 'Kharif'
        lat = getattr(farm, 'latitude', None)

        rain_factor = latitude_to_rainfall_factor(lat)
        season_match = is_season_match(crop, season)

        # Rainfall higher in Kharif season and tropical latitudes
        base_rainfall = 75.0 if "kharif" in (season or "").lower() else 30.0
        rainfall = round(_jitter(base_rainfall * rain_factor, s, 25), 1)
        rainfall = max(0, rainfall)

        # Temperature: higher in tropical areas
        lat_f = float(lat or 20.0)
        base_temp = max(22.0, 42.0 - lat_f * 0.5)
        temp_max = round(_jitter(base_temp, s * 0.7, 4), 1)

        # Humidity based on rainfall and season
        base_humidity = 75.0 if rainfall > 60 else 55.0
        humidity = round(_jitter(base_humidity, s * 0.6, 15), 1)
        humidity = max(30.0, min(98.0, humidity))

        # Heavy rain risk scales with rainfall amount
        heavy_rain_risk = round(min(0.95, rainfall / 150.0 + (s - 0.5) * 0.2), 2)

        # Climate risk: high if wrong season for crop, or extreme weather
        base_climate_risk = 40 if season_match else 65
        climate_risk = int(_jitter(base_climate_risk + heavy_rain_risk * 20, s * 0.8, 15))
        climate_risk = max(10, min(95, climate_risk))

        return WeatherResult(
            rainfall_72h=rainfall,
            temperature_max=temp_max,
            humidity=humidity,
            heavy_rain_risk=heavy_rain_risk,
            climate_risk=climate_risk,
        )

class IMDWeatherProvider(WeatherProvider):
    def get_weather_data(self, farm_id: str, farm=None) -> WeatherResult:
        pass  # TODO: Real IMD integration

def get_weather_provider() -> WeatherProvider:
    if settings.PROVIDER_MODE == "demo":
        return DemoWeatherProvider()
    return IMDWeatherProvider()
