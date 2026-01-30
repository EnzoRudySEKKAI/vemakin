
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function debug() {
    const client = await pool.connect();
    try {
        console.log("Checking for user 'demo@vemakin.com'...");

        // Check user
        const userRes = await client.query(`SELECT * FROM "users" WHERE email = 'demo@vemakin.com'`);
        if (userRes.rows.length === 0) {
            console.log("User NOT found in 'users' table.");
        } else {
            console.log("User FOUND in 'users' table:", userRes.rows[0]);
            const userId = userRes.rows[0].id;

            // Check account
            const accountRes = await client.query(`SELECT * FROM "account" WHERE user_id = $1`, [userId]);
            if (accountRes.rows.length === 0) {
                console.log("No linked ACCOUNT found for this user. Password login will fail.");
            } else {
                console.log("Account FOUND:", accountRes.rows[0]);
            }
        }

        // Check RLS
        console.log("\nChecking RLS Policies...");
        const tables = ['users', 'session', 'account', 'verification'];
        for (const table of tables) {
            const rlsRes = await client.query(`SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = $1`, [table]);
            if (rlsRes.rows.length > 0) {
                console.log(`Table '${table}' RLS enabled: ${rlsRes.rows[0].rowsecurity}`);
            }
        }

        const policiesRes = await client.query(`SELECT * FROM pg_policies WHERE schemaname = 'public'`);
        console.log("Active Policies:", policiesRes.rows.map(p => `${p.tablename}: ${p.policyname}`));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

debug();
