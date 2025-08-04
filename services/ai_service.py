import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from services.location_service import get_nearby_places, get_nearby_places_from_tripadvisor

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

def get_ai_suggestion(latitude: float, longitude: float, user_preferences: str, db):
    # Fetch real-time data
    places = get_nearby_places_from_tripadvisor(latitude, longitude, "")

    # Create a prompt with the fetched data
    prompt = ChatPromptTemplate.from_template("""
    You are a location-based AI assistant. Provide personalized suggestions based on the user's location and preferences.
    Here are some nearby places:
    {places}

    User Request: Give me suggestions for {user_preferences} near {latitude}, {longitude}.
    Answer:
    """)

    # Load LLM and invoke the chain
    llm = load_llm(provider=os.getenv("AI_PROVIDER", "lm-studio"))
    chain = prompt | llm
    response = chain.invoke({"places": places, "user_preferences": user_preferences, "latitude": latitude, "longitude": longitude})

    return response.content
