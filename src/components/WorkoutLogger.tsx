import { useEffect, useMemo, useState } from 'react';
import { getExerciseById } from '../data/exercises';
import type { CompletedWorkout, GeneratedWorkout, RepsLeftOption } from '../types';

interface WorkoutLoggerProps {
  workout?: GeneratedWorkout;
  onSave: (workout: CompletedWorkout) => void;
}

const repsLeftOptions: RepsLeftOption[] = ['4+', '2', '1', '0'];

type EntryMap = Record<string, { reps: number; weight: number; repsLeft: RepsLeftOption }[]>;

function getRestSeconds(exerciseId: string, weight: number) {
  const exercise = getExerciseById(exerciseId);
  const base = exercise?.defaultRestSeconds ?? 60;
  let modifier = 0;

  if ((exercise?.category === 'compound' || exercise?.category === 'secondary') && weight >= 95) modifier += 15;
  if ((exercise?.category === 'compound' || exercise?.category === 'secondary') && weight >= 135) modifier += 15;
  if (exercise?.category === 'accessory' && weight >= 35) modifier += 10;

  return base + modifier;
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function WorkoutLogger({ workout, onSave }: WorkoutLoggerProps) {
  const initialState = useMemo(() => {
    if (!workout) return {} as EntryMap;

    return Object.fromEntries(
      workout.exercises.map((exercise) => [
        exercise.exerciseId,
        exercise.sets.map((set) => ({
          reps: parseInt(set.targetReps.split('-')[0], 10),
          weight: set.targetWeightLbs,
          repsLeft: '1' as RepsLeftOption,
        })),
      ]),
    );
  }, [workout]);

  const [entries, setEntries] = useState(initialState);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [activeRest, setActiveRest] = useState<{ exerciseId: string; setIndex: number; remaining: number } | null>(null);

  useEffect(() => {
    setEntries(initialState);
    setIsWorkoutStarted(false);
    setActiveRest(null);
  }, [initialState]);

  useEffect(() => {
    if (!activeRest) return;
    if (activeRest.remaining <= 0) {
      setActiveRest(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveRest((current) => (current ? { ...current, remaining: current.remaining - 1 } : null));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [activeRest]);

  if (!workout) return null;

  const updateEntry = (exerciseId: string, setIndex: number, field: 'reps' | 'weight' | 'repsLeft', value: string) => {
    setEntries((current) => ({
      ...current,
      [exerciseId]: current[exerciseId].map((set, idx) =>
        idx === setIndex
          ? {
              ...set,
              [field]: (field === 'repsLeft' ? value : Number(value)) as never,
            }
          : set,
      ),
    }));
  };

  const handleFinishSet = (exerciseId: string, setIndex: number) => {
    const set = entries[exerciseId]?.[setIndex];
    if (!set) return;
    setActiveRest({
      exerciseId,
      setIndex,
      remaining: getRestSeconds(exerciseId, set.weight),
    });
  };

  const handleSave = () => {
    onSave({
      workoutId: workout.id,
      sessionType: workout.sessionType,
      completedAt: new Date().toISOString(),
      durationMinutes: workout.durationMinutes,
      phase: workout.phase,
      exercises: workout.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        loggedSets: entries[exercise.exerciseId].map((set) => ({
          completedReps: set.reps,
          weightLbs: set.weight,
          repsLeft: set.repsLeft,
        })),
      })),
    });
    setEntries(initialState);
    setIsWorkoutStarted(false);
    setActiveRest(null);
  };

  return (
    <section className="panel">
      <div className="space-between wrap-gap">
        <div>
          <p className="eyebrow">Workout mode</p>
          <h2>{isWorkoutStarted ? 'Workout in progress' : 'Ready to train'}</h2>
          <p className="muted small">Finish each set to trigger a dynamic rest timer. The target effort is usually about one rep left in reserve.</p>
        </div>
        <div className="stack-right tight">
          {!isWorkoutStarted ? (
            <button className="primary" onClick={() => setIsWorkoutStarted(true)}>Start workout</button>
          ) : (
            <button className="primary" onClick={handleSave}>Complete workout</button>
          )}
          {activeRest && <span className="pill">Rest · {formatCountdown(activeRest.remaining)}</span>}
        </div>
      </div>

      <div className="exercise-list">
        {workout.exercises.map((exercise) => (
          <article className="exercise-card" key={exercise.exerciseId}>
            <div className="space-between wrap-gap">
              <div>
                <h3>{exercise.name}</h3>
                <p className="muted small">{exercise.category}</p>
              </div>
              <span className="pill subtle">Target {exercise.sets[0]?.targetReps}</span>
            </div>
            {entries[exercise.exerciseId]?.map((set, index) => {
              const isRestingThisSet = activeRest?.exerciseId === exercise.exerciseId && activeRest?.setIndex === index;
              return (
                <div className="grid logger-row logger-row-wide" key={`${exercise.exerciseId}-${index}`}>
                  <label>
                    Reps
                    <input type="number" min="0" value={set.reps} onChange={(e) => updateEntry(exercise.exerciseId, index, 'reps', e.target.value)} />
                  </label>
                  <label>
                    Weight (lb)
                    <input type="number" min="0" step="2.5" value={set.weight} onChange={(e) => updateEntry(exercise.exerciseId, index, 'weight', e.target.value)} />
                  </label>
                  <label>
                    Reps left
                    <select value={set.repsLeft} onChange={(e) => updateEntry(exercise.exerciseId, index, 'repsLeft', e.target.value)}>
                      {repsLeftOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <div className="finish-set-box">
                    <span className="muted small">Set {index + 1}</span>
                    <button type="button" className="ghost small-button" disabled={!isWorkoutStarted} onClick={() => handleFinishSet(exercise.exerciseId, index)}>
                      {isRestingThisSet ? `Resting ${formatCountdown(activeRest.remaining)}` : 'Finish set'}
                    </button>
                  </div>
                </div>
              );
            })}
          </article>
        ))}
      </div>
    </section>
  );
}
