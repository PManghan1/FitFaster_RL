import {
  navigationTestUtils,
  createMockNavigation,
  createMockLinking,
} from '../utils/navigation-test-utils';

describe('Navigation Testing', () => {
  const mockNavigation = createMockNavigation();
  const mockLinking = createMockLinking();

  beforeEach(() => {
    navigationTestUtils.resetState();
  });

  describe('Basic Navigation', () => {
    it('should handle navigation between screens', () => {
      mockNavigation.navigate('Home');
      expect(navigationTestUtils.verifyCurrentRoute('Home')).toBe(true);

      mockNavigation.navigate('Profile', { userId: '123' });
      expect(navigationTestUtils.verifyCurrentRoute('Profile', { userId: '123' })).toBe(true);
    });

    it('should handle navigation back', () => {
      mockNavigation.navigate('Home');
      mockNavigation.navigate('Profile');
      mockNavigation.goBack();

      expect(navigationTestUtils.verifyCurrentRoute('Home')).toBe(true);
    });

    it('should track navigation sequence', () => {
      mockNavigation.navigate('Home');
      mockNavigation.navigate('Profile', { userId: '123' });
      mockNavigation.navigate('Settings');

      expect(
        navigationTestUtils.verifyNavigationSequence([
          { name: 'Home' },
          { name: 'Profile', params: { userId: '123' } },
          { name: 'Settings' },
        ])
      ).toBe(true);
    });
  });

  describe('Deep Linking', () => {
    it('should handle deep links', async () => {
      navigationTestUtils.registerDeepLinkHandler('/profile', url => {
        const params = new URLSearchParams(new URL(url).search);
        mockNavigation.navigate('Profile', { userId: params.get('userId') });
      });

      await mockLinking.openURL('app://profile?userId=123');
      expect(navigationTestUtils.verifyCurrentRoute('Profile', { userId: '123' })).toBe(true);
    });

    it('should handle deep link timeout', async () => {
      navigationTestUtils.setTimeout(100);
      const result = await mockLinking.openURL('app://unknown');
      expect(result).toBe(false);
    });

    it('should handle multiple deep link handlers', async () => {
      navigationTestUtils.registerDeepLinkHandler('/profile', url => {
        mockNavigation.navigate('Profile', {
          userId: new URLSearchParams(new URL(url).search).get('userId'),
        });
      });

      navigationTestUtils.registerDeepLinkHandler('/settings', () => {
        mockNavigation.navigate('Settings');
      });

      await mockLinking.openURL('app://profile?userId=123');
      await mockLinking.openURL('app://settings');

      expect(
        navigationTestUtils.verifyNavigationSequence([
          { name: 'Profile', params: { userId: '123' } },
          { name: 'Settings' },
        ])
      ).toBe(true);
    });
  });

  describe('Navigation Events', () => {
    it('should emit navigation events', () => {
      const listener = jest.fn();
      const unsubscribe = navigationTestUtils.addNavigationListener('navigation', listener);

      mockNavigation.navigate('Home');
      mockNavigation.navigate('Profile');
      mockNavigation.goBack();

      expect(listener).toHaveBeenCalledTimes(3);
      unsubscribe();
    });

    it('should handle navigation state changes', () => {
      mockNavigation.navigate('Home');
      const initialState = navigationTestUtils.getCurrentState();

      mockNavigation.reset({
        routes: [{ name: 'Login' }],
        index: 0,
      });

      const newState = navigationTestUtils.getCurrentState();
      expect(newState).not.toEqual(initialState);
      expect(navigationTestUtils.verifyCurrentRoute('Login')).toBe(true);
    });
  });

  describe('Navigation History', () => {
    it('should track navigation history', () => {
      mockNavigation.navigate('Home');
      mockNavigation.navigate('Profile');
      mockNavigation.navigate('Settings');
      mockNavigation.goBack();

      const history = navigationTestUtils.getNavigationHistory();
      expect(history).toHaveLength(4);
      expect(history[0].routes).toHaveLength(1);
      expect(history[history.length - 1].index).toBe(1);
    });
  });
});
