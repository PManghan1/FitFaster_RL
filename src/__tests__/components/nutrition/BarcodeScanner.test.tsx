import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { BarCodeScanner, BarCodeScannerProps } from 'expo-barcode-scanner';
import React from 'react';
import { Alert } from 'react-native';

import BarcodeScanner from '../../../components/nutrition/BarcodeScanner';
import { nutritionService } from '../../../services/nutrition';
import * as nutritionStoreModule from '../../../store/nutrition.store';
import { FoodItem } from '../../../types/nutrition';

import type { NutritionState } from '../../../store/nutrition.store';

// Mock the required modules
jest.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: {
    requestPermissionsAsync: jest.fn(),
    defaultProps: {
      barCodeTypes: ['EAN13'],
    },
  } as unknown as typeof BarCodeScanner,
}));

jest.mock('../../../services/nutrition', () => ({
  nutritionService: {
    fetchFoodItemByBarcode: jest.fn(),
  },
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Create a mock implementation of useNutritionStore
const mockUseNutritionStore = jest.spyOn(nutritionStoreModule, 'useNutritionStore');

describe('BarcodeScanner', () => {
  const mockOnScanSuccess = jest.fn();
  const mockAddFoodItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a complete mock state with all required properties
    mockUseNutritionStore.mockImplementation(selector =>
      selector({
        currentDate: new Date().toISOString().split('T')[0],
        dailyNutrition: null,
        nutritionGoal: null,
        isLoading: false,
        error: null,
        searchResults: [],
        selectedFoodItem: null,
        isSearching: false,
        searchError: null,
        setCurrentDate: jest.fn(),
        loadDailyNutrition: jest.fn(),
        searchFoodItems: jest.fn(),
        selectFoodItem: jest.fn(),
        addMealEntry: jest.fn(),
        updateMealEntry: jest.fn(),
        deleteMealEntry: jest.fn(),
        setNutritionGoal: jest.fn(),
        addFoodItem: mockAddFoodItem,
        reset: jest.fn(),
      } as NutritionState),
    );
    (BarCodeScanner.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  });

  afterEach(() => {
    mockUseNutritionStore.mockRestore();
  });

  it('requests camera permissions on mount', async () => {
    render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);

    await waitFor(() => {
      expect(BarCodeScanner.requestPermissionsAsync).toHaveBeenCalled();
    });
  });

  it('shows loading state while requesting permissions', () => {
    const { getByText } = render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);
    expect(getByText('Requesting camera permission...')).toBeTruthy();
  });

  it('shows error message when camera permission is denied', async () => {
    (BarCodeScanner.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { getByText } = render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);

    await waitFor(() => {
      expect(getByText(/No access to camera/)).toBeTruthy();
    });
  });

  it('handles successful barcode scan', async () => {
    const mockFoodItem: FoodItem = {
      id: '123',
      name: 'Test Food',
      brand: 'Test Brand',
      servings: [
        {
          amount: 100,
          unit: 'G' as const,
          nutrients: {
            calories: 200,
            protein: 10,
            carbs: 20,
            fat: 5,
          },
        },
      ],
      defaultServing: 0,
      barcode: '1234567890',
      isCustom: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (nutritionService.fetchFoodItemByBarcode as jest.Mock).mockResolvedValue(mockFoodItem);

    const { UNSAFE_getByType } = render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);

    await waitFor(() => {
      const scanner = UNSAFE_getByType(
        BarCodeScanner as unknown as React.ComponentType<BarCodeScannerProps>,
      );
      expect(scanner).toBeTruthy();
    });

    await act(async () => {
      const scanner = UNSAFE_getByType(
        BarCodeScanner as unknown as React.ComponentType<BarCodeScannerProps>,
      );
      fireEvent(scanner, 'onBarCodeScanned', { type: 'EAN13', data: '1234567890' });
    });

    await waitFor(() => {
      expect(nutritionService.fetchFoodItemByBarcode).toHaveBeenCalledWith('1234567890');
      expect(mockAddFoodItem).toHaveBeenCalledWith(mockFoodItem);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        `${mockFoodItem.name} added to your meal.`,
      );
      expect(mockOnScanSuccess).toHaveBeenCalled();
    });
  });

  it('handles product not found', async () => {
    (nutritionService.fetchFoodItemByBarcode as jest.Mock).mockResolvedValue(null);

    const { UNSAFE_getByType } = render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);

    await act(async () => {
      const scanner = UNSAFE_getByType(
        BarCodeScanner as unknown as React.ComponentType<BarCodeScannerProps>,
      );
      fireEvent(scanner, 'onBarCodeScanned', { type: 'EAN13', data: '1234567890' });
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Item Not Found',
        'The scanned barcode was not found. Please enter the food item manually.',
      );
      expect(mockOnScanSuccess).not.toHaveBeenCalled();
    });
  });

  it('handles API errors', async () => {
    (nutritionService.fetchFoodItemByBarcode as jest.Mock).mockRejectedValue(
      new Error('API Error'),
    );

    const { UNSAFE_getByType } = render(<BarcodeScanner onScanSuccess={mockOnScanSuccess} />);

    await act(async () => {
      const scanner = UNSAFE_getByType(
        BarCodeScanner as unknown as React.ComponentType<BarCodeScannerProps>,
      );
      fireEvent(scanner, 'onBarCodeScanned', { type: 'EAN13', data: '1234567890' });
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'An error occurred while scanning the barcode. Please try again.',
      );
      expect(mockOnScanSuccess).not.toHaveBeenCalled();
    });
  });

  it('allows scanning again after a scan', async () => {
    const { UNSAFE_getByType, getByText } = render(
      <BarcodeScanner onScanSuccess={mockOnScanSuccess} />,
    );

    await act(async () => {
      const scanner = UNSAFE_getByType(
        BarCodeScanner as unknown as React.ComponentType<BarCodeScannerProps>,
      );
      fireEvent(scanner, 'onBarCodeScanned', { type: 'EAN13', data: '1234567890' });
    });

    const scanAgainButton = getByText('Tap to Scan Again');
    expect(scanAgainButton).toBeTruthy();

    fireEvent.press(scanAgainButton);

    await waitFor(() => {
      const scanner = UNSAFE_getByType(
        BarCodeScanner as unknown as React.ComponentType<BarCodeScannerProps>,
      );
      expect(scanner.props.onBarCodeScanned).toBeTruthy();
    });
  });
});
