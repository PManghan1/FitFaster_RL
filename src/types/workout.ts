export enum MuscleGroup {
  CHEST = 'CHEST',
  BACK = 'BACK',
  SHOULDERS = 'SHOULDERS',
  BICEPS = 'BICEPS',
  TRICEPS = 'TRICEPS',
  LEGS = 'LEGS',
  CORE = 'CORE',
}

export enum ExerciseType {
  STRENGTH = 'STRENGTH',
  CARDIO = 'CARDIO',
  FLEXIBILITY = 'FLEXIBILITY',
}

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroups: MuscleGroup[];
  difficulty: Difficulty;
  equipment: string[];
  instructions: string[];
  type: ExerciseType;
  videoUrl: string | null;
}

export interface Set {
  id: string;
  exerciseId: string;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  completed: boolean;
}

export interface ExerciseWithSets {
  exercise: Exercise;
  sets: Set[];
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  completed: boolean;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  sets: WorkoutSet[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps?: number;
    duration?: number;
    distance?: number;
  }[];
  userId: string;
}

export interface WorkoutProgress {
  id: string;
  workoutId: string;
  date: string;
  completed: boolean;
  sets: WorkoutSet[];
  notes?: string;
  userId: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
  exercises: ExerciseWithSets[];
  notes?: string;
  userId: string;
  completed: boolean;
}
