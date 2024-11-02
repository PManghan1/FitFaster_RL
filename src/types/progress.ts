export interface ProgressMetrics {
  totalWorkouts: number;
  currentStreak: number;
  weeklyCount: number;
  totalVolume: number;
  mostUsedExercises: Array<{
    exerciseId: string;
    name: string;
    count: number;
  }>;
}

export interface WorkoutHistoryItem {
  id: string;
  date: string;
  exerciseCount: number;
  totalVolume: number;
  duration: number;
  name?: string;
}

export interface ProgressState {
  recentWorkouts: WorkoutHistoryItem[];
  metrics: ProgressMetrics;
  isLoading: boolean;
  error: string | null;
}

export interface ProgressStore extends ProgressState {
  loadProgress: (userId: string) => Promise<void>;
  loadRecentWorkouts: (userId: string, limit?: number) => Promise<void>;
  reset: () => void;
}
