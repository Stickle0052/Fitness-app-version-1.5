import type { BodyFocusArea, BodyFocusLevel, CycleState, UserProfile } from '../types';

const defaultBodyFocus = Object.fromEntries(
  (['glutes', 'quads', 'hamstrings', 'back', 'shoulders', 'arms', 'chest', 'core', 'conditioning'] as BodyFocusArea[]).map(
    (area) => [area, 'medium' as BodyFocusLevel],
  ),
) as Record<BodyFocusArea, BodyFocusLevel>;

export const defaultProfile: UserProfile = {
  name: '',
  age: 25,
  gender: 'prefer-not-to-say',
  heightInches: 66,
  weightLbs: 150,
  trainingYears: 1,
  level: 'beginner',
  frequencyTarget: 3,
  sessionLengthMin: 45,
  sessionLengthMax: 60,
  goals: ['build-muscle', 'get-stronger', 'improve-consistency'],
  bodyFocus: defaultBodyFocus,
  favoriteExercises: [],
  bannedExercises: [],
  progressionStyle: 'conservative',
  cardioPreference: 'once-weekly',
  workoutStyle: 'balanced',
  progressPriority: 'balanced',
  deloadSuggestionsEnabled: true,
  gymName: '',
  equipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
  menstruationPreference: 'tracks-cycle',
  cycleLengthDays: 28,
  periodLengthDays: 5,
  setupComplete: false,
  startingWeights: {
    benchPress: 45,
    deadlift: 65,
    bicepCurl: 15,
    gluteBridge: 65,
    latPulldown: 40,
    row: 35,
  },
};

export const defaultCycleState: CycleState = {
  active: false,
  lastPeriodStart: new Date().toISOString().slice(0, 10),
  lastPeriodEnd: '',
  currentSymptoms: [],
  recentEvents: [],
};
