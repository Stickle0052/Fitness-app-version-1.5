import type {
  AnchorPerformance,
  CompletedWorkout,
  ExerciseDefinition,
  LoggedSet,
  RepsLeftOption,
  UserProfile,
} from '../types';

function repsLeftScore(value: RepsLeftOption): number {
  return value === '4+' ? 4 : value === '2' ? 2 : value === '1' ? 1 : 0;
}

function avg(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getRecentSets(workouts: CompletedWorkout[], exerciseId: string): LoggedSet[] {
  return workouts
    .slice()
    .reverse()
    .flatMap((workout) => workout.exercises.filter((exercise) => exercise.exerciseId === exerciseId))
    .flatMap((exercise) => exercise.loggedSets)
    .slice(0, 6);
}

export function getAnchorPerformance(
  workouts: CompletedWorkout[],
  exercise: ExerciseDefinition,
  profile?: UserProfile,
): AnchorPerformance {
  const recentSets = getRecentSets(workouts, exercise.id);
  if (recentSets.length === 0) {
    return {
      lastWeightLbs: guessStartingWeight(exercise, profile),
      avgCompletedReps: 0,
      avgRepsLeft: '2',
      trend: 'new',
    };
  }

  const lastWeightLbs = recentSets[0].weightLbs;
  const avgCompletedReps = avg(recentSets.map((set) => set.completedReps));
  const avgRepsLeftScore = avg(recentSets.map((set) => repsLeftScore(set.repsLeft)));
  const avgRepsLeft: RepsLeftOption = avgRepsLeftScore >= 3 ? '4+' : avgRepsLeftScore >= 1.5 ? '2' : avgRepsLeftScore >= 0.5 ? '1' : '0';

  const latestHalf = recentSets.slice(0, Math.ceil(recentSets.length / 2));
  const olderHalf = recentSets.slice(Math.ceil(recentSets.length / 2));
  const latestAvg = avg(latestHalf.map((set) => set.weightLbs));
  const olderAvg = olderHalf.length ? avg(olderHalf.map((set) => set.weightLbs)) : latestAvg;

  const trend: AnchorPerformance['trend'] = latestAvg > olderAvg + 2
    ? 'up'
    : latestAvg < olderAvg - 2
      ? 'down'
      : 'steady';

  return { lastWeightLbs, avgCompletedReps, avgRepsLeft, trend };
}

export function guessStartingWeight(exercise: ExerciseDefinition, profile?: UserProfile): number {
  const userDefaults = profile?.startingWeights;

  if (exercise.standardLiftKey && userDefaults) {
    return userDefaults[exercise.standardLiftKey];
  }

  switch (exercise.id) {
    case 'leg-press':
      return 90;
    default:
      return exercise.category === 'accessory' ? 15 : exercise.category === 'compound' ? 45 : 20;
  }
}

export function prescribeWeight(
  exercise: ExerciseDefinition,
  performance: AnchorPerformance,
  phaseModifier: number,
  profile?: UserProfile,
): number {
  if (performance.trend === 'new') {
    return Math.max(5, Math.round((guessStartingWeight(exercise, profile) * phaseModifier) / 5) * 5);
  }

  let nextWeight = performance.lastWeightLbs;

  if (performance.avgRepsLeft === '4+') nextWeight += exercise.category === 'accessory' ? 5 : 5;
  if (performance.avgRepsLeft === '2' && performance.trend === 'up') nextWeight += exercise.category === 'accessory' ? 2.5 : 5;
  if (performance.avgRepsLeft === '1') nextWeight += exercise.category === 'accessory' ? 0 : 0;
  if (performance.avgRepsLeft === '0') nextWeight -= exercise.category === 'accessory' ? 2.5 : 5;

  return Math.max(5, Math.round((nextWeight * phaseModifier) / 5) * 5);
}
