
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "./server/.env" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrateSchema() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        console.log("Creating/updating gear specification tables...");

        // 1. Create new spec tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS "specs_filters" (
                "gear_id" UUID NOT NULL PRIMARY KEY REFERENCES "gear_catalog"("id") ON DELETE CASCADE,
                "type" TEXT,
                "density" TEXT,
                "size" TEXT,
                "material" TEXT,
                "stops" TEXT,
                "weight" TEXT
            );

            CREATE TABLE IF NOT EXISTS "specs_tripods" (
                "gear_id" UUID NOT NULL PRIMARY KEY REFERENCES "gear_catalog"("id") ON DELETE CASCADE,
                "head_type" TEXT,
                "max_payload" TEXT,
                "bowl_size" TEXT,
                "height_range" TEXT,
                "material" TEXT,
                "counterbalance" TEXT,
                "weight" TEXT
            );

            CREATE TABLE IF NOT EXISTS "specs_stabilizers" (
                "gear_id" UUID NOT NULL PRIMARY KEY REFERENCES "gear_catalog"("id") ON DELETE CASCADE,
                "type" TEXT,
                "max_payload" TEXT,
                "axes" TEXT,
                "battery_life" TEXT,
                "weight" TEXT,
                "connectivity" TEXT,
                "dimensions" TEXT
            );

            CREATE TABLE IF NOT EXISTS "specs_audio" (
                "gear_id" UUID NOT NULL PRIMARY KEY REFERENCES "gear_catalog"("id") ON DELETE CASCADE,
                "type" TEXT,
                "pattern" TEXT,
                "freq_response" TEXT,
                "sensitivity" TEXT,
                "max_spl" TEXT,
                "power" TEXT,
                "connector" TEXT,
                "weight" TEXT
            );

            CREATE TABLE IF NOT EXISTS "specs_grip" (
                "gear_id" UUID NOT NULL PRIMARY KEY REFERENCES "gear_catalog"("id") ON DELETE CASCADE,
                "type" TEXT,
                "max_load" TEXT,
                "max_height" TEXT,
                "min_height" TEXT,
                "footprint" TEXT,
                "material" TEXT,
                "mount" TEXT,
                "weight" TEXT
            );

            CREATE TABLE IF NOT EXISTS "specs_monitoring" (
                "gear_id" UUID NOT NULL PRIMARY KEY REFERENCES "gear_catalog"("id") ON DELETE CASCADE,
                "screen" TEXT,
                "resolution" TEXT,
                "brightness" TEXT,
                "inputs" TEXT,
                "power" TEXT,
                "features" TEXT,
                "dimensions" TEXT,
                "weight" TEXT
            );

            CREATE TABLE IF NOT EXISTS "specs_wireless" (
                "gear_id" UUID NOT NULL PRIMARY KEY REFERENCES "gear_catalog"("id") ON DELETE CASCADE,
                "range" TEXT,
                "delay" TEXT,
                "resolution" TEXT,
                "inputs" TEXT,
                "freq" TEXT,
                "power" TEXT,
                "multicast" TEXT,
                "weight" TEXT
            );

            CREATE TABLE IF NOT EXISTS "specs_drones" (
                "gear_id" UUID NOT NULL PRIMARY KEY REFERENCES "gear_catalog"("id") ON DELETE CASCADE,
                "type" TEXT,
                "camera" TEXT,
                "res" TEXT,
                "flight_time" TEXT,
                "transmission" TEXT,
                "sensors" TEXT,
                "speed" TEXT,
                "weight" TEXT
            );

            CREATE TABLE IF NOT EXISTS "specs_props" (
                "gear_id" UUID NOT NULL PRIMARY KEY REFERENCES "gear_catalog"("id") ON DELETE CASCADE,
                "type" TEXT,
                "era" TEXT,
                "material" TEXT,
                "condition" TEXT,
                "quantity" TEXT,
                "dimensions" TEXT,
                "power" TEXT,
                "weight" TEXT
            );
        `);

        // 2. Update existing tables
        console.log("Updating existing spec tables...");
        await client.query(`
            -- Specs Cameras
            ALTER TABLE "specs_cameras" ADD COLUMN IF NOT EXISTS "frame_rate" TEXT;
            
            -- Specs Lenses
            ALTER TABLE "specs_lenses" ADD COLUMN IF NOT EXISTS "filter_size" TEXT;
            
            -- Specs Lights
            ALTER TABLE "specs_lights" ADD COLUMN IF NOT EXISTS "control" TEXT;

            -- Specs Filters (New additions)
            ALTER TABLE "specs_filters" ADD COLUMN IF NOT EXISTS "strength" TEXT;
            ALTER TABLE "specs_filters" ADD COLUMN IF NOT EXISTS "effect" TEXT;
            ALTER TABLE "specs_filters" ADD COLUMN IF NOT EXISTS "components" TEXT;
            ALTER TABLE "specs_filters" ADD COLUMN IF NOT EXISTS "mount" TEXT;

            -- Any other missing ones identified on the fly
        `);

        await client.query("COMMIT");
        console.log("Schema expansion successful!");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Schema expansion failed:", err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrateSchema();
