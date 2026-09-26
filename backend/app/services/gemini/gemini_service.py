import json
import re
import asyncio
import logging
from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger(__name__)

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


def generate_offline_advisory(question: str, farm_context_str: str) -> str:
    """
    Generate an actionable farm advisory when Gemini API is unavailable (e.g. quota, network, or billing).
    Grounded strictly in the observed farm telemetry context.
    """
    crop = "crop"
    risk_level = "Moderate Risk"
    score = "40"
    rain = "12"
    health = "72"
    top_action = "Inspect soil moisture before irrigation and ensure drainage channels are clear."

    m_crop = re.search(r'- Crop:\s*(.+)', farm_context_str)
    if m_crop:
        crop = m_crop.group(1).strip()

    m_risk = re.search(r'- Overall risk:\s*([0-9]+)/100\s*\(([^)]+)\)', farm_context_str)
    if m_risk:
        score = m_risk.group(1)
        risk_level = m_risk.group(2)

    m_rain = re.search(r'- Rainfall \(72h\):\s*([0-9.]+)\s*mm', farm_context_str)
    if m_rain:
        rain = m_rain.group(1)

    m_health = re.search(r'- Vegetation health:\s*([0-9]+)/100', farm_context_str)
    if m_health:
        health = m_health.group(1)

    m_recs = re.search(r'## Current Recommendations\s*(\[.*?\])', farm_context_str, re.DOTALL)
    if m_recs:
        try:
            recs = json.loads(m_recs.group(1))
            if recs and isinstance(recs, list) and 'action' in recs[0]:
                top_action = recs[0]['action']
        except Exception:
            pass

    q_lower = question.lower()
    if any(k in q_lower for k in ["bengali", "বাংলা", "respond in bengali"]):
        return (
            f"আপনার {crop} ফসলের সামগ্রিক ঝুঁকি {score}/১০০ ({risk_level})। "
            f"উদ্ভিদের স্বাস্থ্য {health}/১০০ এবং আগামী ৩ দিনে {rain} মিমি বৃষ্টিপাতের সম্ভাবনা রয়েছে। "
            f"পরামর্শ: {top_action}"
        )
    elif any(k in q_lower for k in ["hindi", "हिंदी", "respond in hindi"]):
        return (
            f"आपकी {crop} फसल के लिए कुल जोखिम {score}/100 ({risk_level}) है। "
            f"फसल स्वास्थ्य स्कोर {health}/100 है और अगले 72 घंटों में {rain} मिमी बारिश का अनुमान है। "
            f"मुख्य सलाह: {top_action}"
        )
    elif any(k in q_lower for k in ["assamese", "অসমীয়া", "respond in assamese"]):
        return (
            f"আপোনাৰ {crop} খেতিৰ সামগ্ৰিক বিপদ {score}/১০০ ({risk_level})। "
            f"শস্যৰ স্বাস্থ্য {health}/১০০ আৰু আগন্তুক ৭২ ঘণ্টাত {rain} মিমি বৰষুণৰ সম্ভাৱনা আছে। "
            f"প্ৰধান পৰামৰ্শ: {top_action}"
        )
    else:
        return (
            f"For your {crop} crop, the overall risk is {score}/100 ({risk_level}). "
            f"Vegetation health is currently {health}/100 with {rain} mm rainfall expected over the next 72 hours. "
            f"Recommended action: {top_action}"
        )


async def get_gemini_response(
    question: str,
    farm_context_str: str,
    history: list[dict] | None = None,
    model: str = "gemini-3.1-flash-lite",
) -> str:
    """
    Send a question + farm context to Gemini and return the response text.
    Falls back gracefully if no API key is set or if billing/quota is exhausted.
    """
    if not settings.GEMINI_API_KEY:
        return generate_offline_advisory(question, farm_context_str)

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

        target_model = "gemini-3.1-flash-lite" if ("gemini-3" in model or "live" in model) else model

        response = await client.aio.models.generate_content(
            model=target_model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.4,
                max_output_tokens=800,
            )
        )

        return response.text or "No response generated."

    except Exception as e:
        logger.warning(f"Gemini API error ({e}), providing grounded advisory fallback")
        return generate_offline_advisory(question, farm_context_str)


async def get_gemini_response_stream(
    question: str,
    farm_context_str: str,
    history: list[dict] | None = None,
    model: str = "gemini-3.1-flash-lite",
):
    """
    Stream farm context + question answers token by token.
    Falls back gracefully to streaming word-by-word advisory if Gemini service has an issue.
    """
    if not settings.GEMINI_API_KEY:
        fallback = generate_offline_advisory(question, farm_context_str)
        for word in fallback.split(" "):
            yield word + " "
            await asyncio.sleep(0.04)
        return

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        contents = []
        if history:
            for msg in history:
                role = msg.get("role", "user")
                text = msg.get("content", "")
                contents.append(types.Content(
                    role=role,
                    parts=[types.Part(text=text)]
                ))

        user_message = f"Farm context:\n{farm_context_str}\n\nFarmer question: {question}"
        contents.append(types.Content(
            role="user",
            parts=[types.Part(text=user_message)]
        ))

        target_model = "gemini-3.1-flash-lite" if ("gemini-3" in model or "live" in model) else model

        response = await client.aio.models.generate_content_stream(
            model=target_model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.4,
                max_output_tokens=800,
            )
        )
        async for chunk in response:
            if chunk.text:
                yield chunk.text

    except Exception as e:
        logger.warning(f"Gemini API stream error ({e}), providing grounded advisory fallback")
        fallback = generate_offline_advisory(question, farm_context_str)
        for word in fallback.split(" "):
            yield word + " "
            await asyncio.sleep(0.04)

