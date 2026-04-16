import type { CompletedWorkout, UserProfile } from '../types';
import { getCycleContext } from '../utils/cycle';

interface InsightsPanelProps {
  profile: UserProfile;
  workouts: CompletedWorkout[];
}

function barWidth(value: number, max: number) {
  if (max === 0) return '0%';
  return `${Math.max(10, Math.round((value / max) * 100))}%`;
}

export function InsightsPanel({ profile, workouts }: InsightsPanelProps) {
  const { cycleDay, phase } = getCycleContext(profile);
  const thisWeekCount = workouts.filter((workout) => {
    const daysAgo = (Date.now() - new Date(workout.completedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  }).length;

  const focusCounts = workouts.reduce(
    (acc, workout) => {
      workout.exercises.forEach((exercise) => {
        if (exercise.name.toLowerCase().includes('glute') || exercise.name.toLowerCase().includes('deadlift')) acc.glutes += 1;
        if (exercise.name.toLowerCase().includes('row') || exercise.name.toLowerCase().includes('pull')) acc.back += 1;
        if (exercise.name.toLowerCase().includes('curl') || exercise.name.toLowerCase().includes('pushdown')) acc.arms += 1;
      });
      return acc;
    },
    { glutes: 0, back: 0, arms: 0 },
  );

  const maxCount = Math.max(focusCounts.glutes, focusCounts.back, focusCounts.arms, 1);
  const totalLogged = workouts.length;

  return (
    <section className="panel">
      <p className="eyebrow">Insights</p>
      <h2>Progress snapshot</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Current phase</span>
          <strong>{phase === 'none' ? 'Not tracked' : phase}</strong>
          <p className="muted small">{cycleDay ? `Cycle day ${cycleDay}` : 'Cycle adaptation off'}</p>
        </div>
        <div className="stat-card">
          <span className="stat-label">This week</span>
          <strong>{thisWeekCount}/{profile.frequencyTarget}</strong>
          <p className="muted small">Sessions completed</p>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total workouts</span>
          <strong>{totalLogged}</strong>
          <p className="muted small">Logged in this browser</p>
        </div>
        <div className="stat-card">
          <span className="stat-label">Snapshot style</span>
          <strong>{profile.progressPriority}</strong>
          <p className="muted small">This changes what the app emphasizes here.</p>
        </div>
      </div>

      <details className="why-panel top-gap" open>
        <summary>What the app is emphasizing here</summary>
        <p className="muted small">
          {profile.progressPriority === 'strength' && 'This view is prioritizing measurable anchor-lift consistency and load progression.'}
          {profile.progressPriority === 'muscle-focus' && 'This view is emphasizing body-region training balance and repeated volume in the areas that matter most.'}
          {profile.progressPriority === 'consistency' && 'This view is prioritizing session completion and weekly adherence.'}
          {profile.progressPriority === 'energy' && 'This view is prioritizing sustainable training rhythm and cycle context.'}
          {profile.progressPriority === 'balanced' && 'This view is balancing adherence, training focus, and progression without leaning too hard into a single metric.'}
        </p>
      </details>

      <div className="mini-chart-group">
        {[
          ['Glute focus', focusCounts.glutes],
          ['Back focus', focusCounts.back],
          ['Arm focus', focusCounts.arms],
        ].map(([label, value]) => (
          <div className="mini-chart-row" key={label}>
            <div className="space-between wrap-gap">
              <span className="stat-label">{label}</span>
              <strong>{value}</strong>
            </div>
            <div className="mini-chart-track">
              <div className="mini-chart-fill" style={{ width: barWidth(Number(value), maxCount) }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
