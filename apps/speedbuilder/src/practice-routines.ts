/**
 * Practice Routines for Pattern Speed Development
 * Based on neurophysiology research and extreme speed training principles
 *
 * Each pattern gets a structured 30-minute practice session
 */

import { Pattern } from './patterns';

/**
 * Session Structure (30 minutes total)
 */
export interface PracticeSession {
  patternId: number;
  stringSet: [number, number, number]; // User-selected strings
  date: Date;
  exercises: Exercise[];
  totalDurationMinutes: 30;
}

/**
 * Exercise types based on research
 */
export type ExerciseType =
  | 'tension-elimination'  // Horowitz: relaxation first
  | 'micro-burst'          // 7-10 sec max speed bursts
  | 'metronome-progression' // Yuja Wang: step-by-step +5 BPM
  | 'dotted-rhythm'        // Cziffra: dotted rhythm method
  | 'adaptive-70'          // 70% accuracy auto-adjust
  | 'consolidation';       // Slow, perfect reps for myelination

export interface Exercise {
  type: ExerciseType;
  durationMinutes: number;
  startingTempo: number;
  description: string;
  protocol: ExerciseProtocol;
}

/**
 * Exercise protocols with specific parameters
 */
export type ExerciseProtocol =
  | TensionEliminationProtocol
  | MicroBurstProtocol
  | MetronomeProgressionProtocol
  | DottedRhythmProtocol
  | Adaptive70Protocol
  | ConsolidationProtocol;

// ==========================================
// PROTOCOL DEFINITIONS
// ==========================================

/**
 * Phase 0: Tension Elimination (Weeks 1-2)
 * Horowitz: "Use wrist alone, not forearm"
 */
export interface TensionEliminationProtocol {
  tempo: 60; // Fixed slow tempo
  volume: 'pianissimo'; // Very soft only
  reps: 10;
  checkpoints: {
    forearmTension: boolean; // Must be zero
    canPlayWithoutFatigue: boolean;
  };
}

/**
 * Micro-Burst Training
 * Play at MAXIMUM SPEED for 7-10 seconds
 * Research: Before central fatigue sets in
 */
export interface MicroBurstProtocol {
  burstDurationSeconds: 7 | 8 | 9 | 10;
  restDurationSeconds: number; // 1:2 to 1:3 work:rest ratio
  numberOfBursts: 10;
  followUpTempo: number; // Slow practice after bursts
}

/**
 * Yuja Wang Metronome Protocol
 * "Step by step" - +5 BPM every 3 days
 */
export interface MetronomeProgressionProtocol {
  currentTempo: number;
  targetTempo: number;
  incrementBPM: 5;
  daysAtEachTempo: 3;
  accuracyRequired: 1.0; // 100% before advancing
  tensionCheck: boolean; // Must maintain zero tension
}

/**
 * Cziffra Dotted Rhythm Method
 * "Iron out" passages with rhythmic variation
 */
export interface DottedRhythmProtocol {
  baseTempo: number;
  variations: [
    'even',           // Standard: ♪ ♪ ♪ ♪
    'long-short',     // LONG-short: ♪. 𝅘𝅥𝅯 ♪. 𝅘𝅥𝅯
    'short-long'      // short-LONG: 𝅘𝅥𝅯 ♪. 𝅘𝅥𝅯 ♪.
  ];
  repsPerVariation: 5;
}

/**
 * Adaptive 70% Accuracy
 * Maintains optimal challenge point (30% error rate)
 * Based on Al-Fawakhiri et al. 2023
 */
export interface Adaptive70Protocol {
  startingTempo: number;
  windowSize: 20; // Last 20 attempts
  adjustmentPercent: 0.8; // 0.8% tempo change per adjustment
  targetAccuracy: { min: 0.6, optimal: 0.7, max: 0.8 };
  autoAdjust: boolean;
}

/**
 * Consolidation Mode
 * Slow, perfect practice during 6-8hr window post-intensive practice
 * Protects myelination process
 */
export interface ConsolidationProtocol {
  tempo: number; // 60-70% of max speed
  accuracy: 1.0; // 100% required
  reps: 20;
  restBetweenReps: number; // seconds
  avoidIntensePractice: boolean; // No speed work during this window
}

// ==========================================
// 30-MINUTE SESSION TEMPLATES
// ==========================================

/**
 * Week 1-2: Foundation Building
 * Focus: Tension elimination + slow practice
 */
export const FOUNDATION_SESSION: Exercise[] = [
  {
    type: 'tension-elimination',
    durationMinutes: 10,
    startingTempo: 60,
    description: 'Zero tension practice at 60 BPM',
    protocol: {
      tempo: 60,
      volume: 'pianissimo',
      reps: 10,
      checkpoints: {
        forearmTension: false,
        canPlayWithoutFatigue: true,
      },
    },
  },
  {
    type: 'micro-burst',
    durationMinutes: 10,
    startingTempo: 0, // Max speed
    description: 'Speed bursts to activate fast-twitch fibers',
    protocol: {
      burstDurationSeconds: 7,
      restDurationSeconds: 15, // 1:2 ratio
      numberOfBursts: 10,
      followUpTempo: 60,
    },
  },
  {
    type: 'consolidation',
    durationMinutes: 10,
    startingTempo: 60,
    description: 'Perfect slow reps for motor learning',
    protocol: {
      tempo: 60,
      accuracy: 1.0,
      reps: 20,
      restBetweenReps: 5,
      avoidIntensePractice: true,
    },
  },
];

/**
 * Week 3-8: Progressive Speed Building
 * Focus: Metronome progression + adaptive training
 */
export const PROGRESSIVE_SESSION: Exercise[] = [
  {
    type: 'metronome-progression',
    durationMinutes: 15,
    startingTempo: 65, // User's current level
    description: 'Yuja Wang step-by-step protocol',
    protocol: {
      currentTempo: 65,
      targetTempo: 150,
      incrementBPM: 5,
      daysAtEachTempo: 3,
      accuracyRequired: 1.0,
      tensionCheck: true,
    },
  },
  {
    type: 'dotted-rhythm',
    durationMinutes: 10,
    startingTempo: 70,
    description: 'Cziffra rhythm variations',
    protocol: {
      baseTempo: 70,
      variations: ['even', 'long-short', 'short-long'],
      repsPerVariation: 5,
    },
  },
  {
    type: 'micro-burst',
    durationMinutes: 5,
    startingTempo: 0,
    description: 'Max speed bursts',
    protocol: {
      burstDurationSeconds: 10,
      restDurationSeconds: 30,
      numberOfBursts: 5,
      followUpTempo: 70,
    },
  },
];

/**
 * Week 9+: Advanced Speed Training
 * Focus: Adaptive 70% + high-speed consolidation
 */
export const ADVANCED_SESSION: Exercise[] = [
  {
    type: 'adaptive-70',
    durationMinutes: 15,
    startingTempo: 100,
    description: 'Auto-adjusting optimal challenge',
    protocol: {
      startingTempo: 100,
      windowSize: 20,
      adjustmentPercent: 0.8,
      targetAccuracy: { min: 0.6, optimal: 0.7, max: 0.8 },
      autoAdjust: true,
    },
  },
  {
    type: 'micro-burst',
    durationMinutes: 10,
    startingTempo: 0,
    description: 'Peak speed bursts',
    protocol: {
      burstDurationSeconds: 10,
      restDurationSeconds: 20,
      numberOfBursts: 10,
      followUpTempo: 100,
    },
  },
  {
    type: 'consolidation',
    durationMinutes: 5,
    startingTempo: 80,
    description: 'High-speed consolidation reps',
    protocol: {
      tempo: 80,
      accuracy: 1.0,
      reps: 10,
      restBetweenReps: 3,
      avoidIntensePractice: false,
    },
  },
];

// ==========================================
// SESSION LOGGING
// ==========================================

export interface SessionLog {
  sessionId: string;
  patternId: number;
  pattern: string;
  stringSet: [number, number, number];
  date: Date;
  startTime: Date;
  endTime: Date;
  exercises: ExerciseLog[];

  // Neurophysiology tracking
  myelinationCycleWeek: number; // Which week of 4-week cycle
  hoursSinceLastIntenseSession: number; // For consolidation window
  sessionSpacingHours: number; // 24-48hr optimal
}

export interface ExerciseLog {
  exerciseType: ExerciseType;
  startTime: Date;
  endTime: Date;
  tempo: number;
  attempts: AttemptLog[];
  notes: string;
}

export interface AttemptLog {
  attemptNumber: number;
  tempo: number;
  accuracy: number;
  notesPlayed: number;
  notesMissed: number;
  tensionDetected: boolean;
  timestamp: Date;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Determine which session template to use based on training week
 */
export function getSessionTemplate(trainingWeek: number): Exercise[] {
  if (trainingWeek <= 2) return FOUNDATION_SESSION;
  if (trainingWeek <= 8) return PROGRESSIVE_SESSION;
  return ADVANCED_SESSION;
}

/**
 * Calculate which myelination cycle week (1-4)
 */
export function getMyelinationWeek(startDate: Date, currentDate: Date): number {
  const daysDiff = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weekNumber = Math.floor(daysDiff / 7);
  return (weekNumber % 4) + 1; // Cycles 1-4
}

/**
 * Check if within consolidation window (6-8 hours post-practice)
 */
export function inConsolidationWindow(lastSessionTime: Date, currentTime: Date): boolean {
  const hoursSince = (currentTime.getTime() - lastSessionTime.getTime()) / (1000 * 60 * 60);
  return hoursSince >= 6 && hoursSince <= 8;
}

/**
 * Check if proper session spacing (24-48 hours)
 */
export function checkSessionSpacing(lastSessionTime: Date, currentTime: Date): {
  optimal: boolean;
  hoursSince: number;
  recommendation: string;
} {
  const hoursSince = (currentTime.getTime() - lastSessionTime.getTime()) / (1000 * 60 * 60);

  if (hoursSince < 24) {
    return {
      optimal: false,
      hoursSince,
      recommendation: 'Too soon - wait for 24hr minimum spacing',
    };
  } else if (hoursSince >= 24 && hoursSince <= 48) {
    return {
      optimal: true,
      hoursSince,
      recommendation: 'Optimal session spacing',
    };
  } else {
    return {
      optimal: false,
      hoursSince,
      recommendation: 'Longer than optimal - session frequency may be too low',
    };
  }
}
