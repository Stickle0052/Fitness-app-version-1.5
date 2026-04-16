import { getRecommendedSwaps } from '../engine/workoutGenerator';
import type { GeneratedWorkout, UserProfile } from '../types';

interface WorkoutCardProps {
  workout?: GeneratedWorkout;
  profile: UserProfile;
  onRegenerate: () => void;
  onSwapExercise: (currentExerciseId: string, replacementExerciseId: string) => void;
}

export function WorkoutCard({ workout, profile, onRegenerate, onSwapExercise }: WorkoutCardProps) {
  if (!workout) {
    return (
      <section className="panel hero-panel">
        <p className="eyebrow">Next workout</p>
        <h2>No workout generated yet</h2>
        <p className="muted">Choose a time block and generate your next session.</p>
      </section>
    );
  }

  return (
    <section className="panel hero-panel">
      <div className="space-between wrap-gap">
        <div>
          <p className="eyebrow">Next workout</p>
          <h2>{workout.sessionType} · {workout.focus}</h2>
          <p className="muted">{workout.durationMinutes} min · {workout.phase} phase</p>
        </div>
        <div className="stack-right">
          <span className="pill">{workout.includeCardio ? 'Cardio included' : 'Strength only'}</span>
          <button className="ghost" onClick={onRegenerate}>Regenerate</button>
        </div>
      </div>

      <details className="why-panel top-gap" open>
        <summary>Why this workout today</summary>
        <ul className="compact-list muted small">
          {workout.whySummary.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </details>

      <details className="why-panel top-gap">
        <summary>Adjustments applied</summary>
        <ul className="compact-list muted small">
          {workout.adjustmentSummary.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </details>

      <div className="exercise-list">
        {workout.exercises.map((exercise) => {
          const recommendations = getRecommendedSwaps(
            workout.sessionType,
            exercise.exerciseId,
            workout.exercises.map((item) => item.exerciseId),
            profile,
          );

          return (
            <article className="exercise-card" key={exercise.exerciseId}>
              <div className="space-between wrap-gap">
                <div>
                  <h3>{exercise.name}</h3>
                  <p className="muted small">{exercise.category}</p>
                </div>
                <div className="stack-right tight">
                  <p className="small strong">{exercise.sets.length} sets · {exercise.sets[0]?.targetReps} reps</p>
                </div>
              </div>
              <p className="muted small">Suggested load: {exercise.sets[0]?.targetWeightLbs ?? 0} lb {exercise.notes ? `· ${exercise.notes}` : ''}</p>

              <details className="why-panel top-gap">
                <summary>Why this exercise</summary>
                <p className="muted small">{exercise.why}</p>
              </details>

              {exercise.category !== 'cardio' && recommendations.length > 0 && (
                <details className="why-panel top-gap">
                  <summary>Recommended swaps</summary>
                  <div className="swap-list top-gap">
                    {recommendations.map((replacement) => (
                      <button key={replacement.id} className="swap-item" onClick={() => onSwapExercise(exercise.exerciseId, replacement.id)}>
                        <strong>{replacement.name}</strong>
                        <span className="muted small">{replacement.swapReason}</span>
                      </button>
                    ))}
                  </div>
                </details>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
