import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectionCard } from '../../components/onboarding/SelectionCard';
import { useOnboarding } from '../../hooks/useOnboarding';
import type { ActivityLevel } from '../../types/onboarding';
import tw from '../../utils/tailwind';

const ACTIVITY_LEVELS: Array<{
  value: ActivityLevel;
  title: string;
  description: string;
  icon: string;
  examples: string[];
}> = [
  {
    value: 'sedentary',
    title: 'Sedentary',
    description: 'Little to no regular exercise',
    icon: '💺',
    examples: ['Desk job', 'Limited walking', 'Mostly sitting activities'],
  },
  {
    value: 'lightly_active',
    title: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    icon: '🚶',
    examples: ['Regular walking', 'Light housework', 'Casual cycling'],
  },
  {
    value: 'moderately_active',
    title: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week',
    icon: '🏃',
    examples: ['Regular workouts', 'Active job', 'Recreational sports'],
  },
  {
    value: 'very_active',
    title: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    icon: '💪',
    examples: ['Daily training', 'Physical labor job', 'Competitive sports'],
  },
  {
    value: 'extra_active',
    title: 'Extra Active',
    description: 'Very hard exercise & physical job',
    icon: '🏋️',
    examples: ['Professional athlete', 'Multiple training sessions/day', 'Heavy manual labor'],
  },
];

export const ActivityLevelScreen: React.FC = () => {
  const { handleActivityLevel } = useOnboarding();
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedLevel) {
      setError('Please select your activity level');
      return;
    }

    const { isValid, errors } = await handleActivityLevel(selectedLevel);
    if (!isValid && errors) {
      setError(Object.values(errors)[0]);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text h1 style={tw`text-2xl font-bold mb-2`}>
          Activity Level
        </Text>
        <Text style={tw`text-gray-600 mb-6`}>Select your typical daily activity level.</Text>

        <View style={tw`mb-6`}>
          {ACTIVITY_LEVELS.map(level => (
            <View key={level.value} style={tw`mb-4`}>
              <SelectionCard
                title={level.title}
                description={level.description}
                icon={level.icon}
                selected={selectedLevel === level.value}
                onPress={() => {
                  setSelectedLevel(level.value);
                  setError(null);
                }}
                accessibilityLabel={`${level.title} activity level`}
                accessibilityHint={level.description}
              >
                <View style={tw`mt-2`}>
                  <Text style={tw`text-gray-600 text-sm mb-1`}>Examples:</Text>
                  {level.examples.map((example, index) => (
                    <Text
                      key={index}
                      style={tw`text-gray-600 text-sm ml-4`}
                      accessibilityLabel={example}
                    >
                      • {example}
                    </Text>
                  ))}
                </View>
              </SelectionCard>
            </View>
          ))}
        </View>

        {error && <Text style={tw`text-red-500 mb-4 text-center`}>{error}</Text>}

        <Button
          title="Complete Setup"
          onPress={handleSubmit}
          disabled={!selectedLevel}
          buttonStyle={tw`bg-blue-500 py-3 rounded-lg`}
          titleStyle={tw`font-bold`}
          accessibilityLabel="Complete onboarding setup"
          accessibilityHint={
            selectedLevel
              ? `Selected activity level: ${selectedLevel}`
              : 'Please select an activity level'
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActivityLevelScreen;
