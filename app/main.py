from fastapi import FastAPI
from app.routes import suggestions
from db.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(suggestions.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Location-Based AI Suggestion App"}
