from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth
from app.core.config import settings

app = FastAPI(
    title="AgroResilience API",
    description="Backend for the AI-powered climate-resilient farming platform.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AgroResilience API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
