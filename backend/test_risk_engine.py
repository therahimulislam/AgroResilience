import ee

from app.services.weather import get_weather_data
from app.services.satellite import get_satellite_data
from app.services.risk_engine import calculate_risk


# Initialize Earth Engine
ee.Initialize(project="agroresilience")


# Test location: Guwahati
latitude = 26.1445
longitude = 91.7362


# Get real weather data
weather = get_weather_data(latitude, longitude)


# Get real satellite data
satellite = get_satellite_data(latitude, longitude)


# Calculate agricultural risk
risk = calculate_risk(
    satellite=satellite,
    weather=weather,
)


print("AgroResilience Risk Analysis")
print("============================")

print("\nSatellite")
print("NDVI:", satellite.ndvi)
print("Vegetation Health:", satellite.vegetation_health)

print("\nWeather")
print("Rainfall 72h:", weather.rainfall_72h, "mm")
print("Temperature:", weather.temperature_max, "°C")
print("Humidity:", weather.humidity, "%")
print("Heavy Rain Risk:", weather.heavy_rain_risk)

print("\nRisk Assessment")
print("Crop Stress:", risk.crop_stress)
print("Climate Risk:", risk.climate_risk)
print("Water Risk:", risk.water_risk)
print("Overall Risk:", risk.overall_risk)
print("Risk Level:", risk.risk_level)