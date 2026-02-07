from fastapi import FastAPI, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import get_db, engine
from .auth import get_current_user
from .routers import projects, shots, inventory, notes, postprod, catalog
from .models import models
import time
import logging

logger = logging.getLogger(__name__)

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
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# HTTP Caching Middleware
class CacheControlMiddleware(BaseHTTPMiddleware):
    """Add appropriate Cache-Control headers based on route and method."""

    # Cache durations in seconds
    CACHE_CONFIG = {
        # Catalog data changes rarely
        "/catalog": 3600,  # 1 hour
        # Project data can be cached briefly
        "/projects": 60,  # 1 minute
        "/shots": 30,  # 30 seconds
        "/notes": 30,  # 30 seconds
        "/postprod": 30,  # 30 seconds
        "/inventory": 60,  # 1 minute
    }

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Only cache GET requests
        if request.method != "GET":
            response.headers["Cache-Control"] = "no-store"
            return response

        # Check if route matches any cache config
        path = request.url.path
        max_age = None

        for route_prefix, duration in self.CACHE_CONFIG.items():
            if path.startswith(route_prefix):
                max_age = duration
                break

        if max_age:
            # Add cache headers
            response.headers["Cache-Control"] = f"private, max-age={max_age}"
            response.headers["Vary"] = "Authorization"
        else:
            # Default: no caching for unmatched routes
            response.headers["Cache-Control"] = "no-store"

        return response


app.add_middleware(CacheControlMiddleware)


# Request timing middleware for performance monitoring
@app.middleware("http")
async def request_timing_middleware(request: Request, call_next):
    """Log slow requests for performance monitoring."""
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    # Log slow requests (> 1 second)
    if duration > 1.0:
        logger.warning(
            f"Slow request: {request.method} {request.url.path} took {duration:.2f}s"
        )

    # Add timing header in development
    if "X-Request-Time" not in response.headers:
        response.headers["X-Request-Time"] = f"{duration:.3f}s"

    return response


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
