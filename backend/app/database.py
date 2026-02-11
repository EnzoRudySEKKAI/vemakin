from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool
from .config import settings
import logging
import time

# Configure logging
logger = logging.getLogger(__name__)

# Convert DATABASE_URL to async format
# postgresql:// -> postgresql+asyncpg://
SQL_ALCHEMY_DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
).replace("postgres://", "postgresql+asyncpg://")

# Async engine with optimized connection pooling
engine = create_async_engine(
    SQL_ALCHEMY_DATABASE_URL,
    poolclass=NullPool,  # Use NullPool for serverless environments like Cloud Run
    echo=False,
    connect_args={
        "timeout": 10,
        "command_timeout": 30,
    },
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# SQLAlchemy 2.0 style declarative base
class Base(DeclarativeBase):
    pass


async def get_db():
    """Yield async database session with automatic cleanup."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_db_pool_status():
    """Get current connection pool statistics."""
    return {
        "size": engine.pool.size() if hasattr(engine.pool, "size") else 0,
        "checked_in": engine.pool.checkedin()
        if hasattr(engine.pool, "checkedin")
        else 0,
        "checked_out": engine.pool.checkedout()
        if hasattr(engine.pool, "checkedout")
        else 0,
        "overflow": engine.pool.overflow() if hasattr(engine.pool, "overflow") else 0,
    }
