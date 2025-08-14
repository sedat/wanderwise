from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.schemas import SuggestionRequest, SuggestionResponse, UserProfile
from services.ai_service import get_ai_suggestion
from db.database import get_db

router = APIRouter()

@router.post("/suggestions", response_model=SuggestionResponse)
def get_suggestions(request: SuggestionRequest, db: Session = Depends(get_db)):
    try:
        user_profile = UserProfile(user_id=request.user_id)
        result = get_ai_suggestion(request.latitude, request.longitude, user_profile, db)
        return SuggestionResponse(suggestion=result["suggestion"], places=result["places"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
