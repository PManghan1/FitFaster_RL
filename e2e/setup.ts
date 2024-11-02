import { device } from 'detox';

const permissions = {
  notifications: true,
  camera: true,
  photos: true,
  location: true,
} as const;

beforeAll(async (): Promise<void> => {
  try {
    await device.launchApp({
      newInstance: true,
      permissions,
    });
  } catch (error) {
    console.error('Failed to launch app:', error);
    throw error;
  }
});

beforeEach(async (): Promise<void> => {
  try {
    await device.reloadReactNative();
  } catch (error) {
    console.error('Failed to reload React Native:', error);
    throw error;
  }
});

afterAll(async (): Promise<void> => {
  try {
    await device.terminateApp();
  } catch (error) {
    console.error('Failed to terminate app:', error);
    throw error;
  }
});
