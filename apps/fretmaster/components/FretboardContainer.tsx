import React from 'react';
import Fretboard from './Fretboard';
import { XIcon } from './icons/XIcon';
import { STRUCTURES } from '../constants';
import type { FretboardInstance, Tuning, FretboardTheme, HighlightedNote, Structure } from '../types';

interface FretboardContainerProps {
  fretboard: FretboardInstance;
  isActive: boolean;
  onClick: () => void;
  onRemove: () => void;
  canRemove: boolean;
  tuning: Tuning;
  theme: FretboardTheme;
  highlightedNotes: Record<string, HighlightedNote>;
  onNoteClick: (stringIndex: number, fret: number) => void;
  customStructures: Record<string, Structure>;
}

const FretboardContainer: React.FC<FretboardContainerProps> = ({
  fretboard,
  isActive,
  onClick,
  onRemove,
  canRemove,
  tuning,
  theme,
  highlightedNotes,
  onNoteClick,
  customStructures,
}) => {
  // Get the structure name
  const allStructures = { ...STRUCTURES, ...customStructures };
  const structure = allStructures[fretboard.globalStructure];
  const structureName = structure?.name || 'Unknown';
  const displayTitle = `${fretboard.rootNote} ${structureName}`;

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-3xl border-2 transition-all cursor-pointer
        ${isActive
          ? 'border-cyan-500 bg-gray-900/50 shadow-2xl shadow-cyan-500/20'
          : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
        }`}
    >
      {/* Header with name and remove button */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-bold uppercase tracking-wide
          ${isActive ? 'text-cyan-400' : 'text-gray-500'}`}>
          {displayTitle}
        </h3>

        {canRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20
                       text-red-400 hover:text-red-300 transition-all"
            title="Remove fretboard"
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* Fretboard */}
      <Fretboard
        tuning={tuning}
        theme={theme}
        highlightedNotes={highlightedNotes}
        onNoteClick={onNoteClick}
      />
    </div>
  );
};

export default FretboardContainer;
