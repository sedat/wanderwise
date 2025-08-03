from pydantic import BaseModel

class SuggestionRequest(BaseModel):
    latitude: float
    longitude: float
    user_preferences: str

class SuggestionResponse(BaseModel):
    suggestion: str
