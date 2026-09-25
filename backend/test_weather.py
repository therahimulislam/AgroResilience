from app.services.weather import get_weather_data


latitude = 26.1445
longitude = 91.7362

result = get_weather_data(latitude, longitude)

print("Weather Result")
print("----------------------------")
print(f"Rainfall (72h): {result.rainfall_72h} mm")
print(f"Max Temperature: {result.temperature_max} °C")
print(f"Average Humidity: {result.humidity}%")
print(f"Heavy Rain Risk: {result.heavy_rain_risk}")
print(f"Climate Risk: {result.climate_risk}")