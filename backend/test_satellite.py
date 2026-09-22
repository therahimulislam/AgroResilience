import ee

from app.services.satellite import get_satellite_data


# Initialize Earth Engine
ee.Initialize(project="agroresilience")


# Test location: Guwahati
latitude = 26.1445
longitude = 91.7362

satellite = get_satellite_data(latitude, longitude)

print("Satellite Service Test")
print("----------------------")
print("NDVI:", satellite.ndvi)
print("Vegetation Health:", satellite.vegetation_health)
print("Trend:", satellite.trend)