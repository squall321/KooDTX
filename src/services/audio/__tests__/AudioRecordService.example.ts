/**
 * AudioRecordService Usage Examples
 * Phase 89: Basic audio recording tests
 */

import {audioRecordService, RecordingState} from '../AudioRecordService';

/**
 * Example 1: Basic recording
 */
export async function basicRecordingExample() {
  // Initialize with default config (44.1kHz, Mono, 16-bit)
  audioRecordService.initialize();

  // Start recording
  audioRecordService.start();
  console.log('Recording started...');

  // Record for 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Stop recording
  const audioFilePath = await audioRecordService.stop();
  console.log('Recording stopped. File saved:', audioFilePath);

  // Get file size
  const fileSize = await audioRecordService.getAudioFileSize(audioFilePath);
  console.log('File size:', fileSize, 'bytes');
}

/**
 * Example 2: Custom configuration
 */
export async function customConfigExample() {
  // Initialize with custom config (48kHz, Stereo, 16-bit)
  audioRecordService.initialize({
    sampleRate: 48000,
    channels: 2,
    bitsPerSample: 16,
    wavFile: 'my_recording.wav',
  });

  // Get current config
  const config = audioRecordService.getConfig();
  console.log('Audio config:', config);

  // Start recording
  audioRecordService.start();

  // Check state
  const isRecording = audioRecordService.isRecording();
  console.log('Is recording:', isRecording);

  // Record for 3 seconds
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Stop and get file path
  const filePath = await audioRecordService.stop();
  console.log('File saved:', filePath);
}

/**
 * Example 3: Pause and resume (iOS only)
 */
export async function pauseResumeExample() {
  audioRecordService.initialize();
  audioRecordService.start();

  // Record for 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Pause
  audioRecordService.pause();
  console.log('Recording paused');

  // Wait 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Resume
  audioRecordService.resume();
  console.log('Recording resumed');

  // Record for 2 more seconds
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Stop
  const filePath = await audioRecordService.stop();
  console.log('File saved:', filePath);
}

/**
 * Example 4: Test recording
 */
export async function testRecordingExample() {
  // Test recording for 3 seconds
  try {
    const filePath = await audioRecordService.testRecording(3000);
    console.log('Test recording successful:', filePath);

    // Get file size
    const fileSize = await audioRecordService.getAudioFileSize(filePath);
    console.log('Test file size:', fileSize, 'bytes');

    // Clean up
    await audioRecordService.deleteAudioFile(filePath);
    console.log('Test file deleted');
  } catch (error) {
    console.error('Test recording failed:', error);
  }
}

/**
 * Example 5: State management
 */
export async function stateManagementExample() {
  audioRecordService.initialize();

  // Check initial state
  console.log('Initial state:', audioRecordService.getState()); // IDLE

  // Start recording
  audioRecordService.start();
  console.log('State after start:', audioRecordService.getState()); // RECORDING

  // Record for 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Stop recording
  await audioRecordService.stop();
  console.log('State after stop:', audioRecordService.getState()); // STOPPED

  // Reset state
  audioRecordService.reset();
  console.log('State after reset:', audioRecordService.getState()); // IDLE
}

/**
 * Example 6: Error handling
 */
export async function errorHandlingExample() {
  try {
    // Try to start without initialization (should throw error)
    audioRecordService.start();
  } catch (error) {
    console.error('Expected error:', error);
  }

  // Initialize first
  audioRecordService.initialize();

  try {
    // Try to stop without recording (should throw error)
    await audioRecordService.stop();
  } catch (error) {
    console.error('Expected error:', error);
  }

  // Proper usage
  audioRecordService.start();
  await new Promise(resolve => setTimeout(resolve, 1000));
  const filePath = await audioRecordService.stop();
  console.log('Proper recording successful:', filePath);
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('=== Example 1: Basic Recording ===');
  await basicRecordingExample();

  console.log('\n=== Example 2: Custom Config ===');
  await customConfigExample();

  console.log('\n=== Example 3: Pause/Resume ===');
  await pauseResumeExample();

  console.log('\n=== Example 4: Test Recording ===');
  await testRecordingExample();

  console.log('\n=== Example 5: State Management ===');
  await stateManagementExample();

  console.log('\n=== Example 6: Error Handling ===');
  await errorHandlingExample();

  console.log('\n=== All Examples Completed ===');
}
