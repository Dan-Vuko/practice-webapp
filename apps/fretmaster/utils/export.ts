
import type { Tuning, HighlightedNote } from '../types';
import { FRET_COUNT } from '../constants';

const TAILWIND_COLORS: Record<string, string> = {
  'bg-red-500': '#ef4444',
  'bg-orange-500': '#f97316',
  'bg-amber-400': '#fbbf24',
  'bg-yellow-400': '#facc15',
  'bg-lime-500': '#84cc16',
  'bg-green-500': '#22c55e',
  'bg-emerald-500': '#10b981',
  'bg-teal-500': '#14b8a6',
  'bg-cyan-400': '#22d3ee',
  'bg-sky-500': '#0ea5e9',
  'bg-blue-500': '#3b82f6',
  'bg-indigo-500': '#6366f1',
  'bg-violet-600': '#7c3aed',
  'bg-violet-500': '#8b5cf6',
  'bg-purple-500': '#a855f7',
  'bg-fuchsia-500': '#d946ef',
  'bg-pink-500': '#ec4899',
  'bg-rose-500': '#f43f5e',
  'bg-slate-500': '#64748b',
  'bg-gray-500': '#6b7280',
  'bg-zinc-500': '#71717a',
  'bg-slate-600': '#475569',
  'bg-blue-400': '#60a5fa',
  'bg-pink-400': '#f472b6',
  'bg-indigo-400': '#818cf8',
};

interface ExportOptions {
  tuning: Tuning;
  highlightedNotes: Record<string, HighlightedNote>;
  structureName: string;
  intervals: string[];
  rootNote: string;
}

export const exportFretboardToPng = ({
  tuning,
  highlightedNotes,
  structureName,
  intervals,
  rootNote
}: ExportOptions) => {
  // Safety check to prevent crashes if tuning is invalid
  if (!tuning || !tuning.strings) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const strings = tuning.strings;
  const numStrings = strings.length;
  const numFrets = FRET_COUNT;

  // Layout Configuration
  const leftPadding = 80;
  const rightPadding = 60;
  const topPadding = 120; // Space for title
  const bottomPadding = 40;
  const fretboardWidth = 1000;
  const stringSpacing = 40;
  const fretboardHeight = (numStrings - 1) * stringSpacing;
  
  canvas.width = leftPadding + fretboardWidth + rightPadding;
  canvas.height = topPadding + fretboardHeight + bottomPadding;

  // Background
  ctx.fillStyle = '#111827'; // gray-900
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#22d3ee'; // cyan-400
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(structureName, canvas.width / 2, 50);

  // Intervals Subtitle
  ctx.fillStyle = '#9ca3af'; // gray-400
  ctx.font = '18px sans-serif';
  const subtitle = `Root: ${rootNote}  |  Intervals: ${intervals.join(', ')}`;
  ctx.fillText(subtitle, canvas.width / 2, 90);

  // Drawing Area Coordinates
  const startX = leftPadding;
  const startY = topPadding;

  // Calculate Fret Positions (approximating the CSS geometric spacing)
  const fretPositions: number[] = [0]; // Index 0 is the nut position (0 distance)
  let currentPos = 0;
  
  // Replicate logical spacing logic
  let totalCalculatedWidth = 0;
  const baseWidth = 80;
  const scale = 0.94;
  const calculatedWidths = [];
  for(let i=0; i<numFrets; i++) {
     const w = baseWidth * Math.pow(scale, i);
     calculatedWidths.push(w);
     totalCalculatedWidth += w;
  }
  const ratio = fretboardWidth / totalCalculatedWidth;
  
  for(let i=0; i<numFrets; i++) {
      currentPos += calculatedWidths[i] * ratio;
      fretPositions.push(currentPos);
  }

  // Draw Fretboard Background (Wood tint)
  ctx.fillStyle = 'rgba(139, 69, 19, 0.2)'; 
  ctx.fillRect(startX, startY, fretboardWidth, fretboardHeight);

  // Draw Nut
  ctx.strokeStyle = '#F5DEB3'; // Wheat/Nut color
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(startX, startY - 2);
  ctx.lineTo(startX, startY + fretboardHeight + 2);
  ctx.stroke();

  // Draw Frets (Vertical lines)
  ctx.strokeStyle = '#9ca3af'; // gray-400
  ctx.lineWidth = 2;
  // Start from index 1 (fret 1 wire)
  for (let i = 1; i <= numFrets; i++) {
      const x = startX + fretPositions[i];
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + fretboardHeight);
      ctx.stroke();
  }

  // Draw Strings (Horizontal lines)
  strings.forEach((_, i) => {
      const y = startY + i * stringSpacing;
      ctx.strokeStyle = '#d1d5db'; // gray-300
      ctx.lineWidth = 1 + i * 0.4; // Thicker low strings
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + fretboardWidth, y);
      ctx.stroke();
  });

  // Draw Fret Markers
  const singleMarkers = [3, 5, 7, 9, 15];
  const doubleMarkers = [12];
  ctx.fillStyle = 'rgba(156, 163, 175, 0.4)'; // gray-400 transparent
  const midY = startY + fretboardHeight / 2;

  singleMarkers.forEach(fret => {
      if (fret > numFrets) return;
      const x = startX + (fretPositions[fret] + fretPositions[fret-1]) / 2;
      ctx.beginPath();
      ctx.arc(x, midY, 8, 0, Math.PI * 2);
      ctx.fill();
  });

  doubleMarkers.forEach(fret => {
      if (fret > numFrets) return;
      const x = startX + (fretPositions[fret] + fretPositions[fret-1]) / 2;
      ctx.beginPath();
      ctx.arc(x, startY + fretboardHeight * 0.25, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, startY + fretboardHeight * 0.75, 8, 0, Math.PI * 2);
      ctx.fill();
  });

  // Draw Notes
  Object.entries(highlightedNotes).forEach(([key, note]) => {
      const [stringIdxStr, fretStr] = key.split('-');
      const stringIdx = parseInt(stringIdxStr);
      const fret = parseInt(fretStr);

      if (stringIdx >= numStrings || fret > numFrets) return;

      const y = startY + stringIdx * stringSpacing;
      let x;
      if (fret === 0) {
          x = startX - 35; // Open string position to left of nut
      } else {
          x = startX + (fretPositions[fret] + fretPositions[fret-1]) / 2;
      }

      // Note Circle
      const colorHex = TAILWIND_COLORS[note.bgColor] || '#6b7280';
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      if (note.ringClassName) {
          const ringColorKey = `bg-${note.ringClassName.replace('ring-', '')}`;
          const ringHex = TAILWIND_COLORS[ringColorKey];
          if (ringHex) {
              ctx.lineWidth = 3;
              ctx.strokeStyle = ringHex;
              ctx.stroke();
          }
      }

      // Label
      ctx.fillStyle = note.textColor === 'text-black' ? '#000000' : '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(note.label, x, y + 1);
  });

  // Draw String Names (Left of nut)
  ctx.fillStyle = '#22d3ee'; // cyan-400
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'right';
  strings.forEach((s, i) => {
     // Extract display name from noteMap or just parse
     // Simple parse for now:
     const name = s.replace(/\d+/, '');
     const y = startY + i * stringSpacing;
     // Only draw if not covered by an open note
     const hasOpenNote = highlightedNotes[`${i}-0`];
     if (!hasOpenNote) {
       ctx.fillText(name, startX - 10, y + 5);
     }
  });

  // Download
  const filename = `${structureName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
