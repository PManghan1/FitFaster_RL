import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import tw from '../../utils/tailwind';

interface QuickActionProps {
  title: string;
  icon: string;
  onPress: () => void;
  color?: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  title,
  icon,
  onPress,
  color = 'blue',
}) => {
  return (
    <TouchableOpacity
      style={tw`bg-${color}-50 rounded-lg p-4 flex-row items-center`}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={tw`mr-3`}>
        <Icon name={icon} type="feather" color={`${color}-500`} size={24} />
      </View>
      <Text style={tw`text-${color}-700 font-medium`}>{title}</Text>
    </TouchableOpacity>
  );
};

export const QuickActions: React.FC = () => {
  return (
    <View style={tw`p-4`}>
      <Text style={tw`text-lg font-bold mb-4`}>Quick Actions</Text>
      <View style={tw`space-y-2`}>
        <QuickAction title="Log Supplement" icon="plus-circle" onPress={() => {}} />
        <QuickAction title="View Progress" icon="bar-chart-2" onPress={() => {}} />
        <QuickAction title="Emergency" icon="phone" onPress={() => {}} color="red" />
      </View>
    </View>
  );
};
