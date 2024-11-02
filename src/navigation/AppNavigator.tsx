import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Activity, Home, Calendar, Settings } from 'react-native-feather';
import { styled } from 'nativewind';
import { useOfflineSync } from '../hooks/useOfflineSync';

import { OnboardingNavigator } from './OnboardingNavigator';
import { HomeScreen } from '../screens/HomeScreen';
import { WorkoutScreen } from '../screens/WorkoutScreen';
import { NutritionTrackingScreen } from '../screens/NutritionTrackingScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import type { BasicUserInfo } from '../types/onboarding';
import type { OnboardingGoalsFormData } from '../types/goals';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StyledView = styled(View);
const StyledText = styled(Text);

const LoadingScreen = () => (
  <StyledView className="flex-1 items-center justify-center bg-white" testID="loading-screen">
    <ActivityIndicator size="large" color="#3B82F6" />
    <StyledText className="mt-4 text-gray-600">Loading...</StyledText>
  </StyledView>
);

const ErrorScreen = () => (
  <StyledView className="flex-1 items-center justify-center bg-white" testID="error-screen">
    <StyledText className="text-red-500 text-lg">Something went wrong</StyledText>
    <StyledText className="mt-2 text-gray-600">Please try again later</StyledText>
  </StyledView>
);

const MainTabs = () => {
  return (
    <StyledView className="flex-1" testID="main-tabs">
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#6B7280',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <Home stroke={color} width={24} height={24} />,
          }}
        />
        <Tab.Screen
          name="Workout"
          component={WorkoutScreen}
          options={{
            tabBarIcon: ({ color }) => <Calendar stroke={color} width={24} height={24} />,
          }}
        />
        <Tab.Screen
          name="Nutrition"
          component={NutritionTrackingScreen}
          options={{
            tabBarIcon: ({ color }) => <Settings stroke={color} width={24} height={24} />,
          }}
        />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            tabBarIcon: ({ color }) => <Activity stroke={color} width={24} height={24} />,
          }}
        />
      </Tab.Navigator>
    </StyledView>
  );
};

export const AppNavigator = () => {
  const {
    data: userInfo,
    isLoading: isLoadingInfo,
    error: userInfoError,
  } = useOfflineSync<BasicUserInfo>({
    key: 'userBasicInfo',
  });

  const {
    data: userGoals,
    isLoading: isLoadingGoals,
    error: userGoalsError,
  } = useOfflineSync<OnboardingGoalsFormData>({
    key: 'userGoals',
  });

  // Show loading screen while fetching data
  if (isLoadingInfo || isLoadingGoals) {
    return <LoadingScreen />;
  }

  // Show error screen if there's an error
  if (userInfoError || userGoalsError) {
    return <ErrorScreen />;
  }

  // Show onboarding if user info or goals are missing
  const needsOnboarding = !userInfo || !userGoals;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {needsOnboarding ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
};
