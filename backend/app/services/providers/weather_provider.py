from abc import ABC, abstractmethod
from app.schemas.intelligence import WeatherResult
from app.core.config import settings

class WeatherProvider(ABC):
    @abstractmethod
    def get_weather_data(self, farm_id: str) -> WeatherResult:
        pass

class DemoWeatherProvider(WeatherProvider):
    def get_weather_data(self, farm_id: str) -> WeatherResult:
        return WeatherResult(
            rainfall_72h=84.0,
            temperature_max=34.0,
            humidity=81.0,
            heavy_rain_risk=0.76,
            climate_risk=72
        )

class IMDWeatherProvider(WeatherProvider):
    def get_weather_data(self, farm_id: str) -> WeatherResult:
        # TODO: Implement real IMD integration
        pass

def get_weather_provider() -> WeatherProvider:
    if settings.PROVIDER_MODE == "demo":
        return DemoWeatherProvider()
    return IMDWeatherProvider()
