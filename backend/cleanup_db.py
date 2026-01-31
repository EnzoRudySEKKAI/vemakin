from sqlalchemy import create_engine, text
from app.config import settings

def cleanup_db():
    engine = create_engine(settings.DATABASE_URL)
    
    tables_to_drop = ['account', 'session', 'verification'] # verification is common in better-auth/next-auth too

    with engine.connect() as connection:
        with connection.begin():
            print("Starting database cleanup...")
            
            for table in tables_to_drop:
                try:
                    print(f"Dropping table '{table}' if exists...")
                    connection.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                except Exception as e:
                    print(f"Error dropping {table}: {e}")

            print("Cleanup completed successfully!")

if __name__ == "__main__":
    cleanup_db()
