/**
 * Battery Monitor Service Usage Examples
 * Phase 98: Dynamic sampling rate adjustment
 */

import {batteryMonitorService, PowerMode} from '../power/BatteryMonitorService';
import {AndroidSensorType, SensorSamplingRate} from '@native';

/**
 * Example 1: Basic Battery Monitoring
 */
export async function example_BasicBatteryMonitoring() {
  // Configure battery thresholds
  batteryMonitorService.configure({
    low: 20, // Low battery threshold (20%)
    critical: 10, // Critical battery threshold (10%)
    enableAutoAdjust: true, // Enable automatic sampling rate adjustment
    respectUserSettings: true, // Respect user manual settings
  });

  // Add event listener
  const removeListener = batteryMonitorService.addEventListener(event => {
    console.log('Battery event:', event.type);
    console.log('Battery level:', event.batteryInfo.level);
    console.log('Power mode:', event.batteryInfo.powerMode);
    console.log('Recommended multiplier:', batteryMonitorService.getRecommendedSamplingRateMultiplier());
  });

  // Start monitoring
  batteryMonitorService.startMonitoring();

  // Get current battery info
  const batteryInfo = batteryMonitorService.getBatteryInfo();
  console.log('Current battery info:', batteryInfo);

  // Get recommended sampling rate
  const normalRate = 200; // 200 Hz
  const recommendedRate = batteryMonitorService.getRecommendedSamplingRate(normalRate);
  console.log(`Recommended sampling rate: ${recommendedRate} Hz (normal: ${normalRate} Hz)`);

  // Stop monitoring after 5 minutes
  setTimeout(() => {
    batteryMonitorService.stopMonitoring();
    removeListener();
  }, 300000);
}

/**
 * Example 2: Dynamic Sampling Rate Adjustment During Recording
 */
export async function example_DynamicSamplingRateAdjustment() {
  // Normal sampling rate
  const NORMAL_SAMPLING_RATE = 200; // Hz

  // Configure battery monitor
  batteryMonitorService.configure({
    low: 20,
    critical: 10,
    enableAutoAdjust: true,
    respectUserSettings: true,
  });

  // Listen for power mode changes
  const removeListener = batteryMonitorService.addEventListener(event => {
    if (event.type === 'power_mode_change') {
      const recommendedRate = batteryMonitorService.getRecommendedSamplingRate(NORMAL_SAMPLING_RATE);

      console.log(`Power mode changed to: ${event.batteryInfo.powerMode}`);
      console.log(`Adjusting sampling rate: ${NORMAL_SAMPLING_RATE} Hz -> ${recommendedRate} Hz`);

      // TODO: Adjust sensor sampling rate
      // This would require updating SensorService to support dynamic rate adjustment
      // For now, this is just a demonstration of how to get the recommended rate

      switch (event.batteryInfo.powerMode) {
        case PowerMode.ULTRA_LOW_POWER:
          console.log('⚠️ Ultra low power mode - reducing sampling to 25%');
          // adjustSensorSamplingRate(recommendedRate); // 50 Hz
          break;
        case PowerMode.LOW_POWER:
          console.log('⚠️ Low power mode - reducing sampling to 50%');
          // adjustSensorSamplingRate(recommendedRate); // 100 Hz
          break;
        case PowerMode.NORMAL:
          console.log('✅ Normal power mode - restoring full sampling');
          // adjustSensorSamplingRate(recommendedRate); // 200 Hz
          break;
      }
    }
  });

  // Start monitoring
  batteryMonitorService.startMonitoring();

  // Cleanup
  setTimeout(() => {
    batteryMonitorService.stopMonitoring();
    removeListener();
  }, 600000); // 10 minutes
}

/**
 * Example 3: Battery-Aware Recording
 */
export async function example_BatteryAwareRecording() {
  // Configure battery monitor
  batteryMonitorService.configure({
    low: 30, // More conservative threshold
    critical: 15,
    enableAutoAdjust: true,
    respectUserSettings: false, // Always adjust, ignore user settings
  });

  // Start monitoring
  batteryMonitorService.startMonitoring();

  // Get initial battery status
  const batteryInfo = batteryMonitorService.getBatteryInfo();

  console.log('Starting battery-aware recording...');
  console.log(`Battery level: ${batteryInfo.level}%`);
  console.log(`Power mode: ${batteryInfo.powerMode}`);

  // Determine initial sampling rate based on battery
  const BASE_RATE = 200;
  const initialRate = batteryMonitorService.getRecommendedSamplingRate(BASE_RATE);

  console.log(`Using sampling rate: ${initialRate} Hz`);

  // Listen for battery changes during recording
  const removeListener = batteryMonitorService.addEventListener(event => {
    if (event.type === 'level_change') {
      console.log(`Battery level changed: ${event.batteryInfo.level}%`);

      // Check if we should warn the user
      if (event.batteryInfo.level <= 15 && !event.batteryInfo.isCharging) {
        console.warn('⚠️ Low battery! Consider stopping recording soon.');
      }
    }

    if (event.type === 'power_mode_change') {
      const newRate = batteryMonitorService.getRecommendedSamplingRate(BASE_RATE);
      console.log(`Power mode changed - new sampling rate: ${newRate} Hz`);
    }
  });

  // Simulate recording for 10 minutes
  setTimeout(() => {
    console.log('Recording finished');
    batteryMonitorService.stopMonitoring();
    removeListener();
  }, 600000);
}

/**
 * Example 4: Check if Should Adjust Sampling Rate
 */
export async function example_CheckShouldAdjust() {
  // Test with different configurations

  // Configuration 1: Auto-adjust enabled
  batteryMonitorService.configure({
    enableAutoAdjust: true,
    respectUserSettings: true,
  });

  batteryMonitorService.startMonitoring();

  console.log('Configuration 1: Auto-adjust enabled');
  console.log('Should adjust:', batteryMonitorService.shouldAdjustSamplingRate());
  console.log('Multiplier:', batteryMonitorService.getRecommendedSamplingRateMultiplier());

  batteryMonitorService.stopMonitoring();

  // Configuration 2: Auto-adjust disabled
  batteryMonitorService.configure({
    enableAutoAdjust: false,
  });

  batteryMonitorService.startMonitoring();

  console.log('\nConfiguration 2: Auto-adjust disabled');
  console.log('Should adjust:', batteryMonitorService.shouldAdjustSamplingRate()); // false
  console.log('Multiplier:', batteryMonitorService.getRecommendedSamplingRateMultiplier()); // 1.0

  batteryMonitorService.stopMonitoring();
}

/**
 * Example 5: Sampling Rate Table
 */
export function example_SamplingRateTable() {
  const BASE_RATES = [50, 100, 200]; // Hz

  console.log('Sampling Rate Adjustment Table:');
  console.log('================================');

  batteryMonitorService.configure({
    enableAutoAdjust: true,
  });

  batteryMonitorService.startMonitoring();

  const batteryInfo = batteryMonitorService.getBatteryInfo();
  const multiplier = batteryMonitorService.getRecommendedSamplingRateMultiplier();

  console.log(`Current Power Mode: ${batteryInfo.powerMode}`);
  console.log(`Multiplier: ${multiplier * 100}%`);
  console.log('\nBase Rate -> Adjusted Rate:');

  BASE_RATES.forEach(baseRate => {
    const adjustedRate = batteryMonitorService.getRecommendedSamplingRate(baseRate);
    console.log(`  ${baseRate} Hz -> ${adjustedRate} Hz`);
  });

  batteryMonitorService.stopMonitoring();
}
