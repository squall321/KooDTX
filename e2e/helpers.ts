/**
 * E2E Test Helpers
 * Phase 161: E2E Testing Utilities
 *
 * Common utilities for E2E tests
 */

import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

/**
 * Login helper
 */
export const login = async (email: string = 'test@example.com', password: string = 'Test1234!') => {
  await element(by.id('email-input')).typeText(email);
  await element(by.id('password-input')).typeText(password);
  await element(by.id('login-button')).tap();

  await waitFor(element(by.id('main-app-screen')))
    .toBeVisible()
    .withTimeout(5000);
};

/**
 * Logout helper
 */
export const logout = async () => {
  await element(by.id('profile-tab')).tap();
  await element(by.id('logout-button')).tap();
  await element(by.text('확인')).tap();

  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(3000);
};

/**
 * Wait for element to be visible and tap
 */
export const waitAndTap = async (elementId: string, timeout: number = 3000) => {
  await waitFor(element(by.id(elementId)))
    .toBeVisible()
    .withTimeout(timeout);

  await element(by.id(elementId)).tap();
};

/**
 * Type text into input field
 */
export const typeText = async (elementId: string, text: string) => {
  await element(by.id(elementId)).clearText();
  await element(by.id(elementId)).typeText(text);
};

/**
 * Scroll to element
 */
export const scrollToElement = async (scrollViewId: string, elementId: string, direction: 'up' | 'down' = 'down') => {
  await waitFor(element(by.id(elementId)))
    .toBeVisible()
    .whileElement(by.id(scrollViewId))
    .scroll(200, direction);
};

/**
 * Wait for loading to complete
 */
export const waitForLoading = async (timeout: number = 5000) => {
  await waitFor(element(by.id('loading-indicator')))
    .not.toBeVisible()
    .withTimeout(timeout);
};

/**
 * Check if element exists
 */
export const elementExists = async (elementId: string): Promise<boolean> => {
  try {
    await detoxExpect(element(by.id(elementId))).toBeVisible();
    return true;
  } catch {
    return false;
  }
};

/**
 * Take screenshot
 */
export const takeScreenshot = async (name: string) => {
  await device.takeScreenshot(name);
};

/**
 * Reload React Native app
 */
export const reloadApp = async () => {
  await device.reloadReactNative();
};

/**
 * Restart app
 */
export const restartApp = async () => {
  await device.terminateApp();
  await device.launchApp({ newInstance: true });
};

/**
 * Wait for network request to complete
 */
export const waitForNetworkIdle = async (timeout: number = 3000) => {
  // Wait for any loading indicators to disappear
  await waitFor(element(by.id('loading-indicator')))
    .not.toBeVisible()
    .withTimeout(timeout);

  await waitFor(element(by.id('syncing-indicator')))
    .not.toBeVisible()
    .withTimeout(timeout);
};

/**
 * Swipe on element
 */
export const swipe = async (
  elementId: string,
  direction: 'up' | 'down' | 'left' | 'right',
  speed: 'fast' | 'slow' = 'fast',
  normalizedOffset: number = 0.75
) => {
  await element(by.id(elementId)).swipe(direction, speed, normalizedOffset);
};

/**
 * Long press on element
 */
export const longPress = async (elementId: string, duration: number = 1000) => {
  await element(by.id(elementId)).longPress(duration);
};

/**
 * Multi-tap on element
 */
export const multiTap = async (elementId: string, taps: number = 2) => {
  await element(by.id(elementId)).multiTap(taps);
};

/**
 * Shake device
 */
export const shakeDevice = async () => {
  await device.shake();
};

/**
 * Set device orientation
 */
export const setOrientation = async (orientation: 'portrait' | 'landscape') => {
  await device.setOrientation(orientation);
};

/**
 * Set device location
 */
export const setLocation = async (latitude: number, longitude: number) => {
  await device.setLocation(latitude, longitude);
};

/**
 * Enable/disable network
 */
export const setNetworkStatus = async (enabled: boolean) => {
  if (enabled) {
    await device.setURLBlacklist([]);
  } else {
    await device.setURLBlacklist(['.*']);
  }
};

/**
 * Send app to background
 */
export const sendToBackground = async (duration: number = 2000) => {
  await device.sendToHome();
  await new Promise((resolve) => setTimeout(resolve, duration));
  await device.launchApp({ newInstance: false });
};

/**
 * Grant/revoke permissions
 */
export const setPermissions = async (permissions: Record<string, 'YES' | 'NO' | 'unset'>) => {
  await device.launchApp({
    newInstance: true,
    permissions,
  });
};

/**
 * Wait for element with retry
 */
export const waitForElementWithRetry = async (
  elementId: string,
  maxRetries: number = 3,
  retryDelay: number = 1000
) => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await waitFor(element(by.id(elementId)))
        .toBeVisible()
        .withTimeout(3000);
      return;
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      await reloadApp();
    }
  }
};

/**
 * Assert element has text
 */
export const assertElementText = async (elementId: string, expectedText: string) => {
  await detoxExpect(element(by.id(elementId))).toHaveText(expectedText);
};

/**
 * Assert element has label
 */
export const assertElementLabel = async (elementId: string, expectedLabel: string) => {
  await detoxExpect(element(by.id(elementId))).toHaveLabel(expectedLabel);
};

/**
 * Assert element has value
 */
export const assertElementValue = async (elementId: string, expectedValue: string) => {
  await detoxExpect(element(by.id(elementId))).toHaveValue(expectedValue);
};

/**
 * Wait for multiple elements
 */
export const waitForElements = async (elementIds: string[], timeout: number = 3000) => {
  await Promise.all(
    elementIds.map((id) =>
      waitFor(element(by.id(id)))
        .toBeVisible()
        .withTimeout(timeout)
    )
  );
};

/**
 * Navigation helper
 */
export const navigateToTab = async (tabId: string) => {
  await element(by.id(`${tabId}-tab`)).tap();
  await waitFor(element(by.id(`${tabId}-screen`)))
    .toBeVisible()
    .withTimeout(2000);
};

/**
 * Form submission helper
 */
export const submitForm = async (
  formId: string,
  fields: Record<string, string>,
  submitButtonId: string
) => {
  for (const [fieldId, value] of Object.entries(fields)) {
    await typeText(fieldId, value);
  }

  await element(by.id(submitButtonId)).tap();
};

/**
 * Wait for toast message
 */
export const waitForToast = async (message: string, timeout: number = 3000) => {
  await waitFor(element(by.text(message)))
    .toBeVisible()
    .withTimeout(timeout);
};

/**
 * Dismiss keyboard
 */
export const dismissKeyboard = async () => {
  // Tap outside input fields to dismiss keyboard
  await element(by.id('screen-background')).tap();
};

/**
 * Clear app data
 */
export const clearAppData = async () => {
  await device.clearKeychain();
  // Note: This may require custom implementation for clearing AsyncStorage
};

export default {
  login,
  logout,
  waitAndTap,
  typeText,
  scrollToElement,
  waitForLoading,
  elementExists,
  takeScreenshot,
  reloadApp,
  restartApp,
  waitForNetworkIdle,
  swipe,
  longPress,
  multiTap,
  shakeDevice,
  setOrientation,
  setLocation,
  setNetworkStatus,
  sendToBackground,
  setPermissions,
  waitForElementWithRetry,
  assertElementText,
  assertElementLabel,
  assertElementValue,
  waitForElements,
  navigateToTab,
  submitForm,
  waitForToast,
  dismissKeyboard,
  clearAppData,
};
