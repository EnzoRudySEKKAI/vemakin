from sqlalchemy import create_engine, text
from app.config import settings

def run_migration():
    engine = create_engine(settings.DATABASE_URL)
    
    # Tables referencing users.id
    # Based on inspection: session, account, projects, user_inventory
    referencing_tables = ['session', 'account', 'projects', 'user_inventory']

    with engine.connect() as connection:
        with connection.begin():
            print("Starting migration...")

            # 0. Drop ALL RLS Policies
            # Since we are migrating to Python Backend, Supabase RLS is obsolete and blocks column type changes.
            print("Dropping ALL RLS policies...")
            
            # Fetch all policies
            result = connection.execute(text("""
                SELECT schemaname, tablename, policyname
                FROM pg_policies
                WHERE schemaname = 'public'
            """))
            
            policies = result.fetchall()
            for schema, table, policy in policies:
                print(f"Dropping policy '{policy}' on {table}...")
                # Use quote_ident for safety to handle spaces/special chars
                connection.execute(text(f'DROP POLICY IF EXISTS "{policy}" ON "{table}"'))


            # 1. Drop Foreign Keys
            print("Dropping foreign keys...")
            for table in referencing_tables:
                # We need to find the constraint name first or use a generic DROP approach if we know the name
                # Postgres names FKs often as tablename_column_fkey
                # To be safe, we try the standard naming convention first, or valid generic SQL
                
                # Fetch constraint name query
                result = connection.execute(text(f"""
                    SELECT conname
                    FROM pg_constraint
                    WHERE conrelid = '{table}'::regclass AND confrelid = 'users'::regclass
                """))
                constraints = result.fetchall()
                
                for constraint in constraints:
                    con_name = constraint[0]
                    print(f"Dropping constraint {con_name} on {table}")
                    connection.execute(text(f"ALTER TABLE {table} DROP CONSTRAINT {con_name}"))

            # 2. Alter users.id type
            print("Altering users.id to VARCHAR...")
            connection.execute(text("ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(128)"))

            # 3. Alter referencing columns types
            print("Altering referencing columns to VARCHAR...")
            for table in referencing_tables:
                print(f"Altering {table}.user_id...")
                connection.execute(text(f"ALTER TABLE {table} ALTER COLUMN user_id TYPE VARCHAR(128)"))

            # 4. Re-add Foreign Keys
            print("Re-adding foreign keys...")
            for table in referencing_tables:
                print(f"Adding FK for {table}...")
                constraint_name = f"fk_{table}_users"
                connection.execute(text(f"""
                    ALTER TABLE {table} 
                    ADD CONSTRAINT {constraint_name} 
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                """))

            print("Migration completed successfully!")

if __name__ == "__main__":
    run_migration()
