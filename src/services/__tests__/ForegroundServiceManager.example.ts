/**
 * Foreground Service Manager Usage Examples
 * Phase 99: Background recording optimization
 */

import {foregroundServiceManager} from '../background/ForegroundServiceManager';
import {recordingService, RecordingMode} from '../RecordingService';
import {AndroidSensorType} from '@native';

/**
 * Example 1: Basic Foreground Service
 */
export async function example_BasicForegroundService() {
  // Start foreground service manually
  await foregroundServiceManager.startForegroundService('session-123', {
    notification: {
      channelId: 'recording_channel',
      channelName: 'Recording Service',
      title: 'Recording Sensors',
      text: 'Sensor data is being recorded',
      icon: 'ic_mic', // Android drawable resource
      priority: 'high',
      ongoing: true, // Non-dismissible
      showWhen: true, // Show timestamp
    },
  });

  console.log('Foreground service started');

  // Service will keep running in background
  setTimeout(async () => {
    await foregroundServiceManager.stopForegroundService();
    console.log('Foreground service stopped');
  }, 60000); // 1 minute
}

/**
 * Example 2: Foreground Service with Recording
 */
export async function example_ForegroundServiceWithRecording() {
  // Start recording with foreground service
  const sessionId = await recordingService.startRecording(
    {
      mode: RecordingMode.SENSOR_AND_AUDIO,
      sensorConfigs: [
        {
          sensorType: AndroidSensorType.ACCELEROMETER,
          enabled: true,
        },
      ],
      audioOptions: {
        sampleRate: 44100,
        channels: 1,
      },
      // Enable foreground service for background recording
      foregroundServiceOptions: {
        notification: {
          channelId: 'koodtx_recording',
          channelName: 'KooDTX Recording',
          title: 'Recording Data',
          text: 'Sensors and audio are being recorded',
          icon: 'ic_notification',
          priority: 'high',
          ongoing: true,
        },
      },
    },
    async (sessionId, sensorType, samples) => {
      // Handle sensor data
      console.log(`Received ${samples.length} samples`);
    },
  );

  console.log(`Recording started with foreground service: ${sessionId}`);

  // Recording will continue even if app goes to background

  // Stop after 5 minutes
  setTimeout(async () => {
    await recordingService.stopRecording();
    console.log('Recording stopped, foreground service stopped');
  }, 300000);
}

/**
 * Example 3: Update Notification During Recording
 */
export async function example_UpdateNotification() {
  // Start recording
  await recordingService.startRecording({
    mode: RecordingMode.SENSOR_ONLY,
    sensorConfigs: [
      {
        sensorType: AndroidSensorType.ACCELEROMETER,
        enabled: true,
      },
    ],
    foregroundServiceOptions: {
      notification: {
        channelId: 'koodtx_recording',
        channelName: 'KooDTX Recording',
        title: 'Recording...',
        text: 'Starting recording',
        priority: 'high',
      },
    },
  });

  // Update notification after 10 seconds
  setTimeout(async () => {
    await foregroundServiceManager.updateNotification({
      title: 'Recording in Progress',
      text: '10 seconds elapsed',
    });
    console.log('Notification updated');
  }, 10000);

  // Update notification after 30 seconds
  setTimeout(async () => {
    await foregroundServiceManager.updateNotification({
      title: 'Recording in Progress',
      text: '30 seconds elapsed',
    });
  }, 30000);

  // Stop after 1 minute
  setTimeout(async () => {
    await recordingService.stopRecording();
  }, 60000);
}

/**
 * Example 4: Battery Optimization Exemption
 */
export async function example_BatteryOptimizationExemption() {
  // Check current battery optimization status
  const status = await foregroundServiceManager.getBatteryOptimizationStatus();
  console.log('Battery optimization status:', status);

  if (!status.isIgnoringBatteryOptimizations && status.canRequestExemption) {
    console.log('Requesting battery optimization exemption...');

    // Request exemption (will show system dialog to user)
    const granted = await foregroundServiceManager.requestBatteryOptimizationExemption();

    if (granted) {
      console.log('✅ Battery optimization exemption granted!');
      console.log('App can now run in background without restrictions');
    } else {
      console.log('❌ Battery optimization exemption denied');
      console.log('App may be restricted in background');
    }
  } else if (status.isIgnoringBatteryOptimizations) {
    console.log('✅ Already ignoring battery optimizations');
  }

  // Check Doze mode
  if (status.isDozeMode) {
    console.warn('⚠️ Device is in Doze mode');
    console.warn('Background recording may be restricted');
  }
}

/**
 * Example 5: Notification with Actions
 */
export async function example_NotificationWithActions() {
  // Start recording with notification actions
  await recordingService.startRecording({
    mode: RecordingMode.AUDIO_ONLY,
    audioOptions: {
      sampleRate: 44100,
      channels: 1,
    },
    foregroundServiceOptions: {
      notification: {
        channelId: 'koodtx_recording',
        channelName: 'KooDTX Recording',
        title: 'Recording Audio',
        text: 'Tap to view controls',
        icon: 'ic_mic',
        priority: 'high',
        ongoing: true,
        // Add notification actions
        actions: [
          {
            id: 'pause',
            title: 'Pause',
            icon: 'ic_pause',
          },
          {
            id: 'stop',
            title: 'Stop',
            icon: 'ic_stop',
          },
        ],
      },
    },
  });

  console.log('Recording started with notification actions');

  // User can tap "Pause" or "Stop" from notification
  // You would need to implement action handlers in native code

  // Stop after 2 minutes
  setTimeout(async () => {
    await recordingService.stopRecording();
  }, 120000);
}

/**
 * Example 6: Check Service Status
 */
export async function example_CheckServiceStatus() {
  // Check if foreground service is running
  const isRunning = foregroundServiceManager.isRunning();
  console.log('Is foreground service running:', isRunning);

  if (isRunning) {
    const serviceId = foregroundServiceManager.getServiceId();
    const options = foregroundServiceManager.getOptions();
    console.log('Service ID:', serviceId);
    console.log('Notification title:', options?.notification.title);
  }

  // Get state
  const state = foregroundServiceManager.getState();
  console.log('Foreground service state:', state);
}

/**
 * Example 7: Complete Background Recording Setup
 */
export async function example_CompleteBackgroundRecordingSetup() {
  console.log('Setting up background recording...');

  // Step 1: Check battery optimization
  const batteryStatus = await foregroundServiceManager.getBatteryOptimizationStatus();
  if (!batteryStatus.isIgnoringBatteryOptimizations) {
    console.log('⚠️ Battery optimization is enabled');
    console.log('Requesting exemption for better background performance...');
    await foregroundServiceManager.requestBatteryOptimizationExemption();
  }

  // Step 2: Start recording with all background optimizations
  const sessionId = await recordingService.startRecording({
    mode: RecordingMode.SENSOR_AND_AUDIO,
    sensorConfigs: [
      {
        sensorType: AndroidSensorType.ACCELEROMETER,
        enabled: true,
      },
      {
        sensorType: AndroidSensorType.GYROSCOPE,
        enabled: true,
      },
    ],
    audioOptions: {
      sampleRate: 44100,
      channels: 1,
    },
    wakeLockOptions: {
      enabled: true, // Keep screen on
    },
    foregroundServiceOptions: {
      notification: {
        channelId: 'koodtx_recording',
        channelName: 'KooDTX Recording',
        title: 'Background Recording',
        text: 'Sensors + Audio recording',
        icon: 'ic_notification',
        priority: 'high',
        ongoing: true,
        showWhen: true,
        actions: [
          {id: 'stop', title: 'Stop'},
        ],
      },
      stopOnTaskRemoved: false, // Continue recording even if app is closed
    },
  });

  console.log(`✅ Background recording started: ${sessionId}`);
  console.log('App can now be minimized or closed');
  console.log('Recording will continue in background');

  // Recording will continue until stopped
  // User can stop from notification or by opening the app

  // For demo, stop after 10 minutes
  setTimeout(async () => {
    await recordingService.stopRecording();
    console.log('Background recording stopped');
  }, 600000); // 10 minutes
}
