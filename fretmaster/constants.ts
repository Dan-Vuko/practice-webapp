
import type { Tuning, Color, RingColor, Structure, HighlightedNote } from './types';

export const FRET_COUNT = 15;

export const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SARGAM_NAMES = ['S', 'r', 'R', 'g', 'G', 'm', 'M', 'P', 'd', 'D', 'n', 'N'];

export const INTERVAL_NAMES = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];

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
  standard: {
    name: 'Standard (EADGBe)',
    strings: ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'],
  },
  allFourths: {
    name: 'All Fourths (EADGCF)',
    strings: ['F4', 'C4', 'G3', 'D3', 'A2', 'E2'],
  },
  allFifths: {
    name: 'All Fifths (CGDAEB)',
    strings: ['B4', 'E4', 'A3', 'D3', 'G2', 'C2'],
  },
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
    structure.colors = structure.intervals.map(i => INTERVAL_COLORS[i.interval % 12]);
    return structure;
};

// Base structure definitions
const CHORDS_BASE: Record<string, Record<string, Structure>> = {
  'Triads & Foundational': {
    major: { name: 'Major Triad', intervals: [ { interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' } ], colors: [] },
    minor: { name: 'Minor Triad', intervals: [ { interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 7, name: '5' } ], colors: [] },
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
  'Scales & Modes': {
    major_scale: { name: 'Major Scale (Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })), colors: [] },
    minor_scale: { name: 'Natural Minor (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })), colors: [] },
    major_pentatonic: { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })), colors: [] },
    minor_pentatonic: { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })), colors: [] },
    blues: { name: 'Blues Scale', intervals: [0, 3, 5, 6, 7, 10].map(i => ({ interval: i, name: i === 6 ? 'b5' : INTERVAL_NAMES[i] })), colors: [] },
    hexatonic_no4: { name: 'Hexatonic (no 4th)', intervals: [0, 2, 4, 7, 9, 11].map(i => ({ interval: i, name: INTERVAL_NAMES[i] })), colors: [] },
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
  '5-Note: 11th/13th Extensions': {
    min11: { name: 'Minor 11', intervals: [{ interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 7, name: '5' }, { interval: 10, name: 'b7' }, { interval: 17, name: '11' }], colors: [] },
    dom11: { name: 'Dominant 11', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 10, name: 'b7' }, { interval: 17, name: '11' }], colors: [] },
    maj11: { name: 'Major 11', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 11, name: '7' }, { interval: 17, name: '11' }], colors: [] },
    dom13: { name: 'Dominant 13', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 10, name: 'b7' }, { interval: 17, name: '11' }, { interval: 21, name: '13' }], colors: [] },
    min13: { name: 'Minor 13', intervals: [{ interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 10, name: 'b7' }, { interval: 17, name: '11' }, { interval: 21, name: '13' }], colors: [] },
    dom7add9add13: { name: 'Dominant 7(add 9, 13)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 10, name: 'b7' }, { interval: 14, name: '9' }, { interval: 21, name: '13' }], colors: [] },
  },
  '5-Note: Altered 5th': {
    dom9sharp5: { name: 'Dominant 9(#5)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 8, name: '#5' }, { interval: 10, name: 'b7' }, { interval: 14, name: '9' }], colors: [] },
    dom9b5: { name: 'Dominant 9(b5)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 6, name: 'b5' }, { interval: 10, name: 'b7' }, { interval: 14, name: '9' }], colors: [] },
    maj9sharp5: { name: 'Major 9(#5)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 8, name: '#5' }, { interval: 11, name: '7' }, { interval: 14, name: '9' }], colors: [] },
    maj9b5: { name: 'Major 9(b5)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 6, name: 'b5' }, { interval: 11, name: '7' }, { interval: 14, name: '9' }], colors: [] },
    min9sharp5: { name: 'Minor 9(#5)', intervals: [{ interval: 0, name: 'R' }, { interval: 3, name: 'b3' }, { interval: 8, name: '#5' }, { interval: 10, name: 'b7' }, { interval: 14, name: '9' }], colors: [] },
  },
  '5-Note: Double Alterations': {
    dom7b9b5: { name: 'Dominant 7(b9,b5)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 6, name: 'b5' }, { interval: 10, name: 'b7' }, { interval: 13, name: 'b9' }], colors: [] },
    dom7b9sharp5: { name: 'Dominant 7(b9,#5)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 8, name: '#5' }, { interval: 10, name: 'b7' }, { interval: 13, name: 'b9' }], colors: [] },
    dom7sharp9sharp5: { name: 'Dominant 7(#9,#5)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 8, name: '#5' }, { interval: 10, name: 'b7' }, { interval: 15, name: '#9' }], colors: [] },
    dom7sharp9b5: { name: 'Dominant 7(#9,b5)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 6, name: 'b5' }, { interval: 10, name: 'b7' }, { interval: 15, name: '#9' }], colors: [] },
    maj7sharp5sharp9: { name: 'Major 7(#5,#9)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 8, name: '#5' }, { interval: 11, name: '7' }, { interval: 15, name: '#9' }], colors: [] },
    dom7sharp9sharp11: { name: 'Dominant 7(#9,#11)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 10, name: 'b7' }, { interval: 15, name: '#9' }, { interval: 18, name: '#11' }], colors: [] },
  },
  '5-Note: Suspended': {
    dom9sus4: { name: 'Dominant 9sus4', intervals: [{ interval: 0, name: 'R' }, { interval: 5, name: '4' }, { interval: 7, name: '5' }, { interval: 10, name: 'b7' }, { interval: 14, name: '9' }], colors: [] },
    maj9sus4: { name: 'Major 9sus4', intervals: [{ interval: 0, name: 'R' }, { interval: 5, name: '4' }, { interval: 7, name: '5' }, { interval: 11, name: '7' }, { interval: 14, name: '9' }], colors: [] },
  },
  '5-Note: Hybrid/Polychord': {
    maj9_3_4: { name: 'Major 9(3,4)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 5, name: '4' }, { interval: 11, name: '7' }, { interval: 14, name: '9' }], colors: [] },
    maj9sus6sus: { name: 'Major 9sus/6sus', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 5, name: '4' }, { interval: 9, name: '6' }, { interval: 14, name: '9' }], colors: [] },
    g9sus_ext: { name: 'G9sus extended', intervals: [{ interval: 0, name: 'R' }, { interval: 2, name: '2' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 10, name: 'b7' }], colors: [] },
  },
  '5-Note: Exotic': {
    mystic: { name: 'Mystic Chord *', intervals: [{ interval: 0, name: 'R' }, { interval: 6, name: '#4' }, { interval: 10, name: 'b7' }, { interval: 14, name: '9' }, { interval: 21, name: '13' }], colors: [] },
    maj7b9: { name: 'Major 7(b9)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 11, name: '7' }, { interval: 13, name: 'b9' }], colors: [] },
  },
  '5-Note: Clusters': {
    whole_tone_penta: { name: 'Whole Tone Pentachord', intervals: [{ interval: 0, name: 'R' }, { interval: 2, name: '2' }, { interval: 4, name: '3' }, { interval: 6, name: '#4' }, { interval: 8, name: '#5' }], colors: [] },
    semitone_cluster: { name: 'Semitone Cluster', intervals: [{ interval: 0, name: 'R' }, { interval: 1, name: 'b2' }, { interval: 3, name: 'b3' }, { interval: 5, name: '4' }, { interval: 6, name: 'b5' }], colors: [] },
  },
  '5-Note: Augmented Scale Subsets': {
    augSub1: { name: 'Major 7(#5,#9)', intervals: [{ interval: 0, name: 'R' }, { interval: 3, name: '#9' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 8, name: 'b13' }], colors: [] },
    augSub2: { name: 'Major 7(add 3)', intervals: [{ interval: 0, name: 'R' }, { interval: 3, name: '#9' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 11, name: '7' }], colors: [] },
    augSub4: { name: 'Major 7(b13, #9)', intervals: [{ interval: 0, name: 'R' }, { interval: 3, name: '#9' }, { interval: 7, name: '5' }, { interval: 8, name: 'b13' }, { interval: 11, name: '7' }], colors: [] },
    augSub5: { name: 'Major 7(b13)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 8, name: 'b13' }, { interval: 11, name: '7' }], colors: [] },
  },
  '5-Note: Mystic Mode Subsets': {
    mysticSub1: { name: 'Major 6/9#11 (no 5th)', intervals: [{ interval: 0, name: 'R' }, { interval: 2, name: '9' }, { interval: 4, name: '3' }, { interval: 6, name: '#11' }, { interval: 9, name: '13' }], colors: [] },
    mysticSub2: { name: 'Major 9#11 (no 5th)', intervals: [{ interval: 0, name: 'R' }, { interval: 2, name: '9' }, { interval: 4, name: '3' }, { interval: 6, name: '#11' }, { interval: 11, name: '7' }], colors: [] },
    mysticSub3: { name: 'Major 13 (no 5, no 11)', intervals: [{ interval: 0, name: 'R' }, { interval: 2, name: '9' }, { interval: 4, name: '3' }, { interval: 9, name: '13' }, { interval: 11, name: '7' }], colors: [] },
    mysticSub4: { name: 'Major 7(6/9)#11sus2', intervals: [{ interval: 0, name: 'R' }, { interval: 2, name: '9' }, { interval: 6, name: '#11' }, { interval: 9, name: '13' }, { interval: 11, name: '7' }], colors: [] },
    mysticSub5: { name: 'Major 13#11 (no 5, no 9)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 6, name: '#11' }, { interval: 9, name: '13' }, { interval: 11, name: '7' }], colors: [] },
    mysticSub6: { name: 'Major 6/9 (Mystic Voicing)', intervals: [{ interval: 0, name: 'R' }, { interval: 2, name: '9' }, { interval: 4, name: '3' }, { interval: 7, name: '5' }, { interval: 9, name: '6' }], colors: [] },
  },
  '5-Note: Octatonic Hexachord Subsets': {
    octSub1: { name: '7(b9,#11,13) (no 5, no 7)', intervals: [{ interval: 0, name: 'R' }, { interval: 1, name: 'b9' }, { interval: 4, name: '3' }, { interval: 6, name: '#11' }, { interval: 9, name: '13' }], colors: [] },
    octSub2: { name: 'Major 7(b9)#11 (no 5)', intervals: [{ interval: 0, name: 'R' }, { interval: 1, name: 'b9' }, { interval: 4, name: '3' }, { interval: 6, name: '#11' }, { interval: 11, name: '7' }], colors: [] },
    octSub3: { name: 'Major 7(b9,13)', intervals: [{ interval: 0, name: 'R' }, { interval: 1, name: 'b9' }, { interval: 4, name: '3' }, { interval: 9, name: '13' }, { interval: 11, name: '7' }], colors: [] },
    octSub4: { name: 'Major 7(b9,#11,13)sus', intervals: [{ interval: 0, name: 'R' }, { interval: 1, name: 'b9' }, { interval: 6, name: '#11' }, { interval: 9, name: '13' }, { interval: 11, name: '7' }], colors: [] },
    octSub5: { name: 'Major 13#11 (Octatonic)', intervals: [{ interval: 0, name: 'R' }, { interval: 4, name: '3' }, { interval: 6, name: '#11' }, { interval: 9, name: '13' }, { interval: 11, name: '7' }], colors: [] },
    octSub6: { name: '9sus (no 7)', intervals: [{ interval: 0, name: 'R' }, { interval: 2, name: '2' }, { interval: 5, name: '4' }, { interval: 7, name: '5' }, { interval: 9, name: '6' }], colors: [] },
  }
};

// Flatten structures for easy access
export const STRUCTURES: Record<string, Structure> = {};
Object.values(CHORDS_BASE).forEach(category => Object.entries(category).forEach(([key, value]) => STRUCTURES[key] = value));
Object.values(FIVE_NOTE_CHORDS).forEach(category => Object.entries(category).forEach(([key, value]) => STRUCTURES[key] = value));

// Assign colors to all structures
Object.values(CHORDS_BASE).forEach(category => Object.values(category).forEach(assignColors));
Object.values(FIVE_NOTE_CHORDS).forEach(category => Object.values(category).forEach(assignColors));

export const CATEGORIZED_STRUCTURES = { ...CHORDS_BASE, ...FIVE_NOTE_CHORDS };

// Visualization patterns for hexatonic scale (1, 2, 3, 5, 6, 7)
// Each pattern defines two groups of intervals with distinct colors
export interface VisualizationPattern {
  id: string;
  name: string;
  description: string;
  groupA: {
    intervals: number[];  // semitone intervals
    color: Color;
  };
  groupB: {
    intervals: number[];
    color: Color;
  };
}

export const HEXATONIC_PATTERNS: VisualizationPattern[] = [
  {
    id: 'default',
    name: 'Default (Interval Colors)',
    description: 'Standard interval-based coloring',
    groupA: { intervals: [], color: { bgColor: '', textColor: '' } },
    groupB: { intervals: [], color: { bgColor: '', textColor: '' } },
  },
  {
    id: 'triad_pair_v_vi',
    name: 'V + vi Triad Pair',
    description: 'G major (5,7,2) + A minor (6,1,3)',
    groupA: {
      intervals: [7, 11, 2],  // 5, 7, 2 (G major: G-B-D)
      color: { bgColor: 'bg-blue-500', textColor: 'text-white' },
    },
    groupB: {
      intervals: [9, 0, 4],   // 6, 1, 3 (A minor: A-C-E)
      color: { bgColor: 'bg-red-500', textColor: 'text-white' },
    },
  },
  {
    id: 'cluster_1_2_3__5_6_7',
    name: 'Cluster {1,2,3} + {5,6,7}',
    description: 'Adjacent scale tone clusters',
    groupA: {
      intervals: [0, 2, 4],   // 1, 2, 3
      color: { bgColor: 'bg-emerald-500', textColor: 'text-white' },
    },
    groupB: {
      intervals: [7, 9, 11],  // 5, 6, 7
      color: { bgColor: 'bg-orange-500', textColor: 'text-white' },
    },
  },
  {
    id: 'cluster_2_3_5__6_7_1',
    name: 'Cluster {2,3,5} + {6,7,1}',
    description: 'Rotated cluster pair',
    groupA: {
      intervals: [2, 4, 7],   // 2, 3, 5
      color: { bgColor: 'bg-cyan-500', textColor: 'text-white' },
    },
    groupB: {
      intervals: [9, 11, 0],  // 6, 7, 1
      color: { bgColor: 'bg-fuchsia-500', textColor: 'text-white' },
    },
  },
  {
    id: 'cluster_3_5_6__7_1_2',
    name: 'Cluster {3,5,6} + {7,1,2}',
    description: 'Rotated cluster pair',
    groupA: {
      intervals: [4, 7, 9],   // 3, 5, 6
      color: { bgColor: 'bg-amber-400', textColor: 'text-black' },
    },
    groupB: {
      intervals: [11, 0, 2],  // 7, 1, 2
      color: { bgColor: 'bg-violet-500', textColor: 'text-white' },
    },
  },
];
