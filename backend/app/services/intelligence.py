from uuid import uuid4

import ee

from app.schemas.intelligence import (
    AnalysisRequest,
    AnalysisResponse,
    CropSuitability,
    Recommendation,
    SoilResult,
)

from app.services.satellite import get_satellite_data
from app.services.weather import get_weather_data
from app.services.risk_engine import calculate_risk
from app.services.gemini import generate_farm_advice


def analyze_farm(request: AnalysisRequest) -> AnalysisResponse:
    """
    Run the complete AgroResilience intelligence pipeline.

    Pipeline:
    Satellite -> Weather -> Risk Engine -> Optional ML -> Gemini
    """

    # --------------------------------------------------
    # 1. Initialize Google Earth Engine
    # --------------------------------------------------

    ee.Initialize(project="agroresilience")

    # --------------------------------------------------
    # 2. Satellite data
    # --------------------------------------------------

    satellite = get_satellite_data(
        latitude=request.latitude,
        longitude=request.longitude,
    )

    # --------------------------------------------------
    # 3. Weather data
    # --------------------------------------------------

    weather = get_weather_data(
        latitude=request.latitude,
        longitude=request.longitude,
    )

    # --------------------------------------------------
    # 4. Risk analysis
    # --------------------------------------------------

    risk = calculate_risk(
        satellite=satellite,
        weather=weather,
    )

    # --------------------------------------------------
    # 5. Soil data
    # --------------------------------------------------
    # We currently do not have a real soil provider.
    # Therefore, we explicitly represent soil as unavailable.
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
    # 6. Optional ML yield prediction
    # --------------------------------------------------
    #
    # The ML model requires historical/agricultural inputs
    # that are not automatically available from our live
    # satellite/weather providers.
    #
    # Only run it when ALL required inputs were supplied.
    #

    yield_prediction = None

    if (
        request.area is not None
        and request.annual_rainfall is not None
        and request.fertilizer is not None
        and request.pesticide is not None
    ):
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

    # --------------------------------------------------
    # 7. Gemini agricultural advice
    # --------------------------------------------------

    location = (
        f"{request.state}, India "
        f"(lat: {request.latitude}, lon: {request.longitude})"
    )

    ai_advice = generate_farm_advice(
        crop=request.crop,
        location=location,
        satellite=satellite,
        weather=weather,
        risk=risk,
    )

    # --------------------------------------------------
    # 8. Crop suitability
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
    # 9. Deterministic recommendations
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
                ),
                priority="High",
                related_risk="crop_stress",
                data_source="Google Earth Engine",
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
                data_source="Google Earth Engine",
            )
        )

    if risk.climate_risk >= 60:
        recommendations.append(
            Recommendation(
                title="Prepare for changing weather conditions",
                reason=(
                    "The weather-based climate risk score is elevated."
                ),
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
    # 10. Final response
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