from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.schemas import FeedbackCreate, Place
from db.database import get_db
from db.models import Feedback
from services.ai_service import update_user_preferences
from services.location_service import get_location_details

router = APIRouter()

@router.post("/feedback", status_code=201)
def create_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    db_feedback = Feedback(**feedback.dict())
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)

    # Update user preferences based on feedback
    place_details = get_location_details(feedback.location_id)
    if place_details:
        place = Place(
            location_id=feedback.location_id,
            name=place_details.get("name"),
            cuisine=[c["name"] for c in place_details.get("cuisine", [])],
            category=place_details.get("category"),
            # We don't need all the details here, just the ones that affect preferences
        )
        update_user_preferences(feedback.user_id, place, feedback.rating, db)

    return {"message": "Feedback submitted successfully"}
