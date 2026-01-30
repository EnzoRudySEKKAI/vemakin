
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "./server/.env" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function inspectTables() {
    const client = await pool.connect();
    try {
        const tables = [
            'categories', 'brands', 'gear_catalog', 'user_inventory',
            'specs_cameras', 'specs_lenses', 'specs_lights'
        ];

        for (const table of tables) {
            const res = await client.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `, [table]);

            console.log(`\nSchema for ${table}:`);
            res.rows.forEach(row => {
                console.log(` - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
            });
        }
    } catch (err) {
        console.error("Error inspecting tables:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

inspectTables();
