"""Database migration script for performance optimizations.

Run this script to create indexes and constraints:
    cd /Users/enzorudysekkai/Documents/Vemakin/backend
    source venv/bin/activate
    python -m app.db_migrations

Or run directly:
    python app/db_migrations.py

Or run individual migrations via psql:
    psql $DATABASE_URL -f app/db_migrations.sql
"""

import sys
from pathlib import Path

# Add parent directory to path for imports when running directly
if __name__ == "__main__" and __package__ is None:
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from app.database import engine
else:
    from .database import engine

from sqlalchemy import text
import logging

logger = logging.getLogger(__name__)

# Migration SQL statements
MIGRATIONS = [
    # Composite indexes for common query patterns
    (
        "idx_projects_user_created",
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_user_created 
        ON projects (user_id, created_at DESC);
        """,
        "DROP INDEX IF EXISTS idx_projects_user_created;",
    ),
    (
        "idx_shots_project_status_date",
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_project_status_date 
        ON shots (project_id, status, date, start_time);
        """,
        "DROP INDEX IF EXISTS idx_shots_project_status_date;",
    ),
    (
        "idx_shots_project_date_time",
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_project_date_time 
        ON shots (project_id, date, start_time);
        """,
        "DROP INDEX IF EXISTS idx_shots_project_date_time;",
    ),
    (
        "idx_equipment_user_status_category",
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_equipment_user_status_category 
        ON user_inventory (user_id, status, category);
        """,
        "DROP INDEX IF EXISTS idx_equipment_user_status_category;",
    ),
    (
        "idx_notes_project_updated",
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_project_updated 
        ON notes (project_id, updated_at DESC);
        """,
        "DROP INDEX IF EXISTS idx_notes_project_updated;",
    ),
    (
        "idx_tasks_project_status_priority",
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_project_status_priority 
        ON post_prod_tasks (project_id, status, priority, due_date);
        """,
        "DROP INDEX IF EXISTS idx_tasks_project_status_priority;",
    ),
    (
        "idx_gear_catalog_category_brand",
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_gear_catalog_category_brand 
        ON gear_catalog (category_id, brand_id);
        """,
        "DROP INDEX IF EXISTS idx_gear_catalog_category_brand;",
    ),
    # Individual column indexes for filtering
    (
        "idx_shots_status",
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_status 
        ON shots (status);
        """,
        "DROP INDEX IF EXISTS idx_shots_status;",
    ),
    (
        "idx_tasks_status",
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_status 
        ON post_prod_tasks (status);
        """,
        "DROP INDEX IF EXISTS idx_tasks_status;",
    ),
    (
        "idx_tasks_priority",
        """
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_priority 
        ON post_prod_tasks (priority);
        """,
        "DROP INDEX IF EXISTS idx_tasks_priority;",
    ),
]


def run_migrations():
    """Run all database migrations."""
    logger.info("Starting database migrations...")

    with engine.begin() as conn:
        for name, create_sql, _ in MIGRATIONS:
            try:
                logger.info(f"Creating index: {name}")
                conn.execute(text(create_sql))
                logger.info(f"✓ Successfully created: {name}")
            except Exception as e:
                if "already exists" in str(e).lower():
                    logger.info(f"  Index {name} already exists, skipping")
                else:
                    logger.error(f"✗ Failed to create {name}: {e}")

    logger.info("Database migrations completed")


def rollback_migrations():
    """Rollback all migrations (drop indexes)."""
    logger.info("Rolling back database migrations...")

    with engine.begin() as conn:
        for name, _, drop_sql in reversed(MIGRATIONS):
            try:
                logger.info(f"Dropping index: {name}")
                conn.execute(text(drop_sql))
                logger.info(f"✓ Successfully dropped: {name}")
            except Exception as e:
                logger.error(f"✗ Failed to drop {name}: {e}")

    logger.info("Rollback completed")


def verify_indexes():
    """Verify all indexes were created successfully."""
    with engine.connect() as conn:
        result = conn.execute(
            text("""
            SELECT indexname, tablename 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname LIKE 'idx_%'
            ORDER BY tablename, indexname;
        """)
        )

        indexes = result.fetchall()
        print("\nCurrent custom indexes:")
        print("-" * 60)
        for idx in indexes:
            print(f"  {idx[0]:<40} on {idx[1]}")
        print("-" * 60)
        print(f"Total: {len(indexes)} indexes\n")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--rollback":
        rollback_migrations()
    else:
        run_migrations()

    verify_indexes()
