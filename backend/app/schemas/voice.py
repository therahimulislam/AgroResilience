from pydantic import BaseModel
from typing import Optional

class VoiceRequest(BaseModel):
    transcript: str         # STT result from frontend Web Speech API
    language: Optional[str] = "en"

class VoiceResponse(BaseModel):
    answer: str
    farm_id: str
    detected_language: Optional[str] = None
