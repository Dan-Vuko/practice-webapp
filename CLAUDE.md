# Speed Builder - Development Setup

Guitar practice webapp. React + TypeScript + Vite + Tailwind. Deployed to Vercel.

## Prerequisites

- Node.js 18+ (tested on 22)
- npm (comes with Node)
- Git

### Install Node

**Windows:** Download from https://nodejs.org or use `winget install OpenJS.NodeJS.LTS`

**Mac:** `brew install node` or download from https://nodejs.org

## Quick Start

```bash
# Clone
git clone https://github.com/Dan-Vuko/practice-webapp.git
cd practice-webapp

# Install dependencies
npm install

# Start dev server (port 3003)
npm run dev

# In a second terminal - start the workout history API server (port 3004)
node server.js
```

App runs at `http://localhost:3003`. Navigate to `/#speedbuilder`.

## Architecture

### Frontend (Vite + React)
- `src/App.tsx` - Main app, routes between views
- `src/pattern-database.tsx` - Pattern tree UI, notes system, all CRUD
- `src/patterns.ts` - Static fingerpicking pattern definitions
- `src/metronome.ts` - Web Audio API metronome engine
- `src/Analytics.tsx` - Per-pattern workout analytics
- `src/MetaAnalytics.tsx` - Cross-pattern analytics dashboard
- `src/ProgressTracker.tsx` - BPM progress tracking during practice
- `src/workout-storage.ts` - Workout save/load (talks to server.js)
- `src/index.css` - Tailwind + custom theme CSS variables

### Backend (Express, local only)
- `server.js` - Lightweight Express server on port 3004
  - `GET /api/workouts` - List all saved workouts
  - `POST /api/save-workout` - Save a workout JSON file
  - `DELETE /api/workouts/:id` - Delete a workout
  - Stores files as JSON in `workout-history/`

### Data Storage
- **Pattern database:** `localStorage` (key: `patternDatabase`, versioned with `patternDatabaseVersion`)
- **Workout history:** JSON files on disk via `server.js` (local dev) or Supabase (production)
- **Workout configs:** `localStorage` (key: `workoutConfigs`)

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Vite dev server on port 3003 |
| `node server.js` | Workout API server on port 3004 |
| `npm run build` | TypeScript check + Vite production build to `dist/` |
| `npm run preview` | Serve the production build locally |

## Deployment

Pushes to `main` auto-deploy to Vercel. The Vercel build runs `npm run build` and serves `dist/`.

Live URL: https://practice-webapp-speedbuilder.vercel.app/#speedbuilder

Note: `server.js` does NOT run on Vercel. Production uses Supabase for workout persistence (see `api/` folder for serverless functions).

## Key Concepts

- **Patterns** live in a tree of folders. Each pattern tracks current BPM, target BPM, and practice stats.
- **Notes** are a diary system on each pattern - dated entries with add/edit/delete. Replaced the old `comment` string field (migrated automatically via schema versioning).
- **Workout configs** define practice session structure (reps, BPM increments, rest periods).
- **The metronome** uses Web Audio API for precise timing. It's the core practice tool.
- Pattern database schema is versioned (currently v3). When you add new default patterns, bump `CURRENT_VERSION` in `loadDatabase` and existing user data will merge with new defaults on next load.
