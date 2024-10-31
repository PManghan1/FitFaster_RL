import React from 'react';
import { StyleSheet, TextInputProps, ViewStyle } from 'react-native';

import { colors } from '../../theme';
import { Text, TextInput, View } from '../styled';

interface AuthInputProps extends Omit<TextInputProps, 'style'> {
  error?: string;
  label?: string;
  style?: ViewStyle;
  testID?: string;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  errorText: {
    color: colors.error.default,
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.background.default,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    padding: 16,
  },
  inputError: {
    borderColor: colors.error.default,
  },
  inputNormal: {
    borderColor: colors.border.default,
  },
  label: {
    color: colors.text.light,
    fontSize: 14,
    marginBottom: 4,
  },
});

export const AuthInput: React.FC<AuthInputProps> = ({ error, label, style, testID, ...props }) => {
  return (
    <View style={styles.container} accessible testID={testID}>
      {label && (
        <Text style={styles.label} accessibilityRole="text">
          {label}
        </Text>
      )}
      <TextInput
        style={[styles.input, error ? styles.inputError : styles.inputNormal, style]}
        placeholderTextColor={colors.border.dark}
        accessibilityLabel={label}
        accessibilityHint={error ? `Error: ${error}` : undefined}
        accessible
        testID={`${testID}-input`}
        {...props}
      />
      {error && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
};

AuthInput.displayName = 'AuthInput';
