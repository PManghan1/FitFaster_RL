import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WorkoutSummary } from '../components/home/WorkoutSummary';
import { NutritionSummary } from '../components/home/NutritionSummary';
import { SupplementSummary } from '../components/home/SupplementSummary';
import { ProgressSummary } from '../components/home/ProgressSummary';
import tw from '../utils/tailwind';

export const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Refresh data here
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <ScrollView
        contentContainerStyle={tw`p-4`}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ProgressSummary />
        <WorkoutSummary />
        <NutritionSummary />
        <SupplementSummary />
      </ScrollView>
    </SafeAreaView>
  );
};
