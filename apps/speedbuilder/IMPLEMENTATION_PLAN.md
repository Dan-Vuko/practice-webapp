# Speed Builder Metronome - Implementation Plan
## Neurophysiology-Driven Design

**Based on:** Research synthesis on motor learning, myelination, and speed development
**Core Principle:** Work *with* biological motor learning systems, not against them
**Target:** 70% accuracy training zone, respecting myelination timelines, optimizing consolidation

---

## Executive Summary

This metronome is designed around **three fundamental biological truths**:

1. **Speed is neural remodeling** (2-4 weeks for myelination) - not instant gains
2. **70% accuracy** (30% error rate) optimizes motor adaptation
3. **Muscle relaxation rate** is the actual bottleneck - not contraction speed

**Key Design Decision:** This is not a "play along with clicks" metronome. It's a **structured training system** that enforces evidence-based practice protocols, tracks biological adaptation timelines, and protects consolidation windows.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   SPEED BUILDER METRONOME                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Training Engine  │  │  Adaptive System │               │
│  │  - Session modes  │  │  - 70% accuracy  │               │
│  │  - Tempo control  │  │  - Auto-adjust   │               │
│  │  - Work/rest      │  │  - Plateau detect│               │
│  └──────────────────┘  └──────────────────┘               │
│           ↓                      ↓                          │
│  ┌────────────────────────────────────────┐                │
│  │      Consolidation Tracker             │                │
│  │  - 6-8hr interference window           │                │
│  │  - 24-48hr session spacing             │                │
│  │  - 2-4 week myelination cycles         │                │
│  └────────────────────────────────────────┘                │
│           ↓                                                 │
│  ┌────────────────────────────────────────┐                │
│  │      Practice Tracker Integration      │                │
│  │  - Auto-log sessions                   │                │
│  │  - BPM progress                        │                │
│  │  - Success rate tracking               │                │
│  └────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Core Metronome Engine

### 1.1 Audio System (Web Audio API)

**Requirements:**
- Timing precision: **< 5ms jitter** (research shows auditory-motor system depends on precise cueing)
- Click sounds: Wood block, beep, hi-hat, spoken count
- Accent patterns: Customizable strong/weak beats
- Volume control: Per-beat adjustment (for accent training)

**Implementation:**
```typescript
class AudioEngine {
  private audioContext: AudioContext;
  private nextNoteTime: number;
  private scheduleAheadTime: number = 0.1; // 100ms lookahead

  // Pre-schedule beats to compensate for JS timing drift
  scheduleNote(beatNumber: number, time: number) {
    const osc = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();

    // Different frequency for downbeat (privileging auditory perception)
    osc.frequency.value = beatNumber === 0 ? 880 : 440;

    envelope.gain.value = beatNumber === 0 ? 1.0 : 0.6;
    envelope.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    osc.connect(envelope);
    envelope.connect(this.audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  // Timing loop uses requestAnimationFrame + AudioContext.currentTime
  tick() {
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.advance();
    }
    requestAnimationFrame(() => this.tick());
  }
}
```

**Key Design Choice:**
Use **Web Audio API currentTime**, not `Date.now()` or `setTimeout`. Research shows auditory-motor entrainment requires sub-10ms precision.

---

### 1.2 Tempo Control System

**Tempo Ranges:**
- **Primary beat range: 40-240 BPM** (beat perception limits)
- **Optimal entrainment: 86-120 BPM** (minimal cognitive load)
- **Above 240 BPM:** Automatically present as subdivisions (brain perceives as doubles of slower tempo)

**Subdivision Modes:**
- Quarter notes (base)
- 8th notes (2 clicks per beat)
- 16th notes (4 clicks per beat)
- Triplets (3 clicks per beat)
- Polyrhythms (3:2, 3:4, etc.)

**Example:**
- Target = 180 BPM 16th notes
- Display as 90 BPM with 16th subdivision (keeps primary beat in optimal 86-120 range)

---

### 1.3 Time Signature Support

**Common signatures:**
- 4/4, 3/4, 2/4, 6/8, 5/4, 7/8, 9/8

**Accent patterns:**
- 4/4: Strong-weak-medium-weak
- 6/8: Strong-weak-weak-medium-weak-weak
- Custom: User-defined accent placement

---

## Part 2: Adaptive Training System

### 2.1 The 70% Accuracy Algorithm

**Research Basis:** 70% accuracy (30% error rate) optimally triggers motor adaptation

**Implementation:**
```typescript
interface AccuracyTracker {
  recentAttempts: boolean[]; // Last 20 attempts (true = success)
  successRate: number;

  calculateSuccessRate(): number {
    const recent = this.recentAttempts.slice(-20);
    return recent.filter(x => x).length / recent.length;
  }

  shouldAdjustTempo(): { adjust: boolean, direction: 'up' | 'down' | 'maintain' } {
    const rate = this.calculateSuccessRate();

    if (rate > 0.80) {
      // Too easy - increase difficulty
      return { adjust: true, direction: 'up' };
    } else if (rate < 0.60) {
      // Too hard - decrease difficulty
      return { adjust: true, direction: 'down' };
    } else {
      // In sweet spot (60-80% = ~70% target)
      return { adjust: false, direction: 'maintain' };
    }
  }
}
```

**Tempo Adjustment Logic:**
```typescript
function adjustTempo(current: number, direction: 'up' | 'down'): number {
  // Research suggests 2.5-5% per week for myelination timeline
  // Per-session = ~0.5-1% (assuming 3-5 sessions/week)
  const increment = current * 0.008; // 0.8% increase

  if (direction === 'up') {
    return Math.round(current + increment);
  } else {
    return Math.round(current - increment * 1.5); // Faster decrease when too hard
  }
}
```

**User Feedback:**
```
Current Success Rate: 68% ✓ (Sweet Spot!)
Tempo: 95 BPM → Maintaining (optimal challenge)

Current Success Rate: 85% (Too Easy)
Tempo: 95 BPM → Increasing to 96 BPM
```

---

### 2.2 Plateau Detection System

**Research Basis:** Motor learning plateaus when there's insufficient challenge

**Detection Algorithm:**
```typescript
interface PlateauDetector {
  tempoHistory: { date: Date, tempo: number, success: number }[];

  detectPlateau(sessions: number = 6): { isPlateau: boolean, recommendation: string } {
    const recent = this.tempoHistory.slice(-sessions);

    // Check 1: Has tempo been stuck?
    const tempoRange = Math.max(...recent.map(s => s.tempo)) - Math.min(...recent.map(s => s.tempo));
    const avgSuccess = recent.reduce((sum, s) => sum + s.success, 0) / recent.length;

    if (tempoRange < 2 && avgSuccess > 0.80) {
      return {
        isPlateau: true,
        recommendation: "Plateau detected. Try BURST MODE (110-120% tempo for 7-10 sec bursts)"
      };
    }

    // Check 2: Success rate high but not progressing
    if (avgSuccess > 0.85 && tempoRange < 3) {
      return {
        isPlateau: true,
        recommendation: "Very high accuracy without progression. Increase challenge with VARIABLE TEMPO mode"
      };
    }

    return { isPlateau: false, recommendation: "" };
  }
}
```

---

### 2.3 Myelination Timeline Enforcement

**Research Basis:** Detectable myelin changes take 2-4 weeks

**Implementation:**
```typescript
interface MyelinationTracker {
  cycleStartDate: Date;
  cycleTargetTempo: number;
  weeksPracticed: number;

  checkCycleProgress(): { status: string, advice: string } {
    const weeksElapsed = Math.floor(
      (Date.now() - this.cycleStartDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );

    if (weeksElapsed < 2) {
      return {
        status: "EARLY PHASE (Week " + (weeksElapsed + 1) + "/4)",
        advice: "Focus on consistency. Neural rewiring in progress. Expect gains by week 3-4."
      };
    } else if (weeksElapsed < 4) {
      return {
        status: "MYELINATION WINDOW (Week " + (weeksElapsed + 1) + "/4)",
        advice: "This is when gains typically accelerate. Stay consistent!"
      };
    } else {
      return {
        status: "CYCLE COMPLETE",
        advice: "4 weeks completed. Ready to push for new tempo target or consolidate gains."
      };
    }
  }
}
```

**UI Display:**
```
┌────────────────────────────────────────────┐
│  Myelination Cycle: Week 3 of 4           │
│  [████████████████░░░░]  75%              │
│                                            │
│  Target: 100 BPM (started at 90 BPM)      │
│  Status: MYELINATION WINDOW               │
│  Expected gains accelerating this week!   │
└────────────────────────────────────────────┘
```

---

## Part 3: Training Modes

### 3.1 Adaptive Mode (Default)

**Purpose:** Automatically maintains 70% accuracy sweet spot

**Session Structure:**
```
1. Warm-up: 60-70% of current max (3 min)
2. Working: Adaptive tempo targeting 70% accuracy (12 min)
   - 2 min work blocks
   - 30 sec rest between blocks
   - Auto-adjusts tempo based on success rate
3. Challenge: 105-110% of working tempo (3 min)
   - 7-10 sec bursts (central fatigue limit)
   - 20-30 sec rest between bursts
4. Recovery: 75% of working tempo (2 min)
```

**Total: 20 minutes** (research favors distributed practice over marathon sessions)

---

### 3.2 Burst Training Mode

**Research Basis:** Brief maximum-speed attempts (7-10 sec) trigger motor unit recruitment gains

**Protocol:**
```typescript
interface BurstTraining {
  workingTempo: number; // Current comfortable max
  burstTempo: number;   // 115-120% of working
  burstDuration: number; // 7-10 seconds
  restDuration: number;  // 20-30 seconds (1:2 to 1:3 work:rest)

  generateBurstSession(): TrainingBlock[] {
    return [
      { type: 'warmup', tempo: this.workingTempo * 0.70, duration: 180 },
      { type: 'burst', tempo: this.burstTempo, duration: 7 },
      { type: 'rest', tempo: 0, duration: 20 },
      { type: 'burst', tempo: this.burstTempo, duration: 10 },
      { type: 'rest', tempo: 0, duration: 30 },
      // ... 4-6 total bursts
      { type: 'recovery', tempo: this.workingTempo * 0.75, duration: 120 }
    ];
  }
}
```

**Display:**
```
BURST TRAINING MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Burst 3 of 6: 7 seconds @ 115 BPM

    ⚡ MAXIMUM SPEED ⚡

Timer: [█████░░░░░] 3.2 / 7.0 sec

Next: 25 sec rest, then Burst 4

⚠️ Focus on relaxation, not force
```

---

### 3.3 Variable Tempo Mode

**Research Basis:** Systematically increasing contextual interference (not pure random)

**Protocol:**
```typescript
interface VariableTempo {
  baseTempos: number[];  // e.g., [85, 90, 95]
  blockSize: number;     // Start blocked (3x same), then interleave

  generateProgression(): number[] {
    // Phase 1: Blocked practice (each tempo 3 times consecutively)
    const blocked = this.baseTempos.flatMap(t => [t, t, t]);

    // Phase 2: Serial practice (cycle through tempos)
    const serial = [85, 90, 95, 85, 90, 95];

    // Phase 3: Random (shuffled)
    const random = [90, 85, 95, 85, 90, 95]; // shuffled

    return [...blocked, ...serial, ...random];
  }
}
```

**Systematically increasing interference** = Start blocked → Serial → Random (not pure random from start)

---

### 3.4 Consolidation Mode

**Research Basis:** 6-8 hour consolidation window; protect from interference

**Features:**
```typescript
interface ConsolidationProtection {
  lastPracticeTime: Date;
  interferenceWindow: number; // 8 hours in ms

  checkInterferenceRisk(currentExercise: string): {
    safe: boolean;
    message: string;
  } {
    const hoursSince = (Date.now() - this.lastPracticeTime.getTime()) / (1000 * 60 * 60);

    if (hoursSince < 8) {
      return {
        safe: false,
        message: `⚠️ CONSOLIDATION WINDOW ACTIVE

Last practice: ${hoursSince.toFixed(1)} hours ago
Wait ${(8 - hoursSince).toFixed(1)} more hours before similar motor practice

Why? Your brain is actively consolidating this motor pattern.
Interfering movements can disrupt long-term retention.

Safe alternatives:
- Different exercise (unrelated movements)
- Music theory study
- Listening practice`
      };
    }

    return { safe: true, message: "Consolidation complete. Ready to practice!" };
  }
}
```

**UI Warning:**
```
┌────────────────────────────────────────────┐
│  ⚠️ CONSOLIDATION WINDOW ACTIVE           │
├────────────────────────────────────────────┤
│  Last practice: 3.2 hours ago              │
│  Remaining: 4.8 hours                      │
│                                            │
│  [████████░░░░░░░] 40%                    │
│                                            │
│  Avoid similar movements to protect       │
│  motor memory consolidation               │
│                                            │
│  [Ignore Warning] [Choose Different Task] │
└────────────────────────────────────────────┘
```

---

### 3.5 Session Spacing Enforcer

**Research Basis:** 24-48 hour spacing between intensive speed work on same passage

**Implementation:**
```typescript
interface SessionSpacer {
  exerciseHistory: Map<string, Date>; // exerciseID -> last practice date

  recommendNextSession(exerciseID: string): {
    canPractice: boolean;
    nextRecommended: Date;
    reason: string;
  } {
    const lastPractice = this.exerciseHistory.get(exerciseID);
    if (!lastPractice) {
      return { canPractice: true, nextRecommended: new Date(), reason: "First session" };
    }

    const hoursSince = (Date.now() - lastPractice.getTime()) / (1000 * 60 * 60);

    if (hoursSince < 24) {
      return {
        canPractice: false,
        nextRecommended: new Date(lastPractice.getTime() + 24 * 60 * 60 * 1000),
        reason: "Distributed practice: Wait 24-48hrs between intensive speed work on same passage"
      };
    }

    return { canPractice: true, nextRecommended: new Date(), reason: "Optimal timing!" };
  }
}
```

---

## Part 4: User Interface Design

### 4.1 Main Practice Screen

```
┌──────────────────────────────────────────────────────────────┐
│  Speed Builder Metronome                         [⚙ Settings]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Mode: [Adaptive 70% ▼]    Exercise: [Hybrid picking ▼]    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │         Current Tempo: 92 BPM                         │ │
│  │                                                        │ │
│  │              ●  ○  ○  ○                              │ │
│  │           Beat 1 of 4                                 │ │
│  │                                                        │ │
│  │  Success Rate: 68% ✓ (Sweet Spot!)                   │ │
│  │  Session: 8:32 / 20:00                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Session Plan: Adaptive Mode                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ✓ Warm-up       65 BPM    [████████████]  3:00/3:00  │ │
│  │ ▶ Working 1     92 BPM    [█████░░░░░░░]  1:32/2:00  │ │
│  │   Auto-adjusting based on accuracy...                │ │
│  │ ○ Rest          -          [            ]  0:00/0:30  │ │
│  │ ○ Working 2     TBD        [            ]  0:00/2:00  │ │
│  │ ○ Challenge     105 BPM    [            ]  0:00/3:00  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ⚡ Recent Performance (last 20 attempts)                   │
│  [✓✓✓✗✓✓✗✓✓✓✗✓✓✓✗✓✓✓✗✓]  68% success                   │
│                                                              │
│  [⏸ Pause]  [⏭ Skip Set]  [🔄 Restart]  [📊 Details]     │
│                                                              │
│  Myelination Cycle: Week 2 of 4  [███████░░░░░] 50%        │
│  Next consolidation check: 4.3 hours                        │
└──────────────────────────────────────────────────────────────┘
```

---

### 4.2 Settings / Configuration

```
┌──────────────────────────────────────────────────────────────┐
│  Metronome Settings                                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🔊 AUDIO                                                    │
│  Click Sound: [Wood Block ▼]                               │
│  Volume: [████████░░] 80%                                   │
│  Accent Pattern: [Strong-weak-medium-weak]                  │
│                                                              │
│  🎯 ADAPTIVE SYSTEM                                          │
│  Target Accuracy: [70%] (30% error rate)                   │
│  ☑ Auto-adjust tempo to maintain target                    │
│  ☑ Plateau detection (suggest burst mode after 6 stuck)    │
│  Tempo increment: [0.8%] per adjustment                    │
│                                                              │
│  🧠 CONSOLIDATION PROTECTION                                 │
│  ☑ Warn if practicing within 8-hour window                 │
│  ☑ Enforce 24-48hr spacing for same exercise               │
│  ☑ Track myelination cycles (4-week blocks)                │
│                                                              │
│  ⏱ SESSION STRUCTURE                                         │
│  Default duration: [20 minutes]                             │
│  Work:Rest ratio: [1:2] (e.g., 10sec work, 20sec rest)    │
│  ☑ Enforce rest periods (can't skip)                       │
│  Max session length: [60 minutes] (prevent fatigue)        │
│                                                              │
│  🔬 ADVANCED (EXPERIMENTAL)                                  │
│  ☐ Stochastic resonance (±10ms timing jitter)              │
│  ☐ Moving visual metronome (bouncing ball)                 │
│  ☐ Haptic feedback (requires device support)               │
│                                                              │
│  [Save Settings]  [Reset to Defaults]                       │
└──────────────────────────────────────────────────────────────┘
```

---

### 4.3 Analytics Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  Progress Analytics - Hybrid Picking 1232                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📈 TEMPO PROGRESS (Last 30 Days)                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 100 ┤                                            ●──●  │ │
│  │  95 ┤                                      ●──●        │ │
│  │  90 ┤                            ●────●               │ │
│  │  85 ┤                  ●────●                         │ │
│  │  80 ┤        ●────●                                   │ │
│  │  75 ┤  ●──●                                          │ │
│  │     └─────────────────────────────────────────────────┤ │
│  │      Nov 15    Dec 1     Dec 15    Jan 1    Jan 15   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Current: 98 BPM  •  Starting: 75 BPM  •  Gain: +23 BPM   │
│  Average weekly gain: +2.3 BPM (2.5% per week)             │
│                                                              │
│  📊 ACCURACY OVER TIME                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 100%┤ ═══════════════════════════════════════════════ │ │
│  │  70%┤ ●──●───●───●───●───●───●─── Target Line       │ │
│  │  50%┤                                                 │ │
│  │     └─────────────────────────────────────────────────┤ │
│  │      Nov 15    Dec 1     Dec 15    Jan 1    Jan 15   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Your accuracy stays close to the 70% target ✓             │
│  This indicates optimal challenge level!                    │
│                                                              │
│  🎯 MYELINATION MILESTONES                                  │
│  ✓ Week 2: First gains visible (82 BPM → 85 BPM)          │
│  ✓ Week 4: Cycle 1 complete (85 BPM consolidated)         │
│  ✓ Week 6: Cycle 2 gains (85 BPM → 92 BPM)                │
│  ▶ Week 8: Current cycle (92 BPM → 100 BPM target)        │
│                                                              │
│  📅 PRACTICE CONSISTENCY                                    │
│  Sessions this month: 18  •  Avg spacing: 1.7 days         │
│  Consolidation adherence: 94% (optimal!)                   │
│  Longest streak: 12 days                                    │
│                                                              │
│  [Export Data CSV]  [Share Progress Image]                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Part 5: Integration with Practice Tracker

### 5.1 Auto-Logging Sessions

**After each session completes:**
```typescript
interface SessionLog {
  exerciseID: string;
  date: Date;
  mode: 'adaptive' | 'burst' | 'variable' | 'consolidation';
  durationMinutes: number;

  // Tempo data
  startingTempo: number;
  endingTempo: number;
  avgTempo: number;
  peakTempo: number;

  // Performance
  avgAccuracy: number;
  totalAttempts: number;
  successfulAttempts: number;

  // Biological markers
  myelinationCycleWeek: number;
  hoursSinceLastSession: number;
  consolidationWindowRespected: boolean;

  // Notes
  userNotes: string;
  systemNotes: string; // e.g., "Plateau detected, suggested burst mode"
}

async function logToTracker(session: SessionLog) {
  await fetch('/api/practice-tracker/sessions', {
    method: 'POST',
    body: JSON.stringify({
      exercise: session.exerciseID,
      date: session.date,
      bpm: session.endingTempo,
      duration: session.durationMinutes,
      accuracy: session.avgAccuracy,
      notes: `${session.mode} mode | Peak: ${session.peakTempo} BPM | ${session.systemNotes}`
    })
  });
}
```

---

### 5.2 Goal Synchronization

**Pull current goals from tracker:**
```typescript
interface GoalSync {
  async fetchCurrentGoals(exerciseID: string): Promise<Goal> {
    const response = await fetch(`/api/practice-tracker/goals/${exerciseID}`);
    return response.json();
    // Returns: { targetBPM: 150, currentBPM: 92, deadline: '2026-06-01' }
  }

  displayGoalProgress(goal: Goal, currentSession: Session) {
    const progress = (currentSession.avgTempo / goal.targetBPM) * 100;
    const weeksRemaining = calculateWeeksToGoal(
      currentSession.avgTempo,
      goal.targetBPM,
      2.5 // avg % gain per week
    );

    return {
      progressPercent: progress,
      estimatedCompletion: addWeeks(new Date(), weeksRemaining),
      onTrack: weeksRemaining <= weeksBetween(new Date(), goal.deadline)
    };
  }
}
```

**Display in metronome:**
```
Goal: 150 BPM by June 2026
Current: 92 BPM  [███████░░░░░] 61%
Est. completion: May 15, 2026 ✓ On Track!
```

---

## Part 6: Technical Implementation

### 6.1 Tech Stack

**Frontend:**
- React + TypeScript
- Web Audio API (audio engine)
- Recharts or Chart.js (analytics graphs)
- Tailwind CSS (styling)

**State Management:**
- Zustand or React Context (lightweight)
- LocalStorage for settings persistence
- Supabase or Vercel Postgres for session history (cross-device sync)

**Audio Engine:**
- Custom Web Audio API wrapper
- Pre-scheduling system for precise timing
- Oscillator-based clicks (customizable waveforms)

---

### 6.2 Data Models

```typescript
// Core entities
interface Exercise {
  id: string;
  name: string;
  description: string;
  category: 'technique' | 'speed' | 'accuracy';
  tags: string[];
  created: Date;
}

interface TrainingSession {
  id: string;
  exerciseID: string;
  startTime: Date;
  endTime: Date;
  mode: TrainingMode;
  blocks: TrainingBlock[];
  accuracy: number;
  tempoProgression: { time: number, tempo: number, success: boolean }[];
}

interface TrainingBlock {
  type: 'warmup' | 'working' | 'rest' | 'challenge' | 'burst' | 'recovery';
  tempo: number;
  duration: number; // seconds
  accuracy?: number;
}

interface MyelinationCycle {
  exerciseID: string;
  startDate: Date;
  startingTempo: number;
  targetTempo: number;
  currentWeek: number;
  sessionsCompleted: number;
}

interface ConsolidationWindow {
  exerciseID: string;
  lastPractice: Date;
  interferenceRisk: boolean;
  nextSafeSession: Date;
}
```

---

### 6.3 Key Algorithms (Pseudocode)

**Adaptive Tempo Adjustment:**
```python
def calculate_next_tempo(current_tempo, success_history, plateau_detector):
    recent_success = success_history[-20:]  # Last 20 attempts
    success_rate = sum(recent_success) / len(recent_success)

    # Target: 70% accuracy (60-80% range)
    if success_rate > 0.80:
        # Too easy
        adjustment = current_tempo * 0.008  # 0.8% increase
        return current_tempo + adjustment

    elif success_rate < 0.60:
        # Too hard
        adjustment = current_tempo * 0.012  # 1.2% decrease (faster down than up)
        return current_tempo - adjustment

    else:
        # Sweet spot (60-80%)
        # Check for plateau
        if plateau_detector.is_stuck(sessions=6):
            return plateau_detector.suggest_burst_mode()
        return current_tempo  # Maintain
```

**Session Structure Generator:**
```python
def generate_adaptive_session(exercise_id, target_duration=20):
    warmup = {
        'type': 'warmup',
        'tempo': get_current_max(exercise_id) * 0.65,
        'duration': target_duration * 0.15  # 15% of session
    }

    working_sets = []
    working_duration = target_duration * 0.55  # 55% of session
    set_count = 5

    for i in range(set_count):
        working_sets.append({
            'type': 'working',
            'tempo': 'ADAPTIVE',  # Will adjust based on accuracy
            'duration': working_duration / set_count
        })
        if i < set_count - 1:
            working_sets.append({
                'type': 'rest',
                'tempo': 0,
                'duration': 30  # 30 sec rest between sets
            })

    challenge = {
        'type': 'challenge',
        'tempo': get_current_max(exercise_id) * 1.08,  # 108% of current max
        'duration': target_duration * 0.15
    }

    recovery = {
        'type': 'recovery',
        'tempo': get_current_max(exercise_id) * 0.75,
        'duration': target_duration * 0.15
    }

    return [warmup] + working_sets + [challenge, recovery]
```

**Plateau Detection:**
```python
def detect_plateau(tempo_history, accuracy_history, sessions=6):
    recent_tempos = tempo_history[-sessions:]
    recent_accuracy = accuracy_history[-sessions:]

    tempo_stagnant = max(recent_tempos) - min(recent_tempos) < 3  # Less than 3 BPM change
    accuracy_high = sum(recent_accuracy) / len(recent_accuracy) > 0.80

    if tempo_stagnant and accuracy_high:
        return {
            'plateau': True,
            'recommendation': 'BURST_TRAINING',
            'message': 'High accuracy but no tempo progression. Try burst mode (115-120% tempo, 7-10 sec)'
        }

    return {'plateau': False}
```

---

## Part 7: Feature Prioritization

### Phase 1: Core Metronome (Week 1)
- [ ] Web Audio API engine with < 5ms jitter
- [ ] Basic tempo control (40-240 BPM)
- [ ] Time signatures (4/4, 3/4, 6/8, etc.)
- [ ] Accent patterns (strong/weak beats)
- [ ] Visual beat indicator
- [ ] Click sound customization

### Phase 2: Adaptive System (Week 2)
- [ ] 70% accuracy tracking algorithm
- [ ] Auto tempo adjustment (maintain sweet spot)
- [ ] Success/failure logging (last 20 attempts)
- [ ] Basic session structure (warm-up, working, recovery)
- [ ] Rest interval enforcer

### Phase 3: Training Modes (Week 3)
- [ ] Adaptive mode (default)
- [ ] Burst training mode (7-10 sec max speed)
- [ ] Variable tempo mode (systematic interference)
- [ ] Plateau detection + recommendations
- [ ] Work:rest ratio enforcement (1:2 to 1:3)

### Phase 4: Biological Tracking (Week 4)
- [ ] Consolidation window tracker (6-8 hours)
- [ ] Session spacing enforcer (24-48 hours)
- [ ] Myelination cycle tracker (4-week blocks)
- [ ] Warnings for interference risk
- [ ] Timeline visualizations

### Phase 5: Integration & Analytics (Week 5)
- [ ] Practice Tracker integration (auto-log)
- [ ] Goal synchronization (pull from tracker)
- [ ] Progress charts (tempo over time)
- [ ] Accuracy trends
- [ ] Session history
- [ ] Export data (CSV, images)

### Phase 6: Polish & Advanced (Week 6)
- [ ] Subdivision trainer (8ths, 16ths, triplets)
- [ ] Polyrhythm mode
- [ ] Moving visual metronome (optional)
- [ ] Stochastic resonance mode (experimental)
- [ ] Mobile responsiveness
- [ ] Audio input detection (future enhancement)

---

## Part 8: Success Metrics

### Research Validation
- [ ] Users achieve measurable BPM gains over 4-8 weeks
- [ ] Average weekly gain: 2.5-5% (matching myelination timeline)
- [ ] Plateau frequency reduced compared to traditional metronome
- [ ] User adherence to session spacing recommendations

### Technical Performance
- [ ] Timing accuracy: < 5ms jitter (99th percentile)
- [ ] No audio dropouts or glitches
- [ ] UI responsive (< 100ms interaction latency)
- [ ] Works across browsers (Chrome, Firefox, Safari)

### User Experience
- [ ] Session completion rate > 80%
- [ ] Users understand 70% accuracy rationale
- [ ] Consolidation warnings are helpful (not annoying)
- [ ] Integration with Practice Tracker feels seamless
- [ ] Users report feeling less fatigued vs traditional practice

---

## Part 9: Development Workflow

### Setup
```bash
# Create React app with TypeScript
npm create vite@latest speed-builder-metronome -- --template react-ts
cd speed-builder-metronome
npm install

# Install dependencies
npm install recharts date-fns zustand
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Project Structure
```
speed-builder-metronome/
├── src/
│   ├── components/
│   │   ├── MetronomeEngine.tsx      ← Core audio/visual metronome
│   │   ├── AdaptiveController.tsx   ← 70% accuracy system
│   │   ├── SessionBuilder.tsx       ← Training mode selector
│   │   ├── TrainingBlock.tsx        ← Individual set display
│   │   ├── Analytics.tsx            ← Progress charts
│   │   └── ConsolidationWarning.tsx ← 6-8hr window alerts
│   ├── hooks/
│   │   ├── useMetronome.ts          ← Audio engine hook
│   │   ├── useAdaptive.ts           ← Accuracy tracking
│   │   ├── usePlateau.ts            ← Plateau detection
│   │   └── useConsolidation.ts      ← Timing enforcement
│   ├── utils/
│   │   ├── audioEngine.ts           ← Web Audio API wrapper
│   │   ├── algorithms.ts            ← Tempo adjustment logic
│   │   ├── sessionGenerator.ts      ← Training block creation
│   │   └── calculations.ts          ← Progress math
│   ├── stores/
│   │   └── metronomStore.ts         ← Global state (Zustand)
│   └── types/
│       └── index.ts                 ← TypeScript definitions
├── public/
│   └── sounds/                      ← Click sound files
└── package.json
```

---

## Part 10: Next Steps

1. **Review this plan** - Does it align with the research findings?
2. **Prioritize features** - Start with Phase 1 (core metronome)?
3. **Set up development environment** - Create React + TypeScript project
4. **Build Web Audio API engine** - Test timing precision first
5. **Implement 70% accuracy algorithm** - Core differentiator
6. **Design UI mockups** - Visual layout and user flow
7. **Integrate with Practice Tracker** - API contract definition
8. **User testing with real practice data** - Validate assumptions
9. **Iterate based on results** - Refine algorithms

---

## Appendix: Research-Backed Design Decisions

| Design Choice | Research Basis | Implementation |
|---------------|----------------|----------------|
| 70% accuracy target | Al-Fawakhiri et al. (2023) - 30% error rate optimizes motor adaptation | Auto-adjust tempo to maintain 60-80% success rate |
| 7-10 sec burst durations | Central fatigue onset at surround inhibition breakdown | Burst mode enforces max 10 sec work blocks |
| 24-48hr session spacing | Distributed practice beats massed practice | Calendar enforces minimum 24hr between speed work |
| 6-8hr consolidation window | LTP-like plasticity consolidation timeline | Warn against similar movements in 8hr window |
| 2-4 week myelination cycles | Detectable myelin changes at 2-4 week mark | Track 4-week blocks, expect gains by week 3-4 |
| Auditory-first design | Auditory-motor coupling superior to visual | Primary cue is audio; visual is supplemental |
| 86-120 BPM primary range | Optimal entrainment window | Fast tempos presented as subdivisions of this range |
| Work:rest 1:2 to 1:3 | Fatigue prevention and motor learning | Enforce rest intervals, prevent skipping |
| Variable > blocked practice | Systematically increasing interference | Progress from blocked → serial → random |
| Max 60-minute sessions | Diminishing returns + central fatigue | Hard cap at 60 min, recommend 20-30 min |

---

**Document Status:** Complete implementation plan
**Next Action:** Begin Phase 1 development (core metronome engine)
**Timeline:** 6 weeks to fully functional MVP
**Priority:** High - unique evidence-based approach
