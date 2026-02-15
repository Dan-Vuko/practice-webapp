export interface Tuning {
  name: string;
  strings: string[];
}

export interface Color {
  bgColor: string;
  textColor: string;
  ringClassName?: string;
}

export interface RingColor {
  name: string;
  ringClassName: string;
  swatchClassName: string;
}

export interface HighlightedNote {
  label: string;
  bgColor: string;
  textColor: string;
  ringClassName?: string;
  dotSize?: 'small';
  isDiffShared?: boolean;
}

export type StructureLabelType = 'interval' | 'noteName' | 'sargam' | 'degree';

export interface Structure {
  name: string;
  intervals: { interval: number; name: string }[];
  colors: Color[];
  dotSize?: 'small';
  fixedRoot?: string;  // When set, symbol/color lookup uses interval from this root instead of selected root
  fixedMap?: { name: string; color: Color }[];  // 12-entry chromatic lookup from fixedRoot
}

export type StructureKey = string;

export interface StringGroup {
  id: string;
  name: string;
  strings: number[];
  rootNote: string;
  structureKey: StructureKey;
  visibleIntervals: Set<number>;
  fretRange: { start: number; end: number };
}

export type Instrument = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'pluck';

export interface FretboardTheme {
  id: string;
  name: string;
  woodColor: string;
  fretColor: string;
  nutColor: string;
  markerColor: string;
  labelColor: string;
}

export interface SavedPattern {
  id: string;
  name: string;
  manualNotes: Record<string, { color: Color, ring: RingColor }>;
  rootNote: string;
  tuning: Tuning;
}

export interface FretboardInstance {
  id: string;
  name: string;
  rootNote: string;
  globalStructure: StructureKey;
  visibleIntervals: Set<number>;
  manualNotes: Record<string, { color: Color, ring: RingColor }>;
  structureLabelType: StructureLabelType;
  isAdvancedMode: boolean;
  stringGroups: StringGroup[];
  activeGroupId: string | null;
  showDiff: boolean;
}

export interface CatalogScale {
  n: number;
  name: string;
  pcs: number[];
  iv: number[];
  card: number;
  modes: number;
  prime: boolean;
  primeNum: number;
  sym: boolean;
  modeList: { m: number; n: number; name: string }[];
  directChildren: number[];
  directParents: number[];
  complement: number;
  inverse: number;
}

export interface CatalogData {
  nameMap: Record<string, string>;
  scales: CatalogScale[];
}

export interface CustomPreset {
  id: string;
  name: string;
  description: string;
  fretboards: { name: string; rootNote: string; structureKey: string; pcs: number[] }[];
}

export interface ScaleFilters {
  search: string;
  showPrimeOnly: boolean;
  showSymmetric: boolean;
  showChords: boolean;
  showHexatonic: boolean;
  showBarryHarris: boolean;
  showFavourites: boolean;
  showBiTriadic: boolean;
  showBiTetradic: boolean;
  noteCount: number | null;
  containsTriad: string | null;
  containsTetrad: string | null;
  intervalPattern: string;
}