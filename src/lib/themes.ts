// Theme configuration for Speed Builder
// Each theme defines a complete color palette that maps to CSS variables

export interface AccentColors {
  default: string     // Main accent color
  hover: string       // Hover state
  dark: string        // Darker shade
  muted: string       // Lighter/muted shade
  bg: string          // Background tint
  bgStrong: string    // Stronger background tint
  border: string      // Border with this accent
}

export interface ThemeColors {
  // Background layers (darkest to lightest)
  bg: {
    base: string      // App background
    surface: string   // Card backgrounds
    elevated: string  // Elevated cards, modals, inputs
    hover: string     // Hover states
    active: string    // Active/pressed states
  }
  // Border colors
  border: {
    default: string   // Default borders
    hover: string     // Hover borders
    strong: string    // Emphasized borders
  }
  // Text colors
  text: {
    primary: string   // Main text (white)
    secondary: string // Muted text
    tertiary: string  // Disabled/placeholder
    muted: string     // Slightly muted
  }
  // Primary accent (Purple in Gemini theme)
  primary: AccentColors
  // Secondary accent (Green in Gemini theme)
  secondary: AccentColors
  // Tertiary accent (Blue in Gemini theme)
  tertiary: AccentColors
  // Status colors
  status: {
    error: string
    errorHover: string
    warning: string
    warningMuted: string
    info: string
  }
  // Beat indicator colors (metronome)
  beat: {
    loud: string      // Accented beat
    normal: string    // Normal beat
    soft: string      // Ghost/soft beat
  }
  // Gradients
  gradients: {
    title: string
    button: string
    buttonHover: string
    progress: string
  }
}

export interface Theme {
  id: string
  name: string
  description: string
  colors: ThemeColors
}

// ==========================================
// GEMINI THEME (Original - Default)
// Based on exact Tailwind colors used in app
// ==========================================
const geminiTheme: Theme = {
  id: 'gemini',
  name: 'Gemini',
  description: 'Original purple & green theme',
  colors: {
    bg: {
      base: '#111827',      // gray-900
      surface: '#1f2937',   // gray-800
      elevated: '#374151',  // gray-700
      hover: '#4b5563',     // gray-600
      active: '#6b7280',    // gray-500
    },
    border: {
      default: '#374151',   // gray-700
      hover: '#4b5563',     // gray-600
      strong: '#6b7280',    // gray-500
    },
    text: {
      primary: '#ffffff',   // white
      secondary: '#9ca3af', // gray-400
      tertiary: '#6b7280',  // gray-500
      muted: '#d1d5db',     // gray-300
    },
    primary: {
      default: '#a855f7',         // purple-500
      hover: '#9333ea',           // purple-600
      dark: '#7c3aed',            // purple-700
      muted: '#c084fc',           // purple-400
      bg: 'rgba(88, 28, 135, 0.2)',       // purple-900/20
      bgStrong: 'rgba(88, 28, 135, 0.3)', // purple-900/30
      border: 'rgba(168, 85, 247, 0.5)',  // purple-500/50
    },
    secondary: {
      default: '#22c55e',         // green-500
      hover: '#16a34a',           // green-600
      dark: '#15803d',            // green-700
      muted: '#4ade80',           // green-400
      bg: 'rgba(20, 83, 45, 0.2)',        // green-900/20
      bgStrong: 'rgba(20, 83, 45, 0.3)',  // green-900/30
      border: '#22c55e',          // green-500
    },
    tertiary: {
      default: '#3b82f6',         // blue-500
      hover: '#2563eb',           // blue-600
      dark: '#1e3a8a',            // blue-900
      muted: '#60a5fa',           // blue-400
      bg: 'rgba(30, 58, 138, 0.5)',       // blue-900/50
      bgStrong: 'rgba(30, 58, 138, 0.7)', // blue-900/70
      border: '#3b82f6',          // blue-500
    },
    status: {
      error: '#ef4444',           // red-500
      errorHover: '#dc2626',      // red-600
      warning: '#f59e0b',         // yellow-500
      warningMuted: '#facc15',    // yellow-400
      info: '#f97316',            // orange-400
    },
    beat: {
      loud: '#ef4444',            // red-500
      normal: '#60a5fa',          // blue-400
      soft: '#6b7280',            // gray-500
    },
    gradients: {
      title: 'linear-gradient(to right, #a855f7, #22c55e)',
      button: 'linear-gradient(to right, #9333ea, #3b82f6)',
      buttonHover: 'linear-gradient(to right, #7c3aed, #2563eb)',
      progress: 'linear-gradient(to right, #a855f7, #22c55e)',
    },
  },
}

// ==========================================
// ONYX TEAL THEME
// Dark carbon with teal/magenta accents
// ==========================================
const onyxTealTheme: Theme = {
  id: 'onyx-teal',
  name: 'Onyx Teal',
  description: 'Dark carbon with teal accents',
  colors: {
    bg: {
      base: '#0a0a0a',
      surface: '#141414',
      elevated: '#1e1e1e',
      hover: '#282828',
      active: '#323232',
    },
    border: {
      default: '#2a2a2a',
      hover: '#3a3a3a',
      strong: '#4a4a4a',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#a3a3a3',
      tertiary: '#737373',
      muted: '#d4d4d4',
    },
    primary: {
      default: '#14b8a6',         // teal-500
      hover: '#0d9488',           // teal-600
      dark: '#0f766e',            // teal-700
      muted: '#2dd4bf',           // teal-400
      bg: 'rgba(13, 148, 136, 0.15)',
      bgStrong: 'rgba(13, 148, 136, 0.25)',
      border: 'rgba(20, 184, 166, 0.5)',
    },
    secondary: {
      default: '#ec4899',         // pink-500
      hover: '#db2777',           // pink-600
      dark: '#be185d',            // pink-700
      muted: '#f472b6',           // pink-400
      bg: 'rgba(219, 39, 119, 0.15)',
      bgStrong: 'rgba(219, 39, 119, 0.25)',
      border: '#ec4899',
    },
    tertiary: {
      default: '#8b5cf6',         // violet-500
      hover: '#7c3aed',           // violet-600
      dark: '#5b21b6',            // violet-800
      muted: '#a78bfa',           // violet-400
      bg: 'rgba(139, 92, 246, 0.2)',
      bgStrong: 'rgba(139, 92, 246, 0.35)',
      border: '#8b5cf6',
    },
    status: {
      error: '#f43f5e',           // rose-500
      errorHover: '#e11d48',      // rose-600
      warning: '#f59e0b',
      warningMuted: '#fbbf24',
      info: '#06b6d4',            // cyan-500
    },
    beat: {
      loud: '#f43f5e',
      normal: '#2dd4bf',
      soft: '#525252',
    },
    gradients: {
      title: 'linear-gradient(to right, #14b8a6, #ec4899)',
      button: 'linear-gradient(to right, #0d9488, #8b5cf6)',
      buttonHover: 'linear-gradient(to right, #0f766e, #7c3aed)',
      progress: 'linear-gradient(to right, #14b8a6, #ec4899)',
    },
  },
}

// ==========================================
// MIDNIGHT VIOLET THEME
// Deep blue-purple aesthetic
// ==========================================
const midnightTheme: Theme = {
  id: 'midnight',
  name: 'Midnight Violet',
  description: 'Deep purple with cool undertones',
  colors: {
    bg: {
      base: '#0c0a1d',
      surface: '#13102a',
      elevated: '#1d1838',
      hover: '#272045',
      active: '#312952',
    },
    border: {
      default: '#2d2654',
      hover: '#3d3464',
      strong: '#4d4474',
    },
    text: {
      primary: '#f0f0ff',
      secondary: '#a5a5c0',
      tertiary: '#6b6b8a',
      muted: '#d0d0e0',
    },
    primary: {
      default: '#a855f7',         // purple-500
      hover: '#9333ea',           // purple-600
      dark: '#7c3aed',            // purple-700
      muted: '#c084fc',           // purple-400
      bg: 'rgba(147, 51, 234, 0.15)',
      bgStrong: 'rgba(147, 51, 234, 0.25)',
      border: 'rgba(168, 85, 247, 0.5)',
    },
    secondary: {
      default: '#06b6d4',         // cyan-500
      hover: '#0891b2',           // cyan-600
      dark: '#0e7490',            // cyan-700
      muted: '#22d3ee',           // cyan-400
      bg: 'rgba(8, 145, 178, 0.15)',
      bgStrong: 'rgba(8, 145, 178, 0.25)',
      border: '#06b6d4',
    },
    tertiary: {
      default: '#f472b6',         // pink-400
      hover: '#ec4899',           // pink-500
      dark: '#db2777',            // pink-600
      muted: '#f9a8d4',           // pink-300
      bg: 'rgba(236, 72, 153, 0.2)',
      bgStrong: 'rgba(236, 72, 153, 0.35)',
      border: '#f472b6',
    },
    status: {
      error: '#fb7185',           // rose-400
      errorHover: '#f43f5e',      // rose-500
      warning: '#fbbf24',
      warningMuted: '#fde047',
      info: '#38bdf8',            // sky-400
    },
    beat: {
      loud: '#fb7185',
      normal: '#818cf8',          // indigo-400
      soft: '#4d4474',
    },
    gradients: {
      title: 'linear-gradient(to right, #a855f7, #06b6d4)',
      button: 'linear-gradient(to right, #9333ea, #f472b6)',
      buttonHover: 'linear-gradient(to right, #7c3aed, #ec4899)',
      progress: 'linear-gradient(to right, #a855f7, #06b6d4)',
    },
  },
}

// ==========================================
// FOREST DEEP THEME
// Earthy greens with warm accents
// ==========================================
const forestTheme: Theme = {
  id: 'forest',
  name: 'Forest Deep',
  description: 'Earthy greens with amber accents',
  colors: {
    bg: {
      base: '#0d1512',
      surface: '#121c18',
      elevated: '#18241f',
      hover: '#1f2d27',
      active: '#26362f',
    },
    border: {
      default: '#2d3f36',
      hover: '#3a4f44',
      strong: '#4a5f54',
    },
    text: {
      primary: '#e8f0ec',
      secondary: '#a0b8a8',
      tertiary: '#708878',
      muted: '#c8dcd0',
    },
    primary: {
      default: '#22c55e',         // green-500
      hover: '#16a34a',           // green-600
      dark: '#15803d',            // green-700
      muted: '#4ade80',           // green-400
      bg: 'rgba(22, 163, 74, 0.15)',
      bgStrong: 'rgba(22, 163, 74, 0.25)',
      border: 'rgba(34, 197, 94, 0.5)',
    },
    secondary: {
      default: '#f59e0b',         // amber-500
      hover: '#d97706',           // amber-600
      dark: '#b45309',            // amber-700
      muted: '#fbbf24',           // amber-400
      bg: 'rgba(217, 119, 6, 0.15)',
      bgStrong: 'rgba(217, 119, 6, 0.25)',
      border: '#f59e0b',
    },
    tertiary: {
      default: '#84cc16',         // lime-500
      hover: '#65a30d',           // lime-600
      dark: '#4d7c0f',            // lime-700
      muted: '#a3e635',           // lime-400
      bg: 'rgba(101, 163, 13, 0.2)',
      bgStrong: 'rgba(101, 163, 13, 0.35)',
      border: '#84cc16',
    },
    status: {
      error: '#ef4444',
      errorHover: '#dc2626',
      warning: '#fbbf24',
      warningMuted: '#fde047',
      info: '#fb923c',            // orange-400
    },
    beat: {
      loud: '#ef4444',
      normal: '#4ade80',
      soft: '#4a5f54',
    },
    gradients: {
      title: 'linear-gradient(to right, #22c55e, #f59e0b)',
      button: 'linear-gradient(to right, #16a34a, #84cc16)',
      buttonHover: 'linear-gradient(to right, #15803d, #65a30d)',
      progress: 'linear-gradient(to right, #22c55e, #f59e0b)',
    },
  },
}

// ==========================================
// CRIMSON STEEL THEME
// Dark slate with warm red accents
// ==========================================
const crimsonSteelTheme: Theme = {
  id: 'crimson-steel',
  name: 'Crimson Steel',
  description: 'Dark slate with crimson accents',
  colors: {
    bg: {
      base: '#0f1114',
      surface: '#181b20',
      elevated: '#21252c',
      hover: '#2b3038',
      active: '#353b44',
    },
    border: {
      default: '#2f343d',
      hover: '#3f454f',
      strong: '#4f5661',
    },
    text: {
      primary: '#f5f5f7',
      secondary: '#9ca3af',
      tertiary: '#6b7280',
      muted: '#d1d5db',
    },
    primary: {
      default: '#ef4444',         // red-500
      hover: '#dc2626',           // red-600
      dark: '#b91c1c',            // red-700
      muted: '#f87171',           // red-400
      bg: 'rgba(220, 38, 38, 0.15)',
      bgStrong: 'rgba(220, 38, 38, 0.25)',
      border: 'rgba(239, 68, 68, 0.5)',
    },
    secondary: {
      default: '#f97316',         // orange-500
      hover: '#ea580c',           // orange-600
      dark: '#c2410c',            // orange-700
      muted: '#fb923c',           // orange-400
      bg: 'rgba(234, 88, 12, 0.15)',
      bgStrong: 'rgba(234, 88, 12, 0.25)',
      border: '#f97316',
    },
    tertiary: {
      default: '#eab308',         // yellow-500
      hover: '#ca8a04',           // yellow-600
      dark: '#a16207',            // yellow-700
      muted: '#facc15',           // yellow-400
      bg: 'rgba(202, 138, 4, 0.2)',
      bgStrong: 'rgba(202, 138, 4, 0.35)',
      border: '#eab308',
    },
    status: {
      error: '#f43f5e',
      errorHover: '#e11d48',
      warning: '#fbbf24',
      warningMuted: '#fde047',
      info: '#38bdf8',
    },
    beat: {
      loud: '#ef4444',
      normal: '#fb923c',
      soft: '#4f5661',
    },
    gradients: {
      title: 'linear-gradient(to right, #ef4444, #f97316)',
      button: 'linear-gradient(to right, #dc2626, #eab308)',
      buttonHover: 'linear-gradient(to right, #b91c1c, #ca8a04)',
      progress: 'linear-gradient(to right, #ef4444, #f97316)',
    },
  },
}

// ==========================================
// DEEP MOSS THEME
// Very muted, dark green/gunmetal aesthetic
// ==========================================
const deepMossTheme: Theme = {
  id: 'deep-moss',
  name: 'Deep Moss',
  description: 'Muted dark greens & gunmetal',
  colors: {
    bg: {
      base: '#0D3A32',        // Dark green - darkest
      surface: '#192A3C',     // Prussian blue - cards
      elevated: '#224942',    // Brunswick green - inputs
      hover: '#223546',       // Gunmetal - hover
      active: '#245B47',      // Castleton green - active
    },
    border: {
      default: '#223546',     // Gunmetal
      hover: '#2d4a5a',       // Slightly lighter gunmetal
      strong: '#245B47',      // Castleton green
    },
    text: {
      primary: '#c4d4cf',     // Muted light sage
      secondary: '#7a9a8e',   // Muted green-gray
      tertiary: '#4a6a5e',    // Darker muted green
      muted: '#9ab5a8',       // Soft sage
    },
    primary: {
      default: '#4a8a6a',     // Muted forest green
      hover: '#3d7359',       // Darker muted green
      dark: '#2d5a45',        // Deep muted green
      muted: '#6aaa8a',       // Lighter muted green
      bg: 'rgba(74, 138, 106, 0.12)',
      bgStrong: 'rgba(74, 138, 106, 0.2)',
      border: 'rgba(74, 138, 106, 0.4)',
    },
    secondary: {
      default: '#5a7a8a',     // Muted steel blue
      hover: '#4a6a7a',       // Darker steel
      dark: '#3a5a6a',        // Deep steel
      muted: '#7a9aaa',       // Lighter steel
      bg: 'rgba(90, 122, 138, 0.12)',
      bgStrong: 'rgba(90, 122, 138, 0.2)',
      border: 'rgba(90, 122, 138, 0.4)',
    },
    tertiary: {
      default: '#6a8a7a',     // Sage green
      hover: '#5a7a6a',       // Darker sage
      dark: '#4a6a5a',        // Deep sage
      muted: '#8aaaa0',       // Lighter sage
      bg: 'rgba(106, 138, 122, 0.15)',
      bgStrong: 'rgba(106, 138, 122, 0.25)',
      border: 'rgba(106, 138, 122, 0.4)',
    },
    status: {
      error: '#8a5a5a',       // Muted dusty red
      errorHover: '#7a4a4a',  // Darker dusty red
      warning: '#8a7a5a',     // Muted ochre
      warningMuted: '#9a8a6a',// Lighter ochre
      info: '#5a7a8a',        // Muted steel (same as secondary)
    },
    beat: {
      loud: '#8a5a5a',        // Muted dusty red
      normal: '#5a7a8a',      // Muted steel blue
      soft: '#3a4a44',        // Very dark muted
    },
    gradients: {
      title: 'linear-gradient(to right, #4a8a6a, #5a7a8a)',
      button: 'linear-gradient(to right, #3d7359, #4a6a7a)',
      buttonHover: 'linear-gradient(to right, #2d5a45, #3a5a6a)',
      progress: 'linear-gradient(to right, #4a8a6a, #6a8a7a)',
    },
  },
}

// ==========================================
// NOIR THEME
// Pure grayscale monochrome aesthetic
// ==========================================
const noirTheme: Theme = {
  id: 'noir',
  name: 'Noir',
  description: 'Pure monochrome grayscale',
  colors: {
    bg: {
      base: '#020202',        // Rich black - darkest
      surface: '#1A1A1A',     // Eerie black - cards
      elevated: '#323232',    // Jet - inputs
      hover: '#4D4D4D',       // Davy's gray - hover
      active: '#888888',      // Battleship gray - active
    },
    border: {
      default: '#323232',     // Jet
      hover: '#4D4D4D',       // Davy's gray
      strong: '#888888',      // Battleship gray
    },
    text: {
      primary: '#e5e5e5',     // Light gray
      secondary: '#888888',   // Battleship gray
      tertiary: '#4D4D4D',    // Davy's gray
      muted: '#b0b0b0',       // Silver
    },
    primary: {
      default: '#888888',     // Battleship gray
      hover: '#707070',       // Slightly darker
      dark: '#4D4D4D',        // Davy's gray
      muted: '#a0a0a0',       // Lighter gray
      bg: 'rgba(136, 136, 136, 0.1)',
      bgStrong: 'rgba(136, 136, 136, 0.18)',
      border: 'rgba(136, 136, 136, 0.4)',
    },
    secondary: {
      default: '#707070',     // Mid gray
      hover: '#606060',       // Darker
      dark: '#4D4D4D',        // Davy's gray
      muted: '#909090',       // Lighter
      bg: 'rgba(112, 112, 112, 0.1)',
      bgStrong: 'rgba(112, 112, 112, 0.18)',
      border: 'rgba(112, 112, 112, 0.4)',
    },
    tertiary: {
      default: '#606060',     // Dark gray
      hover: '#505050',       // Darker
      dark: '#404040',        // Even darker
      muted: '#808080',       // Medium gray
      bg: 'rgba(96, 96, 96, 0.12)',
      bgStrong: 'rgba(96, 96, 96, 0.2)',
      border: 'rgba(96, 96, 96, 0.4)',
    },
    status: {
      error: '#a06060',       // Muted red-gray
      errorHover: '#905050',  // Darker
      warning: '#a09060',     // Muted yellow-gray
      warningMuted: '#b0a070',// Lighter
      info: '#606080',        // Muted blue-gray
    },
    beat: {
      loud: '#c0c0c0',        // Bright silver
      normal: '#707070',      // Mid gray
      soft: '#323232',        // Jet
    },
    gradients: {
      title: 'linear-gradient(to right, #888888, #b0b0b0)',
      button: 'linear-gradient(to right, #4D4D4D, #707070)',
      buttonHover: 'linear-gradient(to right, #323232, #606060)',
      progress: 'linear-gradient(to right, #4D4D4D, #888888)',
    },
  },
}

// ==========================================
// OBSIDIAN THEME
// Pure black monochromatic
// ==========================================
const obsidianTheme: Theme = {
  id: 'obsidian',
  name: 'Obsidian',
  description: 'Pure black monochrome',
  colors: {
    bg: {
      base: '#000000',        // Black - darkest
      surface: '#141414',     // Night - cards
      elevated: '#1D1D1D',    // Eerie black - inputs
      hover: '#272728',       // Raisin black - hover
      active: '#313131',      // Jet - active
    },
    border: {
      default: '#1D1D1D',     // Eerie black
      hover: '#272728',       // Raisin black
      strong: '#313131',      // Jet
    },
    text: {
      primary: '#e0e0e0',     // Light gray
      secondary: '#808080',   // Gray
      tertiary: '#505050',    // Dark gray
      muted: '#a0a0a0',       // Silver
    },
    primary: {
      default: '#606060',     // Mid gray
      hover: '#505050',       // Darker
      dark: '#404040',        // Dark
      muted: '#707070',       // Lighter
      bg: 'rgba(96, 96, 96, 0.1)',
      bgStrong: 'rgba(96, 96, 96, 0.18)',
      border: 'rgba(96, 96, 96, 0.4)',
    },
    secondary: {
      default: '#505050',     // Dark gray
      hover: '#454545',       // Darker
      dark: '#353535',        // Very dark
      muted: '#656565',       // Lighter
      bg: 'rgba(80, 80, 80, 0.1)',
      bgStrong: 'rgba(80, 80, 80, 0.18)',
      border: 'rgba(80, 80, 80, 0.4)',
    },
    tertiary: {
      default: '#454545',     // Dark gray
      hover: '#3a3a3a',       // Darker
      dark: '#2a2a2a',        // Very dark
      muted: '#5a5a5a',       // Lighter
      bg: 'rgba(69, 69, 69, 0.12)',
      bgStrong: 'rgba(69, 69, 69, 0.2)',
      border: 'rgba(69, 69, 69, 0.4)',
    },
    status: {
      error: '#804040',       // Very muted red
      errorHover: '#703535',  // Darker
      warning: '#807040',     // Very muted yellow
      warningMuted: '#908050',// Lighter
      info: '#405060',        // Very muted blue
    },
    beat: {
      loud: '#909090',        // Bright gray
      normal: '#505050',      // Mid gray
      soft: '#1D1D1D',        // Eerie black
    },
    gradients: {
      title: 'linear-gradient(to right, #606060, #909090)',
      button: 'linear-gradient(to right, #313131, #505050)',
      buttonHover: 'linear-gradient(to right, #272728, #454545)',
      progress: 'linear-gradient(to right, #313131, #606060)',
    },
  },
}

export const themes: Theme[] = [
  geminiTheme,
  onyxTealTheme,
  midnightTheme,
  forestTheme,
  crimsonSteelTheme,
  deepMossTheme,
  noirTheme,
  obsidianTheme,
]

export const defaultThemeId = 'gemini'

export function getThemeById(id: string): Theme {
  return themes.find(t => t.id === id) || themes[0]
}

// Generate CSS variables from theme
export function themeToCssVars(theme: Theme): Record<string, string> {
  const { colors } = theme
  return {
    // Background layers
    '--bg-base': colors.bg.base,
    '--bg-surface': colors.bg.surface,
    '--bg-elevated': colors.bg.elevated,
    '--bg-hover': colors.bg.hover,
    '--bg-active': colors.bg.active,

    // Borders
    '--border-default': colors.border.default,
    '--border-hover': colors.border.hover,
    '--border-strong': colors.border.strong,

    // Text
    '--text-primary': colors.text.primary,
    '--text-secondary': colors.text.secondary,
    '--text-tertiary': colors.text.tertiary,
    '--text-muted': colors.text.muted,

    // Primary accent
    '--accent-primary': colors.primary.default,
    '--accent-primary-hover': colors.primary.hover,
    '--accent-primary-dark': colors.primary.dark,
    '--accent-primary-muted': colors.primary.muted,
    '--accent-primary-bg': colors.primary.bg,
    '--accent-primary-bg-strong': colors.primary.bgStrong,
    '--accent-primary-border': colors.primary.border,

    // Secondary accent
    '--accent-secondary': colors.secondary.default,
    '--accent-secondary-hover': colors.secondary.hover,
    '--accent-secondary-dark': colors.secondary.dark,
    '--accent-secondary-muted': colors.secondary.muted,
    '--accent-secondary-bg': colors.secondary.bg,
    '--accent-secondary-bg-strong': colors.secondary.bgStrong,
    '--accent-secondary-border': colors.secondary.border,

    // Tertiary accent
    '--accent-tertiary': colors.tertiary.default,
    '--accent-tertiary-hover': colors.tertiary.hover,
    '--accent-tertiary-dark': colors.tertiary.dark,
    '--accent-tertiary-muted': colors.tertiary.muted,
    '--accent-tertiary-bg': colors.tertiary.bg,
    '--accent-tertiary-bg-strong': colors.tertiary.bgStrong,
    '--accent-tertiary-border': colors.tertiary.border,

    // Status
    '--status-error': colors.status.error,
    '--status-error-hover': colors.status.errorHover,
    '--status-warning': colors.status.warning,
    '--status-warning-muted': colors.status.warningMuted,
    '--status-info': colors.status.info,

    // Beat indicators
    '--beat-loud': colors.beat.loud,
    '--beat-normal': colors.beat.normal,
    '--beat-soft': colors.beat.soft,

    // Gradients
    '--gradient-title': colors.gradients.title,
    '--gradient-button': colors.gradients.button,
    '--gradient-button-hover': colors.gradients.buttonHover,
    '--gradient-progress': colors.gradients.progress,
  }
}
