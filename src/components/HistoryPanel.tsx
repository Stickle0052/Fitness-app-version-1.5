import type { CompletedWorkout } from '../types';

interface HistoryPanelProps {
  workouts: CompletedWorkout[];
  onDelete: (workoutId: string) => void;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function HistoryPanel({ workouts, onDelete }: HistoryPanelProps) {
  return (
    <section className="panel">
      <div className="space-between wrap-gap">
        <div>
          <p className="eyebrow">History</p>
          <h2>Recent workouts</h2>
        </div>
        <span className="pill subtle">{workouts.length} logged</span>
      </div>

      {workouts.length === 0 ? (
        <p className="muted">No workouts logged yet. Complete one session and it will appear here.</p>
      ) : (
        <div className="exercise-list">
          {workouts.map((workout) => (
            <article className="exercise-card" key={workout.workoutId}>
              <div className="space-between wrap-gap">
                <div>
                  <h3>{workout.sessionType}</h3>
                  <p className="muted small">
                    {formatDate(workout.completedAt)} · {workout.durationMinutes} min · {workout.phase} phase
                  </p>
                </div>
                <button className="ghost small-button" onClick={() => onDelete(workout.workoutId)}>
                  Delete
                </button>
              </div>
              <ul className="compact-list muted small">
                {workout.exercises.map((exercise) => (
                  <li key={`${workout.workoutId}-${exercise.exerciseId}`}>
                    {exercise.name} · {exercise.loggedSets.map((set) => `${set.weightLbs} lb x ${set.completedReps}`).join(', ')}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
