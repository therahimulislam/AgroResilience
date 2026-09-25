import ee

from app.services.satellite import get_satellite_data


ee.Initialize(project="agroresilience")

latitude = 26.1445
longitude = 91.7362

result = get_satellite_data(latitude, longitude)

print("Satellite Result")
print("----------------------------")
print(f"NDVI: {result.ndvi}")
print(f"NDVI Change: {result.ndvi_change_14d}")
print(f"Vegetation Health: {result.vegetation_health}")
print(f"Trend: {result.trend}")