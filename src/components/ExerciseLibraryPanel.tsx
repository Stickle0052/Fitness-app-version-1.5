import { useMemo, useState } from 'react';
import { exercises } from '../data/exercises';

interface ExerciseLibraryPanelProps {
  embedded?: boolean;
}

function aceSearchUrl(name: string) {
  return `https://www.acefitness.org/resources/everyone/exercise-library/?search=${encodeURIComponent(name)}`;
}

export function ExerciseLibraryPanel({ embedded = false }: ExerciseLibraryPanelProps) {
  const [query, setQuery] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0]?.id ?? '');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return exercises;
    return exercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(normalized) ||
        exercise.muscles.some((muscle) => muscle.toLowerCase().includes(normalized)) ||
        exercise.equipment.toLowerCase().includes(normalized),
    );
  }, [query]);

  const selected = filtered.find((exercise) => exercise.id === selectedExerciseId) ?? filtered[0] ?? exercises[0];

  return (
    <section className={embedded ? '' : 'panel'}>
      <div className="space-between wrap-gap">
        <div>
          <p className="eyebrow">Exercise library</p>
          <h2>How-to index</h2>
          <p className="muted small">Browse setup, cues, form-check prompts, and a free external reference for each exercise.</p>
        </div>
        <label>
          Search
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercise, muscle, equipment" />
        </label>
      </div>

      <div className="library-layout top-gap">
        <div className="library-list">
          {filtered.map((exercise) => (
            <button
              type="button"
              key={exercise.id}
              className={`library-item ${selected?.id === exercise.id ? 'library-item-active' : ''}`}
              onClick={() => setSelectedExerciseId(exercise.id)}
            >
              <strong>{exercise.name}</strong>
              <span className="muted small">{exercise.equipment} · {exercise.category}</span>
            </button>
          ))}
        </div>

        {selected && (
          <article className="exercise-card">
            <div className="space-between wrap-gap">
              <div>
                <h3>{selected.name}</h3>
                <p className="muted small">{selected.equipment} · {selected.muscles.join(', ')}</p>
              </div>
              <span className="pill subtle">{selected.defaultSets} sets · {selected.defaultRepRange[0]}-{selected.defaultRepRange[1]} reps</span>
            </div>

            <details className="why-panel top-gap" open>
              <summary>How to do it</summary>
              <ol className="compact-list muted small">
                {selected.howTo.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </details>

            <details className="why-panel top-gap">
              <summary>Coaching cues and form checks</summary>
              <ul className="compact-list muted small">
                {selected.coachingCues.map((cue) => <li key={cue}>{cue}</li>)}
                <li>Can you feel the target muscle more than your lower back or joints?</li>
                <li>Did the last reps slow down without your form falling apart?</li>
                <li>Would your setup look the same on the final rep as on the first?</li>
              </ul>
            </details>

            {selected.notes && <p className="callout">{selected.notes}</p>}

            <div className="top-gap">
              <a className="ghost small-button inline-link-button" href={aceSearchUrl(selected.name)} target="_blank" rel="noreferrer">
                Open free exercise guide
              </a>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
