import os
import requests
from dotenv import load_dotenv

load_dotenv()

TRIPADVISOR_API_KEY = os.getenv("TRIPADVISOR_API_KEY")
NEARBY_SEARCH_API_URL = "https://api.content.tripadvisor.com/api/v1/location/nearby_search"

def get_nearby_places_from_tripadvisor(latitude: float, longitude: float, keyword: str):
    if not TRIPADVISOR_API_KEY:
        raise ValueError("TripAdvisor API key not found.")

    headers = {"accept": "application/json"}
    params = {
        "latLong": f"{latitude},{longitude}",
        "key": TRIPADVISOR_API_KEY,
        "category": "restaurants",
        "language": "en",
    }

    try:
        response = requests.get(NEARBY_SEARCH_API_URL, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from TripAdvisor API: {e}")
        return None

# This is a placeholder for the Google Places API
# You would need to implement the actual API call here
def get_nearby_places(latitude: float, longitude: float, keyword: str):
    # In a real application, you would use the Google Places API
    # and your API key to fetch real-time data.
    print(f"Fetching places near ({latitude}, {longitude}) with keyword '{keyword}'")
    return [
        {"name": "Restaurant A", "rating": 4.5, "address": "123 Main St"},
        {"name": "Park B", "rating": 4.8, "address": "456 Oak Ave"},
        {"name": "Museum C", "rating": 4.2, "address": "789 Pine Ln"}
    ]
