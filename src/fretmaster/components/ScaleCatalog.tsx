
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
  showTriTriadic: false,
  noteCount: null,
  containsTriad: null,
  containsTetrad: null,
  intervalPattern: '',
  minConsecutiveSemitones: null,
  tetradPairSearch: '',
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

// --- Bi-triadic / Bi-tetradic / Tri-triadic detection ---
// Feature 1: Find ALL valid decompositions (not just alternating positions)

type ChordDecomposition = { t1: string; r1: number; pcs1: number[]; t2: string; r2: number; pcs2: number[] };
type TriadDecomposition = ChordDecomposition;
type TetradDecomposition = ChordDecomposition;
type TriTriadicDecomposition = { t1: string; r1: number; pcs1: number[]; t2: string; r2: number; pcs2: number[]; t3: string; r3: number; pcs3: number[] };

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

/** Canonical key for a pair of rings — order-independent deduplication */
function canonicalPairKey(ring1: number, ring2: number): string {
  return ring1 <= ring2 ? `${ring1}|${ring2}` : `${ring2}|${ring1}`;
}

/** Canonical key for a triplet of rings — order-independent deduplication */
function canonicalTripletKey(ring1: number, ring2: number, ring3: number): string {
  return [ring1, ring2, ring3].sort((a, b) => a - b).join('|');
}

/** Find ALL valid bi-triadic decompositions of a 6-note scale */
function findAllBiTriadicDecompositions(pcs: number[]): TriadDecomposition[] {
  if (pcs.length !== 6) return [];
  const pcsSet = new Set(pcs);
  const results: TriadDecomposition[] = [];
  const seen = new Set<string>();

  for (const triad of COMMON_TRIADS) {
    for (let r = 0; r < 12; r++) {
      const transposed = triad.pcs.map(pc => (pc + r) % 12);
      if (!transposed.every(pc => pcsSet.has(pc))) continue;

      // Remaining notes
      const remaining = pcs.filter(pc => !new Set(transposed).has(pc)).sort((a, b) => a - b);
      if (remaining.length !== 3) continue;

      const matches2 = TRIAD_LOOKUP.get(remaining.join(','));
      if (!matches2) continue;

      // For each matching second triad, create a decomposition
      for (const m2 of matches2) {
        const ring1 = pcsToRing(transposed);
        const ring2 = pcsToRing(remaining);
        const key = canonicalPairKey(ring1, ring2);
        if (seen.has(key)) continue;
        seen.add(key);

        results.push({
          t1: triad.id, r1: r, pcs1: [...transposed].sort((a, b) => a - b),
          t2: m2.id, r2: m2.root, pcs2: remaining,
        });
      }
    }
  }
  return results;
}

/** Find ALL valid bi-tetradic decompositions of an 8-note scale */
function findAllBiTetradicDecompositions(pcs: number[]): TetradDecomposition[] {
  if (pcs.length !== 8) return [];
  const pcsSet = new Set(pcs);
  const results: TetradDecomposition[] = [];
  const seen = new Set<string>();

  for (const tetrad of COMMON_TETRADS) {
    for (let r = 0; r < 12; r++) {
      const transposed = tetrad.pcs.map(pc => (pc + r) % 12);
      if (!transposed.every(pc => pcsSet.has(pc))) continue;

      const remaining = pcs.filter(pc => !new Set(transposed).has(pc)).sort((a, b) => a - b);
      if (remaining.length !== 4) continue;

      const matches2 = TETRAD_LOOKUP.get(remaining.join(','));
      if (!matches2) continue;

      for (const m2 of matches2) {
        const ring1 = pcsToRing(transposed);
        const ring2 = pcsToRing(remaining);
        const key = canonicalPairKey(ring1, ring2);
        if (seen.has(key)) continue;
        seen.add(key);

        results.push({
          t1: tetrad.id, r1: r, pcs1: [...transposed].sort((a, b) => a - b),
          t2: m2.id, r2: m2.root, pcs2: remaining,
        });
      }
    }
  }
  return results;
}

/** Feature 2: Find ALL valid tri-triadic decompositions of a 9-note scale */
function findAllTriTriadicDecompositions(pcs: number[]): TriTriadicDecomposition[] {
  if (pcs.length !== 9) return [];
  const pcsSet = new Set(pcs);
  const results: TriTriadicDecomposition[] = [];
  const seen = new Set<string>();

  for (const triad of COMMON_TRIADS) {
    for (let r = 0; r < 12; r++) {
      const transposed = triad.pcs.map(pc => (pc + r) % 12);
      if (!transposed.every(pc => pcsSet.has(pc))) continue;

      // Remaining 6 notes — find bi-triadic decompositions of those
      const remaining = pcs.filter(pc => !new Set(transposed).has(pc));
      if (remaining.length !== 6) continue;

      const biDecomps = findAllBiTriadicDecompositions(remaining);
      for (const bd of biDecomps) {
        const ring1 = pcsToRing(transposed);
        const ring2 = pcsToRing(bd.pcs1);
        const ring3 = pcsToRing(bd.pcs2);
        const key = canonicalTripletKey(ring1, ring2, ring3);
        if (seen.has(key)) continue;
        seen.add(key);

        results.push({
          t1: triad.id, r1: r, pcs1: [...transposed].sort((a, b) => a - b),
          t2: bd.t1, r2: bd.r1, pcs2: bd.pcs1,
          t3: bd.t2, r3: bd.r2, pcs3: bd.pcs2,
        });
      }
    }
  }
  return results;
}

/** Feature 5: Longest run of consecutive semitones (circular) */
function longestConsecutiveSemitones(iv: number[]): number {
  if (iv.length === 0) return 0;
  // Double the array for circular check
  const doubled = [...iv, ...iv];
  let maxRun = 0;
  let run = 0;
  for (const step of doubled) {
    if (step === 1) {
      run++;
      maxRun = Math.max(maxRun, run);
    } else {
      run = 0;
    }
  }
  // Cap at iv.length (can't exceed the actual scale length)
  return Math.min(maxRun, iv.length);
}

/** Vukodian naming for non-BH bi-tetradic scales; #1755 is just "Octotonic" */
function getBiTetradicLabel(
  scale: CatalogScale,
  decomps: TetradDecomposition[],
): string | null {
  if (decomps.length === 0) return null;
  if (BARRY_HARRIS_SCALES.has(scale.n)) return null;
  if (scale.n === 1755) return `Octotonic (${scale.name || 'Diminished'}) #1755`;
  // Find "prime" decomposition: first tetrad root matches pcs[0]
  const prime = decomps.find(d => d.r1 === scale.pcs[0]) || decomps[0];
  const t1 = tetradName(prime.t1);
  const t2 = tetradName(prime.t2);
  const catalogName = scale.name;
  const suffix = catalogName ? ` (${catalogName})` : '';
  return `Vukodian ${t1} + ${t2}${suffix} #${scale.n}`;
}

/** Vukodian naming for tri-triadic 9-note scales */
function getTriTriadicLabel(
  scale: CatalogScale,
  decomps: TriTriadicDecomposition[],
): string | null {
  if (decomps.length === 0) return null;
  const prime = decomps.find(d => d.r1 === scale.pcs[0]) || decomps[0];
  const t1 = triadName(prime.t1);
  const t2 = triadName(prime.t2);
  const t3 = triadName(prime.t3);
  const catalogName = scale.name;
  const suffix = catalogName ? ` (${catalogName})` : '';
  return `Vukodian ${t1} + ${t2} + ${t3}${suffix} #${scale.n}`;
}

/** Play a tri-chord decomposition: three arpeggios in succession */
function playTriDecomposition(d: TriTriadicDecomposition) {
  const baseMidi = 60;
  const sorted1 = [...d.pcs1].sort((a, b) => a - b);
  const sorted2 = [...d.pcs2].sort((a, b) => a - b);
  const sorted3 = [...d.pcs3].sort((a, b) => a - b);
  const all = [...sorted1, ...sorted2, ...sorted3];
  all.forEach((pc, i) => {
    setTimeout(() => playNote(midiToFrequency(baseMidi + pc), 'pluck', 0.6), i * 200);
  });
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

  // Bi-triadic decomposition map (hexatonic scales only) — now returns ALL decompositions
  const biTriadicMap = useMemo(() => {
    const map = new Map<number, TriadDecomposition[]>();
    for (const s of scales) {
      if (s.card !== 6) continue;
      const decomps = findAllBiTriadicDecompositions(s.pcs);
      if (decomps.length > 0) map.set(s.n, decomps);
    }
    return map;
  }, [scales]);

  // Bi-tetradic decomposition map (octotonic scales only) — now returns ALL decompositions
  const biTetradicMap = useMemo(() => {
    const map = new Map<number, TetradDecomposition[]>();
    for (const s of scales) {
      if (s.card !== 8) continue;
      const decomps = findAllBiTetradicDecompositions(s.pcs);
      if (decomps.length > 0) map.set(s.n, decomps);
    }
    return map;
  }, [scales]);

  // Tri-triadic decomposition map (9-note scales only)
  const triTriadicMap = useMemo(() => {
    const map = new Map<number, TriTriadicDecomposition[]>();
    for (const s of scales) {
      if (s.card !== 9) continue;
      const decomps = findAllTriTriadicDecompositions(s.pcs);
      if (decomps.length > 0) map.set(s.n, decomps);
    }
    return map;
  }, [scales]);

  const filteredScales = useMemo(() => {
    const parsedPattern = parseIntervalPattern(filters.intervalPattern);
    // Feature 6: parse tetrad pair search terms
    const tetradSearchTerms = filters.tetradPairSearch
      ? filters.tetradPairSearch.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      : [];

    return scales.filter(scale => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const nameMatch = scale.name.toLowerCase().includes(q);
        const vukodianMatch = q.includes('vukodian') && (
          (biTetradicMap.has(scale.n) && !BARRY_HARRIS_SCALES.has(scale.n) && scale.n !== 1755)
          || triTriadicMap.has(scale.n)
        );
        const octatonicMatch = q.includes('octotonic') && scale.n === 1755;
        if (!nameMatch && !vukodianMatch && !octatonicMatch) return false;
      }
      if (filters.showPrimeOnly && !scale.prime) return false;
      if (filters.showSymmetric && !scale.sym) return false;
      if (filters.showChords && (scale.card < 2 || scale.card > 4)) return false;
      if (filters.showHexatonic && scale.card !== 6) return false;
      if (filters.showBarryHarris && !isBarryHarrisScale(scale)) return false;
      if (filters.showFavourites && !favouriteSet.has(scale.n)) return false;
      if (filters.showBiTriadic && !biTriadicMap.has(scale.n)) return false;
      if (filters.showBiTetradic && !biTetradicMap.has(scale.n)) return false;
      if (filters.showTriTriadic && !triTriadicMap.has(scale.n)) return false;
      if (filters.noteCount !== null && scale.card !== filters.noteCount) return false;
      if (parsedPattern && !ivContainsPattern(scale.iv, parsedPattern)) return false;
      // Feature 5: chromatic filter
      if (filters.minConsecutiveSemitones !== null) {
        if (longestConsecutiveSemitones(scale.iv) < filters.minConsecutiveSemitones) return false;
      }
      // Feature 6: tetrad pair search
      if (tetradSearchTerms.length > 0) {
        const decomps = biTetradicMap.get(scale.n);
        if (!decomps) return false;
        // Every search term must appear in at least one decomposition
        const allNames = decomps.flatMap(d => [tetradName(d.t1).toLowerCase(), tetradName(d.t2).toLowerCase()]);
        if (!tetradSearchTerms.every(term => allNames.some(name => name.includes(term)))) return false;
      }
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
  }, [scales, filters, favouriteSet, biTriadicMap, biTetradicMap, triTriadicMap]);

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = {
      showFavourites: 0, showBarryHarris: 0, showPrimeOnly: 0,
      showSymmetric: 0, showChords: 0, showHexatonic: 0,
      showBiTriadic: 0, showBiTetradic: 0, showTriTriadic: 0,
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
      if (triTriadicMap.has(s.n)) counts.showTriTriadic++;
    }
    return counts;
  }, [scales, favouriteSet, biTriadicMap, biTetradicMap, triTriadicMap]);

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

  type FilterKey = 'showPrimeOnly' | 'showSymmetric' | 'showChords' | 'showHexatonic' | 'showBarryHarris' | 'showFavourites' | 'showBiTriadic' | 'showBiTetradic' | 'showTriTriadic';

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
    { key: 'showTriTriadic', label: 'Tri-Triadic' },
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
          <select
            value={filters.minConsecutiveSemitones ?? ''}
            onChange={e => updateFilter('minConsecutiveSemitones', e.target.value ? Number(e.target.value) : null)}
            className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-white"
            title="Filter by consecutive semitones"
          >
            <option value="">Chromaticism</option>
            {[2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n}+ semitones</option>
            ))}
          </select>
          <input
            type="text"
            value={filters.tetradPairSearch}
            onChange={e => updateFilter('tetradPairSearch', e.target.value)}
            placeholder="e.g., Maj6, Dim7"
            className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-white w-36"
            title="Search by tetrad pair (comma-separated)"
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
                  biTriadics={biTriadicMap.get(scale.n)}
                  biTetradics={biTetradicMap.get(scale.n)}
                  triTriadics={triTriadicMap.get(scale.n)}
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
                    biTriadics={biTriadicMap.get(scale.n)}
                    biTetradics={biTetradicMap.get(scale.n)}
                    triTriadics={triTriadicMap.get(scale.n)}
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
  biTriadics?: TriadDecomposition[];
  biTetradics?: TetradDecomposition[];
  triTriadics?: TriTriadicDecomposition[];
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
  biTriadics,
  biTetradics,
  triTriadics,
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
          {(() => {
            const label = (biTetradics && getBiTetradicLabel(scale, biTetradics))
              || (triTriadics && getTriTriadicLabel(scale, triTriadics));
            return <>
              <span className="font-medium text-white">
                {label || scale.name || `Scale #${scale.n}`}
              </span>
              {!label && <span className="text-gray-400 text-xs ml-2">#{scale.n}</span>}
            </>;
          })()}
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
            {/* All bi-triadic decompositions with colored dots and degree labels */}
            {biTriadics && biTriadics.map((d, i) => (
              <span key={`bt3-${i}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-800/80 text-gray-300">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                {INTERVAL_NAMES[(d.r1 - scale.pcs[0] + 12) % 12]} {triadName(d.t1)} + {INTERVAL_NAMES[(d.r2 - scale.pcs[0] + 12) % 12]} {triadName(d.t2)}
                <button onClick={(e) => { e.stopPropagation(); playDecomposition(d); }} className="hover:text-cyan-300 transition-colors" title="Play arpeggios">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </span>
            ))}
            {/* All bi-tetradic decompositions with colored dots and degree labels */}
            {biTetradics && biTetradics.map((d, i) => (
              <span key={`bt4-${i}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-800/80 text-gray-300">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                {INTERVAL_NAMES[(d.r1 - scale.pcs[0] + 12) % 12]} {tetradName(d.t1)} + {INTERVAL_NAMES[(d.r2 - scale.pcs[0] + 12) % 12]} {tetradName(d.t2)}
                <button onClick={(e) => { e.stopPropagation(); playDecomposition(d); }} className="hover:text-cyan-300 transition-colors" title="Play arpeggios">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </span>
            ))}
            {/* All tri-triadic decompositions with three colored dots and degree labels */}
            {triTriadics && triTriadics.map((d, i) => (
              <span key={`tt3-${i}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-800/80 text-gray-300">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                {INTERVAL_NAMES[(d.r1 - scale.pcs[0] + 12) % 12]} {triadName(d.t1)} + {INTERVAL_NAMES[(d.r2 - scale.pcs[0] + 12) % 12]} {triadName(d.t2)} + {INTERVAL_NAMES[(d.r3 - scale.pcs[0] + 12) % 12]} {triadName(d.t3)}
                <button onClick={(e) => { e.stopPropagation(); playTriDecomposition(d); }} className="hover:text-cyan-300 transition-colors" title="Play arpeggios">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </span>
            ))}
            {!scale.prime && <span className="text-xs text-gray-500">Prime form: {nameMap[String(scale.primeNum)] || `#${scale.primeNum}`} (#{scale.primeNum})</span>}
          </div>

          {/* Feature 8: Mini fretboard preview — moved to top */}
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
              label={<>Subsets ({layer.length}) <span className="normal-case">— {scale.card}-note → {scale.card - (i + 1)}-note</span></>}
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
              label={<>Supersets ({layer.length}) <span className="normal-case">— {scale.card}-note → {scale.card + (i + 1)}-note</span></>}
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
