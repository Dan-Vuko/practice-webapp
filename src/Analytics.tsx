import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { SessionEntity, UserPatternProgressEntity } from './database'

interface AnalyticsProps {
  progress: UserPatternProgressEntity
  onClose: () => void
}

export function Analytics({ progress, onClose }: AnalyticsProps) {
  const [sessions, setSessions] = useState<SessionEntity[]>([])
  const [projection, setProjection] = useState<{
    daysToGoal: number
    estimatedDate: string
    weeksNeeded: number
    sessionsNeeded: number
  } | null>(null)

  useEffect(() => {
    loadSessions()
  }, [progress.id])

  const loadSessions = async () => {
    try {
      // Fetch from server instead of localStorage
      const response = await fetch('http://localhost:3004/api/workouts')
      const data = await response.json()

      if (data.success) {
        // Filter workouts for this pattern
        const patternWorkouts = data.workouts.filter((w: any) => w.pattern_id === (progress.pattern_id || progress.id))

        // Convert to session format
        const sessionData = patternWorkouts.map((w: any) => ({
          id: w.id,
          user_pattern_progress_id: progress.id,
          start_time: w.date,
          end_time: w.date,
          duration_minutes: w.practice_minutes,
          starting_bpm: w.starting_bpm,
          ending_bpm: w.ending_bpm,
          avg_accuracy: 0,
          total_attempts: 0,
          successful_attempts: 0,
          myelination_cycle_week: 0,
          hours_since_last_session: 0,
          in_consolidation_window: false
        }))

        setSessions(sessionData.sort((a: SessionEntity, b: SessionEntity) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()))

        // Calculate projection
        if (sessionData.length >= 2) {
          calculateProjection(sessionData)
        }
      }
    } catch (error) {
      console.error('❌ Failed to load workouts from server:', error)
      setSessions([])
    }
  }

  const calculateProjection = (sessionData: SessionEntity[]) => {
    // Linear regression to predict BPM growth
    const dataPoints = sessionData.map((s, i) => ({
      x: i, // session number
      y: s.starting_bpm // Just use the BPM they practiced at
    }))

    // Calculate slope (BPM increase per session)
    const n = dataPoints.length
    const sumX = dataPoints.reduce((sum, p) => sum + p.x, 0)
    const sumY = dataPoints.reduce((sum, p) => sum + p.y, 0)
    const sumXY = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0)
    const sumX2 = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

    // Use the most recent BPM as current
    const currentBpm = sessionData[sessionData.length - 1].starting_bpm
    const targetBpm = progress.target_bpm
    const bpmRemaining = targetBpm - currentBpm

    if (slope > 0 && bpmRemaining > 0) {
      const sessionsNeeded = Math.ceil(bpmRemaining / slope)

      // Estimate days based on practice frequency
      const sessionDates = sessionData.map(s => new Date(s.start_time).getTime())
      const avgDaysBetweenSessions = sessionDates.length > 1
        ? sessionDates.slice(1).reduce((sum, date, i) => sum + (date - sessionDates[i]) / (1000 * 60 * 60 * 24), 0) / (sessionDates.length - 1)
        : 3 // default to 3 days if only one session

      const daysToGoal = Math.ceil(sessionsNeeded * avgDaysBetweenSessions)
      const estimatedDate = new Date(Date.now() + daysToGoal * 24 * 60 * 60 * 1000).toLocaleDateString()
      const weeksNeeded = Math.ceil(daysToGoal / 7)

      setProjection({
        daysToGoal,
        estimatedDate,
        weeksNeeded,
        sessionsNeeded
      })
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Delete this workout session?')) {
      try {
        // Delete via server endpoint
        const response = await fetch(`http://localhost:3004/api/workouts/${sessionId}`, {
          method: 'DELETE'
        })
        const result = await response.json()

        if (result.success) {
          console.log('✅ Workout deleted from file')
          await loadSessions()
        } else {
          console.error('❌ Failed to delete workout:', result.error)
        }
      } catch (error) {
        console.error('❌ Error deleting workout:', error)
      }
    }
  }

  // Prepare chart data
  const chartData = sessions.map((session, i) => ({
    session: i + 1,
    date: new Date(session.start_time).toLocaleDateString(),
    bpm: session.starting_bpm
  }))

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            Analytics: Pattern {(progress as any).name || progress.pattern_id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Goal Projection Card */}
          {projection && (
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Goal Projection</h3>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Current BPM</div>
                  <div className="text-3xl font-bold text-blue-400">{(progress as any).current_bpm || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Target BPM</div>
                  <div className="text-3xl font-bold text-green-400">{(progress as any).target_bpm || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Sessions Needed</div>
                  <div className="text-3xl font-bold text-yellow-400">{projection.sessionsNeeded}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Estimated Date</div>
                  <div className="text-lg font-bold text-purple-400">{projection.estimatedDate}</div>
                  <div className="text-xs text-gray-500">({projection.weeksNeeded} weeks)</div>
                </div>
              </div>
            </div>
          )}

          {/* BPM Progress Chart */}
          {chartData.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">BPM Progress Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="bpm" stroke="#8B5CF6" strokeWidth={3} name="BPM" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Session History */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Workout History</h3>
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No workout sessions yet. Complete and save a workout to see your progress here.
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex justify-between items-center hover:border-gray-600 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="text-sm text-gray-400">Date</div>
                          <div className="text-white font-semibold">
                            {new Date(session.start_time).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Duration</div>
                          <div className="text-white font-semibold">{session.duration_minutes} min</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">BPM Practiced</div>
                          <div className="text-blue-400 font-semibold text-lg">
                            {session.starting_bpm}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-400 rounded transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
