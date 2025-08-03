from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.schemas import SuggestionRequest, SuggestionResponse
from services.ai_service import get_ai_suggestion
from db.database import get_db

router = APIRouter()

@router.post("/suggestions", response_model=SuggestionResponse)
def get_suggestions(request: SuggestionRequest, db: Session = Depends(get_db)):
    try:
        suggestion = get_ai_suggestion(request.latitude, request.longitude, request.user_preferences, db)
        return SuggestionResponse(suggestion=suggestion)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
