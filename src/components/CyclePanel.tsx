import type { CycleState, GeneratedWorkout, SymptomTag, UserProfile } from '../types';
import { describePhase, getCycleContext } from '../utils/cycle';

interface CyclePanelProps {
  profile: UserProfile;
  cycleState: CycleState;
  onChange: (next: CycleState) => void;
  workout?: GeneratedWorkout;
}

const symptomOptions: { value: SymptomTag; label: string }[] = [
  { value: 'cramps', label: 'Cramps' },
  { value: 'bloating', label: 'Bloating' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'headache', label: 'Headache' },
  { value: 'low-mood', label: 'Low mood' },
  { value: 'low-energy', label: 'Low energy' },
];

export function CyclePanel({ profile, cycleState, onChange, workout }: CyclePanelProps) {
  const { cycleDay, phase } = getCycleContext(profile, cycleState);

  const toggleSymptom = (symptom: SymptomTag) => {
    const hasSymptom = cycleState.currentSymptoms.includes(symptom);
    onChange({
      ...cycleState,
      currentSymptoms: hasSymptom
        ? cycleState.currentSymptoms.filter((item) => item !== symptom)
        : [...cycleState.currentSymptoms, symptom],
    });
  };

  const markStarted = () => {
    const today = new Date().toISOString().slice(0, 10);
    onChange({
      ...cycleState,
      active: true,
      lastPeriodStart: today,
      recentEvents: [`Period started on ${today}`, ...cycleState.recentEvents].slice(0, 6),
    });
  };

  const markEnded = () => {
    const today = new Date().toISOString().slice(0, 10);
    onChange({
      ...cycleState,
      active: false,
      lastPeriodEnd: today,
      recentEvents: [`Period ended on ${today}`, ...cycleState.recentEvents].slice(0, 6),
    });
  };

  return (
    <section className="panel">
      <div className="space-between wrap-gap">
        <div>
          <p className="eyebrow">Cycle</p>
          <h2>Cycle tracking and symptoms</h2>
          <p className="muted small">Track changes only when relevant. The app uses this screen to explain any workout adjustments.</p>
        </div>
        <div className="chip-row">
          <button className="primary" onClick={markStarted}>My period has started</button>
          <button className="ghost" onClick={markEnded}>My period has ended</button>
        </div>
      </div>

      <div className="stats-grid top-gap">
        <div className="stat-card">
          <span className="stat-label">Current phase</span>
          <strong>{phase}</strong>
          <p className="muted small">{cycleDay ? `Cycle day ${cycleDay}` : 'Cycle tracking is off'}</p>
        </div>
        <div className="stat-card">
          <span className="stat-label">Current status</span>
          <strong>{cycleState.active ? 'Period active' : 'Outside period window'}</strong>
          <p className="muted small">Use the start and end buttons to keep this flexible.</p>
        </div>
      </div>

      <details className="why-panel top-gap" open>
        <summary>About this phase</summary>
        <p className="muted small">{describePhase(phase)}</p>
      </details>

      <details className="why-panel top-gap" open>
        <summary>Symptoms</summary>
        <div className="chip-row top-gap">
          {symptomOptions.map((option) => (
            <button
              key={option.value}
              className={`chip ${cycleState.currentSymptoms.includes(option.value) ? 'chip-active' : ''}`}
              onClick={() => toggleSymptom(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </details>

      <details className="why-panel top-gap" open>
        <summary>Workout adjustments and why</summary>
        {workout ? (
          <ul className="compact-list muted small">
            {workout.adjustmentSummary.map((item) => <li key={item}>{item}</li>)}
          </ul>
        ) : (
          <p className="muted small">Generate a workout to see what changed because of phase, symptoms, or recent performance.</p>
        )}
      </details>

      {cycleState.recentEvents.length > 0 && (
        <details className="why-panel top-gap">
          <summary>Recent cycle events</summary>
          <ul className="compact-list muted small">
            {cycleState.recentEvents.map((event) => <li key={event}>{event}</li>)}
          </ul>
        </details>
      )}
    </section>
  );
}
