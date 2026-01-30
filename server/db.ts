
import { Pool } from "pg";
import { PostgresDialect, Kysely } from "kysely";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is missing in server/.env");
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const dialect = new PostgresDialect({
    pool,
});

// For now using 'any' to avoid complex type generation issues, 
// we can generate types later with 'better-auth/cli' or 'kysely-codegen'
export const db = new Kysely<any>({
    dialect,
});
