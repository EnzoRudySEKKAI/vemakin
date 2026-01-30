
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "./server/.env" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function listTables() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.log("Tables in database:");
        res.rows.forEach(row => console.log(` - ${row.table_name}`));
    } catch (err) {
        console.error("Error listing tables:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

listTables();
