from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, farms, analysis, chat, voice, farmers, satellite, weather, soil, intelligence
from app.core.config import settings

from app.schemas.intelligence import AnalysisRequest, AnalysisResponse
from app.services.intelligence import analyze_farm


app = FastAPI(
    title="AgroResilience API",
    description="Backend for the AI-powered climate-resilient farming platform.",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(farmers.router, prefix=f"{settings.API_V1_STR}/farmers", tags=["farmers"])
app.include_router(farms.router, prefix=f"{settings.API_V1_STR}/farms", tags=["farms"])
app.include_router(analysis.router, prefix=f"{settings.API_V1_STR}/farms", tags=["analysis"])
app.include_router(satellite.router, prefix=f"{settings.API_V1_STR}/farms", tags=["satellite"])
app.include_router(weather.router, prefix=f"{settings.API_V1_STR}/farms", tags=["weather"])
app.include_router(soil.router, prefix=f"{settings.API_V1_STR}/farms", tags=["soil"])
app.include_router(intelligence.router, prefix=f"{settings.API_V1_STR}/farms", tags=["intelligence"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/farms", tags=["chat"])
app.include_router(voice.router, prefix=f"{settings.API_V1_STR}/farms", tags=["voice"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AgroResilience API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post(
    "/api/intelligence/analyze",
    response_model=AnalysisResponse
)
def analyze(request: AnalysisRequest):
    return analyze_farm(request)