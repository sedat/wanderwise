from fastapi import FastAPI
from app.routes import suggestions, feedback, preferences
from db.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(suggestions.router)
app.include_router(feedback.router)
app.include_router(preferences.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Location-Based AI Suggestion App"}
