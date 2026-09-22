from app.services.weather import get_weather_data



latitude = 26.204623
longitude = 91.860077


weather = get_weather_data(latitude, longitude)

print("Weather Analysis")
print("----------------")
print("Rainfall 72h:", weather.rainfall_72h, "mm")
print("Maximum Temperature:", weather.temperature_max, "°C")
print("Humidity:", weather.humidity, "%")
print("Heavy Rain Risk:", weather.heavy_rain_risk)
print("Climate Risk:", weather.climate_risk)