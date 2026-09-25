from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
import json
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Farm, User
from app.core.dependencies import get_current_user
from app.schemas.voice import VoiceRequest, VoiceResponse
from app.services.gemini.gemini_service import get_gemini_response, get_gemini_response_stream, build_farm_context
from app.services.providers.satellite_provider import get_satellite_provider
from app.services.providers.weather_provider import get_weather_provider
from app.services.providers.soil_provider import get_soil_provider
from app.services.providers.risk_provider import get_risk_provider
from app.services.providers.recommendation_provider import get_recommendation_provider

router = APIRouter()

# Language instruction mapping
LANG_INSTRUCTIONS = {
    "as": "Respond in Assamese language.",
    "hi": "Respond in Hindi language.",
    "bn": "Respond in Bengali language.",
    "en": "Respond in English.",
}

@router.post("/{farm_id}/voice", response_model=VoiceResponse)
async def voice_query(
    farm_id: str,
    request: VoiceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Validate ownership
    result = await db.execute(select(Farm).filter(Farm.id == farm_id))
    farm = result.scalars().first()

    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.farmer_id != current_user.farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Build intelligence context
    satellite = get_satellite_provider().get_satellite_data(farm_id)
    weather = get_weather_provider().get_weather_data(farm_id)
    soil = get_soil_provider().get_soil_data(farm_id)
    risk = get_risk_provider().get_risk_assessment(farm_id)
    recommendations = get_recommendation_provider().get_recommendations(farm_id)

    analysis_payload = {
        "farm": {
            "id": farm.id,
            "name": farm.name,
            "area_acres": farm.area_acres,
            "current_crop": farm.current_crop,
            "season": farm.season,
            "irrigation_type": farm.irrigation_type,
        },
        "satellite": satellite.dict(),
        "weather": weather.dict(),
        "soil": soil.dict(),
        "risk": risk.dict(),
        "recommendations": [r.dict() for r in recommendations],
    }

    farm_context_str = build_farm_context(analysis_payload)

    # Append language instruction to the question
    lang_instruction = LANG_INSTRUCTIONS.get(request.language or "en", "Respond in English.")
    enriched_question = f"{lang_instruction}\n\nFarmer's voice query: {request.transcript}"

    answer = await get_gemini_response(
        question=enriched_question,
        farm_context_str=farm_context_str,
        model="gemini-3-flash-live",
    )

    return VoiceResponse(
        answer=answer,
        farm_id=farm_id,
        detected_language=request.language
    )


@router.websocket("/{farm_id}/voice/stream")
async def voice_stream(websocket: WebSocket, farm_id: str, db: AsyncSession = Depends(get_db)):
    await websocket.accept()
    
    # We don't have current_user easily in websockets without token passing,
    # so we'll just check if farm exists for simplicity in this demo.
    result = await db.execute(select(Farm).filter(Farm.id == farm_id))
    farm = result.scalars().first()
    if not farm:
        await websocket.close(code=1008)
        return

    try:
        while True:
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            transcript = data.get("transcript", "")
            language = data.get("language", "en")

            satellite = get_satellite_provider().get_satellite_data(farm_id)
            weather = get_weather_provider().get_weather_data(farm_id)
            soil = get_soil_provider().get_soil_data(farm_id)
            risk = get_risk_provider().get_risk_assessment(farm_id)
            recommendations = get_recommendation_provider().get_recommendations(farm_id)

            analysis_payload = {
                "farm": {
                    "id": farm.id,
                    "name": farm.name,
                    "area_acres": farm.area_acres,
                    "current_crop": farm.current_crop,
                    "season": farm.season,
                    "irrigation_type": farm.irrigation_type,
                },
                "satellite": satellite.dict(),
                "weather": weather.dict(),
                "soil": soil.dict(),
                "risk": risk.dict(),
                "recommendations": [r.dict() for r in recommendations],
            }

            farm_context_str = build_farm_context(analysis_payload)
            lang_instruction = LANG_INSTRUCTIONS.get(language, "Respond in English.")
            enriched_question = f"{lang_instruction}\n\nFarmer's voice query: {transcript}"

            async for chunk in get_gemini_response_stream(
                question=enriched_question,
                farm_context_str=farm_context_str,
                model="gemini-3-flash-live",
            ):
                await websocket.send_text(chunk)

            # Signal end of stream
            await websocket.send_text("[DONE]")

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_text(f"\n[Error: {str(e)}]")
        await websocket.close(code=1011)

