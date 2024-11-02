import { by, device, element, expect } from 'detox';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen on first launch', async () => {
    await expect(element(by.id('login-screen'))).toBeVisible();
  });

  it('should show validation errors for invalid email', async () => {
    await element(by.id('email-input')).typeText('invalid-email');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.text('Invalid email address'))).toBeVisible();
  });

  it('should navigate to registration screen', async () => {
    await element(by.id('register-link')).tap();
    await expect(element(by.id('register-screen'))).toBeVisible();
  });

  it('should successfully register new user', async () => {
    await element(by.id('register-link')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Password123!');
    await element(by.id('confirm-password-input')).typeText('Password123!');
    await element(by.id('register-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should successfully login', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Password123!');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should successfully logout', async () => {
    await element(by.id('settings-tab')).tap();
    await element(by.id('logout-button')).tap();
    await expect(element(by.id('login-screen'))).toBeVisible();
  });
});
