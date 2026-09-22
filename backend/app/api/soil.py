from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Farm, User
from app.core.dependencies import get_current_user
from app.services.providers.soil_provider import get_soil_provider

router = APIRouter()

@router.get("/{farm_id}/soil")
async def get_soil_data(
    farm_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Farm).filter(Farm.id == farm_id))
    farm = result.scalars().first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.farmer_id != current_user.farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_soil_provider().get_soil_data(farm_id).dict()
