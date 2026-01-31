from app.database import engine
from sqlalchemy import text

def reset_tables():
    with engine.connect() as connection:
        # Drop tables dependent on projects first
        print("Dropping notes...")
        try:
            connection.execute(text("DROP TABLE IF EXISTS notes CASCADE"))
        except Exception as e:
            print(f"Error dropping notes: {e}")

        print("Dropping shots...")
        try:
            connection.execute(text("DROP TABLE IF EXISTS shots CASCADE"))
        except Exception as e:
            print(f"Error dropping shots: {e}")

        print("Dropping post_prod_tasks...")
        try:
            connection.execute(text("DROP TABLE IF EXISTS post_prod_tasks CASCADE"))
        except Exception as e:
            print(f"Error dropping post_prod_tasks: {e}")
            
        # Drop projects table
        print("Dropping projects...")
        try:
            connection.execute(text("DROP TABLE IF EXISTS projects CASCADE"))
        except Exception as e:
            print(f"Error dropping projects: {e}")

        connection.commit()
        print("Tables dropped successfully.")

if __name__ == "__main__":
    reset_tables()
