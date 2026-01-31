from app.database import engine, Base
from app.models import models
from sqlalchemy import text

def migrate():
    print("Checking/Updating user_inventory table...")
    with engine.connect() as conn:
        # Check existing columns
        res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'user_inventory'"))
        columns = [r[0] for r in res]
        
        if not columns:
            print("Table user_inventory does not exist. Creating all tables...")
            Base.metadata.create_all(bind=engine)
            conn.commit()
            return

        # Add missing columns
        needed = {
            "serial_number": "ALTER TABLE user_inventory ADD COLUMN serial_number VARCHAR",
            "rental_price": "ALTER TABLE user_inventory ADD COLUMN rental_price FLOAT",
            "rental_frequency": "ALTER TABLE user_inventory ADD COLUMN rental_frequency VARCHAR"
        }
        
        for col, sql in needed.items():
            if col not in columns:
                print(f"Adding column {col}...")
                conn.execute(text(sql))
        
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
