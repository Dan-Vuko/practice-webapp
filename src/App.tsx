import { useState, useEffect, useRef } from 'react'
import { PATTERNS } from './patterns'
import { Metronome, Subdivision, Dynamic } from './metronome'
import { db, UserPatternProgressEntity } from './database'
import { Exercise } from './practice-routines'
import { Analytics } from './Analytics'
import { PatternDatabase, PatternItem } from './pattern-database'
import { useAuth } from './lib/AuthContext'

function App() {
  const { user, signOut } = useAuth()
  const [selectedPattern, setSelectedPattern] = useState<PatternItem | null>(null)
  const [dbInitialized, setDbInitialized] = useState(false)
  const [metronome] = useState(() => new Metronome(60, [1, 2, 1, 3]))
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [sessionExercises, setSessionExercises] = useState<Exercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [subdivision, setSubdivision] = useState<Subdivision>('quarter')
  const [beatDynamics, setBeatDynamics] = useState<Dynamic[]>(['loud', 'normal', 'normal', 'normal'])
  const [volume, setVolume] = useState<number>(1.4)
  const [showAnalytics, setShowAnalytics] = useState<UserPatternProgressEntity | null>(null)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [workoutStartBpm, setWorkoutStartBpm] = useState<number>(0)
  const [sessionReps, setSessionReps] = useState<number>(0)

  // Workout automation
  const [exerciseTimes, setExerciseTimes] = useState<Record<number, number>>({}) // exerciseIndex -> seconds elapsed
  const [, setBeatCount] = useState(0)
  const [clickCount, setClickCount] = useState(0) // Track total clicks for rep counting
  const lastClickCountRef = useRef(0) // Track last processed click count
  const lastModeRef = useRef({ microBurst: false, subdivision: 'quarter' as Subdivision })
  const [variablePushMode, setVariablePushMode] = useState(false)
  const [, setVariablePushBaseTempo] = useState(0)
  const [variablePushBeatInCycle, setVariablePushBeatInCycle] = useState(0)
  const [microBurstMode, setMicroBurstMode] = useState(false)
  const [, setMicroBurstBeatInCycle] = useState(0)
  const [microBurstInSoundPhase, setMicroBurstInSoundPhase] = useState(true)
  const [savedDynamics, setSavedDynamics] = useState<Dynamic[]>(['loud', 'normal', 'normal', 'normal'])

  // New pattern form
  const [newPatternId, setNewPatternId] = useState(1)
  const [newStartingBpm, setNewStartingBpm] = useState(60)
  const [newTargetBpm, setNewTargetBpm] = useState(150)

  // Initialize database
  useEffect(() => {
    const initDB = async () => {
      await db.init()
      await db.seedPatterns(PATTERNS.map(p => ({ id: p.id, pattern: p.pattern, sequence: p.sequence })))
      setDbInitialized(true)
    }
    initDB()
  }, [])

  // Metronome beat and click callbacks - only set up once
  useEffect(() => {
    metronome.clearBeatCallbacks()
    metronome.clearClickCallbacks()

    metronome.onBeat((beat) => {
      setCurrentBeat(beat)
      setBeatCount(prev => prev + 1)

      // Handle micro-burst visual cycling (alternates every beat)
      setMicroBurstBeatInCycle(prev => {
        const cycleLength = 2 // Alternates every beat

        setMicroBurstMode(isBurst => {
          if (isBurst) {
            // Update visual for the beat that just played
            // Even beats (0): BURST, Odd beats (1): REST
            setMicroBurstInSoundPhase(prev === 0)
          }
          return isBurst
        })

        // Increment for next beat
        return (prev + 1) % cycleLength
      })

      // Handle variable push tempo ramping
      setVariablePushBeatInCycle(prev => {
        const cycleLength = 64 // 32 beats up, 32 beats down
        const newBeat = (prev + 1) % cycleLength

        // Update tempo based on position in cycle
        setVariablePushMode(isVarPush => {
          if (isVarPush) {
            setVariablePushBaseTempo(baseTempo => {
              if (baseTempo > 0) {
                const minTempo = baseTempo * 0.7  // 30% below
                const maxTempo = baseTempo * 1.3  // 30% above
                const range = maxTempo - minTempo

                let newTempo: number
                if (newBeat < 32) {
                  // Ramping up: 0-31 beats
                  const progress = newBeat / 32
                  newTempo = minTempo + (range * progress)
                } else {
                  // Ramping down: 32-63 beats
                  const progress = (newBeat - 32) / 32
                  newTempo = maxTempo - (range * progress)
                }

                metronome.setTempo(Math.round(newTempo))
              }
              return baseTempo
            })
          }
          return isVarPush
        })

        return newBeat
      })
    })

    // Track every click for rep counting
    metronome.onClick(() => {
      setClickCount(prev => prev + 1)
    })

    return () => {
      metronome.clearBeatCallbacks()
      metronome.clearClickCallbacks()
      metronome.dispose()
    }
  }, [metronome])

  // Update metronome subdivision when changed
  useEffect(() => {
    metronome.setSubdivision(subdivision)
  }, [subdivision, metronome])

  // Update metronome beat dynamics when changed
  useEffect(() => {
    metronome.setBeatDynamics(beatDynamics)
  }, [beatDynamics, metronome])

  // Update metronome volume when changed
  useEffect(() => {
    metronome.setVolume(volume)
  }, [volume, metronome])

  // Track exercise time using actual elapsed time (more accurate than setInterval)
  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number | null = null
    let lastExerciseIndex = currentExerciseIndex

    const updateTime = () => {
      if (!isPlaying) return

      if (startTime === null) {
        startTime = Date.now()
      }

      // Reset if exercise changed
      if (lastExerciseIndex !== currentExerciseIndex) {
        startTime = Date.now()
        lastExerciseIndex = currentExerciseIndex
      }

      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)

      setExerciseTimes(prev => {
        const currentTime = prev[currentExerciseIndex] || 0

        // Only update if time actually changed
        if (elapsedSeconds !== currentTime) {
          const newTime = elapsedSeconds

          // Check if exercise is complete
          const currentExercise = sessionExercises[currentExerciseIndex]
          if (currentExercise) {
            const durationSeconds = currentExercise.durationMinutes * 60
            if (newTime >= durationSeconds) {
              // Stop the metronome
              metronome.stop()
              setIsPlaying(false)
              setVariablePushMode(false)
              return prev
            }
          }

          return {
            ...prev,
            [currentExerciseIndex]: newTime
          }
        }
        return prev
      })

      animationFrame = requestAnimationFrame(updateTime)
    }

    if (isPlaying) {
      animationFrame = requestAnimationFrame(updateTime)
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [isPlaying, currentExerciseIndex, sessionExercises, metronome])

  // Update rep count based on clicks (incremental, not recalculated)
  useEffect(() => {
    // Only process new clicks since last update
    const newClicks = clickCount - lastClickCountRef.current
    if (newClicks <= 0) return

    const clicksPerBeat = subdivision === 'quarter' ? 1 : subdivision === 'eighth' ? 2 : 4
    const clicksPerRep = microBurstMode ? clicksPerBeat * 2 : clicksPerBeat

    // Calculate how many new reps we've earned from the new clicks
    const previousRemainder = lastClickCountRef.current % clicksPerRep
    const totalClicksForThisMode = previousRemainder + newClicks
    const newReps = Math.floor(totalClicksForThisMode / clicksPerRep)

    if (newReps > 0) {
      setSessionReps(prev => prev + newReps)
    }

    // Update refs
    lastClickCountRef.current = clickCount
    lastModeRef.current = { microBurst: microBurstMode, subdivision }
  }, [clickCount, subdivision, microBurstMode])

  const handleAddPattern = async () => {
    const pattern = PATTERNS.find(p => p.id === newPatternId)
    if (!pattern) return

    await db.createUserPatternProgress({
      pattern_id: String(newPatternId),
      pattern_name: pattern.pattern,
      string_set: 'default',
      current_bpm: newStartingBpm,
      target_bpm: newTargetBpm,
      max_bpm_achieved: newStartingBpm,
      total_practice_minutes: 0,
      total_sessions: 0,
      last_practiced: new Date().toISOString(),
      current_cycle_week: 1,
      cycle_start_date: new Date().toISOString(),
    })
    setShowAddModal(false)
  }

  const handleSelectPatternFromDatabase = (pattern: PatternItem) => {
    setSelectedPattern(pattern)
    metronome.setPattern(pattern.sequence)
    metronome.setTempo(pattern.current_bpm)

    // Load percentage-based workout
    const exercises = getPercentageWorkout(pattern.current_bpm)
    setSessionExercises(exercises)
    setCurrentExerciseIndex(0)

    // Track workout start
    setWorkoutStartTime(new Date())
    setWorkoutStartBpm(pattern.current_bpm)

    // Reset exercise times and reps
    setExerciseTimes({})
    setSessionReps(0)
    setBeatCount(0)
    setClickCount(0)
  }

  const handleSaveWorkout = async () => {
    if (!selectedPattern || !workoutStartTime) {
      alert('No workout session to save')
      return
    }

    const endTime = new Date()
    const durationMinutes = Math.round((endTime.getTime() - workoutStartTime.getTime()) / (1000 * 60))

    // Calculate total exercise time completed
    const completedExercises = Object.values(exerciseTimes).reduce((sum, time) => sum + time, 0) / 60

    if (completedExercises < 1) {
      alert('Complete at least 1 minute of practice before saving')
      return
    }

    // Create workout data
    const newWorkout = {
      id: crypto.randomUUID(),
      pattern_id: selectedPattern.id,
      pattern_name: selectedPattern.name,
      date: endTime.toISOString(),
      duration_minutes: durationMinutes,
      practice_minutes: Math.round(completedExercises),
      starting_bpm: workoutStartBpm,
      ending_bpm: metronome.getTempo(),
      total_reps: sessionReps,
      exercises: sessionExercises.map((ex, idx) => ({
        type: ex.type,
        tempo: ex.startingTempo,
        time_spent: exerciseTimes[idx] || 0
      }))
    }

    // Save to file via server
    try {
      const response = await fetch('http://localhost:3004/api/save-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkout)
      })
      const result = await response.json()
      if (result.success) {
        console.log(`✅ Workout saved to: ${result.path}`)
      }
    } catch (error) {
      console.error('❌ Failed to save workout to file:', error)
      console.log('💾 Saving to localStorage as fallback')
    }

    // Also save to localStorage as backup
    const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
    workoutHistory.push(newWorkout)
    localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory, null, 2))

    // Update pattern in localStorage
    const storedData = localStorage.getItem('patternDatabase')
    if (storedData) {
      const items = JSON.parse(storedData)
      const updatedItems = items.map((item: any) => {
        if (item.id === selectedPattern.id && !item.isFolder) {
          return {
            ...item,
            total_sessions: item.total_sessions + 1,
            total_practice_minutes: item.total_practice_minutes + Math.round(completedExercises),
            total_reps: item.total_reps + sessionReps,
            last_practiced: new Date().toISOString()
          }
        }
        return item
      })
      localStorage.setItem('patternDatabase', JSON.stringify(updatedItems))

      // Update selectedPattern state
      const updatedPattern = updatedItems.find((item: any) => item.id === selectedPattern.id)
      if (updatedPattern) {
        setSelectedPattern(updatedPattern)
      }
    }

    console.log('Workout saved to localStorage key: workoutHistory')
    console.log('Latest workout:', newWorkout)
    alert(`Workout saved successfully! ${sessionReps} reps completed.\n\nSaved to localStorage key: "workoutHistory"`)

    // Reset workout tracking
    setWorkoutStartTime(new Date())
    setWorkoutStartBpm(metronome.getTempo())
    setExerciseTimes({})
    setSessionReps(0)
    setBeatCount(0)
    setClickCount(0)
  }

  const getPercentageWorkout = (currentBpm: number): Exercise[] => {
    return [
      {
        type: 'warm-up-60',
        durationMinutes: 2,
        startingTempo: Math.round(currentBpm * 0.6),
        description: `Warm-up: 60% of current (${Math.round(currentBpm * 0.6)} BPM)`,
        protocol: 'metronome-progression'
      },
      {
        type: 'warm-up-70',
        durationMinutes: 3,
        startingTempo: Math.round(currentBpm * 0.7),
        description: `Warm-up: 70% of current (${Math.round(currentBpm * 0.7)} BPM)`,
        protocol: 'metronome-progression'
      },
      {
        type: 'micro-burst',
        durationMinutes: 2,
        startingTempo: Math.round(currentBpm * 1.5),
        description: `Micro-bursts: Play once at +50%, then rest (${Math.round(currentBpm * 1.5)} BPM)`,
        protocol: 'micro-burst'
      },
      {
        type: 'pianissimo',
        durationMinutes: 2,
        startingTempo: currentBpm,
        description: `Pianissimo: 100% tempo, soft volume for relaxation (${currentBpm} BPM)`,
        protocol: 'metronome-progression'
      },
      {
        type: 'sub-baseline-recovery',
        durationMinutes: 2,
        startingTempo: Math.round(currentBpm * 0.35),
        description: `Sub-baseline Recovery: 35% effortless execution (${Math.round(currentBpm * 0.35)} BPM)`,
        protocol: 'metronome-progression'
      },
      {
        type: 'variable-push',
        durationMinutes: 2,
        startingTempo: currentBpm,
        description: `Variable Push: ±30% over 32 clicks (${Math.round(currentBpm * 0.7)}-${Math.round(currentBpm * 1.3)} BPM)`,
        protocol: 'variable-push'
      },
      {
        type: 'overspeed-push',
        durationMinutes: 3,
        startingTempo: Math.round(currentBpm * 1.1),
        description: `Overspeed: 110% of current (${Math.round(currentBpm * 1.1)} BPM)`,
        protocol: 'metronome-progression'
      },
      {
        type: 'recovery',
        durationMinutes: 2,
        startingTempo: Math.round(currentBpm * 0.7),
        description: `Recovery: 70% for consolidation (${Math.round(currentBpm * 0.7)} BPM)`,
        protocol: 'metronome-progression'
      },
      {
        type: 'main-workout',
        durationMinutes: 5,
        startingTempo: Math.round(currentBpm * 0.85),
        description: `Main: 85% sustained (${Math.round(currentBpm * 0.85)} BPM)`,
        protocol: 'metronome-progression'
      },
      {
        type: 'step-progression',
        durationMinutes: 3,
        startingTempo: Math.round(currentBpm * 1.05),
        description: `Step Progression: +5% methodical increase (${Math.round(currentBpm * 1.05)} BPM)`,
        protocol: 'metronome-progression'
      }
    ]
  }

  const handleStartExercise = async (exerciseIndex: number) => {
    const exercise = sessionExercises[exerciseIndex]
    if (exercise.type === 'rest') return

    setCurrentExerciseIndex(exerciseIndex)
    // Don't reset time - it persists

    // Check exercise type and configure accordingly
    if (exercise.protocol === 'variable-push') {
      setVariablePushMode(true)
      setVariablePushBaseTempo(exercise.startingTempo)
      setVariablePushBeatInCycle(0)
      setMicroBurstMode(false)
      // Start at 30% below
      metronome.setTempo(Math.round(exercise.startingTempo * 0.7))
      metronome.setMuted(false)
    } else if (exercise.protocol === 'micro-burst') {
      setMicroBurstMode(true)
      setMicroBurstBeatInCycle(0)
      setMicroBurstInSoundPhase(true) // Start showing BURST
      setVariablePushMode(false)
      // Save current dynamics and set all to normal (no accents during micro-burst)
      setSavedDynamics([...beatDynamics])
      const evenDynamics: Dynamic[] = ['normal', 'normal', 'normal', 'normal']
      setBeatDynamics(evenDynamics)
      // Change to quarter notes so pattern plays slower (1 note per beat)
      metronome.setSubdivision('quarter')
      // Set high tempo for bursts
      metronome.setTempo(exercise.startingTempo)
    } else {
      setVariablePushMode(false)
      setVariablePushBaseTempo(0)
      // Restore dynamics and subdivision if exiting micro-burst mode
      if (microBurstMode) {
        setBeatDynamics([...savedDynamics])
        metronome.setSubdivision(subdivision)
      }
      setMicroBurstMode(false)
      // Set tempo for the exercise
      metronome.setTempo(exercise.startingTempo)
      metronome.setMuted(false)
    }

    // Reset beat counter (but NOT click counter - we want reps to accumulate across exercises)
    setBeatCount(0)

    // Start metronome if not already playing
    if (!isPlaying) {
      await metronome.start()
      setIsPlaying(true)
    }
  }

  const handlePlay = async () => {
    if (isPlaying) {
      metronome.stop()
      setIsPlaying(false)
    } else {
      await metronome.start()
      setIsPlaying(true)
    }
  }

  const cycleBeatDynamic = (beatIndex: number) => {
    const newDynamics = [...beatDynamics]
    const current = newDynamics[beatIndex]
    newDynamics[beatIndex] = current === 'loud' ? 'normal' : current === 'normal' ? 'soft' : 'loud'
    setBeatDynamics(newDynamics)
  }

  const getDynamicColor = (dynamic: Dynamic) => {
    switch (dynamic) {
      case 'loud': return 'bg-red-500'
      case 'normal': return 'bg-blue-400'
      case 'soft': return 'bg-gray-500'
    }
  }

  const getDynamicSize = (dynamic: Dynamic) => {
    switch (dynamic) {
      case 'loud': return 'w-5 h-5'
      case 'normal': return 'w-4 h-4'
      case 'soft': return 'w-3 h-3'
    }
  }

  const getTotalWorkoutSeconds = () => {
    return sessionExercises.reduce((sum, ex) => sum + (ex.durationMinutes * 60), 0)
  }

  const getWorkoutProgress = () => {
    if (sessionExercises.length === 0) return 0

    // Sum up all tracked exercise times
    let completedSeconds = 0
    sessionExercises.forEach((_, idx) => {
      completedSeconds += exerciseTimes[idx] || 0
    })

    const total = getTotalWorkoutSeconds()
    return Math.min(100, Math.round((completedSeconds / total) * 100))
  }

  const getCurrentExerciseTime = (exerciseIndex: number): number => {
    return exerciseTimes[exerciseIndex] || 0
  }

  if (!dbInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Initializing database...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1" />
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-green-500 bg-clip-text text-transparent">
              Speed Builder
            </h1>
            <p className="text-gray-400 text-lg">
              Pattern Database & 30-Minute Practice Sessions
            </p>
          </div>
          <div className="flex-1 flex justify-end">
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">{user?.username}</div>
              <button
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Pattern Database */}
          <div className="lg:col-span-2">
            <PatternDatabase
              onSelectPattern={handleSelectPatternFromDatabase}
              selectedPatternId={selectedPattern?.id || null}
              onShowAnalytics={(pattern) => setShowAnalytics(pattern as any)}
            />
          </div>

          {/* RIGHT: Metronome & Practice Session */}
          <div className="space-y-6">
            {/* Metronome */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Metronome</h3>
              {selectedPattern ? (
                <>
                  <div className="text-center mb-6">
                    <div className="text-sm text-gray-400 mb-2">
                      Pattern: {selectedPattern.name}
                    </div>


                    <div className="flex justify-center gap-6 mb-4">
                      {beatDynamics.map((dynamic, idx) => (
                        <button
                          key={idx}
                          onClick={() => cycleBeatDynamic(idx)}
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                            currentBeat === idx ? 'ring-4 ring-purple-500 scale-110' : ''
                          } hover:opacity-80`}
                        >
                          <div className={`rounded-full ${getDynamicColor(dynamic)} ${getDynamicSize(dynamic)} transition-all`} />
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mb-4">
                      Click dots: Red (Loud) → Blue (Normal) → Gray (Soft)
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <button
                        onClick={() => metronome.setTempo(Math.max(20, metronome.getTempo() - 5))}
                        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition-colors"
                        disabled={variablePushMode || microBurstMode}
                      >
                        -
                      </button>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-purple-400">
                          {metronome.getTempo()} BPM
                        </div>
                        {variablePushMode && (
                          <div className="text-xs text-yellow-400 mt-1">
                            {variablePushBeatInCycle < 32 ? '▲ Ramping Up' : '▼ Ramping Down'}
                          </div>
                        )}
                        {microBurstMode && (
                          <div className="text-xs text-orange-400 mt-1 font-bold">
                            {microBurstInSoundPhase ? '🔊 BURST' : '🔇 REST'}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => metronome.setTempo(Math.min(300, metronome.getTempo() + 5))}
                        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition-colors"
                        disabled={variablePushMode || microBurstMode}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="40"
                    max="200"
                    value={metronome.getTempo()}
                    onChange={(e) => metronome.setTempo(parseInt(e.target.value))}
                    disabled={variablePushMode || microBurstMode}
                    className="w-full h-2 bg-gray-700 rounded-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  />

                  {/* Volume Control */}
                  <div className="mb-6">
                    <label className="block text-gray-400 text-sm mb-2 font-semibold">
                      Volume: {Math.round((volume / 2.0) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(volume / 2.0) * 100}
                      onChange={(e) => setVolume((parseInt(e.target.value) / 100) * 2.0)}
                      className="w-full h-2 bg-gray-700 rounded-lg"
                    />
                  </div>

                  {/* Subdivision Selector */}
                  <div className="mb-6">
                    <label className="block text-gray-400 text-sm mb-2 font-semibold">Clicks Per Beat</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSubdivision('quarter')}
                        className={`py-2 rounded-lg text-lg font-bold transition-all ${
                          subdivision === 'quarter'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        1x
                      </button>
                      <button
                        onClick={() => setSubdivision('eighth')}
                        className={`py-2 rounded-lg text-lg font-bold transition-all ${
                          subdivision === 'eighth'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        2x
                      </button>
                      <button
                        onClick={() => setSubdivision('sixteenth')}
                        className={`py-2 rounded-lg text-lg font-bold transition-all ${
                          subdivision === 'sixteenth'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        4x
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      {subdivision === 'quarter' && '1 click per beat'}
                      {subdivision === 'eighth' && '2 clicks per beat'}
                      {subdivision === 'sixteenth' && '4 clicks per beat'}
                    </div>
                  </div>

                  <button
                    onClick={handlePlay}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'
                    }`}
                  >
                    {isPlaying ? 'STOP' : 'START'}
                  </button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Select a pattern from the database to practice
                </div>
              )}
            </div>

            {/* Progressive Workout Session */}
            {selectedPattern && sessionExercises.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Workout Plan</h3>

                {/* Overall Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Overall Progress</span>
                    <span className="text-xs text-gray-400">{getWorkoutProgress()}%</span>
                  </div>
                  <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all"
                      style={{ width: `${getWorkoutProgress()}%` }}
                    />
                  </div>
                </div>

                {/* Session Reps Counter */}
                <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Session Reps:</span>
                    <span className="text-2xl font-bold text-purple-400">{sessionReps}</span>
                  </div>
                  {selectedPattern && selectedPattern.total_sessions > 0 && (
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      Avg: {Math.round(selectedPattern.total_reps / selectedPattern.total_sessions)}/session
                    </div>
                  )}
                </div>


                <div className="space-y-3">
                  {sessionExercises.map((exercise, idx) => {
                    const exerciseDurationSeconds = exercise.durationMinutes * 60
                    const exerciseTime = getCurrentExerciseTime(idx)
                    const exerciseProgress = Math.min(100, (exerciseTime / exerciseDurationSeconds) * 100)
                    const isComplete = exerciseTime >= exerciseDurationSeconds

                    return (
                      <div
                        key={idx}
                        onDoubleClick={() => handleStartExercise(idx)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isComplete
                            ? 'bg-green-900/20 border-green-500'
                            : idx === currentExerciseIndex
                            ? 'bg-purple-900/30 border-purple-500'
                            : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white text-sm">{exercise.type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs">{exercise.durationMinutes} min</span>
                            {isComplete && <span className="text-green-400 text-xs font-bold">✓ COMPLETE</span>}
                          </div>
                        </div>
                        <div className="text-gray-400 text-xs mb-2">{exercise.description}</div>

                        {/* Individual Exercise Progress - Always show if there's progress */}
                        {exerciseTime > 0 && (
                          <div className="mt-2">
                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  isComplete ? 'bg-green-500' : 'bg-purple-500'
                                }`}
                                style={{ width: `${exerciseProgress}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-400 mt-1 text-center">
                              {exerciseTime}s / {exerciseDurationSeconds}s
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-gray-400 text-xs text-center">
                    Double-click an exercise to start with count-in
                  </div>
                  <div className="text-gray-400 text-sm mt-2">
                    Total: {sessionExercises.reduce((sum, e) => sum + e.durationMinutes, 0)} minutes
                  </div>
                </div>

                {/* Save Workout Button */}
                <button
                  onClick={handleSaveWorkout}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all"
                >
                  💾 Save Workout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Modal */}
        {showAnalytics && (
          <Analytics
            progress={showAnalytics}
            onClose={() => setShowAnalytics(null)}
          />
        )}

        {/* Add Pattern Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold text-white mb-4">Add Pattern</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Pattern</label>
                  <select
                    value={newPatternId}
                    onChange={(e) => setNewPatternId(parseInt(e.target.value))}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg text-lg font-mono font-bold"
                  >
                    {PATTERNS.map(p => (
                      <option key={p.id} value={p.id}>{p.pattern}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Starting BPM</label>
                  <input
                    type="number"
                    min="40"
                    max="200"
                    value={newStartingBpm}
                    onChange={(e) => setNewStartingBpm(parseInt(e.target.value) || 60)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                    placeholder="e.g., 60"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Target BPM</label>
                  <input
                    type="number"
                    min="60"
                    max="300"
                    value={newTargetBpm}
                    onChange={(e) => setNewTargetBpm(parseInt(e.target.value) || 150)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                    placeholder="e.g., 150"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddPattern}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
