/**
 * Audio Data Processor
 * Phase 92: Audio data processing and storage
 *
 * Features:
 * - PCM data processing
 * - Audio chunk storage
 * - WAV header generation
 * - Metadata storage
 * - File management
 */

import RNFS from 'react-native-fs';
import type {AudioDataEvent} from '@native';

/**
 * Audio format configuration
 */
export interface AudioFormat {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
}

/**
 * Audio chunk metadata
 */
export interface AudioChunkMetadata {
  chunkId: string;
  sessionId: string;
  timestamp: number;
  duration: number; // milliseconds
  sampleCount: number;
  fileSize: number; // bytes
  filePath: string;
  rmsLevel: number;
  dbLevel: number;
  isSilent: boolean;
}

/**
 * Audio chunk data
 */
export interface AudioChunk {
  data: number[]; // PCM samples
  metadata: AudioChunkMetadata;
}

/**
 * Audio Data Processor Class
 */
class AudioDataProcessorClass {
  private static instance: AudioDataProcessorClass;
  private audioBuffer: number[] = [];
  private currentSessionId: string | null = null;
  private chunkCounter: number = 0;

  // Configuration
  private readonly CHUNK_DURATION_MS = 10000; // 10 seconds per chunk
  private readonly AUDIO_DIR = `${RNFS.DocumentDirectoryPath}/audio`;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AudioDataProcessorClass {
    if (!AudioDataProcessorClass.instance) {
      AudioDataProcessorClass.instance = new AudioDataProcessorClass();
    }
    return AudioDataProcessorClass.instance;
  }

  /**
   * Initialize processor for new session
   *
   * @param sessionId Session ID
   */
  public async initializeSession(sessionId: string): Promise<void> {
    this.currentSessionId = sessionId;
    this.chunkCounter = 0;
    this.audioBuffer = [];

    // Create audio directory if not exists
    const sessionDir = `${this.AUDIO_DIR}/${sessionId}`;
    const exists = await RNFS.exists(sessionDir);
    if (!exists) {
      await RNFS.mkdir(sessionDir, {NSURLIsExcludedFromBackupKey: true});
    }

    console.log('AudioDataProcessor initialized for session:', sessionId);
  }

  /**
   * Process incoming audio data
   * Phase 92: PCM data processing
   *
   * @param audioData Audio data event from native module
   * @param format Audio format configuration
   */
  public async processAudioData(
    audioData: AudioDataEvent,
    format: AudioFormat,
  ): Promise<AudioChunkMetadata | null> {
    if (!this.currentSessionId) {
      console.warn('No active session');
      return null;
    }

    // Add to buffer
    this.audioBuffer.push(...audioData.data);

    // Calculate chunk size (samples needed for CHUNK_DURATION_MS)
    const samplesPerChunk =
      (format.sampleRate * this.CHUNK_DURATION_MS) / 1000;

    // Check if buffer has enough data for a chunk
    if (this.audioBuffer.length >= samplesPerChunk) {
      // Extract chunk data
      const chunkData = this.audioBuffer.splice(0, samplesPerChunk);

      // Save chunk
      const metadata = await this.saveAudioChunk(
        chunkData,
        format,
        audioData.rmsLevel,
        audioData.dbLevel,
        audioData.isSilent,
      );

      return metadata;
    }

    return null;
  }

  /**
   * Save audio chunk to file
   * Phase 92: Audio chunk storage
   *
   * @param pcmData PCM audio data
   * @param format Audio format
   * @param rmsLevel RMS level
   * @param dbLevel dB level
   * @param isSilent Silence flag
   * @returns Chunk metadata
   */
  private async saveAudioChunk(
    pcmData: number[],
    format: AudioFormat,
    rmsLevel: number,
    dbLevel: number,
    isSilent: boolean,
  ): Promise<AudioChunkMetadata> {
    const chunkId = `chunk_${this.chunkCounter++}`;
    const timestamp = Date.now();

    // Generate file path
    const fileName = `${chunkId}_${timestamp}.pcm`;
    const filePath = `${this.AUDIO_DIR}/${this.currentSessionId}/${fileName}`;

    // Convert PCM data to binary
    const pcmBuffer = this.pcmToBuffer(pcmData, format.bitsPerSample);

    // Write to file
    await RNFS.writeFile(filePath, pcmBuffer, 'base64');

    // Calculate duration
    const duration = (pcmData.length / format.sampleRate) * 1000;

    // Get file size
    const fileInfo = await RNFS.stat(filePath);

    // Create metadata
    const metadata: AudioChunkMetadata = {
      chunkId,
      sessionId: this.currentSessionId!,
      timestamp,
      duration,
      sampleCount: pcmData.length,
      fileSize: fileInfo.size,
      filePath,
      rmsLevel,
      dbLevel,
      isSilent,
    };

    // Save metadata
    await this.saveMetadata(metadata);

    console.log('Audio chunk saved:', chunkId);

    return metadata;
  }

  /**
   * Convert PCM data to buffer
   * Phase 92: PCM data processing
   *
   * @param pcmData PCM samples
   * @param bitsPerSample Bits per sample (8 or 16)
   * @returns Base64 encoded buffer
   */
  private pcmToBuffer(pcmData: number[], bitsPerSample: number): string {
    if (bitsPerSample === 16) {
      // 16-bit PCM
      const buffer = new ArrayBuffer(pcmData.length * 2);
      const view = new DataView(buffer);

      for (let i = 0; i < pcmData.length; i++) {
        view.setInt16(i * 2, pcmData[i], true); // little-endian
      }

      // Convert to base64
      return this.arrayBufferToBase64(buffer);
    } else {
      // 8-bit PCM
      const buffer = new ArrayBuffer(pcmData.length);
      const view = new DataView(buffer);

      for (let i = 0; i < pcmData.length; i++) {
        view.setUint8(i, pcmData[i] + 128); // Convert to unsigned
      }

      return this.arrayBufferToBase64(buffer);
    }
  }

  /**
   * Convert ArrayBuffer to Base64
   *
   * @param buffer ArrayBuffer
   * @returns Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Generate WAV header
   * Phase 92: WAV header generation (optional)
   *
   * @param dataSize PCM data size in bytes
   * @param format Audio format
   * @returns WAV header buffer
   */
  public generateWAVHeader(
    dataSize: number,
    format: AudioFormat,
  ): ArrayBuffer {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    const byteRate = format.sampleRate * format.channels * (format.bitsPerSample / 8);
    const blockAlign = format.channels * (format.bitsPerSample / 8);

    // "RIFF" chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataSize, true); // File size - 8
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // "fmt " sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Sub-chunk size
    view.setUint16(20, 1, true); // Audio format (1 = PCM)
    view.setUint16(22, format.channels, true); // Number of channels
    view.setUint32(24, format.sampleRate, true); // Sample rate
    view.setUint32(28, byteRate, true); // Byte rate
    view.setUint16(32, blockAlign, true); // Block align
    view.setUint16(34, format.bitsPerSample, true); // Bits per sample

    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataSize, true); // Data size

    return header;
  }

  /**
   * Save metadata to JSON file
   * Phase 92: Metadata storage
   *
   * @param metadata Chunk metadata
   */
  private async saveMetadata(metadata: AudioChunkMetadata): Promise<void> {
    const metadataPath = `${metadata.filePath}.meta.json`;
    const metadataJson = JSON.stringify(metadata, null, 2);
    await RNFS.writeFile(metadataPath, metadataJson, 'utf8');
  }

  /**
   * Flush remaining buffer data
   *
   * @param format Audio format
   * @param rmsLevel RMS level
   * @param dbLevel dB level
   * @param isSilent Silence flag
   */
  public async flush(
    format: AudioFormat,
    rmsLevel: number = 0,
    dbLevel: number = -96,
    isSilent: boolean = true,
  ): Promise<AudioChunkMetadata | null> {
    if (this.audioBuffer.length === 0) {
      return null;
    }

    // Save remaining data as final chunk
    const chunkData = this.audioBuffer.splice(0);
    const metadata = await this.saveAudioChunk(
      chunkData,
      format,
      rmsLevel,
      dbLevel,
      isSilent,
    );

    console.log('Audio buffer flushed');
    return metadata;
  }

  /**
   * Get session audio directory
   *
   * @param sessionId Session ID
   * @returns Directory path
   */
  public getSessionDirectory(sessionId: string): string {
    return `${this.AUDIO_DIR}/${sessionId}`;
  }

  /**
   * List all chunks for session
   *
   * @param sessionId Session ID
   * @returns Array of chunk metadata
   */
  public async listChunks(sessionId: string): Promise<AudioChunkMetadata[]> {
    const sessionDir = this.getSessionDirectory(sessionId);
    const files = await RNFS.readDir(sessionDir);

    const metadataFiles = files.filter(file => file.name.endsWith('.meta.json'));
    const chunks: AudioChunkMetadata[] = [];

    for (const file of metadataFiles) {
      const content = await RNFS.readFile(file.path, 'utf8');
      const metadata = JSON.parse(content) as AudioChunkMetadata;
      chunks.push(metadata);
    }

    return chunks.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Delete session audio data
   *
   * @param sessionId Session ID
   */
  public async deleteSession(sessionId: string): Promise<void> {
    const sessionDir = this.getSessionDirectory(sessionId);
    const exists = await RNFS.exists(sessionDir);

    if (exists) {
      await RNFS.unlink(sessionDir);
      console.log('Session audio deleted:', sessionId);
    }
  }

  /**
   * Reset processor
   */
  public reset(): void {
    this.audioBuffer = [];
    this.currentSessionId = null;
    this.chunkCounter = 0;
  }
}

/**
 * Export singleton instance
 */
export const audioDataProcessor = AudioDataProcessorClass.getInstance();

/**
 * Export default
 */
export default audioDataProcessor;
