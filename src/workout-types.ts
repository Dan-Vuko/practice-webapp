/**
 * Workout Configuration Types
 * Allows customization of workout exercises per pattern
 */

import { ExerciseType } from './practice-routines'

export type TempoSource = 'current' | 'target' | 'midpoint'
export type WorkoutProtocol = 'metronome-progression' | 'micro-burst' | 'variable-push'

export interface WorkoutExerciseConfig {
  id: string
  type: ExerciseType | string   // Allow custom types
  durationMinutes: number       // Supports decimals (e.g., 2.5 min)
  tempoRatio: number            // 0.3-1.5 (percentage of current BPM)
  fixedBpm?: number             // Optional: override ratio with fixed BPM
  protocol: WorkoutProtocol     // Derived from type, but stored for execution
  enabled: boolean
  // Type-specific options
  variablePushRange?: number    // ±% for variable-push (default 30)
}

// Get protocol from exercise type
export function getProtocolFromType(type: ExerciseType | string): WorkoutProtocol {
  if (type === 'variable-push') return 'variable-push'
  if (type === 'micro-burst') return 'micro-burst'
  return 'metronome-progression'
}

export interface WorkoutConfig {
  id: string
  name: string
  exercises: WorkoutExerciseConfig[]
  totalMinutes: number
  isDefault: boolean
}

// Default workout exercises using ratio (percentage of current BPM)
export const DEFAULT_WORKOUT_EXERCISES: WorkoutExerciseConfig[] = [
  { id: 'ex-1', type: 'warm-up-60', durationMinutes: 2, tempoRatio: 0.6, protocol: 'metronome-progression', enabled: true },
  { id: 'ex-2', type: 'warm-up-70', durationMinutes: 3, tempoRatio: 0.7, protocol: 'metronome-progression', enabled: true },
  { id: 'ex-3', type: 'micro-burst', durationMinutes: 2, tempoRatio: 1.1, protocol: 'micro-burst', enabled: true },
  { id: 'ex-4', type: 'pianissimo', durationMinutes: 2, tempoRatio: 1.0, protocol: 'metronome-progression', enabled: true },
  { id: 'ex-5', type: 'sub-baseline-recovery', durationMinutes: 2, tempoRatio: 0.35, protocol: 'metronome-progression', enabled: true },
  { id: 'ex-6', type: 'variable-push', durationMinutes: 2, tempoRatio: 1.0, protocol: 'variable-push', enabled: true, variablePushRange: 30 },
  { id: 'ex-7', type: 'overspeed-push', durationMinutes: 3, tempoRatio: 1.1, protocol: 'metronome-progression', enabled: true },
  { id: 'ex-8', type: 'recovery', durationMinutes: 2, tempoRatio: 0.7, protocol: 'metronome-progression', enabled: true },
  { id: 'ex-9', type: 'main-workout', durationMinutes: 5, tempoRatio: 0.85, protocol: 'metronome-progression', enabled: true },
  { id: 'ex-10', type: 'step-progression', durationMinutes: 3, tempoRatio: 1.05, protocol: 'metronome-progression', enabled: true },
]

export const DEFAULT_WORKOUT_CONFIG: WorkoutConfig = {
  id: 'default',
  name: 'Default Workout',
  exercises: DEFAULT_WORKOUT_EXERCISES,
  totalMinutes: DEFAULT_WORKOUT_EXERCISES.reduce((sum, ex) => sum + ex.durationMinutes, 0),
  isDefault: true
}

// Exercise type options for dropdown
export const EXERCISE_TYPE_OPTIONS: { value: ExerciseType; label: string }[] = [
  { value: 'warm-up-60', label: 'Warm-up 60%' },
  { value: 'warm-up-70', label: 'Warm-up 70%' },
  { value: 'micro-burst', label: 'Micro-burst' },
  { value: 'pianissimo', label: 'Pianissimo' },
  { value: 'sub-baseline-recovery', label: 'Sub-baseline' },
  { value: 'variable-push', label: 'Variable Push' },
  { value: 'overspeed-push', label: 'Overspeed' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'main-workout', label: 'Main Workout' },
  { value: 'step-progression', label: 'Step Progression' },
  { value: 'consolidation', label: 'Consolidation' },
  { value: 'tension-elimination', label: 'Tension Elimination' },
  { value: 'metronome-progression', label: 'Metronome Progression' },
  { value: 'dotted-rhythm', label: 'Dotted Rhythm' },
  { value: 'adaptive-70', label: 'Adaptive 70%' }
]

// Protocol options
export const PROTOCOL_OPTIONS: { value: WorkoutProtocol; label: string }[] = [
  { value: 'metronome-progression', label: 'Standard' },
  { value: 'micro-burst', label: 'Micro-burst' },
  { value: 'variable-push', label: 'Variable Push' }
]

// Tempo source options
export const TEMPO_SOURCE_OPTIONS: { value: TempoSource; label: string }[] = [
  { value: 'current', label: 'Your BPM' },
  { value: 'target', label: 'Goal BPM' },
  { value: 'midpoint', label: 'Halfway' }
]
