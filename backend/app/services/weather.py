import requests

from app.schemas.intelligence import WeatherResult


OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def get_weather_data(latitude: float, longitude: float) -> WeatherResult:
    """
    Fetch weather data for a farm location using Open-Meteo.
    """

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "precipitation_probability"
        ),
        "forecast_days": 3,
        "timezone": "auto",
    }

    response = requests.get(
        OPEN_METEO_URL,
        params=params,
        timeout=10
    )

    response.raise_for_status()

    data = response.json()
    hourly = data["hourly"]

    temperatures = hourly["temperature_2m"]
    humidity = hourly["relative_humidity_2m"]
    precipitation = hourly["precipitation"]
    precipitation_probability = hourly["precipitation_probability"]

    # Maximum temperature in the available forecast
    temperature_max = max(temperatures)

    # Average relative humidity
    average_humidity = sum(humidity) / len(humidity)

    # Rainfall over approximately the first 72 hours
    rainfall_72h = sum(precipitation[:72])

    # Maximum probability of precipitation
    max_rain_probability = max(precipitation_probability[:72])

    # Simple climate-risk score for the MVP.
    climate_risk = calculate_climate_risk(
        rainfall_72h,
        temperature_max,
        average_humidity,
        max_rain_probability,
    )

    return WeatherResult(
        rainfall_72h=round(rainfall_72h, 2),
        temperature_max=round(temperature_max, 2),
        humidity=round(average_humidity, 2),
        heavy_rain_risk=round(max_rain_probability / 100, 2),
        climate_risk=climate_risk,
    )


def calculate_climate_risk(
    rainfall_72h: float,
    temperature_max: float,
    humidity: float,
    rain_probability: float,
) -> int:
    """
    Calculate a simple 0-100 climate risk score.

    This is an MVP rule-based score, not a trained ML model.
    """

    risk = 0

    # Heavy rainfall risk
    if rainfall_72h >= 100:
        risk += 35
    elif rainfall_72h >= 60:
        risk += 25
    elif rainfall_72h >= 30:
        risk += 10

    # High temperature risk
    if temperature_max >= 38:
        risk += 30
    elif temperature_max >= 35:
        risk += 20
    elif temperature_max >= 32:
        risk += 10

    # High humidity
    if humidity >= 85:
        risk += 20
    elif humidity >= 75:
        risk += 10

    # High probability of precipitation
    if rain_probability >= 80:
        risk += 15
    elif rain_probability >= 60:
        risk += 10

    return min(risk, 100)