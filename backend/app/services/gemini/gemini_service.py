import json
from google import genai
from google.genai import types
from app.core.config import settings

# System prompt grounding Gemini strictly to farm data
SYSTEM_PROMPT = """You are AgroResilience AI — an agricultural assistant for Indian farmers.

Your role:
- Explain farm risk scores, satellite data, weather, and soil information in simple language.
- Answer farmer questions about their specific farm using the farm context provided.
- Give practical, actionable guidance based on the data provided.
- Support multiple Indian languages if asked.
- Keep responses concise and farmer-friendly (avoid jargon).

Critical rules:
- ONLY use the farm data provided in the context. Do NOT invent measurements.
- If data is insufficient, say so and recommend field verification.
- Do not claim certainty when data is limited.
- Never give absolute instructions (e.g., "do not irrigate for exactly 3 days").
  Instead say: "irrigation can likely be delayed based on current conditions — recheck if rainfall changes."
- This is AI assistance, not a certified agronomic standard.
"""


def build_farm_context(analysis: dict) -> str:
    """Convert the analysis payload into a structured context string for Gemini."""
    farm = analysis.get("farm", {})
    satellite = analysis.get("satellite", {})
    weather = analysis.get("weather", {})
    soil = analysis.get("soil", {})
    risk = analysis.get("risk", {})
    recommendations = analysis.get("recommendations", [])

    context = f"""
## Farm Context
- Name: {farm.get('name', 'Unknown')}
- Crop: {farm.get('current_crop', 'Unknown')}
- Season: {farm.get('season', 'Unknown')}
- Area: {farm.get('area_acres', 'Unknown')} acres
- Irrigation: {farm.get('irrigation_type', 'Unknown')}

## Satellite Intelligence
- NDVI: {satellite.get('ndvi', 'N/A')} (vegetation index; higher is healthier)
- NDVI 14-day change: {satellite.get('ndvi_change_14d', 'N/A')}%
- Vegetation health: {satellite.get('vegetation_health', 'N/A')}/100
- Trend: {satellite.get('trend', 'N/A')}

## Weather
- Rainfall (72h): {weather.get('rainfall_72h', 'N/A')} mm
- Max temperature: {weather.get('temperature_max', 'N/A')}°C
- Humidity: {weather.get('humidity', 'N/A')}%
- Heavy rain risk: {round(weather.get('heavy_rain_risk', 0) * 100)}%
- Climate risk score: {weather.get('climate_risk', 'N/A')}/100

## Soil
- pH: {soil.get('ph', 'N/A')}
- Nitrogen: {soil.get('nitrogen', 'N/A')}
- Phosphorus: {soil.get('phosphorus', 'N/A')}
- Potassium: {soil.get('potassium', 'N/A')}
- Organic carbon: {soil.get('organic_carbon', 'N/A')}
- Moisture: {soil.get('moisture', 'N/A')}%

## Risk Assessment
- Overall risk: {risk.get('overall_risk', 'N/A')}/100 ({risk.get('risk_level', 'N/A')})
- Crop stress: {risk.get('crop_stress', 'N/A')}/100
- Soil risk: {risk.get('soil_risk', 'N/A')}/100
- Climate risk: {risk.get('climate_risk', 'N/A')}/100
- Water risk: {risk.get('water_risk', 'N/A')}/100

## Current Recommendations
{json.dumps(recommendations, indent=2)}

Data mode: {analysis.get('data_mode', 'demo')}
"""
    return context.strip()


async def get_gemini_response(
    question: str,
    farm_context_str: str,
    history: list[dict] | None = None
) -> str:
    """
    Send a question + farm context to Gemini and return the response text.
    Falls back gracefully if no API key is set.
    """
    if not settings.GEMINI_API_KEY:
        return (
            "Gemini AI is not configured. Please set the GEMINI_API_KEY environment variable. "
            "In demo mode, the farm analysis data above contains all available insights."
        )

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Build conversation history
        contents = []
        if history:
            for msg in history:
                role = msg.get("role", "user")
                text = msg.get("content", "")
                contents.append(types.Content(
                    role=role,
                    parts=[types.Part(text=text)]
                ))

        # Add current question with farm context injected
        user_message = f"Farm context:\n{farm_context_str}\n\nFarmer question: {question}"
        contents.append(types.Content(
            role="user",
            parts=[types.Part(text=user_message)]
        ))

        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.4,
                max_output_tokens=800,
            )
        )

        return response.text or "No response generated."

    except Exception as e:
        return f"AI service temporarily unavailable: {str(e)}"
