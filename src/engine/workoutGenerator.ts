import { exercises, getExerciseById } from '../data/exercises';
import type {
  BodyFocusArea,
  CompletedWorkout,
  CycleState,
  ExerciseDefinition,
  GeneratedWorkout,
  SessionType,
  UserProfile,
  WorkoutExercise,
} from '../types';
import { describePhase, getCycleContext, symptomImpact } from '../utils/cycle';
import { getAnchorPerformance, prescribeWeight } from './progression';

const SESSION_ROTATION: SessionType[] = ['Lower A', 'Upper A', 'Lower B', 'Upper B'];

function nextSession(current: SessionType): SessionType {
  const idx = SESSION_ROTATION.indexOf(current);
  return SESSION_ROTATION[(idx + 1) % SESSION_ROTATION.length];
}

function phaseModifier(phase: ReturnType<typeof getCycleContext>['phase'], recentTrendDown: boolean): number {
  if (!recentTrendDown) return 1;
  if (phase === 'menstrual') return 0.97;
  if (phase === 'luteal') return 0.98;
  return 1;
}

function determineFocus(sessionType: SessionType, profile: UserProfile): string {
  const topGoal = profile.goals[0];
  switch (sessionType) {
    case 'Lower A':
      return topGoal === 'build-glutes' ? 'Lower body with extra glute attention' : 'Lower body strength and lower-body balance';
    case 'Upper A':
      return topGoal === 'build-back' ? 'Back-driven upper body with press support' : 'Pressing strength, back, and arms';
    case 'Lower B':
      return 'Posterior chain work with moderate variety';
    case 'Upper B':
      return profile.workoutStyle === 'upper-body-focused' ? 'Upper-body emphasis with back, shoulders, and arms' : 'Back, shoulders, and arms';
  }
}

function filterForSession(sessionType: SessionType, profile: UserProfile) {
  return exercises.filter(
    (exercise) =>
      exercise.sessionTypes.includes(sessionType) &&
      !profile.bannedExercises.some((item) => item.toLowerCase() === exercise.name.toLowerCase()),
  );
}

function favoriteMatches(exercise: ExerciseDefinition, profile: UserProfile) {
  return profile.favoriteExercises.some((favorite) => favorite.toLowerCase() === exercise.name.toLowerCase());
}

function bodyFocusBoost(exercise: ExerciseDefinition, profile: UserProfile): number {
  const map: Partial<Record<BodyFocusArea, number>> = {
    glutes: 0,
    quads: 0,
    hamstrings: 0,
    back: 0,
    shoulders: 0,
    arms: 0,
    chest: 0,
    core: 0,
    conditioning: 0,
  };

  exercise.muscles.forEach((muscle) => {
    if (muscle === 'biceps' || muscle === 'triceps') {
      map.arms = Math.max(map.arms ?? 0, profile.bodyFocus.arms === 'high' ? 3 : profile.bodyFocus.arms === 'medium' ? 1 : 0);
      return;
    }
    if (muscle === 'lats' || muscle === 'rear-delts') {
      map.back = Math.max(map.back ?? 0, profile.bodyFocus.back === 'high' ? 3 : profile.bodyFocus.back === 'medium' ? 1 : 0);
      return;
    }
    const area = muscle as BodyFocusArea;
    if (profile.bodyFocus[area]) {
      map[area] = Math.max(map[area] ?? 0, profile.bodyFocus[area] === 'high' ? 3 : profile.bodyFocus[area] === 'medium' ? 1 : 0);
    }
  });

  return Object.values(map).reduce((max, value) => Math.max(max, value ?? 0), 0);
}

function chooseAnchor(sessionType: SessionType, candidates: ExerciseDefinition[], profile: UserProfile) {
  const scored = candidates.map((exercise) => {
    let score = 0;
    if (favoriteMatches(exercise, profile)) score += 5;
    if (exercise.isAnchor) score += 3;
    score += bodyFocusBoost(exercise, profile);
    if (profile.goals.includes('build-glutes') && exercise.muscles.includes('glutes')) score += 3;
    if (profile.goals.includes('build-back') && (exercise.muscles.includes('back') || exercise.muscles.includes('lats'))) score += 3;
    if (profile.goals.includes('build-arms') && (exercise.muscles.includes('biceps') || exercise.muscles.includes('triceps'))) score += 2;
    return { exercise, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.exercise ?? candidates[0];
}

function buildExercise(
  exercise: ExerciseDefinition,
  workouts: CompletedWorkout[],
  modifier: number,
  profile: UserProfile,
): WorkoutExercise {
  const performance = getAnchorPerformance(workouts, exercise, profile);
  const weight = prescribeWeight(exercise, performance, modifier, profile);
  const repRange = `${exercise.defaultRepRange[0]}-${exercise.defaultRepRange[1]}`;
  const sets = Array.from({ length: exercise.defaultSets }, () => ({
    targetReps: repRange,
    targetWeightLbs: weight,
  }));

  let why = 'Kept in the plan to support the session focus.';
  if (favoriteMatches(exercise, profile)) why = 'Included because it matches this user’s preferred exercise list.';
  else if (bodyFocusBoost(exercise, profile) >= 3) why = 'Included because it matches a high-focus muscle area from the profile.';
  else if (exercise.isAnchor) why = 'Included as an anchor lift that should repeat every 5 to 7 days for measurable progress.';

  return {
    exerciseId: exercise.id,
    name: exercise.name,
    category: exercise.category,
    sets,
    muscles: exercise.muscles,
    notes: exercise.notes,
    why,
  };
}

export function getRecommendedSwaps(
  sessionType: SessionType,
  exerciseId: string,
  currentExerciseIds: string[],
  profile: UserProfile,
) {
  const currentExercise = getExerciseById(exerciseId);
  if (!currentExercise) return [];

  const pool = filterForSession(sessionType, profile).filter(
    (exercise) => exercise.id !== exerciseId && !currentExerciseIds.includes(exercise.id),
  );

  const scored = pool
    .map((exercise) => {
      let score = 0;
      const sharedMuscles = exercise.muscles.filter((muscle) => currentExercise.muscles.includes(muscle)).length;
      score += sharedMuscles * 4;
      if (exercise.category === currentExercise.category) score += 3;
      if ((currentExercise.recommendedSwapIds ?? []).includes(exercise.id)) score += 5;
      if (favoriteMatches(exercise, profile)) score += 2;
      return { exercise, score, sharedMuscles };
    })
    .filter((item) => item.sharedMuscles > 0 || item.score >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => ({
      ...item.exercise,
      swapReason:
        item.sharedMuscles > 0
          ? `Keeps the same main muscle focus with a ${item.exercise.equipment} option.`
          : 'Keeps the session flow similar while changing the setup demand.',
    }));

  return scored;
}

export function generateWorkout(
  profile: UserProfile,
  workouts: CompletedWorkout[],
  sessionType: SessionType,
  durationMinutes: number,
  cycleState?: CycleState,
): GeneratedWorkout {
  const { phase } = getCycleContext(profile, cycleState);
  const symptomEffect = symptomImpact(cycleState?.currentSymptoms ?? []);

  const sessionCandidates = filterForSession(sessionType, profile);
  const anchor = chooseAnchor(sessionType, sessionCandidates.filter((exercise) => exercise.category === 'compound'), profile);
  const anchorPerformance = getAnchorPerformance(workouts, anchor, profile);
  const modifier = phaseModifier(phase, anchorPerformance.trend === 'down') * symptomEffect.modifier;

  const selected: ExerciseDefinition[] = [anchor];

  const secondaryExercises = sessionCandidates
    .filter((exercise) => exercise.id !== anchor.id && exercise.category === 'secondary')
    .sort((a, b) => bodyFocusBoost(b, profile) - bodyFocusBoost(a, profile));
  const accessoryExercises = sessionCandidates
    .filter((exercise) => exercise.id !== anchor.id && (exercise.category === 'accessory' || exercise.category === 'core'))
    .sort((a, b) => bodyFocusBoost(b, profile) - bodyFocusBoost(a, profile));

  selected.push(...secondaryExercises.slice(0, durationMinutes >= 60 ? 2 : 1));
  selected.push(...accessoryExercises.slice(0, durationMinutes >= 75 ? 3 : durationMinutes >= 60 ? 2 : 1));

  const cardioCountThisWeek = workouts.filter((workout) => {
    const completedAt = new Date(workout.completedAt);
    const now = new Date();
    const diff = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7 && workout.exercises.some((exercise) => exercise.exerciseId === 'incline-treadmill-walk');
  }).length;

  const cardioTarget = profile.cardioPreference === 'once-weekly' ? 1 : profile.cardioPreference === 'twice-weekly' ? 2 : 0;
  const includeCardio =
    (profile.cardioPreference === 'optional-finisher' || profile.cardioPreference === 'once-weekly' || profile.cardioPreference === 'twice-weekly') &&
    sessionType.startsWith('Upper') &&
    durationMinutes >= 60 &&
    cardioCountThisWeek < cardioTarget + (profile.cardioPreference === 'optional-finisher' ? 1 : 0);

  if (includeCardio) {
    const cardio = sessionCandidates.find((exercise) => exercise.id === 'incline-treadmill-walk');
    if (cardio) selected.push(cardio);
  }

  const whySummary = [
    `${sessionType} was selected because it is next in the rotation, which keeps anchor lifts repeating every 5 to 7 days.`,
    `The session is weighted toward ${profile.goals.slice(0, 3).join(', ')} based on this profile’s ranked goals.`,
    `This plan uses moderate variety by keeping the session focus stable while changing some supporting lifts.`,
  ];

  const adjustmentSummary = [describePhase(phase)];
  if (symptomEffect.note) adjustmentSummary.push(symptomEffect.note);
  if (includeCardio) adjustmentSummary.push('Cardio was added because this profile allows it and today is an upper-body session, which protects lower-body recovery.');
  if (anchorPerformance.trend === 'down') adjustmentSummary.push('The anchor lift showed a softer recent trend, so loading stayed conservative today.');

  return {
    id: crypto.randomUUID(),
    sessionType,
    createdAt: new Date().toISOString(),
    durationMinutes,
    phase,
    focus: determineFocus(sessionType, profile),
    recoveryNote: describePhase(phase),
    includeCardio,
    whySummary,
    adjustmentSummary,
    exercises: selected.map((exercise) => buildExercise(exercise, workouts, modifier, profile)),
  };
}

export function replaceExerciseInWorkout(
  workout: GeneratedWorkout,
  workouts: CompletedWorkout[],
  currentExerciseId: string,
  replacementId: string,
  profile: UserProfile,
): GeneratedWorkout {
  const replacement = getExerciseById(replacementId);
  if (!replacement) return workout;

  const anchorPerformance = getAnchorPerformance(workouts, replacement, profile);
  const modifier = phaseModifier(workout.phase, anchorPerformance.trend === 'down');
  const nextExercise = buildExercise(replacement, workouts, modifier, profile);

  return {
    ...workout,
    exercises: workout.exercises.map((exercise) =>
      exercise.exerciseId === currentExerciseId ? nextExercise : exercise,
    ),
    adjustmentSummary: [...workout.adjustmentSummary, `${replacement.name} replaced ${getExerciseById(currentExerciseId)?.name ?? 'the previous exercise'} to keep the same main muscle focus.`],
  };
}

export function advanceSession(sessionType: SessionType): SessionType {
  return nextSession(sessionType);
}
