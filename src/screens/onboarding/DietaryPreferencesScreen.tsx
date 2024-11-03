import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Input } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectionCard } from '../../components/onboarding/SelectionCard';
import { useOnboarding } from '../../hooks/useOnboarding';
import type { DietaryPreference } from '../../types/onboarding';
import tw from '../../utils/tailwind';

const DIET_TYPES = [
  {
    value: 'omnivore',
    title: 'Omnivore',
    description: 'Eat both plant and animal products',
    icon: '🍖',
  },
  {
    value: 'vegetarian',
    title: 'Vegetarian',
    description: 'No meat, may include dairy and eggs',
    icon: '🥗',
  },
  {
    value: 'vegan',
    title: 'Vegan',
    description: 'No animal products',
    icon: '🌱',
  },
  {
    value: 'pescatarian',
    title: 'Pescatarian',
    description: 'Vegetarian plus seafood',
    icon: '🐟',
  },
  {
    value: 'keto',
    title: 'Keto',
    description: 'Low-carb, high-fat diet',
    icon: '🥑',
  },
  {
    value: 'paleo',
    title: 'Paleo',
    description: 'Based on whole foods',
    icon: '🥩',
  },
] as const;

export const DietaryPreferencesScreen: React.FC = () => {
  const { handleDietaryPreferences } = useOnboarding();
  const [preferences, setPreferences] = useState<DietaryPreference>({
    diet: 'omnivore',
    restrictions: [],
    intolerances: [],
  });
  const [newRestriction, setNewRestriction] = useState('');
  const [newIntolerance, setNewIntolerance] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddRestriction = () => {
    if (newRestriction.trim()) {
      setPreferences(prev => ({
        ...prev,
        restrictions: [...prev.restrictions, newRestriction.trim()],
      }));
      setNewRestriction('');
    }
  };

  const handleAddIntolerance = () => {
    if (newIntolerance.trim()) {
      setPreferences(prev => ({
        ...prev,
        intolerances: [...prev.intolerances, newIntolerance.trim()],
      }));
      setNewIntolerance('');
    }
  };

  const handleRemoveRestriction = (index: number) => {
    setPreferences(prev => ({
      ...prev,
      restrictions: prev.restrictions.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveIntolerance = (index: number) => {
    setPreferences(prev => ({
      ...prev,
      intolerances: prev.intolerances.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    const { isValid, errors } = await handleDietaryPreferences(preferences);
    if (!isValid && errors) {
      setError(Object.values(errors)[0]);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text h1 style={tw`text-2xl font-bold mb-2`}>
          Dietary Preferences
        </Text>
        <Text style={tw`text-gray-600 mb-6`}>
          Tell us about your dietary preferences and restrictions.
        </Text>

        <Text style={tw`text-lg font-bold mb-4`}>Diet Type</Text>
        <View style={tw`flex-row flex-wrap -mx-2 mb-6`}>
          {DIET_TYPES.map(diet => (
            <View key={diet.value} style={tw`w-1/2 px-2 mb-4`}>
              <SelectionCard
                title={diet.title}
                description={diet.description}
                icon={diet.icon}
                selected={preferences.diet === diet.value}
                onPress={() => setPreferences(prev => ({ ...prev, diet: diet.value }))}
                accessibilityLabel={`${diet.title} diet type`}
                accessibilityHint={diet.description}
              />
            </View>
          ))}
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-lg font-bold mb-2`}>Dietary Restrictions</Text>
          <View style={tw`flex-row mb-2`}>
            <Input
              containerStyle={tw`flex-1 mr-2`}
              value={newRestriction}
              onChangeText={setNewRestriction}
              placeholder="Add a restriction"
              onSubmitEditing={handleAddRestriction}
              returnKeyType="done"
            />
            <Button
              title="Add"
              onPress={handleAddRestriction}
              disabled={!newRestriction.trim()}
              buttonStyle={tw`bg-blue-500`}
            />
          </View>
          {preferences.restrictions.map((restriction, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleRemoveRestriction(index)}
              style={tw`bg-gray-100 rounded-full px-4 py-2 mb-2 flex-row justify-between items-center`}
              accessibilityLabel={`Remove ${restriction} restriction`}
            >
              <Text>{restriction}</Text>
              <Text style={tw`text-gray-500`}>✕</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={tw`mb-6`}>
          <Text style={tw`text-lg font-bold mb-2`}>Food Intolerances</Text>
          <View style={tw`flex-row mb-2`}>
            <Input
              containerStyle={tw`flex-1 mr-2`}
              value={newIntolerance}
              onChangeText={setNewIntolerance}
              placeholder="Add an intolerance"
              onSubmitEditing={handleAddIntolerance}
              returnKeyType="done"
            />
            <Button
              title="Add"
              onPress={handleAddIntolerance}
              disabled={!newIntolerance.trim()}
              buttonStyle={tw`bg-blue-500`}
            />
          </View>
          {preferences.intolerances.map((intolerance, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleRemoveIntolerance(index)}
              style={tw`bg-gray-100 rounded-full px-4 py-2 mb-2 flex-row justify-between items-center`}
              accessibilityLabel={`Remove ${intolerance} intolerance`}
            >
              <Text>{intolerance}</Text>
              <Text style={tw`text-gray-500`}>✕</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={tw`text-red-500 mb-4 text-center`}>{error}</Text>}

        <Button
          title="Continue"
          onPress={handleSubmit}
          buttonStyle={tw`bg-blue-500 py-3 rounded-lg`}
          titleStyle={tw`font-bold`}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DietaryPreferencesScreen;
