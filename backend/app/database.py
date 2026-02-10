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
# Increased pool sizes for better concurrent write performance
# pool_recycle < Cloud SQL's connection timeout (10 minutes)
engine = create_engine(
    SQL_ALCHEMY_DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,  # Increased from 5 for better concurrent performance
    max_overflow=20,  # Increased from 10 for burst handling
    pool_pre_ping=True,  # Verify connections before using (prevents stale)
    pool_recycle=300,  # Recycle every 5 minutes (< Cloud SQL 10 min timeout)
    pool_timeout=10,  # Reduced from 30 to fail fast if pool exhausted
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
