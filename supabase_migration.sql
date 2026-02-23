-- Migration: Add data source columns to profiles table
-- Run this in your Supabase SQL Editor
-- This adds columns needed for the DataSources dashboard component

-- Add github_data_text column for storing GitHub data as text
-- (github_data might exist as jsonb, so we add a text version)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS github_data_text TEXT;

-- Add linkedin_data column for storing LinkedIn profile data
-- (linkedin_raw may exist, but we use linkedin_data for consistency)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS linkedin_data TEXT;

-- Add resume_text column for storing resume content
-- (resume_raw may exist, but we use resume_text for consistency)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS resume_text TEXT;

-- Verify the columns were added successfully
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('github_data_text', 'linkedin_data', 'resume_text')
ORDER BY column_name;
