/**
 * Machine Learning Inference
 *
 * Activity recognition using TensorFlow Lite.
 *
 * NOTE: Requires TensorFlow.js for React Native:
 *   npm install @tensorflow/tfjs @tensorflow/tfjs-react-native expo-gl
 *
 * Usage:
 *   import { activityRecognition } from '@/ml/inference';
 *
 *   await activityRecognition.initialize();
 *   const activity = await activityRecognition.predict(sensorData);
 */

// TODO: Uncomment when TensorFlow is installed
// import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-react-native';

export interface ActivityPrediction {
  activity: string;
  confidence: number;
  probabilities: {
    [key: string]: number;
  };
}

export class ActivityRecognition {
  // private model: tf.LayersModel | null = null;
  private model: any = null;
  private isReady = false;
  private readonly activities = ['walking', 'running', 'sitting', 'standing', 'stairs'];

  /**
   * Initialize TensorFlow and load model
   */
  async initialize(): Promise<void> {
    try {
      console.log('[ML] Initializing TensorFlow.js...');

      // TODO: Uncomment when TensorFlow is installed
      /*
      await tf.ready();

      // Load pre-trained model
      // Option 1: Load from bundle
      // this.model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));

      // Option 2: Load from URL
      // this.model = await tf.loadLayersModel('https://example.com/model/model.json');

      this.isReady = true;
      console.log('[ML] Model loaded successfully');
      */

      // Placeholder implementation
      this.isReady = false;
      console.warn('[ML] TensorFlow.js not installed. Install with: npm install @tensorflow/tfjs @tensorflow/tfjs-react-native expo-gl');
    } catch (error) {
      console.error('[ML] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Run inference on sensor data
   *
   * @param sensorData - 2D array of sensor readings [time, features]
   *                     Expected shape: [windowSize, numFeatures]
   * @returns Activity prediction
   */
  async predict(sensorData: number[][]): Promise<ActivityPrediction> {
    if (!this.isReady || !this.model) {
      throw new Error('Model not initialized. Call initialize() first.');
    }

    // TODO: Uncomment when TensorFlow is installed
    /*
    try {
      // Preprocess data
      const input = this.preprocessData(sensorData);

      // Run inference
      const output = this.model.predict(input) as tf.Tensor;
      const probabilities = await output.data();

      // Get prediction
      const maxIndex = probabilities.indexOf(Math.max(...Array.from(probabilities)));
      const activity = this.activities[maxIndex];
      const confidence = probabilities[maxIndex];

      // Create probabilities object
      const probs: { [key: string]: number } = {};
      this.activities.forEach((act, idx) => {
        probs[act] = probabilities[idx];
      });

      // Cleanup tensors
      input.dispose();
      output.dispose();

      return {
        activity,
        confidence,
        probabilities: probs,
      };
    } catch (error) {
      console.error('[ML] Prediction failed:', error);
      throw error;
    }
    */

    // Placeholder return
    throw new Error('TensorFlow.js not installed');
  }

  /**
   * Preprocess sensor data for model input
   *
   * @param sensorData - Raw sensor data
   * @returns Preprocessed tensor
   */
  private preprocessData(sensorData: number[][]): any {
    // TODO: Implement preprocessing
    // - Normalize values
    // - Reshape to model input shape
    // - Convert to tensor

    // TODO: Uncomment when TensorFlow is installed
    /*
    // Flatten and normalize
    const flattened = sensorData.flat();
    const normalized = flattened.map(val => val / 100); // Example normalization

    // Create tensor with expected shape
    const tensor = tf.tensor2d([normalized], [1, normalized.length]);

    return tensor;
    */

    return null;
  }

  /**
   * Check if model is ready
   */
  isModelReady(): boolean {
    return this.isReady;
  }

  /**
   * Get list of supported activities
   */
  getSupportedActivities(): string[] {
    return [...this.activities];
  }

  /**
   * Dispose model and free memory
   */
  dispose(): void {
    if (this.model) {
      // TODO: Uncomment when TensorFlow is installed
      // this.model.dispose();
      this.model = null;
      this.isReady = false;
      console.log('[ML] Model disposed');
    }
  }
}

// Singleton instance
export const activityRecognition = new ActivityRecognition();

/**
 * Sliding window processor for continuous inference
 */
export class SlidingWindowProcessor {
  private windowSize: number;
  private overlap: number;
  private buffer: number[][] = [];

  constructor(windowSize: number = 100, overlap: number = 50) {
    this.windowSize = windowSize;
    this.overlap = overlap;
  }

  /**
   * Add new data point and check if window is ready
   *
   * @param dataPoint - New sensor reading [x, y, z, ...]
   * @returns Window data if ready, null otherwise
   */
  addDataPoint(dataPoint: number[]): number[][] | null {
    this.buffer.push(dataPoint);

    if (this.buffer.length >= this.windowSize) {
      const window = this.buffer.slice(0, this.windowSize);

      // Slide buffer by (windowSize - overlap)
      const slideBy = this.windowSize - this.overlap;
      this.buffer = this.buffer.slice(slideBy);

      return window;
    }

    return null;
  }

  /**
   * Reset buffer
   */
  reset(): void {
    this.buffer = [];
  }

  /**
   * Get current buffer size
   */
  getBufferSize(): number {
    return this.buffer.length;
  }
}
