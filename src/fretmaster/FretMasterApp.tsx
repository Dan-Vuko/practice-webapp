import React, { useState, useMemo, useCallback, useEffect } from 'react';
import FretboardContainer from './components/FretboardContainer';
import Controls from './components/Controls';
import { PlusIcon } from './components/icons/PlusIcon';
import { TUNINGS, FRET_COUNT, STRUCTURES, COLOR_PALETTE, RING_COLOR_PALETTE, SARGAM_NAMES, INTERVAL_NAMES, INTERVAL_COLORS, DEFAULT_THEME, ROMAN_DEGREES } from './constants';
import type { Tuning, HighlightedNote, Color, RingColor, SavedPattern, Structure, StringGroup, Instrument, FretboardInstance } from './types';
import { getNoteOnFret, getIntervalFromRoot, midiToFrequency } from './utils/music';
import { playNote } from './utils/audio';
import { exportFretboardToPng } from './utils/export';

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
});

const App: React.FC = () => {
  // Multi-fretboard state
  const [fretboards, setFretboards] = useState<FretboardInstance[]>([createDefaultFretboard('1')]);
  const [activeFretboardId, setActiveFretboardId] = useState<string>('1');

  // Shared global state
  const [tuning, setTuning] = useState<Tuning>(TUNINGS.daead);
  const [currentColor, setCurrentColor] = useState<Color>(COLOR_PALETTE[0]);
  const [currentRing, setCurrentRing] = useState<RingColor>(RING_COLOR_PALETTE[0]);
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>([]);
  const [customStructures, setCustomStructures] = useState<Record<string, Structure>>({});
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [instrument, setInstrument] = useState<Instrument>('pluck');

  useEffect(() => {
    try {
      const storedPatterns = localStorage.getItem('fretmaster_patterns');
      if (storedPatterns) setSavedPatterns(JSON.parse(storedPatterns));
      const storedStructures = localStorage.getItem('fretmaster_structures');
      if (storedStructures) setCustomStructures(JSON.parse(storedStructures));
    } catch (e) { console.error(e); }
  }, []);

  const allStructures = useMemo((): Record<string, Structure> => ({ ...STRUCTURES, ...customStructures }), [customStructures]);

  const activeFretboard = useMemo(() => {
    return fretboards.find(fb => fb.id === activeFretboardId) || fretboards[0];
  }, [fretboards, activeFretboardId]);

  // Fretboard management functions
  const addFretboard = useCallback(() => {
    if (fretboards.length >= 3) return;
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
              notes[`${stringIndex}-${fret}`] = { label, ...color };
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
      tuning?.strings?.forEach((openNote, stringIndex) => {
        for (let fret = 0; fret <= FRET_COUNT; fret++) {
          const noteInfo = getNoteOnFret(openNote, fret);
          const numericInterval = getIntervalFromRoot(noteInfo.name, fretboard.rootNote);
          if (fretboard.visibleIntervals.has(numericInterval)) {
            const info = structInfo[numericInterval];
            const color = info ? info.color : { bgColor: 'bg-slate-600', textColor: 'text-white' };
            let label: string;
            switch (fretboard.structureLabelType) {
              case 'noteName': label = noteInfo.displayName; break;
              case 'sargam': label = SARGAM_NAMES[numericInterval]; break;
              case 'degree': label = ROMAN_DEGREES[numericInterval]; break;
              default: label = info ? info.name : INTERVAL_NAMES[numericInterval as number]; break;
            }
            notes[`${stringIndex}-${fret}`] = { label, ...color };
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
    return notes;
  }, [tuning, allStructures]);

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
          updateGroup={updateGroup}
          isSoundEnabled={isSoundEnabled}
          setIsSoundEnabled={setIsSoundEnabled}
          instrument={instrument}
          setInstrument={setInstrument}
          onExport={handleExport}
          onStrum={strumAll}
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
              onNoteClick={(sIdx, fret) => {
                const noteInfo = getNoteOnFret(tuning.strings[sIdx], fret);
                if (isSoundEnabled && noteInfo.midi) playNote(midiToFrequency(noteInfo.midi), instrument);
                const key = `${sIdx}-${fret}`;
                const updatedManualNotes = { ...fb.manualNotes };
                if (updatedManualNotes[key]) delete updatedManualNotes[key];
                else updatedManualNotes[key] = { color: currentColor, ring: currentRing };

                setFretboards(prev => prev.map(f =>
                  f.id === fb.id ? { ...f, manualNotes: updatedManualNotes } : f
                ));
              }}
            />
          ))}

          {fretboards.length < 3 && (
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
    </div>
  );
};

export default App;