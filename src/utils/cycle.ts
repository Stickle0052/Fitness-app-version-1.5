import type { CyclePhase, CycleState, SymptomTag, UserProfile } from '../types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function daysSince(dateString: string): number {
  if (!dateString) return 0;
  const then = new Date(dateString);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / MS_PER_DAY));
}

export function inferCycleDay(lastPeriodStart: string, cycleLengthDays: number): number {
  const elapsed = daysSince(lastPeriodStart);
  return (elapsed % cycleLengthDays) + 1;
}

export function inferCyclePhase(cycleDay: number, periodLengthDays: number, cycleLengthDays: number): CyclePhase {
  if (cycleDay <= periodLengthDays) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulatory';
  if (cycleDay <= cycleLengthDays) return 'luteal';
  return 'follicular';
}

export function getCycleContext(profile: UserProfile, cycleState?: CycleState): { cycleDay: number | null; phase: CyclePhase } {
  if (profile.menstruationPreference === 'does-not-menstruate') {
    return { cycleDay: null, phase: 'none' };
  }

  const startDate = cycleState?.lastPeriodStart || new Date().toISOString().slice(0, 10);
  const cycleDay = inferCycleDay(startDate, profile.cycleLengthDays);
  return {
    cycleDay,
    phase: inferCyclePhase(cycleDay, profile.periodLengthDays, profile.cycleLengthDays),
  };
}

export function describePhase(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual':
      return 'Keep the main lift if performance is stable. Trim accessory fatigue first if energy feels lower.';
    case 'follicular':
      return 'Normal progression window. Good time for standard volume and steady loading.';
    case 'ovulatory':
      return 'Train normally. No forced push. Let actual performance decide.';
    case 'luteal':
      return 'Hold primary progression if performance is there. Reduce density before reducing the main lift.';
    case 'none':
      return 'No cycle-based modulation is active. Training follows performance, workload, and time available.';
  }
}

export function symptomImpact(symptoms: SymptomTag[]): { modifier: number; note?: string } {
  if (symptoms.length === 0) return { modifier: 1 };
  if (symptoms.includes('fatigue') || symptoms.includes('low-energy') || symptoms.includes('cramps')) {
    return { modifier: 0.96, note: 'Symptoms suggest keeping the main lift steady and trimming accessory fatigue.' };
  }
  if (symptoms.includes('headache') || symptoms.includes('low-mood')) {
    return { modifier: 0.98, note: 'Symptoms suggest slightly simplifying the session while keeping quality high.' };
  }
  return { modifier: 0.99, note: 'Symptoms are logged, so the session is staying conservative today.' };
}
