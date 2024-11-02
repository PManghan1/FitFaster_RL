import React, { useCallback, useEffect } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styled } from 'nativewind';

import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring';
import { analyticsService } from '../services/analytics';
import { nutritionService } from '../services/nutrition';
import { MetricType } from '../services/performance';

// Style the components with NativeWind
const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

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
            'NutritionTrackingScreen'
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
        'log_meal'
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
        'log_supplement'
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
    <StyledView className="flex-1 bg-background-light">
      <StyledScrollView className="flex-1 p-4">
        <StyledTouchableOpacity
          className="bg-primary flex-row items-center justify-center rounded-lg p-4 mb-4"
          onPress={() => performanceMonitor.measureInteraction('press_log_meal', handleMealLog)}
        >
          <StyledText className="text-background font-bold text-base text-center">
            Log Meal
          </StyledText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity
          className="bg-primary flex-row items-center justify-center rounded-lg p-4 mb-4"
          onPress={() => performanceMonitor.measureInteraction('press_scan_food', handleFoodScan)}
        >
          <StyledText className="text-background font-bold text-base text-center">
            Scan Food
          </StyledText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity
          className="bg-primary flex-row items-center justify-center rounded-lg p-4 mb-4"
          onPress={() =>
            performanceMonitor.measureInteraction('press_log_supplement', handleSupplementLog)
          }
        >
          <StyledText className="text-background font-bold text-base text-center">
            Log Supplement
          </StyledText>
        </StyledTouchableOpacity>
      </StyledScrollView>
    </StyledView>
  );
};
