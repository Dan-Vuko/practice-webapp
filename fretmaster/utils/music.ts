import { ALL_NOTES, NOTE_MAP } from '../constants';

const noteNameRegex = /([A-G]#?b?)/;
const octaveRegex = /(\d+)/;

export const noteToMidi = (note: string): number | null => {
  if (!note) return null;
  const pitchMatch = note.match(noteNameRegex);
  const octaveMatch = note.match(octaveRegex);

  if (!pitchMatch || !octaveMatch) return null;

  const pitchClass = pitchMatch[0];
  const octave = parseInt(octaveMatch[0], 10);
  
  if (!NOTE_MAP[pitchClass]) return null;
  
  const noteIndex = NOTE_MAP[pitchClass].index;
  // MIDI standard: C4 is middle C (MIDI note 60). C0 is MIDI 12.
  return noteIndex + (octave + 1) * 12;
}

export const midiToFrequency = (midi: number): number => {
  // A4 (MIDI 69) is 440 Hz
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export const getNoteOnFret = (openString: string, fret: number): { name: string, displayName: string, midi: number | null } => {
  const openMidi = noteToMidi(openString);

  if (openMidi === null) {
    // Fallback for invalid open string format
    const openNoteIndex = NOTE_MAP[openString]?.index ?? 0;
    const noteIndex = (openNoteIndex + fret) % 12;
    const noteName = ALL_NOTES[noteIndex];
    return { name: noteName, displayName: noteName, midi: null };
  }

  const fretMidi = openMidi + fret;
  const noteIndex = fretMidi % 12;
  const noteName = ALL_NOTES[noteIndex];
  
  // Try to find a display name that matches common usage (e.g. Db for C# root)
  const matchingKey = Object.keys(NOTE_MAP).find(key => NOTE_MAP[key].index === noteIndex && key.length === 2) || noteName;
  const displayName = NOTE_MAP[matchingKey]?.displayName || noteName;

  return { name: noteName, displayName, midi: fretMidi };
};

export const getStructureNotes = (
  rootNote: string,
  intervals: { interval: number; name: string }[]
): Record<string, { interval: string; index: number; numericInterval: number }> => {
  const rootNoteIndex = NOTE_MAP[rootNote].index;
  const notes: Record<string, { interval: string; index: number; numericInterval: number }> = {};
  
  intervals.forEach((item, index) => {
    const noteIndex = (rootNoteIndex + item.interval) % 12;
    const noteName = ALL_NOTES[noteIndex];
    notes[noteName] = { interval: item.name, index, numericInterval: item.interval };
  });

  return notes;
};

export const getIntervalFromRoot = (noteName: string, rootNoteName: string): number => {
  const noteIndex = NOTE_MAP[noteName].index;
  const rootIndex = NOTE_MAP[rootNoteName].index;
  // Calculate the difference in semitones, wrapping around the 12-note scale
  return (noteIndex - rootIndex + 12) % 12;
};