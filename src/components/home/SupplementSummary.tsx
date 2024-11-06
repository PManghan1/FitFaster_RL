import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import useSupplementStore from '../../store/supplement.store';
import { useSupplementAnalytics } from '../../hooks/useSupplementAnalytics';
import { useSupplementPerformance } from '../../hooks/useSupplementPerformance';
import tw from '../../utils/tailwind';

export const SupplementSummary: React.FC = () => {
  const navigation = useNavigation();
  const { supplements, intakes } = useSupplementStore();
  const { trackViewList } = useSupplementAnalytics();
  const { memoizeSupplementData } = useSupplementPerformance();

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const stats = useMemo(() => {
    const todayIntakes = intakes.filter(intake => {
      const intakeDate = new Date(intake.intakeDateTime);
      intakeDate.setHours(0, 0, 0, 0);
      return intakeDate.getTime() === today.getTime();
    });

    const remainingSupplements = supplements.filter(
      supplement => !todayIntakes.some(intake => intake.supplementId === supplement.id)
    );

    const nextReminder = supplements
      .filter(s => s.remindersEnabled && s.reminderTimes.length > 0)
      .reduce(
        (earliest, supplement) => {
          const nextTime = supplement.reminderTimes
            .map(time => {
              const [hours, minutes] = time.split(':').map(Number);
              const reminderTime = new Date();
              reminderTime.setHours(hours, minutes, 0, 0);
              if (reminderTime <= new Date()) {
                reminderTime.setDate(reminderTime.getDate() + 1);
              }
              return { time: reminderTime, supplement };
            })
            .sort((a, b) => a.time.getTime() - b.time.getTime())[0];

          if (!earliest || nextTime.time < earliest.time) {
            return nextTime;
          }
          return earliest;
        },
        null as { time: Date; supplement: (typeof supplements)[0] } | null
      );

    return {
      total: supplements.length,
      remaining: remainingSupplements.length,
      completed: supplements.length - remainingSupplements.length,
      compliance: supplements.length
        ? ((supplements.length - remainingSupplements.length) / supplements.length) * 100
        : 0,
      nextReminder,
      remainingSupplements: memoizeSupplementData(remainingSupplements),
    };
  }, [supplements, intakes, today, memoizeSupplementData]);

  const handlePress = () => {
    trackViewList();
    navigation.navigate('Supplements' as never);
  };

  if (stats.total === 0) {
    return (
      <TouchableOpacity
        style={tw`bg-white rounded-lg p-4 shadow-sm mb-4`}
        onPress={handlePress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Add supplements"
        accessibilityHint="Navigate to supplements screen to add your first supplement"
      >
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-lg font-bold`}>Supplements</Text>
          <Icon name="chevron-right" size={20} color="#6B7280" />
        </View>
        <Text style={tw`text-gray-600`}>Add your supplements to start tracking</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={tw`bg-white rounded-lg p-4 shadow-sm mb-4`}
      onPress={handlePress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Supplements summary. ${stats.remaining} remaining today`}
      accessibilityHint="Navigate to supplements screen"
    >
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`text-lg font-bold`}>Supplements</Text>
        <Icon name="chevron-right" size={20} color="#6B7280" />
      </View>

      <View style={tw`flex-row justify-between mb-4`}>
        <View>
          <Text style={tw`text-gray-600 mb-1`}>Today&apos;s Progress</Text>
          <Text style={tw`text-2xl font-bold`}>
            {stats.completed}/{stats.total}
          </Text>
        </View>
        <View>
          <Text style={tw`text-gray-600 mb-1`}>Compliance</Text>
          <Text
            style={tw`text-2xl font-bold ${stats.compliance >= 80 ? 'text-green-600' : 'text-yellow-600'}`}
          >
            {Math.round(stats.compliance)}%
          </Text>
        </View>
      </View>

      {stats.nextReminder && (
        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-600 mb-1`}>Next Reminder</Text>
          <Text style={tw`text-base`}>
            {stats.nextReminder.supplement.name} at{' '}
            {stats.nextReminder.time.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}

      {stats.remaining > 0 && (
        <View>
          <Text style={tw`text-gray-600 mb-2`}>{stats.remaining} remaining today</Text>
          {stats.remainingSupplements.slice(0, 2).map(supplement => (
            <Text key={supplement.id} style={tw`text-gray-500 text-sm`}>
              • {supplement.name} ({supplement.formattedDosage})
            </Text>
          ))}
          {stats.remaining > 2 && (
            <Text style={tw`text-gray-500 text-sm`}>• And {stats.remaining - 2} more...</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};
