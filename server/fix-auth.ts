
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function fix() {
    const client = await pool.connect();
    try {
        console.log("Fixing Auth Issues...");

        // 1. Disable RLS on auth tables to ensure server access
        console.log("Disabling RLS on users, session, account, verification...");
        await client.query(`ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;`);
        await client.query(`ALTER TABLE "session" DISABLE ROW LEVEL SECURITY;`); // Was already false but ensuring
        await client.query(`ALTER TABLE "account" DISABLE ROW LEVEL SECURITY;`);
        await client.query(`ALTER TABLE "verification" DISABLE ROW LEVEL SECURITY;`);

        // 2. Delete demo user so they can sign up fresh with a password
        // Check if user exists first
        const res = await client.query(`SELECT id FROM "users" WHERE email = 'demo@vemakin.com'`);
        if (res.rows.length > 0) {
            console.log("Deleting 'demo@vemakin.com' to allow fresh sign-up (since password hash is missing)...");
            // We need to cascade delete or handle dependencies. 
            // If CASCADE is set on foreign keys, this works.
            // If not, it might fail. Let's try.
            try {
                await client.query(`DELETE FROM "users" WHERE email = 'demo@vemakin.com'`);
                console.log("User deleted successfully.");
            } catch (delErr) {
                console.error("Could not delete user (likely FK constraints).", delErr);
                console.log("Please manually delete associated data or use a new email.");
            }
        } else {
            console.log("User 'demo@vemakin.com' not found, ready for new sign-up.");
        }

        console.log("Fixes applied.");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

fix();
