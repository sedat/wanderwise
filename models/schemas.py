from pydantic import BaseModel
from typing import List, Optional

class Place(BaseModel):
    location_id: str
    name: str
    distance: Optional[str] = None
    bearing: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    price_level: Optional[str] = None
    cuisine: Optional[List[str]] = []
    category: Optional[str] = None

class UserPreferenceBase(BaseModel):
    preference_type: str
    preference_name: str
    score: float

class UserPreferenceCreate(UserPreferenceBase):
    pass

class UserPreference(UserPreferenceBase):
    id: int
    user_id: str

    class Config:
        orm_mode = True

class UserProfile(BaseModel):
    user_id: str
    # preferences field is removed

class SuggestionRequest(BaseModel):
    user_id: str
    latitude: float
    longitude: float

class SuggestionResponse(BaseModel):
    suggestion: str
    places: List[Place]

class FeedbackCreate(BaseModel):
    user_id: str
    location_id: str
    rating: int

class Feedback(FeedbackCreate):
    id: int

    class Config:
        orm_mode = True
