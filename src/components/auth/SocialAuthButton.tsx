import { Provider } from '@supabase/supabase-js';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

import { colors } from '../../theme';

interface SocialAuthButtonProps {
  provider: Provider;
  onPress: () => Promise<void>;
  isLoading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const getProviderConfig = (provider: Provider) => {
  switch (provider) {
    case 'google':
      return {
        text: 'Continue with Google',
        backgroundColor: colors.background.default,
        textColor: colors.text.default,
        borderColor: colors.border.default,
      };
    case 'apple':
      return {
        text: 'Continue with Apple',
        backgroundColor: '#000', // Keeping black for Apple as it's their brand requirement
        textColor: colors.background.default,
        borderColor: '#000', // Keeping black for Apple as it's their brand requirement
      };
    case 'facebook':
      return {
        text: 'Continue with Facebook',
        backgroundColor: colors.social.facebook,
        textColor: colors.background.default,
        borderColor: colors.social.facebook,
      };
    default:
      return {
        text: `Continue with ${provider}`,
        backgroundColor: colors.background.default,
        textColor: colors.text.default,
        borderColor: colors.border.default,
      };
  }
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    padding: 16,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  provider,
  onPress,
  isLoading = false,
  style,
  testID,
}) => {
  const config = getProviderConfig(provider);

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.button,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={config.textColor} style={styles.loadingIndicator} />
      ) : null}
      <Text style={[styles.text, { color: config.textColor }]}>{config.text}</Text>
    </TouchableOpacity>
  );
};
