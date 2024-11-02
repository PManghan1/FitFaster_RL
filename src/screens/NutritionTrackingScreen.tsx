import React, { useCallback, useEffect } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import styled from 'styled-components/native';

import { ActionButton, ActionButtonText } from '../components/common/styled';
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';
import { analyticsService } from '../services/analytics';
import { nutritionService } from '../services/nutrition';
import { MetricType } from '../services/performance';

const Container = styled(View)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background.light};
`;

const Content = styled(ScrollView)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const NutritionTrackingScreen: React.FC = () => {
  const performanceMonitor = usePerformanceMonitoring({
    screenName: 'NutritionTrackingScreen',
    componentName: 'NutritionTrackingScreen',
    enableRenderTracking: true,
  });

  useEffect(() => {
    // Track screen view with performance context
    performanceMonitor.measureInteraction('screen_load', () => {
      analyticsService.trackScreenView('NutritionTracking', {
        performanceMetrics: {
          renderTime: performanceMonitor.getAverageMetric(
            MetricType.RENDER,
            'NutritionTrackingScreen',
          ),
        },
      });
    });

    // Track initial data load
    const loadPromise = new Promise<void>(resolve => {
      // TODO: Load initial nutrition data
      resolve();
    });

    performanceMonitor
      .measureApiCall(loadPromise, 'load_nutrition_data', { initialLoad: true })
      .catch(error => {
        analyticsService.trackError(error, {
          operation: 'load_nutrition_data',
          screen: 'NutritionTracking',
        });
        Alert.alert('Error', 'Failed to load nutrition data');
      });
  }, [performanceMonitor]);

  const handleMealLog = useCallback(async () => {
    const startTime = Date.now();

    try {
      await performanceMonitor.measureApiCall(
        nutritionService.logMeal({
          name: 'Test Meal',
          calories: 500,
          protein: 30,
          carbs: 50,
          fat: 20,
        }),
        'log_meal',
      );

      analyticsService.trackNutrition('meal', {
        duration: Date.now() - startTime,
        success: true,
        mealName: 'Test Meal',
      });
    } catch (error) {
      analyticsService.trackError(error as Error, {
        operation: 'log_meal',
        screen: 'NutritionTracking',
      });
      Alert.alert('Error', 'Failed to log meal');
    }
  }, [performanceMonitor]);

  const handleFoodScan = useCallback(async () => {
    const startTime = Date.now();

    try {
      await performanceMonitor.measureApiCall(nutritionService.scanFood('123456789'), 'scan_food');

      analyticsService.trackNutrition('scan', {
        duration: Date.now() - startTime,
        success: true,
        barcode: '123456789',
      });
    } catch (error) {
      analyticsService.trackError(error as Error, {
        operation: 'scan_food',
        screen: 'NutritionTracking',
      });
      Alert.alert('Error', 'Failed to scan food');
    }
  }, [performanceMonitor]);

  const handleSupplementLog = useCallback(async () => {
    const startTime = Date.now();

    try {
      await performanceMonitor.measureApiCall(
        nutritionService.logSupplement({
          name: 'Test Supplement',
        }),
        'log_supplement',
      );

      analyticsService.trackNutrition('supplement', {
        duration: Date.now() - startTime,
        success: true,
        supplementName: 'Test Supplement',
      });
    } catch (error) {
      analyticsService.trackError(error as Error, {
        operation: 'log_supplement',
        screen: 'NutritionTracking',
      });
      Alert.alert('Error', 'Failed to log supplement');
    }
  }, [performanceMonitor]);

  return (
    <Container>
      <Content>
        <ActionButton
          onPress={() => performanceMonitor.measureInteraction('press_log_meal', handleMealLog)}
        >
          <ActionButtonText>
            <Text>Log Meal</Text>
          </ActionButtonText>
        </ActionButton>

        <ActionButton
          onPress={() => performanceMonitor.measureInteraction('press_scan_food', handleFoodScan)}
        >
          <ActionButtonText>
            <Text>Scan Food</Text>
          </ActionButtonText>
        </ActionButton>

        <ActionButton
          onPress={() =>
            performanceMonitor.measureInteraction('press_log_supplement', handleSupplementLog)
          }
        >
          <ActionButtonText>
            <Text>Log Supplement</Text>
          </ActionButtonText>
        </ActionButton>
      </Content>
    </Container>
  );
};
