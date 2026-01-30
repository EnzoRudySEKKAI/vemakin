
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const client = await pool.connect();
        console.log("Connected to database");

        // Check all public tables
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);

        console.log("Existing tables:", res.rows.map(r => r.table_name));

        client.release();
        await pool.end();
    } catch (err) {
        console.error("Error:", err);
    }
}

check();
