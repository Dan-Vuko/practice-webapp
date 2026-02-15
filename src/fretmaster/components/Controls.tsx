
import React, { useState, useMemo } from 'react';
import type { Tuning, Color, RingColor, SavedPattern, Structure, Instrument, FretboardInstance, CustomPreset } from '../types';
import { TUNINGS, KEYS, COLOR_PALETTE, STRUCTURES, INTERVAL_NAMES, CATEGORIZED_STRUCTURES } from '../constants';
import { ChevronIcon } from './icons/ChevronIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { BookIcon } from './icons/BookIcon';

const FRETBOARD_PRESETS = [
  {
    id: 'bh_all_4',
    name: 'Barry Harris (All 4)',
    description: 'Maj6, Min6, Dom7, Dom7\u266D5 Dim \u2014 Root D',
    fretboards: [
      { name: 'Maj6 Dim', rootNote: 'D', structureKey: 'catalog_2997', pcs: [0,2,4,5,7,8,9,11] },
      { name: 'Min6 Dim', rootNote: 'D', structureKey: 'catalog_2989', pcs: [0,2,3,5,7,8,9,11] },
      { name: 'Dom7 Dim', rootNote: 'D', structureKey: 'catalog_3509', pcs: [0,2,4,5,7,8,10,11] },
      { name: 'Dom7\u266D5 Dim', rootNote: 'D', structureKey: 'catalog_3445', pcs: [0,2,4,5,6,8,10,11] },
    ],
  },
];

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
  isSoundEnabled: boolean;
  setIsSoundEnabled: (value: boolean) => void;
  instrument: Instrument;
  setInstrument: (inst: Instrument) => void;
  onExport: () => void;
  onStrum: () => void;
  favorites: string[];
  onToggleFavorite: (structureKey: string) => void;
  onOpenCatalog: () => void;
  catalogFavourites: number[];
  recentlyViewed: number[];
  catalogStructures: Record<string, Structure>;
  onApplyPreset: (preset: typeof FRETBOARD_PRESETS[0]) => void;
  customPresets: CustomPreset[];
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
  const [presetName, setPresetName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('');

  const allStructures = useMemo(() => ({
    ...STRUCTURES, ...props.customStructures, ...props.catalogStructures
  }), [props.customStructures, props.catalogStructures]);

  const catalogFavSet = useMemo(() => new Set(props.catalogFavourites), [props.catalogFavourites]);
  const recentNotInFavs = useMemo(() => props.recentlyViewed.filter(n => !catalogFavSet.has(n)), [props.recentlyViewed, catalogFavSet]);
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

  // Collapsed view - just a slim bar with expand button
  if (isCollapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center bg-gray-800/80 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-gray-700 gap-2">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 bg-gray-700 text-cyan-400 rounded-lg hover:bg-cyan-600 hover:text-white transition-all"
          title="Expand panel"
        >
          <ChevronIcon className="w-4 h-4 -rotate-90" />
        </button>
        <div className="w-px h-8 bg-gray-600" />
        <button
          onClick={() => props.setIsSoundEnabled(!props.isSoundEnabled)}
          className={`p-2 rounded-lg transition-all ${props.isSoundEnabled ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-500'}`}
          title={props.isSoundEnabled ? 'Mute' : 'Unmute'}
        >
          <SpeakerIcon className="w-4 h-4" enabled={props.isSoundEnabled} />
        </button>
        {props.isSoundEnabled && (
          <button
            onClick={props.onStrum}
            className="p-2 bg-gray-700 text-cyan-400 rounded-lg hover:bg-cyan-600 hover:text-white transition-all"
            title="Strum"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[340px] bg-gray-800/80 backdrop-blur-md p-3 rounded-2xl shadow-2xl flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-100px)] border border-gray-700 custom-scrollbar">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden lg:flex p-1 bg-gray-700 text-gray-400 rounded hover:bg-gray-600 hover:text-cyan-400 transition-all"
            title="Collapse panel"
          >
            <ChevronIcon className="w-3 h-3 rotate-90" />
          </button>
          <h2 className="text-lg font-black text-cyan-400 uppercase tracking-tighter italic">FretMaster</h2>
        </div>
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
          {/* Catalog & Favorite buttons row */}
          <div className="flex gap-2">
            <button
              onClick={props.onOpenCatalog}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-700 bg-gray-900 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all text-[10px] font-bold uppercase"
              title="Scale Catalog"
            >
              <BookIcon className="w-3.5 h-3.5" />
              Scale Catalog
            </button>
            <button
              onClick={() => props.onToggleFavorite(props.activeFretboard.globalStructure)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase ${
                props.favorites.includes(props.activeFretboard.globalStructure)
                  ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                  : 'bg-gray-900 border-gray-700 text-gray-500 hover:text-yellow-400 hover:border-yellow-500/50'
              }`}
              title={props.favorites.includes(props.activeFretboard.globalStructure) ? 'Remove from favorites' : 'Add to favorites'}
            >
              ★ Fav
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Visualization</label>
            <select
              value={props.activeFretboard.globalStructure}
              onChange={(e) => props.updateActiveFretboard({ globalStructure: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
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
              {props.catalogFavourites.length > 0 && (
                <optgroup label="Catalog Favourites">
                  {props.catalogFavourites.map(n => {
                    const key = `catalog_${n}`;
                    const structure = allStructures[key];
                    if (!structure) return null;
                    return <option key={`catfav-${n}`} value={key}>★ {structure.name}</option>;
                  })}
                </optgroup>
              )}
              {recentNotInFavs.length > 0 && (
                <optgroup label="Recently Viewed">
                  {recentNotInFavs.map(n => {
                    const key = `catalog_${n}`;
                    const structure = allStructures[key];
                    if (!structure) return null;
                    return <option key={`recent-${n}`} value={key}>{structure.name}</option>;
                  })}
                </optgroup>
              )}
            </select>
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

      <CollapsibleSection title="Presets" isOpen={openSections.advanced} onToggle={() => toggleSection('advanced')}>
        <div className="space-y-2">
          <div className="flex gap-1">
            <select
              value={selectedPresetId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedPresetId(val);
                if (!val) return;
                const builtIn = FRETBOARD_PRESETS.find(p => p.id === val);
                if (builtIn) { props.onApplyPreset(builtIn); }
                else {
                  const custom = props.customPresets.find(p => p.id === val);
                  if (custom) props.onApplyPreset(custom);
                }
              }}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
            >
              <option value="">Select a preset...</option>
              {FRETBOARD_PRESETS.map(preset => (
                <option key={preset.id} value={preset.id}>{preset.name}</option>
              ))}
              {props.customPresets.map(preset => (
                <option key={preset.id} value={preset.id}>{preset.name}</option>
              ))}
            </select>
            {selectedPresetId && !FRETBOARD_PRESETS.some(p => p.id === selectedPresetId) && (
              <button
                onClick={() => {
                  props.onDeletePreset(selectedPresetId);
                  setSelectedPresetId('');
                }}
                className="px-2 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-bold rounded-lg text-[10px] uppercase transition-all border border-red-500/20"
                title="Delete preset"
              >
                Del
              </button>
            )}
          </div>
          <div className="flex gap-1">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && presetName.trim()) {
                  props.onSavePreset(presetName.trim());
                  setPresetName('');
                }
              }}
              placeholder="Preset name..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
            />
            <button
              onClick={() => {
                if (presetName.trim()) {
                  props.onSavePreset(presetName.trim());
                  setPresetName('');
                }
              }}
              className="px-3 py-1.5 bg-cyan-600 text-white font-bold rounded-lg text-[10px] uppercase hover:bg-cyan-500 transition-all"
            >
              Save
            </button>
          </div>
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

    </div>
  );
};

export default Controls;
