# Velora Training Web App

A browser-based MVP for a cycle-aware, performance-first gym training app.

## Stack
- Vite
- React
- TypeScript
- localStorage for persistence

## What it does
- Generates the next workout from a 4-session rotation
- Uses conservative progression from prior logged performance
- Applies cycle-aware modulation without overriding performance-first logic
- Includes an optional weekly cardio block on upper-body sessions
- Saves profile data and workout logs locally in the browser

## How to run

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite.

## Build for production

```bash
npm run build
npm run preview
```

## Current MVP behavior
- Manual cycle input via profile panel
- Workout rotation: Lower A, Upper A, Lower B, Upper B
- Roll-forward scheduling: the session only advances after you save a completed workout
- Reps-left logging: 4+, 2, 0

## Suggested next steps
1. Replace manual cycle inputs with a real data source.
2. Add user authentication and cloud persistence.
3. Add editable exercise preferences and substitution flows.
4. Add charts for anchor lift progression.
5. Add backend APIs if you want multi-device sync.

## Notes on Apple Health
This web MVP is integration-ready in data shape only. Direct Apple Health data access is typically handled in native iOS apps or via a companion mobile layer, not a plain browser app.
