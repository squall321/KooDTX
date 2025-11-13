/**
 * Device Info Service Usage Examples
 * Phase 100: Device information collection
 */

import {deviceInfoService} from '../device/DeviceInfoService';

/**
 * Example 1: Get Full Device Information
 */
export async function example_GetFullDeviceInfo() {
  const deviceInfo = await deviceInfoService.getDeviceInfo();

  console.log('=== Device Information ===');
  console.log('Device ID:', deviceInfo.deviceId);
  console.log('Device Name:', deviceInfo.deviceName);
  console.log('Manufacturer:', deviceInfo.manufacturer);
  console.log('Brand:', deviceInfo.brand);
  console.log('Model:', deviceInfo.model);

  console.log('\n=== Operating System ===');
  console.log('OS:', deviceInfo.systemName, deviceInfo.systemVersion);
  if (deviceInfo.apiLevel) {
    console.log('API Level:', deviceInfo.apiLevel);
  }

  console.log('\n=== App Information ===');
  console.log('App Name:', deviceInfo.appName);
  console.log('Version:', deviceInfo.appVersion);
  console.log('Build:', deviceInfo.buildNumber);

  console.log('\n=== Hardware ===');
  console.log('Total Memory:', (deviceInfo.totalMemory / (1024 ** 3)).toFixed(2), 'GB');
  console.log('CPU Architecture:', deviceInfo.cpuArchitecture);

  console.log('\n=== Battery ===');
  console.log('Battery Level:', Math.round(deviceInfo.batteryLevel * 100) + '%');
  console.log('Is Charging:', deviceInfo.isCharging);
  console.log('Low Power Mode:', deviceInfo.lowPowerMode);

  console.log('\n=== Other ===');
  console.log('Is Emulator:', deviceInfo.isEmulator);
  console.log('Is Tablet:', deviceInfo.isTablet);
}

/**
 * Example 2: Get Device Metadata for Recording
 */
export async function example_GetDeviceMetadata() {
  const metadata = await deviceInfoService.getDeviceMetadata();

  console.log('Recording Metadata:');
  console.log(JSON.stringify(metadata, null, 2));

  // Example output:
  // {
  //   "deviceId": "abc123...",
  //   "deviceModel": "Samsung Galaxy S21",
  //   "osVersion": "Android 12",
  //   "appVersion": "1.0.0",
  //   "timestamp": 1699999999999
  // }

  // Use in recording session
  const recordingSession = {
    sessionId: 'session-123',
    deviceMetadata: metadata,
    startTime: Date.now(),
    sensors: ['accelerometer', 'gyroscope'],
  };

  console.log('\nRecording Session:');
  console.log(JSON.stringify(recordingSession, null, 2));
}

/**
 * Example 3: Get Battery Information
 */
export async function example_GetBatteryInfo() {
  const batteryInfo = await deviceInfoService.getBatteryInfo();

  console.log('=== Battery Information ===');
  console.log('Level:', batteryInfo.level + '%');
  console.log('Is Charging:', batteryInfo.isCharging);
  console.log('Low Power Mode:', batteryInfo.lowPowerMode);

  // Check if battery is low
  if (batteryInfo.level < 20 && !batteryInfo.isCharging) {
    console.warn('⚠️ Low battery! Consider stopping recording or charging device.');
  }

  // Check if low power mode is enabled
  if (batteryInfo.lowPowerMode) {
    console.warn('⚠️ Low power mode enabled. Some features may be restricted.');
  }
}

/**
 * Example 4: Get System Summary
 */
export async function example_GetSystemSummary() {
  const summary = await deviceInfoService.getSystemSummary();

  console.log('=== System Summary ===');
  console.log(summary);

  // Example output:
  // Device: Samsung Galaxy S21 (SM-G991B)
  // OS: Android 12 (API 31)
  // App: KooDTX v1.0.0 (1)
  // Memory: 8.00 GB
  // Battery: 85% (Charging)
  // Emulator: No
}

/**
 * Example 5: Check if Running on Emulator
 */
export async function example_CheckEmulator() {
  const isEmulator = await deviceInfoService.isEmulator();

  if (isEmulator) {
    console.log('⚠️ Running on emulator');
    console.log('Some features may not work correctly on emulators:');
    console.log('- GPS may return mock locations');
    console.log('- Sensors may return simulated data');
    console.log('- Battery info may be inaccurate');
  } else {
    console.log('✅ Running on real device');
  }
}

/**
 * Example 6: Get Device ID
 */
export async function example_GetDeviceId() {
  const deviceId = await deviceInfoService.getDeviceId();

  console.log('Device ID:', deviceId);
  console.log('\nNote: This is a privacy-safe unique identifier.');
  console.log('It can be used to identify the device across app sessions.');
  console.log('But it does NOT contain any personally identifiable information.');
}

/**
 * Example 7: Cache Management
 */
export async function example_CacheManagement() {
  console.log('Getting device info (will be cached)...');
  const start1 = Date.now();
  const info1 = await deviceInfoService.getDeviceInfo();
  const duration1 = Date.now() - start1;
  console.log(`First call took ${duration1}ms`);

  console.log('\nGetting device info again (from cache)...');
  const start2 = Date.now();
  const info2 = await deviceInfoService.getDeviceInfo();
  const duration2 = Date.now() - start2;
  console.log(`Second call took ${duration2}ms (should be faster)`);

  console.log('\nClearing cache...');
  deviceInfoService.clearCache();

  console.log('\nGetting device info after cache clear...');
  const start3 = Date.now();
  const info3 = await deviceInfoService.getDeviceInfo();
  const duration3 = Date.now() - start3;
  console.log(`Third call took ${duration3}ms (should be similar to first call)`);
}

/**
 * Example 8: Use Device Info in Recording
 */
export async function example_RecordingWithDeviceInfo() {
  // Get device metadata
  const metadata = await deviceInfoService.getDeviceMetadata();

  // Create recording session with device metadata
  const recordingSession = {
    sessionId: `session-${Date.now()}`,
    deviceMetadata: metadata,
    startTime: Date.now(),
    sensors: ['accelerometer', 'gyroscope', 'audio'],
    sampleRate: 200, // Hz
  };

  console.log('Starting recording session with device metadata:');
  console.log(JSON.stringify(recordingSession, null, 2));

  // Save device metadata with recording data
  const recordingData = {
    session: recordingSession,
    data: [
      // Sensor data here...
    ],
  };

  // Later, when analyzing data, you'll know which device it came from
  console.log('\nDevice that recorded this data:');
  console.log(`- Model: ${metadata.deviceModel}`);
  console.log(`- OS: ${metadata.osVersion}`);
  console.log(`- App Version: ${metadata.appVersion}`);
}
