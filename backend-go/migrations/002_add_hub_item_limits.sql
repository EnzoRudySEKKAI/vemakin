-- Migration: Add hub item limit columns to users table
-- Date: 2026-02-25

-- Add individual columns for each hub section item limit
-- Default is 3 items per section, range: 2-5

ALTER TABLE users ADD COLUMN IF NOT EXISTS hub_shots_limit INTEGER DEFAULT 3 CHECK (hub_shots_limit BETWEEN 2 AND 5);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hub_tasks_limit INTEGER DEFAULT 3 CHECK (hub_tasks_limit BETWEEN 2 AND 5);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hub_notes_limit INTEGER DEFAULT 3 CHECK (hub_notes_limit BETWEEN 2 AND 5);
ALTER TABLE users ADD COLUMN IF NOT EXISTS hub_equipment_limit INTEGER DEFAULT 3 CHECK (hub_equipment_limit BETWEEN 2 AND 5);

-- Create indexes for potential future queries
CREATE INDEX IF NOT EXISTS idx_users_hub_shots_limit ON users(hub_shots_limit);
CREATE INDEX IF NOT EXISTS idx_users_hub_tasks_limit ON users(hub_tasks_limit);
CREATE INDEX IF NOT EXISTS idx_users_hub_notes_limit ON users(hub_notes_limit);
CREATE INDEX IF NOT EXISTS idx_users_hub_equipment_limit ON users(hub_equipment_limit);
