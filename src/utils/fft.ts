/**
 * FFT (Fast Fourier Transform) Utility
 * Phase 252: Sensor data analysis - Frequency domain analysis
 *
 * Provides frequency analysis for sensor data to detect:
 * - Vibration frequencies
 * - Periodic patterns
 * - Dominant frequencies
 */

export interface FrequencyComponent {
  frequency: number; // Hz
  magnitude: number; // Amplitude
  phase: number; // Radians
}

export interface FFTResult {
  frequencies: number[]; // Frequency bins (Hz)
  magnitudes: number[]; // Magnitude spectrum
  phases: number[]; // Phase spectrum
  dominantFrequency: number; // Hz
  dominantMagnitude: number;
  powerSpectrum: number[]; // Power spectral density
  components: FrequencyComponent[]; // Top N frequency components
}

/**
 * Simple FFT implementation using Cooley-Tukey algorithm
 * Input length must be a power of 2
 */
function fftRecursive(
  real: number[],
  imag: number[]
): {real: number[]; imag: number[]} {
  const n = real.length;

  // Base case
  if (n === 1) {
    return {real: [...real], imag: [...imag]};
  }

  // Divide
  const evenReal: number[] = [];
  const evenImag: number[] = [];
  const oddReal: number[] = [];
  const oddImag: number[] = [];

  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) {
      evenReal.push(real[i]);
      evenImag.push(imag[i]);
    } else {
      oddReal.push(real[i]);
      oddImag.push(imag[i]);
    }
  }

  // Conquer
  const evenFFT = fftRecursive(evenReal, evenImag);
  const oddFFT = fftRecursive(oddReal, oddImag);

  // Combine
  const resultReal = new Array(n);
  const resultImag = new Array(n);

  for (let k = 0; k < n / 2; k++) {
    const angle = (-2 * Math.PI * k) / n;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Complex multiplication: (cos + i*sin) * (oddFFT.real[k] + i*oddFFT.imag[k])
    const tReal = cos * oddFFT.real[k] - sin * oddFFT.imag[k];
    const tImag = cos * oddFFT.imag[k] + sin * oddFFT.real[k];

    resultReal[k] = evenFFT.real[k] + tReal;
    resultImag[k] = evenFFT.imag[k] + tImag;

    resultReal[k + n / 2] = evenFFT.real[k] - tReal;
    resultImag[k + n / 2] = evenFFT.imag[k] - tImag;
  }

  return {real: resultReal, imag: resultImag};
}

/**
 * Prepare data for FFT by padding to next power of 2
 */
function padToPowerOfTwo(data: number[]): number[] {
  const n = data.length;
  const nextPower = Math.pow(2, Math.ceil(Math.log2(n)));
  const padded = new Array(nextPower).fill(0);
  for (let i = 0; i < n; i++) {
    padded[i] = data[i];
  }
  return padded;
}

/**
 * Apply Hanning window to reduce spectral leakage
 */
function applyHanningWindow(data: number[]): number[] {
  const n = data.length;
  return data.map((value, i) => {
    const window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
    return value * window;
  });
}

/**
 * Perform FFT analysis on time-domain signal
 *
 * @param data - Time-domain signal data
 * @param sampleRate - Sampling rate in Hz (default: 100 Hz)
 * @param topN - Number of top frequency components to return (default: 5)
 * @returns FFT analysis result
 */
export function performFFT(
  data: number[],
  sampleRate: number = 100,
  topN: number = 5
): FFTResult {
  if (data.length === 0) {
    throw new Error('Cannot perform FFT on empty data');
  }

  // Apply window and pad to power of 2
  const windowed = applyHanningWindow(data);
  const padded = padToPowerOfTwo(windowed);
  const n = padded.length;

  // Perform FFT
  const imag = new Array(n).fill(0);
  const fft = fftRecursive(padded, imag);

  // Calculate magnitude and phase
  const magnitudes = new Array(n / 2);
  const phases = new Array(n / 2);
  const powerSpectrum = new Array(n / 2);

  for (let i = 0; i < n / 2; i++) {
    const real = fft.real[i];
    const imaginary = fft.imag[i];

    magnitudes[i] = Math.sqrt(real * real + imaginary * imaginary) / n;
    phases[i] = Math.atan2(imaginary, real);
    powerSpectrum[i] = magnitudes[i] * magnitudes[i];
  }

  // Calculate frequency bins
  const frequencies = new Array(n / 2);
  for (let i = 0; i < n / 2; i++) {
    frequencies[i] = (i * sampleRate) / n;
  }

  // Find dominant frequency (skip DC component at index 0)
  let dominantIndex = 1;
  let dominantMagnitude = magnitudes[1];

  for (let i = 2; i < magnitudes.length; i++) {
    if (magnitudes[i] > dominantMagnitude) {
      dominantMagnitude = magnitudes[i];
      dominantIndex = i;
    }
  }

  const dominantFrequency = frequencies[dominantIndex];

  // Extract top N frequency components
  const components: FrequencyComponent[] = [];
  const indices = Array.from({length: magnitudes.length}, (_, i) => i);

  // Sort by magnitude (descending), skip DC component
  indices
    .slice(1)
    .sort((a, b) => magnitudes[b] - magnitudes[a])
    .slice(0, topN)
    .forEach(i => {
      components.push({
        frequency: frequencies[i],
        magnitude: magnitudes[i],
        phase: phases[i],
      });
    });

  return {
    frequencies,
    magnitudes,
    phases,
    dominantFrequency,
    dominantMagnitude,
    powerSpectrum,
    components,
  };
}

/**
 * Detect if signal has periodic behavior
 *
 * @param data - Time-domain signal
 * @param sampleRate - Sampling rate in Hz
 * @param threshold - Minimum magnitude threshold for periodicity (default: 0.1)
 * @returns True if periodic pattern detected
 */
export function isPeriodic(
  data: number[],
  sampleRate: number = 100,
  threshold: number = 0.1
): boolean {
  try {
    const fftResult = performFFT(data, sampleRate, 1);
    return fftResult.dominantMagnitude > threshold;
  } catch {
    return false;
  }
}

/**
 * Estimate fundamental period from FFT
 *
 * @param data - Time-domain signal
 * @param sampleRate - Sampling rate in Hz
 * @returns Period in seconds, or null if no clear period
 */
export function estimatePeriod(
  data: number[],
  sampleRate: number = 100
): number | null {
  try {
    const fftResult = performFFT(data, sampleRate, 1);

    if (fftResult.dominantFrequency === 0) {
      return null;
    }

    // Period = 1 / frequency
    return 1 / fftResult.dominantFrequency;
  } catch {
    return null;
  }
}

/**
 * Calculate spectral centroid (brightness measure)
 *
 * @param fftResult - FFT analysis result
 * @returns Spectral centroid in Hz
 */
export function calculateSpectralCentroid(fftResult: FFTResult): number {
  let weightedSum = 0;
  let totalMagnitude = 0;

  for (let i = 0; i < fftResult.frequencies.length; i++) {
    weightedSum += fftResult.frequencies[i] * fftResult.magnitudes[i];
    totalMagnitude += fftResult.magnitudes[i];
  }

  return totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;
}

/**
 * Calculate spectral spread (spectral width)
 *
 * @param fftResult - FFT analysis result
 * @returns Spectral spread in Hz
 */
export function calculateSpectralSpread(fftResult: FFTResult): number {
  const centroid = calculateSpectralCentroid(fftResult);
  let variance = 0;
  let totalMagnitude = 0;

  for (let i = 0; i < fftResult.frequencies.length; i++) {
    const diff = fftResult.frequencies[i] - centroid;
    variance += diff * diff * fftResult.magnitudes[i];
    totalMagnitude += fftResult.magnitudes[i];
  }

  return totalMagnitude > 0 ? Math.sqrt(variance / totalMagnitude) : 0;
}
