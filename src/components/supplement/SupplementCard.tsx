import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-elements';
import type { Supplement } from '../../types/supplement';
import tw from '../../utils/tailwind';

interface SupplementCardProps {
  supplement: Supplement;
  onPress: () => void;
  onLogIntake: () => void;
}

export const SupplementCard: React.FC<SupplementCardProps> = ({
  supplement,
  onPress,
  onLogIntake,
}) => {
  return (
    <TouchableOpacity
      style={tw`bg-white rounded-lg p-4 shadow-sm mb-4`}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${supplement.name} details`}
      accessibilityHint="Double tap to view supplement details"
    >
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <Text style={tw`text-lg font-bold`}>{supplement.name}</Text>
        <TouchableOpacity
          style={tw`bg-blue-500 px-4 py-2 rounded-lg`}
          onPress={onLogIntake}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Log intake for ${supplement.name}`}
          accessibilityHint={`Double tap to log ${supplement.dosage} ${supplement.unit} intake`}
        >
          <Text style={tw`text-white font-semibold`}>Log Intake</Text>
        </TouchableOpacity>
      </View>

      <Text style={tw`text-gray-600`}>
        {supplement.dosage} {supplement.unit} • {supplement.frequency}
      </Text>

      {supplement.notes && <Text style={tw`text-gray-500 mt-2`}>{supplement.notes}</Text>}
    </TouchableOpacity>
  );
};
