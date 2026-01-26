/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===========================================
        // THEME SYSTEM - Maps to CSS variables
        // Change theme by updating :root in index.css
        // ===========================================

        // Background layers
        theme: {
          base: 'var(--bg-base)',           // App background (gray-900)
          surface: 'var(--bg-surface)',     // Cards (gray-800)
          elevated: 'var(--bg-elevated)',   // Inputs, elevated (gray-700)
          hover: 'var(--bg-hover)',         // Hover states (gray-600)
          active: 'var(--bg-active)',       // Active/pressed (gray-500)
        },

        // Border colors
        border: {
          DEFAULT: 'var(--border-default)',  // gray-700
          hover: 'var(--border-hover)',      // gray-600
          strong: 'var(--border-strong)',    // gray-500
        },

        // Text colors
        content: {
          primary: 'var(--text-primary)',     // white
          secondary: 'var(--text-secondary)', // gray-400
          tertiary: 'var(--text-tertiary)',   // gray-500
          muted: 'var(--text-muted)',         // gray-300
        },

        // Primary accent (Purple)
        accent: {
          DEFAULT: 'var(--accent-primary)',           // purple-500
          hover: 'var(--accent-primary-hover)',       // purple-600
          dark: 'var(--accent-primary-dark)',         // purple-700
          muted: 'var(--accent-primary-muted)',       // purple-400
          bg: 'var(--accent-primary-bg)',             // purple-900/20
          'bg-strong': 'var(--accent-primary-bg-strong)', // purple-900/30
          border: 'var(--accent-primary-border)',     // purple-500/50
        },

        // Secondary accent (Green)
        accent2: {
          DEFAULT: 'var(--accent-secondary)',         // green-500
          hover: 'var(--accent-secondary-hover)',     // green-600
          muted: 'var(--accent-secondary-muted)',     // green-400
          bg: 'var(--accent-secondary-bg)',           // green-900/20
          border: 'var(--accent-secondary-border)',   // green-500
        },

        // Tertiary accent (Blue)
        accent3: {
          DEFAULT: 'var(--accent-tertiary)',         // blue-500
          hover: 'var(--accent-tertiary-hover)',     // blue-600
          muted: 'var(--accent-tertiary-muted)',     // blue-400
          bg: 'var(--accent-tertiary-bg)',           // blue-900/50
          dark: 'var(--accent-tertiary-dark)',       // blue-900
        },

        // Status colors
        status: {
          error: 'var(--status-error)',           // red-500
          'error-hover': 'var(--status-error-hover)', // red-600
          warning: 'var(--status-warning)',       // yellow-500
          'warning-muted': 'var(--status-warning-muted)', // yellow-400
          info: 'var(--status-info)',             // orange-400
        },

        // Beat indicator colors
        beat: {
          loud: 'var(--beat-loud)',     // red-500
          normal: 'var(--beat-normal)', // blue-400
          soft: 'var(--beat-soft)',     // gray-500
        },
      },

      // Note: Gradient utilities are defined in index.css as custom classes
      // .bg-gradient-title, .bg-gradient-button, .bg-gradient-progress
      // These use the CSS variables from the theme system

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      boxShadow: {
        'glow': '0 0 20px var(--accent-primary)',
        'glow-secondary': '0 0 20px var(--accent-secondary)',
      },
    },
  },
  plugins: [],
}
