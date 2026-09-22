import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from shapely.geometry import shape
from geoalchemy2.shape import from_shape

from app.db.database import get_db
from app.db.models import Farm, User
from app.core.dependencies import get_current_user
from app.schemas.farm import FarmCreate, FarmUpdate, FarmResponse

router = APIRouter()

def parse_geojson(geojson_str: str):
    if not geojson_str:
        return None
    try:
        geom_dict = json.loads(geojson_str)
        if geom_dict.get('type') == 'FeatureCollection':
            # take first feature's geometry
            geom_dict = geom_dict['features'][0]['geometry']
        elif geom_dict.get('type') == 'Feature':
            geom_dict = geom_dict['geometry']
            
        shapely_geom = shape(geom_dict)
        return from_shape(shapely_geom, srid=4326)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid GeoJSON: {str(e)}")

@router.post("/", response_model=FarmResponse)
async def create_farm(
    farm_in: FarmCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not current_user.farmer:
        raise HTTPException(status_code=400, detail="User does not have a farmer profile")

    db_farm = Farm(
        farmer_id=current_user.farmer.id,
        name=farm_in.name,
        area_acres=farm_in.area_acres,
        latitude=farm_in.latitude,
        longitude=farm_in.longitude,
        irrigation_type=farm_in.irrigation_type,
        current_crop=farm_in.current_crop,
        season=farm_in.season,
        sowing_date=farm_in.sowing_date,
    )
    
    if farm_in.boundary_geojson:
        db_farm.boundary = parse_geojson(farm_in.boundary_geojson)

    db.add(db_farm)
    await db.commit()
    await db.refresh(db_farm)
    
    # We do not return the raw boundary binary back by default for simplicity,
    # or we could parse it back to geojson if needed.
    return db_farm

@router.get("/", response_model=List[FarmResponse])
async def read_farms(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not current_user.farmer:
        return []
    result = await db.execute(select(Farm).filter(Farm.farmer_id == current_user.farmer.id))
    return result.scalars().all()

@router.get("/{farm_id}", response_model=FarmResponse)
async def read_farm(
    farm_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Farm).filter(Farm.id == farm_id))
    farm = result.scalars().first()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.farmer_id != current_user.farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this farm")
        
    return farm

@router.patch("/{farm_id}", response_model=FarmResponse)
async def update_farm(
    farm_id: str,
    farm_in: FarmUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Farm).filter(Farm.id == farm_id))
    farm = result.scalars().first()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.farmer_id != current_user.farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this farm")
        
    update_data = farm_in.dict(exclude_unset=True)
    if "boundary_geojson" in update_data:
        if update_data["boundary_geojson"]:
            farm.boundary = parse_geojson(update_data["boundary_geojson"])
        del update_data["boundary_geojson"]
        
    for field, value in update_data.items():
        setattr(farm, field, value)
        
    await db.commit()
    await db.refresh(farm)
    return farm

@router.delete("/{farm_id}", response_model=dict)
async def delete_farm(
    farm_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Farm).filter(Farm.id == farm_id))
    farm = result.scalars().first()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    if farm.farmer_id != current_user.farmer.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this farm")
        
    await db.delete(farm)
    await db.commit()
    return {"status": "success"}
