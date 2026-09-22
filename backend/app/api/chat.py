from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Farm, User
from app.core.dependencies import get_current_user
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini.gemini_service import get_gemini_response, build_farm_context
from app.services.providers.satellite_provider import get_satellite_provider
from app.services.providers.weather_provider import get_weather_provider
from app.services.providers.soil_provider import get_soil_provider
from app.services.providers.risk_provider import get_risk_provider
from app.services.providers.recommendation_provider import get_recommendation_provider

router = APIRouter()


@router.post("/{farm_id}/chat", response_model=ChatResponse)
async def chat_with_farm(
    farm_id: str,
    request: ChatRequest,
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

    # Gather current farm intelligence to ground Gemini
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

    # Convert history to simple dicts
    history = [{"role": m.role, "content": m.content} for m in request.history] if request.history else []

    answer = await get_gemini_response(
        question=request.question,
        farm_context_str=farm_context_str,
        history=history
    )

    return ChatResponse(answer=answer, farm_id=farm_id)
