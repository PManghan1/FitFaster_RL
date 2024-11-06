import { EventEmitter } from '@react-navigation/native';

/**
 * Simulates a deep link navigation event for testing deep linking functionality.
 * This utility helps test how your app handles incoming deep links.
 *
 * @example
 * ```tsx
 * render(<App />);
 * await mockDeepLink('supplements/details/123');
 * expect(screen.getByText('Supplement Details')).toBeTruthy();
 * ```
 *
 * @param path - The deep link path (without the scheme)
 * @returns A promise that resolves when the deep link has been processed
 */
export async function mockDeepLink(path: string): Promise<void> {
  EventEmitter.emit('url', { url: `fitfaster://${path}` });
  await new Promise(resolve => setTimeout(resolve, 0));
}
