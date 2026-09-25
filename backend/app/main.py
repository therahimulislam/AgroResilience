from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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