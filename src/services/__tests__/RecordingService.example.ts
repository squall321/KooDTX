/**
 * Recording Service Usage Examples
 * Phase 96: Integrated sensor + audio recording
 * Phase 97: Wake lock management
 */

import {recordingService, RecordingMode} from '../RecordingService';
import {wakeLockService} from '../power/WakeLockService';
import {AndroidSensorType, SensorSamplingRate} from '@native';

/**
 * Example 1: Sensor + Audio Recording
 */
export async function example_SensorAndAudioRecording() {
  try {
    // Start integrated recording
    const sessionId = await recordingService.startRecording(
      {
        mode: RecordingMode.SENSOR_AND_AUDIO,
        sensorConfigs: [
          {
            sensorType: AndroidSensorType.ACCELEROMETER,
            enabled: true,
            samplingRate: SensorSamplingRate.GAME,
          },
          {
            sensorType: AndroidSensorType.GYROSCOPE,
            enabled: true,
            samplingRate: SensorSamplingRate.GAME,
          },
        ],
        audioOptions: {
          sampleRate: 44100,
          channels: 1,
          bitsPerSample: 16,
        },
      },
      async (sessionId, sensorType, samples) => {
        // Handle sensor data
        console.log(`Received ${samples.length} samples from ${sensorType}`);
      },
    );

    console.log(`Recording started: ${sessionId}`);

    // Get statistics
    setInterval(() => {
      const stats = recordingService.getStatistics();
      if (stats) {
        console.log('Recording stats:', {
          duration: stats.duration,
          sensorSamples: stats.sensorStats?.totalSamples,
          audioChunks: stats.audioStats?.totalChunks,
        });
      }
    }, 5000);

    // Stop after 60 seconds
    setTimeout(async () => {
      await recordingService.stopRecording();
      console.log('Recording stopped');
    }, 60000);

  } catch (error) {
    console.error('Recording error:', error);
  }
}

/**
 * Example 2: Sensor Only Recording
 */
export async function example_SensorOnlyRecording() {
  try {
    const sessionId = await recordingService.startRecording(
      {
        mode: RecordingMode.SENSOR_ONLY,
        sensorConfigs: [
          {
            sensorType: AndroidSensorType.ACCELEROMETER,
            enabled: true,
            samplingRate: SensorSamplingRate.GAME,
          },
        ],
      },
      async (sessionId, sensorType, samples) => {
        console.log(`Sensor data: ${sensorType}, samples: ${samples.length}`);
      },
    );

    console.log(`Sensor recording started: ${sessionId}`);

    // Stop after 30 seconds
    setTimeout(async () => {
      await recordingService.stopRecording();
    }, 30000);

  } catch (error) {
    console.error('Sensor recording error:', error);
  }
}

/**
 * Example 3: Audio Only Recording
 */
export async function example_AudioOnlyRecording() {
  try {
    const sessionId = await recordingService.startRecording({
      mode: RecordingMode.AUDIO_ONLY,
      audioOptions: {
        sampleRate: 44100,
        channels: 1,
        bitsPerSample: 16,
      },
    });

    console.log(`Audio recording started: ${sessionId}`);

    // Stop after 30 seconds
    setTimeout(async () => {
      await recordingService.stopRecording();
    }, 30000);

  } catch (error) {
    console.error('Audio recording error:', error);
  }
}

/**
 * Example 4: Pause and Resume
 */
export async function example_PauseAndResume() {
  try {
    // Start recording
    const sessionId = await recordingService.startRecording({
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
    });

    console.log(`Recording started: ${sessionId}`);

    // Pause after 10 seconds
    setTimeout(async () => {
      await recordingService.pauseRecording();
      console.log('Recording paused');

      // Resume after 5 seconds
      setTimeout(async () => {
        await recordingService.resumeRecording();
        console.log('Recording resumed');

        // Stop after another 10 seconds
        setTimeout(async () => {
          await recordingService.stopRecording();
          console.log('Recording stopped');
        }, 10000);
      }, 5000);
    }, 10000);

  } catch (error) {
    console.error('Pause/Resume error:', error);
  }
}

/**
 * Example 5: Event Listeners
 */
export async function example_EventListeners() {
  // Add event listener
  const removeListener = recordingService.addEventListener(event => {
    switch (event.type) {
      case 'state_change':
        console.log(`State changed to: ${event.state}`);
        break;
      case 'error':
        console.error(`Recording error: ${event.error?.message}`);
        break;
      case 'stats_update':
        console.log('Stats updated:', event.stats);
        break;
    }
  });

  try {
    // Start recording
    await recordingService.startRecording({
      mode: RecordingMode.SENSOR_AND_AUDIO,
      sensorConfigs: [
        {
          sensorType: AndroidSensorType.ACCELEROMETER,
          enabled: true,
        },
      ],
    });

    // Stop after 30 seconds
    setTimeout(async () => {
      await recordingService.stopRecording();
      removeListener(); // Remove event listener
    }, 30000);

  } catch (error) {
    console.error('Error:', error);
    removeListener();
  }
}

/**
 * Example 6: Wake Lock Configuration
 * Phase 97: Wake lock management
 */
export async function example_WakeLockConfiguration() {
  try {
    // Recording with wake lock enabled (default)
    const sessionId = await recordingService.startRecording({
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
      // Wake lock is enabled by default
      wakeLockOptions: {
        enabled: true,
      },
    });

    console.log(`Recording with wake lock: ${sessionId}`);

    // Check wake lock status
    const isWakeLockActive = wakeLockService.isActive();
    const wakeLockStats = wakeLockService.getStats();
    console.log('Wake lock active:', isWakeLockActive);
    console.log('Wake lock stats:', wakeLockStats);

    // Stop after 30 seconds
    setTimeout(async () => {
      await recordingService.stopRecording();
      console.log('Wake lock deactivated');
    }, 30000);

  } catch (error) {
    console.error('Wake lock example error:', error);
  }
}

/**
 * Example 7: Disable Wake Lock
 * Phase 97: Optional wake lock
 */
export async function example_DisableWakeLock() {
  try {
    // Recording with wake lock disabled
    const sessionId = await recordingService.startRecording({
      mode: RecordingMode.SENSOR_ONLY,
      sensorConfigs: [
        {
          sensorType: AndroidSensorType.ACCELEROMETER,
          enabled: true,
        },
      ],
      wakeLockOptions: {
        enabled: false, // Disable wake lock
      },
    });

    console.log(`Recording without wake lock: ${sessionId}`);

    // Wake lock should not be active
    const isWakeLockActive = wakeLockService.isActive();
    console.log('Wake lock active:', isWakeLockActive); // Should be false

    // Stop after 30 seconds
    setTimeout(async () => {
      await recordingService.stopRecording();
    }, 30000);

  } catch (error) {
    console.error('Disable wake lock error:', error);
  }
}

/**
 * Example 8: Wake Lock with Pause/Resume
 * Phase 97: Wake lock during pause/resume
 */
export async function example_WakeLockPauseResume() {
  try {
    // Start recording with wake lock
    const sessionId = await recordingService.startRecording({
      mode: RecordingMode.AUDIO_ONLY,
      audioOptions: {
        sampleRate: 44100,
        channels: 1,
      },
      wakeLockOptions: {
        enabled: true,
      },
    });

    console.log('Recording started, wake lock active');

    // Pause after 10 seconds (wake lock will be deactivated)
    setTimeout(async () => {
      await recordingService.pauseRecording();
      console.log('Recording paused, wake lock deactivated');

      const isWakeLockActive = wakeLockService.isActive();
      console.log('Wake lock active after pause:', isWakeLockActive); // Should be false

      // Resume after 5 seconds (wake lock will be re-activated)
      setTimeout(async () => {
        await recordingService.resumeRecording();
        console.log('Recording resumed, wake lock re-activated');

        const isWakeLockActiveAfterResume = wakeLockService.isActive();
        console.log('Wake lock active after resume:', isWakeLockActiveAfterResume); // Should be true

        // Stop after 10 seconds
        setTimeout(async () => {
          await recordingService.stopRecording();
          console.log('Recording stopped, wake lock deactivated');
        }, 10000);
      }, 5000);
    }, 10000);

  } catch (error) {
    console.error('Pause/Resume wake lock error:', error);
  }
}
