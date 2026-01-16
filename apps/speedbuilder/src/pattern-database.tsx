import { useState, useEffect } from 'react'
import { PATTERNS } from './patterns'

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
      const response = await fetch('/api/workouts')
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

    if (storedData) {
      setItems(JSON.parse(storedData))
    } else {
      // Initialize with default structure
      const defaultItems: TreeItem[] = [
        // Parent folder: Fingerpicking Patterns
        { id: 'folder-fingerpicking', name: 'Fingerpicking Patterns', parentId: 'root', isFolder: true },

        // Child folders under Fingerpicking Patterns
        { id: 'folder-1', name: 'Starting with 1', parentId: 'folder-fingerpicking', isFolder: true },
        { id: 'folder-2', name: 'Starting with 2', parentId: 'folder-fingerpicking', isFolder: true },
        { id: 'folder-3', name: 'Starting with 3', parentId: 'folder-fingerpicking', isFolder: true },

        // Starting with 1
        ...PATTERNS.slice(0, 6).map((p, i) => ({
          id: `pattern-${p.id}`,
          name: p.pattern,
          pattern: p.pattern,
          sequence: p.sequence,
          folderId: 'folder-1',
          comment: '',
          isFolder: false as const,
          current_bpm: 60,
          target_bpm: 150,
          total_sessions: 0,
          total_practice_minutes: 0,
          total_reps: 0,
          last_practiced: new Date().toISOString()
        })),

        // Starting with 2
        ...PATTERNS.slice(6, 12).map((p, i) => ({
          id: `pattern-${p.id}`,
          name: p.pattern,
          pattern: p.pattern,
          sequence: p.sequence,
          folderId: 'folder-2',
          comment: '',
          isFolder: false as const,
          current_bpm: 60,
          target_bpm: 150,
          total_sessions: 0,
          total_practice_minutes: 0,
          total_reps: 0,
          last_practiced: new Date().toISOString()
        })),

        // Starting with 3
        ...PATTERNS.slice(12, 18).map((p, i) => ({
          id: `pattern-${p.id}`,
          name: p.pattern,
          pattern: p.pattern,
          sequence: p.sequence,
          folderId: 'folder-3',
          comment: '',
          isFolder: false as const,
          current_bpm: 60,
          target_bpm: 150,
          total_sessions: 0,
          total_practice_minutes: 0,
          total_reps: 0,
          last_practiced: new Date().toISOString()
        }))
      ]

      setItems(defaultItems)
      localStorage.setItem('patternDatabase', JSON.stringify(defaultItems))

      // Expand all folders by default
      setExpandedFolders(new Set(['root', 'folder-fingerpicking', 'folder-1', 'folder-2', 'folder-3']))
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
                      style={{ paddingLeft: `${(depth + 1) * 20}px` }}
                      className={`flex items-center gap-3 py-2 px-3 cursor-pointer transition-colors group ${
                        selectedPatternId === pattern.id
                          ? 'bg-purple-900/40 border-l-4 border-purple-500'
                          : 'hover:bg-gray-700/30'
                      }`}
                      onClick={() => onSelectPattern(pattern)}
                    >
                      <span className="text-purple-400">🎵</span>
                      <span className="font-mono font-bold text-blue-400 w-16">{pattern.name}</span>
                      <div className="flex-1 flex items-center gap-3 text-xs text-gray-400">
                        <span className="w-20">
                          Current:{' '}
                          {editingBpmId === pattern.id && editingBpmType === 'current' ? (
                            <input
                              type="number"
                              value={editBpmValue}
                              onChange={(e) => setEditBpmValue(parseInt(e.target.value) || 0)}
                              onBlur={handleBpmSave}
                              onKeyDown={handleBpmKeyPress}
                              className="w-12 bg-blue-900 text-blue-400 font-semibold border border-blue-500 rounded px-1"
                              autoFocus
                            />
                          ) : (
                            <span
                              className="text-blue-400 font-semibold cursor-pointer hover:underline"
                              onDoubleClick={() => handleBpmDoubleClick(pattern, 'current')}
                            >
                              {pattern.current_bpm}
                            </span>
                          )}
                        </span>
                        <span className="w-20">
                          Target:{' '}
                          {editingBpmId === pattern.id && editingBpmType === 'target' ? (
                            <input
                              type="number"
                              value={editBpmValue}
                              onChange={(e) => setEditBpmValue(parseInt(e.target.value) || 0)}
                              onBlur={handleBpmSave}
                              onKeyDown={handleBpmKeyPress}
                              className="w-12 bg-green-900 text-green-400 font-semibold border border-green-500 rounded px-1"
                              autoFocus
                            />
                          ) : (
                            <span
                              className="text-green-400 font-semibold cursor-pointer hover:underline"
                              onDoubleClick={() => handleBpmDoubleClick(pattern, 'target')}
                            >
                              {pattern.target_bpm}
                            </span>
                          )}
                        </span>
                        <span className="w-20">{sessionCounts[pattern.id] || 0} sessions</span>
                        <span className="w-14">{pattern.total_practice_minutes}m</span>
                        <span className="w-20" title="Total repetitions">{pattern.total_reps} reps</span>
                        <span className="w-16" title="Average reps per session">{pattern.total_sessions > 0 ? Math.round(pattern.total_reps / pattern.total_sessions) : 0}/s</span>
                        <span className="w-24 text-xs">{new Date(pattern.last_practiced).toLocaleDateString()}</span>
                      </div>
                      {pattern.comment && (
                        <div className="relative group/comment">
                          <span className="text-gray-500 text-xs px-2 py-1 bg-gray-700 rounded cursor-help">
                            💬
                          </span>
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover/comment:block bg-gray-900 border border-gray-600 rounded px-3 py-2 text-xs text-gray-300 w-48 z-10">
                            {pattern.comment}
                          </div>
                        </div>
                      )}
                      {onShowAnalytics && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onShowAnalytics(pattern)
                          }}
                          className="text-xs px-3 py-1 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700 text-blue-400 rounded transition-colors font-semibold"
                        >
                          📊
                        </button>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setContextMenuItem(pattern)
                            setShowMoveModal(true)
                          }}
                          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                          title="Move pattern"
                        >
                          ↔️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteItem(pattern)
                          }}
                          className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                          title="Delete pattern"
                        >
                          🗑️
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
