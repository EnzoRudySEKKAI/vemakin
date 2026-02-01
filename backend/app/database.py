from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from .config import settings

SQL_ALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Optimized connection pooling for better performance
engine = create_engine(
    SQL_ALCHEMY_DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,  # Number of connections to keep in pool (default is 5)
    max_overflow=20,  # Number of connections to create beyond pool_size (default is 10)
    pool_pre_ping=True,  # Verify connections before using them (prevents stale connections)
    pool_recycle=3600,  # Recycle connections after 1 hour (prevents stale connections)
    pool_timeout=30,  # Timeout for getting connection from pool
    echo=False,  # Set to True for SQL query logging during debugging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
