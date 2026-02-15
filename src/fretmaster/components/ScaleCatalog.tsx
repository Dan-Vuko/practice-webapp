
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { CatalogScale, ScaleFilters } from '../types';
import { INTERVAL_NAMES } from '../constants';
import { XIcon } from './icons/XIcon';
import { StarIcon } from './icons/StarIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ChevronIcon } from './icons/ChevronIcon';
import ScaleLookup from './ScaleLookup';

interface ScaleCatalogProps {
  scales: CatalogScale[];
  nameMap: Record<string, string>;
  favourites: number[];
  onToggleFavourite: (scaleNumber: number) => void;
  onVisualize: (scale: CatalogScale) => void;
  onClose: () => void;
}

const DEFAULT_FILTERS: ScaleFilters = {
  search: '',
  showPrimeOnly: false,
  showSymmetric: false,
  showChords: false,
  showHexatonic: false,
  showBarryHarris: false,
  showFavourites: false,
  noteCount: null,
};

// The 4 core Barry Harris scales only
const BARRY_HARRIS_SCALES = new Set([2997, 2989, 3509, 3445]);

function isBarryHarrisScale(scale: CatalogScale): boolean {
  return BARRY_HARRIS_SCALES.has(scale.n);
}

function formatIntervals(pcs: number[]): string {
  return pcs.map(pc => INTERVAL_NAMES[pc % 12]).join(' ');
}

/** Enumerate all k-element subsets of arr that include arr[0] (the root) */
function subsetsFromRoot(pcs: number[], k: number): number[][] {
  if (k < 1 || pcs.length < k) return [];
  const results: number[][] = [];
  const rest = pcs.slice(1);
  // Root is always included, pick k-1 from the rest
  function combo(start: number, chosen: number[]) {
    if (chosen.length === k - 1) {
      results.push([pcs[0], ...chosen]);
      return;
    }
    for (let i = start; i < rest.length; i++) {
      combo(i + 1, [...chosen, rest[i]]);
    }
  }
  combo(0, []);
  return results;
}

/** Compute Ian Ring number from pitch class set */
function pcsToRing(pcs: number[]): number {
  return pcs.reduce((sum, pc) => sum + (1 << pc), 0);
}

const ScaleCatalog: React.FC<ScaleCatalogProps> = ({
  scales,
  nameMap,
  favourites,
  onToggleFavourite,
  onVisualize,
  onClose,
}) => {
  const [filters, setFilters] = useState<ScaleFilters>(DEFAULT_FILTERS);
  const [expandedScale, setExpandedScale] = useState<number | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const expandedRef = useRef<HTMLDivElement | null>(null);

  const favouriteSet = useMemo(() => new Set(favourites), [favourites]);

  const scaleMap = useMemo(() => {
    const m = new Map<number, CatalogScale>();
    for (const s of scales) m.set(s.n, s);
    return m;
  }, [scales]);

  const filteredScales = useMemo(() => {
    return scales.filter(scale => {
      if (filters.search && !scale.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.showPrimeOnly && !scale.prime) return false;
      if (filters.showSymmetric && !scale.sym) return false;
      if (filters.showChords && (scale.card < 2 || scale.card > 4)) return false;
      if (filters.showHexatonic && scale.card !== 6) return false;
      if (filters.showBarryHarris && !isBarryHarrisScale(scale)) return false;
      if (filters.showFavourites && !favouriteSet.has(scale.n)) return false;
      if (filters.noteCount !== null && scale.card !== filters.noteCount) return false;
      return true;
    });
  }, [scales, filters, favouriteSet]);

  // Group by mode count
  const groupedScales = useMemo(() => {
    const groups = new Map<number, CatalogScale[]>();
    const favScales: CatalogScale[] = [];

    for (const scale of filteredScales) {
      if (favouriteSet.has(scale.n)) {
        favScales.push(scale);
      }
      const modeCount = scale.modes;
      if (!groups.has(modeCount)) groups.set(modeCount, []);
      groups.get(modeCount)!.push(scale);
    }

    for (const [, arr] of groups) {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    favScales.sort((a, b) => a.name.localeCompare(b.name));

    const sortedGroups = [...groups.entries()].sort((a, b) => a[0] - b[0]);

    return { favScales, sortedGroups };
  }, [filteredScales, favouriteSet]);

  const toggleGroup = useCallback((modeCount: number) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(modeCount)) next.delete(modeCount);
      else next.add(modeCount);
      return next;
    });
  }, []);

  const navigateToScale = useCallback((scaleNumber: number) => {
    setExpandedScale(scaleNumber);
    const scale = scaleMap.get(scaleNumber);
    if (scale) {
      setCollapsedGroups(prev => {
        const next = new Set(prev);
        next.delete(scale.modes);
        return next;
      });
    }
    setTimeout(() => {
      expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }, [scaleMap]);

  const handleLookupSelect = useCallback((scaleNumber: number) => {
    setIsLookupOpen(false);
    navigateToScale(scaleNumber);
  }, [navigateToScale]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLookupOpen) setIsLookupOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, isLookupOpen]);

  const updateFilter = <K extends keyof ScaleFilters>(key: K, value: ScaleFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  type FilterKey = 'showPrimeOnly' | 'showSymmetric' | 'showChords' | 'showHexatonic' | 'showBarryHarris' | 'showFavourites';

  const toggleFilter = (key: FilterKey) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filterChips: { key: FilterKey; label: string }[] = [
    { key: 'showFavourites', label: 'Favourites' },
    { key: 'showBarryHarris', label: 'Barry Harris' },
    { key: 'showPrimeOnly', label: 'Prime Only' },
    { key: 'showSymmetric', label: 'Symmetric' },
    { key: 'showChords', label: 'Chords (2-4)' },
    { key: 'showHexatonic', label: 'Hexatonic' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <h2 className="text-2xl font-bold text-cyan-400 flex-shrink-0">Scale Catalog</h2>
          <div className="flex-1 relative">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              placeholder="Search scales..."
              className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-white focus:ring-cyan-500 focus:border-cyan-500"
              autoFocus
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Close"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="max-w-5xl mx-auto mt-3 flex flex-wrap items-center gap-2">
          {filterChips.map(chip => (
            <button
              key={chip.key}
              onClick={() => toggleFilter(chip.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters[chip.key]
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {chip.label}
            </button>
          ))}
          <select
            value={filters.noteCount ?? ''}
            onChange={e => updateFilter('noteCount', e.target.value ? Number(e.target.value) : null)}
            className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-white"
          >
            <option value="">Any notes</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n} notes</option>
            ))}
          </select>
          <button
            onClick={() => setIsLookupOpen(true)}
            className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors ml-auto"
          >
            Custom Scale Lookup
          </button>
          <span className="text-sm text-gray-400">{filteredScales.length} scales</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto space-y-2">
          {/* Favourites section */}
          {groupedScales.favScales.length > 0 && !filters.showFavourites && (
            <GroupSection
              title={`Favourites (${groupedScales.favScales.length})`}
              isOpen={!collapsedGroups.has(-1)}
              onToggle={() => toggleGroup(-1)}
            >
              {groupedScales.favScales.map(scale => (
                <ScaleRow
                  key={`fav-${scale.n}`}
                  scale={scale}
                  isExpanded={expandedScale === scale.n}
                  isFavourite={true}
                  onToggleExpand={() => setExpandedScale(expandedScale === scale.n ? null : scale.n)}
                  onToggleFavourite={() => onToggleFavourite(scale.n)}
                  onVisualize={() => onVisualize(scale)}
                  onNavigate={navigateToScale}
                  nameMap={nameMap}
                  scaleMap={scaleMap}
                  expandedRef={expandedScale === scale.n ? expandedRef : undefined}
                />
              ))}
            </GroupSection>
          )}

          {/* Mode count groups */}
          {groupedScales.sortedGroups.map(([modeCount, groupScales]) => (
            <GroupSection
              key={modeCount}
              title={`${modeCount} mode${modeCount !== 1 ? 's' : ''} (${groupScales.length} scales)`}
              isOpen={!collapsedGroups.has(modeCount)}
              onToggle={() => toggleGroup(modeCount)}
            >
              {groupScales.map(scale => (
                <ScaleRow
                  key={scale.n}
                  scale={scale}
                  isExpanded={expandedScale === scale.n}
                  isFavourite={favouriteSet.has(scale.n)}
                  onToggleExpand={() => setExpandedScale(expandedScale === scale.n ? null : scale.n)}
                  onToggleFavourite={() => onToggleFavourite(scale.n)}
                  onVisualize={() => onVisualize(scale)}
                  onNavigate={navigateToScale}
                  nameMap={nameMap}
                  scaleMap={scaleMap}
                  expandedRef={expandedScale === scale.n ? expandedRef : undefined}
                />
              ))}
            </GroupSection>
          ))}
        </div>
      </div>

      {/* Scale Lookup modal */}
      {isLookupOpen && (
        <ScaleLookup
          scales={scales}
          nameMap={nameMap}
          onSelect={handleLookupSelect}
          onClose={() => setIsLookupOpen(false)}
        />
      )}
    </div>
  );
};

// --- Sub-components ---

const GroupSection: React.FC<{
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, isOpen, onToggle, children }) => (
  <div className="bg-gray-800/50 rounded-lg">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-3 text-left font-semibold text-cyan-400 hover:bg-gray-700/50 rounded-t-lg"
    >
      <span>{title}</span>
      <ChevronIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
    </button>
    {isOpen && <div className="px-2 pb-2 space-y-1">{children}</div>}
  </div>
);

interface ScaleRowProps {
  scale: CatalogScale;
  isExpanded: boolean;
  isFavourite: boolean;
  onToggleExpand: () => void;
  onToggleFavourite: () => void;
  onVisualize: () => void;
  onNavigate: (n: number) => void;
  nameMap: Record<string, string>;
  scaleMap: Map<number, CatalogScale>;
  expandedRef?: React.Ref<HTMLDivElement>;
}

const ScaleRow: React.FC<ScaleRowProps> = ({
  scale,
  isExpanded,
  isFavourite,
  onToggleExpand,
  onToggleFavourite,
  onVisualize,
  onNavigate,
  nameMap,
  expandedRef,
}) => {
  // Compute triads and tetrads from root (only when expanded)
  const chordsFromRoot = useMemo(() => {
    if (!isExpanded || scale.card < 3) return { triads: [], tetrads: [] };

    const triads: { pcs: number[]; ring: number; name: string }[] = [];
    const tetrads: { pcs: number[]; ring: number; name: string }[] = [];

    // Triads from root
    for (const subset of subsetsFromRoot(scale.pcs, 3)) {
      const ring = pcsToRing(subset);
      const name = nameMap[String(ring)] || '';
      triads.push({ pcs: subset, ring, name });
    }

    // Tetrads from root
    if (scale.card >= 4) {
      for (const subset of subsetsFromRoot(scale.pcs, 4)) {
        const ring = pcsToRing(subset);
        const name = nameMap[String(ring)] || '';
        tetrads.push({ pcs: subset, ring, name });
      }
    }

    return { triads, tetrads };
  }, [isExpanded, scale.pcs, scale.card, nameMap]);

  return (
    <div ref={expandedRef} className="bg-gray-900/50 rounded-md">
      {/* Row header */}
      <div
        className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-gray-700/50 rounded-md transition-colors"
        onClick={onToggleExpand}
      >
        <button
          onClick={e => { e.stopPropagation(); onToggleFavourite(); }}
          className={`flex-shrink-0 p-0.5 transition-colors ${isFavourite ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
          title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <StarIcon className="w-5 h-5" filled={isFavourite} />
        </button>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-white">{scale.name || `Scale #${scale.n}`}</span>
          <span className="text-gray-400 text-xs ml-2">#{scale.n}</span>
        </div>
        <span className="text-gray-400 text-sm flex-shrink-0 hidden sm:inline">
          {formatIntervals(scale.pcs)}
        </span>
        <span className="text-gray-500 text-xs flex-shrink-0">{scale.card} notes</span>
        <ChevronIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isExpanded ? '' : '-rotate-90'}`} />
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-700/50 space-y-3">
          {/* Intervals */}
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Intervals</span>
            <div className="text-sm text-cyan-300 mt-0.5">{formatIntervals(scale.pcs)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Structure: [{scale.iv.join(', ')}]</div>
          </div>

          {/* Flags */}
          <div className="flex gap-2 flex-wrap">
            {scale.prime && <span className="px-2 py-0.5 rounded text-xs bg-green-900/50 text-green-400">Prime</span>}
            {scale.sym && <span className="px-2 py-0.5 rounded text-xs bg-purple-900/50 text-purple-400">Symmetric</span>}
            {isBarryHarrisScale(scale) && <span className="px-2 py-0.5 rounded text-xs bg-blue-900/50 text-blue-400">Barry Harris</span>}
            {!scale.prime && <span className="text-xs text-gray-500">Prime form: {nameMap[String(scale.primeNum)] || `#${scale.primeNum}`} (#{scale.primeNum})</span>}
          </div>

          {/* Triads from Root */}
          {chordsFromRoot.triads.length > 0 && (
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Triads from Root ({chordsFromRoot.triads.length})</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {chordsFromRoot.triads.map(chord => (
                  <button
                    key={chord.ring}
                    onClick={() => onNavigate(chord.ring)}
                    className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
                    title={`[${chord.pcs.map(pc => INTERVAL_NAMES[pc]).join(', ')}]`}
                  >
                    {chord.name || `#${chord.ring}`} <span className="text-gray-500">{chord.pcs.map(pc => INTERVAL_NAMES[pc]).join('-')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tetrads from Root */}
          {chordsFromRoot.tetrads.length > 0 && (
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Tetrads from Root ({chordsFromRoot.tetrads.length})</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {chordsFromRoot.tetrads.map(chord => (
                  <button
                    key={chord.ring}
                    onClick={() => onNavigate(chord.ring)}
                    className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
                    title={`[${chord.pcs.map(pc => INTERVAL_NAMES[pc]).join(', ')}]`}
                  >
                    {chord.name || `#${chord.ring}`} <span className="text-gray-500">{chord.pcs.map(pc => INTERVAL_NAMES[pc]).join('-')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modes */}
          {scale.modeList.length > 0 && (
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Modes ({scale.modeList.length + 1})</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded text-xs bg-cyan-900/50 text-cyan-300 border border-cyan-800/50">
                  Mode 1: {scale.name || `#${scale.n}`}
                </span>
                {scale.modeList.map(mode => (
                  <button
                    key={mode.n}
                    onClick={() => onNavigate(mode.n)}
                    className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
                  >
                    Mode {mode.m}: {mode.name || `#${mode.n}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Direct subsets (children) */}
          {scale.directChildren.length > 0 && (
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Direct Subsets ({scale.directChildren.length}) <span className="normal-case">- remove 1 note</span></span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {scale.directChildren.map(childN => (
                  <button
                    key={childN}
                    onClick={() => onNavigate(childN)}
                    className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
                  >
                    {nameMap[String(childN)] || `#${childN}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Direct supersets (parents) */}
          {scale.directParents.length > 0 && (
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Direct Supersets ({scale.directParents.length}) <span className="normal-case">- add 1 note</span></span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {scale.directParents.map(parentN => (
                  <button
                    key={parentN}
                    onClick={() => onNavigate(parentN)}
                    className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-cyan-300 transition-colors"
                  >
                    {nameMap[String(parentN)] || `#${parentN}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Complement & Inverse */}
          <div className="flex gap-4 flex-wrap">
            {scale.complement > 0 && (
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Complement</span>
                <button
                  onClick={() => onNavigate(scale.complement)}
                  className="block text-sm text-gray-300 hover:text-cyan-300 transition-colors mt-0.5"
                >
                  {nameMap[String(scale.complement)] || `#${scale.complement}`}
                </button>
              </div>
            )}
            {scale.inverse > 0 && scale.inverse !== scale.n && (
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Inverse</span>
                <button
                  onClick={() => onNavigate(scale.inverse)}
                  className="block text-sm text-gray-300 hover:text-cyan-300 transition-colors mt-0.5"
                >
                  {nameMap[String(scale.inverse)] || `#${scale.inverse}`}
                </button>
              </div>
            )}
          </div>

          {/* Visualize button */}
          <button
            onClick={onVisualize}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-1.5 px-4 rounded-md transition-colors text-sm"
          >
            Visualize on Fretboard
          </button>
        </div>
      )}
    </div>
  );
};

export default ScaleCatalog;
