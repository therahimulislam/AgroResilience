from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models import Farmer, User
from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/me")
async def get_my_farmer_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Farmer).filter(Farmer.user_id == current_user.id))
    farmer = result.scalars().first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return {
        "id": farmer.id,
        "name": farmer.name,
        "phone": farmer.phone,
        "language": farmer.language,
    }

@router.patch("/me")
async def update_my_farmer_profile(
    update: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Farmer).filter(Farmer.user_id == current_user.id))
    farmer = result.scalars().first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")

    allowed = {"name", "phone", "language"}
    for field, value in update.items():
        if field in allowed:
            setattr(farmer, field, value)

    await db.commit()
    await db.refresh(farmer)
    return {"id": farmer.id, "name": farmer.name, "phone": farmer.phone, "language": farmer.language}
