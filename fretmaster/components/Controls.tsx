
import React, { useState, useMemo } from 'react';
import type { Tuning, Color, RingColor, StructureLabelType, StructureKey, SavedPattern, Structure, StringGroup, Instrument, HexatonicPatternId } from '../types';
import { TUNINGS, KEYS, COLOR_PALETTE, RING_COLOR_PALETTE, STRUCTURES, CATEGORIZED_STRUCTURES, INTERVAL_NAMES, HEXATONIC_PATTERNS } from '../constants';
import { InfoIcon } from './icons/InfoIcon';
import { ChevronIcon } from './icons/ChevronIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';

interface ControlsProps {
  tuning: Tuning;
  setTuning: (tuning: Tuning) => void;
  rootNote: string;
  setRootNote: (note: string) => void;
  selectedStructure: StructureKey;
  setSelectedStructure: (key: StructureKey) => void;
  visibleIntervals: Set<number>;
  toggleIntervalVisibility: (interval: number) => void;
  setAllIntervalsVisibility: (visible: boolean) => void;
  structureLabelType: StructureLabelType;
  setStructureLabelType: (type: StructureLabelType) => void;
  currentColor: Color;
  setCurrentColor: (color: Color) => void;
  currentRing: RingColor;
  setCurrentRing: (ring: RingColor) => void;
  resetManualNotes: () => void;
  savedPatterns: SavedPattern[];
  onSavePattern: (name: string) => void;
  onLoadPattern: (id: string) => void;
  onDeletePattern: (id: string) => void;
  customStructures: Record<string, Structure>;
  onSaveCustomStructure: (name: string) => void;
  onDeleteCustomStructure: (id: string) => void;
  detectedStructureName: string | null;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (value: boolean) => void;
  stringGroups: StringGroup[];
  activeGroupId: string | null;
  setActiveGroupId: (id: string) => void;
  addGroup: () => void;
  deleteGroup: (id: string) => void;
  updateGroup: (id: string, newProps: Partial<StringGroup>) => void;
  toggleStringInGroup: (groupId: string, stringIndex: number) => void;
  setAllStringsForGroup: (groupId: string, assign: boolean) => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (value: boolean) => void;
  instrument: Instrument;
  setInstrument: (inst: Instrument) => void;
  onExport: () => void;
  hexatonicPattern: HexatonicPatternId;
  setHexatonicPattern: (pattern: HexatonicPatternId) => void;
}

const CollapsibleSection: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }> = ({ title, isOpen, onToggle, children }) => (
  <div className="bg-gray-700/50 rounded-lg transition-all duration-300">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 text-left font-semibold text-cyan-400 hover:bg-gray-700/80 rounded-t-lg"
      aria-expanded={isOpen}
    >
      <h3>{title}</h3>
      <ChevronIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
    </button>
    {isOpen && (
      <div className="p-4 border-t border-gray-600/50">
        {children}
      </div>
    )}
  </div>
);

const Controls: React.FC<ControlsProps> = ({
  tuning,
  setTuning,
  rootNote,
  setRootNote,
  selectedStructure,
  setSelectedStructure,
  visibleIntervals,
  toggleIntervalVisibility,
  setAllIntervalsVisibility,
  structureLabelType,
  setStructureLabelType,
  currentColor,
  setCurrentColor,
  currentRing,
  setCurrentRing,
  resetManualNotes,
  savedPatterns,
  onSavePattern,
  onLoadPattern,
  onDeletePattern,
  customStructures,
  onSaveCustomStructure,
  onDeleteCustomStructure,
  detectedStructureName,
  isAdvancedMode,
  setIsAdvancedMode,
  stringGroups,
  activeGroupId,
  setActiveGroupId,
  addGroup,
  deleteGroup,
  updateGroup,
  toggleStringInGroup,
  setAllStringsForGroup,
  isSoundEnabled,
  setIsSoundEnabled,
  instrument,
  setInstrument,
  onExport,
  hexatonicPattern,
  setHexatonicPattern
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    setup: true,
    structure: true,
    display: true,
    manual: true,
    saved: true,
    customStructures: true,
  });
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newPatternName, setNewPatternName] = useState('');
  const [isSaveStructureModalOpen, setIsSaveStructureModalOpen] = useState(false);
  const [newStructureName, setNewStructureName] = useState('');

  const allStructures = useMemo(() => ({ ...STRUCTURES, ...customStructures }), [customStructures]);
  const currentStructure = allStructures[selectedStructure];
  
  const structureIntervals = useMemo(() => {
    if (!currentStructure) return new Set<number>();
    return new Set(currentStructure.intervals.map(i => i.interval % 12));
  }, [selectedStructure, allStructures]);

  // Fix: Explicitly cast Object.entries to ensure 't' is recognized as Tuning type to fix 'unknown' property access errors.
  const tuningKey = useMemo(() => {
    const entries = Object.entries(TUNINGS) as [string, Tuning][];
    const match = entries.find(([, t]) => t.name === tuning.name);
    return match ? match[0] : Object.keys(TUNINGS)[0];
  }, [tuning.name]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSavePattern = () => {
    if (newPatternName.trim()) {
      onSavePattern(newPatternName.trim());
      setNewPatternName('');
      setIsSaveModalOpen(false);
    }
  };

  const handleSaveStructure = () => {
    if (newStructureName.trim()) {
      onSaveCustomStructure(newStructureName.trim());
      setNewStructureName('');
      setIsSaveStructureModalOpen(false);
    }
  };
  
  const labelOptions: { id: StructureLabelType, name: string }[] = [
    { id: 'interval', name: 'Intervals' },
    { id: 'noteName', name: 'Notes' },
    { id: 'sargam', name: 'Sargam' },
  ];

  return (
    <div className="w-full lg:w-80 bg-gray-800 p-4 rounded-lg shadow-2xl flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-2xl font-bold text-center mb-2">Controls</h2>
      
      <CollapsibleSection title="Fretboard Setup" isOpen={openSections.setup} onToggle={() => toggleSection('setup')}>
        <div className="space-y-3">
          <div>
            <label htmlFor="key-select" className="block text-sm font-medium text-gray-300 mb-1">Root Note</label>
            <select
              id="key-select"
              value={rootNote}
              onChange={(e) => setRootNote(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            >
              {KEYS.map(key => (
                <option key={key.value} value={key.value}>{key.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tuning-select" className="block text-sm font-medium text-gray-300 mb-1">Tuning</label>
            <select
              id="tuning-select"
              value={tuningKey}
              onChange={(e) => setTuning(TUNINGS[e.target.value as keyof typeof TUNINGS])}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            >
              {/* Fix: Cast Object.entries(TUNINGS) to [string, Tuning][] to avoid unknown property errors when accessing .name. */}
              {(Object.entries(TUNINGS) as [string, Tuning][]).map(([key, t]) => (
                <option key={key} value={key}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-600">
             <span className="text-sm font-medium text-gray-300">Sound</span>
             <button
               onClick={() => setIsSoundEnabled(!isSoundEnabled)}
               className={`p-2 rounded-full transition-colors ${isSoundEnabled ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400'}`}
               title={isSoundEnabled ? "Mute Sound" : "Enable Sound"}
             >
               <SpeakerIcon className="w-5 h-5" enabled={isSoundEnabled} />
             </button>
          </div>
          
           {isSoundEnabled && (
            <div>
               <label className="block text-xs text-gray-400 mb-1">Instrument</label>
               <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value as Instrument)}
                  className="w-full bg-gray-900 border border-gray-600 rounded text-sm p-1.5 text-white"
               >
                  <option value="sine">Sine Wave</option>
                  <option value="triangle">Triangle Wave</option>
                  <option value="square">Square Wave</option>
                  <option value="sawtooth">Sawtooth Wave</option>
               </select>
            </div>
          )}

           {/* Advanced Mode Toggle */}
           <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-gray-300">Advanced Mode</span>
             <button
                role="switch"
                aria-checked={isAdvancedMode}
                onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${isAdvancedMode ? 'bg-cyan-600' : 'bg-gray-600'}`}
             >
               <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${isAdvancedMode ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
           </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Structure Visualization" isOpen={openSections.structure} onToggle={() => toggleSection('structure')}>
        <div className="space-y-4">
          <div>
            <label htmlFor="structure-select" className="block text-sm font-medium text-gray-300 mb-1">Chord/Scale Type</label>
            <select
              id="structure-select"
              value={selectedStructure}
              onChange={(e) => setSelectedStructure(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
            >
              {Object.entries(CATEGORIZED_STRUCTURES).map(([category, structures]) => (
                <optgroup key={category} label={category}>
                  {Object.entries(structures).map(([key, structure]: [string, Structure]) => (
                    <option key={key} value={key}>{structure.name}</option>
                  ))}
                </optgroup>
              ))}
              {Object.keys(customStructures).length > 0 && (
                <optgroup label="Custom">
                  {Object.entries(customStructures).map(([key, structure]: [string, Structure]) => (
                    <option key={key} value={key}>{structure.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Hexatonic Visualization Pattern Selector */}
          {selectedStructure === 'hexatonic_no4' && (
            <div className="bg-gray-900/50 p-3 rounded-lg border border-cyan-900/50">
              <label htmlFor="pattern-select" className="block text-sm font-medium text-cyan-300 mb-2">
                Visualization Pattern
              </label>
              <select
                id="pattern-select"
                value={hexatonicPattern}
                onChange={(e) => setHexatonicPattern(e.target.value as HexatonicPatternId)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              >
                {HEXATONIC_PATTERNS.map(pattern => (
                  <option key={pattern.id} value={pattern.id}>{pattern.name}</option>
                ))}
              </select>
              {hexatonicPattern !== 'default' && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-gray-400">Colors:</span>
                  {(() => {
                    const pattern = HEXATONIC_PATTERNS.find(p => p.id === hexatonicPattern);
                    if (!pattern) return null;
                    return (
                      <>
                        <span className={`px-2 py-0.5 rounded ${pattern.groupA.color.bgColor} ${pattern.groupA.color.textColor}`}>
                          Group A
                        </span>
                        <span className={`px-2 py-0.5 rounded ${pattern.groupB.color.bgColor} ${pattern.groupB.color.textColor}`}>
                          Group B
                        </span>
                      </>
                    );
                  })()}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {HEXATONIC_PATTERNS.find(p => p.id === hexatonicPattern)?.description}
              </p>
            </div>
          )}

          {detectedStructureName && (
             <div className="text-center bg-gray-900/50 p-2 rounded border border-cyan-900/50">
                <span className="text-xs text-gray-400 block uppercase tracking-wider">Detected</span>
                <span className="text-cyan-400 font-medium">{detectedStructureName}</span>
             </div>
          )}

          <div>
            <p className="text-sm text-gray-300 mb-2">Toggle intervals to display on the fretboard. Highlighted intervals belong to the selected structure.</p>
            <div className={`grid grid-cols-3 gap-2`}>
              {INTERVAL_NAMES.map((name: string, index) => {
                const isChecked = visibleIntervals.has(index);
                const isInStructure = structureIntervals.has(index);
                return (
                  <label 
                    key={index} 
                    className={`flex items-center space-x-2 p-1.5 rounded-md cursor-pointer transition-colors ${isChecked ? 'bg-gray-900' : 'bg-gray-700/60 hover:bg-gray-600/80'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleIntervalVisibility(index)}
                      className="form-checkbox h-4 w-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-600 focus:ring-offset-0"
                    />
                    <span className={`text-sm font-medium ${isInStructure ? 'text-cyan-300' : 'text-gray-300'}`}>{name}</span>
                  </label>
                )
              })}
            </div>
            <div className={`flex gap-2 mt-3`}>
              <button onClick={() => setAllIntervalsVisibility(true)} className="flex-1 text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1.5 px-3 rounded-md transition-colors">Select All</button>
              <button onClick={() => setAllIntervalsVisibility(false)} className="flex-1 text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold py-1.5 px-3 rounded-md transition-colors">Deselect All</button>
            </div>
            <button 
              onClick={() => setIsSaveStructureModalOpen(true)}
              className="w-full text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-1.5 px-3 rounded-md transition-colors mt-3 disabled:bg-gray-500 disabled:cursor-not-allowed"
              disabled={visibleIntervals.size === 0}
            >
              Save Current as Custom Structure
            </button>
          </div>
          
           <div className="pt-2 border-t border-gray-600/50">
             <button
               onClick={onExport}
               className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
             >
               Export Diagram
             </button>
           </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Global Display Settings" isOpen={openSections.display} onToggle={() => toggleSection('display')}>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Note Labels</label>
          <div className="grid grid-cols-3 gap-1 rounded-md bg-gray-900 p-1">
            {labelOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setStructureLabelType(option.id)}
                className={`w-full text-center text-sm font-semibold rounded p-1.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
                  structureLabelType === option.id
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-gray-900 hover:bg-gray-700'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Manual Note Highlighting" isOpen={openSections.manual} onToggle={() => toggleSection('manual')}>
        <div className="flex items-start mb-3">
          <p className="text-sm text-gray-300 flex-1">Click a fret to add/remove a note. Pick a color below to paint with.</p>
          <div className="relative group ml-2">
            <InfoIcon className="w-5 h-5 text-gray-400" />
            <div className="absolute bottom-full mb-2 w-48 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 transform translate-x-1/2 -translate-y-1 z-10">
              Manually added notes will override the structure visualization.
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Fill Color</h4>
          <div className="flex flex-wrap gap-3 justify-center">
            {COLOR_PALETTE.map((color, index) => (
              <button
                key={index}
                onClick={() => setCurrentColor(color)}
                className={`w-8 h-8 rounded-full transition-transform duration-150 border-2 border-transparent ${color.bgColor} ${currentColor.bgColor === color.bgColor ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : 'hover:scale-110'}`}
                aria-label={`Select color ${color.bgColor.replace('bg-','')}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Ring Color</h4>
          <div className="flex flex-wrap gap-3 justify-center">
            {RING_COLOR_PALETTE.map((ring: RingColor, index) => (
               <button
                  key={index}
                  onClick={() => setCurrentRing(ring)}
                  className={`w-8 h-8 rounded-full transition-transform duration-150 flex items-center justify-center ${currentRing.name === ring.name ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : 'hover:scale-110'}`}
                  aria-label={`Select ring color ${ring.name}`}
               >
                 {ring.name === 'None' ? (
                   <div className="w-full h-full rounded-full bg-gray-700 border-2 border-gray-500 flex items-center justify-center text-gray-400">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </div>
                 ) : (
                   <div className={`w-full h-full rounded-full ${ring.swatchClassName}`} />
                 )}
               </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            onClick={resetManualNotes}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Save Pattern
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Saved Patterns" isOpen={openSections.saved} onToggle={() => toggleSection('saved')}>
        <div className="space-y-2">
          {savedPatterns.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">No patterns saved yet.</p>
          ) : (
            savedPatterns.map((pattern: SavedPattern) => (
              <div key={pattern.id} className="flex items-center justify-between bg-gray-900/50 p-2 rounded-md group">
                <button 
                  onClick={() => onLoadPattern(pattern.id)}
                  className="text-left flex-1 hover:text-cyan-400 transition-colors"
                >
                  <span className="font-semibold">{pattern.name}</span>
                  <span className="text-xs text-gray-400 block">{pattern.rootNote} Root - {pattern.tuning.name}</span>
                </button>
                <button 
                  onClick={() => onDeletePattern(pattern.id)}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Delete pattern ${pattern.name}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Custom Structures" isOpen={openSections.customStructures} onToggle={() => toggleSection('customStructures')}>
        <div className="space-y-2">
          {Object.keys(customStructures).length === 0 ? (
            <p className="text-sm text-gray-400 text-center">No custom structures saved yet.</p>
          ) : (
            Object.entries(customStructures).map(([id, structure]: [string, Structure]) => (
              <div key={id} className="flex items-center justify-between bg-gray-900/50 p-2 rounded-md group">
                <span className="font-semibold flex-1">{structure.name}</span>
                <button 
                  onClick={() => onDeleteCustomStructure(id)}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Delete structure ${structure.name}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </CollapsibleSection>

      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setIsSaveModalOpen(false)}>
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Save Pattern</h3>
            <input
              type="text"
              value={newPatternName}
              onChange={e => setNewPatternName(e.target.value)}
              placeholder="Enter pattern name..."
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSavePattern()}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePattern}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500"
                disabled={!newPatternName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isSaveStructureModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setIsSaveStructureModalOpen(false)}>
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Save Custom Structure</h3>
            <input
              type="text"
              value={newStructureName}
              onChange={e => setNewStructureName(e.target.value)}
              placeholder="Enter structure name..."
              className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSaveStructure()}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsSaveStructureModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStructure}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500"
                disabled={!newStructureName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;
