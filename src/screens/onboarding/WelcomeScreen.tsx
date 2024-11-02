import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingGoalsSchema } from '../../validation/goals';
import type { OnboardingGoalsFormData } from '../../types/goals';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

type OnboardingStackParamList = {
  Welcome: undefined;
  Goals: undefined;
};

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { handleSubmit } = useForm<OnboardingGoalsFormData>({
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
    navigation.navigate('Goals');
  };

  return (
    <StyledScrollView className="flex-1 bg-white">
      <StyledView className="p-6">
        <StyledText className="text-2xl font-bold mb-6">Welcome to FitFaster</StyledText>

        <StyledView className="mb-8">
          <StyledText className="text-lg font-semibold mb-4">Let&apos;s Get Started</StyledText>
          <StyledText className="text-gray-600 mb-4">
            Tell us about your fitness goals and preferences to help us personalize your experience.
          </StyledText>
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
