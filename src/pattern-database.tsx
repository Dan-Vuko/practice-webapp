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
  total_reps: number  // deprecated, kept for data compat
  last_practiced: string
  // Workout configuration
  workoutConfigId?: string
}

export type TreeItem = PatternFolder | PatternItem

interface PatternDatabaseProps {
  onSelectPattern: (pattern: PatternItem) => void
  selectedPatternId: string | null
  onShowAnalytics?: (pattern: PatternItem) => void
  onEditWorkout?: (pattern: PatternItem) => void
}

export function PatternDatabase({ onSelectPattern, selectedPatternId, onShowAnalytics, onEditWorkout }: PatternDatabaseProps) {
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

  // Name editing
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [editNameValue, setEditNameValue] = useState('')

  // Comment editing
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentValue, setEditCommentValue] = useState('')

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
    if (!newPatternName.trim()) return

    // Use default sequence for custom patterns
    const defaultSequence = [1, 2, 3, 1]

    const newPattern: PatternItem = {
      id: `pattern-${Date.now()}`,
      name: newPatternName,
      pattern: newPatternName, // Use name as pattern identifier
      sequence: defaultSequence,
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
    setNewPatternComment('')
    setShowAddModal(false)
  }

  const collectDescendantIds = (folderId: string): Set<string> => {
    const ids = new Set<string>()
    const childFolders = getChildFolders(folderId)
    for (const child of childFolders) {
      ids.add(child.id)
      for (const id of collectDescendantIds(child.id)) {
        ids.add(id)
      }
    }
    return ids
  }

  const handleDeleteItem = (item: TreeItem) => {
    if (item.isFolder) {
      const descendantFolderIds = collectDescendantIds(item.id)
      const allFolderIds = new Set([item.id, ...descendantFolderIds])
      const hasChildren = items.some(i =>
        (!i.isFolder && allFolderIds.has(i.folderId)) ||
        (i.isFolder && i.parentId === item.id)
      )
      if (hasChildren) {
        if (!confirm('This folder contains items. Delete anyway?')) return
      }
    }

    if (confirm(`Delete ${item.isFolder ? 'folder' : 'pattern'} "${item.name}"?`)) {
      if (item.isFolder) {
        const descendantFolderIds = collectDescendantIds(item.id)
        const allFolderIds = new Set([item.id, ...descendantFolderIds])
        const filteredItems = items.filter(i => {
          if (allFolderIds.has(i.id)) return false
          if (!i.isFolder && allFolderIds.has(i.folderId)) return false
          return true
        })
        saveDatabase(filteredItems)
      } else {
        saveDatabase(items.filter(i => i.id !== item.id))
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

  const handleNameDoubleClick = (item: TreeItem) => {
    setEditingNameId(item.id)
    setEditNameValue(item.name)
  }

  const handleNameSave = () => {
    if (!editingNameId || !editNameValue.trim()) {
      setEditingNameId(null)
      return
    }
    const newItems = items.map(item => {
      if (item.id === editingNameId) {
        return { ...item, name: editNameValue.trim() }
      }
      return item
    })
    saveDatabase(newItems)
    setEditingNameId(null)
  }

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave()
    } else if (e.key === 'Escape') {
      setEditingNameId(null)
    }
  }

  const handleCommentDoubleClick = (pattern: PatternItem) => {
    setEditingCommentId(pattern.id)
    setEditCommentValue(pattern.comment || '')
  }

  const handleCommentSave = () => {
    if (!editingCommentId) {
      setEditingCommentId(null)
      return
    }
    const newItems = items.map(item => {
      if (item.id === editingCommentId && !item.isFolder) {
        return { ...item, comment: editCommentValue.trim() }
      }
      return item
    })
    saveDatabase(newItems)
    setEditingCommentId(null)
  }

  const handleCommentKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCommentSave()
    } else if (e.key === 'Escape') {
      setEditingCommentId(null)
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

  const getFolderHierarchy = (parentId: string = 'root', depth: number = 0): Array<{folder: PatternFolder, depth: number}> => {
    const children = getChildFolders(parentId)
    const result: Array<{folder: PatternFolder, depth: number}> = []
    for (const child of children) {
      result.push({ folder: child, depth })
      result.push(...getFolderHierarchy(child.id, depth + 1))
    }
    return result
  }

  const isDescendantOf = (folderId: string, ancestorId: string): boolean => {
    const folder = items.find(i => i.isFolder && i.id === folderId) as PatternFolder | undefined
    if (!folder) return false
    if (folder.parentId === ancestorId) return true
    if (folder.parentId === 'root' || !folder.parentId) return false
    return isDescendantOf(folder.parentId, ancestorId)
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
                className="flex items-center gap-2 py-2 px-3 hover:bg-theme-hover/50 cursor-pointer group"
                onClick={() => toggleFolder(folder.id)}
              >
                <span className="text-content-secondary">
                  {isExpanded ? '📂' : '📁'}
                </span>
                {editingNameId === folder.id ? (
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={handleNameKeyPress}
                    className="text-content-primary font-semibold flex-1 bg-theme-elevated border border-border-hover rounded px-1 text-sm"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="text-content-primary font-semibold flex-1 cursor-pointer hover:underline"
                    onDoubleClick={(e) => { e.stopPropagation(); handleNameDoubleClick(folder) }}
                  >
                    {folder.name}
                  </span>
                )}
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFolderId(folder.id)
                      setAddModalType('pattern')
                      setShowAddModal(true)
                    }}
                    className="text-xs px-2 py-1 bg-accent-hover hover:bg-accent-dark rounded text-content-primary"
                  >
                    + Add
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFolderId(folder.id)
                      setAddModalType('folder')
                      setShowAddModal(true)
                    }}
                    className="text-xs px-2 py-1 bg-accent3-hover hover:bg-accent3-dark rounded text-content-primary"
                    title="Add sub-folder"
                  >
                    + Folder
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setContextMenuItem(folder)
                      setShowMoveModal(true)
                    }}
                    className="text-xs px-2 py-1 bg-accent3-hover hover:bg-accent3-dark rounded text-content-primary"
                    title="Move folder"
                  >
                    ↔
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteItem(folder)
                    }}
                    className="text-xs px-2 py-1 bg-status-error-hover hover:bg-status-error rounded text-content-primary"
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
                      className={`flex items-center gap-2 py-1 px-1 cursor-pointer transition-colors group text-[10px] ${
                        selectedPatternId === pattern.id
                          ? 'bg-accent-bg border-l-2 border-accent'
                          : 'hover:bg-theme-elevated/30'
                      }`}
                      onClick={() => onSelectPattern(pattern)}
                    >
                      <span className="text-accent-muted text-[9px]">🎵</span>
                      {editingNameId === pattern.id ? (
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onBlur={handleNameSave}
                          onKeyDown={handleNameKeyPress}
                          className="font-mono font-semibold text-accent3-muted min-w-[80px] flex-1 bg-accent3-dark border border-accent3 rounded px-1 text-[10px]"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className="font-mono font-semibold text-accent3-muted min-w-[80px] flex-1 truncate text-[10px] cursor-pointer hover:underline"
                          onDoubleClick={(e) => { e.stopPropagation(); handleNameDoubleClick(pattern) }}
                          title={pattern.name}
                        >
                          {pattern.name}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 text-content-secondary shrink-0">
                        {editingBpmId === pattern.id && editingBpmType === 'current' ? (
                          <input
                            type="number"
                            value={editBpmValue}
                            onChange={(e) => setEditBpmValue(parseInt(e.target.value) || 0)}
                            onBlur={handleBpmSave}
                            onKeyDown={handleBpmKeyPress}
                            className="w-10 bg-accent3-dark text-accent3-muted font-semibold border border-accent3 rounded px-0.5 text-[10px]"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="text-accent3-muted font-semibold cursor-pointer hover:underline"
                            onDoubleClick={() => handleBpmDoubleClick(pattern, 'current')}
                            title="Current BPM"
                          >
                            {pattern.current_bpm}
                          </span>
                        )}
                        <span className="text-content-tertiary">/</span>
                        {editingBpmId === pattern.id && editingBpmType === 'target' ? (
                          <input
                            type="number"
                            value={editBpmValue}
                            onChange={(e) => setEditBpmValue(parseInt(e.target.value) || 0)}
                            onBlur={handleBpmSave}
                            onKeyDown={handleBpmKeyPress}
                            className="w-10 bg-accent2-bg text-accent2-muted font-semibold border border-accent2 rounded px-0.5 text-[10px]"
                            autoFocus
                          />
                        ) : (
                          <span
                            className="text-accent2-muted font-semibold cursor-pointer hover:underline"
                            onDoubleClick={() => handleBpmDoubleClick(pattern, 'target')}
                            title="Target BPM"
                          >
                            {pattern.target_bpm}
                          </span>
                        )}
                        <span className="text-content-tertiary ml-1" title="Sessions">{sessionCounts[pattern.id] || 0}s</span>
                        <span className="text-content-tertiary" title="Total practice time">{pattern.total_practice_minutes}m</span>
                      </div>
                      {editingCommentId === pattern.id ? (
                        <textarea
                          value={editCommentValue}
                          onChange={(e) => setEditCommentValue(e.target.value)}
                          onBlur={handleCommentSave}
                          onKeyDown={handleCommentKeyPress}
                          className="text-[9px] text-content-muted bg-theme-elevated border border-border-hover rounded px-1 py-0.5 w-40 resize-none"
                          rows={2}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Add a note..."
                        />
                      ) : pattern.comment ? (
                        <div className="relative group/comment">
                          <span
                            className="text-content-tertiary text-[8px] px-1 bg-theme-elevated rounded cursor-pointer hover:bg-theme-hover"
                            onDoubleClick={(e) => { e.stopPropagation(); handleCommentDoubleClick(pattern) }}
                            title="Double-click to edit"
                          >💬</span>
                          <div className="absolute bottom-full left-0 mb-1 hidden group-hover/comment:block bg-theme-base border border-border-hover rounded px-2 py-1 text-[9px] text-content-muted w-40 z-10">
                            {pattern.comment}
                          </div>
                        </div>
                      ) : (
                        <span
                          className="text-content-tertiary text-[8px] px-1 opacity-0 group-hover:opacity-40 hover:!opacity-100 cursor-pointer rounded hover:bg-theme-elevated"
                          onDoubleClick={(e) => { e.stopPropagation(); handleCommentDoubleClick(pattern) }}
                          title="Double-click to add note"
                        >💬</span>
                      )}
                      {onEditWorkout && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditWorkout(pattern) }}
                          className="text-[8px] px-1 py-0.5 bg-accent2-bg hover:bg-accent2-bg-strong text-accent2-muted rounded"
                          title="Edit Workout"
                        >⚙️</button>
                      )}
                      {onShowAnalytics && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onShowAnalytics(pattern) }}
                          className="text-[8px] px-1 py-0.5 bg-accent3-bg hover:bg-accent3-bg-strong text-accent3-muted rounded"
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
                          className="text-[8px] px-1 py-0.5 bg-accent3-hover hover:bg-accent3-dark rounded text-content-primary"
                          title="Move"
                        >
                          ↔
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteItem(pattern)
                          }}
                          className="text-[8px] px-1 py-0.5 bg-status-error-hover hover:bg-status-error rounded text-content-primary"
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
    <div className="bg-theme-surface rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-bold text-content-primary">Patterns</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedFolderId('root')
              setAddModalType('folder')
              setShowAddModal(true)
            }}
            className="px-3 py-1 bg-accent3-hover hover:bg-accent3-dark text-content-primary rounded text-sm font-semibold"
          >
            + Folder
          </button>
          <button
            onClick={() => {
              // Default to first folder
              const folders = getFolders()
              setSelectedFolderId(folders.length > 0 ? folders[0].id : 'root')
              setAddModalType('pattern')
              setShowAddModal(true)
            }}
            className="px-3 py-1 bg-accent-hover hover:bg-accent-dark text-content-primary rounded text-sm font-semibold"
          >
            + Pattern
          </button>
        </div>
      </div>

      {/* Tree */}
      <div>
        {renderTree('root', 0)}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-theme-surface rounded-lg p-6 border border-border max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-content-primary mb-4">
              {addModalType === 'folder' ? 'Add Folder' : 'Add Pattern'}
            </h3>

            {addModalType === 'folder' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-content-secondary text-sm mb-2">Folder Name</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-theme-elevated text-content-primary px-4 py-2 rounded-lg"
                    placeholder="e.g., Starting with 1"
                  />
                </div>
                <div>
                  <label className="block text-content-secondary text-sm mb-2">Parent Folder</label>
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="w-full bg-theme-elevated text-content-primary px-4 py-2 rounded-lg"
                  >
                    <option value="root">Root</option>
                    {getFolderHierarchy().map(({ folder, depth }) => (
                      <option key={folder.id} value={folder.id}>
                        {'—'.repeat(depth + 1)} {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-content-secondary text-sm mb-2">Save to Folder</label>
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="w-full bg-theme-elevated text-content-primary px-4 py-2 rounded-lg"
                  >
                    {getFolderHierarchy().map(({ folder, depth }) => (
                      <option key={folder.id} value={folder.id}>
                        {'—'.repeat(depth)} 📁 {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-content-secondary text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={newPatternName}
                    onChange={(e) => setNewPatternName(e.target.value)}
                    className="w-full bg-theme-elevated text-content-primary px-4 py-2 rounded-lg"
                    placeholder="e.g., Chord Transitions, Scale Run, etc."
                  />
                </div>
                <div>
                  <label className="block text-content-secondary text-sm mb-2">Description (optional)</label>
                  <textarea
                    value={newPatternComment}
                    onChange={(e) => setNewPatternComment(e.target.value)}
                    className="w-full bg-theme-elevated text-content-primary px-4 py-2 rounded-lg"
                    placeholder="What this exercise focuses on..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-content-secondary text-sm mb-2">Starting BPM</label>
                    <input
                      type="number"
                      value={newStartingBpm}
                      onChange={(e) => setNewStartingBpm(parseInt(e.target.value) || 60)}
                      className="w-full bg-theme-elevated text-content-primary px-4 py-2 rounded-lg"
                      min="40"
                      max="200"
                    />
                  </div>
                  <div>
                    <label className="block text-content-secondary text-sm mb-2">Target BPM</label>
                    <input
                      type="number"
                      value={newTargetBpm}
                      onChange={(e) => setNewTargetBpm(parseInt(e.target.value) || 150)}
                      className="w-full bg-theme-elevated text-content-primary px-4 py-2 rounded-lg"
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
                className="flex-1 bg-accent hover:bg-accent-hover text-content-primary font-bold py-3 rounded-lg transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-theme-elevated hover:bg-theme-hover text-content-primary font-bold py-3 rounded-lg transition-colors"
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
          <div className="bg-theme-surface rounded-lg p-6 border border-border max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-content-primary mb-4">
              Move "{contextMenuItem.name}"
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {/* Root option */}
              {contextMenuItem.isFolder && (
                <button
                  onClick={() => handleMoveItem(contextMenuItem, 'root')}
                  className="w-full text-left px-4 py-3 bg-theme-elevated hover:bg-theme-hover rounded text-content-primary"
                >
                  📁 Root
                </button>
              )}

              {/* Folder options with hierarchy */}
              {getFolderHierarchy().map(({ folder, depth }) => {
                // Don't allow moving a folder to itself or its descendants
                if (contextMenuItem.isFolder && (
                  contextMenuItem.id === folder.id ||
                  isDescendantOf(folder.id, contextMenuItem.id)
                )) return null

                return (
                  <button
                    key={folder.id}
                    onClick={() => handleMoveItem(contextMenuItem, folder.id)}
                    className="w-full text-left px-4 py-3 bg-theme-elevated hover:bg-theme-hover rounded text-content-primary"
                    style={{ paddingLeft: `${16 + depth * 16}px` }}
                  >
                    {'—'.repeat(depth)} 📁 {folder.name}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setShowMoveModal(false)}
              className="w-full mt-4 bg-theme-elevated hover:bg-theme-hover text-content-primary font-bold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
