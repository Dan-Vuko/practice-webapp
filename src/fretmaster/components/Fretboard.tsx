import React from 'react';
import type { Tuning, HighlightedNote, FretboardTheme } from '../types';
import { FRET_COUNT } from '../constants';
import { getNoteOnFret } from '../utils/music';

interface FretboardProps {
  tuning: Tuning;
  highlightedNotes: Record<string, HighlightedNote>;
  onNoteClick: (stringIndex: number, fret: number) => void;
  theme: FretboardTheme;
}

const FretMarkers = React.memo(({ numStrings, theme }: { numStrings: number, theme: FretboardTheme }) => {
  const singleMarkers = [3, 5, 7, 9, 15];
  const doubleMarker = 12;

  const middleStringRow = Math.ceil(numStrings / 2) + 1;
  const doubleMarkerTopRow = Math.floor(numStrings / 3) + 2;
  const doubleMarkerBottomRow = Math.ceil(numStrings * 2 / 3) + 1;

  return (
    <>
      {singleMarkers.map(fret => (
        <div
          key={`marker-single-${fret}`}
          className="flex justify-center items-center pointer-events-none z-0"
          style={{ gridColumn: fret + 2, gridRow: middleStringRow }}
        >
          <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${theme.markerColor} rounded-full`} />
        </div>
      ))}
      <div
        key="marker-double-1"
        className="flex justify-center items-center pointer-events-none z-0"
        style={{ gridColumn: doubleMarker + 2, gridRow: doubleMarkerTopRow }}
      >
        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${theme.markerColor} rounded-full`} />
      </div>
      <div
        key="marker-double-2"
        className="flex justify-center items-center pointer-events-none z-0"
        style={{ gridColumn: doubleMarker + 2, gridRow: doubleMarkerBottomRow }}
      >
        <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${theme.markerColor} rounded-full`} />
      </div>
    </>
  );
});

const Fretboard: React.FC<FretboardProps> = ({ tuning, highlightedNotes, onNoteClick, theme }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    
    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const fretNumbers = Array.from({ length: FRET_COUNT + 1 }, (_, i) => i);

  const fretWidths = React.useMemo(() => {
    const openFretWidth = 20;
    const baseWidth = 80;
    const scaleFactor = 0.94;
    
    let calculatedWidths = [openFretWidth];
    let totalFretSpaceWidth = openFretWidth;

    for (let i = 1; i <= FRET_COUNT; i++) {
      const width = baseWidth * Math.pow(scaleFactor, i - 1);
      calculatedWidths.push(width);
      totalFretSpaceWidth += width;
    }

    const stringLabelWidth = 40;
    const minFretboardDisplayWidth = totalFretSpaceWidth + stringLabelWidth;
    
    if (containerWidth > minFretboardDisplayWidth) {
      const availableFretSpace = containerWidth - stringLabelWidth;
      const scalingRatio = availableFretSpace / totalFretSpaceWidth;
      return calculatedWidths.map(w => w * scalingRatio);
    }

    return calculatedWidths;
  }, [containerWidth]);
  
  const numStrings = tuning?.strings?.length || 6;
  const gridTemplateColumns = `minmax(30px, 40px) ${fretWidths.map(w => `${w.toFixed(2)}px`).join(' ')}`;

  return (
    <div ref={containerRef} className="flex-1 bg-gray-900/40 p-2 sm:p-4 rounded-xl shadow-inner overflow-x-auto min-w-0 min-h-0 flex flex-col justify-center">
      <div 
        className="grid relative min-w-max" 
        style={{
          gridTemplateColumns,
          gridTemplateRows: `auto repeat(${numStrings}, 2.5rem)`,
        }}
      >
        <div className="contents">
          {fretNumbers.slice(1).map(fret => (
            <div key={`fret-num-${fret}`} className="text-center text-[10px] font-bold text-gray-500 uppercase pb-1" style={{ gridColumn: fret + 2, gridRow: 1 }}>
              {fret}
            </div>
          ))}
        </div>

        <div 
          className={`absolute inset-y-0 ${theme.woodColor} rounded-r-lg shadow-2xl z-0 transition-colors duration-500`} 
          style={{ gridColumn: `3 / span ${FRET_COUNT}`, gridRow: `2 / span ${numStrings}`}}
        />

        <div 
          className={`h-full w-2 ${theme.nutColor} rounded-l-sm z-10 transition-colors duration-500 shadow-lg`} 
          style={{ gridColumn: 2, gridRow: `2 / span ${numStrings}`, justifySelf: 'end' }} 
        />

        {fretNumbers.slice(1).map(fret => (
          <div 
            key={`fret-wire-${fret}`} 
            className={`h-full w-[2px] ${theme.fretColor} z-10 transition-colors duration-500 shadow-sm`} 
            style={{ gridColumn: fret + 2, gridRow: `2 / span ${numStrings}`, justifySelf: 'end' }} 
          />
        ))}
        
        <FretMarkers numStrings={numStrings} theme={theme} />
        
        {tuning?.strings?.map((openNote, stringIndex) => {
          const row = stringIndex + 2;
          const stringThickness = stringIndex * 0.2 + 1.5;

          return (
            <React.Fragment key={`string-${stringIndex}`}>
              <div
                className="bg-gray-400/80 z-0 pointer-events-none shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                style={{
                  gridRow: row,
                  gridColumn: '1 / -1',
                  height: `${stringThickness}px`,
                  alignSelf: 'center',
                }}
              />
              <div className={`flex items-center justify-center ${theme.labelColor} font-black text-xs z-20 transition-colors duration-500`} style={{ gridRow: row, gridColumn: 1 }}>
                {getNoteOnFret(openNote, 0).displayName}
              </div>
              
              {fretNumbers.map(fret => {
                const key = `${stringIndex}-${fret}`;
                const highlighted = highlightedNotes[key];

                return (
                  <div
                    key={key}
                    className="flex items-center justify-center h-full z-20"
                    style={{ gridRow: row, gridColumn: fret + 2 }}
                  >
                    <div
                      className="w-full h-full flex items-center justify-center cursor-pointer rounded-full transition-transform duration-100 ease-in-out group active:scale-95"
                      onClick={() => onNoteClick(stringIndex, fret)}
                    >
                      {!highlighted && <div className="w-3 h-3 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100"></div>}
                      {highlighted && (
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-xl transform transition-all duration-300 animate-in fade-in zoom-in ${highlighted.bgColor} ${highlighted.textColor} ${highlighted.ringClassName ? `ring-2 ${highlighted.ringClassName}` : ''}`}>
                          <span className="drop-shadow-sm">{highlighted.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Fretboard;