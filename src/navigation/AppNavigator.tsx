import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { WorkoutNavigator } from './WorkoutNavigator';
import { NutritionNavigator } from './NutritionNavigator';
import { SupplementNavigator } from './SupplementNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import Icon from 'react-native-vector-icons/Feather';
import tw from '../utils/tailwind';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: tw`border-t border-gray-200`,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="activity" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Nutrition"
        component={NutritionNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="clipboard" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Supplements"
        component={SupplementNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="package" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="user" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
