from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from .database import get_db, engine, AsyncSessionLocal
from .auth import get_current_user
from .routers import projects, shots, inventory, notes, postprod, catalog, bulk
from .cache import catalog_cache
import time
import logging

logger = logging.getLogger(__name__)

# Background scheduler for cache refresh
scheduler = BackgroundScheduler()


def refresh_catalog_cache_job():
    """Background job to refresh catalog cache every 24 hours."""
    logger.info("[SCHEDULER] Starting daily catalog cache refresh...")
    try:
        # Use sync session for background job as it's outside request context
        import sqlalchemy
        from sqlalchemy.orm import Session
        from .config import settings

        sync_url = settings.DATABASE_URL.replace("+asyncpg", "").replace(
            "postgresql+asyncpg://", "postgresql://"
        )
        sync_engine = sqlalchemy.create_engine(sync_url)
        with Session(sync_engine) as db:
            catalog_cache.warm(db)
            logger.info("[SCHEDULER] Catalog cache refresh completed")
    except Exception as e:
        logger.error(f"[SCHEDULER] Catalog cache refresh failed: {e}")


# Schedule daily refresh at 3:00 AM
scheduler.add_job(
    refresh_catalog_cache_job,
    trigger=CronTrigger(hour=3, minute=0),
    id="catalog_cache_refresh",
    name="Refresh catalog cache",
    replace_existing=True,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup: Try to load catalog cache from JSON file first
    logger.info("[STARTUP] Loading catalog cache...")

    # Try loading from JSON file (sync operation)
    if catalog_cache.load_from_json():
        logger.info("[STARTUP] Catalog cache loaded from file")
    else:
        logger.info("[STARTUP] Cache file not found, warming from database...")
        try:
            async with AsyncSessionLocal() as db:
                await catalog_cache.async_warm(db)
        except Exception as e:
            logger.error(f"[STARTUP] Failed to warm catalog cache: {e}")

    # Start background scheduler
    scheduler.start()
    logger.info("[STARTUP] Background scheduler started")

    yield

    # Shutdown
    logger.info("[SHUTDOWN] Stopping background scheduler...")
    scheduler.shutdown()
    logger.info("[SHUTDOWN] Background scheduler stopped")


app = FastAPI(lifespan=lifespan)

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
app.include_router(bulk.router)


@app.get("/")
def read_root():
    return {"message": "Vemakin Backend is running"}


@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        # Try to execute a simple query to check DB connection
        await db.execute(text("SELECT 1"))

        # Check cache status
        cache_stats = catalog_cache.get_stats()

        return {"status": "ok", "db": "connected", "cache": cache_stats}
    except Exception as e:
        return {"status": "error", "db": str(e)}


@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "uid": current_user.get("uid"),
        "email": current_user.get("email"),
        "message": "You are authenticated with Firebase!",
    }
