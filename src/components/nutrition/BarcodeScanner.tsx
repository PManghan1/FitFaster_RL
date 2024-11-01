import { BarCodeScanner } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { nutritionService } from '../../services/nutrition';
import { useNutritionStore } from '../../store/nutrition.store';
import { theme } from '../../theme';

interface BarcodeScannerProps {
  onScanSuccess: () => void;
}

const BarcodeScannerComponent: React.FC<BarcodeScannerProps> = ({ onScanSuccess }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const addFoodItem = useNutritionStore(state => state.addFoodItem);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    setScanned(true);
    try {
      const foodItem = await nutritionService.fetchFoodItemByBarcode(data);
      if (foodItem) {
        addFoodItem(foodItem);
        Alert.alert('Success', `${foodItem.name} added to your meal.`);
        onScanSuccess();
      } else {
        Alert.alert(
          'Item Not Found',
          'The scanned barcode was not found. Please enter the food item manually.',
        );
      }
    } catch (error) {
      console.error('Barcode scanning error:', error);
      Alert.alert('Error', 'An error occurred while scanning the barcode. Please try again.');
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>
          No access to camera. Please allow camera permissions from your device settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
          <Text style={styles.buttonText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    padding: theme.spacing.md,
  },
  buttonText: {
    color: theme.colors.text.default,
    fontSize: theme.typography.fontSize.md,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});

export default BarcodeScannerComponent;
