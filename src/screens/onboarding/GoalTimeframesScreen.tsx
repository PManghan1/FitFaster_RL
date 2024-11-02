import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OnboardingStackParamList, GoalTimeframes } from '../../types/onboarding';
import { Text, Button, Input } from 'react-native-elements';
import SelectionCard from '../../components/onboarding/SelectionCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalTimeframesSchema } from '../../types/onboarding';
import { useOnboarding } from '../../hooks/useOnboarding';
import DateTimePicker from '@react-native-community/datetimepicker';
import tw from '../../utils/tailwind';

type NavigationProp = StackNavigationProp<OnboardingStackParamList, 'GoalTimeframes'>;

type Milestone = {
  description: string;
  targetDate: Date;
};

const GoalTimeframesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { handleGoalTimeframes } = useOnboarding();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<GoalTimeframes>({
    resolver: zodResolver(goalTimeframesSchema),
    defaultValues: {
      primaryGoal: 'weight_loss',
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      weeklyCommitmentHours: 5,
      milestones: [],
    },
  });

  const primaryGoals = [
    { value: 'weight_loss', label: 'Weight Loss', description: 'Reduce body fat and get lean' },
    { value: 'muscle_gain', label: 'Muscle Gain', description: 'Build strength and muscle mass' },
    { value: 'maintenance', label: 'Maintenance', description: 'Maintain current fitness level' },
    { value: 'general_fitness', label: 'General Fitness', description: 'Improve overall health' },
  ] as const;

  const weeklyCommitments = [
    { value: 3, label: '3 hours', description: 'Minimum commitment' },
    { value: 5, label: '5 hours', description: 'Moderate commitment' },
    { value: 7, label: '7 hours', description: 'High commitment' },
    { value: 10, label: '10+ hours', description: 'Intensive commitment' },
  ] as const;

  const onSubmit = (data: GoalTimeframes) => {
    const { isValid } = handleGoalTimeframes(data);
    if (isValid) {
      navigation.navigate('UserConsent');
    }
  };

  const handleDateSelect = (event: Event, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (selectedMilestoneIndex !== null) {
        const currentMilestones = watch('milestones');
        const updatedMilestones = [...currentMilestones];
        updatedMilestones[selectedMilestoneIndex] = {
          ...updatedMilestones[selectedMilestoneIndex],
          targetDate: selectedDate,
        };
        setValue('milestones', updatedMilestones);
      } else {
        setValue('targetDate', selectedDate);
      }
    }
  };

  const addMilestone = () => {
    const currentMilestones = watch('milestones');
    setValue('milestones', [...currentMilestones, { description: '', targetDate: new Date() }]);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text h1 style={tw`text-2xl font-bold mb-6`}>
          Set Your Goal Timeline
        </Text>
        <Text style={tw`text-gray-600 mb-8`}>
          Define your primary goal and set a realistic timeline for achieving it.
        </Text>

        {/* Primary Goal Selection */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Primary Goal</Text>
          <Controller
            control={control}
            name="primaryGoal"
            render={({ field: { onChange, value } }) => (
              <View>
                {primaryGoals.map(goal => (
                  <SelectionCard
                    key={goal.value}
                    title={goal.label}
                    description={goal.description}
                    selected={value === goal.value}
                    onPress={() => onChange(goal.value)}
                  />
                ))}
              </View>
            )}
          />
          {errors.primaryGoal && (
            <Text style={tw`text-red-500 mt-1`}>{errors.primaryGoal.message}</Text>
          )}
        </View>

        {/* Target Date Selection */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Target Date</Text>
          <Controller
            control={control}
            name="targetDate"
            render={({ field: { value } }) => (
              <View>
                <Button
                  title={value.toLocaleDateString()}
                  onPress={() => {
                    setSelectedMilestoneIndex(null);
                    setShowDatePicker(true);
                  }}
                  buttonStyle={tw`bg-gray-100 border border-gray-300`}
                  titleStyle={tw`text-gray-800`}
                />
              </View>
            )}
          />
          {errors.targetDate && (
            <Text style={tw`text-red-500 mt-1`}>{errors.targetDate.message}</Text>
          )}
        </View>

        {/* Weekly Commitment */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Weekly Time Commitment</Text>
          <Controller
            control={control}
            name="weeklyCommitmentHours"
            render={({ field: { onChange, value } }) => (
              <View>
                {weeklyCommitments.map(commitment => (
                  <SelectionCard
                    key={commitment.value}
                    title={commitment.label}
                    description={commitment.description}
                    selected={value === commitment.value}
                    onPress={() => onChange(commitment.value)}
                  />
                ))}
              </View>
            )}
          />
          {errors.weeklyCommitmentHours && (
            <Text style={tw`text-red-500 mt-1`}>{errors.weeklyCommitmentHours.message}</Text>
          )}
        </View>

        {/* Milestones */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-lg font-semibold mb-4`}>Milestones (Optional)</Text>
          <Controller
            control={control}
            name="milestones"
            render={({ field: { value } }) => (
              <View>
                {value.map((milestone: Milestone, index: number) => (
                  <View key={index} style={tw`mb-4`}>
                    <Input
                      placeholder="Milestone description"
                      value={milestone.description}
                      onChangeText={text => {
                        const updatedMilestones = [...value];
                        updatedMilestones[index] = {
                          ...updatedMilestones[index],
                          description: text,
                        };
                        setValue('milestones', updatedMilestones);
                      }}
                    />
                    <Button
                      title={milestone.targetDate.toLocaleDateString()}
                      onPress={() => {
                        setSelectedMilestoneIndex(index);
                        setShowDatePicker(true);
                      }}
                      buttonStyle={tw`bg-gray-100 border border-gray-300`}
                      titleStyle={tw`text-gray-800`}
                    />
                  </View>
                ))}
                <Button
                  title="Add Milestone"
                  onPress={addMilestone}
                  buttonStyle={tw`bg-gray-100 border border-gray-300`}
                  titleStyle={tw`text-gray-800`}
                />
              </View>
            )}
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={
              selectedMilestoneIndex !== null
                ? watch('milestones')[selectedMilestoneIndex].targetDate
                : watch('targetDate')
            }
            mode="date"
            display="default"
            onChange={handleDateSelect}
            minimumDate={new Date()}
          />
        )}

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

export default GoalTimeframesScreen;
