
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Fretboard from './components/Fretboard';
import Controls from './components/Controls';
import { TUNINGS, KEYS, FRET_COUNT, STRUCTURES, COLOR_PALETTE, RING_COLOR_PALETTE, SARGAM_NAMES, INTERVAL_NAMES, INTERVAL_COLORS } from './constants';
import type { Tuning, HighlightedNote, Color, RingColor, StructureLabelType, StructureKey, SavedPattern, Structure, StringGroup, Instrument, HexatonicPatternId } from './types';
import { getNoteOnFret, getIntervalFromRoot, midiToFrequency, noteToMidi } from './utils/music';
import { HEXATONIC_PATTERNS } from './constants';
import { playNote } from './utils/audio';
import { exportFretboardToPng } from './utils/export';

// Create a map of interval combinations to structure names for quick lookups.
const structureIntervalsMap = new Map<string, string>();
for (const key in STRUCTURES) {
    const structure = STRUCTURES[key];
    const intervals = structure.intervals.map(i => i.interval % 12);
    if (new Set(intervals).size < 3) continue;
    const sortedIntervals = [...new Set(intervals)].sort((a: number, b: number) => a - b);
    const intervalKey = sortedIntervals.join(',');
    structureIntervalsMap.set(intervalKey, structure.name);
}

const KEY_MAPPING = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];

const App: React.FC = () => {
  const [tuning, setTuning] = useState<Tuning>(TUNINGS.allFourths);
  const [rootNote, setRootNote] = useState<string>('G');
  const [globalStructure, setGlobalStructure] = useState<StructureKey>('major9');
  const [visibleIntervals, setVisibleIntervals] = useState<Set<number>>(new Set());
  const [structureLabelType, setStructureLabelType] = useState<StructureLabelType>('interval');
  const [manualNotes, setManualNotes] = useState<Record<string, { color: Color, ring: RingColor }>>({});
  const [currentColor, setCurrentColor] = useState<Color>(COLOR_PALETTE[0]);
  const [currentRing, setCurrentRing] = useState<RingColor>(RING_COLOR_PALETTE[0]);
  const [savedPatterns, setSavedPatterns] = useState<SavedPattern[]>([]);
  const [customStructures, setCustomStructures] = useState<Record<string, Structure>>({});
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [instrument, setInstrument] = useState<Instrument>('sine');
  const [playingKeys, setPlayingKeys] = useState(new Set<string>());
  const [hexatonicPattern, setHexatonicPattern] = useState<HexatonicPatternId>('triad_pair_v_vi');
  
  // Advanced Mode State
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [stringGroups, setStringGroups] = useState<StringGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedPatterns = localStorage.getItem('guitar_patterns');
      if (storedPatterns) {
        setSavedPatterns(JSON.parse(storedPatterns));
      }
    } catch (error) {
      console.error("Failed to load patterns from localStorage", error);
    }
    try {
      const storedStructures = localStorage.getItem('guitar_structures');
      if (storedStructures) {
        setCustomStructures(JSON.parse(storedStructures));
      }
    } catch (error) {
      console.error("Failed to load custom structures from localStorage", error);
    }
  }, []);

  const allStructures = useMemo((): Record<string, Structure> => {
    return { ...STRUCTURES, ...customStructures };
  }, [customStructures]);

  const activeGroup = useMemo(() => {
    if (!isAdvancedMode || !activeGroupId) return null;
    return stringGroups.find(g => g.id === activeGroupId);
  }, [isAdvancedMode, activeGroupId, stringGroups]);

  // Sync state when toggling advanced mode or changing tuning
  useEffect(() => {
    if (isAdvancedMode) {
      const defaultStructure = allStructures[globalStructure];
      if (!defaultStructure) return;
      
      // Ensure tuning and strings exist before accessing length
      if (!tuning || !tuning.strings) return;

      const defaultVisibleIntervals = new Set<number>(defaultStructure.intervals.map(i => i.interval % 12));
      const newGroup: StringGroup = {
        id: `group_${Date.now()}`,
        name: 'Group 1',
        strings: Array.from({ length: tuning.strings.length }, (_, i) => i),
        rootNote: rootNote,
        structureKey: globalStructure,
        visibleIntervals: defaultVisibleIntervals,
        fretRange: { start: 0, end: FRET_COUNT },
      };
      setStringGroups([newGroup]);
      setActiveGroupId(newGroup.id);
    } else {
      setStringGroups([]);
      setActiveGroupId(null);
    }
  }, [isAdvancedMode, tuning?.strings?.length, allStructures, globalStructure, rootNote]);

  // Update visible intervals for the global structure (normal mode)
  useEffect(() => {
    if (!isAdvancedMode) {
      const structure = allStructures[globalStructure];
      if (structure) {
          const structureInts = structure.intervals.map(i => i.interval % 12);
          setVisibleIntervals(new Set(structureInts));
      }
    }
  }, [globalStructure, allStructures, isAdvancedMode]);

  const detectedStructureName = useMemo(() => {
    const intervalsToScan = isAdvancedMode ? activeGroup?.visibleIntervals : visibleIntervals;
    if (!intervalsToScan || intervalsToScan.size < 3) return null;

    const sortedVisible = [...intervalsToScan].sort((a, b) => a - b);
    const currentKey = sortedVisible.join(',');
    return structureIntervalsMap.get(currentKey) || null;
  }, [visibleIntervals, isAdvancedMode, activeGroup]);


  const updatePatternsLocalStorage = (patterns: SavedPattern[]) => {
    try {
      localStorage.setItem('guitar_patterns', JSON.stringify(patterns));
    } catch (error) {
      console.error("Failed to save patterns to localStorage", error);
    }
  };

  const updateStructuresLocalStorage = (structures: Record<string, Structure>) => {
    try {
      localStorage.setItem('guitar_structures', JSON.stringify(structures));
    } catch (error) { 
      console.error("Failed to save structures to localStorage", error);
    }
  };

  const savePattern = (name: string) => {
    const newPattern: SavedPattern = {
      id: Date.now().toString(),
      name,
      manualNotes,
      rootNote,
      tuning,
    };
    const updatedPatterns = [...savedPatterns, newPattern];
    setSavedPatterns(updatedPatterns);
    updatePatternsLocalStorage(updatedPatterns);
  };

  const loadPattern = (patternId: string) => {
    const patternToLoad = savedPatterns.find(p => p.id === patternId);
    if (patternToLoad) {
      setManualNotes(patternToLoad.manualNotes);
      setRootNote(patternToLoad.rootNote);
      // Ensure tuning is valid before setting
      if (patternToLoad.tuning && Array.isArray(patternToLoad.tuning.strings)) {
        setTuning(patternToLoad.tuning);
      } else {
        console.warn("Loaded pattern has invalid tuning data, falling back to current tuning.");
      }
    }
  };

  const deletePattern = (patternId: string) => {
    const updatedPatterns = savedPatterns.filter(p => p.id !== patternId);
    setSavedPatterns(updatedPatterns);
    updatePatternsLocalStorage(updatedPatterns);
  };

  const saveCustomStructure = (name: string) => {
    const intervalsToSave = isAdvancedMode ? activeGroup?.visibleIntervals : visibleIntervals;
    if (!intervalsToSave || intervalsToSave.size === 0) return;

    // Fix: Explicitly cast to number[] to handle type inference issues with Set conversion and arithmetic operations on line 113.
    const sortedIntervals = Array.from(intervalsToSave).map(i => i as number).sort((a: number, b: number) => a - b);
    const newId = `custom_${Date.now()}`;
    const newStructure: Structure = {
      name,
      // Fix: Ensure correct mapping of interval names and colors from sorted numeric intervals on lines 117-118.
      intervals: sortedIntervals.map(interval => ({
        interval: interval,
        name: INTERVAL_NAMES[interval],
      })),
      colors: sortedIntervals.map((interval: number) => INTERVAL_COLORS[interval % 12]),
    };

    const updatedStructures = { ...customStructures, [newId]: newStructure };
    setCustomStructures(updatedStructures);
    updateStructuresLocalStorage(updatedStructures);
    
    if (isAdvancedMode && activeGroupId) {
      updateGroup(activeGroupId, { structureKey: newId });
    } else {
      setGlobalStructure(newId);
    }
  };
  
  const deleteCustomStructure = (id: string) => {
    const wasActiveStructure = globalStructure === id || stringGroups.some(g => g.structureKey === id);

    const updatedStructures = { ...customStructures };
    delete updatedStructures[id];
    setCustomStructures(updatedStructures);
    updateStructuresLocalStorage(updatedStructures);
    
    if (wasActiveStructure) {
      if (globalStructure === id) setGlobalStructure('major9');
      setStringGroups(prev => prev.map(g => g.structureKey === id ? { ...g, structureKey: 'major9' } : g));
    }
  };

  const toggleIntervalVisibility = useCallback((interval: number) => {
    if (isAdvancedMode && activeGroupId) {
      const newStringGroups = stringGroups.map(g => {
        if (g.id === activeGroupId) {
          const newIntervals = new Set(g.visibleIntervals);
          if (newIntervals.has(interval)) {
            newIntervals.delete(interval);
          } else {
            newIntervals.add(interval);
          }
          return { ...g, visibleIntervals: newIntervals };
        }
        return g;
      });
      setStringGroups(newStringGroups);
    } else {
      const newSet = new Set(visibleIntervals);
      if (newSet.has(interval)) {
        newSet.delete(interval);
      } else {
        newSet.add(interval);
      }
      setVisibleIntervals(newSet);
    }
  }, [isAdvancedMode, activeGroupId, stringGroups, visibleIntervals]);
  
  const setAllIntervalsVisibility = useCallback((visible: boolean) => {
    const newSet = visible ? new Set(Array.from({ length: 12 }, (_, i) => i)) : new Set<number>();
    if (isAdvancedMode && activeGroupId) {
      const newStringGroups = stringGroups.map(g => 
        g.id === activeGroupId ? { ...g, visibleIntervals: newSet } : g
      );
      setStringGroups(newStringGroups);
    } else {
      setVisibleIntervals(newSet);
    }
  }, [isAdvancedMode, activeGroupId, stringGroups]);

  const addGroup = () => {
    const newGroup: StringGroup = {
      id: `group_${Date.now()}`,
      name: `Group ${stringGroups.length + 1}`,
      strings: [],
      rootNote: rootNote,
      structureKey: globalStructure,
      visibleIntervals: new Set(allStructures[globalStructure].intervals.map(i => i.interval % 12)),
      fretRange: { start: 0, end: FRET_COUNT },
    };
    setStringGroups([...stringGroups, newGroup]);
    setActiveGroupId(newGroup.id);
  };

  const deleteGroup = (id: string) => {
    setStringGroups(prev => prev.filter(g => g.id !== id));
    if (activeGroupId === id) {
      setActiveGroupId(stringGroups.length > 1 ? stringGroups.find(g => g.id !== id)!.id : null);
    }
  };

  const updateGroup = (id: string, newProps: Partial<StringGroup>) => {
    setStringGroups(prev => prev.map(g => {
      if (g.id === id) {
        const updatedGroup = { ...g, ...newProps };
        if (newProps.structureKey) {
          const newStructure = allStructures[newProps.structureKey];
          if (newStructure) {
            updatedGroup.visibleIntervals = new Set(newStructure.intervals.map(i => i.interval % 12));
          }
        }
        return updatedGroup;
      }
      return g;
    }));
  };
  
  const toggleStringInGroup = (groupId: string, stringIndex: number) => {
    setStringGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        const newStrings = g.strings.includes(stringIndex)
          ? g.strings.filter(s => s !== stringIndex)
          : [...g.strings, stringIndex].sort((a, b) => a - b);
        return { ...g, strings: newStrings };
      }
      return g;
    }));
  };

  const setAllStringsForGroup = useCallback((groupId: string, assign: boolean) => {
    if (!tuning?.strings) return;
    const len = tuning.strings.length;
    setStringGroups(prev => {
      const allStringIndexes = Array.from({ length: len }, (_, i) => i);
      return prev.map(g => {
        if (g.id === groupId) {
          return { ...g, strings: assign ? allStringIndexes : [] };
        }
        return g;
      });
    });
  }, [tuning]);

  const handleNoteClick = useCallback((stringIndex: number, fret: number) => {
    if (isSoundEnabled) {
      if (!tuning || !tuning.strings) return;
      const openString = tuning.strings[stringIndex];
      const noteInfo = getNoteOnFret(openString, fret);
      if (noteInfo.midi) {
        const frequency = midiToFrequency(noteInfo.midi);
        playNote(frequency, instrument);
      }
    } else {
      const key = `${stringIndex}-${fret}`;
      setManualNotes(prev => {
        const newNotes = { ...prev };
        if (newNotes[key]) delete newNotes[key];
        else newNotes[key] = { color: currentColor, ring: currentRing };
        return newNotes;
      });
    }
  }, [currentColor, currentRing, isSoundEnabled, tuning, instrument]);


  const highlightedNotes = useMemo(() => {
    const notes: Record<string, HighlightedNote> = {};

    if (isAdvancedMode) {
      stringGroups.forEach(group => {
        const structure = allStructures[group.structureKey] || allStructures['major9'];
        const groupIntervalsInfo: Record<number, { name: string, color: Color }> = {};
        structure.intervals.forEach((interval, index) => {
          groupIntervalsInfo[interval.interval % 12] = { name: interval.name, color: structure.colors[index] };
        });

        group.strings.forEach(stringIndex => {
          const openNote = tuning.strings[stringIndex];
          for (let fret = group.fretRange.start; fret <= group.fretRange.end; fret++) {
            const noteInfo = getNoteOnFret(openNote, fret);
            
            // Check if note is part of the structure relative to the GROUP's root
            const intervalWithinGroup = getIntervalFromRoot(noteInfo.name, group.rootNote);
            
            if (group.visibleIntervals.has(intervalWithinGroup)) {
              // Get color from the local group structure's function
              const info = groupIntervalsInfo[intervalWithinGroup];
              const color = info ? info.color : { bgColor: 'bg-slate-600', textColor: 'text-white' };
              
              // Get the label by calculating interval from the GLOBAL root
              const intervalFromGlobalRoot = getIntervalFromRoot(noteInfo.name, rootNote);
              let label: string;
              switch (structureLabelType) {
                case 'noteName': label = noteInfo.displayName; break;
                case 'sargam': label = SARGAM_NAMES[intervalFromGlobalRoot]; break;
                default: label = INTERVAL_NAMES[intervalFromGlobalRoot]; break;
              }
              notes[`${stringIndex}-${fret}`] = { label, ...color };
            }
          }
        });
      });
    } else {
      const structure = allStructures[globalStructure];
      const structureIntervalsInfo: Record<number, { name: string, color: Color }> = {};
      structure.intervals.forEach((interval, index) => {
          structureIntervalsInfo[interval.interval % 12] = { name: interval.name, color: structure.colors[index] };
      });

      // Check if we're using hexatonic with a visualization pattern
      const activePattern = globalStructure === 'hexatonic_no4' && hexatonicPattern !== 'default'
        ? HEXATONIC_PATTERNS.find(p => p.id === hexatonicPattern)
        : null;

      // Safety check for tuning strings
      if (tuning && tuning.strings) {
        tuning.strings.forEach((openNote, stringIndex) => {
          for (let fret = 0; fret <= FRET_COUNT; fret++) {
            const noteInfo = getNoteOnFret(openNote, fret);
            const numericInterval = getIntervalFromRoot(noteInfo.name, rootNote);
            if (visibleIntervals.has(numericInterval)) {
              const info = structureIntervalsInfo[numericInterval];

              // Determine color: use pattern colors if active, otherwise use default interval colors
              let color: Color;
              if (activePattern) {
                if (activePattern.groupA.intervals.includes(numericInterval)) {
                  color = activePattern.groupA.color;
                } else if (activePattern.groupB.intervals.includes(numericInterval)) {
                  color = activePattern.groupB.color;
                } else {
                  color = info ? info.color : { bgColor: 'bg-slate-600', textColor: 'text-white' };
                }
              } else {
                color = info ? info.color : { bgColor: 'bg-slate-600', textColor: 'text-white' };
              }

              let label: string;
              switch (structureLabelType) {
                case 'noteName': label = noteInfo.displayName; break;
                case 'sargam': label = SARGAM_NAMES[numericInterval]; break;
                default: label = info ? info.name : INTERVAL_NAMES[numericInterval]; break;
              }
              notes[`${stringIndex}-${fret}`] = { label, ...color };
            }
          }
        });
      }
    }

    if (tuning && tuning.strings) {
      for (const key in manualNotes) {
        const [stringIndex, fret] = key.split('-').map(Number);
        if (stringIndex < tuning.strings.length) {
          const noteInfo = getNoteOnFret(tuning.strings[stringIndex], fret);
          // Fix: Explicitly cast manualNote to prevent unknown type property errors on line 278.
          const manualNote = manualNotes[key] as { color: Color, ring: RingColor };
          
          // Calculate interval from GLOBAL root for the label
          const numericInterval = getIntervalFromRoot(noteInfo.name, rootNote);
          let label: string;
          switch (structureLabelType) {
            case 'noteName': label = noteInfo.displayName; break;
            case 'sargam': label = SARGAM_NAMES[numericInterval]; break;
            default: label = INTERVAL_NAMES[numericInterval]; break;
          }
          notes[key] = { label, ...manualNote.color, ringClassName: manualNote.ring.ringClassName };
        }
      }
    }

    return notes;
  }, [rootNote, tuning, manualNotes, structureLabelType, allStructures, isAdvancedMode, stringGroups, globalStructure, visibleIntervals, hexatonicPattern]);
  
  const resetManualNotes = useCallback(() => setManualNotes({}), []);

  const scaleNotesForKeyboard = useMemo(() => {
    if (!isSoundEnabled) return [];

    let intervalsToUse: Set<number> | undefined;
    let rootNoteToUse: string;

    if (isAdvancedMode) {
      const currentActiveGroup = stringGroups.find(g => g.id === activeGroupId);
      if (currentActiveGroup) {
        intervalsToUse = currentActiveGroup.visibleIntervals;
        rootNoteToUse = currentActiveGroup.rootNote;
      } else {
        intervalsToUse = visibleIntervals;
        rootNoteToUse = rootNote;
      }
    } else {
      intervalsToUse = visibleIntervals;
      rootNoteToUse = rootNote;
    }

    if (!intervalsToUse || intervalsToUse.size === 0) return [];

    const baseOctave = 3;
    const rootMidiStart = noteToMidi(`${rootNoteToUse}${baseOctave}`);
    if (rootMidiStart === null) return [];

    const sortedIntervals = [...intervalsToUse].sort((a, b) => a - b);

    const notes: number[] = [];
    for (let octave = 0; octave < 4; octave++) {
      for (const interval of sortedIntervals) {
        notes.push(rootMidiStart + interval + (octave * 12));
      }
    }
    return notes;
  }, [isSoundEnabled, isAdvancedMode, stringGroups, activeGroupId, visibleIntervals, rootNote]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || event.metaKey || event.ctrlKey || event.altKey) {
            return;
        }
        if (!isSoundEnabled || event.repeat) return;

        const key = event.key.toLowerCase();
        const keyIndex = KEY_MAPPING.indexOf(key);

        if (keyIndex !== -1 && keyIndex < scaleNotesForKeyboard.length) {
            event.preventDefault();
            setPlayingKeys(prev => {
                if (prev.has(key)) return prev;
                
                const midiNote = scaleNotesForKeyboard[keyIndex];
                const frequency = midiToFrequency(midiNote);
                playNote(frequency, instrument);

                const newSet = new Set(prev);
                newSet.add(key);
                return newSet;
            });
        }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        setPlayingKeys(prev => {
            if (!prev.has(key)) return prev;
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
        });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSoundEnabled, scaleNotesForKeyboard, instrument]);

  const handleExport = useCallback(() => {
    // FIX: Safely convert Set to Array using Array.from and handle potential null/undefined for arithmetic operations on line 319.
    const intervalSet = isAdvancedMode ? activeGroup?.visibleIntervals : visibleIntervals;
    const intervalsArray = (intervalSet ? Array.from(intervalSet) : []) as number[];
    const currentIntervals = intervalsArray.sort((a: number, b: number) => a - b).map((i: number) => INTERVAL_NAMES[i]);
    
    // Safety check for tuning
    if (!tuning || !tuning.strings) return;

    let currentStructureName = detectedStructureName;
    
    if (!currentStructureName) {
      const activeStructureKey = isAdvancedMode ? activeGroup?.structureKey : globalStructure;
      if (activeStructureKey) {
        currentStructureName = allStructures[activeStructureKey]?.name || 'Custom Pattern';
      } else {
        currentStructureName = 'Custom Pattern';
      }
    }

    if (isAdvancedMode && activeGroup) {
      currentStructureName = `${activeGroup.name}: ${currentStructureName}`;
    }

    exportFretboardToPng({
      tuning,
      highlightedNotes,
      structureName: currentStructureName,
      intervals: currentIntervals,
      rootNote: isAdvancedMode && activeGroup ? activeGroup.rootNote : rootNote
    });
  }, [tuning, highlightedNotes, detectedStructureName, isAdvancedMode, activeGroup, globalStructure, allStructures, visibleIntervals, rootNote]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 md:p-8 flex flex-col">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-tight">Interactive Guitar Fretboard</h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">Visualize chord structures and create your own patterns.</p>
      </header>
      
      <main className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        <Controls
          tuning={tuning}
          setTuning={setTuning}
          rootNote={rootNote}
          setRootNote={setRootNote}
          selectedStructure={globalStructure}
          setSelectedStructure={setGlobalStructure}
          visibleIntervals={isAdvancedMode ? (activeGroup?.visibleIntervals ?? new Set()) : visibleIntervals}
          toggleIntervalVisibility={toggleIntervalVisibility}
          setAllIntervalsVisibility={setAllIntervalsVisibility}
          structureLabelType={structureLabelType}
          setStructureLabelType={setStructureLabelType}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          currentRing={currentRing}
          setCurrentRing={setCurrentRing}
          resetManualNotes={resetManualNotes}
          savedPatterns={savedPatterns}
          onSavePattern={savePattern}
          onLoadPattern={loadPattern}
          onDeletePattern={deletePattern}
          customStructures={customStructures}
          onSaveCustomStructure={saveCustomStructure}
          onDeleteCustomStructure={deleteCustomStructure}
          detectedStructureName={detectedStructureName}
          isAdvancedMode={isAdvancedMode}
          setIsAdvancedMode={setIsAdvancedMode}
          stringGroups={stringGroups}
          activeGroupId={activeGroupId}
          setActiveGroupId={setActiveGroupId}
          addGroup={addGroup}
          deleteGroup={deleteGroup}
          updateGroup={updateGroup}
          toggleStringInGroup={toggleStringInGroup}
          setAllStringsForGroup={setAllStringsForGroup}
          isSoundEnabled={isSoundEnabled}
          setIsSoundEnabled={setIsSoundEnabled}
          instrument={instrument}
          setInstrument={setInstrument}
          onExport={handleExport}
          hexatonicPattern={hexatonicPattern}
          setHexatonicPattern={setHexatonicPattern}
        />
        <Fretboard
          tuning={tuning}
          highlightedNotes={highlightedNotes}
          onNoteClick={handleNoteClick}
        />
      </main>

       <footer className="text-center mt-12 text-gray-500 text-sm">
        <p>Built with React, TypeScript, and Tailwind CSS. Explore music theory interactively.</p>
      </footer>
    </div>
  );
};

export default App;
