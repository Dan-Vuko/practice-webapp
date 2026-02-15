
export interface Tuning {
  name: string;
  strings: string[];
}

export interface Color {
  bgColor: string;
  textColor: string;
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
}

export type StructureLabelType = 'interval' | 'noteName' | 'sargam';

export interface Structure {
  name: string;
  intervals: { interval: number; name: string }[];
  colors: Color[];
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

export type Instrument = 'sine' | 'square' | 'sawtooth' | 'triangle';

export type HexatonicPatternId = 'default' | 'triad_pair_v_vi' | 'cluster_1_2_3__5_6_7' | 'cluster_2_3_5__6_7_1' | 'cluster_3_5_6__7_1_2';

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

export interface ScaleFilters {
  search: string;
  showPrimeOnly: boolean;
  showSymmetric: boolean;
  showChords: boolean;
  showHexatonic: boolean;
  showFavourites: boolean;
  noteCount: number | null;
}

export interface SavedPattern {
  id: string;
  name: string;
  manualNotes: Record<string, { color: Color, ring: RingColor }>;
  rootNote: string;
  tuning: Tuning;
}
