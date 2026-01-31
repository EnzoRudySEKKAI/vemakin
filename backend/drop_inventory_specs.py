from app.database import engine
from sqlalchemy import text

def migrate():
    print("Dropping 'specs' column from user_inventory...")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE user_inventory DROP COLUMN IF EXISTS specs"))
            conn.commit()
            print("Column dropped successfully.")
        except Exception as e:
            print(f"Error dropping column: {e}")

if __name__ == "__main__":
    migrate()
