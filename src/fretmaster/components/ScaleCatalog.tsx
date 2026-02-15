
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { CatalogScale, ScaleFilters, HighlightedNote } from '../types';
import { INTERVAL_NAMES, INTERVAL_COLORS, TUNINGS, DEFAULT_THEME, FRET_COUNT } from '../constants';
import { XIcon } from './icons/XIcon';
import { StarIcon } from './icons/StarIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ChevronIcon } from './icons/ChevronIcon';
import ScaleLookup from './ScaleLookup';
import Fretboard from './Fretboard';
import { getNoteOnFret, getIntervalFromRoot, midiToFrequency } from '../utils/music';
import { playNote } from '../utils/audio';

interface ScaleCatalogProps {
  scales: CatalogScale[];
  nameMap: Record<string, string>;
  favourites: number[];
  onToggleFavourite: (scaleNumber: number) => void;
  onVisualize: (scale: CatalogScale) => void;
  onClose: () => void;
  initialScaleNumber?: number | null;
}

const DEFAULT_FILTERS: ScaleFilters = {
  search: '',
  showPrimeOnly: false,
  showSymmetric: false,
  showChords: false,
  showHexatonic: false,
  showBarryHarris: false,
  showFavourites: false,
  showBiTriadic: false,
  showBiTetradic: false,
  noteCount: null,
  containsTriad: null,
  containsTetrad: null,
  intervalPattern: '',
};

const COMMON_TRIADS: { id: string; name: string; pcs: number[] }[] = [
  { id: 'maj',   name: 'Major',   pcs: [0, 4, 7] },
  { id: 'min',   name: 'Minor',   pcs: [0, 3, 7] },
  { id: 'dim',   name: 'Dim',     pcs: [0, 3, 6] },
  { id: 'aug',   name: 'Aug',     pcs: [0, 4, 8] },
  { id: 'sus4',  name: 'Sus4',    pcs: [0, 5, 7] },
  { id: 'sus2',  name: 'Sus2',    pcs: [0, 2, 7] },
];

const TRIAD_MAP = new Map(COMMON_TRIADS.map(t => [t.id, t]));

const COMMON_TETRADS: { id: string; name: string; pcs: number[] }[] = [
  { id: 'maj7',    name: 'Maj7',     pcs: [0, 4, 7, 11] },
  { id: 'dom7',    name: 'Dom7',     pcs: [0, 4, 7, 10] },
  { id: 'min7',    name: 'Min7',     pcs: [0, 3, 7, 10] },
  { id: 'minmaj7', name: 'MinMaj7',  pcs: [0, 3, 7, 11] },
  { id: 'maj6',    name: 'Maj6',     pcs: [0, 4, 7, 9] },
  { id: 'min6',    name: 'Min6',     pcs: [0, 3, 7, 9] },
  { id: 'm7b5',    name: 'm7b5',     pcs: [0, 3, 6, 10] },
  { id: 'dim7',    name: 'Dim7',     pcs: [0, 3, 6, 9] },
  { id: '7b5',     name: '7b5',      pcs: [0, 4, 6, 10] },
  { id: 'aug7',    name: '7#5',      pcs: [0, 4, 8, 10] },
  { id: 'augmaj7', name: 'AugMaj7',  pcs: [0, 4, 8, 11] },
  { id: '7sus4',   name: '7sus4',    pcs: [0, 5, 7, 10] },
];

const TETRAD_MAP = new Map(COMMON_TETRADS.map(t => [t.id, t]));

// Lookup sets for identifying common chords at ALL transpositions
const COMMON_TRIAD_RINGS = new Set<number>();
const COMMON_TETRAD_RINGS = new Set<number>();
for (const t of COMMON_TRIADS) {
  for (let r = 0; r < 12; r++) {
    COMMON_TRIAD_RINGS.add(pcsToRing(t.pcs.map(pc => (pc + r) % 12)));
  }
}
for (const t of COMMON_TETRADS) {
  for (let r = 0; r < 12; r++) {
    COMMON_TETRAD_RINGS.add(pcsToRing(t.pcs.map(pc => (pc + r) % 12)));
  }
}

// All 10 Barry Harris chord scales
const BARRY_HARRIS_SCALES = new Set([
  2997, 2989, 3509, 3445,           // Core 4 (Maj6, Min6, Dom7, Dom7b5)
  2781, 3501, 3437, 1773, 1757, 1883 // Extended 6 (6th chord rules)
]);

function isBarryHarrisScale(scale: CatalogScale): boolean {
  return BARRY_HARRIS_SCALES.has(scale.n);
}

function formatIntervals(pcs: number[]): string {
  return pcs.map(pc => INTERVAL_NAMES[pc % 12]).join(' ');
}

/** Compute Ian Ring number from pitch class set */
function pcsToRing(pcs: number[]): number {
  return pcs.reduce((sum, pc) => sum + (1 << pc), 0);
}

const MINI_ROOT = 'D';
const MINI_TUNING = TUNINGS.daead;

function computeMiniNotes(pcs: number[]): Record<string, HighlightedNote> {
  const notes: Record<string, HighlightedNote> = {};
  const pcsSet = new Set(pcs);
  MINI_TUNING.strings.forEach((openNote, sIdx) => {
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      const info = getNoteOnFret(openNote, fret);
      const interval = getIntervalFromRoot(info.name, MINI_ROOT);
      if (pcsSet.has(interval)) {
        const color = INTERVAL_COLORS[interval % 12];
        notes[`${sIdx}-${fret}`] = {
          label: INTERVAL_NAMES[interval],
          bgColor: color.bgColor,
          textColor: color.textColor,
        };
      }
    }
  });
  return notes;
}

/** BFS to collect layers of related scales (subsets or supersets) */
function collectLayers(
  startN: number,
  direction: 'children' | 'parents',
  scaleMap: Map<number, CatalogScale>,
  maxLayers: number = 4
): number[][] {
  const seen = new Set<number>([startN]);
  const layers: number[][] = [];
  let frontier = [startN];

  for (let depth = 0; depth < maxLayers; depth++) {
    const nextFrontier: number[] = [];
    for (const n of frontier) {
      const s = scaleMap.get(n);
      if (!s) continue;
      const neighbors = direction === 'children' ? s.directChildren : s.directParents;
      for (const nb of neighbors) {
        if (!seen.has(nb)) {
          seen.add(nb);
          nextFrontier.push(nb);
        }
      }
    }
    if (nextFrontier.length === 0) break;
    nextFrontier.sort((a, b) => a - b);
    layers.push(nextFrontier);
    frontier = nextFrontier;
  }

  return layers;
}

// --- Feature 2: Interval pattern search helpers ---

function parseIntervalPattern(input: string): number[] | null {
  if (!input.trim()) return null;
  const tokens = input.split(/[,\s]+/).filter(Boolean);
  const result: number[] = [];
  for (const t of tokens) {
    const upper = t.toUpperCase();
    if (upper === 'W') result.push(2);
    else if (upper === 'H') result.push(1);
    else if (upper === 'WH' || upper === '1.5' || upper === 'A') result.push(3);
    else {
      const n = Number(t);
      if (isNaN(n) || n < 1) return null;
      result.push(n);
    }
  }
  return result.length > 0 ? result : null;
}

function ivContainsPattern(iv: number[], pattern: number[]): boolean {
  if (pattern.length > iv.length) return false;
  for (let j = 0; j < pattern.length; j++) {
    if (iv[j] !== pattern[j]) return false;
  }
  return true;
}

// --- Feature 5 & 6: Bi-triadic / Bi-tetradic detection ---
// Rule: split scale into odd-position degrees (1,3,5,...) and even-position degrees (2,4,6,...).
// Check if each half forms a recognized triad (for 6-note) or tetrad (for 8-note).

type ChordDecomposition = { t1: string; r1: number; pcs1: number[]; t2: string; r2: number; pcs2: number[] };
type TriadDecomposition = ChordDecomposition;
type TetradDecomposition = ChordDecomposition;

// Build lookup: sorted pcs key -> all matching { id, root } entries
const TRIAD_LOOKUP = new Map<string, { id: string; root: number }[]>();
for (const triad of COMMON_TRIADS) {
  for (let r = 0; r < 12; r++) {
    const transposed = triad.pcs.map(pc => (pc + r) % 12).sort((a, b) => a - b);
    const key = transposed.join(',');
    if (!TRIAD_LOOKUP.has(key)) TRIAD_LOOKUP.set(key, []);
    TRIAD_LOOKUP.get(key)!.push({ id: triad.id, root: r });
  }
}

const TETRAD_LOOKUP = new Map<string, { id: string; root: number }[]>();
for (const tetrad of COMMON_TETRADS) {
  for (let r = 0; r < 12; r++) {
    const transposed = tetrad.pcs.map(pc => (pc + r) % 12).sort((a, b) => a - b);
    const key = transposed.join(',');
    if (!TETRAD_LOOKUP.has(key)) TETRAD_LOOKUP.set(key, []);
    TETRAD_LOOKUP.get(key)!.push({ id: tetrad.id, root: r });
  }
}

// Pick the match whose root equals preferredRoot, or fall back to first match
function bestMatch(matches: { id: string; root: number }[], preferredRoot: number) {
  return matches.find(m => m.root === preferredRoot) || matches[0];
}

function findBiTriadicDecomposition(pcs: number[]): TriadDecomposition | null {
  if (pcs.length !== 6) return null;
  const odd = [pcs[0], pcs[2], pcs[4]].sort((a, b) => a - b);
  const even = [pcs[1], pcs[3], pcs[5]].sort((a, b) => a - b);
  const matches1 = TRIAD_LOOKUP.get(odd.join(','));
  const matches2 = TRIAD_LOOKUP.get(even.join(','));
  if (!matches1 || !matches2) return null;
  const m1 = bestMatch(matches1, pcs[0]);
  const m2 = bestMatch(matches2, pcs[1]);
  return { t1: m1.id, r1: m1.root, pcs1: odd, t2: m2.id, r2: m2.root, pcs2: even };
}

function findBiTetradicDecomposition(pcs: number[]): TetradDecomposition | null {
  if (pcs.length !== 8) return null;
  const odd = [pcs[0], pcs[2], pcs[4], pcs[6]].sort((a, b) => a - b);
  const even = [pcs[1], pcs[3], pcs[5], pcs[7]].sort((a, b) => a - b);
  const matches1 = TETRAD_LOOKUP.get(odd.join(','));
  const matches2 = TETRAD_LOOKUP.get(even.join(','));
  if (!matches1 || !matches2) return null;
  const m1 = bestMatch(matches1, pcs[0]);
  const m2 = bestMatch(matches2, pcs[1]);
  return { t1: m1.id, r1: m1.root, pcs1: odd, t2: m2.id, r2: m2.root, pcs2: even };
}

function triadName(id: string): string {
  return TRIAD_MAP.get(id)?.name || id;
}

function tetradName(id: string): string {
  return TETRAD_MAP.get(id)?.name || id;
}

/** Play a bi-chord decomposition: first arpeggio ascending, then second */
function playDecomposition(d: ChordDecomposition) {
  const baseMidi = 60;
  const sorted1 = [...d.pcs1].sort((a, b) => a - b);
  const sorted2 = [...d.pcs2].sort((a, b) => a - b);
  const all = [...sorted1, ...sorted2];
  all.forEach((pc, i) => {
    setTimeout(() => playNote(midiToFrequency(baseMidi + pc), 'pluck', 0.6), i * 200);
  });
}

/** Play a scale ascending from middle C, then the octave */
function playScalePreview(pcs: number[]) {
  const baseMidi = 60; // C4
  const notes = [...pcs, 12]; // include octave
  notes.forEach((pc, i) => {
    setTimeout(() => playNote(midiToFrequency(baseMidi + pc), 'pluck', 0.6), i * 180);
  });
}

const ScaleCatalog: React.FC<ScaleCatalogProps> = ({
  scales,
  nameMap,
  favourites,
  onToggleFavourite,
  onVisualize,
  onClose,
  initialScaleNumber,
}) => {
  const [filters, setFilters] = useState<ScaleFilters>(DEFAULT_FILTERS);
  const [expandedScale, setExpandedScale] = useState<number | null>(initialScaleNumber ?? null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number | string>>(new Set());
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<'modes' | 'primeForm'>('modes');
  const expandedRef = useRef<HTMLDivElement | null>(null);

  const favouriteSet = useMemo(() => new Set(favourites), [favourites]);

  const scaleMap = useMemo(() => {
    const m = new Map<number, CatalogScale>();
    for (const s of scales) m.set(s.n, s);
    return m;
  }, [scales]);

  // Feature 5: Bi-triadic decomposition map (hexatonic scales only)
  const biTriadicMap = useMemo(() => {
    const map = new Map<number, TriadDecomposition>();
    for (const s of scales) {
      if (s.card !== 6) continue;
      const d = findBiTriadicDecomposition(s.pcs);
      if (d) map.set(s.n, d);
    }
    return map;
  }, [scales]);

  // Feature 6: Bi-tetradic decomposition map (octotonic scales only)
  const biTetradicMap = useMemo(() => {
    const map = new Map<number, TetradDecomposition>();
    for (const s of scales) {
      if (s.card !== 8) continue;
      const d = findBiTetradicDecomposition(s.pcs);
      if (d) map.set(s.n, d);
    }
    return map;
  }, [scales]);

  const filteredScales = useMemo(() => {
    const parsedPattern = parseIntervalPattern(filters.intervalPattern);
    return scales.filter(scale => {
      if (filters.search && !scale.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.showPrimeOnly && !scale.prime) return false;
      if (filters.showSymmetric && !scale.sym) return false;
      if (filters.showChords && (scale.card < 2 || scale.card > 4)) return false;
      if (filters.showHexatonic && scale.card !== 6) return false;
      if (filters.showBarryHarris && !isBarryHarrisScale(scale)) return false;
      if (filters.showFavourites && !favouriteSet.has(scale.n)) return false;
      if (filters.showBiTriadic && !biTriadicMap.has(scale.n)) return false;
      if (filters.showBiTetradic && !biTetradicMap.has(scale.n)) return false;
      if (filters.noteCount !== null && scale.card !== filters.noteCount) return false;
      if (parsedPattern && !ivContainsPattern(scale.iv, parsedPattern)) return false;
      if (filters.containsTriad) {
        const triad = TRIAD_MAP.get(filters.containsTriad);
        if (triad) {
          const pcsSet = new Set(scale.pcs);
          if (!triad.pcs.every(pc => pcsSet.has(pc))) return false;
        }
      }
      if (filters.containsTetrad) {
        const tetrad = TETRAD_MAP.get(filters.containsTetrad);
        if (tetrad) {
          const pcsSet = new Set(scale.pcs);
          if (!tetrad.pcs.every(pc => pcsSet.has(pc))) return false;
        }
      }
      return true;
    });
  }, [scales, filters, favouriteSet, biTriadicMap, biTetradicMap]);

  // Feature 3: Filter counts computed in one pass
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      showFavourites: 0, showBarryHarris: 0, showPrimeOnly: 0,
      showSymmetric: 0, showChords: 0, showHexatonic: 0,
      showBiTriadic: 0, showBiTetradic: 0,
    };
    for (const s of scales) {
      if (favouriteSet.has(s.n)) counts.showFavourites++;
      if (isBarryHarrisScale(s)) counts.showBarryHarris++;
      if (s.prime) counts.showPrimeOnly++;
      if (s.sym) counts.showSymmetric++;
      if (s.card >= 2 && s.card <= 4) counts.showChords++;
      if (s.card === 6) counts.showHexatonic++;
      if (biTriadicMap.has(s.n)) counts.showBiTriadic++;
      if (biTetradicMap.has(s.n)) counts.showBiTetradic++;
    }
    return counts;
  }, [scales, favouriteSet, biTriadicMap, biTetradicMap]);

  // Group by mode count or prime form
  const groupedScales = useMemo(() => {
    const groups = new Map<number, CatalogScale[]>();
    const favScales: CatalogScale[] = [];

    for (const scale of filteredScales) {
      if (favouriteSet.has(scale.n)) {
        favScales.push(scale);
      }
      const groupKey = groupBy === 'primeForm' ? scale.primeNum : scale.modes;
      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey)!.push(scale);
    }

    for (const [, arr] of groups) {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    favScales.sort((a, b) => a.name.localeCompare(b.name));

    const sortedGroups = [...groups.entries()].sort((a, b) => a[0] - b[0]);

    return { favScales, sortedGroups };
  }, [filteredScales, favouriteSet, groupBy]);

  const toggleGroup = useCallback((groupKey: number | string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }, []);

  const navigateToScale = useCallback((scaleNumber: number) => {
    setExpandedScale(scaleNumber);
    const scale = scaleMap.get(scaleNumber);
    if (scale) {
      const gk = groupBy === 'primeForm' ? scale.primeNum : scale.modes;
      setCollapsedGroups(prev => {
        const next = new Set(prev);
        next.delete(gk);
        return next;
      });
    }
    setTimeout(() => {
      expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }, [scaleMap, groupBy]);

  const handleLookupSelect = useCallback((scaleNumber: number) => {
    setIsLookupOpen(false);
    navigateToScale(scaleNumber);
  }, [navigateToScale]);

  // Scroll to initial scale on mount
  useEffect(() => {
    if (initialScaleNumber) {
      const scale = scaleMap.get(initialScaleNumber);
      if (scale) {
        const gk = groupBy === 'primeForm' ? scale.primeNum : scale.modes;
        setCollapsedGroups(prev => {
          const next = new Set(prev);
          next.delete(gk);
          return next;
        });
        setTimeout(() => {
          expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLookupOpen) setIsLookupOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, isLookupOpen]);

  const updateFilter = <K extends keyof ScaleFilters>(key: K, value: ScaleFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  type FilterKey = 'showPrimeOnly' | 'showSymmetric' | 'showChords' | 'showHexatonic' | 'showBarryHarris' | 'showFavourites' | 'showBiTriadic' | 'showBiTetradic';

  const toggleFilter = (key: FilterKey) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filterChips: { key: FilterKey; label: string }[] = [
    { key: 'showFavourites', label: 'Favourites' },
    { key: 'showBarryHarris', label: 'Barry Harris' },
    { key: 'showPrimeOnly', label: 'Prime Only' },
    { key: 'showSymmetric', label: 'Symmetric' },
    { key: 'showChords', label: 'Chords (2-4)' },
    { key: 'showHexatonic', label: 'Hexatonic' },
    { key: 'showBiTriadic', label: 'Bi-Triadic' },
    { key: 'showBiTetradic', label: 'Bi-Tetradic' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <h2 className="text-2xl font-bold text-cyan-400 flex-shrink-0">Scale Catalog</h2>
          <div className="flex-1 relative">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              placeholder="Search scales..."
              className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-cyan-500 focus:border-cyan-500"
              autoFocus
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Close"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="max-w-5xl mx-auto mt-3 flex flex-wrap items-center gap-2">
          {filterChips.map(chip => (
            <button
              key={chip.key}
              onClick={() => toggleFilter(chip.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters[chip.key]
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {chip.label} <span className="opacity-60">({filterCounts[chip.key] ?? 0})</span>
            </button>
          ))}
          <select
            value={filters.noteCount ?? ''}
            onChange={e => updateFilter('noteCount', e.target.value ? Number(e.target.value) : null)}
            className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-white"
          >
            <option value="">Any notes</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n} notes</option>
            ))}
          </select>
          <select
            value={filters.containsTriad ?? ''}
            onChange={e => updateFilter('containsTriad', e.target.value || null)}
            className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-white"
          >
            <option value="">Any triad</option>
            {COMMON_TRIADS.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select
            value={filters.containsTetrad ?? ''}
            onChange={e => updateFilter('containsTetrad', e.target.value || null)}
            className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-white"
          >
            <option value="">Any tetrad</option>
            {COMMON_TETRADS.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={filters.intervalPattern}
            onChange={e => updateFilter('intervalPattern', e.target.value)}
            placeholder="e.g., 2,2,1 or W,W,H"
            className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-white w-36"
            title="Search by interval step pattern"
          />
          <div className="flex rounded-full overflow-hidden border border-gray-600">
            <button
              onClick={() => setGroupBy('modes')}
              className={`px-2 py-1 text-xs font-medium transition-colors ${groupBy === 'modes' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              By Modes
            </button>
            <button
              onClick={() => setGroupBy('primeForm')}
              className={`px-2 py-1 text-xs font-medium transition-colors ${groupBy === 'primeForm' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              By Prime Form
            </button>
          </div>
          <button
            onClick={() => setIsLookupOpen(true)}
            className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors ml-auto"
          >
            Custom Scale Lookup
          </button>
          <span className="text-sm text-gray-400">{filteredScales.length} scales</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto space-y-2">
          {/* Favourites section */}
          {groupedScales.favScales.length > 0 && !filters.showFavourites && (
            <GroupSection
              title={`Favourites (${groupedScales.favScales.length})`}
              isOpen={!collapsedGroups.has(-1)}
              onToggle={() => toggleGroup(-1)}
            >
              {groupedScales.favScales.map(scale => (
                <ScaleRow
                  key={`fav-${scale.n}`}
                  scale={scale}
                  isExpanded={expandedScale === scale.n}
                  isFavourite={true}
                  onToggleExpand={() => setExpandedScale(expandedScale === scale.n ? null : scale.n)}
                  onToggleFavourite={() => onToggleFavourite(scale.n)}
                  onVisualize={() => onVisualize(scale)}
                  onNavigate={navigateToScale}
                  nameMap={nameMap}
                  scaleMap={scaleMap}
                  expandedRef={expandedScale === scale.n ? expandedRef : undefined}
                  biTriadic={biTriadicMap.get(scale.n)}
                  biTetradic={biTetradicMap.get(scale.n)}
                />
              ))}
            </GroupSection>
          )}

          {/* Grouped scales (by modes or prime form) */}
          {groupedScales.sortedGroups.map(([groupKey, groupScales]) => {
            const groupTitle = groupBy === 'primeForm'
              ? `${nameMap[String(groupKey)] || `Prime #${groupKey}`} (${groupScales.length} scales)`
              : `${groupKey} mode${groupKey !== 1 ? 's' : ''} (${groupScales.length} scales)`;
            return (
              <GroupSection
                key={groupKey}
                title={groupTitle}
                isOpen={!collapsedGroups.has(groupKey)}
                onToggle={() => toggleGroup(groupKey)}
              >
                {groupScales.map(scale => (
                  <ScaleRow
                    key={scale.n}
                    scale={scale}
                    isExpanded={expandedScale === scale.n}
                    isFavourite={favouriteSet.has(scale.n)}
                    onToggleExpand={() => setExpandedScale(expandedScale === scale.n ? null : scale.n)}
                    onToggleFavourite={() => onToggleFavourite(scale.n)}
                    onVisualize={() => onVisualize(scale)}
                    onNavigate={navigateToScale}
                    nameMap={nameMap}
                    scaleMap={scaleMap}
                    expandedRef={expandedScale === scale.n ? expandedRef : undefined}
                    biTriadic={biTriadicMap.get(scale.n)}
                    biTetradic={biTetradicMap.get(scale.n)}
                  />
                ))}
              </GroupSection>
            );
          })}
        </div>
      </div>

      {/* Scale Lookup modal */}
      {isLookupOpen && (
        <ScaleLookup
          scales={scales}
          nameMap={nameMap}
          onSelect={handleLookupSelect}
          onClose={() => setIsLookupOpen(false)}
        />
      )}
    </div>
  );
};

// --- Sub-components ---

const GroupSection: React.FC<{
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, isOpen, onToggle, children }) => (
  <div className="bg-gray-800/50 rounded-lg">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-3 text-left font-semibold text-cyan-400 hover:bg-gray-700/50 rounded-t-lg"
    >
      <span>{title}</span>
      <ChevronIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
    </button>
    {isOpen && <div className="px-2 pb-2 space-y-1">{children}</div>}
  </div>
);

const DetailSection: React.FC<{
  id: string;
  label: React.ReactNode;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}> = ({ id, label, collapsed, onToggle, children }) => {
  const isOpen = !collapsed.has(id);
  return (
    <div>
      <button
        onClick={() => onToggle(id)}
        className="flex items-center gap-1 text-xs text-gray-400 uppercase tracking-wider hover:text-gray-200 transition-colors"
      >
        <ChevronIcon className={`w-3 h-3 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
        {label}
      </button>
      {isOpen && <div className="flex flex-wrap gap-1.5 mt-1">{children}</div>}
    </div>
  );
};

interface ScaleRowProps {
  scale: CatalogScale;
  isExpanded: boolean;
  isFavourite: boolean;
  onToggleExpand: () => void;
  onToggleFavourite: () => void;
  onVisualize: () => void;
  onNavigate: (n: number) => void;
  nameMap: Record<string, string>;
  scaleMap: Map<number, CatalogScale>;
  expandedRef?: React.Ref<HTMLDivElement>;
  biTriadic?: TriadDecomposition;
  biTetradic?: TetradDecomposition;
}

const ScaleRow: React.FC<ScaleRowProps> = ({
  scale,
  isExpanded,
  isFavourite,
  onToggleExpand,
  onToggleFavourite,
  onVisualize,
  onNavigate,
  nameMap,
  scaleMap,
  expandedRef,
  biTriadic,
  biTetradic,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => new Set());
  const toggleSection = useCallback((id: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Harmonization: for each degree, find common triads and tetrads rooted on that degree
  type DegreeChord = { name: string; pcs: number[]; ring: number };
  type DegreeHarmonization = { degree: number; degreeName: string; triads: DegreeChord[]; tetrads: DegreeChord[] };

  const harmonization = useMemo((): DegreeHarmonization[] => {
    if (!isExpanded || scale.card < 3) return [];
    const pcsSet = new Set(scale.pcs);
    const result: DegreeHarmonization[] = [];

    for (const degree of scale.pcs) {
      const triads: DegreeChord[] = [];
      const tetrads: DegreeChord[] = [];

      for (const t of COMMON_TRIADS) {
        const transposed = t.pcs.map(pc => (pc + degree) % 12);
        if (transposed.every(pc => pcsSet.has(pc))) {
          triads.push({ name: t.name, pcs: transposed, ring: pcsToRing(transposed) });
        }
      }
      for (const t of COMMON_TETRADS) {
        const transposed = t.pcs.map(pc => (pc + degree) % 12);
        if (transposed.every(pc => pcsSet.has(pc))) {
          tetrads.push({ name: t.name, pcs: transposed, ring: pcsToRing(transposed) });
        }
      }

      if (triads.length > 0 || tetrads.length > 0) {
        result.push({ degree, degreeName: INTERVAL_NAMES[degree], triads, tetrads });
      }
    }
    return result;
  }, [isExpanded, scale.pcs, scale.card]);

  const miniNotes = useMemo(() => {
    if (!isExpanded) return {};
    return computeMiniNotes(scale.pcs);
  }, [isExpanded, scale.pcs]);

  const subsetLayers = useMemo(() => {
    if (!isExpanded) return [];
    return collectLayers(scale.n, 'children', scaleMap);
  }, [isExpanded, scale.n, scaleMap]);

  const supersetLayers = useMemo(() => {
    if (!isExpanded) return [];
    return collectLayers(scale.n, 'parents', scaleMap);
  }, [isExpanded, scale.n, scaleMap]);

  return (
    <div ref={expandedRef} className="bg-gray-900/50 rounded-md">
      {/* Row header */}
      <div
        className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-gray-700/50 rounded-md transition-colors"
        onClick={onToggleExpand}
      >
        <button
          onClick={e => { e.stopPropagation(); onToggleFavourite(); }}
          className={`flex-shrink-0 p-0.5 transition-colors ${isFavourite ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
          title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <StarIcon className="w-5 h-5" filled={isFavourite} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); playScalePreview(scale.pcs); }}
          className="flex-shrink-0 p-0.5 text-gray-500 hover:text-cyan-400 transition-colors"
          title="Preview scale"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-white">{scale.name || `Scale #${scale.n}`}</span>
          <span className="text-gray-400 text-xs ml-2">#{scale.n}</span>
        </div>
        <span className="text-gray-400 text-sm flex-shrink-0 hidden sm:inline">
          {formatIntervals(scale.pcs)}
        </span>
        <span className="text-gray-500 text-xs flex-shrink-0">{scale.card} notes</span>
        <ChevronIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isExpanded ? '' : '-rotate-90'}`} />
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-700/50 space-y-3">
          {/* Intervals */}
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Intervals</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm text-cyan-300">{formatIntervals(scale.pcs)}</span>
              <button
                onClick={() => {
                  const text = `${formatIntervals(scale.pcs)} [${scale.iv.join(',')}] (${scale.name || `Scale #${scale.n}`})`;
                  navigator.clipboard.writeText(text);
                }}
                className="p-0.5 text-gray-500 hover:text-cyan-400 transition-colors"
                title="Copy scale info to clipboard"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2"/></svg>
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Structure: [{scale.iv.join(', ')}]</div>
          </div>

          {/* Flags */}
          <div className="flex gap-2 flex-wrap">
            {scale.prime && <span className="px-2 py-0.5 rounded text-xs bg-green-900/50 text-green-400">Prime</span>}
            {scale.sym && <span className="px-2 py-0.5 rounded text-xs bg-purple-900/50 text-purple-400">Symmetric</span>}
            {isBarryHarrisScale(scale) && <span className="px-2 py-0.5 rounded text-xs bg-blue-900/50 text-blue-400">Barry Harris</span>}
            {biTriadic && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-900/50 text-amber-400">
                Bi-Triadic: {triadName(biTriadic.t1)}({INTERVAL_NAMES[(biTriadic.r1 - scale.pcs[0] + 12) % 12]}) + {triadName(biTriadic.t2)}({INTERVAL_NAMES[(biTriadic.r2 - scale.pcs[0] + 12) % 12]})
                <button onClick={(e) => { e.stopPropagation(); playDecomposition(biTriadic); }} className="hover:text-amber-200 transition-colors" title="Play arpeggios">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </span>
            )}
            {biTetradic && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-teal-900/50 text-teal-400">
                Bi-Tetradic: {tetradName(biTetradic.t1)}({INTERVAL_NAMES[(biTetradic.r1 - scale.pcs[0] + 12) % 12]}) + {tetradName(biTetradic.t2)}({INTERVAL_NAMES[(biTetradic.r2 - scale.pcs[0] + 12) % 12]})
                <button onClick={(e) => { e.stopPropagation(); playDecomposition(biTetradic); }} className="hover:text-teal-200 transition-colors" title="Play arpeggios">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </span>
            )}
            {!scale.prime && <span className="text-xs text-gray-500">Prime form: {nameMap[String(scale.primeNum)] || `#${scale.primeNum}`} (#{scale.primeNum})</span>}
          </div>

          {/* Harmonization — triads & tetrads from each degree */}
          {harmonization.length > 0 && (
            <DetailSection id="harmonization" label={<>Harmonization ({harmonization.length} degrees)</>} collapsed={collapsedSections} onToggle={toggleSection}>
              <div className="w-full space-y-1.5">
                {harmonization.map(h => (
                  <div key={h.degree} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-cyan-400 font-mono text-xs w-6 flex-shrink-0">{h.degreeName}</span>
                    {h.triads.map(c => (
                      <button
                        key={`t3-${c.ring}`}
                        onClick={() => onNavigate(c.ring)}
                        className="px-1.5 py-0.5 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
                        title={c.pcs.map(pc => INTERVAL_NAMES[pc]).join('-')}
                      >
                        {c.name}
                      </button>
                    ))}
                    {h.tetrads.map(c => (
                      <button
                        key={`t4-${c.ring}`}
                        onClick={() => onNavigate(c.ring)}
                        className="px-1.5 py-0.5 rounded text-xs bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-cyan-300 transition-colors"
                        title={c.pcs.map(pc => INTERVAL_NAMES[pc]).join('-')}
                      >
                        {c.name}
                      </button>
                    ))}
                    {h.triads.length === 0 && h.tetrads.length === 0 && (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Modes */}
          {scale.modeList.length > 0 && (
            <DetailSection id="modes" label={<>Modes ({scale.modeList.length + 1})</>} collapsed={collapsedSections} onToggle={toggleSection}>
              <span className="px-2 py-0.5 rounded text-xs bg-cyan-900/50 text-cyan-300 border border-cyan-800/50">
                Mode 1: {scale.name || `#${scale.n}`}
              </span>
              {scale.modeList.map(mode => (
                <button
                  key={mode.n}
                  onClick={() => onNavigate(mode.n)}
                  className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
                >
                  Mode {mode.m}: {mode.name || `#${mode.n}`}
                </button>
              ))}
            </DetailSection>
          )}

          {/* Subsets (children) - multi-layer */}
          {subsetLayers.map((layer, i) => (
            <DetailSection
              key={`sub-${i}`}
              id={`sub-${i}`}
              label={<>Subsets ({layer.length}) <span className="normal-case">— remove {i + 1} note{i + 1 > 1 ? 's' : ''}</span></>}
              collapsed={collapsedSections}
              onToggle={toggleSection}
            >
              {layer.map(childN => (
                <button
                  key={childN}
                  onClick={() => onNavigate(childN)}
                  className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
                >
                  {nameMap[String(childN)] || `#${childN}`}
                </button>
              ))}
            </DetailSection>
          ))}

          {/* Supersets (parents) - multi-layer */}
          {supersetLayers.map((layer, i) => (
            <DetailSection
              key={`sup-${i}`}
              id={`sup-${i}`}
              label={<>Supersets ({layer.length}) <span className="normal-case">— add {i + 1} note{i + 1 > 1 ? 's' : ''}</span></>}
              collapsed={collapsedSections}
              onToggle={toggleSection}
            >
              {layer.map(parentN => (
                <button
                  key={parentN}
                  onClick={() => onNavigate(parentN)}
                  className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
                >
                  {nameMap[String(parentN)] || `#${parentN}`}
                </button>
              ))}
            </DetailSection>
          ))}

          {/* Complement & Inverse */}
          <div className="flex gap-4 flex-wrap">
            {scale.complement > 0 && (
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Complement</span>
                <button
                  onClick={() => onNavigate(scale.complement)}
                  className="block text-sm text-gray-300 hover:text-cyan-300 transition-colors mt-0.5"
                >
                  {nameMap[String(scale.complement)] || `#${scale.complement}`}
                </button>
              </div>
            )}
            {scale.inverse > 0 && scale.inverse !== scale.n && (
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Inverse</span>
                <button
                  onClick={() => onNavigate(scale.inverse)}
                  className="block text-sm text-gray-300 hover:text-cyan-300 transition-colors mt-0.5"
                >
                  {nameMap[String(scale.inverse)] || `#${scale.inverse}`}
                </button>
              </div>
            )}
          </div>

          {/* Mini fretboard preview */}
          <div className="overflow-hidden rounded-lg border border-gray-700/50" style={{ height: '80px' }}>
            <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: '286%', pointerEvents: 'none' }}>
              <Fretboard
                tuning={MINI_TUNING}
                theme={DEFAULT_THEME}
                highlightedNotes={miniNotes}
                onNoteClick={() => {}}
              />
            </div>
          </div>

          {/* Visualize button */}
          <button
            onClick={onVisualize}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-1.5 px-4 rounded-md transition-colors text-sm"
          >
            Visualize on Fretboard
          </button>
        </div>
      )}
    </div>
  );
};

export default ScaleCatalog;
