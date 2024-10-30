export * from './ExerciseList';
export * from './SetInput';
export * from './WorkoutTimer';
export * from './WorkoutHistory';

// Example usage of workout components:
/*
import {
  ExerciseList,
  SetInput,
  WorkoutTimer,
  WorkoutHistory,
} from '@/components/workout';

// Using ExerciseList
<ExerciseList
  exercises={exercises}
  onSelectExercise={handleSelectExercise}
  onAddExercise={handleAddExercise}
  onFavorite={handleToggleFavorite}
  favorites={favoriteIds}
  selectedMuscleGroups={selectedGroups}
  onFilterChange={handleFilterChange}
/>

// Using SetInput
<SetInput
  exercise={selectedExercise}
  onSave={handleSaveSet}
/>

// Using WorkoutTimer
<WorkoutTimer
  initialTime={60}
  onComplete={handleRestComplete}
  presets={[30, 60, 90, 120]}
  label="Rest Timer"
/>

// Using WorkoutHistory
<WorkoutHistory
  workouts={workoutHistory}
  onSelectWorkout={handleSelectWorkout}
/>
*/
