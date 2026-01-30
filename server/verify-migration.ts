
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "./server/.env" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verify() {
    const client = await pool.connect();
    try {
        const gearRes = await client.query('SELECT count(*) FROM gear_catalog');
        console.log('Total gear items in catalog:', gearRes.rows[0].count);

        const tables = [
            'categories', 'brands', 'specs_cameras', 'specs_lenses',
            'specs_lights', 'specs_filters', 'specs_tripods', 'specs_stabilizers',
            'specs_audio', 'specs_grip', 'specs_monitoring', 'specs_wireless',
            'specs_drones', 'specs_props'
        ];

        for (const table of tables) {
            const res = await client.query(`SELECT count(*) FROM ${table}`);
            console.log(` - ${table}: ${res.rows[0].count} records`);
        }
    } catch (err) {
        console.error("Verification failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

verify();
