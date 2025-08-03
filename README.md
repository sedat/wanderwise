# Location-Based AI Suggestion App

This is the backend for a location-based AI suggestion app that uses FastAPI, Google Gemini, and LangChain.

## Setup

1.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Set up the local database:**
    -   Start the PostgreSQL service:
        ```bash
        docker-compose up -d
        ```

3.  **Configure environment variables:**
    -   Copy the `.env.template` file to `.env`:
        ```bash
        cp .env.template .env
        ```
    -   Edit the `.env` file and add your Google API key.

4.  **Run the application:**
    ```bash
    uvicorn app.main:app --reload
    ```

## Testing

You can test the application by sending a POST request to the `/suggestions` endpoint. Here's an example using `curl`:

```bash
curl -X POST "http://127.0.0.1:8000/suggestions" -H "Content-Type: application/json" -d '
{
  "latitude": 45.4642,
  "longitude": 9.1900,
  "user_preferences": "restaurants"
}
'
```
