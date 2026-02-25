-- Growth OS — Supabase Schema
-- Run these in the Supabase SQL editor to set up the required tables.

-- waitlist table (for collecting waitlist emails)
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
