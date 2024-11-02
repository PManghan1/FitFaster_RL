import { by, device, element, expect } from 'detox';

describe('Workout Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should start a new workout', async () => {
    await element(by.text('Start Workout')).tap();
    await expect(element(by.text('Current Workout'))).toBeVisible();
  });

  it('should add exercises to workout', async () => {
    await element(by.text('Start Workout')).tap();
    await element(by.id('add-exercise-button')).tap();
    await element(by.text('Bench Press')).tap();
    await expect(element(by.text('Bench Press'))).toBeVisible();
  });

  it('should log sets for an exercise', async () => {
    await element(by.text('Start Workout')).tap();
    await element(by.id('add-exercise-button')).tap();
    await element(by.text('Bench Press')).tap();

    await element(by.id('weight-input')).typeText('100');
    await element(by.id('reps-input')).typeText('10');
    await element(by.text('Add Set')).tap();

    await expect(element(by.text('100kg × 10 reps'))).toBeVisible();
  });

  it('should complete workout and show summary', async () => {
    await element(by.text('Start Workout')).tap();
    await element(by.text('End Workout')).tap();
    await expect(element(by.text('Workout Summary'))).toBeVisible();
  });

  it('should track rest timer between sets', async () => {
    await element(by.text('Start Workout')).tap();
    await element(by.id('add-exercise-button')).tap();
    await element(by.text('Bench Press')).tap();

    await element(by.id('weight-input')).typeText('100');
    await element(by.id('reps-input')).typeText('10');
    await element(by.text('Add Set')).tap();

    await expect(element(by.id('rest-timer'))).toBeVisible();
    await expect(element(by.text('90'))).toBeVisible();
  });
});
