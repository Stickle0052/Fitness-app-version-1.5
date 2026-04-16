import { useState, type FormEvent } from 'react';
import type {
  BodyFocusArea,
  BodyFocusLevel,
  CardioPreference,
  GenderOption,
  GoalPriority,
  MenstruationPreference,
  ProgressPriority,
  TrainingLevel,
  UserProfile,
  WorkoutStyle,
} from '../types';

interface ProfileSetupProps {
  profile: UserProfile;
  onComplete: (next: UserProfile) => void;
}

const genderOptions: GenderOption[] = ['woman', 'man', 'nonbinary', 'prefer-not-to-say'];
const trainingLevels: TrainingLevel[] = ['beginner', 'intermediate', 'advanced'];
const menstruationOptions: { value: MenstruationPreference; label: string }[] = [
  { value: 'tracks-cycle', label: 'Track menstrual cycle' },
  { value: 'does-not-menstruate', label: "I don't menstruate" },
];
const cardioOptions: CardioPreference[] = ['none', 'optional-finisher', 'once-weekly', 'twice-weekly', 'endurance-supportive'];
const workoutStyles: WorkoutStyle[] = ['balanced', 'strength-biased', 'glute-focused', 'upper-body-focused', 'minimalist', 'machine-friendly'];
const progressPriorities: ProgressPriority[] = ['balanced', 'strength', 'muscle-focus', 'consistency', 'energy'];
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

function updateField<K extends keyof UserProfile>(
  profile: UserProfile,
  key: K,
  value: UserProfile[K],
  onComplete: (next: UserProfile) => void,
) {
  onComplete({ ...profile, [key]: value });
}

export function ProfileSetup({ profile, onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(0);

  const finishSetup = (event: FormEvent) => {
    event.preventDefault();
    onComplete({ ...profile, setupComplete: true });
  };

  const toggleGoal = (goal: GoalPriority) => {
    const goals = profile.goals.includes(goal)
      ? profile.goals.filter((item) => item !== goal)
      : [...profile.goals, goal].slice(0, 3);
    onComplete({ ...profile, goals });
  };

  const nextStep = () => setStep((current) => Math.min(3, current + 1));
  const prevStep = () => setStep((current) => Math.max(0, current - 1));

  return (
    <div className="setup-shell">
      <section className="panel setup-panel">
        <p className="eyebrow">First-time setup</p>
        <h1>Build your training profile</h1>
        <p className="muted">Rich onboarding gives the app enough context to coach clearly, keep moderate variety, and set realistic starting loads.</p>

        <div className="step-row top-gap">
          {[0, 1, 2, 3].map((item) => (
            <span key={item} className={`step-dot ${step === item ? 'step-dot-active' : ''}`}>Step {item + 1}</span>
          ))}
        </div>

        <form className="setup-form" onSubmit={finishSetup}>
          {step === 0 && (
            <div className="panel inset-panel">
              <h3>Basic profile</h3>
              <div className="grid two-col top-gap">
                <label>
                  Name
                  <input value={profile.name} onChange={(e) => updateField(profile, 'name', e.target.value, onComplete)} placeholder="Your name" required />
                </label>
                <label>
                  Gym name
                  <input value={profile.gymName} onChange={(e) => updateField(profile, 'gymName', e.target.value, onComplete)} placeholder="Your gym" />
                </label>
                <label>
                  Age
                  <input type="number" min="16" value={profile.age} onChange={(e) => updateField(profile, 'age', Number(e.target.value), onComplete)} />
                </label>
                <label>
                  Gender
                  <select value={profile.gender} onChange={(e) => updateField(profile, 'gender', e.target.value as GenderOption, onComplete)}>
                    {genderOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Training level
                  <select value={profile.level} onChange={(e) => updateField(profile, 'level', e.target.value as TrainingLevel, onComplete)}>
                    {trainingLevels.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Weekly session target
                  <input type="number" min="1" max="7" value={profile.frequencyTarget} onChange={(e) => updateField(profile, 'frequencyTarget', Number(e.target.value), onComplete)} />
                </label>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="panel inset-panel">
              <h3>Goals and body focus</h3>
              <p className="muted small">Choose the top three goals that matter most right now.</p>
              <div className="chip-row top-gap">
                {goalOptions.map((goal) => (
                  <button key={goal.value} type="button" className={`chip ${profile.goals.includes(goal.value) ? 'chip-active' : ''}`} onClick={() => toggleGoal(goal.value)}>
                    {goal.label}
                  </button>
                ))}
              </div>
              <div className="grid three-col top-gap">
                {bodyAreas.map((area) => (
                  <label key={area}>
                    {area}
                    <select value={profile.bodyFocus[area]} onChange={(e) => onComplete({ ...profile, bodyFocus: { ...profile.bodyFocus, [area]: e.target.value as BodyFocusLevel } })}>
                      {bodyLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="panel inset-panel">
              <h3>Programming preferences</h3>
              <div className="grid two-col top-gap">
                <label>
                  Cardio integration
                  <select value={profile.cardioPreference} onChange={(e) => updateField(profile, 'cardioPreference', e.target.value as CardioPreference, onComplete)}>
                    {cardioOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Workout style
                  <select value={profile.workoutStyle} onChange={(e) => updateField(profile, 'workoutStyle', e.target.value as WorkoutStyle, onComplete)}>
                    {workoutStyles.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Progress snapshot emphasis
                  <select value={profile.progressPriority} onChange={(e) => updateField(profile, 'progressPriority', e.target.value as ProgressPriority, onComplete)}>
                    {progressPriorities.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  Menstrual cycle preference
                  <select value={profile.menstruationPreference} onChange={(e) => updateField(profile, 'menstruationPreference', e.target.value as MenstruationPreference, onComplete)}>
                    {menstruationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                {profile.menstruationPreference === 'tracks-cycle' && (
                  <>
                    <label>
                      Cycle length (days)
                      <input type="number" min="20" max="40" value={profile.cycleLengthDays} onChange={(e) => updateField(profile, 'cycleLengthDays', Number(e.target.value), onComplete)} />
                    </label>
                    <label>
                      Period length (days)
                      <input type="number" min="2" max="10" value={profile.periodLengthDays} onChange={(e) => updateField(profile, 'periodLengthDays', Number(e.target.value), onComplete)} />
                    </label>
                  </>
                )}
                <label>
                  Favorite exercises
                  <input value={profile.favoriteExercises.join(', ')} onChange={(e) => updateField(profile, 'favoriteExercises', e.target.value.split(',').map((item) => item.trim()).filter(Boolean), onComplete)} placeholder="Comma separated" />
                </label>
                <label>
                  Banned exercises
                  <input value={profile.bannedExercises.join(', ')} onChange={(e) => updateField(profile, 'bannedExercises', e.target.value.split(',').map((item) => item.trim()).filter(Boolean), onComplete)} placeholder="Comma separated" />
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="panel inset-panel">
              <h3>Starting weights</h3>
              <p className="muted small">These only guide early load recommendations until enough workout history exists.</p>
              <div className="grid two-col top-gap">
                <label>Bench press (lb)<input type="number" min="0" step="5" value={profile.startingWeights.benchPress} onChange={(e) => onComplete({ ...profile, startingWeights: { ...profile.startingWeights, benchPress: Number(e.target.value) } })} /></label>
                <label>Deadlift / Romanian deadlift (lb)<input type="number" min="0" step="5" value={profile.startingWeights.deadlift} onChange={(e) => onComplete({ ...profile, startingWeights: { ...profile.startingWeights, deadlift: Number(e.target.value) } })} /></label>
                <label>Bicep curl (lb)<input type="number" min="0" step="5" value={profile.startingWeights.bicepCurl} onChange={(e) => onComplete({ ...profile, startingWeights: { ...profile.startingWeights, bicepCurl: Number(e.target.value) } })} /></label>
                <label>Glute bridge (lb)<input type="number" min="0" step="5" value={profile.startingWeights.gluteBridge} onChange={(e) => onComplete({ ...profile, startingWeights: { ...profile.startingWeights, gluteBridge: Number(e.target.value) } })} /></label>
                <label>Lat pulldown (lb)<input type="number" min="0" step="5" value={profile.startingWeights.latPulldown} onChange={(e) => onComplete({ ...profile, startingWeights: { ...profile.startingWeights, latPulldown: Number(e.target.value) } })} /></label>
                <label>Row (lb)<input type="number" min="0" step="5" value={profile.startingWeights.row} onChange={(e) => onComplete({ ...profile, startingWeights: { ...profile.startingWeights, row: Number(e.target.value) } })} /></label>
              </div>
            </div>
          )}

          <div className="space-between wrap-gap top-gap">
            <button type="button" className="ghost" onClick={prevStep} disabled={step === 0}>Back</button>
            {step < 3 ? (
              <button type="button" className="primary" onClick={nextStep}>Continue</button>
            ) : (
              <button className="primary" type="submit">Save profile and enter app</button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
