/**
 * E2E Tests: Authentication Flow
 * Phase 161: E2E Testing
 *
 * Tests:
 * - Login flow
 * - Registration flow
 * - Logout flow
 * - Token refresh
 */

import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  describe('Login', () => {
    it('should show login screen on app launch', async () => {
      await detoxExpect(element(by.id('login-screen'))).toBeVisible();
      await detoxExpect(element(by.id('email-input'))).toBeVisible();
      await detoxExpect(element(by.id('password-input'))).toBeVisible();
      await detoxExpect(element(by.id('login-button'))).toBeVisible();
    });

    it('should show validation errors for empty fields', async () => {
      await element(by.id('login-button')).tap();

      await detoxExpect(element(by.text('이메일을 입력해주세요'))).toBeVisible();
      await detoxExpect(element(by.text('비밀번호를 입력해주세요'))).toBeVisible();
    });

    it('should show error for invalid email format', async () => {
      await element(by.id('email-input')).typeText('invalid-email');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();

      await waitFor(element(by.text('올바른 이메일 형식이 아닙니다')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should login successfully with valid credentials', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Test1234!');
      await element(by.id('login-button')).tap();

      // Wait for main app screen
      await waitFor(element(by.id('main-app-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await detoxExpect(element(by.id('main-app-screen'))).toBeVisible();
    });

    it('should show error for invalid credentials', async () => {
      await element(by.id('email-input')).typeText('wrong@example.com');
      await element(by.id('password-input')).typeText('WrongPass123');
      await element(by.id('login-button')).tap();

      await waitFor(element(by.text('이메일 또는 비밀번호가 올바르지 않습니다')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Registration', () => {
    beforeEach(async () => {
      // Navigate to registration screen
      await element(by.id('register-link')).tap();
      await detoxExpect(element(by.id('register-screen'))).toBeVisible();
    });

    it('should show registration form', async () => {
      await detoxExpect(element(by.id('username-input'))).toBeVisible();
      await detoxExpect(element(by.id('email-input'))).toBeVisible();
      await detoxExpect(element(by.id('password-input'))).toBeVisible();
      await detoxExpect(element(by.id('password-confirm-input'))).toBeVisible();
      await detoxExpect(element(by.id('register-button'))).toBeVisible();
    });

    it('should show password strength indicator', async () => {
      await element(by.id('password-input')).typeText('weak');
      await detoxExpect(element(by.id('password-strength-weak'))).toBeVisible();

      await element(by.id('password-input')).clearText();
      await element(by.id('password-input')).typeText('Strong123!');
      await detoxExpect(element(by.id('password-strength-strong'))).toBeVisible();
    });

    it('should validate password confirmation', async () => {
      await element(by.id('password-input')).typeText('Test1234!');
      await element(by.id('password-confirm-input')).typeText('Different123!');
      await element(by.id('register-button')).tap();

      await detoxExpect(element(by.text('비밀번호가 일치하지 않습니다'))).toBeVisible();
    });

    it('should register successfully with valid data', async () => {
      const timestamp = Date.now();
      await element(by.id('username-input')).typeText(`testuser${timestamp}`);
      await element(by.id('email-input')).typeText(`test${timestamp}@example.com`);
      await element(by.id('password-input')).typeText('Test1234!');
      await element(by.id('password-confirm-input')).typeText('Test1234!');
      await element(by.id('register-button')).tap();

      // Wait for success and redirect to main app
      await waitFor(element(by.id('main-app-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Logout', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Test1234!');
      await element(by.id('login-button')).tap();

      await waitFor(element(by.id('main-app-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should logout successfully', async () => {
      // Open profile/settings
      await element(by.id('profile-tab')).tap();
      await element(by.id('logout-button')).tap();

      // Confirm logout dialog
      await element(by.text('확인')).tap();

      // Should return to login screen
      await waitFor(element(by.id('login-screen')))
        .toBeVisible()
        .withTimeout(3000);

      await detoxExpect(element(by.id('login-screen'))).toBeVisible();
    });
  });

  describe('Token Persistence', () => {
    it('should remain logged in after app restart', async () => {
      // Login
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('Test1234!');
      await element(by.id('login-button')).tap();

      await waitFor(element(by.id('main-app-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Restart app
      await device.terminateApp();
      await device.launchApp({ newInstance: false });

      // Should still be logged in
      await waitFor(element(by.id('main-app-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await detoxExpect(element(by.id('main-app-screen'))).toBeVisible();
    });
  });
});
