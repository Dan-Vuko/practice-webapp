
import React, { useState, useMemo } from 'react';
import type { CatalogScale } from '../types';
import { XIcon } from './icons/XIcon';

interface ScaleLookupProps {
  scales: CatalogScale[];
  nameMap: Record<string, string>;
  onSelect: (scaleNumber: number) => void;
  onClose: () => void;
}

const INTERVAL_LABELS = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];

const ScaleLookup: React.FC<ScaleLookupProps> = ({ scales, nameMap, onSelect, onClose }) => {
  const [activePcs, setActivePcs] = useState<Set<number>>(new Set([0]));

  const togglePc = (pc: number) => {
    if (pc === 0) return; // Root always active
    setActivePcs(prev => {
      const next = new Set(prev);
      if (next.has(pc)) next.delete(pc);
      else next.add(pc);
      return next;
    });
  };

  // Compute Ian Ring number
  const ringNumber = useMemo(() => {
    let sum = 0;
    for (const pc of activePcs) sum += (1 << pc);
    return sum;
  }, [activePcs]);

  // Find exact match
  const exactMatch = useMemo(() => {
    return scales.find(s => s.n === ringNumber) || null;
  }, [scales, ringNumber]);

  // Find partial matches (supersets containing these exact notes, up to 20)
  const supersetMatches = useMemo(() => {
    if (activePcs.size < 2) return [];
    const results: CatalogScale[] = [];
    for (const s of scales) {
      if (s.n === ringNumber) continue;
      // Check if this scale contains all selected pitch classes
      const scaleBits = s.n;
      let isSuperset = true;
      for (const pc of activePcs) {
        if (!(scaleBits & (1 << pc))) {
          isSuperset = false;
          break;
        }
      }
      if (isSuperset) {
        results.push(s);
        if (results.length >= 20) break;
      }
    }
    return results;
  }, [scales, activePcs, ringNumber]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-cyan-400">Custom Scale Lookup</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-3">Select intervals to find matching scales.</p>

        {/* Interval toggle buttons */}
        <div className="grid grid-cols-6 gap-2 mb-4">
          {INTERVAL_LABELS.map((label, pc) => (
            <button
              key={pc}
              onClick={() => togglePc(pc)}
              className={`py-2 rounded-md text-sm font-semibold transition-colors ${
                activePcs.has(pc)
                  ? pc === 0
                    ? 'bg-yellow-500 text-black cursor-default'
                    : 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-500 mb-3">
          Ian Ring Number: <span className="text-cyan-400 font-mono">{ringNumber}</span>
        </div>

        {/* Exact match */}
        {exactMatch && (
          <div className="mb-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Exact Match</span>
            <button
              onClick={() => onSelect(exactMatch.n)}
              className="w-full mt-1 p-2 bg-cyan-900/30 border border-cyan-800/50 rounded-md text-left hover:bg-cyan-900/50 transition-colors"
            >
              <span className="text-cyan-300 font-medium">{exactMatch.name || `Scale #${exactMatch.n}`}</span>
              <span className="text-gray-400 text-xs ml-2">#{exactMatch.n} - {exactMatch.card} notes</span>
            </button>
          </div>
        )}

        {!exactMatch && activePcs.size >= 2 && (
          <div className="text-sm text-gray-400 mb-3">No exact match for this combination.</div>
        )}

        {/* Superset matches */}
        {supersetMatches.length > 0 && (
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Supersets (containing these notes)</span>
            <div className="mt-1 max-h-40 overflow-y-auto space-y-1">
              {supersetMatches.map(s => (
                <button
                  key={s.n}
                  onClick={() => onSelect(s.n)}
                  className="w-full p-1.5 bg-gray-900/50 rounded text-left text-sm hover:bg-gray-700/50 transition-colors flex justify-between"
                >
                  <span className="text-gray-300">{s.name || `Scale #${s.n}`}</span>
                  <span className="text-gray-500 text-xs">{s.card} notes</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScaleLookup;
