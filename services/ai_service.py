import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from services.location_service import get_nearby_places
from models.schemas import Place, UserProfile, UserPreference
from db.models import Feedback, UserPreference as db_UserPreference
from typing import List, Dict
from sqlalchemy.orm import Session

# Load LLM
def load_llm(provider="google"):
    if provider == "google":
        return ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)
    elif provider == "lm-studio":
        return ChatOpenAI(
            base_url="http://localhost:1234/v1",
            api_key="lm-studio",
            model="lm-studio",
        )
    # Add other providers here
    else:
        raise ValueError(f"Unsupported AI provider: {provider}")

def update_user_preferences(user_id: str, place: Place, rating: int, db: Session):
    # This is a simplified logic. A more advanced model would have more sophisticated updates.
    learning_rate = 0.1
    for cuisine in place.cuisine:
        preference = db.query(db_UserPreference).filter_by(user_id=user_id, preference_type="cuisine", preference_name=cuisine).first()
        if not preference:
            preference = db_UserPreference(user_id=user_id, preference_type="cuisine", preference_name=cuisine, score=0.5)
            db.add(preference)
        
        if rating > 3:
            preference.score += learning_rate
        else:
            preference.score -= learning_rate
        preference.score = max(0, min(1, preference.score)) # Keep score between 0 and 1
    
    db.commit()

def content_based_filter(places: List[Place], user_profile: UserProfile, db: Session) -> List[Place]:
    user_preferences = db.query(db_UserPreference).filter(db_UserPreference.user_id == user_profile.user_id).all()
    preference_scores = {(p.preference_type, p.preference_name): p.score for p in user_preferences}

    user_feedback = db.query(Feedback).filter(Feedback.user_id == user_profile.user_id).all()
    feedback_scores = {f.location_id: f.rating for f in user_feedback}

    scores = []
    for place in places:
        if feedback_scores.get(place.location_id) == 1:
            continue

        score = 0
        # Score based on preferences
        for cuisine in place.cuisine:
            score += preference_scores.get(("cuisine", cuisine.lower()), 0)
        score += preference_scores.get(("category", place.category.lower()), 0)

        # Adjust score based on feedback
        if place.location_id in feedback_scores:
            score += (feedback_scores[place.location_id] - 3) * 0.2 # Weighted feedback with less impact

        scores.append((score, place))
    
    scores.sort(key=lambda x: x[0], reverse=True)
    return [place for score, place in scores]

def get_ai_suggestion(latitude: float, longitude: float, user_profile: UserProfile, db: Session) -> Dict:
    places = get_nearby_places(latitude, longitude)
    ranked_places = content_based_filter(places, user_profile, db)
    top_places = ranked_places[:5]

    user_preferences = db.query(db_UserPreference).filter(db_UserPreference.user_id == user_profile.user_id).all()
    preferences_text = ", ".join([f"{p.preference_name} ({p.preference_type})" for p in user_preferences])

    formatted_places = ""
    for place in top_places:
        formatted_places += f"- Name: {place.name}\n"
        formatted_places += f"  Distance: {place.distance}\n"
        formatted_places += f"  Rating: {place.rating}\n"
        formatted_places += f"  Cuisine: {', '.join(place.cuisine)}\n\n"

    prompt = ChatPromptTemplate.from_template("""
    You are a personal travel assistant. Your goal is to provide a highly personalized and enthusiastic recommendation for places to visit.

    Here is the user's profile:
    - Preferences: {user_preferences}

    Based on this profile, I have found a few places that I think you'll love:
    {places}

    Please provide a compelling and personalized recommendation for the user. Explain WHY these places are a good fit for their preferences. Be conversational and engaging.
    Answer:
    """)

    llm = load_llm(provider=os.getenv("AI_PROVIDER", "lm-studio"))
    chain = prompt | llm
    response = chain.invoke({"places": formatted_places, "user_preferences": preferences_text})

    return {"suggestion": response.content, "places": top_places}