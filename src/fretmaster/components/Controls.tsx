
import React, { useState, useMemo } from 'react';
import type { Tuning, Color, RingColor, SavedPattern, Structure, StringGroup, Instrument, FretboardInstance } from '../types';
import { TUNINGS, KEYS, COLOR_PALETTE, STRUCTURES, INTERVAL_NAMES, CATEGORIZED_STRUCTURES, FRET_COUNT } from '../constants';
import { ChevronIcon } from './icons/ChevronIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';

interface ControlsProps {
  activeFretboard: FretboardInstance;
  updateActiveFretboard: (updates: Partial<FretboardInstance>) => void;
  tuning: Tuning;
  setTuning: (tuning: Tuning) => void;
  currentColor: Color | null;
  setCurrentColor: (color: Color | null) => void;
  currentRing: RingColor;
  setCurrentRing: (ring: RingColor) => void;
  savedPatterns: SavedPattern[];
  onSavePattern: (name: string) => void;
  onLoadPattern: (id: string) => void;
  onDeletePattern: (id: string) => void;
  customStructures: Record<string, Structure>;
  onSaveCustomStructure: (name: string) => void;
  onDeleteCustomStructure: (id: string) => void;
  detectedStructureName: string | null;
  updateGroup: (id: string, newProps: Partial<StringGroup>) => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (value: boolean) => void;
  instrument: Instrument;
  setInstrument: (inst: Instrument) => void;
  onExport: () => void;
  onStrum: () => void;
  favorites: string[];
  onToggleFavorite: (structureKey: string) => void;
}

const CollapsibleSection: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }> = ({ title, isOpen, onToggle, children }) => (
  <div className="bg-gray-700/30 rounded-lg transition-all duration-300 border border-gray-700/50 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center px-3 py-2 text-left font-bold text-gray-300 hover:text-cyan-400 hover:bg-gray-700/50 transition-all"
    >
      <span className="text-[11px] tracking-wide uppercase">{title}</span>
      <ChevronIcon className={`w-3 h-3 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
    </button>
    {isOpen && (
      <div className="px-3 py-2 border-t border-gray-700/50 bg-gray-800/20">
        {children}
      </div>
    )}
  </div>
);

const Controls: React.FC<ControlsProps> = (props) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    setup: true,
    structure: true,
    display: false,
    manual: false,
    advanced: false,
    saved: false,
  });
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newPatternName, setNewPatternName] = useState('');
  const [isSaveStructureModalOpen, setIsSaveStructureModalOpen] = useState(false);
  const [newStructureName, setNewStructureName] = useState('');

  const allStructures = useMemo(() => ({ ...STRUCTURES, ...props.customStructures }), [props.customStructures]);
  const currentStructure = allStructures[props.activeFretboard.globalStructure];
  const structureIntervals = useMemo(() => {
    if (!currentStructure) return new Set<number>();
    return new Set(currentStructure.intervals.map(i => i.interval % 12));
  }, [currentStructure]);

  const visibleIntervals = props.activeFretboard.isAdvancedMode
    ? (props.activeFretboard.stringGroups.find(g => g.id === props.activeFretboard.activeGroupId)?.visibleIntervals ?? new Set())
    : props.activeFretboard.visibleIntervals;

  const toggleSection = (section: string) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

  const toggleIntervalVisibility = (interval: number) => {
    if (props.activeFretboard.isAdvancedMode && props.activeFretboard.activeGroupId) {
      const newGroups = props.activeFretboard.stringGroups.map(g => {
        if (g.id === props.activeFretboard.activeGroupId) {
          const newInts = new Set(g.visibleIntervals);
          if (newInts.has(interval)) newInts.delete(interval);
          else newInts.add(interval);
          return { ...g, visibleIntervals: newInts };
        }
        return g;
      });
      props.updateActiveFretboard({ stringGroups: newGroups });
    } else {
      const newSet = new Set(props.activeFretboard.visibleIntervals);
      if (newSet.has(interval)) newSet.delete(interval);
      else newSet.add(interval);
      props.updateActiveFretboard({ visibleIntervals: newSet });
    }
  };

  // Fix: Explicitly type the find callback argument to [string, Tuning] and access via index to avoid 'unknown' property errors.
  const currentTuningKey = useMemo(() => {
    const entries = Object.entries(TUNINGS) as [string, Tuning][];
    const match = entries.find((pair: [string, Tuning]) => pair[1].name === props.tuning.name);
    return match ? match[0] : 'daead';
  }, [props.tuning.name]);

  return (
    <div className="w-full lg:w-[340px] bg-gray-800/80 backdrop-blur-md p-3 rounded-2xl shadow-2xl flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-100px)] border border-gray-700 custom-scrollbar">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-black text-cyan-400 uppercase tracking-tighter italic">FretMaster</h2>
        <div className="flex gap-1">
          {props.isSoundEnabled && (
            <button
              onClick={props.onStrum}
              className="p-1.5 bg-gray-700 text-cyan-400 rounded-lg hover:bg-cyan-600 hover:text-white transition-all shadow-sm"
              title="Strum Visualization"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </button>
          )}
          <button
            onClick={() => props.setIsSoundEnabled(!props.isSoundEnabled)}
            className={`p-1.5 rounded-lg transition-all ${props.isSoundEnabled ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-500'}`}
          >
            <SpeakerIcon className="w-4 h-4" enabled={props.isSoundEnabled} />
          </button>
        </div>
      </div>

      {/* Active Fretboard Indicator */}
      <div className="px-2 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center justify-between">
        <span className="text-[10px] text-gray-500 uppercase">Editing:</span>
        <span className="text-xs font-bold text-cyan-400">{props.activeFretboard.name}</span>
      </div>
      
      <CollapsibleSection title="Setup" isOpen={openSections.setup} onToggle={() => toggleSection('setup')}>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Root</label>
              <select
                value={props.activeFretboard.rootNote}
                onChange={(e) => props.updateActiveFretboard({ rootNote: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
              >
                {KEYS.map(key => <option key={key.value} value={key.value}>{key.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tuning</label>
              <select
                value={currentTuningKey}
                onChange={(e) => props.setTuning(TUNINGS[e.target.value as keyof typeof TUNINGS])}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
              >
                {/* Fix: Explicitly cast and type the Object.entries(TUNINGS) call to ensure 't' has property 'name'. */}
                {(Object.entries(TUNINGS) as [string, Tuning][]).map(([key, t]: [string, Tuning]) => (
                  <option key={key} value={key}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Theory" isOpen={openSections.structure} onToggle={() => toggleSection('structure')}>
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Visualization</label>
            <div className="flex gap-2 mb-2">
              <select
                value={props.activeFretboard.globalStructure}
                onChange={(e) => props.updateActiveFretboard({ globalStructure: e.target.value })}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
              >
                {/* Favorites at top */}
                {props.favorites.length > 0 && (
                  <optgroup label="★ Favorites">
                    {props.favorites.map(key => {
                      const structure = allStructures[key];
                      if (!structure) return null;
                      return <option key={`fav-${key}`} value={key}>★ {structure.name}</option>;
                    })}
                  </optgroup>
                )}
                {Object.entries(CATEGORIZED_STRUCTURES).map(([categoryName, categoryStructures]) => (
                  <optgroup key={categoryName} label={categoryName}>
                    {Object.entries(categoryStructures).map(([key, structure]) => (
                      <option key={key} value={key}>{structure.name}</option>
                    ))}
                  </optgroup>
                ))}
                {Object.keys(props.customStructures).length > 0 && (
                  <optgroup label="Custom">
                    {Object.entries(props.customStructures).map(([key, structure]) => <option key={key} value={key}>{structure.name}</option>)}
                  </optgroup>
                )}
              </select>
              {/* Favorite toggle button */}
              <button
                onClick={() => props.onToggleFavorite(props.activeFretboard.globalStructure)}
                className={`px-3 rounded-lg border transition-all ${
                  props.favorites.includes(props.activeFretboard.globalStructure)
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                    : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-yellow-400 hover:border-yellow-500/50'
                }`}
                title={props.favorites.includes(props.activeFretboard.globalStructure) ? 'Remove from favorites' : 'Add to favorites'}
              >
                ★
              </button>
            </div>
            {props.detectedStructureName && (
              <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] text-cyan-400 font-bold text-center animate-pulse">
                DETECTED: {props.detectedStructureName}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1">
            {INTERVAL_NAMES.map((name, index) => {
              const isChecked = visibleIntervals.has(index);
              const isInStructure = structureIntervals.has(index);
              return (
                <button
                  key={index}
                  onClick={() => toggleIntervalVisibility(index)}
                  className={`py-1.5 rounded-lg text-[10px] font-black border transition-all ${isChecked ? (isInStructure ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-gray-600 border-gray-500 text-white') : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => setIsSaveStructureModalOpen(true)}
            className="w-full text-[9px] uppercase font-black bg-cyan-600/10 text-cyan-400 border border-cyan-400/20 py-2 rounded-lg hover:bg-cyan-600/20 transition-all"
            disabled={visibleIntervals.size === 0}
          >
            Save as Custom Scale
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Display" isOpen={openSections.display} onToggle={() => toggleSection('display')}>
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Label Type</label>
            <select
              value={props.activeFretboard.structureLabelType}
              onChange={(e) => props.updateActiveFretboard({ structureLabelType: e.target.value as 'interval' | 'noteName' | 'sargam' | 'degree' })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
            >
              <option value="interval">Intervals (R, 2, 3, etc.)</option>
              <option value="noteName">Note Names (C, D, E, etc.)</option>
              <option value="sargam">Sargam (S, R, G, etc.)</option>
              <option value="degree">Degrees (I, II, III, etc.)</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Advanced: Groups" isOpen={openSections.advanced} onToggle={() => toggleSection('advanced')}>
        <div className="space-y-2">
           <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Group Mode</span>
            <button
              onClick={() => props.updateActiveFretboard({ isAdvancedMode: !props.activeFretboard.isAdvancedMode })}
              className={`relative inline-flex items-center h-4 rounded-full w-8 transition-all ${props.activeFretboard.isAdvancedMode ? 'bg-cyan-600' : 'bg-gray-700'}`}
            >
              <span className={`inline-block w-2.5 h-2.5 transform bg-white rounded-full transition-transform ${props.activeFretboard.isAdvancedMode ? 'translate-x-4.5' : 'translate-x-1'}`} />
            </button>
          </div>
          {props.activeFretboard.isAdvancedMode && (
            <div className="space-y-2">
              <button onClick={() => {
                const newGroup: StringGroup = {
                  id: `g_${Date.now()}`,
                  name: `Group ${props.activeFretboard.stringGroups.length + 1}`,
                  strings: [],
                  rootNote: props.activeFretboard.rootNote,
                  structureKey: props.activeFretboard.globalStructure,
                  visibleIntervals: new Set([0, 4, 7]),
                  fretRange: { start: 0, end: FRET_COUNT }
                };
                props.updateActiveFretboard({
                  stringGroups: [...props.activeFretboard.stringGroups, newGroup],
                  activeGroupId: newGroup.id
                });
              }} className="w-full py-1.5 bg-gray-700 text-white text-[10px] rounded-lg border border-gray-600 font-bold uppercase hover:bg-gray-600">+ New Group</button>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {props.activeFretboard.stringGroups.map((g: StringGroup) => (
                  <button
                    key={g.id}
                    onClick={() => props.updateActiveFretboard({ activeGroupId: g.id })}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-[10px] border transition-all ${props.activeFretboard.activeGroupId === g.id ? 'bg-cyan-900/30 border-cyan-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                  >
                    <span className="truncate">{g.name}</span>
                    <div onClick={(e) => {
                      e.stopPropagation();
                      props.updateActiveFretboard({
                        stringGroups: props.activeFretboard.stringGroups.filter(sg => sg.id !== g.id)
                      });
                    }} className="hover:text-red-400"><TrashIcon className="w-3 h-3" /></div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Export & Paint" isOpen={openSections.manual} onToggle={() => toggleSection('manual')}>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1 justify-center p-1 bg-gray-900/50 rounded-xl">
            {/* No Paint option */}
            <button
              onClick={() => props.setCurrentColor(null)}
              className={`w-5 h-5 rounded-full border-2 border-gray-500 flex items-center justify-center ${props.currentColor === null ? 'ring-2 ring-white scale-110 shadow-lg bg-gray-800' : 'opacity-40 hover:opacity-100 bg-gray-900'}`}
              title="No paint (click only)"
            >
              <span className="text-gray-400 text-[8px] font-bold">⊘</span>
            </button>
            {COLOR_PALETTE.slice(0, 10).map((color, idx) => (
              <button key={idx} onClick={() => props.setCurrentColor(color)} className={`w-5 h-5 rounded-full ${color.bgColor} ${props.currentColor?.bgColor === color.bgColor ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => props.updateActiveFretboard({ manualNotes: {} })} className="flex-1 bg-red-500/10 text-red-500 border border-red-500/20 font-bold py-1.5 rounded-lg text-[10px] uppercase">Reset</button>
            <button onClick={() => setIsSaveModalOpen(true)} className="flex-1 bg-cyan-600 text-white font-bold py-1.5 rounded-lg text-[10px] uppercase shadow-md">Save</button>
          </div>
          <button onClick={props.onExport} className="w-full bg-gray-700 text-gray-300 font-bold py-2 rounded-lg text-[10px] uppercase hover:bg-cyan-600 hover:text-white transition-all">Download PNG</button>
        </div>
      </CollapsibleSection>

      {/* Save Modal for Patterns */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setIsSaveModalOpen(false)}>
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-xs border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-black text-white mb-4 tracking-tight uppercase italic">Save Pattern</h3>
            <input type="text" value={newPatternName} onChange={e => setNewPatternName(e.target.value)} placeholder="My Lead Lick..." className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white text-xs outline-none" autoFocus />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsSaveModalOpen(false)} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase">Cancel</button>
              <button onClick={() => { if(newPatternName.trim()){ props.onSavePattern(newPatternName.trim()); setIsSaveModalOpen(false); setNewPatternName(''); } }} className="bg-cyan-600 px-6 py-2 rounded-xl text-[10px] font-bold text-white uppercase shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal for Custom Scales */}
      {isSaveStructureModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setIsSaveStructureModalOpen(false)}>
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-xs border border-gray-700" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-black text-white mb-4 tracking-tight uppercase italic">Save Custom Scale</h3>
            <input type="text" value={newStructureName} onChange={e => setNewStructureName(e.target.value)} placeholder="Phrygian Dominant..." className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white text-xs outline-none" autoFocus />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsSaveStructureModalOpen(false)} className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase">Cancel</button>
              <button onClick={() => { if(newStructureName.trim()){ props.onSaveCustomStructure(newStructureName.trim()); setIsSaveStructureModalOpen(false); setNewStructureName(''); } }} className="bg-cyan-600 px-6 py-2 rounded-xl text-[10px] font-bold text-white uppercase shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;
