import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList, ActivityLevel } from '../../types/onboarding';
import { Text, Button } from 'react-native-elements';
import SelectionCard from '../../components/onboarding/SelectionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { activityLevelSchema } from '../../types/onboarding';
import { useOnboarding } from '../../hooks/useOnboarding';
import tw from '../../utils/tailwind';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'ActivityLevel'>;

const ActivityLevelScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { handleActivityLevel } = useOnboarding();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivityLevel>({
    resolver: zodResolver(activityLevelSchema),
    defaultValues: {
      dailyActivityLevel: 'moderately_active',
      occupation: 'desk_job',
      transportationMode: 'mixed',
      weekendActivityLevel: 'same_as_weekday',
    },
  });

  const activityLevels = [
    {
      value: 'sedentary',
      label: 'Sedentary',
      description: 'Little to no daily physical activity beyond basic movements',
    },
    {
      value: 'lightly_active',
      label: 'Lightly Active',
      description: 'Light walking, standing, or other light activities throughout the day',
    },
    {
      value: 'moderately_active',
      label: 'Moderately Active',
      description: 'Regular walking, physical job, or consistent light exercise',
    },
    {
      value: 'very_active',
      label: 'Very Active',
      description: 'Physical labor, athletic training, or intense daily exercise',
    },
  ] as const;

  const occupationTypes = [
    {
      value: 'desk_job',
      label: 'Desk Job',
      description: 'Mostly sitting throughout the day',
    },
    {
      value: 'light_physical',
      label: 'Light Physical Work',
      description: 'Mix of sitting and moving, some physical tasks',
    },
    {
      value: 'heavy_physical',
      label: 'Heavy Physical Work',
      description: 'Mostly physical labor or constant movement',
    },
    {
      value: 'other',
      label: 'Other/Variable',
      description: 'Varying activity levels or non-standard work pattern',
    },
  ] as const;

  const transportationModes = [
    {
      value: 'car',
      label: 'Car/Public Transit',
      description: 'Minimal walking during commute',
    },
    {
      value: 'public_transport',
      label: 'Public Transport + Walking',
      description: 'Regular walking to/from stations/stops',
    },
    {
      value: 'bicycle',
      label: 'Bicycle',
      description: 'Active transportation by bike',
    },
    {
      value: 'walking',
      label: 'Walking',
      description: 'Primarily walk to destinations',
    },
    {
      value: 'mixed',
      label: 'Mixed',
      description: 'Combination of different modes',
    },
  ] as const;

  const weekendActivityLevels = [
    {
      value: 'less_active',
      label: 'Less Active',
      description: 'More relaxed and sedentary on weekends',
    },
    {
      value: 'same_as_weekday',
      label: 'Similar to Weekdays',
      description: 'Maintain similar activity levels',
    },
    {
      value: 'more_active',
      label: 'More Active',
      description: 'Engage in more physical activities on weekends',
    },
  ] as const;

  const onSubmit = (data: ActivityLevel) => {
    const { isValid } = handleActivityLevel(data);
    if (isValid) {
      navigation.navigate('OnboardingGoals');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text h1 style={tw`text-2xl font-bold mb-6`}>
          Daily Activity Level
        </Text>
        <Text style={tw`text-gray-600 mb-8`}>
          Help us understand your typical daily activity patterns to better customize your fitness
          plan.
        </Text>

        {/* Daily Activity Level */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Overall Daily Activity</Text>
          <Controller
            control={control}
            name="dailyActivityLevel"
            render={({ field: { onChange, value } }) => (
              <View>
                {activityLevels.map(level => (
                  <SelectionCard
                    key={level.value}
                    title={level.label}
                    description={level.description}
                    selected={value === level.value}
                    onPress={() => onChange(level.value)}
                  />
                ))}
              </View>
            )}
          />
          {errors.dailyActivityLevel && (
            <Text style={tw`text-red-500 mt-1`}>{errors.dailyActivityLevel.message}</Text>
          )}
        </View>

        {/* Occupation Type */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Occupation Type</Text>
          <Controller
            control={control}
            name="occupation"
            render={({ field: { onChange, value } }) => (
              <View>
                {occupationTypes.map(type => (
                  <SelectionCard
                    key={type.value}
                    title={type.label}
                    description={type.description}
                    selected={value === type.value}
                    onPress={() => onChange(type.value)}
                  />
                ))}
              </View>
            )}
          />
          {errors.occupation && (
            <Text style={tw`text-red-500 mt-1`}>{errors.occupation.message}</Text>
          )}
        </View>

        {/* Transportation Mode */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Primary Transportation Mode</Text>
          <Controller
            control={control}
            name="transportationMode"
            render={({ field: { onChange, value } }) => (
              <View>
                {transportationModes.map(mode => (
                  <SelectionCard
                    key={mode.value}
                    title={mode.label}
                    description={mode.description}
                    selected={value === mode.value}
                    onPress={() => onChange(mode.value)}
                  />
                ))}
              </View>
            )}
          />
          {errors.transportationMode && (
            <Text style={tw`text-red-500 mt-1`}>{errors.transportationMode.message}</Text>
          )}
        </View>

        {/* Weekend Activity Level */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Weekend Activity Level</Text>
          <Controller
            control={control}
            name="weekendActivityLevel"
            render={({ field: { onChange, value } }) => (
              <View>
                {weekendActivityLevels.map(level => (
                  <SelectionCard
                    key={level.value}
                    title={level.label}
                    description={level.description}
                    selected={value === level.value}
                    onPress={() => onChange(level.value)}
                  />
                ))}
              </View>
            )}
          />
          {errors.weekendActivityLevel && (
            <Text style={tw`text-red-500 mt-1`}>{errors.weekendActivityLevel.message}</Text>
          )}
        </View>

        <Button
          title="Complete Setup"
          onPress={handleSubmit(onSubmit)}
          buttonStyle={tw`bg-blue-500 py-3 rounded-lg`}
          titleStyle={tw`font-bold`}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActivityLevelScreen;
