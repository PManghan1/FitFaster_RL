import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList, DietaryPreferences } from '../../types/onboarding';
import { Text, Button, Input } from 'react-native-elements';
import SelectionCard from '../../components/onboarding/SelectionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dietaryPreferencesSchema } from '../../types/onboarding';
import { useOnboarding } from '../../hooks/useOnboarding';
import tw from '../../utils/tailwind';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'DietaryPreferences'>;

const DietaryPreferencesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { handleDietaryPreferences } = useOnboarding();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DietaryPreferences>({
    resolver: zodResolver(dietaryPreferencesSchema),
    defaultValues: {
      dietType: 'omnivore',
      allergies: [],
      restrictions: [],
      preferredMeals: 3,
      supplementUse: false,
      mealPrepPreference: 'mixed',
    },
  });

  const dietTypes = [
    { value: 'omnivore', label: 'Omnivore', description: 'Eat both plant and animal products' },
    { value: 'vegetarian', label: 'Vegetarian', description: 'No meat or fish' },
    { value: 'vegan', label: 'Vegan', description: 'No animal products' },
    { value: 'pescatarian', label: 'Pescatarian', description: 'Vegetarian plus seafood' },
    { value: 'keto', label: 'Keto', description: 'High-fat, low-carb' },
    { value: 'paleo', label: 'Paleo', description: 'Based on whole foods' },
  ] as const;

  const commonAllergies = [
    { value: 'dairy', label: 'Dairy' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'nuts', label: 'Nuts' },
    { value: 'shellfish', label: 'Shellfish' },
    { value: 'soy', label: 'Soy' },
    { value: 'wheat', label: 'Wheat' },
  ] as const;

  const mealCounts = [
    { value: 2, label: '2 meals', description: 'Intermittent fasting style' },
    { value: 3, label: '3 meals', description: 'Traditional meal pattern' },
    { value: 4, label: '4 meals', description: 'Including pre/post workout' },
    { value: 5, label: '5 meals', description: 'Frequent small meals' },
    { value: 6, label: '6 meals', description: 'Regular small portions' },
  ] as const;

  const mealPrepStyles = [
    { value: 'meal_prep', label: 'Meal Prep', description: 'Prepare meals in advance' },
    { value: 'daily_cooking', label: 'Daily Cooking', description: 'Cook fresh each day' },
    { value: 'mixed', label: 'Mixed Approach', description: 'Combination of both' },
  ] as const;

  const onSubmit = (data: DietaryPreferences) => {
    const { isValid } = handleDietaryPreferences(data);
    if (isValid) {
      navigation.navigate('ActivityLevel');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text h1 style={tw`text-2xl font-bold mb-6`}>
          Dietary Preferences
        </Text>
        <Text style={tw`text-gray-600 mb-8`}>
          Tell us about your eating habits and preferences to help personalize your nutrition plan.
        </Text>

        {/* Diet Type */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Diet Type</Text>
          <Controller
            control={control}
            name="dietType"
            render={({ field: { onChange, value } }) => (
              <View>
                {dietTypes.map(diet => (
                  <SelectionCard
                    key={diet.value}
                    title={diet.label}
                    description={diet.description}
                    selected={value === diet.value}
                    onPress={() => onChange(diet.value)}
                  />
                ))}
              </View>
            )}
          />
          {errors.dietType && <Text style={tw`text-red-500 mt-1`}>{errors.dietType.message}</Text>}
        </View>

        {/* Allergies */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Food Allergies</Text>
          <Text style={tw`text-gray-600 mb-4`}>Select all that apply</Text>
          <Controller
            control={control}
            name="allergies"
            render={({ field: { onChange, value } }) => (
              <View style={tw`flex-row flex-wrap justify-between`}>
                {commonAllergies.map(allergy => (
                  <SelectionCard
                    key={allergy.value}
                    title={allergy.label}
                    selected={value.includes(allergy.value)}
                    onPress={() => {
                      const newValue = value.includes(allergy.value)
                        ? value.filter(v => v !== allergy.value)
                        : [...value, allergy.value];
                      onChange(newValue);
                    }}
                    style={tw`w-[48%] mb-2`}
                  />
                ))}
              </View>
            )}
          />
          {/* Custom Allergy Input */}
          <Controller
            control={control}
            name="allergies"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Other allergies (comma-separated)"
                onChangeText={text => {
                  const customAllergies = text
                    .split(',')
                    .map(a => a.trim())
                    .filter(Boolean);
                  const standardAllergies = value.filter(v =>
                    commonAllergies.some(ca => ca.value === v)
                  );
                  onChange([...standardAllergies, ...customAllergies]);
                }}
                containerStyle={tw`mt-2`}
              />
            )}
          />
        </View>

        {/* Preferred Meals Per Day */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Preferred Meals Per Day</Text>
          <Controller
            control={control}
            name="preferredMeals"
            render={({ field: { onChange, value } }) => (
              <View>
                {mealCounts.map(count => (
                  <SelectionCard
                    key={count.value}
                    title={count.label}
                    description={count.description}
                    selected={value === count.value}
                    onPress={() => onChange(count.value)}
                  />
                ))}
              </View>
            )}
          />
          {errors.preferredMeals && (
            <Text style={tw`text-red-500 mt-1`}>{errors.preferredMeals.message}</Text>
          )}
        </View>

        {/* Supplement Use */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Supplement Use</Text>
          <Controller
            control={control}
            name="supplementUse"
            render={({ field: { onChange, value } }) => (
              <View>
                <SelectionCard
                  title="Yes, I use or plan to use supplements"
                  description="Track supplement intake and get reminders"
                  selected={value === true}
                  onPress={() => onChange(true)}
                />
                <SelectionCard
                  title="No, I don't use supplements"
                  description="Focus on nutrition from whole foods"
                  selected={value === false}
                  onPress={() => onChange(false)}
                />
              </View>
            )}
          />
        </View>

        {/* Meal Prep Preference */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Meal Preparation Style</Text>
          <Controller
            control={control}
            name="mealPrepPreference"
            render={({ field: { onChange, value } }) => (
              <View>
                {mealPrepStyles.map(style => (
                  <SelectionCard
                    key={style.value}
                    title={style.label}
                    description={style.description}
                    selected={value === style.value}
                    onPress={() => onChange(style.value)}
                  />
                ))}
              </View>
            )}
          />
          {errors.mealPrepPreference && (
            <Text style={tw`text-red-500 mt-1`}>{errors.mealPrepPreference.message}</Text>
          )}
        </View>

        <Button
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          buttonStyle={tw`bg-blue-500 py-3 rounded-lg`}
          titleStyle={tw`font-bold`}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DietaryPreferencesScreen;
