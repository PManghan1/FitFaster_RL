export type OnboardingGoalsFormData = {
  primaryGoal: string;
  secondaryGoals: string[];
  workoutTypes: string[];
  workoutsPerWeek: number;
  workoutDuration: number;
};

export type WorkoutType = 'strength' | 'cardio' | 'hiit' | 'yoga';

export type PrimaryGoal = 'weight-loss' | 'muscle-gain' | 'endurance' | 'flexibility';

export type SecondaryGoal = 'stress-reduction' | 'better-sleep' | 'energy-boost';
