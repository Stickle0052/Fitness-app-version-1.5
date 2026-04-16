export type GoalPriority =
  | 'build-muscle'
  | 'get-stronger'
  | 'lose-fat'
  | 'improve-consistency'
  | 'improve-energy'
  | 'build-glutes'
  | 'build-back'
  | 'build-arms'
  | 'athletic-performance'
  | 'functional-fitness';

export type SessionType = 'Lower A' | 'Upper A' | 'Lower B' | 'Upper B';
export type ExerciseCategory = 'compound' | 'secondary' | 'accessory' | 'cardio' | 'core';
export type EquipmentType = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'band' | 'mixed';
export type MuscleGroup =
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'back'
  | 'lats'
  | 'rear-delts'
  | 'shoulders'
  | 'chest'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'conditioning';

export type BodyFocusLevel = 'low' | 'medium' | 'high';
export type BodyFocusArea =
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'chest'
  | 'core'
  | 'conditioning';

export type RepsLeftOption = '4+' | '2' | '1' | '0';
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'none';
export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';
export type GenderOption = 'woman' | 'man' | 'nonbinary' | 'prefer-not-to-say';
export type MenstruationPreference = 'tracks-cycle' | 'does-not-menstruate';
export type CardioPreference = 'none' | 'optional-finisher' | 'once-weekly' | 'twice-weekly' | 'endurance-supportive';
export type WorkoutStyle = 'balanced' | 'strength-biased' | 'glute-focused' | 'upper-body-focused' | 'minimalist' | 'machine-friendly';
export type ProgressPriority = 'strength' | 'muscle-focus' | 'consistency' | 'energy' | 'balanced';
export type SymptomTag = 'cramps' | 'bloating' | 'fatigue' | 'headache' | 'low-mood' | 'low-energy';

export interface StartingWeights {
  benchPress: number;
  deadlift: number;
  bicepCurl: number;
  gluteBridge: number;
  latPulldown: number;
  row: number;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: GenderOption;
  heightInches: number;
  weightLbs: number;
  trainingYears: number;
  level: TrainingLevel;
  frequencyTarget: number;
  sessionLengthMin: number;
  sessionLengthMax: number;
  goals: GoalPriority[];
  bodyFocus: Record<BodyFocusArea, BodyFocusLevel>;
  favoriteExercises: string[];
  bannedExercises: string[];
  progressionStyle: 'conservative' | 'moderate' | 'aggressive';
  cardioPreference: CardioPreference;
  workoutStyle: WorkoutStyle;
  progressPriority: ProgressPriority;
  deloadSuggestionsEnabled: boolean;
  gymName: string;
  equipment: string[];
  menstruationPreference: MenstruationPreference;
  cycleLengthDays: number;
  periodLengthDays: number;
  setupComplete: boolean;
  startingWeights: StartingWeights;
}

export interface CycleState {
  active: boolean;
  lastPeriodStart: string;
  lastPeriodEnd: string;
  currentSymptoms: SymptomTag[];
  recentEvents: string[];
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  sessionTypes: SessionType[];
  category: ExerciseCategory;
  muscles: MuscleGroup[];
  equipment: EquipmentType;
  isAnchor?: boolean;
  favoriteBias?: boolean;
  defaultRepRange: [number, number];
  defaultSets: number;
  durationMinutes: number;
  notes?: string;
  howTo: string[];
  coachingCues: string[];
  recommendedSwapIds?: string[];
  defaultRestSeconds?: number;
  standardLiftKey?: keyof StartingWeights;
}

export interface PrescribedSet {
  targetReps: string;
  targetWeightLbs: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  category: ExerciseCategory;
  sets: PrescribedSet[];
  muscles: MuscleGroup[];
  notes?: string;
  why?: string;
}

export interface GeneratedWorkout {
  id: string;
  sessionType: SessionType;
  createdAt: string;
  durationMinutes: number;
  phase: CyclePhase;
  focus: string;
  recoveryNote: string;
  includeCardio: boolean;
  whySummary: string[];
  adjustmentSummary: string[];
  exercises: WorkoutExercise[];
}

export interface LoggedSet {
  completedReps: number;
  weightLbs: number;
  repsLeft: RepsLeftOption;
}

export interface CompletedExercise {
  exerciseId: string;
  name: string;
  loggedSets: LoggedSet[];
}

export interface CompletedWorkout {
  workoutId: string;
  sessionType: SessionType;
  completedAt: string;
  durationMinutes: number;
  phase: CyclePhase;
  exercises: CompletedExercise[];
}

export interface TrainingState {
  nextSessionType: SessionType;
  workouts: CompletedWorkout[];
  lastGeneratedWorkout?: GeneratedWorkout;
  preferredSwaps: Record<string, string>;
}

export interface AnchorPerformance {
  lastWeightLbs: number;
  avgCompletedReps: number;
  avgRepsLeft: RepsLeftOption;
  trend: 'up' | 'steady' | 'down' | 'new';
}
