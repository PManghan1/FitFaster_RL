import { BarCodeScanner } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';

interface FoodData {
  product_name: string;
  nutriments: {
    energy_kcal: number;
    proteins: number;
    carbohydrates: number;
    fat: number;
    [key: string]: any;
  };
}

const NutritionTrackingScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [foodData, setFoodData] = useState<FoodData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    setLoading(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const result = await response.json();
      if (result.status === 1) {
        const fetchedData: FoodData = {
          product_name: result.product.product_name || 'Unknown Product',
          nutriments: result.product.nutriments,
        };
        setFoodData(fetchedData);
      } else {
        Alert.alert('Product Not Found', 'The scanned barcode was not found in the database.');
      }
    } catch (error) {
      Alert.alert('Error', 'There was an error fetching the nutritional information.');
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned || loading ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Fetching nutritional information...</Text>
        </View>
      )}
      {foodData && (
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{foodData.product_name}</Text>
          <Text>Calories: {foodData.nutriments.energy_kcal || 'N/A'} kcal</Text>
          <Text>Proteins: {foodData.nutriments.proteins || 'N/A'} g</Text>
          <Text>Carbohydrates: {foodData.nutriments.carbohydrates || 'N/A'} g</Text>
          <Text>Fat: {foodData.nutriments.fat || 'N/A'} g</Text>
          <Button
            title={'Tap to Scan Again'}
            onPress={() => {
              setScanned(false);
              setFoodData(null);
            }}
          />
        </View>
      )}
      {!foodData && scanned && !loading && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )}
    </View>
  );
};

export default NutritionTrackingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    bottom: 100,
    elevation: 5,
    left: 20,
    padding: 20,
    position: 'absolute',
    right: 20,
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    left: '25%',
    padding: 20,
    position: 'absolute',
    right: '25%',
    top: '40%',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
