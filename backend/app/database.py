from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import QueuePool, NullPool
from .config import settings
import logging
import time

# Configure logging
logger = logging.getLogger(__name__)

SQL_ALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Cloud SQL optimized connection pooling
# Reduced pool sizes to respect Cloud SQL connection limits (100 per instance)
# pool_recycle < Cloud SQL's connection timeout (10 minutes)
engine = create_engine(
    SQL_ALCHEMY_DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,  # Conservative for Cloud SQL (can be increased if needed)
    max_overflow=10,  # Conservative overflow
    pool_pre_ping=True,  # Verify connections before using (prevents stale)
    pool_recycle=300,  # Recycle every 5 minutes (< Cloud SQL 10 min timeout)
    pool_timeout=30,  # Wait up to 30 seconds for available connection
    echo=False,  # Set to True for SQL query debugging
    connect_args={
        "connect_timeout": 10,
        "options": "-c statement_timeout=30000",  # 30 second query timeout
    },
)


# Monitor slow queries
@event.listens_for(engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    context._query_start_time = time.time()


@event.listens_for(engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - context._query_start_time
    if total > 1.0:  # Log queries taking longer than 1 second
        logger.warning(f"Slow query ({total:.2f}s): {statement[:200]}...")


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,  # Better performance for read-heavy workloads
)


# SQLAlchemy 2.0 style declarative base
class Base(DeclarativeBase):
    pass


def get_db():
    """Yield database session with automatic cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_pool_status():
    """Get current connection pool statistics."""
    return {
        "size": engine.pool.size(),
        "checked_in": engine.pool.checkedin(),
        "checked_out": engine.pool.checkedout(),
        "overflow": engine.pool.overflow(),
    }
