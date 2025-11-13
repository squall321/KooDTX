/**
 * File System Utilities
 * Provides cross-platform file system paths and operations
 */

import RNFS from 'react-native-fs';
import {Platform} from 'react-native';

/**
 * Get base directory paths for the app
 */
export const FilePaths = {
  /**
   * Documents directory - persistent storage
   * iOS: ~/Documents
   * Android: /data/data/{package}/files
   */
  documents: RNFS.DocumentDirectoryPath,

  /**
   * Cache directory - temporary storage
   * iOS: ~/Library/Caches
   * Android: /data/data/{package}/cache
   */
  cache: RNFS.CachesDirectoryPath,

  /**
   * Temporary directory
   * iOS: ~/tmp
   * Android: /data/data/{package}/cache
   */
  temp: RNFS.TemporaryDirectoryPath,

  /**
   * External storage directory (Android only)
   * Android: /storage/emulated/0
   * iOS: same as documents
   */
  external:
    Platform.OS === 'android'
      ? RNFS.ExternalStorageDirectoryPath || RNFS.DocumentDirectoryPath
      : RNFS.DocumentDirectoryPath,

  /**
   * Download directory (Android only)
   * Android: /storage/emulated/0/Download
   * iOS: same as documents
   */
  downloads:
    Platform.OS === 'android'
      ? RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath
      : RNFS.DocumentDirectoryPath,
};

/**
 * App-specific directory structure
 */
export const AppDirectories = {
  /**
   * Base app data directory
   */
  root: `${FilePaths.documents}/KooDTX`,

  /**
   * Sensor data directory
   */
  sensorData: `${FilePaths.documents}/KooDTX/sensor_data`,

  /**
   * Audio recordings directory
   */
  audio: `${FilePaths.documents}/KooDTX/audio`,

  /**
   * Exported data directory
   */
  exports: `${FilePaths.documents}/KooDTX/exports`,

  /**
   * Temporary processing directory
   */
  temp: `${FilePaths.temp}/KooDTX`,

  /**
   * Backup directory
   */
  backups: `${FilePaths.documents}/KooDTX/backups`,

  /**
   * Logs directory
   */
  logs: `${FilePaths.documents}/KooDTX/logs`,
};

/**
 * Initialize app directory structure
 * Creates all necessary directories if they don't exist
 */
export async function initializeDirectories(): Promise<{
  success: boolean;
  created: string[];
  errors: Array<{path: string; error: string}>;
}> {
  const created: string[] = [];
  const errors: Array<{path: string; error: string}> = [];

  const directories = Object.values(AppDirectories);

  for (const dir of directories) {
    try {
      const exists = await RNFS.exists(dir);
      if (!exists) {
        await RNFS.mkdir(dir);
        created.push(dir);
        console.log(`✓ Created directory: ${dir}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      errors.push({path: dir, error: errorMessage});
      console.error(`✗ Failed to create directory ${dir}:`, errorMessage);
    }
  }

  return {
    success: errors.length === 0,
    created,
    errors,
  };
}

/**
 * Get storage information
 */
export async function getStorageInfo(): Promise<{
  free: number;
  total: number;
  used: number;
  percentUsed: number;
  isLowStorage: boolean;
}> {
  try {
    const freeSpace = await RNFS.getFSInfo();

    const free = freeSpace.freeSpace;
    const total = freeSpace.totalSpace;
    const used = total - free;
    const percentUsed = (used / total) * 100;
    const isLowStorage = free < 100 * 1024 * 1024; // Less than 100MB

    return {
      free,
      total,
      used,
      percentUsed,
      isLowStorage,
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    throw error;
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Get directory size (recursive)
 */
export async function getDirectorySize(dirPath: string): Promise<number> {
  try {
    const exists = await RNFS.exists(dirPath);
    if (!exists) {
      return 0;
    }

    const items = await RNFS.readDir(dirPath);
    let totalSize = 0;

    for (const item of items) {
      if (item.isFile()) {
        totalSize += item.size;
      } else if (item.isDirectory()) {
        totalSize += await getDirectorySize(item.path);
      }
    }

    return totalSize;
  } catch (error) {
    console.error(`Failed to get directory size for ${dirPath}:`, error);
    return 0;
  }
}

/**
 * Clean temporary directory
 */
export async function cleanTempDirectory(): Promise<{
  deletedFiles: number;
  freedSpace: number;
  errors: string[];
}> {
  let deletedFiles = 0;
  let freedSpace = 0;
  const errors: string[] = [];

  try {
    const exists = await RNFS.exists(AppDirectories.temp);
    if (!exists) {
      return {deletedFiles, freedSpace, errors};
    }

    const items = await RNFS.readDir(AppDirectories.temp);

    for (const item of items) {
      try {
        const size = item.isFile() ? item.size : await getDirectorySize(item.path);
        await RNFS.unlink(item.path);
        deletedFiles++;
        freedSpace += size;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to delete ${item.path}: ${errorMessage}`);
      }
    }

    console.log(`✓ Cleaned temp directory: ${deletedFiles} files, ${formatBytes(freedSpace)} freed`);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    errors.push(`Failed to clean temp directory: ${errorMessage}`);
  }

  return {deletedFiles, freedSpace, errors};
}

/**
 * Get app storage usage
 */
export async function getAppStorageUsage(): Promise<{
  total: number;
  byDirectory: Record<string, number>;
  formatted: Record<string, string>;
}> {
  const byDirectory: Record<string, number> = {};
  const formatted: Record<string, string> = {};

  for (const [key, path] of Object.entries(AppDirectories)) {
    const size = await getDirectorySize(path);
    byDirectory[key] = size;
    formatted[key] = formatBytes(size);
  }

  const total = Object.values(byDirectory).reduce((sum, size) => sum + size, 0);

  return {
    total,
    byDirectory,
    formatted,
  };
}

/**
 * Check if path is within app directories
 */
export function isPathSafe(path: string): boolean {
  const normalizedPath = path.toLowerCase();
  const appRoot = AppDirectories.root.toLowerCase();

  return normalizedPath.startsWith(appRoot);
}

/**
 * Generate unique file name
 */
export function generateUniqueFileName(
  prefix: string,
  extension: string,
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}.${extension}`;
}

/**
 * Get file extension
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    return await RNFS.exists(filePath);
  } catch {
    return false;
  }
}

/**
 * Copy file with progress
 */
export async function copyFile(
  source: string,
  destination: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  try {
    const exists = await RNFS.exists(source);
    if (!exists) {
      throw new Error(`Source file does not exist: ${source}`);
    }

    // Ensure destination directory exists
    const destDir = destination.substring(0, destination.lastIndexOf('/'));
    const destDirExists = await RNFS.exists(destDir);
    if (!destDirExists) {
      await RNFS.mkdir(destDir);
    }

    if (onProgress) {
      // For small files, just copy and report 100%
      await RNFS.copyFile(source, destination);
      onProgress(100);
    } else {
      await RNFS.copyFile(source, destination);
    }
  } catch (error) {
    console.error(`Failed to copy file from ${source} to ${destination}:`, error);
    throw error;
  }
}

/**
 * Move file
 */
export async function moveFile(
  source: string,
  destination: string,
): Promise<void> {
  try {
    const exists = await RNFS.exists(source);
    if (!exists) {
      throw new Error(`Source file does not exist: ${source}`);
    }

    // Ensure destination directory exists
    const destDir = destination.substring(0, destination.lastIndexOf('/'));
    const destDirExists = await RNFS.exists(destDir);
    if (!destDirExists) {
      await RNFS.mkdir(destDir);
    }

    await RNFS.moveFile(source, destination);
  } catch (error) {
    console.error(`Failed to move file from ${source} to ${destination}:`, error);
    throw error;
  }
}

/**
 * Delete file safely
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    // Check if path is safe
    if (!isPathSafe(filePath)) {
      console.warn(`Unsafe path deletion attempt: ${filePath}`);
      return false;
    }

    const exists = await RNFS.exists(filePath);
    if (!exists) {
      return false;
    }

    await RNFS.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error);
    return false;
  }
}
