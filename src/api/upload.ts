/**
 * Upload API
 * Phase 106: File upload with progress tracking
 *
 * Features:
 * - Multipart file upload
 * - Chunk upload support
 * - Upload progress callback
 * - File metadata
 * - Resumable upload (optional)
 * - Cancel support
 * - Error handling
 */

import {apiClient} from './client';
import {ApiResponse} from './types';

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: UploadProgress) => void;

/**
 * Upload progress
 */
export interface UploadProgress {
  loaded: number; // Bytes uploaded
  total: number; // Total bytes
  percentage: number; // 0-100
}

/**
 * Upload options
 */
export interface UploadOptions {
  onProgress?: UploadProgressCallback;
  metadata?: Record<string, any>;
  chunkSize?: number; // Bytes per chunk (for chunked upload)
  signal?: AbortSignal; // For cancellation
}

/**
 * Upload response
 */
export interface UploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

/**
 * Chunk upload response
 */
export interface ChunkUploadResponse {
  chunkId: string;
  chunkNumber: number;
  totalChunks: number;
  uploaded: boolean;
}

/**
 * Upload API
 */
export const uploadApi = {
  /**
   * Upload single file
   * Phase 106: Multipart upload with progress
   *
   * @param file File to upload (File or Blob)
   * @param options Upload options
   * @returns Upload response
   */
  async uploadFile(
    file: File | Blob,
    options: UploadOptions = {},
  ): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    // Upload with progress tracking
    const response = await apiClient.post<ApiResponse<UploadResponse>>(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (options.onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100),
            };
            options.onProgress(progress);
          }
        },
        signal: options.signal,
      },
    );

    return response;
  },

  /**
   * Upload file in chunks
   * Phase 106: Chunked upload for large files
   *
   * @param file File to upload
   * @param options Upload options
   * @returns Upload response
   */
  async uploadFileChunked(
    file: File | Blob,
    options: UploadOptions = {},
  ): Promise<ApiResponse<UploadResponse>> {
    const chunkSize = options.chunkSize || 1024 * 1024; // 1MB default
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let uploadedBytes = 0;

    // Upload chunks sequentially
    for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
      const start = chunkNumber * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('uploadId', uploadId);
      formData.append('chunkNumber', chunkNumber.toString());
      formData.append('totalChunks', totalChunks.toString());

      if (chunkNumber === 0 && options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }

      await apiClient.post<ChunkUploadResponse>('/upload/chunk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: options.signal,
      });

      // Update progress
      uploadedBytes += chunk.size;
      if (options.onProgress) {
        const progress: UploadProgress = {
          loaded: uploadedBytes,
          total: file.size,
          percentage: Math.round((uploadedBytes / file.size) * 100),
        };
        options.onProgress(progress);
      }
    }

    // Complete chunked upload
    const response = await apiClient.post<ApiResponse<UploadResponse>>(
      '/upload/complete',
      {uploadId},
    );

    return response;
  },

  /**
   * Upload sensor data file
   * Phase 106: Upload sensor data with session metadata
   *
   * @param sessionId Session ID
   * @param dataFile Data file (CSV, JSON, etc.)
   * @param options Upload options
   * @returns Upload response
   */
  async uploadSensorData(
    sessionId: string,
    dataFile: File | Blob,
    options: UploadOptions = {},
  ): Promise<ApiResponse<UploadResponse>> {
    return this.uploadFile(dataFile, {
      ...options,
      metadata: {
        sessionId,
        dataType: 'sensor',
        ...options.metadata,
      },
    });
  },

  /**
   * Upload audio file
   * Phase 106: Upload audio recording
   *
   * @param sessionId Session ID
   * @param audioFile Audio file
   * @param options Upload options
   * @returns Upload response
   */
  async uploadAudio(
    sessionId: string,
    audioFile: File | Blob,
    options: UploadOptions = {},
  ): Promise<ApiResponse<UploadResponse>> {
    return this.uploadFile(audioFile, {
      ...options,
      metadata: {
        sessionId,
        dataType: 'audio',
        ...options.metadata,
      },
    });
  },

  /**
   * Cancel upload
   * Phase 106: Cancel ongoing upload
   *
   * @param abortController Abort controller
   */
  cancelUpload(abortController: AbortController): void {
    abortController.abort();
  },
};

/**
 * Export default
 */
export default uploadApi;
