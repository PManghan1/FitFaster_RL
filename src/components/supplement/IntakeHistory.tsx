import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native-elements';
import type { SupplementIntake } from '../../types/supplement';
import tw from '../../utils/tailwind';

interface IntakeHistoryProps {
  intakes: SupplementIntake[];
  onDelete?: (intakeId: string) => void;
}

export const IntakeHistory: React.FC<IntakeHistoryProps> = ({ intakes, onDelete }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={tw`flex-1`}>
      {intakes.length === 0 ? (
        <Text style={tw`text-gray-500 text-center p-4`}>No intake history available</Text>
      ) : (
        intakes.map(intake => (
          <View
            key={intake.id}
            style={tw`bg-white p-4 mb-2 rounded-lg flex-row justify-between items-center`}
          >
            <View>
              <Text style={tw`font-semibold`}>{intake.dosageTaken} units</Text>
              <Text style={tw`text-gray-500 text-sm`}>{formatDate(intake.intakeDateTime)}</Text>
              {intake.notes && <Text style={tw`text-gray-600 text-sm mt-1`}>{intake.notes}</Text>}
            </View>
            {onDelete && (
              <Text style={tw`text-red-500`} onPress={() => onDelete(intake.id)}>
                Delete
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};
