import os
import requests
from dotenv import load_dotenv
from models.schemas import Place

load_dotenv()

TRIPADVISOR_API_KEY = os.getenv("TRIPADVISOR_API_KEY")
NEARBY_SEARCH_API_URL = "https://api.content.tripadvisor.com/api/v1/location/nearby_search"
LOCATION_DETAILS_API_URL = "https://api.content.tripadvisor.com/api/v1/location/{location_id}/details"

def get_location_details(location_id: str):
    if not TRIPADVISOR_API_KEY:
        raise ValueError("TripAdvisor API key not found.")

    headers = {"accept": "application/json"}
    params = {
        "key": TRIPADVISOR_API_KEY,
        "language": "en",
        "currency": "USD"
    }
    url = LOCATION_DETAILS_API_URL.format(location_id=location_id)

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching location details for location ID {location_id}: {e}")
        return None

def get_nearby_places(latitude: float, longitude: float):
    if not TRIPADVISOR_API_KEY:
        raise ValueError("TripAdvisor API key not found.")

    headers = {"accept": "application/json"}
    categories = ["restaurants", "attractions"]
    all_places_data = []

    for category in categories:
        params = {
            "latLong": f"{latitude},{longitude}",
            "key": TRIPADVISOR_API_KEY,
            "category": category,
            "language": "en",
        }

        try:
            response = requests.get(NEARBY_SEARCH_API_URL, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            if "data" in data:
                for place_summary in data["data"]:
                    details = get_location_details(place_summary["location_id"])
                    if details:
                        place = Place(
                            location_id=place_summary["location_id"],
                            name=place_summary.get("name"),
                            distance=place_summary.get("distance"),
                            bearing=place_summary.get("bearing"),
                            address=details.get("address_obj", {}).get("address_string"),
                            rating=details.get("rating"),
                            reviews=details.get("num_reviews"),
                            price_level=details.get("price_level"),
                            cuisine=[c["name"] for c in details.get("cuisine", [])],
                            category=category
                        )
                        all_places_data.append(place)
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data from TripAdvisor API for category {category}: {e}")

    return all_places_data
