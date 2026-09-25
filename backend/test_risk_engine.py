import ee

from app.services.satellite import get_satellite_data
from app.services.weather import get_weather_data
from app.services.risk_engine import calculate_risk


ee.Initialize(project="agroresilience")

latitude = 26.1445
longitude = 91.7362

satellite = get_satellite_data(latitude, longitude)
weather = get_weather_data(latitude, longitude)

risk = calculate_risk(satellite, weather)

print("Risk Result")
print("----------------------------")
print(f"Crop Stress: {risk.crop_stress}")
print(f"Soil Risk: {risk.soil_risk}")
print(f"Climate Risk: {risk.climate_risk}")
print(f"Water Risk: {risk.water_risk}")
print(f"Overall Risk: {risk.overall_risk}")
print(f"Risk Level: {risk.risk_level}")