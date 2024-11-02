import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList, FitnessLevel } from '../../types/onboarding';
import { Text, Button } from 'react-native-elements';
import SelectionCard from '../../components/onboarding/SelectionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fitnessLevelSchema } from '../../types/onboarding';
import { useOnboarding } from '../../hooks/useOnboarding';
import tw from '../../utils/tailwind';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'FitnessLevel'>;

const FitnessLevelScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { handleFitnessLevel } = useOnboarding();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FitnessLevel>({
    resolver: zodResolver(fitnessLevelSchema),
    defaultValues: {
      experienceLevel: 'beginner',
      weeklyActivityFrequency: 3,
      typicalExercises: [],
      injuryHistory: [],
      preferredWorkoutTime: 'flexible',
    },
  });

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to fitness or getting back into it' },
    { value: 'intermediate', label: 'Intermediate', description: 'Regular exercise for 6+ months' },
    { value: 'advanced', label: 'Advanced', description: 'Consistent training for 1+ years' },
  ] as const;

  const exerciseTypes = [
    { value: 'walking', label: 'Walking' },
    { value: 'running', label: 'Running' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'swimming', label: 'Swimming' },
    { value: 'weight_training', label: 'Weight Training' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'sports', label: 'Sports' },
  ] as const;

  const workoutTimes = [
    { value: 'morning', label: 'Morning', description: 'Early morning workouts' },
    { value: 'afternoon', label: 'Afternoon', description: 'Mid-day workouts' },
    { value: 'evening', label: 'Evening', description: 'Evening workouts' },
    { value: 'flexible', label: 'Flexible', description: 'No specific preference' },
  ] as const;

  const onSubmit = (data: FitnessLevel) => {
    const { isValid } = handleFitnessLevel(data);
    if (isValid) {
      navigation.navigate('GoalTimeframes');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text h1 style={tw`text-2xl font-bold mb-6`}>
          Your Fitness Experience
        </Text>
        <Text style={tw`text-gray-600 mb-8`}>
          Help us understand your fitness background to create an appropriate program.
        </Text>

        {/* Experience Level */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Experience Level</Text>
          <Controller
            control={control}
            name="experienceLevel"
            render={({ field: { onChange, value } }) => (
              <View>
                {experienceLevels.map(level => (
                  <SelectionCard
                    key={level.value}
                    title={level.label}
                    description={level.description}
                    selected={value === level.value}
                    onPress={() => onChange(level.value)}
                  />
                ))}
              </View>
            )}
          />
          {errors.experienceLevel && (
            <Text style={tw`text-red-500 mt-1`}>{errors.experienceLevel.message}</Text>
          )}
        </View>

        {/* Weekly Activity Frequency */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Weekly Activity</Text>
          <Controller
            control={control}
            name="weeklyActivityFrequency"
            render={({ field: { onChange, value } }) => (
              <View>
                {[0, 1, 2, 3, 4, 5, 6, 7].map(num => (
                  <SelectionCard
                    key={num}
                    title={`${num} ${num === 1 ? 'day' : 'days'} per week`}
                    description={`${num === 0 ? 'Currently inactive' : `Active ${num} days a week`}`}
                    selected={value === num}
                    onPress={() => onChange(num)}
                  />
                ))}
              </View>
            )}
          />
          {errors.weeklyActivityFrequency && (
            <Text style={tw`text-red-500 mt-1`}>{errors.weeklyActivityFrequency.message}</Text>
          )}
        </View>

        {/* Typical Exercises */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Typical Exercises</Text>
          <Text style={tw`text-gray-600 mb-4`}>Select all that you regularly do</Text>
          <Controller
            control={control}
            name="typicalExercises"
            render={({ field: { onChange, value } }) => (
              <View style={tw`flex-row flex-wrap justify-between`}>
                {exerciseTypes.map(exercise => (
                  <SelectionCard
                    key={exercise.value}
                    title={exercise.label}
                    selected={value.includes(exercise.value)}
                    onPress={() => {
                      const newValue = value.includes(exercise.value)
                        ? value.filter(v => v !== exercise.value)
                        : [...value, exercise.value];
                      onChange(newValue);
                    }}
                    style={tw`w-[48%] mb-2`}
                  />
                ))}
              </View>
            )}
          />
          {errors.typicalExercises && (
            <Text style={tw`text-red-500 mt-1`}>{errors.typicalExercises.message}</Text>
          )}
        </View>

        {/* Preferred Workout Time */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Preferred Workout Time</Text>
          <Controller
            control={control}
            name="preferredWorkoutTime"
            render={({ field: { onChange, value } }) => (
              <View>
                {workoutTimes.map(time => (
                  <SelectionCard
                    key={time.value}
                    title={time.label}
                    description={time.description}
                    selected={value === time.value}
                    onPress={() => onChange(time.value)}
                  />
                ))}
              </View>
            )}
          />
          {errors.preferredWorkoutTime && (
            <Text style={tw`text-red-500 mt-1`}>{errors.preferredWorkoutTime.message}</Text>
          )}
        </View>

        <Button
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          buttonStyle={tw`bg-blue-500 py-3 rounded-lg`}
          titleStyle={tw`font-bold`}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default FitnessLevelScreen;
