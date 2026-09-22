from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FarmBase(BaseModel):
    name: str
    area_acres: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    # Boundary will be passed as a GeoJSON string/dict from the frontend
    boundary_geojson: Optional[str] = None
    irrigation_type: Optional[str] = None
    current_crop: Optional[str] = None
    season: Optional[str] = None
    sowing_date: Optional[datetime] = None

class FarmCreate(FarmBase):
    pass

class FarmUpdate(FarmBase):
    name: Optional[str] = None

class FarmResponse(FarmBase):
    id: str
    farmer_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
