import { by, device, element, expect } from 'detox';

describe('Nutrition Tracking Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should log a meal', async () => {
    await element(by.text('Nutrition')).tap();
    await element(by.text('Log Meal')).tap();

    await element(by.id('meal-name')).typeText('Breakfast');
    await element(by.id('calories')).typeText('500');
    await element(by.id('protein')).typeText('30');
    await element(by.id('carbs')).typeText('50');
    await element(by.id('fat')).typeText('20');

    await element(by.text('Save')).tap();
    await expect(element(by.text('Breakfast'))).toBeVisible();
  });

  it('should scan food barcode', async () => {
    await element(by.text('Nutrition')).tap();
    await element(by.text('Scan Food')).tap();

    // Simulate barcode scanning by directly entering barcode
    await element(by.id('barcode-input')).typeText('123456789');
    await element(by.text('Submit')).tap();

    await expect(element(by.text('Food Details'))).toBeVisible();
  });

  it('should log supplements', async () => {
    await element(by.text('Nutrition')).tap();
    await element(by.text('Log Supplement')).tap();

    await element(by.id('supplement-name')).typeText('Protein Shake');
    await element(by.text('Save')).tap();

    await expect(element(by.text('Protein Shake'))).toBeVisible();
  });

  it('should show daily nutrition summary', async () => {
    await element(by.text('Nutrition')).tap();
    await element(by.text('Daily Summary')).tap();

    await expect(element(by.id('total-calories'))).toBeVisible();
    await expect(element(by.id('total-protein'))).toBeVisible();
    await expect(element(by.id('total-carbs'))).toBeVisible();
    await expect(element(by.id('total-fat'))).toBeVisible();
  });
});
