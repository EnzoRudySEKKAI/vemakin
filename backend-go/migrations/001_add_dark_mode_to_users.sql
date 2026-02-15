-- Migration: Add dark_mode column to users table
-- Date: 2026-02-14

-- Add dark_mode column to users table
-- NULL means use system default (light mode for new users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_dark_mode ON users(dark_mode);

-- Note: Existing users will have NULL, which means they'll use the app default (light mode)
-- New users can be set to their preferred mode via the API
