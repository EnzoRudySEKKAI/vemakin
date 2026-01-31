from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in .env")
    exit(1)

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("--- Projects Table ---")
    result = conn.execute(text("SELECT id, name, user_id FROM projects"))
    for row in result:
        print(row)

    print("\n--- Users Table ---")
    result = conn.execute(text("SELECT id, email, name FROM users"))
    for row in result:
        print(row)
