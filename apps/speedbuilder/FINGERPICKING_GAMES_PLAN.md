# Fingerpicking Pattern Games - Metronome Speed Builder

## Overview

**Concept:** Gamified metronome practice using 18 "rolling cell" patterns that can be applied to any 3-string combination.

**Core Idea:**
- Pattern notation: 1 = low string, 2 = middle, 3 = high string
- 18 patterns total (all triadic permutations)
- Apply to any string combination (e.g., strings 3-4-5, strings 1-2-3, etc.)
- Game mechanics make practice engaging
- Full session logging for progress tracking

---

## The 18 Rolling Patterns

### Starting with 1 (Low String):
- 1213
- 1231
- 1232
- 1312
- 1321
- 1323

### Starting with 2 (Middle String):
- 2123
- 2131
- 2132
- 2312
- 2313
- 2321

### Starting with 3 (High String):
- 3121
- 3123
- 3132
- 3212
- 3213
- 3231

**Pattern Characteristics:**
- Each pattern = 4 notes
- Use 3 strings total
- No repeated consecutive notes (e.g., no 1112 or 2223)
- All patterns are "rolling" (smooth motion between strings)

---

## String Combinations (Flexible Application)

**5-String Guitar (DAEAD tuning):**
- Strings 1-2-3: D4-A3-E3 (high treble)
- Strings 2-3-4: A3-E3-A2 (middle)
- Strings 3-4-5: E3-A2-D2 (bass)

**User can select:**
- Which 3 strings to use
- Open strings or fretted notes
- Any tuning

**Example:**
- Pattern 1213 on strings 3-4-5
- Means: E3-A2-E3-A2 (if open strings)
- Or: Play fretted positions on those strings

---

## Game Modes

### 🎮 Mode 1: Pattern Master

**Objective:** Master all 18 patterns at target tempo

**How It Works:**
```
1. Choose tempo (e.g., 80 BPM)
2. Choose string set (e.g., strings 3-4-5)
3. Game presents random pattern
4. Play pattern 4 times (16 notes total)
5. Game detects accuracy
6. Score:
   - Perfect (100%): +10 points, unlock next pattern
   - Good (75-99%): +5 points
   - Miss (<75%): 0 points, try again

Progress:
- Start with 6 patterns (starting with 1)
- Unlock next 6 after mastering first set
- Unlock final 6 after mastering second set
- Track mastery per pattern per tempo
```

**UI:**
```
┌────────────────────────────────────────────────────────┐
│  🎮 PATTERN MASTER                        Level 3      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Pattern: 1213                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │         ●  ━  ●  ━                              │ │
│  │        LOW MID LOW MID                          │ │
│  │                                                  │ │
│  │    [█████████████████] 92 BPM                   │ │
│  │         ●  ○  ○  ○  (Beat 1/4)                 │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  String Set: [3-4-5 ▼]  (E3-A2-D2)                   │
│  Your Accuracy: 88% 🟡                                │
│  [✓✓✓✗] 3/4 attempts good                            │
│                                                        │
│  Score: 245 pts  •  Streak: 4  •  Best: 12           │
│                                                        │
│  Unlocked Patterns: 12/18 [████████░░░]              │
│                                                        │
│  [Skip Pattern] [Adjust Tempo] [End Session]         │
└────────────────────────────────────────────────────────┘
```

---

### 🏃 Mode 2: Speed Run

**Objective:** Play all 18 patterns once each as fast as possible

**How It Works:**
```
1. Fixed tempo (e.g., 100 BPM)
2. Random pattern order
3. Each pattern played 2 times (8 notes)
4. Move to next pattern immediately
5. Timer runs until all 18 complete
6. Goal: Minimize time, maximize accuracy

Scoring:
- Time: Faster = better
- Accuracy: >90% required to count
- Penalties: -5 seconds per error

Leaderboard:
- Personal best times
- Accuracy percentage
- Combo streaks
```

**UI:**
```
┌────────────────────────────────────────────────────────┐
│  🏃 SPEED RUN                          🔥 Streak: 8    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ⏱️  Time: 2:34 / Goal: <3:00                         │
│  [████████████████████░░░░░░] 75%                     │
│                                                        │
│  Current: 3212  →  Next: 1321                         │
│                                                        │
│  Progress: 14/18 patterns                             │
│  Accuracy: 94% ✓                                      │
│                                                        │
│  Recent:                                               │
│  ✓ 1213 (100%)                                        │
│  ✓ 2131 (100%)                                        │
│  ✓ 3123 (87%)                                         │
│  ✗ 1312 (65%) - RETRY                                 │
│                                                        │
│  Personal Best: 2:23 (96% acc)                        │
└────────────────────────────────────────────────────────┘
```

---

### 🎯 Mode 3: Accuracy Challenge

**Objective:** Maintain 100% accuracy for as long as possible

**How It Works:**
```
1. Start at comfortable tempo (e.g., 80 BPM)
2. Random pattern selection
3. Must maintain 100% accuracy
4. After 5 perfect patterns, tempo increases +5 BPM
5. One mistake = game over
6. Score = highest tempo achieved

Difficulty Ramps:
- Tempo increases every 5 perfect patterns
- Pattern complexity increases (introduce harder patterns)
- String sets can randomize

Scoring:
- 80-100 BPM: Bronze
- 100-120 BPM: Silver
- 120-140 BPM: Gold
- 140+ BPM: Platinum
```

**UI:**
```
┌────────────────────────────────────────────────────────┐
│  🎯 ACCURACY CHALLENGE              🏆 Gold Tier       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Current Tempo: 128 BPM ⚡                            │
│  Perfect Streak: 23 patterns 🔥                       │
│                                                        │
│  Next milestone: 25 patterns → +5 BPM                 │
│  [███████████████████░░] 23/25                        │
│                                                        │
│  Pattern: 2313                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │    ●  ━  ●  ━                                    │ │
│  │   MID LOW MID LOW                                │ │
│  │                                                  │ │
│  │   [●][○][○][○] Beat 1/4                        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ⚠️ ONE MISTAKE ENDS RUN                              │
│                                                        │
│  Best Run: 142 BPM (31 patterns) 🏆                   │
│  Today's Best: 128 BPM (current)                      │
│                                                        │
│  [Pause] [Give Up] [Mute Click]                       │
└────────────────────────────────────────────────────────┘
```

---

### 🔁 Mode 4: Endless Practice

**Objective:** Relaxed practice with adaptive difficulty

**How It Works:**
```
1. Choose starting tempo
2. Random patterns infinitely
3. Tracks accuracy automatically
4. Auto-adjusts tempo to maintain 70% accuracy
5. No game over, just continuous practice
6. Full session stats at end

Features:
- Adaptive tempo (maintains sweet spot)
- Pattern difficulty selection
- Rest intervals optional
- Background music optional
```

**UI:**
```
┌────────────────────────────────────────────────────────┐
│  🔁 ENDLESS PRACTICE               Session: 12:34      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Auto-Adaptive: 95 BPM → 98 BPM ↗                    │
│  (Accuracy high, increasing tempo...)                 │
│                                                        │
│  Pattern: 1323                                         │
│  String Set: Strings 2-3-4                            │
│                                                        │
│  Session Stats:                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                       │
│  Patterns played: 47                                   │
│  Avg accuracy: 78% (Sweet spot! ✓)                    │
│  Time: 12 min 34 sec                                   │
│  BPM range: 90-98                                      │
│                                                        │
│  Recent accuracy: [✓✓✓✗✓✓✗✓✓✓] 70%                   │
│                                                        │
│  [⏸ Pause]  [⏹ End Session]  [⚙ Settings]           │
└────────────────────────────────────────────────────────┘
```

---

### 💪 Mode 5: Burst Training

**Objective:** Explosive speed bursts (research-backed 7-10 sec)

**How It Works:**
```
1. Select one pattern
2. Play at MAXIMUM SPEED for 7-10 seconds
3. Enforced rest: 20-30 seconds
4. Repeat 6-10 bursts
5. Track peak BPM achieved

Based on research:
- 7-10 sec work (before central fatigue)
- 1:2 to 1:3 work:rest ratio
- Activates maximum neural pathways

Scoring:
- Peak BPM detected
- Consistency across bursts
- Progress over time
```

**UI:**
```
┌────────────────────────────────────────────────────────┐
│  💪 BURST TRAINING                     Burst 4/8       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Pattern: 1213 (Low-Mid-Low-Mid)                      │
│  String Set: Strings 3-4-5                            │
│                                                        │
│  ⚡ MAXIMUM SPEED FOR 10 SECONDS ⚡                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │                                                  │ │
│  │          [████████░░] 8.2 / 10.0 sec           │ │
│  │                                                  │ │
│  │         Peak BPM: 187 🔥                        │ │
│  │                                                  │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Previous Bursts:                                      │
│  1. 178 BPM                                           │
│  2. 182 BPM                                           │
│  3. 185 BPM ↗                                         │
│  4. 187 BPM ↗ (current)                               │
│                                                        │
│  Next: 25 sec rest, then Burst 5                      │
│                                                        │
│  Session Best: 187 BPM                                │
│  All-Time Best: 192 BPM                               │
└────────────────────────────────────────────────────────┘
```

---

## Full Session Logging

### Data Captured (Every Session)

```typescript
interface SessionLog {
  // Session metadata
  sessionId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;

  // Game mode
  mode: 'pattern-master' | 'speed-run' | 'accuracy-challenge' | 'endless' | 'burst';

  // Configuration
  stringSet: [number, number, number]; // e.g., [3, 4, 5]
  startingTempo: number;

  // Performance metrics
  patterns: PatternAttempt[];
  totalAttempts: number;
  successfulAttempts: number;
  overallAccuracy: number;

  // Tempo data
  tempoRange: { min: number, max: number, avg: number };
  tempoProgression: { time: number, tempo: number }[];

  // Pattern-specific
  patternStats: {
    pattern: string;
    attempts: number;
    accuracy: number;
    avgTempo: number;
  }[];

  // Scores/achievements
  score: number;
  achievements: string[];
  personalBests: PersonalBest[];

  // Neurophysiology tracking
  myelinationCycleWeek: number;
  consolidationWindowRespected: boolean;
  sessionSpacingHours: number;
}

interface PatternAttempt {
  pattern: string;
  tempo: number;
  timestamp: Date;
  notesPlayed: NoteEvent[];
  accuracy: number;
  success: boolean;
  peakBPM?: number; // For burst mode
}

interface NoteEvent {
  string: number;
  expectedTime: number;
  actualTime: number;
  timingError: number; // milliseconds
  correct: boolean;
}
```

---

## Visual Design (Same Aesthetic as EtudeMaker)

### Color Scheme
```css
:root {
  /* Dark theme */
  --bg-primary: #0f172a;      /* gray-900 */
  --bg-secondary: #1e293b;    /* gray-800 */
  --bg-tertiary: #334155;     /* gray-700 */

  /* Brand colors */
  --brand-primary: #3b82f6;   /* blue-500 */
  --brand-secondary: #8b5cf6; /* purple-500 */

  /* Status colors */
  --success: #10b981;         /* green-500 */
  --warning: #f59e0b;         /* amber-500 */
  --error: #ef4444;           /* red-500 */

  /* Text */
  --text-primary: #f1f5f9;    /* gray-100 */
  --text-secondary: #94a3b8;  /* gray-400 */
  --text-muted: #64748b;      /* gray-500 */
}
```

### Typography
- Font: System font stack (same as EtudeMaker)
- Headings: Bold, large
- Body: Regular weight
- Code/numbers: Monospace

### Components
- Cards: Rounded corners, subtle shadow
- Buttons: Large, clear hover states
- Progress bars: Animated, gradient fills
- Metronome beat: Pulsing circles
- Pattern display: Large, clear notation

---

## Tech Stack

**Frontend:**
- React + TypeScript + Vite
- Tailwind CSS (same as EtudeMaker)
- Web Audio API (metronome engine)
- Recharts (analytics/graphs)

**State Management:**
- Zustand (lightweight)

**Storage:**
- Supabase (recommended for cross-device sync)
- LocalStorage (fallback)

**Audio Input Detection (Optional):**
- Web Audio API + pitch detection
- Real-time accuracy feedback

---

## Implementation Phases

### Phase 1: Core Metronome + Pattern Display (Week 1)
- [ ] Web Audio API metronome engine
- [ ] Pattern notation display (1213, etc.)
- [ ] String set selector
- [ ] Basic tempo control
- [ ] Visual beat indicator

### Phase 2: Pattern Master Game (Week 2)
- [ ] Game logic (scoring, progression)
- [ ] Pattern randomization
- [ ] Accuracy detection (manual or audio)
- [ ] Session logging
- [ ] Progress tracking

### Phase 3: Additional Game Modes (Week 3)
- [ ] Speed Run mode
- [ ] Accuracy Challenge mode
- [ ] Endless Practice mode
- [ ] Burst Training mode
- [ ] Mode selection UI

### Phase 4: Full Logging & Analytics (Week 4)
- [ ] Complete session logging
- [ ] Progress graphs
- [ ] Pattern-specific stats
- [ ] Personal bests tracking
- [ ] Myelination cycle tracking

### Phase 5: Integration & Polish (Week 5)
- [ ] Practice Tracker integration
- [ ] Achievement system
- [ ] Leaderboards (optional)
- [ ] Settings/preferences
- [ ] Mobile responsive

---

## Example Session Flow

**User starts Pattern Master:**

1. Select string set: Strings 3-4-5
2. Set tempo: 80 BPM
3. Game shows pattern: 1213
4. User plays along with metronome (4 beats = 1 pattern)
5. Game detects: 92% accuracy → +5 points
6. Next pattern: 2131 (random)
7. User plays: 100% → +10 points, unlock next pattern
8. Continue for 20 minutes
9. End session: Full stats displayed
10. Auto-logged to Practice Tracker

**Session Summary:**
```
SESSION COMPLETE! 🎉

Pattern Master - 20:00
━━━━━━━━━━━━━━━━━━━━━━━━

Patterns Mastered: 8/18 (+3 this session)
Average Accuracy: 87%
Score: 145 points

Tempo: 80-85 BPM (adaptive increase)
Total Attempts: 34
Successful: 29 (85%)

Unlocked Achievements:
✓ First Perfect Pattern
✓ 5-Pattern Streak

Next Practice: In 28 hours
(Consolidation window: 6 hours)

[Save & Exit] [View Details] [Share]
```

---

## Database Schema (Supabase)

```sql
-- Rolling patterns (predefined)
CREATE TABLE rolling_patterns (
  id SERIAL PRIMARY KEY,
  pattern VARCHAR(4) NOT NULL UNIQUE, -- e.g., "1213"
  difficulty INT, -- 1-3
  starts_with INT, -- 1, 2, or 3
  description TEXT
);

-- User sessions
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  mode VARCHAR(50),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration_seconds INT,
  string_set INT[3],
  starting_tempo INT,
  overall_accuracy DECIMAL,
  score INT,
  achievements JSONB,
  full_log JSONB, -- Complete session data
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pattern attempts
CREATE TABLE pattern_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES practice_sessions(id),
  pattern VARCHAR(4),
  tempo INT,
  accuracy DECIMAL,
  success BOOLEAN,
  timestamp TIMESTAMP,
  note_events JSONB
);

-- User pattern mastery
CREATE TABLE user_pattern_mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  pattern VARCHAR(4),
  string_set INT[3],
  best_tempo INT,
  mastered BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  avg_accuracy DECIMAL,
  last_practiced TIMESTAMP
);

-- Personal bests
CREATE TABLE personal_bests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  mode VARCHAR(50),
  metric VARCHAR(50), -- 'tempo', 'accuracy', 'time', etc.
  value DECIMAL,
  achieved_at TIMESTAMP,
  session_id UUID REFERENCES practice_sessions(id)
);
```

---

## Next Steps

1. **Confirm design direction** - Is this the right approach?
2. **Choose starter mode** - Begin with Pattern Master or Endless Practice?
3. **Audio input decision** - Manual accuracy tracking or real-time detection?
4. **Set up project** - Create React + TypeScript + Tailwind app
5. **Build Phase 1** - Core metronome + pattern display

Ready to start building?
