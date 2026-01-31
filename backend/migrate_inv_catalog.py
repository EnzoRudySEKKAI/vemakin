from app.database import engine, Base
from app.models import models
from sqlalchemy import text

def migrate():
    print("Checking/Updating user_inventory table for catalog_item_id...")
    with engine.connect() as conn:
        # Check existing columns
        res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'user_inventory'"))
        columns = [r[0] for r in res]
        
        if "catalog_item_id" not in columns:
            print("Adding column catalog_item_id...")
            conn.execute(text("ALTER TABLE user_inventory ADD COLUMN catalog_item_id UUID"))
            conn.execute(text("ALTER TABLE user_inventory ADD CONSTRAINT fk_user_inventory_catalog FOREIGN KEY (catalog_item_id) REFERENCES gear_catalog(id)"))
        
        if "is_owned" not in columns:
            print("Adding column is_owned...")
            conn.execute(text("ALTER TABLE user_inventory ADD COLUMN is_owned BOOLEAN DEFAULT TRUE"))
            # Update existing to true
            conn.execute(text("UPDATE user_inventory SET is_owned = TRUE"))
        
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
