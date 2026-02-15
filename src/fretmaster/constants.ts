import type { Tuning, Color, RingColor, Structure, FretboardTheme } from './types';

export const FRET_COUNT = 15;

export const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SARGAM_NAMES = ['S', 'r', 'R', 'g', 'G', 'm', 'M', 'P', 'd', 'D', 'n', 'N'];

export const INTERVAL_NAMES = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];

export const ROMAN_DEGREES = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];

export const KEYS: { name: string; value: string }[] = [
  { name: 'C', value: 'C' },
  { name: 'C# / Db', value: 'C#' },
  { name: 'D', value: 'D' },
  { name: 'D# / Eb', value: 'D#' },
  { name: 'E', value: 'E' },
  { name: 'F', value: 'F' },
  { name: 'F# / Gb', value: 'F#' },
  { name: 'G', value: 'G' },
  { name: 'G# / Ab', value: 'G#' },
  { name: 'A', value: 'A' },
  { name: 'A# / Bb', value: 'A#' },
  { name: 'B', value: 'B' },
];

export const NOTE_MAP: Record<string, { index: number, displayName: string }> = {
  'B#': { index: 0, displayName: 'C' }, 'C': { index: 0, displayName: 'C' },
  'C#': { index: 1, displayName: 'C#' }, 'Db': { index: 1, displayName: 'Db' },
  'D': { index: 2, displayName: 'D' },
  'D#': { index: 3, displayName: 'D#' }, 'Eb': { index: 3, displayName: 'Eb' },
  'E': { index: 4, displayName: 'E' }, 'Fb': { index: 4, displayName: 'E' },
  'E#': { index: 5, displayName: 'F' }, 'F': { index: 5, displayName: 'F' },
  'F#': { index: 6, displayName: 'F#' }, 'Gb': { index: 6, displayName: 'Gb' },
  'G': { index: 7, displayName: 'G' },
  'G#': { index: 8, displayName: 'G#' }, 'Ab': { index: 8, displayName: 'Ab' },
  'A': { index: 9, displayName: 'A' },
  'A#': { index: 10, displayName: 'A#' }, 'Bb': { index: 10, displayName: 'Bb' },
  'B': { index: 11, displayName: 'B' }, 'Cb': { index: 11, displayName: 'B' },
};

export const TUNINGS: { [key: string]: Tuning } = {
  daead: {
    name: 'DAEAD',
    strings: ['D4', 'A3', 'E3', 'A2', 'D2'],
  },
};

export const DEFAULT_THEME: FretboardTheme = {
  id: 'rosewood',
  name: 'Rosewood',
  woodColor: 'bg-[#4a2c2a]',
  fretColor: 'bg-[#e5e7eb]',
  nutColor: 'bg-[#fef3c7]',
  markerColor: 'bg-gray-400/60',
  labelColor: 'text-cyan-400'
};

export const INTERVAL_COLORS: Color[] = [
  { bgColor: 'bg-yellow-400', textColor: 'text-black' }, // R (0)
  { bgColor: 'bg-red-500', textColor: 'text-white' },    // b2 (1)
  { bgColor: 'bg-orange-500', textColor: 'text-white' }, // 2 (2)
  { bgColor: 'bg-indigo-400', textColor: 'text-white' }, // b3 (3)
  { bgColor: 'bg-sky-500', textColor: 'text-white' },    // 3 (4)
  { bgColor: 'bg-green-500', textColor: 'text-white' },  // 4 (5)
  { bgColor: 'bg-slate-500', textColor: 'text-white' },  // b5 (6)
  { bgColor: 'bg-violet-600', textColor: 'text-white' }, // 5 (7)
  { bgColor: 'bg-rose-500', textColor: 'text-white' },   // b6 (8)
  { bgColor: 'bg-pink-400', textColor: 'text-black' },   // 6 (9)
  { bgColor: 'bg-blue-400', textColor: 'text-black' },   // b7 (10)
  { bgColor: 'bg-cyan-400', textColor: 'text-black' },   // 7 (11)
];

export const RING_COLOR_PALETTE: RingColor[] = [
  { name: 'None', ringClassName: '', swatchClassName: '' },
  { name: 'Red', ringClassName: 'ring-red-500', swatchClassName: 'bg-red-500' },
  { name: 'Green', ringClassName: 'ring-green-500', swatchClassName: 'bg-green-500' },
  { name: 'Blue', ringClassName: 'ring-blue-500', swatchClassName: 'bg-blue-500' },
  { name: 'Yellow', ringClassName: 'ring-yellow-400', swatchClassName: 'bg-yellow-400' },
  { name: 'Purple', ringClassName: 'ring-purple-500', swatchClassName: 'bg-purple-500' },
  { name: 'Cyan', ringClassName: 'ring-cyan-400', swatchClassName: 'bg-cyan-400' },
  { name: 'White', ringClassName: 'ring-white', swatchClassName: 'bg-white border border-gray-400' },
];

export const COLOR_PALETTE: Color[] = [
  { bgColor: 'bg-red-500', textColor: 'text-white' },
  { bgColor: 'bg-orange-500', textColor: 'text-white' },
  { bgColor: 'bg-amber-400', textColor: 'text-black' },
  { bgColor: 'bg-yellow-400', textColor: 'text-black' },
  { bgColor: 'bg-lime-500', textColor: 'text-black' },
  { bgColor: 'bg-green-500', textColor: 'text-white' },
  { bgColor: 'bg-emerald-500', textColor: 'text-white' },
  { bgColor: 'bg-teal-500', textColor: 'text-white' },
  { bgColor: 'bg-cyan-400', textColor: 'text-black' },
  { bgColor: 'bg-sky-500', textColor: 'text-white' },
  { bgColor: 'bg-blue-500', textColor: 'text-white' },
  { bgColor: 'bg-indigo-500', textColor: 'text-white' },
  { bgColor: 'bg-violet-500', textColor: 'text-white' },
  { bgColor: 'bg-purple-500', textColor: 'text-white' },
  { bgColor: 'bg-fuchsia-500', textColor: 'text-white' },
  { bgColor: 'bg-pink-500', textColor: 'text-white' },
  { bgColor: 'bg-rose-500', textColor: 'text-white' },
  { bgColor: 'bg-slate-500', textColor: 'text-white' },
  { bgColor: 'bg-gray-500', textColor: 'text-white' },
  { bgColor: 'bg-zinc-500', textColor: 'text-white' },
];

// Helper to assign colors based on interval index
const assignColors = (structure: Structure) => {
    // Only assign colors if not already defined
    if (structure.colors.length === 0) {
        structure.colors = structure.intervals.map(i => INTERVAL_COLORS[i.interval % 12]);
    }
    return structure;
};

// Base structure definitions
const CHORDS_BASE: Record<string, Record<string, Structure>> = {
  'Triads & Foundational': {
    major: { name: 'Major Triad', intervals: [ { interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' } ], colors: [] },
    minor: { name: 'Minor Triad', intervals: [ { interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 7, name: '5' } ], colors: [] },
    major6: { name: 'Major 6', intervals: [ { interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 9, name: '6' } ], colors: [] },
    diminished: { name: 'Diminished Triad', intervals: [ { interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 6, name: 'b5' } ], colors: [] },
    augmented: { name: 'Augmented Triad', intervals: [ { interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 8, name: '#5' } ], colors: [] },
    sus2: { name: 'Sus2', intervals: [ { interval: 0, name: 'R' }, { interval: 2, name: '2' }, { interval: 7, name: '5' } ], colors: [] },
    sus4: { name: 'Sus4', intervals: [ { interval: 0, name: 'R' }, { interval: 5, name: '4' }, { interval: 7, name: '5' } ], colors: [] },
  },
  '7th Chords': {
    maj7: { name: 'Major 7', intervals: [ { interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 11, name: '7' } ], colors: [] },
    min7: { name: 'Minor 7', intervals: [ { interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 7, name: '5' }, { interval: 10, name: 'b7' } ], colors: [] },
    dom7: { name: 'Dominant 7', intervals: [ { interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 10, name: 'b7' } ], colors: [] },
    min7b5: { name: 'Half-Diminished 7', intervals: [ { interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 6, name: 'b5' }, { interval: 10, name: 'b7' } ], colors: [] },
    dim7: { name: 'Diminished 7', intervals: [ { interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 6, name: 'b5' }, { interval: 9, name: 'bb7' } ], colors: [] },
    minmaj7: { name: 'Minor-Major 7', intervals: [ { interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 7, name: '5' }, { interval: 11, name: '7' } ], colors: [] },
  },
  'Suspended 7th': {
    dom7sus2: { name: 'Dominant 7sus2', intervals: [{ interval: 0, name: 'R' }, { interval: 2, name: '2' }, { interval: 7, name: '5' }, { interval: 10, name: 'b7' }], colors: [] },
    dom7sus4: { name: 'Dominant 7sus4', intervals: [{ interval: 0, name: 'R' }, { interval: 5, name: '4' }, { interval: 7, name: '5' }, { interval: 10, name: 'b7' }], colors: [] },
    maj7sus2: { name: 'Major 7sus2', intervals: [{ interval: 0, name: 'R' }, { interval: 2, name: '2' }, { interval: 7, name: '5' }, { interval: 11, name: '7' }], colors: [] },
    maj7sus4: { name: 'Major 7sus4', intervals: [{ interval: 0, name: 'R' }, { interval: 5, name: '4' }, { interval: 7, name: '5' }, { interval: 11, name: '7' }], colors: [] },
  },
  'Hexatonic/Triad Pair': {
    i_ii_triad_pair: {
      name: 'I + ii (Major + Minor)',
      intervals: [0, 2, 4, 5, 7, 9].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R (0) - I Major
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2 (2) - ii Minor
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3 (4) - I Major
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4 (5) - ii Minor
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5 (7) - I Major
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 6 (9) - ii Minor
      ]
    },
    i6_iv6_pair: {
      name: 'I6 + IV6 (Experimental)',
      intervals: [0, 2, 4, 5, 7, 9].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-yellow-400', textColor: 'text-black' }, // R (0) - Overlap (C)
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2 (2) - IV6 only (D)
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3 (4) - I6 only (E)
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4 (5) - IV6 only (F)
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5 (7) - I6 only (G)
        { bgColor: 'bg-yellow-400', textColor: 'text-black' }  // 6 (9) - Overlap (A)
      ]
    },
    hexatonic_v_vi: {
      name: 'Hexatonic V+vi (Maj + Min)',
      intervals: [0, 2, 4, 7, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-red-500', textColor: 'text-white' },
        { bgColor: 'bg-blue-500', textColor: 'text-white' },
        { bgColor: 'bg-red-500', textColor: 'text-white' },
        { bgColor: 'bg-blue-500', textColor: 'text-white' },
        { bgColor: 'bg-red-500', textColor: 'text-white' },
        { bgColor: 'bg-blue-500', textColor: 'text-white' }
      ]
    },
    hexatonic_cluster_123_567: {
      name: 'Hexatonic {1,2,3} + {5,6,7}',
      intervals: [0, 2, 4, 7, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-emerald-500', textColor: 'text-white' },
        { bgColor: 'bg-emerald-500', textColor: 'text-white' },
        { bgColor: 'bg-emerald-500', textColor: 'text-white' },
        { bgColor: 'bg-orange-500', textColor: 'text-white' },
        { bgColor: 'bg-orange-500', textColor: 'text-white' },
        { bgColor: 'bg-orange-500', textColor: 'text-white' }
      ]
    },
    hexatonic_cluster_235_671: {
      name: 'Hexatonic {2,3,5} + {6,7,1}',
      intervals: [0, 2, 4, 7, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-yellow-400', textColor: 'text-black' },
        { bgColor: 'bg-blue-600', textColor: 'text-white' },
        { bgColor: 'bg-blue-600', textColor: 'text-white' },
        { bgColor: 'bg-blue-600', textColor: 'text-white' },
        { bgColor: 'bg-yellow-400', textColor: 'text-black' },
        { bgColor: 'bg-yellow-400', textColor: 'text-black' }
      ]
    },
    hexatonic_cluster_356_712: {
      name: 'Hexatonic {3,5,6} + {7,1,2}',
      intervals: [0, 2, 4, 7, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-violet-500', textColor: 'text-white' },
        { bgColor: 'bg-violet-500', textColor: 'text-white' },
        { bgColor: 'bg-amber-400', textColor: 'text-black' },
        { bgColor: 'bg-amber-400', textColor: 'text-black' },
        { bgColor: 'bg-amber-400', textColor: 'text-black' },
        { bgColor: 'bg-violet-500', textColor: 'text-white' }
      ]
    },
  },
  'Minor Blues': {
    // TRUE TRIAD PAIR - the only one with zero overlap
    minor_blues_sus_min: {
      name: 'Minor Blues: Sus(I) + min(bIII)',
      intervals: [0, 3, 5, 6, 7, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-red-500', textColor: 'text-white' },     // 1 - Sus(I)
        { bgColor: 'bg-blue-500', textColor: 'text-white' },    // b3 - min(bIII)
        { bgColor: 'bg-red-500', textColor: 'text-white' },     // 4 - Sus(I)
        { bgColor: 'bg-blue-500', textColor: 'text-white' },    // b5 - min(bIII)
        { bgColor: 'bg-red-500', textColor: 'text-white' },     // 5 - Sus(I)
        { bgColor: 'bg-blue-500', textColor: 'text-white' }     // b7 - min(bIII)
      ]
    },
    // TRIADS + ALTERNATIVE CLUSTERS
    minor_blues_sus4: {
      name: 'Minor Blues: Sus(IV) + Cluster',
      intervals: [0, 3, 5, 6, 7, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-orange-500', textColor: 'text-white' },  // 1 - Sus(IV)
        { bgColor: 'bg-blue-600', textColor: 'text-white' },    // b3 - Cluster
        { bgColor: 'bg-orange-500', textColor: 'text-white' },  // 4 - Sus(IV)
        { bgColor: 'bg-blue-600', textColor: 'text-white' },    // b5 - Cluster
        { bgColor: 'bg-blue-600', textColor: 'text-white' },    // 5 - Cluster
        { bgColor: 'bg-orange-500', textColor: 'text-white' }   // b7 - Sus(IV)
      ]
    },
    minor_blues_susb7: {
      name: 'Minor Blues: Sus(bVII) + Cluster',
      intervals: [0, 3, 5, 6, 7, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-emerald-500', textColor: 'text-white' }, // 1 - Cluster
        { bgColor: 'bg-purple-600', textColor: 'text-white' },  // b3 - Sus(bVII)
        { bgColor: 'bg-purple-600', textColor: 'text-white' },  // 4 - Sus(bVII)
        { bgColor: 'bg-emerald-500', textColor: 'text-white' }, // b5 - Cluster
        { bgColor: 'bg-emerald-500', textColor: 'text-white' }, // 5 - Cluster
        { bgColor: 'bg-purple-600', textColor: 'text-white' }   // b7 - Sus(bVII)
      ]
    },
    minor_blues_min1: {
      name: 'Minor Blues: min(I) + Cluster',
      intervals: [0, 3, 5, 6, 7, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-red-500', textColor: 'text-white' },     // 1 - min(I)
        { bgColor: 'bg-red-500', textColor: 'text-white' },     // b3 - min(I)
        { bgColor: 'bg-yellow-400', textColor: 'text-black' },  // 4 - Cluster
        { bgColor: 'bg-yellow-400', textColor: 'text-black' },  // b5 - Cluster
        { bgColor: 'bg-red-500', textColor: 'text-white' },     // 5 - min(I)
        { bgColor: 'bg-yellow-400', textColor: 'text-black' }   // b7 - Cluster
      ]
    },
    minor_blues_majb3: {
      name: 'Minor Blues: Maj(bIII) + Cluster',
      intervals: [0, 3, 5, 6, 7, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-yellow-400', textColor: 'text-black' },  // 1 - Cluster
        { bgColor: 'bg-blue-500', textColor: 'text-white' },    // b3 - Maj(bIII)
        { bgColor: 'bg-yellow-400', textColor: 'text-black' },  // 4 - Cluster
        { bgColor: 'bg-yellow-400', textColor: 'text-black' },  // b5 - Cluster
        { bgColor: 'bg-blue-500', textColor: 'text-white' },    // 5 - Maj(bIII)
        { bgColor: 'bg-blue-500', textColor: 'text-white' }     // b7 - Maj(bIII)
      ]
    },
    minor_blues_dim: {
      name: 'Minor Blues: dim(I) + Cluster',
      intervals: [0, 3, 5, 6, 7, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-violet-500', textColor: 'text-white' },  // 1 - dim(I)
        { bgColor: 'bg-violet-500', textColor: 'text-white' },  // b3 - dim(I)
        { bgColor: 'bg-amber-400', textColor: 'text-black' },   // 4 - Cluster
        { bgColor: 'bg-violet-500', textColor: 'text-white' },  // b5 - dim(I)
        { bgColor: 'bg-amber-400', textColor: 'text-black' },   // 5 - Cluster
        { bgColor: 'bg-amber-400', textColor: 'text-black' }    // b7 - Cluster
      ]
    },
    // CLUSTER PAIRS (consecutive positions)
    minor_blues_cluster_123_456: {
      name: 'Minor Blues: {1,b3,4} + {b5,5,b7}',
      intervals: [0, 3, 5, 6, 7, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-emerald-500', textColor: 'text-white' }, // 1
        { bgColor: 'bg-emerald-500', textColor: 'text-white' }, // b3
        { bgColor: 'bg-emerald-500', textColor: 'text-white' }, // 4
        { bgColor: 'bg-orange-500', textColor: 'text-white' },  // b5
        { bgColor: 'bg-orange-500', textColor: 'text-white' },  // 5
        { bgColor: 'bg-orange-500', textColor: 'text-white' }   // b7
      ]
    },
    minor_blues_cluster_234_561: {
      name: 'Minor Blues: {b3,4,b5} + {5,b7,1}',
      intervals: [0, 3, 5, 6, 7, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-600', textColor: 'text-white' },    // 1
        { bgColor: 'bg-yellow-400', textColor: 'text-black' },  // b3
        { bgColor: 'bg-yellow-400', textColor: 'text-black' },  // 4
        { bgColor: 'bg-yellow-400', textColor: 'text-black' },  // b5
        { bgColor: 'bg-blue-600', textColor: 'text-white' },    // 5
        { bgColor: 'bg-blue-600', textColor: 'text-white' }     // b7
      ]
    },
    minor_blues_cluster_345_612: {
      name: 'Minor Blues: {4,b5,5} + {b7,1,b3}',
      intervals: [0, 3, 5, 6, 7, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-purple-500', textColor: 'text-white' },  // 1
        { bgColor: 'bg-purple-500', textColor: 'text-white' },  // b3
        { bgColor: 'bg-lime-400', textColor: 'text-black' },    // 4
        { bgColor: 'bg-lime-400', textColor: 'text-black' },    // b5
        { bgColor: 'bg-lime-400', textColor: 'text-black' },    // 5
        { bgColor: 'bg-purple-500', textColor: 'text-white' }   // b7
      ]
    },
  },
  'Barry Harris System': {
    sixth_diminished: {
      name: 'Major — 6 on Root',
      intervals: [0, 2, 4, 5, 7, 8, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' },   // R (0) - Maj6 root
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2 (2) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3 (4) - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4 (5) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5 (7) - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6 (8) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6 (9) - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7 (11) - Dim7
      ]
    },
    minor_sixth_diminished: {
      name: 'Minor — m6 on Root',
      intervals: [0, 2, 3, 5, 7, 8, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' },   // R (0) - Min6 root
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2 (2) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3 (3) - Min6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4 (5) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5 (7) - Min6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6 (8) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6 (9) - Min6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7 (11) - Dim7
      ]
    },
    maj9_sixth: {
      name: 'Maj9 — 6 on 5th',
      intervals: [0, 2, 3, 4, 6, 7, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-red-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' },    // R (0) - Dim7 (chord root)
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 2 (2) - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b3 (3) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3 (4) - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b5 (6) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5 (7) - Maj6 (6th root)
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 6 (9) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' }    // 7 (11) - Maj6
      ]
    },
    m7_sixth: {
      name: 'm7 — 6 on b3',
      intervals: [0, 2, 3, 5, 7, 8, 10, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' },   // R (0) - Maj6 (chord root)
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2 (2) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3 (3) - Maj6 (6th root)
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4 (5) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5 (7) - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6 (8) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b7 (10) - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7 (11) - Dim7
      ]
    },
    m7b5_sixth: {
      name: 'm7b5 — m6 on b3',
      intervals: [0, 2, 3, 5, 6, 8, 10, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' },   // R (0) - Min6 (chord root)
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2 (2) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3 (3) - Min6 (6th root)
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4 (5) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b5 (6) - Min6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6 (8) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b7 (10) - Min6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7 (11) - Dim7
      ]
    },
    dom7sus4_sixth: {
      name: '7sus4 — 6 on b7',
      intervals: [0, 2, 3, 5, 6, 7, 9, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-red-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' },    // R (0) - Dim7 (chord root)
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 2 (2) - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b3 (3) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 4 (5) - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b5 (6) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5 (7) - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 6 (9) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' }    // b7 (10) - Maj6 (6th root)
      ]
    },
    dom7susb9_sixth: {
      name: '7susb9 — m6 on b7',
      intervals: [0, 1, 3, 5, 6, 7, 9, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-red-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' },    // R (0) - Dim7 (chord root)
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b2 (1) - Min6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b3 (3) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 4 (5) - Min6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b5 (6) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5 (7) - Min6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 6 (9) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' }    // b7 (10) - Min6 (6th root)
      ]
    },
    dom9_sixth: {
      name: '9 — m6 on 5th',
      intervals: [0, 2, 3, 4, 6, 7, 9, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-red-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' },    // R (0) - Dim7 (chord root)
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 2 (2) - Min6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b3 (3) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3 (4) - Min6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b5 (6) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5 (7) - Min6 (6th root)
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 6 (9) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' }    // b7 (10) - Min6
      ]
    },
    dom7alt_sixth: {
      name: '7alt — m6 on b2',
      intervals: [0, 1, 3, 4, 6, 8, 9, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-red-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' },    // R (0) - Dim7 (chord root)
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b2 (1) - Min6 (6th root)
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b3 (3) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3 (4) - Min6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b5 (6) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b6 (8) - Min6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 6 (9) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' }    // b7 (10) - Min6
      ]
    },
    dom7_diminished: {
      name: 'Dominant 7 Diminished',
      intervals: [0, 2, 4, 5, 7, 8, 10, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' },  // R (0) - Dom7
        { bgColor: 'bg-red-500', textColor: 'text-white' },   // 2 (2) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },  // 3 (4) - Dom7
        { bgColor: 'bg-red-500', textColor: 'text-white' },   // 4 (5) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },  // 5 (7) - Dom7
        { bgColor: 'bg-red-500', textColor: 'text-white' },   // b6 (8) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },  // b7 (10) - Dom7
        { bgColor: 'bg-red-500', textColor: 'text-white' }    // 7 (11) - Dim7
      ]
    },
    dom7b5_diminished: {
      name: 'Dominant 7♭5 Diminished',
      intervals: [0, 2, 4, 5, 6, 8, 10, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R (0) - Dom7b5
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2 (2) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3 (4) - Dom7b5
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4 (5) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b5 (6) - Dom7b5
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6 (8) - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b7 (10) - Dom7b5
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7 (11) - Dim7
      ]
    },
  },
  'Tetrad Pairs': {
    phrygian_dom_bebop: {
      name: 'Phrygian Dom Bebop (Dom7 + Dom7 on b2)',
      intervals: [0, 1, 4, 5, 7, 8, 10, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white', ringClassName: 'ring-yellow-400' },   // R (0) - Dom7
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b2 (1) - Dom7(b2)
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3 (4) - Dom7
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4 (5) - Dom7(b2)
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5 (7) - Dom7
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6 (8) - Dom7(b2)
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b7 (10) - Dom7
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7 (11) - Dom7(b2)
      ]
    },
  },
  'BH: Major Modes (Drop b6)': {
    bh_ionian: {
      name: 'Ionian (Major)',
      intervals: [0, 2, 4, 5, 7, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2 - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3 - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4 - Dim7
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5 - Maj6
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6 - Maj6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7 - Dim7
      ]
    },
    bh_dorian: {
      name: 'Dorian',
      intervals: [0, 2, 3, 5, 7, 9, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // b7
      ]
    },
    bh_phrygian: {
      name: 'Phrygian',
      intervals: [0, 1, 3, 5, 7, 8, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6
        { bgColor: 'bg-blue-500', textColor: 'text-white' }    // b7
      ]
    },
    bh_lydian: {
      name: 'Lydian',
      intervals: [0, 2, 4, 6, 7, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // #4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7
      ]
    },
    bh_mixolydian: {
      name: 'Mixolydian',
      intervals: [0, 2, 4, 5, 7, 9, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // b7
      ]
    },
    bh_aeolian: {
      name: 'Aeolian (Natural Minor)',
      intervals: [0, 2, 3, 5, 7, 8, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6
        { bgColor: 'bg-blue-500', textColor: 'text-white' }    // b7
      ]
    },
    bh_locrian: {
      name: 'Locrian',
      intervals: [0, 1, 3, 5, 6, 8, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b5
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6
        { bgColor: 'bg-blue-500', textColor: 'text-white' }    // b7
      ]
    },
  },
  'BH: Harmonic Minor Modes (Drop 5)': {
    bh_harmonic_minor: {
      name: 'Harmonic Minor',
      intervals: [0, 2, 3, 5, 7, 8, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7
      ]
    },
    bh_locrian_nat6: {
      name: 'Locrian ♮6',
      intervals: [0, 1, 3, 5, 6, 9, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b5
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // b7
      ]
    },
    bh_ionian_aug: {
      name: 'Ionian #5 (Augmented Major)',
      intervals: [0, 2, 4, 5, 8, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // #5
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7
      ]
    },
    bh_dorian_sharp4: {
      name: 'Dorian #4 (Romanian Minor)',
      intervals: [0, 2, 3, 6, 7, 9, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // #4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // b7
      ]
    },
    bh_phrygian_dominant: {
      name: 'Phrygian Dominant',
      intervals: [0, 1, 4, 5, 7, 8, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6
        { bgColor: 'bg-blue-500', textColor: 'text-white' }    // b7
      ]
    },
    bh_lydian_sharp2: {
      name: 'Lydian #2',
      intervals: [0, 3, 4, 6, 7, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // #2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // #4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7
      ]
    },
    bh_super_locrian_dim7: {
      name: 'Super Locrian bb7',
      intervals: [0, 1, 3, 4, 6, 8, 9].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b5
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6
        { bgColor: 'bg-blue-500', textColor: 'text-white' }    // bb7
      ]
    },
  },
  'BH: Harmonic Major Modes (Drop 6)': {
    bh_harmonic_major: {
      name: 'Harmonic Major (Ionian b6)',
      intervals: [0, 2, 4, 5, 7, 8, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7
      ]
    },
    bh_dorian_flat5: {
      name: 'Dorian b5',
      intervals: [0, 2, 3, 5, 6, 9, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b5
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // b7
      ]
    },
    bh_phrygian_flat4: {
      name: 'Phrygian b4',
      intervals: [0, 1, 3, 4, 7, 8, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6
        { bgColor: 'bg-blue-500', textColor: 'text-white' }    // b7
      ]
    },
    bh_lydian_dim: {
      name: 'Lydian b3 (Lydian Diminished)',
      intervals: [0, 2, 3, 6, 7, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // #4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7
      ]
    },
    bh_mixolydian_flat2: {
      name: 'Mixolydian b2',
      intervals: [0, 1, 4, 5, 7, 9, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 5
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // b7
      ]
    },
    bh_lydian_aug_sharp2: {
      name: 'Lydian Augmented #2',
      intervals: [0, 3, 4, 6, 8, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // #2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // #4
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // #5
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // 6
        { bgColor: 'bg-red-500', textColor: 'text-white' }     // 7
      ]
    },
    bh_locrian_dim7: {
      name: 'Locrian bb7',
      intervals: [0, 1, 3, 5, 6, 8, 9].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })),
      colors: [
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // R
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b2
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b3
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // 4
        { bgColor: 'bg-blue-500', textColor: 'text-white' },   // b5
        { bgColor: 'bg-red-500', textColor: 'text-white' },    // b6
        { bgColor: 'bg-blue-500', textColor: 'text-white' }    // bb7
      ]
    },
  },
  'Other Scales': {
    messiaen_mode_3: { name: 'Messiaen Mode 3', intervals: [0, 2, 3, 4, 6, 7, 8, 10, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })), colors: [] },
    major_pentatonic: { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })), colors: [] },
    minor_pentatonic: { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })), colors: [] },
    blues: { name: 'Blues Scale', intervals: [0, 3, 5, 6, 7, 10].map(i => ({ interval: i, name: i === 6 ? 'b5' : INTERVAL_NAMES[i] })), colors: [] },
  }
};

const FIVE_NOTE_CHORDS: Record<string, Record<string, Structure>> = {
  '5-Note: Standard Extended': {
    dom9: { name: 'Dominant 9', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 10, name: 'b7' }, { interval: 14, name: '9' }], colors: [] },
    min9: { name: 'Minor 9', intervals: [{ interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 7, name: '5' }, { interval: 10, name: 'b7' }, { interval: 14, name: '9' }], colors: [] },
    major9: { name: 'Major 9', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 11, name: '7' }, { interval: 14, name: '9' }], colors: [] },
    maj69: { name: 'Major 6/9', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 9, name: '6' }, { interval: 14, name: '9' }], colors: [] },
    min69: { name: 'Minor 6/9', intervals: [{ interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 7, name: '5' }, { interval: 9, name: '6' }, { interval: 14, name: '9' }], colors: [] },
    dom7b9: { name: 'Dominant 7(b9)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 10, name: 'b7' }, { interval: 13, name: 'b9' }], colors: [] },
    dom7sharp9: { name: 'Dominant 7(#9)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 10, name: 'b7' }, { interval: 15, name: '#9' }], colors: [] },
    minmaj9: { name: 'Minor-Major 9', intervals: [{ interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 7, name: '5' }, { interval: 11, name: '7' }, { interval: 14, name: '9' }], colors: [] },
    halfdim9: { name: 'Half-Diminished 9', intervals: [{ interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 6, name: 'b5' }, { interval: 10, name: 'b7' }, { interval: 14, name: '9' }], colors: [] },
  },
  '5-Note: Suspended': {
    dom7sus4add9: { 
      name: '7sus4(add 9)', 
      intervals: [
        { interval: 0, name: 'R' }, 
        { interval: 5, name: '4' }, 
        { interval: 7, name: '5' }, 
        { interval: 10, name: 'b7' }, 
        { interval: 14, name: '9' }
      ], 
      colors: [] 
    },
  }
};

// Chromatic scale helpers
const ALL_12 = [
  { interval: 0, name: 'R' }, { interval: 1, name: 'b2' }, { interval: 2, name: '2' },
  { interval: 3, name: 'b3' }, { interval: 4, name: '3' }, { interval: 5, name: '4' },
  { interval: 6, name: 'b5' }, { interval: 7, name: '5' }, { interval: 8, name: 'b6' },
  { interval: 9, name: '6' }, { interval: 10, name: 'b7' }, { interval: 11, name: '7' },
];
const W: Color = { bgColor: 'bg-white', textColor: 'text-black' };
const G: Color = { bgColor: 'bg-gray-400', textColor: 'text-black' };
const DG: Color = { bgColor: 'bg-gray-600', textColor: 'text-white' };
const B: Color = { bgColor: 'bg-gray-900', textColor: 'text-white' };
// Symbol-only: transparent bg, symbol rendered in white/grey/dark-grey
// Dim I = Aluminum (white), Dim II = Electric Blue, Dim III = Vibrant Red
const ALUM: Color = { bgColor: 'bg-transparent', textColor: 'text-[#D8DDE1]' };
// Ringed variants (hollow ring around the symbol)
const ALUM_R: Color = { bgColor: 'bg-transparent', textColor: 'text-[#D8DDE1]', ringClassName: 'ring-[#D8DDE1]' };
// Electric blue / Vibrant red
const LAPIS: Color = { bgColor: 'bg-transparent', textColor: 'text-[#0080FF]' };
const IRON: Color = { bgColor: 'bg-transparent', textColor: 'text-[#FF2020]' };
const LAPIS_R: Color = { bgColor: 'bg-transparent', textColor: 'text-[#0080FF]', ringClassName: 'ring-[#0080FF]' };
const IRON_R: Color = { bgColor: 'bg-transparent', textColor: 'text-[#FF2020]', ringClassName: 'ring-[#FF2020]' };

const CHROMATIC_SCALES: Record<string, Record<string, Structure>> = {
  'Chromatic: Binary (B/W)': {
    chromatic_major: {
      name: 'Major Highlight',
      intervals: ALL_12,
      //        R  b2  2  b3  3   4  b5  5  b6  6  b7  7
      colors: [ W, B,  W, B,  W,  W, B,  W, B,  W, B,  W ],
    },
    chromatic_minor: {
      name: 'Natural Minor Highlight',
      intervals: ALL_12,
      //        R  b2  2  b3  3   4  b5  5  b6  6  b7  7
      colors: [ W, B,  W, W,  B,  W, B,  W, W,  B, W,  B ],
    },
    chromatic_wholetone: {
      name: 'Whole-Tone Split (Mod 2)',
      intervals: ALL_12,
      //        R  b2  2  b3  3   4  b5  5  b6  6  b7  7
      colors: [ W, B,  W, B,  W,  B, W,  B, W,  B, W,  B ],
    },
    chromatic_pent_major: {
      name: 'Pentatonic Major Highlight',
      intervals: ALL_12,
      //        R  b2  2  b3  3   4  b5  5  b6  6  b7  7
      colors: [ W, B,  W, B,  W,  B, B,  W, B,  W, B,  B ],
    },
    chromatic_pent_minor: {
      name: 'Pentatonic Minor Highlight',
      intervals: ALL_12,
      //        R  b2  2  b3  3   4  b5  5  b6  6  b7  7
      colors: [ W, B,  B, W,  B,  W, B,  W, B,  B, W,  B ],
    },
    chromatic_open_strings: {
      name: 'Open String Notes (R-5-2)',
      intervals: ALL_12,
      //        R  b2  2  b3  3   4  b5  5  b6  6  b7  7
      colors: [ W, B,  W, B,  B,  B, B,  W, B,  B, B,  B ],
    },
  },
  'Chromatic: Ternary (B/W/G)': {
    chromatic_dim_axis: {
      name: 'Diminished Axis (Mod 3)',
      intervals: ALL_12,
      // 3 dim7 chords: {R,b3,b5,6}=W / {b2,3,5,b7}=G / {2,4,b6,7}=B
      //        R  b2  2  b3  3   4  b5  5  b6  6  b7  7
      colors: [ W, G,  B, W,  G,  B, W,  G, B,  W, G,  B ],
    },
    chromatic_aug_axis: {
      name: 'Augmented Axis (Mod 4)',
      intervals: ALL_12,
      // 4 aug triads: {R,3,b6}=W / {b2,4,6}=light grey / {2,b5,b7}=dark grey / {b3,5,7}=B
      //        R   b2  2   b3  3   4   b5  5   b6  6   b7  7
      colors: [ W,  G,  DG, B,  W,  G,  DG, B,  W,  G,  DG, B ],
    },
    chromatic_pent_layers: {
      name: 'Pentatonic → Diatonic → Chromatic',
      intervals: ALL_12,
      // Pentatonic=W / Diatonic extensions(4,7)=G / Chromatic=B
      //        R  b2  2  b3  3   4  b5  5  b6  6  b7  7
      colors: [ W, B,  W, B,  W,  G, B,  W, B,  W, B,  G ],
    },
    chromatic_triad_layers: {
      name: 'Triad → Scale → Chromatic',
      intervals: ALL_12,
      // Triad(R,3,5)=W / Other diatonic(2,4,6,7)=G / Chromatic=B
      //        R  b2  2  b3  3   4  b5  5  b6  6  b7  7
      colors: [ W, B,  G, B,  W,  G, B,  W, B,  G, B,  G ],
    },
    chromatic_consonance: {
      name: 'Interval Class (Consonance Tiers)',
      intervals: ALL_12,
      // Perfect(R,4,5)=W / Imperfect(b3,3,b6,6)=G / Dissonant(b2,2,b5,b7,7)=B
      //        R  b2  2  b3  3   4  b5  5  b6  6  b7  7
      colors: [ W, B,  B, G,  G,  W, B,  W, G,  G, B,  B ],
    },
    chromatic_tonnetz: {
      name: 'Tonnetz (Circle of Fifths Proximity)',
      intervals: ALL_12,
      // Distance on CoF: {R,5,4}=W(0-1) / {2,b7,6,b3}=G(2-3) / {3,b6,7,b2,b5}=B(4-6)
      //        R  b2  2  b3  3   4  b5  5  b6  6  b7  7
      colors: [ W, B,  G, G,  B,  W, B,  W, B,  G, G,  B ],
    },
  },
  'Chromatic: Dot Map': {
    chromatic_dim_dots: {
      name: 'Diminished Axis (Mod 3) — Dots',
      intervals: ALL_12,
      //        R  b2  2  b3  3   4  b5  5  b6  6  b7  7
      colors: [ W, G,  B, W,  G,  B, W,  G, B,  W, G,  B ],
      dotSize: 'small' as const,
    },
  },
  'Chromatic: Symbol Map': {
    // Each dim7 group shares a color (W/G/B). Within each group, 4 symbols distinguish the 4 members.
    // Symbol position: 1st member of each dim7 → symbol 1, 2nd → symbol 2, etc.
    // Dim I: R(0), b3(3), b5(6), 6(9) | Dim II: b2(1), 3(4), 5(7), b7(10) | Dim III: 2(2), 4(5), b6(8), 7(11)
    dim_celestial: {
      name: 'Celestial (●  ✦  ☾  ○)',
      intervals: [
        // Root gets biggest/most prominent, decreasing through dim7 group
        { interval: 0, name: '●' },  { interval: 1, name: '●' },  { interval: 2, name: '●' },
        { interval: 3, name: '✦' },  { interval: 4, name: '✦' },  { interval: 5, name: '✦' },
        { interval: 6, name: '☾' },  { interval: 7, name: '☾' },  { interval: 8, name: '☾' },
        { interval: 9, name: '○' },  { interval: 10, name: '○' }, { interval: 11, name: '○' },
      ],
      colors: [ ALUM, LAPIS, IRON, ALUM, LAPIS, IRON, ALUM, LAPIS, IRON, ALUM, LAPIS, IRON ],
    },
    dim_minimal: {
      name: 'Minimal Marks (⁘  ∴  ∶  ·)',
      intervals: [
        // Root = 4 dots (biggest), decreasing to 1 dot
        { interval: 0, name: '⁘' },  { interval: 1, name: '⁘' },  { interval: 2, name: '⁘' },
        { interval: 3, name: '∴' },  { interval: 4, name: '∴' },  { interval: 5, name: '∴' },
        { interval: 6, name: '∶' },  { interval: 7, name: '∶' },  { interval: 8, name: '∶' },
        { interval: 9, name: '·' },  { interval: 10, name: '·' }, { interval: 11, name: '·' },
      ],
      colors: [ ALUM, LAPIS, IRON, ALUM, LAPIS, IRON, ALUM, LAPIS, IRON, ALUM, LAPIS, IRON ],
    },
    dim_minimal_rring: {
      name: 'Minimal + Root Ring (⁘  ∴  ∶  ·)',
      intervals: [
        { interval: 0, name: '⁘' },  { interval: 1, name: '⁘' },  { interval: 2, name: '⁘' },
        { interval: 3, name: '∴' },  { interval: 4, name: '∴' },  { interval: 5, name: '∴' },
        { interval: 6, name: '∶' },  { interval: 7, name: '∶' },  { interval: 8, name: '∶' },
        { interval: 9, name: '·' },  { interval: 10, name: '·' }, { interval: 11, name: '·' },
      ],
      colors: [ ALUM_R, LAPIS, IRON, ALUM, LAPIS, IRON, ALUM, LAPIS, IRON, ALUM, LAPIS, IRON ],
    },
    dim_minimal_metal_ring: {
      name: 'Minimal + R/5 Ring (⁘  ∴  ∶  ·)',
      intervals: [
        { interval: 0, name: '⁘' },  { interval: 1, name: '⁘' },  { interval: 2, name: '⁘' },
        { interval: 3, name: '∴' },  { interval: 4, name: '∴' },  { interval: 5, name: '∴' },
        { interval: 6, name: '∶' },  { interval: 7, name: '∶' },  { interval: 8, name: '∶' },
        { interval: 9, name: '·' },  { interval: 10, name: '·' }, { interval: 11, name: '·' },
      ],
      //              R       b2     2       b3     3      4       b5     5        b6      6      b7     7
      colors: [ ALUM_R, LAPIS, IRON, ALUM, LAPIS, IRON, ALUM, LAPIS_R, IRON, ALUM, LAPIS, IRON ],
    },
    dim_minimal_metal_r25: {
      name: 'Minimal + R/2/5 Ring (⁘  ∴  ∶  ·)',
      intervals: [
        { interval: 0, name: '⁘' },  { interval: 1, name: '⁘' },  { interval: 2, name: '⁘' },
        { interval: 3, name: '∴' },  { interval: 4, name: '∴' },  { interval: 5, name: '∴' },
        { interval: 6, name: '∶' },  { interval: 7, name: '∶' },  { interval: 8, name: '∶' },
        { interval: 9, name: '·' },  { interval: 10, name: '·' }, { interval: 11, name: '·' },
      ],
      //              R       b2     2         b3     3      4       b5     5        b6      6      b7     7
      colors: [ ALUM_R, LAPIS, IRON_R, ALUM, LAPIS, IRON, ALUM, LAPIS_R, IRON, ALUM, LAPIS, IRON ],
    },
    dim_concentric: {
      name: 'Concentric (⊙  ○  ●  ·)',
      intervals: [
        // Root = most prominent (ring+dot), decreasing to smallest dot
        { interval: 0, name: '⊙' },  { interval: 1, name: '⊙' },  { interval: 2, name: '⊙' },
        { interval: 3, name: '○' },  { interval: 4, name: '○' },  { interval: 5, name: '○' },
        { interval: 6, name: '●' },  { interval: 7, name: '●' },  { interval: 8, name: '●' },
        { interval: 9, name: '·' },  { interval: 10, name: '·' }, { interval: 11, name: '·' },
      ],
      colors: [ ALUM, LAPIS, IRON, ALUM, LAPIS, IRON, ALUM, LAPIS, IRON, ALUM, LAPIS, IRON ],
    },
  },
  'Chromatic: Scale Filter': {
    // Major scale from selected root, but symbols/colors always locked to D's diminished axis.
    // Change root in UI to change key — the dim axis markers stay fixed.
    sf_major: {
      name: 'Major Scale (D Dim Axis)',
      intervals: [
        { interval: 0, name: 'R' }, { interval: 2, name: '2' }, { interval: 4, name: '3' },
        { interval: 5, name: '4' }, { interval: 7, name: '5' }, { interval: 9, name: '6' },
        { interval: 11, name: '7' },
      ],
      colors: [ ALUM, ALUM, ALUM, ALUM, ALUM, ALUM, ALUM ], // placeholder, fixedMap overrides
      fixedRoot: 'D',
      fixedMap: [
        // D=0   Eb=1   E=2    F=3    F#=4   G=5    Ab=6   A=7    Bb=8   B=9    C=10   C#=11
        { name: '⁘', color: ALUM },  { name: '⁘', color: LAPIS }, { name: '⁘', color: IRON },
        { name: '∴', color: ALUM },  { name: '∴', color: LAPIS }, { name: '∴', color: IRON },
        { name: '∶', color: ALUM },  { name: '∶', color: LAPIS }, { name: '∶', color: IRON },
        { name: '·', color: ALUM },  { name: '·', color: LAPIS }, { name: '·', color: IRON },
      ],
    },
  },
};

// Flatten structures for easy access
export const STRUCTURES: Record<string, Structure> = {};
Object.values(CHORDS_BASE).forEach(category => Object.entries(category).forEach(([key, value]) => STRUCTURES[key] = value));
Object.values(FIVE_NOTE_CHORDS).forEach(category => Object.entries(category).forEach(([key, value]) => STRUCTURES[key] = value));
Object.values(CHROMATIC_SCALES).forEach(category => Object.entries(category).forEach(([key, value]) => STRUCTURES[key] = value));

// Assign colors to all structures
Object.values(CHORDS_BASE).forEach(category => Object.values(category).forEach(assignColors));
Object.values(FIVE_NOTE_CHORDS).forEach(category => Object.values(category).forEach(assignColors));
Object.values(CHROMATIC_SCALES).forEach(category => Object.values(category).forEach(assignColors));

export const CATEGORIZED_STRUCTURES = { ...CHORDS_BASE, ...FIVE_NOTE_CHORDS, ...CHROMATIC_SCALES };

export const SCALE_NAME_OVERRIDES: Record<string, string> = {
  '2781': 'Maj9 Diminished (6 on 5th)',
  '3501': 'm7 Diminished (6 on b3)',
  '3437': 'm7b5 Diminished (m6 on b3)',
  '1773': '7sus4 Diminished (6 on b7)',
  '1757': 'Dom9 Diminished (m6 on 5th)',
  '1883': '7alt Diminished (m6 on b2)',
};