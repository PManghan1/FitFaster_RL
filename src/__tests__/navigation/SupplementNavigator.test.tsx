import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { SupplementNavigator } from '../../navigation/SupplementNavigator';
import useSupplementStore from '../../store/supplement.store';
import { mockSupplementStore } from '../utils/supplement-test-utils';
import { renderWithNavigation, mockDeepLink } from '../utils/navigation-test-utils';

// Mock the store
jest.mock('../../store/supplement.store', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('SupplementNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSupplementStore as jest.Mock).mockReturnValue(mockSupplementStore);
  });

  it('supports screen reader navigation', () => {
    const { getByRole } = renderWithNavigation(<SupplementNavigator />);

    expect(getByRole('header', { name: 'Supplements' })).toBeTruthy();
    expect(getByRole('list')).toBeTruthy();
    expect(getByRole('button', { name: 'Add supplement' })).toBeTruthy();
  });

  it('handles deep linking to specific screens', async () => {
    const { getByText } = renderWithNavigation(<SupplementNavigator />);

    // Deep link to supplement details
    await mockDeepLink('supplements/1');
    expect(getByText('Supplement Details')).toBeTruthy();

    // Deep link to add supplement
    await mockDeepLink('supplements/add');
    expect(getByText('Add Supplement')).toBeTruthy();
  });

  it('maintains header accessibility during navigation', () => {
    const { getByRole, getByText } = renderWithNavigation(<SupplementNavigator />);

    // Navigate to details
    fireEvent.press(getByText('Vitamin D'));
    expect(getByRole('header', { name: 'Supplement Details' })).toHaveFocus();

    // Navigate back
    fireEvent.press(getByRole('button', { name: 'Back' }));
    expect(getByRole('header', { name: 'Supplements' })).toHaveFocus();
  });

  it('handles navigation gestures', () => {
    const { getByText, getByTestId } = renderWithNavigation(<SupplementNavigator />);

    // Navigate to details
    fireEvent.press(getByText('Vitamin D'));

    // Simulate back gesture
    const screen = getByTestId('supplement-details-screen');
    fireEvent(screen, 'gestureHandlerStateChange', {
      nativeEvent: {
        state: 'ACTIVE',
        translationX: 150,
      },
    });

    expect(getByText('Supplements')).toBeTruthy();
  });

  it('preserves scroll position in list when navigating back', () => {
    const { getByTestId, getByText } = renderWithNavigation(<SupplementNavigator />);

    // Scroll the list
    const list = getByTestId('supplement-list');
    fireEvent.scroll(list, { nativeEvent: { contentOffset: { y: 100 } } });

    // Navigate to details and back
    fireEvent.press(getByText('Vitamin D'));
    fireEvent.press(getByText('Back'));

    // Verify scroll position is maintained
    expect(list).toHaveStyle({ transform: [{ translateY: 100 }] });
  });

  it('handles screen transitions smoothly', () => {
    const { getByText, getByTestId } = renderWithNavigation(<SupplementNavigator />);

    // Navigate to details
    fireEvent.press(getByText('Vitamin D'));
    const detailsScreen = getByTestId('supplement-details-screen');

    // Verify transition animation
    expect(detailsScreen).toHaveAnimatedStyle({
      transform: [{ translateX: 0 }],
    });
  });

  describe('Error Handling', () => {
    it('displays error boundary for screen rendering errors', () => {
      const error = new Error('Screen render error');
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock a component that throws
      const FailingComponent = () => {
        throw error;
      };

      jest.mock('../../screens/supplement/SupplementDetailsScreen', () => FailingComponent);

      const { getByText } = renderWithNavigation(<SupplementNavigator />);

      fireEvent.press(getByText('Vitamin D'));
      expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('allows navigation after error recovery', () => {
      const { getByText } = renderWithNavigation(<SupplementNavigator />);

      // Navigate to error state
      fireEvent.press(getByText('Vitamin D'));

      // Recover from error
      fireEvent.press(getByText('Try again'));

      // Should be able to navigate
      fireEvent.press(getByText('Back'));
      expect(getByText('Supplements')).toBeTruthy();
    });
  });
});
