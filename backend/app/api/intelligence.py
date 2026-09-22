from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Farm, User
from app.core.dependencies import get_current_user
from app.services.providers.risk_provider import get_risk_provider
from app.services.providers.crop_provider import get_crop_provider
from app.services.providers.recommendation_provider import get_recommendation_provider

router = APIRouter()

@router.get("/{farm_id}/risk")
async def get_risk(farm_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Farm).filter(Farm.id == farm_id))
    farm = result.scalars().first()
    if not farm or farm.farmer_id != current_user.farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_risk_provider().get_risk_assessment(farm_id).dict()

@router.get("/{farm_id}/crops")
async def get_crops(farm_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Farm).filter(Farm.id == farm_id))
    farm = result.scalars().first()
    if not farm or farm.farmer_id != current_user.farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return [c.dict() for c in get_crop_provider().get_crop_suitability(farm_id)]

@router.get("/{farm_id}/recommendations")
async def get_recommendations(farm_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Farm).filter(Farm.id == farm_id))
    farm = result.scalars().first()
    if not farm or farm.farmer_id != current_user.farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return [r.dict() for r in get_recommendation_provider().get_recommendations(farm_id)]
