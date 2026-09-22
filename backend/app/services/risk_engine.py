from app.schemas.intelligence import RiskResult, SatelliteResult, WeatherResult


def calculate_risk(
    satellite: SatelliteResult,
    weather: WeatherResult,
) -> RiskResult:
    """
    Calculate an explainable agricultural risk score
    using satellite vegetation data and weather data.

    This is an MVP rule-based model, not a trained ML model.
    """

    # -------------------------
    # Vegetation stress
    # -------------------------

    if satellite.ndvi >= 0.6:
        crop_stress = 20
    elif satellite.ndvi >= 0.4:
        crop_stress = 50
    else:
        crop_stress = 80

    # -------------------------
    # Climate risk
    # -------------------------

    climate_risk = weather.climate_risk

    # -------------------------
    # Water risk
    # -------------------------

    water_risk = 0

    if weather.rainfall_72h >= 100:
        water_risk += 50
    elif weather.rainfall_72h >= 60:
        water_risk += 35
    elif weather.rainfall_72h >= 30:
        water_risk += 15

    if weather.heavy_rain_risk >= 0.8:
        water_risk += 35
    elif weather.heavy_rain_risk >= 0.6:
        water_risk += 20

    water_risk = min(water_risk, 100)

    # -------------------------
    # Overall risk
    # -------------------------

    overall_risk = round(
        (crop_stress * 0.4)
        + (climate_risk * 0.35)
        + (water_risk * 0.25)
    )

    # -------------------------
    # Risk level
    # -------------------------

    if overall_risk >= 70:
        risk_level = "High"
    elif overall_risk >= 40:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    return RiskResult(
        crop_stress=crop_stress,
        soil_risk=0,
        climate_risk=climate_risk,
        water_risk=water_risk,
        overall_risk=overall_risk,
        risk_level=risk_level,
    )