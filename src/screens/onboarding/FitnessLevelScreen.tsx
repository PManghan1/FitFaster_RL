import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectionCard } from '../../components/onboarding/SelectionCard';
import { useOnboarding } from '../../hooks/useOnboarding';
import type { FitnessLevel } from '../../types/onboarding';
import tw from '../../utils/tailwind';

const FITNESS_LEVELS: Array<{
  value: FitnessLevel;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'beginner',
    title: 'Beginner',
    description: 'New to fitness or returning after a long break',
    icon: '🌱',
  },
  {
    value: 'intermediate',
    title: 'Intermediate',
    description: 'Regular exercise with basic form and endurance',
    icon: '💪',
  },
  {
    value: 'advanced',
    title: 'Advanced',
    description: 'Consistent training with good form and strength',
    icon: '🏃',
  },
  {
    value: 'athlete',
    title: 'Athlete',
    description: 'Competitive sports or professional training',
    icon: '🏆',
  },
];

export const FitnessLevelScreen: React.FC = () => {
  const { handleFitnessLevel } = useOnboarding();
  const [selectedLevel, setSelectedLevel] = React.useState<FitnessLevel | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedLevel) {
      setError('Please select your fitness level');
      return;
    }

    const { isValid, errors } = await handleFitnessLevel(selectedLevel);
    if (!isValid && errors) {
      setError(Object.values(errors)[0]);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text h1 style={tw`text-2xl font-bold mb-2`}>
          What&apos;s your fitness level?
        </Text>
        <Text style={tw`text-gray-600 mb-6`}>
          This helps us tailor your workouts and recommendations.
        </Text>

        <View style={tw`mb-6`}>
          {FITNESS_LEVELS.map(level => (
            <SelectionCard
              key={level.value}
              title={level.title}
              description={level.description}
              icon={level.icon}
              selected={selectedLevel === level.value}
              onPress={() => {
                setSelectedLevel(level.value);
                setError(null);
              }}
              style={tw`mb-4`}
              accessibilityLabel={`${level.title} fitness level`}
              accessibilityHint={level.description}
            />
          ))}
        </View>

        {error && <Text style={tw`text-red-500 mb-4 text-center`}>{error}</Text>}

        <Button
          title="Continue"
          onPress={handleSubmit}
          disabled={!selectedLevel}
          buttonStyle={tw`bg-blue-500 py-3 rounded-lg`}
          titleStyle={tw`font-bold`}
          accessibilityLabel="Continue to next step"
          accessibilityHint={
            selectedLevel
              ? `Selected fitness level: ${selectedLevel}`
              : 'Please select a fitness level'
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default FitnessLevelScreen;
