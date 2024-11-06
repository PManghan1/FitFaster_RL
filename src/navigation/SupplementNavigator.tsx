import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SupplementListScreen } from '../screens/supplement/SupplementListScreen';
import { SupplementDetailsScreen } from '../screens/supplement/SupplementDetailsScreen';
import { AddSupplementScreen } from '../screens/supplement/AddSupplementScreen';

export type SupplementStackParamList = {
  SupplementList: undefined;
  SupplementDetails: { supplementId: string };
  AddSupplement: undefined;
};

const Stack = createStackNavigator<SupplementStackParamList>();

export const SupplementNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="SupplementList"
        component={SupplementListScreen}
        options={{
          title: 'Supplements',
        }}
      />
      <Stack.Screen
        name="SupplementDetails"
        component={SupplementDetailsScreen}
        options={{
          title: 'Supplement Details',
        }}
      />
      <Stack.Screen
        name="AddSupplement"
        component={AddSupplementScreen}
        options={{
          title: 'Add Supplement',
        }}
      />
    </Stack.Navigator>
  );
};
