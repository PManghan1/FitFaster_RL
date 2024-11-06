import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { AppNavigator } from '../../navigation/AppNavigator';
import useSupplementStore from '../../store/supplement.store';
import { mockSupplementStore } from '../utils/supplement-test-utils';
import { renderWithNavigation, mockDeepLink } from '../utils/navigation-test-utils';

// Mock all required stores
jest.mock('../../store/supplement.store', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Add other store mocks as needed
jest.mock('../../store/workout.store', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../store/nutrition.store', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock error boundary
jest.mock('../../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSupplementStore as jest.Mock).mockReturnValue(mockSupplementStore);
  });

  it('renders all main tabs with proper accessibility labels', () => {
    const { getByRole } = renderWithNavigation(<AppNavigator />);

    expect(getByRole('tab', { name: 'Home tab' })).toBeTruthy();
    expect(getByRole('tab', { name: 'Workouts tab' })).toBeTruthy();
    expect(getByRole('tab', { name: 'Nutrition tab' })).toBeTruthy();
    expect(getByRole('tab', { name: 'Supplements tab' })).toBeTruthy();
    expect(getByRole('tab', { name: 'Profile tab' })).toBeTruthy();
  });

  it('handles deep linking to supplement details', async () => {
    const { getByText } = renderWithNavigation(<AppNavigator />);

    await mockDeepLink('supplements/details/1');
    expect(getByText('Supplement Details')).toBeTruthy();
  });

  it('handles deep linking to add supplement', async () => {
    const { getByText } = renderWithNavigation(<AppNavigator />);

    await mockDeepLink('supplements/add');
    expect(getByText('Add Supplement')).toBeTruthy();
  });

  it('recovers from navigation errors', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText } = renderWithNavigation(<AppNavigator />);

    // Simulate navigation error
    fireEvent(getByText('Supplements'), 'onError', new Error('Navigation error'));

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Try again')).toBeTruthy();

    consoleError.mockRestore();
  });

  it('maintains accessibility focus during navigation', () => {
    const { getByRole, getByText } = renderWithNavigation(<AppNavigator />);

    const supplementsTab = getByRole('tab', { name: 'Supplements tab' });
    fireEvent.press(supplementsTab);

    const addButton = getByText('Add');
    fireEvent.press(addButton);

    // Verify focus moves to the header of new screen
    expect(getByRole('header', { name: 'Add Supplement' })).toHaveFocus();
  });

  it('supports keyboard navigation between tabs', () => {
    const { getByRole } = renderWithNavigation(<AppNavigator />);

    const homeTab = getByRole('tab', { name: 'Home tab' });
    homeTab.focus();

    // Simulate right arrow key press
    fireEvent.keyPress(homeTab, { key: 'ArrowRight' });
    expect(getByRole('tab', { name: 'Workouts tab' })).toHaveFocus();

    // Simulate left arrow key press
    fireEvent.keyPress(getByRole('tab', { name: 'Workouts tab' }), { key: 'ArrowLeft' });
    expect(homeTab).toHaveFocus();
  });

  it('preserves scroll position when returning to previous screen', () => {
    const { getByTestId, getByText } = renderWithNavigation(<AppNavigator />);

    // Navigate to supplements and scroll
    fireEvent.press(getByText('Supplements'));
    const supplementList = getByTestId('supplement-list');
    fireEvent.scroll(supplementList, { nativeEvent: { contentOffset: { y: 100 } } });

    // Navigate away and back
    fireEvent.press(getByText('Home'));
    fireEvent.press(getByText('Supplements'));

    // Verify scroll position is maintained
    expect(supplementList).toHaveStyle({ transform: [{ translateY: 100 }] });
  });

  it('handles state restoration after app reload', () => {
    const initialState = {
      routes: [
        {
          name: 'Supplements',
          params: { screen: 'SupplementDetails', params: { supplementId: '1' } },
        },
      ],
    };

    const { getByText } = renderWithNavigation(<AppNavigator />, { initialState });
    expect(getByText('Supplement Details')).toBeTruthy();
  });

  describe('Error Boundaries', () => {
    it('catches and displays tab rendering errors', () => {
      const error = new Error('Tab render error');
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock a component that throws
      const FailingComponent = () => {
        throw error;
      };

      jest.mock('../../screens/supplement/SupplementListScreen', () => FailingComponent);

      const { getByText } = renderWithNavigation(<AppNavigator />);
      fireEvent.press(getByText('Supplements'));

      expect(getByText('Something went wrong')).toBeTruthy();
      expect(getByText('Try again')).toBeTruthy();
    });

    it('allows continuing to use other tabs when one fails', () => {
      const error = new Error('Tab render error');
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock a component that throws
      const FailingComponent = () => {
        throw error;
      };

      jest.mock('../../screens/supplement/SupplementListScreen', () => FailingComponent);

      const { getByText } = renderWithNavigation(<AppNavigator />);

      // Navigate to failing tab
      fireEvent.press(getByText('Supplements'));

      // Should still be able to use other tabs
      fireEvent.press(getByText('Home'));
      expect(getByText('Progress Summary')).toBeTruthy();
    });
  });
});
