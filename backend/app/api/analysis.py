from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Farm, User
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.services.providers.satellite_provider import get_satellite_provider
from app.services.providers.weather_provider import get_weather_provider
from app.services.providers.soil_provider import get_soil_provider
from app.services.providers.risk_provider import get_risk_provider
from app.services.providers.crop_provider import get_crop_provider
from app.services.providers.recommendation_provider import get_recommendation_provider

router = APIRouter()

@router.post("/{farm_id}/analyze")
async def analyze_farm(
    farm_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Load and validate farm ownership
    result = await db.execute(select(Farm).filter(Farm.id == farm_id))
    farm = result.scalars().first()

    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.farmer_id != current_user.farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this farm")

    # 2. Orchestrate intelligence services — pass farm for context-aware data
    satellite_data = get_satellite_provider().get_satellite_data(farm_id, farm)
    weather_data = get_weather_provider().get_weather_data(farm_id, farm)
    soil_data = get_soil_provider().get_soil_data(farm_id, farm)
    risk_data = get_risk_provider().get_risk_assessment(farm_id, farm)
    crop_data = get_crop_provider().get_crop_suitability(farm_id, farm)
    recommendations = get_recommendation_provider().get_recommendations(farm_id, farm)

    # 3. Return aggregated response
    return {
        "farm": {
            "id": farm.id,
            "name": farm.name,
            "area_acres": farm.area_acres,
            "current_crop": farm.current_crop,
            "season": farm.season,
            "irrigation_type": farm.irrigation_type,
        },
        "satellite": satellite_data.dict(),
        "weather": weather_data.dict(),
        "soil": soil_data.dict(),
        "risk": risk_data.dict(),
        "crop_suitability": [c.dict() for c in crop_data],
        "recommendations": [r.dict() for r in recommendations],
        "data_mode": settings.PROVIDER_MODE,
        "analyzed_at": datetime.utcnow().isoformat()
    }
