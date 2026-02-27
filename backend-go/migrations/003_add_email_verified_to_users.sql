-- Migration: Add email_verified column to users table
-- Date: 2026-02-27

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
