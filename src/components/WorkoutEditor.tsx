/**
 * WorkoutEditor Component
 * Modal for editing workout configurations per pattern
 */

import { useState, useEffect } from 'react'
import {
  WorkoutConfig,
  WorkoutExerciseConfig,
  EXERCISE_TYPE_OPTIONS,
  getProtocolFromType
} from '../workout-types'
import {
  saveWorkoutConfig,
  getWorkoutConfig,
  createExercise,
  cloneWorkoutConfig,
  getExerciseBpm
} from '../workout-storage'
import { DEFAULT_WORKOUT_CONFIG } from '../workout-types'
import { PatternItem } from '../pattern-database'

interface WorkoutEditorProps {
  pattern: PatternItem
  workoutConfigId?: string
  onClose: () => void
  onSave: (configId: string) => void
}

export function WorkoutEditor({ pattern, workoutConfigId, onClose, onSave }: WorkoutEditorProps) {
  const [config, setConfig] = useState<WorkoutConfig | null>(null)
  const [configName, setConfigName] = useState('')
  const [showSaveAsModal, setShowSaveAsModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [showCustomTypeInput, setShowCustomTypeInput] = useState<string | null>(null)
  const [customTypeName, setCustomTypeName] = useState('')
  const [customTypes, setCustomTypes] = useState<string[]>([])

  useEffect(() => {
    // Load custom types from localStorage
    const storedCustomTypes = localStorage.getItem('customExerciseTypes')
    if (storedCustomTypes) {
      setCustomTypes(JSON.parse(storedCustomTypes))
    }

    // Load existing config or use default
    const existingConfig = workoutConfigId ? getWorkoutConfig(workoutConfigId) : null
    if (existingConfig) {
      setConfig({ ...existingConfig })
      setConfigName(existingConfig.name)
    } else {
      // Create a copy of default config for editing
      const defaultCopy: WorkoutConfig = {
        ...DEFAULT_WORKOUT_CONFIG,
        id: `workout-${pattern.id}-${Date.now()}`,
        name: `${pattern.name} Workout`,
        isDefault: false,
        exercises: DEFAULT_WORKOUT_CONFIG.exercises.map(ex => ({ ...ex }))
      }
      setConfig(defaultCopy)
      setConfigName(defaultCopy.name)
    }
  }, [workoutConfigId, pattern])

  if (!config) return null

  const totalMinutes = config.exercises
    .filter(ex => ex.enabled)
    .reduce((sum, ex) => sum + ex.durationMinutes, 0)

  const handleExerciseChange = (
    exerciseId: string,
    field: keyof WorkoutExerciseConfig,
    value: any
  ) => {
    setConfig(prev => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex

          const updated = { ...ex, [field]: value }

          // Auto-update protocol when type changes
          if (field === 'type') {
            updated.protocol = getProtocolFromType(value)
            // Set defaults for special types
            if (value === 'variable-push' && !updated.variablePushRange) {
              updated.variablePushRange = 30
            }
          }

          return updated
        })
      }
    })
  }

  const handleToggleEnabled = (exerciseId: string) => {
    setConfig(prev => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map(ex =>
          ex.id === exerciseId ? { ...ex, enabled: !ex.enabled } : ex
        )
      }
    })
  }

  const handleDeleteExercise = (exerciseId: string) => {
    setConfig(prev => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
      }
    })
  }

  const handleAddExercise = () => {
    setConfig(prev => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: [...prev.exercises, createExercise()]
      }
    })
  }

  const handleAddCustomType = (exerciseId: string) => {
    if (!customTypeName.trim()) return

    const newType = customTypeName.trim().toLowerCase().replace(/\s+/g, '-')
    const updatedCustomTypes = [...customTypes, newType]
    setCustomTypes(updatedCustomTypes)
    localStorage.setItem('customExerciseTypes', JSON.stringify(updatedCustomTypes))

    handleExerciseChange(exerciseId, 'type', newType)
    setShowCustomTypeInput(null)
    setCustomTypeName('')
  }

  const handleSave = () => {
    if (!config) return

    const updatedConfig: WorkoutConfig = {
      ...config,
      name: configName,
      totalMinutes
    }

    saveWorkoutConfig(updatedConfig)
    onSave(updatedConfig.id)
    onClose()
  }

  const handleSaveAsTemplate = () => {
    if (!config || !newTemplateName.trim()) return

    const newConfig = cloneWorkoutConfig(config, newTemplateName)
    saveWorkoutConfig(newConfig)
    setShowSaveAsModal(false)
    setNewTemplateName('')

    // Switch to using this new config
    setConfig(newConfig)
    setConfigName(newConfig.name)
  }

  const handleMoveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    setConfig(prev => {
      if (!prev) return prev
      const exercises = [...prev.exercises]
      const index = exercises.findIndex(ex => ex.id === exerciseId)
      if (index === -1) return prev

      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= exercises.length) return prev

      // Swap using temp variable
      const temp = exercises[index]
      exercises[index] = exercises[newIndex]
      exercises[newIndex] = temp

      return { ...prev, exercises }
    })
  }

  // All type options including custom types
  const allTypeOptions = [
    ...EXERCISE_TYPE_OPTIONS,
    ...customTypes.map(t => ({ value: t, label: t }))
  ]

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-theme-surface rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-content-primary">Edit Workout</h2>
            <input
              type="text"
              value={configName}
              onChange={e => setConfigName(e.target.value)}
              className="bg-theme-elevated text-content-primary px-3 py-1 rounded text-sm font-semibold"
              placeholder="Workout name"
            />
          </div>
          <div className="text-content-secondary text-sm">
            Total: <span className="text-accent-muted font-bold">{totalMinutes.toFixed(1)} min</span>
          </div>
        </div>

        {/* Exercise Table */}
        <div className="flex-1 overflow-auto p-4">
          {/* Header Row */}
          <div className="grid grid-cols-[32px_32px_160px_60px_80px_70px_auto_32px] gap-2 mb-2 text-xs text-content-tertiary font-semibold px-2">
            <div></div>
            <div></div>
            <div>Type</div>
            <div>Min</div>
            <div>Speed</div>
            <div>→ BPM</div>
            <div>Options</div>
            <div></div>
          </div>

          {/* Exercise Rows */}
          <div className="space-y-1">
            {config.exercises.map((exercise, index) => {
              const isVariablePush = exercise.type === 'variable-push'
              const effectiveBpm = getExerciseBpm(exercise, pattern.current_bpm)
              const isFixedBpm = exercise.fixedBpm !== undefined

              return (
                <div
                  key={exercise.id}
                  className={`grid grid-cols-[32px_32px_160px_60px_80px_70px_auto_32px] gap-2 items-center p-2 rounded ${
                    exercise.enabled
                      ? 'bg-theme-elevated'
                      : 'bg-theme-base opacity-50'
                  }`}
                >
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveExercise(exercise.id, 'up')}
                      disabled={index === 0}
                      className="text-[10px] text-content-tertiary hover:text-content-primary disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveExercise(exercise.id, 'down')}
                      disabled={index === config.exercises.length - 1}
                      className="text-[10px] text-content-tertiary hover:text-content-primary disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Enable checkbox */}
                  <input
                    type="checkbox"
                    checked={exercise.enabled}
                    onChange={() => handleToggleEnabled(exercise.id)}
                    className="w-4 h-4 accent-accent"
                  />

                  {/* Type dropdown with custom option */}
                  <div className="flex items-center gap-1">
                    {showCustomTypeInput === exercise.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={customTypeName}
                          onChange={e => setCustomTypeName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddCustomType(exercise.id)
                            if (e.key === 'Escape') setShowCustomTypeInput(null)
                          }}
                          className="bg-theme-base text-content-primary px-2 py-1 rounded text-xs w-24"
                          placeholder="Type name"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddCustomType(exercise.id)}
                          className="text-accent text-xs"
                        >
                          +
                        </button>
                        <button
                          onClick={() => setShowCustomTypeInput(null)}
                          className="text-content-tertiary text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <select
                          value={exercise.type}
                          onChange={e => {
                            if (e.target.value === '__custom__') {
                              setShowCustomTypeInput(exercise.id)
                            } else {
                              handleExerciseChange(exercise.id, 'type', e.target.value)
                            }
                          }}
                          className="bg-theme-base text-content-primary px-2 py-1 rounded text-xs flex-1"
                        >
                          {allTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                          <option value="__custom__">+ Custom...</option>
                        </select>
                      </>
                    )}
                  </div>

                  {/* Duration - allows decimals */}
                  <input
                    type="number"
                    min="0.5"
                    max="30"
                    step="0.5"
                    value={exercise.durationMinutes}
                    onChange={e =>
                      handleExerciseChange(
                        exercise.id,
                        'durationMinutes',
                        parseFloat(e.target.value) || 1
                      )
                    }
                    className="bg-theme-base text-content-primary px-2 py-1 rounded text-xs w-full"
                  />

                  {/* Speed: Ratio OR Fixed BPM */}
                  <div className="flex items-center gap-1">
                    {isFixedBpm ? (
                      // Fixed BPM mode
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="20"
                          max="300"
                          value={exercise.fixedBpm}
                          onChange={e =>
                            handleExerciseChange(
                              exercise.id,
                              'fixedBpm',
                              parseInt(e.target.value) || 60
                            )
                          }
                          className="bg-accent3-bg text-accent3-muted px-1 py-1 rounded text-xs w-12 font-bold"
                        />
                        <button
                          onClick={() => handleExerciseChange(exercise.id, 'fixedBpm', undefined)}
                          className="text-content-tertiary hover:text-content-primary text-[10px]"
                          title="Switch to ratio"
                        >
                          %
                        </button>
                      </div>
                    ) : (
                      // Ratio mode
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="30"
                          max="150"
                          step="5"
                          value={Math.round(exercise.tempoRatio * 100)}
                          onChange={e =>
                            handleExerciseChange(
                              exercise.id,
                              'tempoRatio',
                              (parseInt(e.target.value) || 100) / 100
                            )
                          }
                          className="bg-theme-base text-content-primary px-1 py-1 rounded text-xs w-10"
                        />
                        <span className="text-content-tertiary text-[10px]">%</span>
                        <button
                          onClick={() => handleExerciseChange(exercise.id, 'fixedBpm', effectiveBpm)}
                          className="text-content-tertiary hover:text-accent3-muted text-[10px]"
                          title="Set fixed BPM"
                        >
                          #
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Calculated BPM */}
                  <div className="text-accent3-muted font-mono text-xs font-bold">
                    {effectiveBpm}
                  </div>

                  {/* Dynamic options based on type */}
                  <div className="flex items-center gap-2">
                    {isVariablePush && (
                      <div className="flex items-center gap-1">
                        <span className="text-content-tertiary text-[10px]">±</span>
                        <input
                          type="number"
                          min="10"
                          max="50"
                          step="5"
                          value={exercise.variablePushRange || 30}
                          onChange={e =>
                            handleExerciseChange(
                              exercise.id,
                              'variablePushRange',
                              parseInt(e.target.value) || 30
                            )
                          }
                          className="bg-theme-base text-content-primary px-1 py-1 rounded text-xs w-10"
                        />
                        <span className="text-content-tertiary text-[10px]">%</span>
                      </div>
                    )}
                    {!isVariablePush && (
                      <span className="text-content-tertiary text-[10px]">—</span>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="text-status-error hover:text-status-error-hover text-sm"
                    title="Delete exercise"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>

          {/* Add Exercise Button */}
          <button
            onClick={handleAddExercise}
            className="w-full mt-4 py-2 border-2 border-dashed border-border hover:border-accent text-content-secondary hover:text-accent rounded-lg text-sm font-semibold transition-colors"
          >
            + Add Exercise
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-xs text-content-tertiary">
            Pattern: {pattern.name} ({pattern.current_bpm} → {pattern.target_bpm} BPM)
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-accent hover:bg-accent-hover text-content-primary font-semibold rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveAsModal(true)}
              className="px-4 py-2 bg-theme-elevated hover:bg-theme-hover text-content-primary font-semibold rounded-lg transition-colors"
            >
              Save As Template
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-theme-elevated hover:bg-theme-hover text-content-primary font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Save As Template Modal */}
      {showSaveAsModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
          onClick={() => setShowSaveAsModal(false)}
        >
          <div
            className="bg-theme-surface rounded-lg p-6 border border-border max-w-md w-full"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-content-primary mb-4">
              Save As Template
            </h3>
            <input
              type="text"
              value={newTemplateName}
              onChange={e => setNewTemplateName(e.target.value)}
              className="w-full bg-theme-elevated text-content-primary px-4 py-2 rounded-lg mb-4"
              placeholder="Template name"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveAsTemplate}
                disabled={!newTemplateName.trim()}
                className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-50 text-content-primary font-bold py-3 rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveAsModal(false)}
                className="flex-1 bg-theme-elevated hover:bg-theme-hover text-content-primary font-bold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
