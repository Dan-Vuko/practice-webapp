-- Supabase Schema for Metronome Speed Builder
-- Run this in your Supabase SQL Editor

-- Patterns table (shared across all users)
CREATE TABLE IF NOT EXISTS patterns (
  id SERIAL PRIMARY KEY,
  pattern TEXT UNIQUE NOT NULL,
  sequence INTEGER[] NOT NULL
);

-- User Pattern Progress (per-user data)
CREATE TABLE IF NOT EXISTS user_pattern_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pattern_id INTEGER REFERENCES patterns(id) ON DELETE CASCADE NOT NULL,
  string_set TEXT NOT NULL,
  current_bpm INTEGER DEFAULT 60,
  target_bpm INTEGER DEFAULT 150,
  max_bpm_achieved INTEGER DEFAULT 60,
  total_practice_minutes REAL DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  current_cycle_week INTEGER DEFAULT 1,
  cycle_start_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pattern_id, string_set)
);

-- Sessions (per-user data)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_pattern_progress_id UUID REFERENCES user_pattern_progress(id) ON DELETE CASCADE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('max_bpm', 'max_bpm_100_accuracy', 'longest_streak', 'fastest_improvement')),
  value REAL NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pattern_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_bests ENABLE ROW LEVEL SECURITY;

-- Patterns: Everyone can read (shared data)
CREATE POLICY "Patterns are viewable by everyone" ON patterns
  FOR SELECT USING (true);

-- User Pattern Progress: Users can only see/modify their own data
CREATE POLICY "Users can view own progress" ON user_pattern_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_pattern_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_pattern_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON user_pattern_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Sessions: Users can only see/modify their own data
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Attempts: Users can only see/modify their own data
CREATE POLICY "Users can view own attempts" ON attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts" ON attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attempts" ON attempts
  FOR DELETE USING (auth.uid() = user_id);

-- Personal Bests: Users can only see/modify their own data
CREATE POLICY "Users can view own personal_bests" ON personal_bests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personal_bests" ON personal_bests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personal_bests" ON personal_bests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personal_bests" ON personal_bests
  FOR DELETE USING (auth.uid() = user_id);

-- Seed the patterns table
INSERT INTO patterns (id, pattern, sequence) VALUES
  (1, '1213', ARRAY[1, 2, 1, 3]),
  (2, '1231', ARRAY[1, 2, 3, 1]),
  (3, '1234', ARRAY[1, 2, 3, 4]),
  (4, '1243', ARRAY[1, 2, 4, 3]),
  (5, '1312', ARRAY[1, 3, 1, 2]),
  (6, '1321', ARRAY[1, 3, 2, 1]),
  (7, '1324', ARRAY[1, 3, 2, 4]),
  (8, '1342', ARRAY[1, 3, 4, 2]),
  (9, '1423', ARRAY[1, 4, 2, 3]),
  (10, '1432', ARRAY[1, 4, 3, 2]),
  (11, '2134', ARRAY[2, 1, 3, 4]),
  (12, '2143', ARRAY[2, 1, 4, 3]),
  (13, '2314', ARRAY[2, 3, 1, 4]),
  (14, '2341', ARRAY[2, 3, 4, 1]),
  (15, '2413', ARRAY[2, 4, 1, 3]),
  (16, '2431', ARRAY[2, 4, 3, 1]),
  (17, '3142', ARRAY[3, 1, 4, 2]),
  (18, '3412', ARRAY[3, 4, 1, 2])
ON CONFLICT (id) DO NOTHING;
