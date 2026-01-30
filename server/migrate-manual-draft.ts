
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
        // Ensure columns exist: emailVerified, updatedAt, role, banned, banReason, banExpires
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
        // Note: Better Auth default is camelCase but I am mapping. 
        // Wait, if I map 'createdAt' -> 'created_at', I should probably map 'updatedAt' -> 'updated_at' etc.
        // OR I should use camelCase columns if I didn't map them.
        // In auth.ts, I ONLY mapped image->avatar_url and createdAt->created_at.
        // So 'emailVerified' should be 'emailVerified', 'updatedAt' should be 'updatedAt'. 
        // But 'users' usually follows snake_case.
        // User asked to "merge them well".
        // I should probably map ALL camelCase fields to snake_case in auth.ts to be consistent.

        // Let's UPDATE auth.ts schema MAPPING first? No, I'll do it in parallel.
        // I will add columns in camelCase for now to match the current auth.ts config (except the ones I explicitly mapped).
        // Actually, mixing snake_case (existing) and camelCase (new) is ugly.
        // I will map ALL fields to snake_case in auth.ts.

        // So I will ALTER TABLE to add snake_case columns.
        // And I will update auth.ts to map them.

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Migration failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}
// run();
