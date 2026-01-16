-- Supabase Schema for Metronome Speed Builder
-- Run this in your Supabase SQL Editor

-- Drop existing tables to start fresh (careful in production!)
DROP TABLE IF EXISTS personal_bests CASCADE;
DROP TABLE IF EXISTS attempts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS user_pattern_progress CASCADE;

-- User Pattern Progress (per-user data)
CREATE TABLE IF NOT EXISTS user_pattern_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pattern_name TEXT NOT NULL,
  current_bpm INTEGER DEFAULT 60,
  target_bpm INTEGER DEFAULT 150,
  max_bpm_achieved INTEGER DEFAULT 60,
  total_practice_minutes REAL DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  current_cycle_week INTEGER DEFAULT 1,
  cycle_start_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pattern_name)
);

-- Sessions (per-user data)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_pattern_progress_id UUID REFERENCES user_pattern_progress(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes REAL DEFAULT 0,
  starting_bpm INTEGER,
  ending_bpm INTEGER,
  avg_accuracy REAL DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  successful_attempts INTEGER DEFAULT 0,
  myelination_cycle_week INTEGER DEFAULT 1,
  hours_since_last_session REAL DEFAULT 0,
  in_consolidation_window BOOLEAN DEFAULT FALSE
);

-- Attempts (per-user data)
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  attempt_number INTEGER NOT NULL,
  tempo INTEGER NOT NULL,
  accuracy REAL DEFAULT 0,
  notes_played INTEGER DEFAULT 0,
  notes_correct INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  tension_detected BOOLEAN DEFAULT FALSE
);

-- Personal Bests (per-user data)
CREATE TABLE IF NOT EXISTS personal_bests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_pattern_progress_id UUID REFERENCES user_pattern_progress(id) ON DELETE CASCADE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('max_bpm', 'max_bpm_100_accuracy', 'longest_streak', 'fastest_improvement')),
  value REAL NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL
);

-- FretMaster: Fretboard Patterns (per-user data)
CREATE TABLE IF NOT EXISTS fret_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pattern_name TEXT NOT NULL,
  frets TEXT, -- JSON string of fret positions
  description TEXT,
  category TEXT DEFAULT 'scale' CHECK (category IN ('scale', 'chord', 'arpeggio', 'lick', 'exercise', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS disabled for admin testing
-- Patterns are managed in localStorage per-user, progress tracked in Supabase
