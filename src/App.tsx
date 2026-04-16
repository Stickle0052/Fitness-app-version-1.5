import { useMemo, useState } from 'react';
import './styles.css';
import { CyclePanel } from './components/CyclePanel';
import { HistoryPanel } from './components/HistoryPanel';
import { InsightsPanel } from './components/InsightsPanel';
import { ProfilePanel } from './components/ProfilePanel';
import { ProfileSetup } from './components/ProfileSetup';
import { WorkoutCard } from './components/WorkoutCard';
import { WorkoutLogger } from './components/WorkoutLogger';
import { defaultCycleState, defaultProfile } from './data/profile';
import { advanceSession, generateWorkout, replaceExerciseInWorkout } from './engine/workoutGenerator';
import { usePersistentState } from './hooks/usePersistentState';
import type { CompletedWorkout, SessionType, TrainingState } from './types';

const defaultTrainingState: TrainingState = {
  nextSessionType: 'Lower A',
  workouts: [],
  preferredSwaps: {},
};

type AppTab = 'today' | 'history' | 'progress' | 'cycle' | 'profile';

function App() {
  const [profile, setProfile] = usePersistentState('velora-profile', defaultProfile);
  const [cycleState, setCycleState] = usePersistentState('velora-cycle', defaultCycleState);
  const [trainingState, setTrainingState] = usePersistentState('velora-training', defaultTrainingState);
  const [duration, setDuration] = useState(60);
  const [tab, setTab] = useState<AppTab>('today');

  const tabs: { value: AppTab; label: string }[] = [
    { value: 'today', label: 'Workout' },
    { value: 'history', label: 'History' },
    { value: 'progress', label: 'Progress' },
    ...(profile.menstruationPreference === 'tracks-cycle' ? [{ value: 'cycle' as AppTab, label: 'Cycle' }] : []),
    { value: 'profile', label: 'Profile' },
  ];

  const metrics = useMemo(
    () => ({
      currentSession: trainingState.nextSessionType,
      completedCount: trainingState.workouts.length,
      gymName: profile.gymName || 'Not set',
    }),
    [profile.gymName, trainingState.nextSessionType, trainingState.workouts.length],
  );

  const handleGenerate = () => {
    const workout = generateWorkout(
      profile,
      trainingState.workouts,
      trainingState.nextSessionType,
      duration,
      cycleState,
    );

    setTrainingState({
      ...trainingState,
      lastGeneratedWorkout: workout,
    });
  };

  const handleSaveWorkout = (completedWorkout: CompletedWorkout) => {
    setTrainingState({
      ...trainingState,
      workouts: [completedWorkout, ...trainingState.workouts],
      lastGeneratedWorkout: undefined,
      nextSessionType: advanceSession(trainingState.nextSessionType),
    });
    setTab('history');
  };

  const handleSwapExercise = (currentExerciseId: string, replacementExerciseId: string) => {
    if (!trainingState.lastGeneratedWorkout) return;
    setTrainingState({
      ...trainingState,
      preferredSwaps: { ...trainingState.preferredSwaps, [currentExerciseId]: replacementExerciseId },
      lastGeneratedWorkout: replaceExerciseInWorkout(
        trainingState.lastGeneratedWorkout,
        trainingState.workouts,
        currentExerciseId,
        replacementExerciseId,
        profile,
      ),
    });
  };

  const resetRotation = (sessionType: SessionType) => {
    setTrainingState({ ...trainingState, nextSessionType: sessionType });
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setTrainingState({
      ...trainingState,
      workouts: trainingState.workouts.filter((workout) => workout.workoutId !== workoutId),
    });
  };

  if (!profile.setupComplete) {
    return <ProfileSetup profile={profile} onComplete={setProfile} />;
  }

  return (
    <div className="app-shell app-with-bottom-nav">
      <header className="topbar">
        <div>
          <p className="eyebrow">Velora Training</p>
          <h1>Adaptive gym coaching</h1>
          <p className="muted">Tell the app who you are, what you want, and how you want to train. It will tell you exactly what to do next.</p>
        </div>
        <div className="header-stats">
          <div>
            <span className="stat-label">Next session</span>
            <strong>{metrics.currentSession}</strong>
          </div>
          <div>
            <span className="stat-label">Logged workouts</span>
            <strong>{metrics.completedCount}</strong>
          </div>
          <div>
            <span className="stat-label">Gym</span>
            <strong>{metrics.gymName}</strong>
          </div>
        </div>
      </header>

      <main className="single-column-layout">
        {tab === 'today' && (
          <>
            <section className="panel action-bar">
              <div>
                <p className="eyebrow">Today</p>
                <h2>Current workout</h2>
              </div>
              <div className="action-row">
                <label>
                  Session length
                  <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                    {[45, 60, 75, 90].map((value) => <option key={value} value={value}>{value} min</option>)}
                  </select>
                </label>
                <button className="primary" onClick={handleGenerate}>Generate workout</button>
              </div>
            </section>

            <WorkoutCard
              workout={trainingState.lastGeneratedWorkout}
              profile={profile}
              onRegenerate={handleGenerate}
              onSwapExercise={handleSwapExercise}
            />
            <WorkoutLogger workout={trainingState.lastGeneratedWorkout} onSave={handleSaveWorkout} />

            <section className="panel">
              <p className="eyebrow">Rotation</p>
              <h2>Reset next session</h2>
              <div className="chip-row">
                {(['Lower A', 'Upper A', 'Lower B', 'Upper B'] as SessionType[]).map((session) => (
                  <button className={`chip ${trainingState.nextSessionType === session ? 'chip-active' : ''}`} key={session} onClick={() => resetRotation(session)}>
                    {session}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === 'history' && <HistoryPanel workouts={trainingState.workouts} onDelete={handleDeleteWorkout} />}
        {tab === 'progress' && <InsightsPanel profile={profile} workouts={trainingState.workouts} />}
        {tab === 'cycle' && profile.menstruationPreference === 'tracks-cycle' && (
          <CyclePanel profile={profile} cycleState={cycleState} onChange={setCycleState} workout={trainingState.lastGeneratedWorkout} />
        )}
        {tab === 'profile' && (
          <div className="main-column">
            <ProfilePanel profile={profile} onChange={setProfile} />
          </div>
        )}
      </main>

      <nav className={`bottom-nav bottom-nav-${tabs.length}`}>
        {tabs.map(({ value, label }) => (
          <button key={value} className={`bottom-nav-item ${tab === value ? 'bottom-nav-item-active' : ''}`} onClick={() => setTab(value)}>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
