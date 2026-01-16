import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface FretPattern {
  id: string
  pattern_name: string
  frets: string // JSON string of fret positions
  description: string
  category: string
  created_at: string
}

// Get current user ID
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) return user.id
  return '00000000-0000-0000-0000-000000000001' // Admin fallback
}

export function FretMaster() {
  const [patterns, setPatterns] = useState<FretPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form state
  const [newName, setNewName] = useState('')
  const [newFrets, setNewFrets] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newCategory, setNewCategory] = useState('scale')

  useEffect(() => {
    loadPatterns()
  }, [])

  const loadPatterns = async () => {
    try {
      const userId = await getCurrentUserId()
      const { data, error } = await supabase
        .from('fret_patterns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPatterns(data || [])
    } catch (err) {
      console.error('Error loading patterns:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPattern = async () => {
    try {
      const userId = await getCurrentUserId()
      const { error } = await supabase
        .from('fret_patterns')
        .insert({
          user_id: userId,
          pattern_name: newName,
          frets: newFrets,
          description: newDescription,
          category: newCategory,
        })

      if (error) throw error

      setShowAddModal(false)
      setNewName('')
      setNewFrets('')
      setNewDescription('')
      setNewCategory('scale')
      loadPatterns()
    } catch (err) {
      console.error('Error adding pattern:', err)
    }
  }

  const handleDeletePattern = async (id: string) => {
    if (!confirm('Delete this pattern?')) return

    try {
      const { error } = await supabase
        .from('fret_patterns')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadPatterns()
    } catch (err) {
      console.error('Error deleting pattern:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading patterns...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
            FretMaster
          </h1>
          <p className="text-gray-400 text-lg">
            Your personal fretboard pattern library
          </p>
        </div>

        {/* Add Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            + Add Pattern
          </button>
        </div>

        {/* Patterns Grid */}
        {patterns.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-xl mb-4">No patterns yet</p>
            <p>Click "Add Pattern" to create your first fretboard pattern</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-green-500/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white">{pattern.pattern_name}</h3>
                  <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-300">
                    {pattern.category}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-3">{pattern.description || 'No description'}</p>
                <div className="font-mono text-green-400 text-sm bg-slate-900/50 p-2 rounded mb-3 overflow-x-auto">
                  {pattern.frets || '-'}
                </div>
                <button
                  onClick={() => handleDeletePattern(pattern.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-white mb-4">Add Fretboard Pattern</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Pattern Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-900 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-green-500 outline-none"
                    placeholder="e.g., A Minor Pentatonic"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-900 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-green-500 outline-none"
                  >
                    <option value="scale">Scale</option>
                    <option value="chord">Chord</option>
                    <option value="arpeggio">Arpeggio</option>
                    <option value="lick">Lick</option>
                    <option value="exercise">Exercise</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-1">Fret Positions</label>
                  <input
                    type="text"
                    value={newFrets}
                    onChange={(e) => setNewFrets(e.target.value)}
                    className="w-full bg-slate-900 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-green-500 outline-none font-mono"
                    placeholder="e.g., 5-8, 5-7, 5-7, 5-7, 5-8, 5-8"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-1">Description (optional)</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-slate-900 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-green-500 outline-none resize-none"
                    rows={2}
                    placeholder="Notes about this pattern..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPattern}
                    disabled={!newName}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Add Pattern
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
