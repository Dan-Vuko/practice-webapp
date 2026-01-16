import { useState, useEffect } from 'react'
import { db, UserPatternProgressEntity } from './database'

export function ProgressTracker() {
  const [progressData, setProgressData] = useState<UserPatternProgressEntity[]>([])
  const [selectedRow, setSelectedRow] = useState<string | null>(null)

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    const data = await db.getAllUserProgress()
    setProgressData(data.sort((a, b) => {
      const aTime = a.last_practiced ? new Date(a.last_practiced).getTime() : 0
      const bTime = b.last_practiced ? new Date(b.last_practiced).getTime() : 0
      return bTime - aTime
    }))
  }

  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return 'Never'
    return new Date(isoDate).toLocaleDateString()
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(100, Math.round((current / target) * 100))
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Practice Progress Database</h2>
        <button
          onClick={loadProgressData}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
        >
          Refresh
        </button>
      </div>

      {progressData.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="mb-2">No practice data yet</p>
          <p className="text-sm">Start practicing a pattern to see your progress here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-3 px-3 text-gray-400 font-semibold text-sm">Pattern</th>
                <th className="pb-3 px-3 text-gray-400 font-semibold text-sm">Strings</th>
                <th className="pb-3 px-3 text-gray-400 font-semibold text-sm">Current BPM</th>
                <th className="pb-3 px-3 text-gray-400 font-semibold text-sm">Target BPM</th>
                <th className="pb-3 px-3 text-gray-400 font-semibold text-sm">Max BPM</th>
                <th className="pb-3 px-3 text-gray-400 font-semibold text-sm">Progress</th>
                <th className="pb-3 px-3 text-gray-400 font-semibold text-sm">Sessions</th>
                <th className="pb-3 px-3 text-gray-400 font-semibold text-sm">Total Time</th>
                <th className="pb-3 px-3 text-gray-400 font-semibold text-sm">Cycle Week</th>
                <th className="pb-3 px-3 text-gray-400 font-semibold text-sm">Last Practiced</th>
              </tr>
            </thead>
            <tbody>
              {progressData.map((row) => {
                const progressPct = getProgressPercentage(row.current_bpm, row.target_bpm)
                const isSelected = selectedRow === row.id

                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedRow(isSelected ? null : row.id)}
                    className={`border-b border-gray-700/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-purple-900/20' : 'hover:bg-gray-700/30'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-purple-400">{row.pattern_name}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-300 font-mono text-sm">{row.string_set}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-blue-400">{row.current_bpm}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-gray-400">{row.target_bpm}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-green-400">{row.max_bpm_achieved}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-10">{progressPct}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-gray-300">{row.total_sessions}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{row.total_practice_minutes} min</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        row.current_cycle_week === 3 || row.current_cycle_week === 4
                          ? 'bg-green-900 text-green-300'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        Week {row.current_cycle_week}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-400 text-sm">{formatDate(row.last_practiced)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Database Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">Total Patterns</div>
          <div className="text-2xl font-bold text-white">{progressData.length}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">Total Sessions</div>
          <div className="text-2xl font-bold text-white">
            {progressData.reduce((sum, row) => sum + row.total_sessions, 0)}
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">Total Practice Time</div>
          <div className="text-2xl font-bold text-white">
            {progressData.reduce((sum, row) => sum + row.total_practice_minutes, 0)} min
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">Avg BPM</div>
          <div className="text-2xl font-bold text-white">
            {progressData.length > 0
              ? Math.round(progressData.reduce((sum, row) => sum + row.current_bpm, 0) / progressData.length)
              : 0}
          </div>
        </div>
      </div>
    </div>
  )
}
