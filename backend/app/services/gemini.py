import os
from google import genai
from dotenv import load_dotenv

load_dotenv()


from app.schemas.intelligence import SatelliteResult, WeatherResult, RiskResult


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_farm_advice(
    crop: str,
    location: str,
    satellite: SatelliteResult,
    weather: WeatherResult,
    risk: RiskResult,
) -> str:

    prompt = f"""
You are AgroResilience, an AI agricultural climate-risk advisory assistant.

Your job is to explain the supplied agricultural data clearly and provide
careful, practical, risk-informed guidance to a farmer.

FARM INFORMATION
- Location: {location}
- Crop: {crop}

OBSERVED SATELLITE DATA
- NDVI: {satellite.ndvi}
- Vegetation health score: {satellite.vegetation_health}
- Vegetation trend: {satellite.trend}

OBSERVED WEATHER DATA
- Rainfall over 72 hours: {weather.rainfall_72h} mm
- Maximum temperature: {weather.temperature_max} °C
- Average humidity: {weather.humidity}%
- Heavy-rain probability: {weather.heavy_rain_risk * 100}%

CALCULATED RISK DATA
- Crop stress: {risk.crop_stress}/100
- Climate risk: {risk.climate_risk}/100
- Water risk: {risk.water_risk}/100
- Overall risk: {risk.overall_risk}/100
- Risk level: {risk.risk_level}

IMPORTANT RULES

1. Treat the supplied satellite and weather values as observations.
2. Treat the risk scores as outputs of AgroResilience's rule-based risk
   engine, not as guaranteed predictions.
3. Do not invent soil measurements, irrigation conditions, crop diseases,
   pest presence, crop stage, farm size, or other information that was
   not supplied.
4. Do not diagnose diseases or pests.
5. Do not recommend specific pesticides, herbicides, fertilizers, or
   chemical treatments unless the supplied data explicitly supports such
   a recommendation.
6. Do not claim that weather conditions prove a disease or pest outbreak.
7. Recommendations must be practical actions that follow logically from
   the supplied risk signals.
8. If the available data is insufficient to make a recommendation,
   explicitly say that additional information would be needed.
9. Do not present AI-generated advice as a guarantee of crop outcomes.
10. Keep the answer concise enough for a farmer to understand quickly.
11. Do not recommend, postpone, or comment on spraying, foliar inputs,
    fertilizers, pesticides, herbicides, or other chemical/agricultural
    treatments unless the user has explicitly provided information about
    such a treatment or the supplied data directly supports discussing it.
12. Do not describe a high precipitation probability as certain rainfall.
    Use language such as "forecast indicates a high probability of rain."

RESPONSE FORMAT

Overall assessment:
Give a short explanation of the current risk level.

Key observations:
Give 3-4 bullet points explaining the most important measured signals.

Recommended actions:
Give exactly 3 practical actions. For each action, briefly explain why
it follows from the available data.

Data limitations:
Briefly mention important information that AgroResilience does not
currently have and that could affect the assessment.

Use simple, farmer-friendly language.
"""

    interaction = client.interactions.create(
        model="gemini-3.8-flash",
        input=prompt,
    )

    return interaction.output_text

if __name__ == "__main__":
    from app.services.satellite import get_satellite_data
    from app.services.weather import get_weather_data
    from app.services.risk_engine import calculate_risk
    import ee

    # Initialize Earth Engine
    ee.Initialize(project="agroresilience")

    # Test location: Guwahati
    latitude = 26.1445
    longitude = 91.7362

    # Get real data
    satellite = get_satellite_data(latitude, longitude)
    weather = get_weather_data(latitude, longitude)

    # Calculate risk
    risk = calculate_risk(
        satellite=satellite,
        weather=weather,
    )

    # Generate Gemini advice
    advice = generate_farm_advice(
        crop="Rice",
        location="Guwahati, Assam, India",
        satellite=satellite,
        weather=weather,
        risk=risk,
    )

    print("\nAgroResilience AI Advice")
    print("========================")
    print(advice)