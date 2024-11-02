import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectionCard } from '../../components/onboarding/SelectionCard';
import { onboardingGoalsSchema } from '../../validation/goals';
import type { OnboardingGoalsFormData } from '../../types/goals';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

type OnboardingGoalsScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingGoals'>;
};

const primaryGoals = [
  { id: 'weight-loss', label: 'Weight Loss', description: 'Reduce body fat and get lean' },
  { id: 'muscle-gain', label: 'Muscle Gain', description: 'Build strength and muscle mass' },
  { id: 'endurance', label: 'Endurance', description: 'Improve cardiovascular fitness' },
  { id: 'flexibility', label: 'Flexibility', description: 'Enhance mobility and flexibility' },
];

const secondaryGoals = [
  {
    id: 'stress-reduction',
    label: 'Stress Reduction',
    description: 'Manage stress through exercise',
  },
  { id: 'better-sleep', label: 'Better Sleep', description: 'Improve sleep quality' },
  { id: 'energy-boost', label: 'Energy Boost', description: 'Increase daily energy levels' },
];

const workoutTypes = [
  { id: 'strength', label: 'Strength Training', description: 'Build muscle and strength' },
  { id: 'cardio', label: 'Cardio', description: 'Improve endurance and heart health' },
  { id: 'hiit', label: 'HIIT', description: 'High-intensity interval training' },
  { id: 'yoga', label: 'Yoga', description: 'Flexibility and mindfulness' },
];

export const OnboardingGoalsScreen: React.FC<OnboardingGoalsScreenProps> = ({
  navigation: _navigation,
}) => {
  const { control, handleSubmit } = useForm<OnboardingGoalsFormData>({
    resolver: zodResolver(onboardingGoalsSchema),
    defaultValues: {
      primaryGoal: '',
      secondaryGoals: [],
      workoutTypes: [],
      workoutsPerWeek: 3,
      workoutDuration: 30,
    },
  });

  const onSubmit = (data: OnboardingGoalsFormData) => {
    console.log('Form data:', data);
    // TODO: Handle form submission
  };

  return (
    <StyledScrollView className="flex-1 bg-white">
      <StyledView className="p-6">
        <StyledText className="text-2xl font-bold mb-6">Set Your Goals</StyledText>

        <StyledView className="mb-8">
          <StyledText className="text-lg font-semibold mb-4">Primary Goal</StyledText>
          <StyledText className="text-gray-600 mb-4">
            What&apos;s your main fitness goal? This will help us tailor your experience.
          </StyledText>
          <Controller
            control={control}
            name="primaryGoal"
            render={({ field: { onChange, value } }) => (
              <StyledView>
                {primaryGoals.map(goal => (
                  <SelectionCard
                    key={goal.id}
                    title={goal.label}
                    description={goal.description}
                    selected={value === goal.id}
                    onSelect={() => onChange(goal.id)}
                  />
                ))}
              </StyledView>
            )}
          />
        </StyledView>

        <StyledView className="mb-8">
          <StyledText className="text-lg font-semibold mb-4">Secondary Goals</StyledText>
          <StyledText className="text-gray-600 mb-4">
            What other benefits would you like to achieve? You can select multiple goals.
          </StyledText>
          <Controller
            control={control}
            name="secondaryGoals"
            render={({ field: { onChange, value } }) => (
              <StyledView>
                {secondaryGoals.map(goal => (
                  <SelectionCard
                    key={goal.id}
                    title={goal.label}
                    description={goal.description}
                    selected={value.includes(goal.id)}
                    onSelect={() => {
                      const newValue = value.includes(goal.id)
                        ? value.filter(g => g !== goal.id)
                        : [...value, goal.id];
                      onChange(newValue);
                    }}
                  />
                ))}
              </StyledView>
            )}
          />
        </StyledView>

        <StyledView className="mb-8">
          <StyledText className="text-lg font-semibold mb-4">Workout Types</StyledText>
          <StyledText className="text-gray-600 mb-4">
            What types of workouts interest you? Select all that apply.
          </StyledText>
          <Controller
            control={control}
            name="workoutTypes"
            render={({ field: { onChange, value } }) => (
              <StyledView>
                {workoutTypes.map(type => (
                  <SelectionCard
                    key={type.id}
                    title={type.label}
                    description={type.description}
                    selected={value.includes(type.id)}
                    onSelect={() => {
                      const newValue = value.includes(type.id)
                        ? value.filter(t => t !== type.id)
                        : [...value, type.id];
                      onChange(newValue);
                    }}
                  />
                ))}
              </StyledView>
            )}
          />
        </StyledView>

        <StyledView className="mb-8">
          <StyledText className="text-lg font-semibold mb-4">Workout Frequency</StyledText>
          <StyledText className="text-gray-600 mb-4">
            How many workouts can you commit to per week?
          </StyledText>
          <Controller
            control={control}
            name="workoutsPerWeek"
            render={({ field: { onChange, value } }) => (
              <StyledView>
                {[2, 3, 4, 5, 6].map(num => (
                  <SelectionCard
                    key={num}
                    title={`${num} workouts per week`}
                    description={`About ${num} workouts every week`}
                    selected={value === num}
                    onSelect={() => onChange(num)}
                  />
                ))}
              </StyledView>
            )}
          />
        </StyledView>

        <StyledView className="mb-8">
          <StyledText className="text-lg font-semibold mb-4">Workout Duration</StyledText>
          <StyledText className="text-gray-600 mb-4">
            How long can you spend on each workout?
          </StyledText>
          <Controller
            control={control}
            name="workoutDuration"
            render={({ field: { onChange, value } }) => (
              <StyledView>
                {[20, 30, 45, 60].map(duration => (
                  <SelectionCard
                    key={duration}
                    title={`${duration} minutes`}
                    description={`About ${duration} minutes per workout`}
                    selected={value === duration}
                    onSelect={() => onChange(duration)}
                  />
                ))}
              </StyledView>
            )}
          />
        </StyledView>

        <StyledView className="mt-8">
          <StyledText
            className="bg-blue-500 text-white text-center py-4 rounded-lg text-lg font-semibold"
            onPress={handleSubmit(onSubmit)}
          >
            Continue
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledScrollView>
  );
};
