import type { BodyFocusArea, BodyFocusLevel, CardioPreference, GoalPriority, ProgressPriority, UserProfile, WorkoutStyle } from '../types';
import { ExerciseLibraryPanel } from './ExerciseLibraryPanel';

interface ProfilePanelProps {
  profile: UserProfile;
  onChange: (next: UserProfile) => void;
}

const goalOptions: { value: GoalPriority; label: string }[] = [
  { value: 'build-muscle', label: 'Build muscle' },
  { value: 'get-stronger', label: 'Get stronger' },
  { value: 'lose-fat', label: 'Lose fat' },
  { value: 'improve-consistency', label: 'Improve consistency' },
  { value: 'improve-energy', label: 'Improve energy' },
  { value: 'build-glutes', label: 'Build glutes' },
  { value: 'build-back', label: 'Build back' },
  { value: 'build-arms', label: 'Build arms' },
  { value: 'athletic-performance', label: 'Athletic performance' },
  { value: 'functional-fitness', label: 'Functional fitness' },
];
const bodyAreas: BodyFocusArea[] = ['glutes', 'quads', 'hamstrings', 'back', 'shoulders', 'arms', 'chest', 'core', 'conditioning'];
const bodyLevels: BodyFocusLevel[] = ['low', 'medium', 'high'];
const cardioOptions: CardioPreference[] = ['none', 'optional-finisher', 'once-weekly', 'twice-weekly', 'endurance-supportive'];
const workoutStyles: WorkoutStyle[] = ['balanced', 'strength-biased', 'glute-focused', 'upper-body-focused', 'minimalist', 'machine-friendly'];
const progressPriorities: ProgressPriority[] = ['balanced', 'strength', 'muscle-focus', 'consistency', 'energy'];

export function ProfilePanel({ profile, onChange }: ProfilePanelProps) {
  const toggleGoal = (goal: GoalPriority) => {
    const current = profile.goals.filter((item) => item !== goal);
    const next = current.length === profile.goals.length ? [...profile.goals, goal].slice(0, 3) : current;
    onChange({ ...profile, goals: next.length ? next : profile.goals });
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>Training settings</h2>
          <p className="muted small">Adjust goals, focus areas, and preferences. This screen also houses the full exercise library.</p>
        </div>
      </div>

      <div className="grid two-col">
        <label>
          Name
          <input value={profile.name} onChange={(e) => onChange({ ...profile, name: e.target.value })} />
        </label>
        <label>
          Gym name
          <input value={profile.gymName} onChange={(e) => onChange({ ...profile, gymName: e.target.value })} />
        </label>
        <label>
          Workout style
          <select value={profile.workoutStyle} onChange={(e) => onChange({ ...profile, workoutStyle: e.target.value as WorkoutStyle })}>
            {workoutStyles.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label>
          Cardio preference
          <select value={profile.cardioPreference} onChange={(e) => onChange({ ...profile, cardioPreference: e.target.value as CardioPreference })}>
            {cardioOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label>
          Progress snapshot emphasis
          <select value={profile.progressPriority} onChange={(e) => onChange({ ...profile, progressPriority: e.target.value as ProgressPriority })}>
            {progressPriorities.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label>
          Deload suggestions
          <select value={profile.deloadSuggestionsEnabled ? 'yes' : 'no'} onChange={(e) => onChange({ ...profile, deloadSuggestionsEnabled: e.target.value === 'yes' })}>
            <option value="yes">Suggested</option>
            <option value="no">Off</option>
          </select>
        </label>
      </div>

      <details className="why-panel top-gap" open>
        <summary>Ranked goals</summary>
        <div className="chip-row top-gap">
          {goalOptions.map((goal) => (
            <button key={goal.value} className={`chip ${profile.goals.includes(goal.value) ? 'chip-active' : ''}`} onClick={() => toggleGoal(goal.value)}>
              {goal.label}
            </button>
          ))}
        </div>
      </details>

      <details className="why-panel top-gap">
        <summary>Body-area focus</summary>
        <div className="grid three-col top-gap">
          {bodyAreas.map((area) => (
            <label key={area}>
              {area}
              <select value={profile.bodyFocus[area]} onChange={(e) => onChange({ ...profile, bodyFocus: { ...profile.bodyFocus, [area]: e.target.value as BodyFocusLevel } })}>
                {bodyLevels.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
          ))}
        </div>
      </details>

      <details className="why-panel top-gap">
        <summary>Exercise preferences</summary>
        <div className="grid two-col top-gap">
          <label>
            Favorite exercises
            <input value={profile.favoriteExercises.join(', ')} onChange={(e) => onChange({ ...profile, favoriteExercises: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} placeholder="Comma separated" />
          </label>
          <label>
            Banned exercises
            <input value={profile.bannedExercises.join(', ')} onChange={(e) => onChange({ ...profile, bannedExercises: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} placeholder="Comma separated" />
          </label>
        </div>
      </details>

      <details className="why-panel top-gap">
        <summary>Exercise library</summary>
        <div className="top-gap">
          <ExerciseLibraryPanel embedded />
        </div>
      </details>
    </section>
  );
}
