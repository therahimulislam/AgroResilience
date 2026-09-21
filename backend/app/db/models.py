import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="user", uselist=False)

class Farmer(Base):
    __tablename__ = "farmers"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="farmer")
    farms = relationship("Farm", back_populates="farmer")

class Farm(Base):
    __tablename__ = "farms"
    id = Column(String, primary_key=True, default=generate_uuid)
    farmer_id = Column(String, ForeignKey("farmers.id"), nullable=False)
    name = Column(String, nullable=False)
    area_acres = Column(Float, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    boundary = Column(Geometry(geometry_type='POLYGON', srid=4326), nullable=True)
    irrigation_type = Column(String, nullable=True)
    current_crop = Column(String, nullable=True)
    season = Column(String, nullable=True)
    sowing_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="farms")
    soil_records = relationship("FarmSoil", back_populates="farm")
    risk_assessments = relationship("RiskAssessment", back_populates="farm")

class FarmSoil(Base):
    __tablename__ = "farm_soil"
    id = Column(String, primary_key=True, default=generate_uuid)
    farm_id = Column(String, ForeignKey("farms.id"), nullable=False)
    ph = Column(Float, nullable=True)
    nitrogen = Column(String, nullable=True)
    phosphorus = Column(String, nullable=True)
    potassium = Column(String, nullable=True)
    organic_carbon = Column(String, nullable=True)
    moisture = Column(Float, nullable=True)
    source = Column(String, nullable=True)  # farmer_input, sensor, demo_data
    sample_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="soil_records")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    id = Column(String, primary_key=True, default=generate_uuid)
    farm_id = Column(String, ForeignKey("farms.id"), nullable=False)
    crop_stress = Column(Integer, nullable=True)
    soil_risk = Column(Integer, nullable=True)
    climate_risk = Column(Integer, nullable=True)
    water_risk = Column(Integer, nullable=True)
    overall_risk = Column(Integer, nullable=True)
    risk_level = Column(String, nullable=True)
    model_version = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farm = relationship("Farm", back_populates="risk_assessments")

# Adding partial models for MVP tracking
class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(String, primary_key=True, default=generate_uuid)
    farm_id = Column(String, ForeignKey("farms.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    priority = Column(String, nullable=True)
    reason = Column(String, nullable=True)
    risk_type = Column(String, nullable=True)
    source = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
