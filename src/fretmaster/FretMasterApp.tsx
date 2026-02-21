import React, { useState, useMemo, useCallback, useEffect } from 'react';
import FretboardContainer from './components/FretboardContainer';
import Controls from './components/Controls';
import ScaleCatalog from './components/ScaleCatalog';
import { PlusIcon } from './components/icons/PlusIcon';
import { TUNINGS, FRET_COUNT, STRUCTURES, RING_COLOR_PALETTE, SARGAM_NAMES, INTERVAL_NAMES, INTERVAL_COLORS, DEFAULT_THEME, ROMAN_DEGREES, SCALE_NAME_OVERRIDES } from './constants';
import type { Tuning, HighlightedNote, Color, RingColor, SavedPattern, Structure, StringGroup, Instrument, FretboardInstance, CatalogScale, CatalogData, CustomPreset } from './types';
import { getNoteOnFret, getIntervalFromRoot, midiToFrequency } from './utils/music';
import { playNote } from './utils/audio';
import { exportFretboardToPng } from './utils/export';
import { db } from '../database';

// Decomposition coloring: blue for group 1, red for group 2, green for group 3
const DECOMP_BLUE: Color = { bgColor: 'bg-blue-500', textColor: 'text-white' };
const DECOMP_RED: Color = { bgColor: 'bg-red-500', textColor: 'text-white' };
const DECOMP_GREEN: Color = { bgColor: 'bg-green-500', textColor: 'text-white' };
const DECOMP_ROOT_BLUE: Color = { bgColor: 'bg-blue-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' };
const DECOMP_ROOT_RED: Color = { bgColor: 'bg-red-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' };
const DECOMP_ROOT_GREEN: Color = { bgColor: 'bg-green-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' };

// Common chord shapes for decomposition detection
const COMMON_TRIAD_PCS = [
  [0,4,7], [0,3,7], [0,3,6], [0,4,8], [0,5,7], [0,2,7], // Maj,Min,Dim,Aug,Sus4,Sus2
];
const COMMON_TETRAD_PCS = [
  [0,4,7,11], [0,4,7,10], [0,3,7,10], [0,3,7,11], [0,4,7,9], [0,3,7,9],
  [0,3,6,10], [0,3,6,9], [0,4,6,10], [0,4,8,10], [0,4,8,11], [0,5,7,10],
];

// Build chord lookup: sorted pcs key -> true
const TRIAD_KEYS = new Set<string>();
for (const pcs of COMMON_TRIAD_PCS) {
  for (let r = 0; r < 12; r++) {
    TRIAD_KEYS.add(pcs.map(pc => (pc + r) % 12).sort((a, b) => a - b).join(','));
  }
}
const TETRAD_KEYS = new Set<string>();
for (const pcs of COMMON_TETRAD_PCS) {
  for (let r = 0; r < 12; r++) {
    TETRAD_KEYS.add(pcs.map(pc => (pc + r) % 12).sort((a, b) => a - b).join(','));
  }
}

/** Find a bi-triadic split: any 3 notes that form a triad, remainder also a triad */
function findBiTriadicSplit(pcs: number[]): [Set<number>, Set<number>] | null {
  if (pcs.length !== 6) return null;
  const pcsSet = new Set(pcs);
  for (const shape of COMMON_TRIAD_PCS) {
    for (let r = 0; r < 12; r++) {
      const tr = shape.map(pc => (pc + r) % 12);
      if (!tr.every(pc => pcsSet.has(pc))) continue;
      const trSet = new Set(tr);
      const rem = pcs.filter(pc => !trSet.has(pc)).sort((a, b) => a - b);
      if (TRIAD_KEYS.has(rem.join(','))) return [trSet, new Set(rem)];
    }
  }
  return null;
}

/** Find a bi-tetradic split: any 4 notes that form a tetrad, remainder also a tetrad */
function findBiTetradicSplit(pcs: number[]): [Set<number>, Set<number>] | null {
  if (pcs.length !== 8) return null;
  const pcsSet = new Set(pcs);
  for (const shape of COMMON_TETRAD_PCS) {
    for (let r = 0; r < 12; r++) {
      const tr = shape.map(pc => (pc + r) % 12);
      if (!tr.every(pc => pcsSet.has(pc))) continue;
      const trSet = new Set(tr);
      const rem = pcs.filter(pc => !trSet.has(pc)).sort((a, b) => a - b);
      if (TETRAD_KEYS.has(rem.join(','))) return [trSet, new Set(rem)];
    }
  }
  return null;
}

/** Find a tri-triadic split: 9 notes = 3 triads */
function findTriTriadicSplit(pcs: number[]): [Set<number>, Set<number>, Set<number>] | null {
  if (pcs.length !== 9) return null;
  const pcsSet = new Set(pcs);
  for (const shape of COMMON_TRIAD_PCS) {
    for (let r = 0; r < 12; r++) {
      const tr = shape.map(pc => (pc + r) % 12);
      if (!tr.every(pc => pcsSet.has(pc))) continue;
      const trSet = new Set(tr);
      const rem = pcs.filter(pc => !trSet.has(pc));
      const biSplit = findBiTriadicSplit(rem);
      if (biSplit) return [trSet, biSplit[0], biSplit[1]];
    }
  }
  return null;
}

function buildCatalogStructure(scale: CatalogScale): Structure {
  // Try tri-triadic (9-note) first
  if (scale.card === 9) {
    const split = findTriTriadicSplit(scale.pcs);
    if (split) {
      const [g1, g2] = split;
      return {
        name: scale.name || `Scale #${scale.n}`,
        intervals: scale.pcs.map(pc => ({ interval: pc, name: INTERVAL_NAMES[pc % 12] })),
        colors: scale.pcs.map((pc, i) => {
          if (g1.has(pc)) return i === 0 ? DECOMP_ROOT_BLUE : DECOMP_BLUE;
          if (g2.has(pc)) return i === 0 ? DECOMP_ROOT_RED : DECOMP_RED;
          return i === 0 ? DECOMP_ROOT_GREEN : DECOMP_GREEN;
        }),
      };
    }
  }

  // Try bi-tetradic (8-note)
  if (scale.card === 8) {
    const split = findBiTetradicSplit(scale.pcs);
    if (split) {
      const g1 = split[0];
      return {
        name: scale.name || `Scale #${scale.n}`,
        intervals: scale.pcs.map(pc => ({ interval: pc, name: INTERVAL_NAMES[pc % 12] })),
        colors: scale.pcs.map((pc, i) => {
          if (g1.has(pc)) return i === 0 ? DECOMP_ROOT_BLUE : DECOMP_BLUE;
          return i === 0 ? DECOMP_ROOT_RED : DECOMP_RED;
        }),
      };
    }
  }

  // Try bi-triadic (6-note)
  if (scale.card === 6) {
    const split = findBiTriadicSplit(scale.pcs);
    if (split) {
      const g1 = split[0];
      return {
        name: scale.name || `Scale #${scale.n}`,
        intervals: scale.pcs.map(pc => ({ interval: pc, name: INTERVAL_NAMES[pc % 12] })),
        colors: scale.pcs.map((pc, i) => {
          if (g1.has(pc)) return i === 0 ? DECOMP_ROOT_BLUE : DECOMP_BLUE;
          return i === 0 ? DECOMP_ROOT_RED : DECOMP_RED;
        }),
      };
    }
  }

  // Default: interval-based coloring
  return {
    name: scale.name || `Scale #${scale.n}`,
    intervals: scale.pcs.map(pc => ({ interval: pc, name: INTERVAL_NAMES[pc % 12] })),
    colors: scale.pcs.map(pc => INTERVAL_COLORS[pc % 12]),
  };
}

const structureIntervalsMap = new Map<string, string>();
for (const key in STRUCTURES) {
    const structure = STRUCTURES[key];
    const intervals = structure.intervals.map(i => i.interval % 12);
    if (new Set(intervals).size < 3) continue;
    const sortedIntervals = [...new Set(intervals)].sort((a: number, b: number) => a - b);
    const intervalKey = sortedIntervals.join(',');
    structureIntervalsMap.set(intervalKey, structure.name);
}

const createDefaultFretboard = (id: string): FretboardInstance => ({
  id,
  name: `Fretboard ${id}`,
  rootNote: 'F',
  globalStructure: 'sixth_diminished',
  visibleIntervals: new Set([0, 2, 4, 5, 7, 8, 9, 11]),
  manualNotes: {},
  structureLabelType: 'interval',
  isAdvancedMode: false,
  stringGroups: [],
  activeGroupId: null,
  showDiff: false,
});

const App: React.FC = () => {
  // Multi-fretboard state
  const [fretboards, setFretboards] = useState<FretboardInstance[]>([createDefaultFretboard('1')]);
  const [activeFretboardId, setActiveFretboardId] = useState<string>('1');

  // Shared global state
  const [tuning, setTuning] = useState<Tuning>(TUNINGS.daead);
  const [currentColor, setCurrentColor] = useState<Color | null>(null);
  const [currentRing, setCurrentRing] = useState<RingColor>(RING_COLOR_PALETTE[0]);
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>([]);
  const [customStructures, setCustomStructures] = useState<Record<string, Structure>>({});
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [instrument, setInstrument] = useState<Instrument>('pluck');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [initialCatalogScale, setInitialCatalogScale] = useState<number | null>(null);
  const [catalogFavourites, setCatalogFavourites] = useState<number[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);

  // Load saved data on mount
  useEffect(() => {
    try {
      const storedPatterns = localStorage.getItem('fretmaster_patterns');
      if (storedPatterns) setSavedPatterns(JSON.parse(storedPatterns));
      // Load custom structures, cleaning up old catalog_* entries
      const storedStructures = localStorage.getItem('fretmaster_structures');
      if (storedStructures) {
        const parsed = JSON.parse(storedStructures);
        const cleaned: Record<string, Structure> = {};
        let needsClean = false;
        for (const [key, val] of Object.entries(parsed)) {
          if (key.startsWith('catalog_')) { needsClean = true; }
          else { cleaned[key] = val as Structure; }
        }
        if (needsClean) {
          setCustomStructures(cleaned);
          localStorage.setItem('fretmaster_structures', JSON.stringify(cleaned));
        } else {
          setCustomStructures(parsed);
        }
      }
    } catch (e) { console.error(e); }

    // Load custom presets
    try {
      const storedPresets = localStorage.getItem('fretmaster_custom_presets');
      if (storedPresets) setCustomPresets(JSON.parse(storedPresets));
    } catch (e) { console.error(e); }

    // Load favorites from Supabase
    db.getFavorites().then(setFavorites).catch(console.error);

    // Load catalog data
    fetch('/data/catalog.json')
      .then(r => r.json())
      .then((data: CatalogData) => {
        // Apply Barry Harris name overrides
        for (const [key, name] of Object.entries(SCALE_NAME_OVERRIDES)) {
          if (data.nameMap[key]) data.nameMap[key] = name;
          const scale = data.scales.find(s => s.n === Number(key));
          if (scale) scale.name = name;
        }
        setCatalogData(data);
      })
      .catch(e => console.error('Failed to load catalog:', e));

    // Load catalog favourites from localStorage
    const BH_DEFAULTS = [2997, 2781, 2989, 3501, 3437, 3509, 3445, 1773, 1757, 1883];
    try {
      const stored = localStorage.getItem('fretmaster_catalog_favourites');
      if (stored) {
        setCatalogFavourites(JSON.parse(stored));
      } else {
        setCatalogFavourites(BH_DEFAULTS);
        localStorage.setItem('fretmaster_catalog_favourites', JSON.stringify(BH_DEFAULTS));
      }
    } catch (e) { console.error(e); }

    // Load recently viewed
    try {
      const storedRecent = localStorage.getItem('fretmaster_recently_viewed');
      if (storedRecent) setRecentlyViewed(JSON.parse(storedRecent));
    } catch (e) { console.error(e); }
  }, []);

  const toggleFavorite = useCallback(async (structureKey: string) => {
    try {
      if (favorites.includes(structureKey)) {
        await db.removeFavorite(structureKey);
        setFavorites(prev => prev.filter(k => k !== structureKey));
      } else {
        await db.addFavorite(structureKey);
        setFavorites(prev => [...prev, structureKey]);
      }
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
    }
  }, [favorites]);

  // Build structures for catalog scales (favourites + recently viewed)
  const catalogStructures = useMemo((): Record<string, Structure> => {
    if (!catalogData) return {};
    const result: Record<string, Structure> = {};
    const scaleMap = new Map(catalogData.scales.map(s => [s.n, s]));
    const allNums = new Set([...catalogFavourites, ...recentlyViewed]);
    for (const n of allNums) {
      const scale = scaleMap.get(n);
      if (scale) result[`catalog_${n}`] = buildCatalogStructure(scale);
    }
    return result;
  }, [catalogData, catalogFavourites, recentlyViewed]);

  const allStructures = useMemo((): Record<string, Structure> => ({ ...STRUCTURES, ...customStructures, ...catalogStructures }), [customStructures, catalogStructures]);

  const activeFretboard = useMemo(() => {
    return fretboards.find(fb => fb.id === activeFretboardId) || fretboards[0];
  }, [fretboards, activeFretboardId]);

  // Fretboard management functions
  const addFretboard = useCallback(() => {
    if (fretboards.length >= 4) return;
    const newId = (fretboards.length + 1).toString();
    const newFretboard = createDefaultFretboard(newId);
    setFretboards(prev => [...prev, newFretboard]);
    setActiveFretboardId(newId);
  }, [fretboards.length]);

  const removeFretboard = useCallback((id: string) => {
    if (fretboards.length <= 1) return;
    const filtered = fretboards.filter(fb => fb.id !== id);
    setFretboards(filtered);
    if (activeFretboardId === id) {
      setActiveFretboardId(filtered[0].id);
    }
  }, [fretboards, activeFretboardId]);

  const savePreset = useCallback((name: string) => {
    const preset: CustomPreset = {
      id: `preset_${Date.now()}`,
      name,
      description: fretboards.map(fb => fb.name).join(', '),
      fretboards: fretboards.map(fb => ({
        name: fb.name,
        rootNote: fb.rootNote,
        structureKey: fb.globalStructure,
        pcs: [...fb.visibleIntervals].sort((a, b) => a - b),
      })),
    };
    const updated = [...customPresets, preset];
    setCustomPresets(updated);
    localStorage.setItem('fretmaster_custom_presets', JSON.stringify(updated));
  }, [fretboards, customPresets]);

  const deletePreset = useCallback((id: string) => {
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('fretmaster_custom_presets', JSON.stringify(updated));
  }, [customPresets]);

  const applyPreset = useCallback((preset: { fretboards: { name: string; rootNote: string; structureKey: string; pcs: number[] }[] }) => {
    const newFbs = preset.fretboards.map((fb, i) => ({
      ...createDefaultFretboard(String(i + 1)),
      name: fb.name,
      rootNote: fb.rootNote,
      globalStructure: fb.structureKey,
      visibleIntervals: new Set(fb.pcs),
    }));
    setFretboards(newFbs);
    setActiveFretboardId('1');
  }, []);

  const updateActiveFretboard = useCallback((updates: Partial<FretboardInstance>) => {
    setFretboards(prev => prev.map(fb =>
      fb.id === activeFretboardId ? { ...fb, ...updates } : fb
    ));
  }, [activeFretboardId]);

  const activeGroup = useMemo(() => {
    if (!activeFretboard.isAdvancedMode || !activeFretboard.activeGroupId) return null;
    return activeFretboard.stringGroups.find(g => g.id === activeFretboard.activeGroupId);
  }, [activeFretboard]);

  useEffect(() => {
    if (activeFretboard.isAdvancedMode) {
      const defaultStructure = allStructures[activeFretboard.globalStructure];
      if (!defaultStructure || !tuning?.strings) return;
      const defaultVisibleIntervals = new Set<number>(defaultStructure.intervals.map(i => i.interval % 12));
      const newGroup: StringGroup = {
        id: `group_${Date.now()}`,
        name: 'Group 1',
        strings: Array.from({ length: tuning.strings.length }, (_, i) => i),
        rootNote: activeFretboard.rootNote,
        structureKey: activeFretboard.globalStructure,
        visibleIntervals: defaultVisibleIntervals,
        fretRange: { start: 0, end: FRET_COUNT },
      };
      updateActiveFretboard({ stringGroups: [newGroup], activeGroupId: newGroup.id });
    } else {
      const structure = allStructures[activeFretboard.globalStructure];
      if (structure) {
          const structureInts = structure.intervals.map(i => i.interval % 12);
          updateActiveFretboard({ visibleIntervals: new Set(structureInts) });
      }
      updateActiveFretboard({ stringGroups: [], activeGroupId: null });
    }
  }, [activeFretboard.isAdvancedMode, tuning?.strings?.length, activeFretboard.globalStructure, activeFretboard.rootNote, allStructures, updateActiveFretboard]);

  const detectedStructureName = useMemo(() => {
    const intervalsToScan = activeFretboard.isAdvancedMode ? activeGroup?.visibleIntervals : activeFretboard.visibleIntervals;
    if (!intervalsToScan || intervalsToScan.size < 3) return null;
    const sortedVisible = [...intervalsToScan].sort((a, b) => a - b);
    return structureIntervalsMap.get(sortedVisible.join(',')) || null;
  }, [activeFretboard.visibleIntervals, activeFretboard.isAdvancedMode, activeGroup]);

  const savePattern = (name: string) => {
    const newPattern: SavedPattern = { id: Date.now().toString(), name, manualNotes: activeFretboard.manualNotes, rootNote: activeFretboard.rootNote, tuning };
    const updated = [...savedPatterns, newPattern];
    setSavedPatterns(updated);
    localStorage.setItem('fretmaster_patterns', JSON.stringify(updated));
  };

  const loadPattern = (patternId: string) => {
    const pattern = savedPatterns.find(p => p.id === patternId);
    if (pattern) {
      updateActiveFretboard({ manualNotes: pattern.manualNotes, rootNote: pattern.rootNote });
      if (pattern.tuning?.strings) setTuning(pattern.tuning);
    }
  };

  const deletePattern = (patternId: string) => {
    const updated = savedPatterns.filter(p => p.id !== patternId);
    setSavedPatterns(updated);
    localStorage.setItem('fretmaster_patterns', JSON.stringify(updated));
  };

  const saveCustomStructure = (name: string) => {
    const intervalsToSave = activeFretboard.isAdvancedMode ? activeGroup?.visibleIntervals : activeFretboard.visibleIntervals;
    if (!intervalsToSave || intervalsToSave.size === 0) return;
    const sortedIntervals = Array.from(intervalsToSave).map(i => i as number).sort((a, b) => a - b);
    const newId = `custom_${Date.now()}`;
    const newStructure: Structure = {
      name,
      intervals: sortedIntervals.map(interval => ({ interval: interval as number, name: INTERVAL_NAMES[interval as number] })),
      colors: sortedIntervals.map(i => INTERVAL_COLORS[(i as number) % 12]),
    };
    const updated = { ...customStructures, [newId]: newStructure };
    setCustomStructures(updated);
    localStorage.setItem('fretmaster_structures', JSON.stringify(updated));
    if (activeFretboard.isAdvancedMode && activeFretboard.activeGroupId) updateGroup(activeFretboard.activeGroupId, { structureKey: newId });
    else updateActiveFretboard({ globalStructure: newId });
  };
  
  const deleteCustomStructure = (id: string) => {
    const updated = { ...customStructures };
    delete updated[id];
    setCustomStructures(updated);
    localStorage.setItem('fretmaster_structures', JSON.stringify(updated));
  };

  const updateGroup = (id: string, newProps: Partial<StringGroup>) => {
    const newGroups = activeFretboard.stringGroups.map(g => {
      if (g.id === id) {
        const updated = { ...g, ...newProps };
        if (newProps.structureKey) {
          const struct = allStructures[newProps.structureKey];
          if (struct) updated.visibleIntervals = new Set(struct.intervals.map(i => i.interval % 12));
        }
        return updated;
      }
      return g;
    });
    updateActiveFretboard({ stringGroups: newGroups });
  };

  const strumAll = useCallback(() => {
    if (!isSoundEnabled) return;
    const notesToPlay: number[] = [];

    // In advanced mode, strum the active group's notes
    if (activeFretboard.isAdvancedMode && activeGroup) {
      activeGroup.strings.forEach((sIdx) => {
        const openNote = tuning.strings[sIdx];
        for (let fret = activeGroup.fretRange.start; fret <= activeGroup.fretRange.end; fret++) {
           const info = getNoteOnFret(openNote, fret);
           const interval = getIntervalFromRoot(info.name, activeGroup.rootNote);
           if (activeGroup.visibleIntervals.has(interval) && info.midi) {
             notesToPlay.push(info.midi);
             break; // Take the first matching fret per string
           }
        }
      });
    } else {
      tuning.strings.forEach((openNote) => {
        for (let fret = 0; fret <= FRET_COUNT; fret++) {
          const info = getNoteOnFret(openNote, fret);
          const interval = getIntervalFromRoot(info.name, activeFretboard.rootNote);
          if (activeFretboard.visibleIntervals.has(interval) && info.midi) {
            notesToPlay.push(info.midi);
            break;
          }
        }
      });
    }

    notesToPlay.sort((a,b) => a - b).forEach((midi, i) => {
      setTimeout(() => playNote(midiToFrequency(midi), instrument), i * 100);
    });
  }, [isSoundEnabled, tuning, activeFretboard, activeGroup, instrument]);

  // Feature 8: Compute intersection of intervals for diff-enabled fretboards
  const diffIntersection = useMemo((): Set<number> | null => {
    const diffFbs = fretboards.filter(fb => fb.showDiff);
    if (diffFbs.length < 2) return null;
    let intersection = new Set(diffFbs[0].visibleIntervals);
    for (let i = 1; i < diffFbs.length; i++) {
      const next = new Set<number>();
      for (const v of intersection) {
        if (diffFbs[i].visibleIntervals.has(v)) next.add(v);
      }
      intersection = next;
    }
    return intersection;
  }, [fretboards]);

  const calculateHighlightedNotes = useCallback((fretboard: FretboardInstance): Record<string, HighlightedNote> => {
    const notes: Record<string, HighlightedNote> = {};
    if (fretboard.isAdvancedMode) {
      fretboard.stringGroups.forEach(group => {
        const structure = allStructures[group.structureKey] || allStructures['major_scale'];
        const groupInfo: Record<number, { name: string, color: Color }> = {};
        structure.intervals.forEach((interval, index) => {
          groupInfo[interval.interval % 12] = { name: interval.name, color: structure.colors[index] };
        });
        group.strings.forEach(stringIndex => {
          const openNote = tuning.strings[stringIndex];
          for (let fret = group.fretRange.start; fret <= group.fretRange.end; fret++) {
            const noteInfo = getNoteOnFret(openNote, fret);
            const intervalWithinGroup = getIntervalFromRoot(noteInfo.name, group.rootNote);
            if (group.visibleIntervals.has(intervalWithinGroup)) {
              const info = groupInfo[intervalWithinGroup];
              const color = info ? info.color : { bgColor: 'bg-slate-600', textColor: 'text-white' };
              const globInt = getIntervalFromRoot(noteInfo.name, fretboard.rootNote);
              let label: string;
              switch (fretboard.structureLabelType) {
                case 'noteName': label = noteInfo.displayName; break;
                case 'sargam': label = SARGAM_NAMES[globInt]; break;
                case 'degree': label = ROMAN_DEGREES[globInt]; break;
                default: label = INTERVAL_NAMES[globInt as number]; break;
              }
              notes[`${stringIndex}-${fret}`] = { label, ...color, dotSize: structure.dotSize };
            }
          }
        });
      });
    } else {
      const structure = allStructures[fretboard.globalStructure];
      const structInfo: Record<number, { name: string, color: Color }> = {};
      structure.intervals.forEach((interval, index) => {
          structInfo[interval.interval % 12] = { name: interval.name, color: structure.colors[index] };
      });
      // Build fixed root lookup if structure has fixedRoot
      const fixedMapLookup: Record<number, { name: string, color: Color }> | null =
        structure.fixedRoot && structure.fixedMap
          ? Object.fromEntries(structure.fixedMap.map((entry, i) => [i, entry]))
          : null;
      tuning?.strings?.forEach((openNote, stringIndex) => {
        for (let fret = 0; fret <= FRET_COUNT; fret++) {
          const noteInfo = getNoteOnFret(openNote, fret);
          const numericInterval = getIntervalFromRoot(noteInfo.name, fretboard.rootNote);
          if (fretboard.visibleIntervals.has(numericInterval)) {
            // If fixedRoot, look up symbol/color by interval from fixedRoot
            const fixedInterval = structure.fixedRoot ? getIntervalFromRoot(noteInfo.name, structure.fixedRoot) : numericInterval;
            const info = fixedMapLookup ? fixedMapLookup[fixedInterval] : structInfo[numericInterval];
            const color = info ? info.color : { bgColor: 'bg-slate-600', textColor: 'text-white' };
            let label: string;
            if (fixedMapLookup && info) {
              label = info.name;
            } else {
              switch (fretboard.structureLabelType) {
                case 'noteName': label = noteInfo.displayName; break;
                case 'sargam': label = SARGAM_NAMES[numericInterval]; break;
                case 'degree': label = ROMAN_DEGREES[numericInterval]; break;
                default: label = info ? info.name : INTERVAL_NAMES[numericInterval as number]; break;
              }
            }
            notes[`${stringIndex}-${fret}`] = { label, ...color, dotSize: structure.dotSize };
          }
        }
      });
    }
    (Object.entries(fretboard.manualNotes) as [string, { color: Color, ring: RingColor }][]).forEach(([key, noteData]) => {
      const [sIdx, fret] = key.split('-').map(Number);
      if (sIdx < tuning.strings.length) {
        const noteInfo = getNoteOnFret(tuning.strings[sIdx], fret);
        const globInt = getIntervalFromRoot(noteInfo.name, fretboard.rootNote);
        let label: string;
        switch (fretboard.structureLabelType) {
          case 'noteName': label = noteInfo.displayName; break;
          case 'sargam': label = SARGAM_NAMES[globInt]; break;
          case 'degree': label = ROMAN_DEGREES[globInt]; break;
          default: label = INTERVAL_NAMES[globInt as number]; break;
        }
        notes[key] = { label, ...noteData.color, ringClassName: noteData.ring.ringClassName };
      }
    });
    // Feature 8: Mark shared notes for diff mode
    if (fretboard.showDiff && diffIntersection) {
      for (const [key, note] of Object.entries(notes)) {
        const [sIdx, fret] = key.split('-').map(Number);
        const noteInfo = getNoteOnFret(tuning.strings[sIdx], fret);
        const interval = getIntervalFromRoot(noteInfo.name, fretboard.rootNote);
        if (diffIntersection.has(interval)) {
          note.isDiffShared = true;
        }
      }
    }
    return notes;
  }, [tuning, allStructures, diffIntersection]);

  const toggleCatalogFavourite = useCallback((scaleNumber: number) => {
    setCatalogFavourites(prev => {
      const next = prev.includes(scaleNumber)
        ? prev.filter(n => n !== scaleNumber)
        : [...prev, scaleNumber];
      localStorage.setItem('fretmaster_catalog_favourites', JSON.stringify(next));
      return next;
    });
  }, []);

  const visualizeCatalogScale = useCallback((scale: CatalogScale) => {
    const newId = `catalog_${scale.n}`;
    // Add to recently viewed (cap at 10, most recent first)
    setRecentlyViewed(prev => {
      const next = [scale.n, ...prev.filter(n => n !== scale.n)].slice(0, 10);
      localStorage.setItem('fretmaster_recently_viewed', JSON.stringify(next));
      return next;
    });
    updateActiveFretboard({ globalStructure: newId, visibleIntervals: new Set(scale.pcs) });
    setIsCatalogOpen(false);
  }, [updateActiveFretboard]);

  const openCatalogForFretboard = useCallback((fb: FretboardInstance) => {
    // Compute Ian Ring number from visible intervals
    const ringNumber = [...fb.visibleIntervals].reduce((sum, pc) => sum + (1 << pc), 0);
    setInitialCatalogScale(ringNumber);
    setIsCatalogOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    const intervalsToExport = activeFretboard.isAdvancedMode ? activeGroup?.visibleIntervals : activeFretboard.visibleIntervals;
    const rootToExport = activeFretboard.isAdvancedMode && activeGroup ? activeGroup.rootNote : activeFretboard.rootNote;
    const structureToExport = detectedStructureName || (activeFretboard.isAdvancedMode && activeGroup ? activeGroup.name : 'Fretboard Pattern');
    const highlightedNotes = calculateHighlightedNotes(activeFretboard);

    exportFretboardToPng({
      tuning,
      highlightedNotes,
      structureName: structureToExport,
      intervals: Array.from((intervalsToExport || []) as Set<number>).map(i => INTERVAL_NAMES[i as number]),
      rootNote: rootToExport
    });
  }, [tuning, detectedStructureName, activeFretboard, activeGroup, calculateHighlightedNotes]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 font-sans p-4 sm:p-6 md:p-8 flex flex-col overflow-hidden">
      <header className="mb-6 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
          <span className="bg-cyan-500 text-black px-2 rounded transform -skew-x-12">Fret</span>
          <span>Master</span>
        </h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 opacity-80">Interactive Theory & Visualization Lab</p>
      </header>
      
      <main className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <Controls
          activeFretboard={activeFretboard}
          updateActiveFretboard={updateActiveFretboard}
          tuning={tuning}
          setTuning={setTuning}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          currentRing={currentRing}
          setCurrentRing={setCurrentRing}
          savedPatterns={savedPatterns}
          onSavePattern={savePattern}
          onLoadPattern={loadPattern}
          onDeletePattern={deletePattern}
          customStructures={customStructures}
          onSaveCustomStructure={saveCustomStructure}
          onDeleteCustomStructure={deleteCustomStructure}
          detectedStructureName={detectedStructureName}
          isSoundEnabled={isSoundEnabled}
          setIsSoundEnabled={setIsSoundEnabled}
          instrument={instrument}
          setInstrument={setInstrument}
          onExport={handleExport}
          onStrum={strumAll}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onOpenCatalog={() => { setInitialCatalogScale(null); setIsCatalogOpen(true); }}
          catalogFavourites={catalogFavourites}
          recentlyViewed={recentlyViewed}
          catalogStructures={catalogStructures}
          onApplyPreset={applyPreset}
          customPresets={customPresets}
          onSavePreset={savePreset}
          onDeletePreset={deletePreset}
        />

        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {fretboards.map((fb) => (
            <FretboardContainer
              key={fb.id}
              fretboard={fb}
              isActive={fb.id === activeFretboardId}
              onClick={() => setActiveFretboardId(fb.id)}
              onRemove={() => removeFretboard(fb.id)}
              canRemove={fretboards.length > 1}
              tuning={tuning}
              theme={DEFAULT_THEME}
              highlightedNotes={calculateHighlightedNotes(fb)}
              customStructures={customStructures}
              catalogStructures={catalogStructures}
              onTitleClick={() => openCatalogForFretboard(fb)}
              onToggleDiff={() => {
                setFretboards(prev => prev.map(f =>
                  f.id === fb.id ? { ...f, showDiff: !f.showDiff } : f
                ));
              }}
              onNoteClick={(sIdx, fret) => {
                const noteInfo = getNoteOnFret(tuning.strings[sIdx], fret);
                if (isSoundEnabled && noteInfo.midi) playNote(midiToFrequency(noteInfo.midi), instrument);

                // Only paint if a color is selected (not in "no paint" mode)
                if (currentColor) {
                  const key = `${sIdx}-${fret}`;
                  const updatedManualNotes = { ...fb.manualNotes };
                  if (updatedManualNotes[key]) delete updatedManualNotes[key];
                  else updatedManualNotes[key] = { color: currentColor, ring: currentRing };

                  setFretboards(prev => prev.map(f =>
                    f.id === fb.id ? { ...f, manualNotes: updatedManualNotes } : f
                  ));
                }
              }}
            />
          ))}

          {fretboards.length < 4 && (
            <button
              onClick={addFretboard}
              className="p-6 border-2 border-dashed border-cyan-500/50 rounded-3xl
                         hover:border-cyan-500 hover:bg-cyan-500/10 transition-all
                         flex items-center justify-center gap-2 text-cyan-400 font-bold"
            >
              <PlusIcon className="w-6 h-6" />
              Add Fretboard
            </button>
          )}
        </div>
      </main>

       <footer className="text-center mt-6 text-gray-600 text-[10px] font-bold uppercase tracking-widest">
        Pro Visualization Suite &bull; V2.5 &bull; Developed by Senior Engineering
       </footer>

      {isCatalogOpen && catalogData && (
        <ScaleCatalog
          scales={catalogData.scales}
          nameMap={catalogData.nameMap}
          favourites={catalogFavourites}
          onToggleFavourite={toggleCatalogFavourite}
          onVisualize={visualizeCatalogScale}
          onClose={() => { setIsCatalogOpen(false); setInitialCatalogScale(null); }}
          initialScaleNumber={initialCatalogScale}
        />
      )}
    </div>
  );
};

export default App;