from sqlalchemy import create_engine, text
from app.config import settings

def inspect_policies():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as connection:
        result = connection.execute(text("""
            SELECT polname, pg_get_expr(polqual, polrelid) as policy_qual, pg_get_expr(polwithcheck, polrelid) as policy_with_check
            FROM pg_policy
            JOIN pg_class ON pg_policy.polrelid = pg_class.oid
            WHERE pg_class.relname = 'users';
        """))
        
        print("Policies on 'users' table:")
        for row in result:
            print(f"Name: {row[0]}")
            print(f"Qual: {row[1]}")
            print(f"WithCheck: {row[2]}")
            print("-" * 20)

if __name__ == "__main__":
    inspect_policies()
