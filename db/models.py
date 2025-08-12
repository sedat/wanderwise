from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    location_id = Column(String, index=True)
    rating = Column(Integer)

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    preference_type = Column(String)
    preference_name = Column(String)
    score = Column(Float, default=0.5) # Default score for a new preference
