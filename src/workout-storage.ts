/**
 * Workout Configuration Storage
 * CRUD operations for workout configs in localStorage
 */

import { WorkoutConfig, DEFAULT_WORKOUT_CONFIG, WorkoutExerciseConfig } from './workout-types'

const STORAGE_KEY = 'workoutConfigs'

/**
 * Get all workout configs from localStorage
 */
export function getWorkoutConfigs(): WorkoutConfig[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return [DEFAULT_WORKOUT_CONFIG]
  }
  try {
    const configs = JSON.parse(stored)
    // Ensure default config is always included
    if (!configs.find((c: WorkoutConfig) => c.id === 'default')) {
      configs.unshift(DEFAULT_WORKOUT_CONFIG)
    }
    return configs
  } catch {
    return [DEFAULT_WORKOUT_CONFIG]
  }
}

/**
 * Get a single workout config by ID
 */
export function getWorkoutConfig(id: string): WorkoutConfig | null {
  if (id === 'default') {
    return DEFAULT_WORKOUT_CONFIG
  }
  const configs = getWorkoutConfigs()
  return configs.find(c => c.id === id) || null
}

/**
 * Save a workout config (create or update)
 */
export function saveWorkoutConfig(config: WorkoutConfig): void {
  const configs = getWorkoutConfigs()
  const existingIndex = configs.findIndex(c => c.id === config.id)

  // Calculate total minutes
  const totalMinutes = config.exercises
    .filter(ex => ex.enabled)
    .reduce((sum, ex) => sum + ex.durationMinutes, 0)

  const updatedConfig = { ...config, totalMinutes }

  if (existingIndex >= 0) {
    configs[existingIndex] = updatedConfig
  } else {
    configs.push(updatedConfig)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
}

/**
 * Delete a workout config
 */
export function deleteWorkoutConfig(id: string): void {
  if (id === 'default') return // Cannot delete default config

  const configs = getWorkoutConfigs()
  const filtered = configs.filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

/**
 * Create a new workout config from default
 */
export function createWorkoutConfig(name: string): WorkoutConfig {
  return {
    id: `workout-${Date.now()}`,
    name,
    exercises: DEFAULT_WORKOUT_CONFIG.exercises.map(ex => ({
      ...ex,
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })),
    totalMinutes: DEFAULT_WORKOUT_CONFIG.totalMinutes,
    isDefault: false
  }
}

/**
 * Clone an existing workout config
 */
export function cloneWorkoutConfig(config: WorkoutConfig, newName: string): WorkoutConfig {
  return {
    id: `workout-${Date.now()}`,
    name: newName,
    exercises: config.exercises.map(ex => ({
      ...ex,
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })),
    totalMinutes: config.totalMinutes,
    isDefault: false
  }
}

/**
 * Create a new exercise with defaults
 */
export function createExercise(): WorkoutExerciseConfig {
  return {
    id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'recovery',
    durationMinutes: 2,
    tempoRatio: 0.7, // 70% of current
    protocol: 'metronome-progression',
    enabled: true
  }
}

/**
 * Get the effective BPM for an exercise
 * Uses fixedBpm if set, otherwise calculates from ratio
 */
export function getExerciseBpm(
  exercise: WorkoutExerciseConfig,
  currentBpm: number
): number {
  // If fixedBpm is set, use it directly
  if (exercise.fixedBpm !== undefined) {
    return exercise.fixedBpm
  }

  // Otherwise calculate from ratio
  return Math.round(currentBpm * exercise.tempoRatio)
}
