
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    const client = await pool.connect();
    try {
        console.log("Starting manual migration...");
        await client.query("BEGIN");

        // 1. Update 'users' table
        console.log("Updating 'users' table...");
        await client.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS "role" TEXT,
      ADD COLUMN IF NOT EXISTS "banned" BOOLEAN,
      ADD COLUMN IF NOT EXISTS "ban_reason" TEXT,
      ADD COLUMN IF NOT EXISTS "ban_expires" TIMESTAMP;
    `);

        // 2. Create 'session' table
        console.log("Creating 'session' table...");
        await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "expires_at" TIMESTAMP NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "created_at" TIMESTAMP NOT NULL,
        "updated_at" TIMESTAMP NOT NULL,
        "ip_address" TEXT,
        "user_agent" TEXT,
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "impersonated_by" TEXT
      );
    `);

        // 3. Create 'account' table
        console.log("Creating 'account' table...");
        await client.query(`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "account_id" TEXT NOT NULL,
        "provider_id" TEXT NOT NULL,
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "access_token" TEXT,
        "refresh_token" TEXT,
        "id_token" TEXT,
        "access_token_expires_at" TIMESTAMP,
        "refresh_token_expires_at" TIMESTAMP,
        "scope" TEXT,
        "password" TEXT,
        "created_at" TIMESTAMP NOT NULL,
        "updated_at" TIMESTAMP NOT NULL
      );
    `);

        // 4. Create 'verification' table
        console.log("Creating 'verification' table...");
        await client.query(`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "identifier" TEXT NOT NULL,
        "value" TEXT NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP,
        "updated_at" TIMESTAMP
      );
    `);

        await client.query("COMMIT");
        console.log("Migration successful!");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Migration failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
