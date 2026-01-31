import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not set")
    exit(1)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

catalog_tables = [
    "brands", "categories", "gear_catalog",
    "specs_audio", "specs_cameras", "specs_lenses", "specs_lights",
    "specs_monitoring", "specs_props", "specs_stabilizers", "specs_tripods",
    "specs_wireless", "specs_drones", "specs_filters", "specs_grip"
]

all_tables = inspector.get_table_names()

for table in catalog_tables:
    if table in all_tables:
        print(f"\n--- Table: {table} ---")
        columns = inspector.get_columns(table)
        for col in columns:
            print(f"  {col['name']} ({col['type']})")
        
        # Check if there are any samples
        with engine.connect() as conn:
            from sqlalchemy import text
            res = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            print(f"  Rows: {res}")
    else:
        print(f"\nTable '{table}' DOES NOT exist.")
