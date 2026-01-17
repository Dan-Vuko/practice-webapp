import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'

interface Workout {
  id: string
  pattern_id: string
  pattern_name: string
  date: string
  duration_minutes: number
  practice_minutes: number
  starting_bpm: number
  ending_bpm: number
  total_reps: number
}

interface DailyStats {
  date: string
  displayDate: string
  totalMinutes: number
  sessions: number
  patterns: { name: string; minutes: number }[]
}

interface PatternFocus {
  patternName: string
  totalMinutes: number
  sessionCount: number
  percentage: number
  color: string
}

type TimePeriod = 'week' | 'month' | '3months' | 'all'

interface MetaAnalyticsProps {
  onClose: () => void
}

// Color palette for patterns
const PATTERN_COLORS = [
  '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6',
  '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#84CC16',
  '#A855F7', '#06B6D4', '#F43F5E', '#22C55E', '#FBBF24'
]

export function MetaAnalytics({ onClose }: MetaAnalyticsProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')

  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = async () => {
    try {
      const response = await fetch('http://localhost:3004/api/workouts')
      const data = await response.json()

      if (data.success) {
        setWorkouts(data.workouts.sort((a: Workout, b: Workout) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ))
      }
    } catch (error) {
      console.error('Failed to load workouts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter workouts by time period
  const filteredWorkouts = useMemo(() => {
    if (timePeriod === 'all') return workouts

    const now = new Date()
    let cutoffDate: Date

    switch (timePeriod) {
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '3months':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        return workouts
    }

    return workouts.filter(w => new Date(w.date) >= cutoffDate)
  }, [workouts, timePeriod])

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalMinutes = filteredWorkouts.reduce((sum, w) => sum + w.practice_minutes, 0)
    const totalSessions = filteredWorkouts.length
    const uniquePatterns = new Set(filteredWorkouts.map(w => w.pattern_name)).size

    // Calculate streaks (using all workouts for accurate streak calculation)
    const { currentStreak, longestStreak } = calculateStreaks(workouts)

    return {
      totalMinutes,
      totalSessions,
      uniquePatterns,
      currentStreak,
      longestStreak
    }
  }, [filteredWorkouts, workouts])

  // Group workouts by day
  const dailyStats = useMemo((): DailyStats[] => {
    const dayMap = new Map<string, DailyStats>()

    filteredWorkouts.forEach(workout => {
      const dateStr = new Date(workout.date).toISOString().split('T')[0]
      const displayDate = new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      if (!dayMap.has(dateStr)) {
        dayMap.set(dateStr, {
          date: dateStr,
          displayDate,
          totalMinutes: 0,
          sessions: 0,
          patterns: []
        })
      }

      const day = dayMap.get(dateStr)!
      day.totalMinutes += workout.practice_minutes
      day.sessions += 1

      // Add or update pattern entry
      const existingPattern = day.patterns.find(p => p.name === workout.pattern_name)
      if (existingPattern) {
        existingPattern.minutes += workout.practice_minutes
      } else {
        day.patterns.push({ name: workout.pattern_name, minutes: workout.practice_minutes })
      }
    })

    return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredWorkouts])

  // Pattern focus data
  const patternFocus = useMemo((): PatternFocus[] => {
    const patternMap = new Map<string, { minutes: number; sessions: number }>()

    filteredWorkouts.forEach(workout => {
      if (!patternMap.has(workout.pattern_name)) {
        patternMap.set(workout.pattern_name, { minutes: 0, sessions: 0 })
      }
      const data = patternMap.get(workout.pattern_name)!
      data.minutes += workout.practice_minutes
      data.sessions += 1
    })

    const totalMinutes = filteredWorkouts.reduce((sum, w) => sum + w.practice_minutes, 0)

    return Array.from(patternMap.entries())
      .map(([name, data], idx) => ({
        patternName: name,
        totalMinutes: data.minutes,
        sessionCount: data.sessions,
        percentage: totalMinutes > 0 ? Math.round((data.minutes / totalMinutes) * 100) : 0,
        color: PATTERN_COLORS[idx % PATTERN_COLORS.length]
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
  }, [filteredWorkouts])

  // Weekly trends data
  const weeklyTrends = useMemo(() => {
    const weekMap = new Map<string, { minutes: number; sessions: number; days: Set<string> }>()

    filteredWorkouts.forEach(workout => {
      const date = new Date(workout.date)
      // Get week start (Monday)
      const day = date.getDay()
      const diff = date.getDate() - day + (day === 0 ? -6 : 1)
      const weekStart = new Date(date.setDate(diff)).toISOString().split('T')[0]

      if (!weekMap.has(weekStart)) {
        weekMap.set(weekStart, { minutes: 0, sessions: 0, days: new Set() })
      }

      const week = weekMap.get(weekStart)!
      week.minutes += workout.practice_minutes
      week.sessions += 1
      week.days.add(new Date(workout.date).toISOString().split('T')[0])
    })

    return Array.from(weekMap.entries())
      .map(([weekStart, data]) => ({
        week: new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weekStart,
        totalMinutes: data.minutes,
        sessions: data.sessions,
        avgSessionMinutes: data.sessions > 0 ? Math.round(data.minutes / data.sessions) : 0,
        activeDays: data.days.size
      }))
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
  }, [filteredWorkouts])

  // Calendar heatmap data
  const calendarData = useMemo(() => {
    const dayMap = new Map<string, number>()
    const now = new Date()
    let daysToShow: number

    switch (timePeriod) {
      case 'week': daysToShow = 7; break
      case 'month': daysToShow = 30; break
      case '3months': daysToShow = 90; break
      default: daysToShow = 365
    }

    // Initialize all days
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      dayMap.set(dateStr, 0)
    }

    // Fill in workout data
    filteredWorkouts.forEach(workout => {
      const dateStr = new Date(workout.date).toISOString().split('T')[0]
      if (dayMap.has(dateStr)) {
        dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + workout.practice_minutes)
      }
    })

    return Array.from(dayMap.entries()).map(([date, minutes]) => ({ date, minutes }))
  }, [filteredWorkouts, timePeriod])

  // Recent sessions
  const recentSessions = useMemo(() => {
    return [...filteredWorkouts]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  }, [filteredWorkouts])

  // Get unique pattern names for stacked bar chart
  const uniquePatternNames = useMemo(() => {
    const names = new Set<string>()
    dailyStats.forEach(day => day.patterns.forEach(p => names.add(p.name)))
    return Array.from(names)
  }, [dailyStats])

  // Transform daily stats for stacked bar chart
  const stackedBarData = useMemo(() => {
    return dailyStats.map(day => {
      const entry: Record<string, string | number> = {
        date: day.displayDate,
        fullDate: day.date,
        total: day.totalMinutes
      }
      day.patterns.forEach(p => {
        entry[p.name] = p.minutes
      })
      return entry
    })
  }, [dailyStats])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-700 max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">Practice Analytics</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold px-3 py-1"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Time Period Selector */}
          <div className="flex gap-2 justify-center">
            {(['week', 'month', '3months', 'all'] as TimePeriod[]).map(period => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  timePeriod === period
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {period === 'week' && 'Week'}
                {period === 'month' && 'Month'}
                {period === '3months' && '3 Months'}
                {period === 'all' && 'All Time'}
              </button>
            ))}
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm mb-1">Total Time</div>
              <div className="text-2xl font-bold text-purple-400">
                {formatDuration(summaryStats.totalMinutes)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm mb-1">Sessions</div>
              <div className="text-2xl font-bold text-blue-400">{summaryStats.totalSessions}</div>
            </div>
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm mb-1">Patterns</div>
              <div className="text-2xl font-bold text-green-400">{summaryStats.uniquePatterns}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm mb-1">Current Streak</div>
              <div className="text-2xl font-bold text-yellow-400">{summaryStats.currentStreak}d</div>
            </div>
            <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-500/30 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-sm mb-1">Longest Streak</div>
              <div className="text-2xl font-bold text-orange-400">{summaryStats.longestStreak}d</div>
            </div>
          </div>

          {/* Daily Practice Bar Chart */}
          {dailyStats.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Daily Practice</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stackedBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9CA3AF"
                    tick={{ fontSize: 11 }}
                    interval={timePeriod === 'week' ? 0 : 'preserveStartEnd'}
                  />
                  <YAxis stroke="#9CA3AF" label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                    formatter={(value) => [`${value} min`]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const total = (payload[0].payload as Record<string, number>).total
                        return `${label} - ${total} min total`
                      }
                      return label
                    }}
                  />
                  <Legend />
                  {uniquePatternNames.map((name, idx) => (
                    <Bar
                      key={name}
                      dataKey={name}
                      stackId="a"
                      fill={PATTERN_COLORS[idx % PATTERN_COLORS.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Calendar Heatmap + Pattern Focus */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Practice Calendar */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Practice Calendar</h3>
              <div className="grid gap-1" style={{
                gridTemplateColumns: `repeat(${timePeriod === 'week' ? 7 : Math.min(14, Math.ceil(calendarData.length / 7))}, 1fr)`
              }}>
                {calendarData.map(({ date, minutes }) => (
                  <div
                    key={date}
                    title={`${new Date(date).toLocaleDateString()}: ${minutes} min`}
                    className={`aspect-square rounded-sm ${getHeatmapColor(minutes)}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                <span>Less</span>
                <div className="w-4 h-4 rounded-sm bg-gray-700" />
                <div className="w-4 h-4 rounded-sm bg-purple-900" />
                <div className="w-4 h-4 rounded-sm bg-purple-700" />
                <div className="w-4 h-4 rounded-sm bg-purple-500" />
                <div className="w-4 h-4 rounded-sm bg-purple-400" />
                <span>More</span>
              </div>
            </div>

            {/* Pattern Focus */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Pattern Focus</h3>
              {patternFocus.length > 0 ? (
                <div className="space-y-3">
                  {patternFocus.slice(0, 8).map((pattern) => (
                    <div key={pattern.patternName} className="flex items-center gap-3">
                      <div className="w-20 text-sm font-mono text-gray-300 truncate">
                        {pattern.patternName}
                      </div>
                      <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pattern.percentage}%`,
                            backgroundColor: pattern.color
                          }}
                        />
                      </div>
                      <div className="text-sm text-gray-400 w-16 text-right">
                        {pattern.totalMinutes}m
                      </div>
                      <div className="text-sm text-gray-500 w-12 text-right">
                        {pattern.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">No practice data</div>
              )}
            </div>
          </div>

          {/* Pie Chart for Pattern Distribution */}
          {patternFocus.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Time Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={patternFocus.map(p => ({ name: p.patternName, value: p.totalMinutes, percentage: p.percentage, color: p.color }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, payload }) => `${name} (${(payload as { percentage?: number })?.percentage || 0}%)`}
                    labelLine={{ stroke: '#6B7280' }}
                  >
                    {patternFocus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value) => [`${value} minutes`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weekly Trends */}
          {weeklyTrends.length > 1 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Weekly Trends</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="week" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalMinutes"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name="Total Minutes"
                    dot={{ fill: '#8B5CF6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Sessions"
                    dot={{ fill: '#10B981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="activeDays"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    name="Active Days"
                    dot={{ fill: '#F59E0B' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Sessions */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Recent Sessions</h3>
            {recentSessions.length > 0 ? (
              <div className="space-y-2">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400 text-sm w-24">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="font-mono font-semibold text-purple-400">
                        {session.pattern_name}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white ml-1">{session.practice_minutes} min</span>
                      </div>
                      <div>
                        <span className="text-gray-400">BPM:</span>
                        <span className="text-blue-400 ml-1">{session.starting_bpm}</span>
                        {session.ending_bpm !== session.starting_bpm && (
                          <>
                            <span className="text-gray-500 mx-1">→</span>
                            <span className="text-green-400">{session.ending_bpm}</span>
                          </>
                        )}
                      </div>
                      {session.total_reps > 0 && (
                        <div>
                          <span className="text-gray-400">Reps:</span>
                          <span className="text-yellow-400 ml-1">{session.total_reps}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">No sessions recorded yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function calculateStreaks(workouts: Workout[]): { currentStreak: number; longestStreak: number } {
  if (workouts.length === 0) return { currentStreak: 0, longestStreak: 0 }

  // Get unique dates with practice
  const practiceDates = new Set(
    workouts.map(w => new Date(w.date).toISOString().split('T')[0])
  )
  const sortedDates = Array.from(practiceDates).sort()

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  // Check if today or yesterday has practice for current streak
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Calculate longest streak
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1])
    const currDate = new Date(sortedDates[i])
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000))

    if (diffDays === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  // Calculate current streak
  if (practiceDates.has(today) || practiceDates.has(yesterday)) {
    const startDate = practiceDates.has(today) ? today : yesterday
    currentStreak = 1
    let checkDate = new Date(startDate)

    while (true) {
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000)
      const checkDateStr = checkDate.toISOString().split('T')[0]
      if (practiceDates.has(checkDateStr)) {
        currentStreak++
      } else {
        break
      }
    }
  }

  return { currentStreak, longestStreak }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function getHeatmapColor(minutes: number): string {
  if (minutes === 0) return 'bg-gray-700'
  if (minutes < 10) return 'bg-purple-900'
  if (minutes < 20) return 'bg-purple-700'
  if (minutes < 30) return 'bg-purple-500'
  return 'bg-purple-400'
}
