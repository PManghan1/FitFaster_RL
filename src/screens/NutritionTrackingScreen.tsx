import React, { useCallback, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';
import { analyticsService } from '../services/analytics';
import { nutritionService } from '../services/nutrition';

const Container = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.light};
`;

const Content = styled(ScrollView)`
  flex: 1;
  padding: 16px;
`;

const ActionButton = styled(TouchableOpacity)`
  background-color: ${({ theme }) => theme.colors.primary.default};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const ButtonText = styled(Text)`
  color: white;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
`;

export const NutritionTrackingScreen: React.FC = () => {
  const performance = usePerformanceMonitoring({
    screenName: 'NutritionTrackingScreen',
    componentName: 'NutritionTrackingScreen',
    enableRenderTracking: true,
  });

  useEffect(() => {
    // Track screen view
    analyticsService.trackScreenView('NutritionTracking');

    // Track initial load time
    const loadPromise = new Promise<void>(resolve => {
      // TODO: Load initial nutrition data
      resolve();
    });
    performance.measureApiCall(loadPromise, 'load_nutrition_data', { initialLoad: true });
  }, [performance]);

  const handleMealLog = useCallback(async () => {
    try {
      await nutritionService.logMeal({
        name: 'Test Meal',
        calories: 500,
        protein: 30,
        carbs: 50,
        fat: 20,
      });
    } catch (error) {
      console.error('Failed to log meal:', error);
    }
  }, []);

  const handleFoodScan = useCallback(async () => {
    try {
      await nutritionService.scanFood('123456789');
    } catch (error) {
      console.error('Failed to scan food:', error);
    }
  }, []);

  const handleSupplementLog = useCallback(async () => {
    try {
      await nutritionService.logSupplement({
        name: 'Test Supplement',
      });
    } catch (error) {
      console.error('Failed to log supplement:', error);
    }
  }, []);

  return (
    <Container>
      <Content>
        <ActionButton onPress={handleMealLog}>
          <ButtonText>
            <Text>Log Meal</Text>
          </ButtonText>
        </ActionButton>

        <ActionButton onPress={handleFoodScan}>
          <ButtonText>
            <Text>Scan Food</Text>
          </ButtonText>
        </ActionButton>

        <ActionButton onPress={handleSupplementLog}>
          <ButtonText>
            <Text>Log Supplement</Text>
          </ButtonText>
        </ActionButton>
      </Content>
    </Container>
  );
};
