-- Growth OS - Complete Supabase Schema
-- Run this entire file in your Supabase SQL Editor to set up the database

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists profiles (
  id                  uuid default gen_random_uuid() primary key,
  user_id             text unique not null,
  email               text,
  name                text,
  avatar_url          text,
  "current_role"      text,
  "target_role"       text,
  years_exp           int,
  timeline            text,
  website_url         text,
  
  -- Data source columns (for displaying what was extracted)
  github_data         jsonb,           -- Original GitHub data (can be jsonb or text)
  github_data_text    text,            -- GitHub data as text (for DataSources component)
  linkedin_raw        text,            -- Original LinkedIn raw data
  linkedin_data       text,            -- LinkedIn profile data (for DataSources component)
  resume_raw          text,            -- Original resume raw data
  resume_text         text,            -- Resume content (for DataSources component)
  
  -- Analysis results
  gap_analysis        jsonb,
  onboarding_complete boolean default false,
  
  -- Timestamps
  created_at          timestamp default now(),
  updated_at          timestamp default now()
);

-- ============================================
-- FEEDBACK TABLE
-- ============================================
create table if not exists feedback (
  id          uuid default gen_random_uuid() primary key,
  user_id     text,
  type        text not null,  -- 'bug' | 'feature' | 'interest' | 'general'
  message     text not null,
  page        text,           -- feature name for interest captures
  created_at  timestamp default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
alter table profiles enable row level security;
alter table feedback enable row level security;

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "Users own their profile" on profiles;
drop policy if exists "Users can view their own feedback" on feedback;
drop policy if exists "Users can create feedback" on feedback;

-- Profiles: Users can only access their own profile
create policy "Users own their profile"
  on profiles for all
  using (user_id = current_setting('app.current_user_id', true));

-- Feedback: Users can view and create their own feedback
create policy "Users can view their own feedback"
  on feedback for select
  using (user_id = current_setting('app.current_user_id', true));

create policy "Users can create feedback"
  on feedback for insert
  with check (user_id = current_setting('app.current_user_id', true));

-- ============================================
-- INDEXES (for performance)
-- ============================================
create index if not exists idx_profiles_user_id on profiles(user_id);
create index if not exists idx_feedback_user_id on feedback(user_id);
create index if not exists idx_feedback_created_at on feedback(created_at);

-- ============================================
-- VERIFY TABLES WERE CREATED
-- ============================================
select 
  table_name,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_name in ('profiles', 'feedback')
order by table_name, ordinal_position;
