import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RefreshCw } from 'react-native-feather';

import { theme } from '../../theme';

interface Props {
  onRetry?: () => void;
  onReset?: () => void;
}

export const NutritionErrorFallback: React.FC<Props> = ({ onRetry, onReset }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition Tracking Error</Text>

      <Text style={styles.message}>
        There was an issue with the nutrition tracking system. Your data is safely stored.
      </Text>

      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <RefreshCw width={20} height={20} color={theme.colors.background.default} />
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}

      {onReset && (
        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={onReset}>
          <Text style={styles.buttonText}>Close Scanner</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary.default,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
    width: '80%',
  },
  buttonText: {
    color: theme.colors.background.default,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    color: theme.colors.text.light,
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: theme.colors.error.default,
    marginTop: 12,
  },
  title: {
    color: theme.colors.text.default,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
