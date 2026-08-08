-- =================================================================
-- Migration: 001_create_contact_messages.sql
-- Description: Create the contact_messages table for the
--              portfolio contact form backend.
--
-- Run this in: Supabase Dashboard → SQL Editor
--   OR via CLI: supabase db push
-- =================================================================

-- Enable UUID generation (already available in Supabase by default)
-- If running on a vanilla PostgreSQL instance, uncomment the line below:
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------
-- TABLE: contact_messages
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (

    -- Primary key: server-generated UUID (never auto-increment integers
    -- in a public API — they expose row count and enable enumeration).
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core form fields
    name         TEXT        NOT NULL CHECK (char_length(name)    BETWEEN 2  AND 100),
    email        TEXT        NOT NULL CHECK (char_length(email)   BETWEEN 5  AND 254),
    subject      TEXT        NOT NULL CHECK (char_length(subject) BETWEEN 3  AND 150),
    message      TEXT        NOT NULL CHECK (char_length(message) BETWEEN 10 AND 3000),

    -- Audit / metadata
    ip_address   TEXT,                          -- sender's IP (optional)
    user_agent   TEXT,                          -- sender's browser UA (optional)
    status       TEXT        NOT NULL DEFAULT 'new'
                             CHECK (status IN ('new', 'read', 'replied', 'spam')),

    -- Timestamps
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------
-- INDEX: speed up duplicate-check queries
-- (email + subject + created_at are used in the 10-minute
--  duplicate-submission guard in contactService.js)
-- -----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_contact_email_subject
    ON public.contact_messages (email, subject, created_at DESC);

-- -----------------------------------------------------------------
-- TRIGGER: keep updated_at current on every row update
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.contact_messages;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Enable RLS so the table is inaccessible by default.
-- The backend uses the SERVICE ROLE KEY which bypasses RLS,
-- so the INSERT still works. This prevents any anon/public
-- key from reading or writing the table directly.
-- -----------------------------------------------------------------
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- No policies are created intentionally:
-- Only the service role (used server-side) can access this table.
-- This means the table is effectively write-only for anyone
-- using the public anon key.

-- -----------------------------------------------------------------
-- OPTIONAL: Grant read access to your own authenticated admin user
-- Uncomment and replace <your-admin-email> if you want to view
-- submissions directly from the Supabase dashboard table editor.
-- -----------------------------------------------------------------
-- CREATE POLICY "Admin can view all messages"
--     ON public.contact_messages
--     FOR SELECT
--     TO authenticated
--     USING (auth.email() = '<your-admin-email>');

-- -----------------------------------------------------------------
-- Verification query — run this after applying the migration
-- to confirm the table was created correctly:
-- -----------------------------------------------------------------
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'contact_messages'
-- ORDER BY ordinal_position;
