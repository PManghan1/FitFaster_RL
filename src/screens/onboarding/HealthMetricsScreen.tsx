import React from 'react';
import { View, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList, HealthMetrics } from '../../types/onboarding';
import { Text, Button } from 'react-native-elements';
import SelectionCard from '../../components/onboarding/SelectionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { healthMetricsSchema } from '../../types/onboarding';
import { useOnboarding } from '../../hooks/useOnboarding';
import tw from '../../utils/tailwind';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'HealthMetrics'>;

const HealthMetricsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { handleHealthMetrics } = useOnboarding();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HealthMetrics>({
    resolver: zodResolver(healthMetricsSchema),
    defaultValues: {
      height: 170,
      weight: 70,
      age: 25,
      gender: 'prefer_not_to_say',
      medicalConditions: [],
      medications: [],
    },
  });

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ] as const;

  const onSubmit = (data: HealthMetrics) => {
    const { isValid } = handleHealthMetrics(data);
    if (isValid) {
      navigation.navigate('FitnessLevel');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text h1 style={tw`text-2xl font-bold mb-6`}>
          Let&apos;s get to know you better
        </Text>
        <Text style={tw`text-gray-600 mb-8`}>
          This information helps us create a personalized plan for your fitness journey.
        </Text>

        {/* Height Input */}
        <Controller
          control={control}
          name="height"
          render={({ field: { onChange, value } }) => (
            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-700 mb-2`}>Height (cm)</Text>
              <TextInput
                style={tw`border border-gray-300 rounded-lg p-3`}
                keyboardType="numeric"
                placeholder="Enter your height"
                onChangeText={val => onChange(parseInt(val, 10))}
                value={value.toString()}
              />
              {errors.height && <Text style={tw`text-red-500 mt-1`}>{errors.height.message}</Text>}
            </View>
          )}
        />

        {/* Weight Input */}
        <Controller
          control={control}
          name="weight"
          render={({ field: { onChange, value } }) => (
            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-700 mb-2`}>Weight (kg)</Text>
              <TextInput
                style={tw`border border-gray-300 rounded-lg p-3`}
                keyboardType="numeric"
                placeholder="Enter your weight"
                onChangeText={val => onChange(parseInt(val, 10))}
                value={value.toString()}
              />
              {errors.weight && <Text style={tw`text-red-500 mt-1`}>{errors.weight.message}</Text>}
            </View>
          )}
        />

        {/* Age Input */}
        <Controller
          control={control}
          name="age"
          render={({ field: { onChange, value } }) => (
            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-700 mb-2`}>Age</Text>
              <TextInput
                style={tw`border border-gray-300 rounded-lg p-3`}
                keyboardType="numeric"
                placeholder="Enter your age"
                onChangeText={val => onChange(parseInt(val, 10))}
                value={value.toString()}
              />
              {errors.age && <Text style={tw`text-red-500 mt-1`}>{errors.age.message}</Text>}
            </View>
          )}
        />

        {/* Gender Selection */}
        <Text style={tw`text-gray-700 mb-2`}>Gender</Text>
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <View style={tw`flex-row flex-wrap justify-between mb-4`}>
              {genderOptions.map(option => (
                <SelectionCard
                  key={option.value}
                  title={option.label}
                  selected={value === option.value}
                  onPress={() => onChange(option.value)}
                  style={tw`w-[48%] mb-2`}
                />
              ))}
            </View>
          )}
        />

        {/* Medical Conditions */}
        <Controller
          control={control}
          name="medicalConditions"
          render={({ field: { onChange, value } }) => (
            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-700 mb-2`}>Medical Conditions (Optional)</Text>
              <TextInput
                style={tw`border border-gray-300 rounded-lg p-3`}
                placeholder="Enter any medical conditions"
                onChangeText={val => onChange(val.split(',').map(s => s.trim()))}
                value={value?.join(', ')}
                multiline
              />
            </View>
          )}
        />

        {/* Medications */}
        <Controller
          control={control}
          name="medications"
          render={({ field: { onChange, value } }) => (
            <View style={tw`mb-8`}>
              <Text style={tw`text-gray-700 mb-2`}>Medications (Optional)</Text>
              <TextInput
                style={tw`border border-gray-300 rounded-lg p-3`}
                placeholder="Enter any medications"
                onChangeText={val => onChange(val.split(',').map(s => s.trim()))}
                value={value?.join(', ')}
                multiline
              />
            </View>
          )}
        />

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

export default HealthMetricsScreen;
