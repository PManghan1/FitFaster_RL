import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type PartialNavigationProp = Pick<
  NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>,
  'navigate' | 'goBack'
>;

export const createTestNavigation = (): PartialNavigationProp => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
});

export type TestNavigation = ReturnType<typeof createTestNavigation>;
