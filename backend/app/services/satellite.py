import ee

from app.schemas.intelligence import SatelliteResult


def get_satellite_data(latitude: float, longitude: float) -> SatelliteResult:
    """
    Fetch satellite-derived vegetation data using Google Earth Engine.

    Dataset:
    MODIS/061/MOD13A1
    Resolution: 500 m
    Temporal frequency: approximately 16 days
    """

    point = ee.Geometry.Point([longitude, latitude])

    collection = (
        ee.ImageCollection("MODIS/061/MOD13A1")
        .filterBounds(point)
        .sort("system:time_start", False)
    )

    image = collection.first()

    ndvi = image.select("NDVI").reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=point,
        scale=500,
    ).get("NDVI")

    ndvi_value = ee.Number(ndvi).multiply(0.0001).getInfo()

    # Simple vegetation-health interpretation for MVP.
    if ndvi_value >= 0.6:
        vegetation_health = 80
        trend = "healthy"
    elif ndvi_value >= 0.4:
        vegetation_health = 60
        trend = "moderate"
    else:
        vegetation_health = 35
        trend = "low"

    return SatelliteResult(
        ndvi=round(ndvi_value, 4),
        ndvi_change_14d=0.0,
        vegetation_health=vegetation_health,
        trend=trend,
    )