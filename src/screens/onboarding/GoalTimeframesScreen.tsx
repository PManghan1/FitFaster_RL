import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Input, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useOnboarding } from '../../hooks/useOnboarding';
import type { GoalTimeframe } from '../../types/onboarding';
import tw from '../../utils/tailwind';

const GOAL_TYPES = [
  { value: 'weight', label: 'Weight Goal', icon: '⚖️' },
  { value: 'muscle', label: 'Muscle Gain', icon: '💪' },
  { value: 'endurance', label: 'Endurance', icon: '🏃' },
  { value: 'flexibility', label: 'Flexibility', icon: '🧘' },
  { value: 'health', label: 'General Health', icon: '❤️' },
] as const;

export const GoalTimeframesScreen: React.FC = () => {
  const { handleGoalTimeframes } = useOnboarding();
  const [goals, setGoals] = useState<GoalTimeframe[]>([]);
  const [currentGoal, setCurrentGoal] = useState<Partial<GoalTimeframe>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddGoal = () => {
    if (!currentGoal.type || !currentGoal.target || !currentGoal.deadline) {
      setError('Please fill in all goal details');
      return;
    }

    setGoals([...goals, currentGoal as GoalTimeframe]);
    setCurrentGoal({});
    setError(null);
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (goals.length === 0) {
      setError('Please add at least one goal');
      return;
    }

    const { isValid, errors } = await handleGoalTimeframes(goals);
    if (!isValid && errors) {
      setError(Object.values(errors)[0]);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text h1 style={tw`text-2xl font-bold mb-2`}>
          Set Your Goals
        </Text>
        <Text style={tw`text-gray-600 mb-6`}>Define your fitness goals and target dates.</Text>

        <View style={tw`mb-6`}>
          <Text style={tw`text-gray-700 mb-2`}>Goal Type</Text>
          <View style={tw`flex-row flex-wrap -mx-1`}>
            {GOAL_TYPES.map(type => (
              <TouchableOpacity
                key={type.value}
                style={tw`px-1 w-1/2 mb-2`}
                onPress={() => setCurrentGoal({ ...currentGoal, type: type.value })}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Select ${type.label} goal type`}
              >
                <View
                  style={tw`p-3 rounded-lg ${
                    currentGoal.type === type.value ? 'bg-blue-100' : 'bg-gray-100'
                  }`}
                >
                  <Text style={tw`text-center`}>
                    {type.icon} {type.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Target Value"
            keyboardType="numeric"
            value={currentGoal.target?.toString()}
            onChangeText={value =>
              setCurrentGoal({ ...currentGoal, target: parseFloat(value) || 0 })
            }
            placeholder="Enter your target"
            containerStyle={tw`mb-4`}
          />

          <Button
            title="Select Target Date"
            onPress={() => setShowDatePicker(true)}
            type="outline"
            buttonStyle={tw`mb-4`}
          />

          {showDatePicker && (
            <DateTimePicker
              value={currentGoal.deadline || new Date()}
              mode="date"
              minimumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) {
                  setCurrentGoal({ ...currentGoal, deadline: date });
                }
              }}
            />
          )}

          <Button
            title="Add Goal"
            onPress={handleAddGoal}
            disabled={!currentGoal.type || !currentGoal.target || !currentGoal.deadline}
            buttonStyle={tw`bg-blue-500`}
          />
        </View>

        {goals.length > 0 && (
          <View style={tw`mb-6`}>
            <Text style={tw`text-lg font-bold mb-2`}>Your Goals</Text>
            {goals.map((goal, index) => (
              <View
                key={index}
                style={tw`flex-row justify-between items-center bg-gray-100 p-3 rounded-lg mb-2`}
              >
                <View>
                  <Text style={tw`font-bold`}>
                    {GOAL_TYPES.find(t => t.value === goal.type)?.label}
                  </Text>
                  <Text style={tw`text-gray-600`}>
                    Target: {goal.target} by {goal.deadline.toLocaleDateString()}
                  </Text>
                </View>
                <Icon
                  name="x"
                  type="feather"
                  onPress={() => handleRemoveGoal(index)}
                  accessibilityLabel={`Remove ${
                    GOAL_TYPES.find(t => t.value === goal.type)?.label
                  } goal`}
                />
              </View>
            ))}
          </View>
        )}

        {error && <Text style={tw`text-red-500 mb-4 text-center`}>{error}</Text>}

        <Button
          title="Continue"
          onPress={handleSubmit}
          disabled={goals.length === 0}
          buttonStyle={tw`bg-blue-500 py-3 rounded-lg`}
          titleStyle={tw`font-bold`}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default GoalTimeframesScreen;
