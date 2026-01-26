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

export type StructureLabelType = 'interval' | 'noteName' | 'sargam' | 'degree';

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
}