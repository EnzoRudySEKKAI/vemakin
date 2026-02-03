from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import get_db, engine
from .auth import get_current_user
from .routers import projects, shots, inventory, notes, postprod, catalog
from .models import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS Configuration
origins = [
    # Local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://[::1]:3000",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://[::1]:3002",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://[::1]:5173",
    # Production (Firebase Hosting)
    "https://vemakin.web.app",
    "https://vemakin.firebaseapp.com",
    "https://*.vemakin.web.app",
    "https://*.vemakin.firebaseapp.com",
    # Mobile apps (Capacitor)
    "capacitor://localhost",
    "https://localhost",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(projects.router)
app.include_router(shots.router)
app.include_router(inventory.router)
app.include_router(notes.router)
app.include_router(postprod.router)
app.include_router(catalog.router)


@app.get("/")
def read_root():
    return {"message": "Vemakin Backend is running"}


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Try to execute a simple query to check DB connection
        db.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "db": str(e)}


@app.get("/users/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "uid": current_user.get("uid"),
        "email": current_user.get("email"),
        "message": "You are authenticated with Firebase!",
    }
