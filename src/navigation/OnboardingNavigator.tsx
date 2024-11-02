import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { styled } from 'nativewind';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { OnboardingGoalsScreen } from '../screens/onboarding/OnboardingGoalsScreen';

const StyledView = styled(View);

export type OnboardingStackParamList = {
  Welcome: undefined;
  OnboardingGoals: undefined;
  // Add other onboarding screens here as needed
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => {
  return (
    <StyledView className="flex-1" testID="onboarding-navigator">
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Prevent back gesture during onboarding
          animation: 'slide_from_right',
        }}
        initialRouteName="Welcome"
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="OnboardingGoals"
          component={OnboardingGoalsScreen}
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </StyledView>
  );
};
