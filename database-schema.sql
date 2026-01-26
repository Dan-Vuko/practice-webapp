-- ==========================================
-- DATABASE SCHEMA FOR PATTERN PRACTICE TRACKER
-- ==========================================

-- Patterns table (18 rolling patterns)
CREATE TABLE patterns (
  id INTEGER PRIMARY KEY,
  pattern VARCHAR(4) NOT NULL UNIQUE,
  sequence TEXT NOT NULL -- JSON array: [1,2,1,3]
);

-- User pattern practice records
-- Tracks which patterns user is working on with which string sets
CREATE TABLE user_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  pattern_id INTEGER REFERENCES patterns(id),
  string_set INTEGER[] NOT NULL, -- [3, 4, 5] for example
  created_at TIMESTAMP DEFAULT NOW(),
  current_tempo INTEGER DEFAULT 60,
  max_tempo_achieved INTEGER DEFAULT 60,
  total_practice_minutes INTEGER DEFAULT 0,

  -- Myelination tracking
  cycle_start_date DATE,
  current_cycle_week INTEGER DEFAULT 1, -- 1-4 week cycle

  UNIQUE(user_id, pattern_id, string_set)
);

-- Practice sessions (30-minute blocks)
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_pattern_id UUID REFERENCES user_patterns(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_minutes INTEGER,

  -- Session template used
  session_template VARCHAR(50), -- 'foundation', 'progressive', 'advanced'
  training_week INTEGER, -- Which week of training (1-16+)

  -- Neurophysiology tracking
  myelination_cycle_week INTEGER, -- 1-4
  hours_since_last_intense_session DECIMAL,
  session_spacing_hours DECIMAL,
  in_consolidation_window BOOLEAN DEFAULT FALSE,

  -- Session notes
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual exercises within a session
CREATE TABLE session_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  exercise_type VARCHAR(50) NOT NULL, -- 'tension-elimination', 'micro-burst', etc.
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_minutes INTEGER,
  starting_tempo INTEGER,
  ending_tempo INTEGER,

  -- Exercise-specific data (JSON)
  protocol_data JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual attempts within an exercise
CREATE TABLE exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES session_exercises(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  tempo INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),

  -- Performance metrics
  notes_played INTEGER DEFAULT 4, -- 4-note pattern
  notes_correct INTEGER,
  accuracy DECIMAL,

  -- Quality checks
  tension_detected BOOLEAN DEFAULT FALSE,
  fatigue_reported BOOLEAN DEFAULT FALSE,

  -- Timing data (JSON array of note events)
  note_events JSONB,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Note-level timing data (for detailed analysis)
CREATE TABLE note_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES exercise_attempts(id) ON DELETE CASCADE,
  note_index INTEGER NOT NULL, -- 0-3 (4 notes)
  expected_string INTEGER NOT NULL, -- 1, 2, or 3
  expected_time DECIMAL NOT NULL, -- milliseconds
  actual_time DECIMAL, -- milliseconds (null if missed)
  timing_error DECIMAL, -- actual - expected
  correct BOOLEAN NOT NULL,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Personal bests
CREATE TABLE personal_bests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_pattern_id UUID REFERENCES user_patterns(id),
  metric_type VARCHAR(50) NOT NULL, -- 'max_tempo', 'max_tempo_100_accuracy', etc.
  value DECIMAL NOT NULL,
  achieved_at TIMESTAMP NOT NULL,
  session_id UUID REFERENCES practice_sessions(id),

  created_at TIMESTAMP DEFAULT NOW()
);

-- Myelination cycle records
CREATE TABLE myelination_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_pattern_id UUID REFERENCES user_patterns(id),
  cycle_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  starting_tempo INTEGER,
  ending_tempo INTEGER,
  total_sessions INTEGER DEFAULT 0,
  total_practice_minutes INTEGER DEFAULT 0,
  tempo_gain INTEGER, -- ending - starting

  -- Cycle quality metrics
  avg_session_spacing_hours DECIMAL,
  consolidation_windows_respected INTEGER DEFAULT 0,

  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX idx_user_patterns_user_id ON user_patterns(user_id);
CREATE INDEX idx_practice_sessions_user_pattern ON practice_sessions(user_pattern_id);
CREATE INDEX idx_practice_sessions_start_time ON practice_sessions(start_time);
CREATE INDEX idx_session_exercises_session ON session_exercises(session_id);
CREATE INDEX idx_exercise_attempts_exercise ON exercise_attempts(exercise_id);
CREATE INDEX idx_note_events_attempt ON note_events(attempt_id);

-- ==========================================
-- VIEWS FOR COMMON QUERIES
-- ==========================================

-- Pattern progress summary
CREATE VIEW pattern_progress_summary AS
SELECT
  up.id,
  up.user_id,
  p.pattern,
  up.string_set,
  up.current_tempo,
  up.max_tempo_achieved,
  up.total_practice_minutes,
  up.current_cycle_week,
  COUNT(DISTINCT ps.id) as total_sessions,
  MAX(ps.start_time) as last_practice_date,
  AVG(ea.accuracy) as avg_accuracy
FROM user_patterns up
JOIN patterns p ON up.pattern_id = p.id
LEFT JOIN practice_sessions ps ON ps.user_pattern_id = up.id
LEFT JOIN session_exercises se ON se.session_id = ps.id
LEFT JOIN exercise_attempts ea ON ea.exercise_id = se.id
GROUP BY up.id, up.user_id, p.pattern, up.string_set, up.current_tempo,
         up.max_tempo_achieved, up.total_practice_minutes, up.current_cycle_week;

-- Recent session history
CREATE VIEW recent_sessions AS
SELECT
  ps.id,
  ps.start_time,
  ps.duration_minutes,
  p.pattern,
  up.string_set,
  ps.session_template,
  ps.training_week,
  ps.myelination_cycle_week,
  COUNT(se.id) as exercise_count,
  AVG(ea.accuracy) as avg_accuracy
FROM practice_sessions ps
JOIN user_patterns up ON ps.user_pattern_id = up.id
JOIN patterns p ON up.pattern_id = p.id
LEFT JOIN session_exercises se ON se.session_id = ps.id
LEFT JOIN exercise_attempts ea ON ea.exercise_id = se.id
GROUP BY ps.id, ps.start_time, ps.duration_minutes, p.pattern,
         up.string_set, ps.session_template, ps.training_week, ps.myelination_cycle_week
ORDER BY ps.start_time DESC;

-- ==========================================
-- SEED DATA
-- ==========================================

INSERT INTO patterns (id, pattern, sequence) VALUES
(1, '1213', '[1,2,1,3]'),
(2, '1231', '[1,2,3,1]'),
(3, '1232', '[1,2,3,2]'),
(4, '1312', '[1,3,1,2]'),
(5, '1321', '[1,3,2,1]'),
(6, '1323', '[1,3,2,3]'),
(7, '2123', '[2,1,2,3]'),
(8, '2131', '[2,1,3,1]'),
(9, '2132', '[2,1,3,2]'),
(10, '2312', '[2,3,1,2]'),
(11, '2313', '[2,3,1,3]'),
(12, '2321', '[2,3,2,1]'),
(13, '3121', '[3,1,2,1]'),
(14, '3123', '[3,1,2,3]'),
(15, '3132', '[3,1,3,2]'),
(16, '3212', '[3,2,1,2]'),
(17, '3213', '[3,2,1,3]'),
(18, '3231', '[3,2,3,1]');
