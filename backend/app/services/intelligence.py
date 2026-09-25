import logging
from uuid import uuid4

from app.schemas.intelligence import (
    AnalysisRequest,
    AnalysisResponse,
    CropSuitability,
    Recommendation,
    SatelliteResult,
    SoilResult,
)

from app.services.weather import get_weather_data
from app.services.risk_engine import calculate_risk
from app.services.gemini_intelligence import generate_farm_advice

logger = logging.getLogger(__name__)

EE_AVAILABLE = False

# Try to initialize Earth Engine at import time.
# If credentials are missing we degrade gracefully — the rest of the
# pipeline (weather, risk, Gemini) still runs fine.
try:
    import ee
    ee.Initialize(project="agroresilience")
    EE_AVAILABLE = True
    logger.info("Google Earth Engine initialized successfully.")
except Exception as _ee_err:
    logger.warning(
        "Google Earth Engine not available (%s). "
        "Satellite NDVI will be marked as unavailable. "
        "Run `earthengine authenticate` to enable it.",
        _ee_err,
    )


def _get_satellite_data(latitude: float, longitude: float) -> SatelliteResult:
    """
    Attempt to fetch NDVI from Earth Engine.
    Returns a result with ndvi=None if EE is unavailable.
    """
    if not EE_AVAILABLE:
        return SatelliteResult(
            ndvi=None,
            ndvi_change_14d=None,
            vegetation_health=None,
            trend="unavailable",
        )

    try:
        from app.services.satellite import get_satellite_data
        return get_satellite_data(latitude=latitude, longitude=longitude)
    except Exception as exc:
        logger.warning("Satellite fetch failed: %s", exc)
        return SatelliteResult(
            ndvi=None,
            ndvi_change_14d=None,
            vegetation_health=None,
            trend="unavailable",
        )


def analyze_farm(request: AnalysisRequest) -> AnalysisResponse:
    """
    Run the complete AgroResilience intelligence pipeline.

    Pipeline:
    Satellite (optional) -> Weather -> Risk Engine -> Optional ML -> Gemini
    """

    # --------------------------------------------------
    # 1. Satellite data (graceful fallback if EE missing)
    # --------------------------------------------------
    satellite = _get_satellite_data(
        latitude=request.latitude,
        longitude=request.longitude,
    )

    # --------------------------------------------------
    # 2. Weather data (Open-Meteo — always available)
    # --------------------------------------------------
    weather = get_weather_data(
        latitude=request.latitude,
        longitude=request.longitude,
    )

    # --------------------------------------------------
    # 3. Risk analysis
    # --------------------------------------------------
    risk = calculate_risk(
        satellite=satellite,
        weather=weather,
    )

    # --------------------------------------------------
    # 4. Soil data
    # --------------------------------------------------
    # No real soil provider — represent as explicitly unavailable.
    # We DO NOT fabricate soil measurements.
    soil = SoilResult(
        ph=None,
        nitrogen=None,
        phosphorus=None,
        potassium=None,
        organic_carbon=None,
        moisture=None,
        soil_risk=0,
    )

    # --------------------------------------------------
    # 5. Optional ML yield prediction
    # --------------------------------------------------
    yield_prediction = None

    if (
        request.area is not None
        and request.annual_rainfall is not None
        and request.fertilizer is not None
        and request.pesticide is not None
    ):
        try:
            from app.services.ml_predictor import predict_yield
            yield_prediction = predict_yield(
                crop=request.crop,
                crop_year=request.crop_year,
                season=request.season,
                state=request.state,
                area=request.area,
                annual_rainfall=request.annual_rainfall,
                fertilizer=request.fertilizer,
                pesticide=request.pesticide,
            )
        except Exception as exc:
            logger.warning("ML yield prediction failed: %s", exc)

    # --------------------------------------------------
    # 6. Gemini agricultural advice
    # --------------------------------------------------
    location = (
        f"{request.state}, India "
        f"(lat: {request.latitude}, lon: {request.longitude})"
    )

    try:
        ai_advice = generate_farm_advice(
            crop=request.crop,
            location=location,
            satellite=satellite,
            weather=weather,
            risk=risk,
        )
    except Exception as exc:
        logger.warning("Gemini advice generation failed: %s", exc)
        ai_advice = "AI advice temporarily unavailable. Please try again."

    # --------------------------------------------------
    # 7. Crop suitability
    # --------------------------------------------------
    if risk.overall_risk >= 70:
        suitability = 40
        suitability_risk = "High"
    elif risk.overall_risk >= 40:
        suitability = 60
        suitability_risk = "Moderate"
    else:
        suitability = 80
        suitability_risk = "Low"

    crop_suitability = [
        CropSuitability(
            crop=request.crop,
            suitability=suitability,
            water_requirement="Depends on local crop and irrigation conditions",
            risk=suitability_risk,
        )
    ]

    # --------------------------------------------------
    # 8. Deterministic recommendations
    # --------------------------------------------------
    recommendations = []

    if risk.water_risk >= 60:
        recommendations.append(
            Recommendation(
                title="Monitor heavy rainfall conditions",
                reason=(
                    "The current weather signals indicate elevated "
                    "water-related risk."
                ),
                priority="High",
                related_risk="water_risk",
                data_source="Open-Meteo",
            )
        )
    else:
        recommendations.append(
            Recommendation(
                title="Continue monitoring rainfall",
                reason=(
                    "Rainfall conditions should be monitored as weather "
                    "conditions can change."
                ),
                priority="Medium",
                related_risk="water_risk",
                data_source="Open-Meteo",
            )
        )

    if risk.crop_stress >= 50:
        recommendations.append(
            Recommendation(
                title="Monitor crop vegetation",
                reason=(
                    "Satellite NDVI indicates moderate or elevated "
                    "vegetation stress."
                    if EE_AVAILABLE else
                    "Vegetation monitoring recommended — satellite data not yet configured."
                ),
                priority="High",
                related_risk="crop_stress",
                data_source="Google Earth Engine" if EE_AVAILABLE else "Open-Meteo (proxy)",
            )
        )
    else:
        recommendations.append(
            Recommendation(
                title="Continue vegetation monitoring",
                reason=(
                    "Satellite vegetation data should be checked regularly "
                    "for changes in crop condition."
                ),
                priority="Medium",
                related_risk="crop_stress",
                data_source="Google Earth Engine" if EE_AVAILABLE else "Open-Meteo (proxy)",
            )
        )

    if risk.climate_risk >= 60:
        recommendations.append(
            Recommendation(
                title="Prepare for changing weather conditions",
                reason="The weather-based climate risk score is elevated.",
                priority="High",
                related_risk="climate_risk",
                data_source="Open-Meteo",
            )
        )
    else:
        recommendations.append(
            Recommendation(
                title="Keep monitoring local weather",
                reason=(
                    "Weather conditions can change and should be checked "
                    "before major farm decisions."
                ),
                priority="Medium",
                related_risk="climate_risk",
                data_source="Open-Meteo",
            )
        )

    # --------------------------------------------------
    # 9. Final response
    # --------------------------------------------------
    return AnalysisResponse(
        farm_id=str(uuid4()),
        satellite=satellite,
        weather=weather,
        soil=soil,
        risk=risk,
        crop_suitability=crop_suitability,
        recommendations=recommendations,
        yield_prediction=yield_prediction,
        ai_advice=ai_advice,
    )