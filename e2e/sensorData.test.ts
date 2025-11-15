/**
 * E2E Tests: Sensor Data Flow
 * Phase 161: E2E Testing
 *
 * Tests:
 * - Sensor list display
 * - Sensor detail view
 * - Data refresh
 * - Data filtering
 * - Chart visualization
 */

import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Sensor Data Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });

    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Test1234!');
    await element(by.id('login-button')).tap();

    await waitFor(element(by.id('main-app-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  beforeEach(async () => {
    // Navigate to sensor list screen
    await element(by.id('sensors-tab')).tap();
    await detoxExpect(element(by.id('sensor-list-screen'))).toBeVisible();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  describe('Sensor List', () => {
    it('should display sensor list', async () => {
      await detoxExpect(element(by.id('sensor-list'))).toBeVisible();
      await detoxExpect(element(by.id('sensor-item')).atIndex(0)).toBeVisible();
    });

    it('should show sensor information', async () => {
      const firstSensor = element(by.id('sensor-item')).atIndex(0);

      await detoxExpect(firstSensor).toBeVisible();
      await detoxExpect(element(by.id('sensor-name')).atIndex(0)).toBeVisible();
      await detoxExpect(element(by.id('sensor-status')).atIndex(0)).toBeVisible();
      await detoxExpect(element(by.id('sensor-value')).atIndex(0)).toBeVisible();
    });

    it('should refresh sensor list on pull to refresh', async () => {
      const sensorList = element(by.id('sensor-list'));

      // Pull to refresh
      await sensorList.swipe('down', 'fast', 0.8);

      // Wait for loading indicator
      await waitFor(element(by.id('loading-indicator')))
        .toBeVisible()
        .withTimeout(1000);

      // Wait for refresh to complete
      await waitFor(element(by.id('loading-indicator')))
        .not.toBeVisible()
        .withTimeout(5000);

      await detoxExpect(element(by.id('sensor-list'))).toBeVisible();
    });

    it('should search sensors', async () => {
      await element(by.id('search-input')).typeText('온도');

      // Wait for filtered results
      await waitFor(element(by.id('sensor-item')).atIndex(0))
        .toBeVisible()
        .withTimeout(2000);

      // Check that results contain search term
      await detoxExpect(element(by.text(/온도/))).toBeVisible();
    });

    it('should filter sensors by status', async () => {
      // Open filter menu
      await element(by.id('filter-button')).tap();

      // Select active status
      await element(by.id('filter-active')).tap();
      await element(by.id('apply-filter-button')).tap();

      // Wait for filtered results
      await waitFor(element(by.id('sensor-list')))
        .toBeVisible()
        .withTimeout(2000);

      // All visible sensors should have active status
      await detoxExpect(element(by.id('sensor-status-active')).atIndex(0)).toBeVisible();
    });
  });

  describe('Sensor Detail', () => {
    beforeEach(async () => {
      // Tap on first sensor
      await element(by.id('sensor-item')).atIndex(0).tap();

      // Wait for detail screen
      await waitFor(element(by.id('sensor-detail-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should display sensor details', async () => {
      await detoxExpect(element(by.id('sensor-name-header'))).toBeVisible();
      await detoxExpect(element(by.id('sensor-status-badge'))).toBeVisible();
      await detoxExpect(element(by.id('sensor-current-value'))).toBeVisible();
      await detoxExpect(element(by.id('sensor-chart'))).toBeVisible();
    });

    it('should show sensor metadata', async () => {
      // Scroll to metadata section
      await element(by.id('sensor-detail-scroll')).scrollTo('bottom');

      await detoxExpect(element(by.id('sensor-location'))).toBeVisible();
      await detoxExpect(element(by.id('sensor-install-date'))).toBeVisible();
      await detoxExpect(element(by.id('sensor-last-update'))).toBeVisible();
    });

    it('should change chart time range', async () => {
      // Select 1 day range
      await element(by.id('chart-range-1d')).tap();
      await waitFor(element(by.id('sensor-chart')))
        .toBeVisible()
        .withTimeout(2000);

      // Select 1 week range
      await element(by.id('chart-range-1w')).tap();
      await waitFor(element(by.id('sensor-chart')))
        .toBeVisible()
        .withTimeout(2000);

      // Select 1 month range
      await element(by.id('chart-range-1m')).tap();
      await waitFor(element(by.id('sensor-chart')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should export sensor data', async () => {
      // Scroll to export button
      await element(by.id('sensor-detail-scroll')).scrollTo('bottom');

      await element(by.id('export-data-button')).tap();

      // Select export format
      await element(by.id('export-format-csv')).tap();

      // Confirm export
      await element(by.id('confirm-export-button')).tap();

      // Check for success message
      await waitFor(element(by.text('데이터 내보내기 성공')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate back to sensor list', async () => {
      await element(by.id('back-button')).tap();

      await waitFor(element(by.id('sensor-list-screen')))
        .toBeVisible()
        .withTimeout(2000);

      await detoxExpect(element(by.id('sensor-list-screen'))).toBeVisible();
    });
  });

  describe('Data Sync', () => {
    it('should show sync status', async () => {
      await detoxExpect(element(by.id('sync-status'))).toBeVisible();
    });

    it('should manually sync data', async () => {
      await element(by.id('sync-button')).tap();

      // Wait for sync indicator
      await waitFor(element(by.id('syncing-indicator')))
        .toBeVisible()
        .withTimeout(1000);

      // Wait for sync to complete
      await waitFor(element(by.id('syncing-indicator')))
        .not.toBeVisible()
        .withTimeout(10000);

      // Check for success
      await detoxExpect(element(by.id('sync-success-indicator'))).toBeVisible();
    });

    it('should handle offline mode', async () => {
      // Disable network
      await device.setURLBlacklist(['.*']);

      // Try to refresh
      await element(by.id('refresh-button')).tap();

      // Should show offline message
      await waitFor(element(by.text('오프라인 상태입니다')))
        .toBeVisible()
        .withTimeout(3000);

      // Enable network
      await device.setURLBlacklist([]);

      // Retry
      await element(by.id('retry-button')).tap();

      // Should succeed
      await waitFor(element(by.id('sensor-list')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Real-time Updates', () => {
    it('should update sensor values in real-time', async () => {
      // Get initial value
      const initialValue = await element(by.id('sensor-value')).atIndex(0);
      await detoxExpect(initialValue).toBeVisible();

      // Wait for update (assuming real-time updates every 5 seconds)
      await waitFor(element(by.id('sensor-value-updated-indicator')))
        .toBeVisible()
        .withTimeout(10000);

      // Value should have updated indicator
      await detoxExpect(element(by.id('sensor-value-updated-indicator'))).toBeVisible();
    });

    it('should show real-time chart updates', async () => {
      // Open sensor detail
      await element(by.id('sensor-item')).atIndex(0).tap();
      await waitFor(element(by.id('sensor-detail-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Enable real-time mode
      await element(by.id('realtime-toggle')).tap();

      // Wait for chart update
      await waitFor(element(by.id('chart-updated-indicator')))
        .toBeVisible()
        .withTimeout(10000);

      await detoxExpect(element(by.id('sensor-chart'))).toBeVisible();
    });
  });
});
