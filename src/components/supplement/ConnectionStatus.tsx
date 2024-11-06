import React from 'react';
import { View } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { useNetInfo } from '@react-native-community/netinfo';
import tw from '../../utils/tailwind';

export const ConnectionStatus: React.FC = () => {
  const netInfo = useNetInfo();

  if (netInfo.isConnected) {
    return null;
  }

  return (
    <View
      style={tw`bg-red-50 p-4 flex-row items-center justify-center`}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Icon
        name="wifi-off"
        type="feather"
        size={16}
        color="#EF4444"
        style={tw`mr-2`}
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
      />
      <Text
        style={tw`text-red-600 font-medium text-base`}
        accessibilityLabel="No internet connection. Some features may be limited. Please check your connection."
      >
        No internet connection. Some features may be limited.
      </Text>
    </View>
  );
};
