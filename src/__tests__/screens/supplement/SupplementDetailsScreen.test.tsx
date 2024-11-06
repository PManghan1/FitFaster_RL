import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SupplementDetailsScreen } from '../../../screens/supplement/SupplementDetailsScreen';
import useSupplementStore from '../../../store/supplement.store';
import { createMockSupplement } from '../../utils/supplement-test-utils';
import type { SupplementStackParamList } from '../../../navigation/SupplementNavigator';
import type { RouteProp } from '@react-navigation/native';

jest.mock('../../../store/supplement.store', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockGoBack = jest.fn();
const mockRoute: RouteProp<SupplementStackParamList, 'SupplementDetails'> = {
  key: 'SupplementDetails',
  name: 'SupplementDetails',
  params: { supplementId: '1' },
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
  useRoute: () => mockRoute,
}));

describe('SupplementDetailsScreen', () => {
  const mockSupplement = createMockSupplement({
    id: '1',
    name: 'Vitamin D',
    remindersEnabled: true,
    reminderTimes: ['09:00'],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useSupplementStore as jest.Mock).mockReturnValue({
      supplements: [mockSupplement],
      intakes: [],
      logIntake: jest.fn(),
      deleteSupplement: jest.fn(),
      deleteIntake: jest.fn(),
      toggleReminders: jest.fn(),
      updateReminderTimes: jest.fn(),
    });
  });

  it('renders supplement details correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <SupplementDetailsScreen />
      </NavigationContainer>
    );

    expect(getByText('Vitamin D')).toBeTruthy();
  });
});
