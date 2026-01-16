import { useState, useEffect } from 'react'
import { PATTERNS } from './patterns'

// Helper to create default pattern item
const createPattern = (
  id: string,
  name: string,
  pattern: string,
  sequence: number[],
  folderId: string,
  comment: string = ''
): PatternItem => ({
  id,
  name,
  pattern,
  sequence,
  folderId,
  comment,
  isFolder: false as const,
  current_bpm: 60,
  target_bpm: 150,
  total_sessions: 0,
  total_practice_minutes: 0,
  total_reps: 0,
  last_practiced: new Date().toISOString()
})

// Get all default items for initialization and migration
const getDefaultItems = (): TreeItem[] => [
  // ========== FINGERPICKING PATTERNS ==========
  { id: 'folder-fingerpicking', name: 'Fingerpicking Patterns', parentId: 'root', isFolder: true },
  { id: 'folder-1', name: 'Starting with 1', parentId: 'folder-fingerpicking', isFolder: true },
  { id: 'folder-2', name: 'Starting with 2', parentId: 'folder-fingerpicking', isFolder: true },
  { id: 'folder-3', name: 'Starting with 3', parentId: 'folder-fingerpicking', isFolder: true },

  ...PATTERNS.slice(0, 6).map((p) => createPattern(`pattern-${p.id}`, p.pattern, p.pattern, p.sequence, 'folder-1')),
  ...PATTERNS.slice(6, 12).map((p) => createPattern(`pattern-${p.id}`, p.pattern, p.pattern, p.sequence, 'folder-2')),
  ...PATTERNS.slice(12, 18).map((p) => createPattern(`pattern-${p.id}`, p.pattern, p.pattern, p.sequence, 'folder-3')),

  // ========== STRING CROSSOVER TECHNIQUE ==========
  { id: 'folder-crossover', name: 'String Crossover', parentId: 'root', isFolder: true },
  createPattern('pattern-cross3', 'Cross3', '1213', [1, 2, 1, 3], 'folder-crossover',
    'Thumb-Index-Thumb across 3 strings. Pick any arpeggio shape, play T-I-T pattern crossing all 3 strings.'),
  createPattern('pattern-cross5', 'Cross5', '1232', [1, 2, 3, 2], 'folder-crossover',
    '5-string arpeggio crossover. Play 2 strings, then cross to next pair. Continuous rolling motion across 5 strings.'),

  // ========== 1NPS ARPEGGIOS ==========
  { id: 'folder-1nps', name: '1NPS Arpeggios', parentId: 'root', isFolder: true },
  { id: 'folder-1nps-single', name: 'Single Position', parentId: 'folder-1nps', isFolder: true },
  { id: 'folder-1nps-double', name: 'Two Positions', parentId: 'folder-1nps', isFolder: true },
  { id: 'folder-1nps-full', name: 'Full Neck', parentId: 'folder-1nps', isFolder: true },

  // Single positions
  createPattern('pattern-1nps-p1', 'Pos1', '1231', [1, 2, 3, 1], 'folder-1nps-single',
    'Position 1: Aug→Maj→Min→Dim cycle. Compress: Aug→Maj(lower 5th)→Min(lower 3rd)→Dim(lower 5th to b5). Reverse back.'),
  createPattern('pattern-1nps-p2', 'Pos2', '1231', [1, 2, 3, 1], 'folder-1nps-single',
    'Position 2: Aug→Maj→Min→Dim cycle. Same compression sequence in 2nd position shape.'),
  createPattern('pattern-1nps-p3', 'Pos3', '1231', [1, 2, 3, 1], 'folder-1nps-single',
    'Position 3: Aug→Maj→Min→Dim cycle. Same compression sequence in 3rd position shape.'),

  // Two positions
  createPattern('pattern-1nps-p12', 'Pos1+2', '1231', [1, 2, 3, 1], 'folder-1nps-double',
    'Positions 1→2: Connect position 1 and 2 shapes. Aug/Maj/Min/Dim through both positions with smooth transitions.'),
  createPattern('pattern-1nps-p23', 'Pos2+3', '1231', [1, 2, 3, 1], 'folder-1nps-double',
    'Positions 2→3: Connect position 2 and 3 shapes. Aug/Maj/Min/Dim through both positions with smooth transitions.'),

  // Full neck
  createPattern('pattern-1nps-full', 'Pos1+2+3', '1231', [1, 2, 3, 1], 'folder-1nps-full',
    'Full neck: All 3 positions connected. Aug/Maj/Min/Dim through entire fretboard. Master position shifts.'),

  // ========== 251 CADENCE ==========
  { id: 'folder-251', name: '251 Cadence', parentId: 'root', isFolder: true },
  createPattern('pattern-251-p1', '251@P1', '1231', [1, 2, 3, 1], 'folder-251',
    'ii-V-I triads in Position 1. All chords played using position 1 shapes. Resolve I chord to position 1.'),
  createPattern('pattern-251-p2', '251@P2', '1231', [1, 2, 3, 1], 'folder-251',
    'ii-V-I triads in Position 2. All chords played using position 2 shapes. Resolve I chord to position 2.'),
  createPattern('pattern-251-p3', '251@P3', '1231', [1, 2, 3, 1], 'folder-251',
    'ii-V-I triads in Position 3. All chords played using position 3 shapes. Resolve I chord to position 3.'),
]

export interface PatternFolder {
  id: string
  name: string
  parentId: string | null
  isFolder: true
}

export interface PatternItem {
  id: string
  name: string
  pattern: string
  sequence: number[]
  folderId: string
  comment: string
  isFolder: false
  // Progress tracking
  current_bpm: number
  target_bpm: number
  total_sessions: number
  total_practice_minutes: number
  total_reps: number
  last_practiced: string
}

export type TreeItem = PatternFolder | PatternItem

interface PatternDatabaseProps {
  onSelectPattern: (pattern: PatternItem) => void
  selectedPatternId: string | null
  onShowAnalytics?: (pattern: PatternItem) => void
}

export function PatternDatabase({ onSelectPattern, selectedPatternId, onShowAnalytics }: PatternDatabaseProps) {
  const [items, setItems] = useState<TreeItem[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']))
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalType, setAddModalType] = useState<'folder' | 'pattern'>('pattern')
  const [selectedFolderId, setSelectedFolderId] = useState<string>('root')
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({})

  // New folder form
  const [newFolderName, setNewFolderName] = useState('')

  // New pattern form
  const [newPatternName, setNewPatternName] = useState('')
  const [newPatternSequence, setNewPatternSequence] = useState('')
  const [newPatternComment, setNewPatternComment] = useState('')
  const [newStartingBpm, setNewStartingBpm] = useState(60)
  const [newTargetBpm, setNewTargetBpm] = useState(150)

  // Context menu for move/delete
  const [contextMenuItem, setContextMenuItem] = useState<TreeItem | null>(null)
  const [showMoveModal, setShowMoveModal] = useState(false)

  // BPM editing
  const [editingBpmId, setEditingBpmId] = useState<string | null>(null)
  const [editingBpmType, setEditingBpmType] = useState<'current' | 'target' | null>(null)
  const [editBpmValue, setEditBpmValue] = useState<number>(0)

  useEffect(() => {
    loadDatabase()
    loadSessionCounts()
  }, [])

  const loadSessionCounts = async () => {
    try {
      const response = await fetch('http://localhost:3004/api/workouts')
      const data = await response.json()

      if (data.success) {
        // Count sessions per pattern_id
        const counts: Record<string, number> = {}
        data.workouts.forEach((w: any) => {
          counts[w.pattern_id] = (counts[w.pattern_id] || 0) + 1
        })
        setSessionCounts(counts)
      }
    } catch (error) {
      console.error('Failed to load session counts:', error)
    }
  }

  const loadDatabase = () => {
    const storedData = localStorage.getItem('patternDatabase')
    const CURRENT_VERSION = 2 // Increment when adding new default patterns
    const storedVersion = parseInt(localStorage.getItem('patternDatabaseVersion') || '0')

    if (storedData && storedVersion >= CURRENT_VERSION) {
      setItems(JSON.parse(storedData))
    } else if (storedData && storedVersion < CURRENT_VERSION) {
      // Merge new patterns into existing data
      const existingItems: TreeItem[] = JSON.parse(storedData)
      const defaultItems = getDefaultItems()

      // Find items that don't exist in current data
      const existingIds = new Set(existingItems.map(item => item.id))
      const newItems = defaultItems.filter(item => !existingIds.has(item.id))

      // Merge and save
      const mergedItems = [...existingItems, ...newItems]
      setItems(mergedItems)
      localStorage.setItem('patternDatabase', JSON.stringify(mergedItems))
      localStorage.setItem('patternDatabaseVersion', CURRENT_VERSION.toString())

      // Expand new folders
      setExpandedFolders(prev => {
        const newSet = new Set(prev)
        newItems.filter(item => item.isFolder).forEach(folder => newSet.add(folder.id))
        return newSet
      })
    } else {
      // Initialize with default structure
      const defaultItems = getDefaultItems()
      setItems(defaultItems)
      localStorage.setItem('patternDatabase', JSON.stringify(defaultItems))
      localStorage.setItem('patternDatabaseVersion', '2')

      // Expand all folders by default
      setExpandedFolders(new Set([
        'root',
        'folder-fingerpicking', 'folder-1', 'folder-2', 'folder-3',
        'folder-crossover',
        'folder-1nps', 'folder-1nps-single', 'folder-1nps-double', 'folder-1nps-full',
        'folder-251'
      ]))
    }
  }

  const saveDatabase = (newItems: TreeItem[]) => {
    setItems(newItems)
    localStorage.setItem('patternDatabase', JSON.stringify(newItems))
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return

    const newFolder: PatternFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      parentId: selectedFolderId === 'root' ? 'root' : selectedFolderId,
      isFolder: true
    }

    const newItems = [...items, newFolder]
    saveDatabase(newItems)
    setNewFolderName('')
    setShowAddModal(false)
  }

  const handleAddPattern = () => {
    if (!newPatternName.trim() || !newPatternSequence.trim()) return

    // Parse sequence (e.g., "1213" -> [1, 2, 1, 3])
    const sequence = newPatternSequence.split('').map(n => parseInt(n))
    if (sequence.length !== 4 || sequence.some(n => isNaN(n) || n < 1 || n > 3)) {
      alert('Pattern must be 4 digits using only 1, 2, 3')
      return
    }

    const newPattern: PatternItem = {
      id: `pattern-${Date.now()}`,
      name: newPatternName,
      pattern: newPatternSequence,
      sequence,
      folderId: selectedFolderId,
      comment: newPatternComment,
      isFolder: false,
      current_bpm: newStartingBpm,
      target_bpm: newTargetBpm,
      total_sessions: 0,
      total_practice_minutes: 0,
      total_reps: 0,
      last_practiced: new Date().toISOString()
    }

    const newItems = [...items, newPattern]
    saveDatabase(newItems)
    setNewPatternName('')
    setNewPatternSequence('')
    setNewPatternComment('')
    setShowAddModal(false)
  }

  const handleDeleteItem = (item: TreeItem) => {
    if (item.isFolder) {
      // Check if folder has children
      const hasChildren = items.some(i => !i.isFolder && i.folderId === item.id) ||
                          items.some(i => i.isFolder && i.parentId === item.id)
      if (hasChildren) {
        if (!confirm('This folder contains items. Delete anyway?')) return
      }
    }

    if (confirm(`Delete ${item.isFolder ? 'folder' : 'pattern'} "${item.name}"?`)) {
      const newItems = items.filter(i => i.id !== item.id)
      // Also delete children if folder
      if (item.isFolder) {
        const filteredItems = newItems.filter(i => {
          if (!i.isFolder && i.folderId === item.id) return false
          if (i.isFolder && i.parentId === item.id) return false
          return true
        })
        saveDatabase(filteredItems)
      } else {
        saveDatabase(newItems)
      }
    }
  }

  const handleMoveItem = (item: TreeItem, newFolderId: string) => {
    const newItems = items.map(i => {
      if (i.id === item.id) {
        if (i.isFolder) {
          return { ...i, parentId: newFolderId }
        } else {
          return { ...i, folderId: newFolderId }
        }
      }
      return i
    })
    saveDatabase(newItems)
    setShowMoveModal(false)
    setContextMenuItem(null)
  }

  const handleBpmDoubleClick = (pattern: PatternItem, type: 'current' | 'target') => {
    setEditingBpmId(pattern.id)
    setEditingBpmType(type)
    setEditBpmValue(type === 'current' ? pattern.current_bpm : pattern.target_bpm)
  }

  const handleBpmSave = () => {
    if (!editingBpmId || !editingBpmType) return

    const newItems = items.map(item => {
      if (item.id === editingBpmId && !item.isFolder) {
        if (editingBpmType === 'current') {
          return { ...item, current_bpm: editBpmValue }
        } else {
          return { ...item, target_bpm: editBpmValue }
        }
      }
      return item
    })

    saveDatabase(newItems)
    setEditingBpmId(null)
    setEditingBpmType(null)
  }

  const handleBpmKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBpmSave()
    } else if (e.key === 'Escape') {
      setEditingBpmId(null)
      setEditingBpmType(null)
    }
  }

  const getFolders = (): PatternFolder[] => {
    return items.filter(item => item.isFolder) as PatternFolder[]
  }

  const getPatternsInFolder = (folderId: string): PatternItem[] => {
    return items.filter(item => !item.isFolder && item.folderId === folderId) as PatternItem[]
  }

  const getChildFolders = (parentId: string): PatternFolder[] => {
    return items.filter(item => item.isFolder && item.parentId === parentId) as PatternFolder[]
  }

  const renderTree = (parentId: string = 'root', depth: number = 0) => {
    const folders = getChildFolders(parentId)

    return (
      <>
        {folders.map(folder => {
          const isExpanded = expandedFolders.has(folder.id)
          const patterns = getPatternsInFolder(folder.id)
          const childFolders = getChildFolders(folder.id)

          return (
            <div key={folder.id}>
              {/* Folder */}
              <div
                style={{ paddingLeft: `${depth * 20}px` }}
                className="flex items-center gap-2 py-2 px-3 hover:bg-gray-700/50 cursor-pointer group"
                onClick={() => toggleFolder(folder.id)}
              >
                <span className="text-gray-400">
                  {isExpanded ? '📂' : '📁'}
                </span>
                <span className="text-white font-semibold flex-1">{folder.name}</span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFolderId(folder.id)
                      setAddModalType('pattern')
                      setShowAddModal(true)
                    }}
                    className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white"
                  >
                    + Add
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteItem(folder)
                    }}
                    className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                    title="Delete folder"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Folder contents */}
              {isExpanded && (
                <>
                  {/* Patterns in folder */}
                  {patterns.map(pattern => (
                    <div
                      key={pattern.id}
                      style={{ paddingLeft: `${(depth + 1) * 16}px` }}
                      className={`flex items-center gap-1 py-0.5 px-1 cursor-pointer transition-colors group text-[9px] ${
                        selectedPatternId === pattern.id
                          ? 'bg-purple-900/40 border-l-2 border-purple-500'
                          : 'hover:bg-gray-700/30'
                      }`}
                      onClick={() => onSelectPattern(pattern)}
                    >
                      <span className="text-purple-400 text-[9px]">🎵</span>
                      <span className="font-mono font-semibold text-blue-400 w-16 truncate text-[10px]">{pattern.name}</span>
                      <div className="flex-1 flex items-center gap-1 text-gray-400">
                        {editingBpmId === pattern.id && editingBpmType === 'current' ? (
                          <input
                            type="number"
                            value={editBpmValue}
                            onChange={(e) => setEditBpmValue(parseInt(e.target.value) || 0)}
                            onBlur={handleBpmSave}
                            onKeyDown={handleBpmKeyPress}
                            className="w-8 bg-blue-900 text-blue-400 font-semibold border border-blue-500 rounded px-0.5 text-[9px]"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="text-blue-400 font-semibold cursor-pointer hover:underline w-6"
                            onDoubleClick={() => handleBpmDoubleClick(pattern, 'current')}
                            title="Current BPM"
                          >
                            {pattern.current_bpm}
                          </span>
                        )}
                        <span className="text-gray-600">/</span>
                        {editingBpmId === pattern.id && editingBpmType === 'target' ? (
                          <input
                            type="number"
                            value={editBpmValue}
                            onChange={(e) => setEditBpmValue(parseInt(e.target.value) || 0)}
                            onBlur={handleBpmSave}
                            onKeyDown={handleBpmKeyPress}
                            className="w-8 bg-green-900 text-green-400 font-semibold border border-green-500 rounded px-0.5 text-[9px]"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="text-green-400 font-semibold cursor-pointer hover:underline w-6"
                            onDoubleClick={() => handleBpmDoubleClick(pattern, 'target')}
                            title="Target BPM"
                          >
                            {pattern.target_bpm}
                          </span>
                        )}
                        <span className="text-gray-500" title="Sessions">{sessionCounts[pattern.id] || 0} sessions</span>
                        <span className="text-gray-500" title="Practice time">{pattern.total_practice_minutes} minutes</span>
                        <span className="text-gray-500" title="Total reps">{pattern.total_reps} reps</span>
                      </div>
                      {pattern.comment && (
                        <div className="relative group/comment">
                          <span className="text-gray-500 text-[8px] px-1 bg-gray-700 rounded cursor-help">💬</span>
                          <div className="absolute bottom-full left-0 mb-1 hidden group-hover/comment:block bg-gray-900 border border-gray-600 rounded px-2 py-1 text-[9px] text-gray-300 w-40 z-10">
                            {pattern.comment}
                          </div>
                        </div>
                      )}
                      {onShowAnalytics && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onShowAnalytics(pattern) }}
                          className="text-[8px] px-1 py-0.5 bg-blue-900/50 hover:bg-blue-900 text-blue-400 rounded"
                          title="Analytics"
                        >📊</button>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setContextMenuItem(pattern)
                            setShowMoveModal(true)
                          }}
                          className="text-[8px] px-1 py-0.5 bg-blue-600 hover:bg-blue-700 rounded text-white"
                          title="Move"
                        >
                          ↔
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteItem(pattern)
                          }}
                          className="text-[8px] px-1 py-0.5 bg-red-600 hover:bg-red-700 rounded text-white"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Child folders */}
                  {childFolders.length > 0 && renderTree(folder.id, depth + 1)}
                </>
              )}
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Patterns</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedFolderId('root')
              setAddModalType('folder')
              setShowAddModal(true)
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold"
          >
            + Folder
          </button>
          <button
            onClick={() => {
              setSelectedFolderId('root')
              setAddModalType('pattern')
              setShowAddModal(true)
            }}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold"
          >
            + Pattern
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto">
        {renderTree('root', 0)}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-4">
              {addModalType === 'folder' ? 'Add Folder' : 'Add Pattern'}
            </h3>

            {addModalType === 'folder' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Folder Name</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                    placeholder="e.g., Starting with 1"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Pattern Name</label>
                  <input
                    type="text"
                    value={newPatternName}
                    onChange={(e) => setNewPatternName(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg font-mono"
                    placeholder="e.g., 1213"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Pattern Sequence (4 digits: 1, 2, 3)</label>
                  <input
                    type="text"
                    value={newPatternSequence}
                    onChange={(e) => setNewPatternSequence(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg font-mono text-lg"
                    placeholder="e.g., 1213"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Comment (optional)</label>
                  <textarea
                    value={newPatternComment}
                    onChange={(e) => setNewPatternComment(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                    placeholder="Notes about this pattern..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Starting BPM</label>
                    <input
                      type="number"
                      value={newStartingBpm}
                      onChange={(e) => setNewStartingBpm(parseInt(e.target.value) || 60)}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                      min="40"
                      max="200"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Target BPM</label>
                    <input
                      type="number"
                      value={newTargetBpm}
                      onChange={(e) => setNewTargetBpm(parseInt(e.target.value) || 150)}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg"
                      min="60"
                      max="300"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={addModalType === 'folder' ? handleAddFolder : handleAddPattern}
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
      )}

      {/* Move Modal */}
      {showMoveModal && contextMenuItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowMoveModal(false)}>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-4">
              Move "{contextMenuItem.name}"
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* Root option */}
              <button
                onClick={() => handleMoveItem(contextMenuItem, 'root')}
                className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded text-white"
              >
                📁 Root
              </button>

              {/* Folder options */}
              {getFolders().map(folder => {
                // Don't allow moving to self if it's a folder
                if (contextMenuItem.isFolder && contextMenuItem.id === folder.id) return null

                return (
                  <button
                    key={folder.id}
                    onClick={() => handleMoveItem(contextMenuItem, folder.id)}
                    className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded text-white"
                  >
                    📁 {folder.name}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setShowMoveModal(false)}
              className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
