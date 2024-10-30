import { device, element, by, expect } from 'detox';

beforeAll(async () => {
  await device.launchApp({
    newInstance: true,
    permissions: {
      notifications: 'YES',
      camera: 'YES',
      photos: 'YES',
      location: 'always',
    },
  });
});

beforeEach(async () => {
  await device.reloadReactNative();
});
