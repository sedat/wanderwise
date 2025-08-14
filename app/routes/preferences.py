from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.schemas import UserPreference, UserPreferenceCreate
from db.database import get_db
from db.models import UserPreference as db_UserPreference
from typing import List

router = APIRouter()

@router.get("/users/{user_id}/preferences", response_model=List[UserPreference])
def get_user_preferences(user_id: str, db: Session = Depends(get_db)):
    return db.query(db_UserPreference).filter(db_UserPreference.user_id == user_id).all()

@router.post("/users/{user_id}/preferences", response_model=UserPreference)
def create_user_preference(user_id: str, preference: UserPreferenceCreate, db: Session = Depends(get_db)):
    db_preference = db_UserPreference(**preference.dict(), user_id=user_id)
    db.add(db_preference)
    db.commit()
    db.refresh(db_preference)
    return db_preference

@router.put("/users/{user_id}/preferences/{preference_id}", response_model=UserPreference)
def update_user_preference(user_id: str, preference_id: int, preference: UserPreferenceCreate, db: Session = Depends(get_db)):
    db_preference = db.query(db_UserPreference).filter(db_UserPreference.id == preference_id, db_UserPreference.user_id == user_id).first()
    if not db_preference:
        raise HTTPException(status_code=404, detail="Preference not found")
    for var, value in vars(preference).items():
        setattr(db_preference, var, value) if value else None
    db.commit()
    db.refresh(db_preference)
    return db_preference

@router.delete("/users/{user_id}/preferences/{preference_id}", status_code=204)
def delete_user_preference(user_id: str, preference_id: int, db: Session = Depends(get_db)):
    db_preference = db.query(db_UserPreference).filter(db_UserPreference.id == preference_id, db_UserPreference.user_id == user_id).first()
    if not db_preference:
        raise HTTPException(status_code=404, detail="Preference not found")
    db.delete(db_preference)
    db.commit()
    return {"message": "Preference deleted"}
