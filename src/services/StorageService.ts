/**
 * Storage Service
 * Handles file storage operations for sensor data, audio, and exports
 */

import RNFS from 'react-native-fs';
import {
  AppDirectories,
  initializeDirectories,
  getStorageInfo,
  formatBytes,
  getDirectorySize,
  generateUniqueFileName,
  fileExists,
  deleteFile,
  copyFile,
  moveFile,
  isPathSafe,
} from '../utils/fileSystem';

export interface WriteFileOptions {
  /**
   * Append to existing file instead of overwriting
   */
  append?: boolean;

  /**
   * File encoding (default: 'utf8')
   */
  encoding?: 'utf8' | 'ascii' | 'base64';

  /**
   * Create parent directories if they don't exist
   */
  createDirs?: boolean;
}

export interface StorageStats {
  totalSpace: number;
  freeSpace: number;
  usedSpace: number;
  appUsage: number;
  percentUsed: number;
  isLowStorage: boolean;
  formatted: {
    total: string;
    free: string;
    used: string;
    app: string;
  };
}

export class StorageService {
  private static instance: StorageService | null = null;
  private initialized: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Initialize storage service
   * Creates app directories and checks storage availability
   */
  public async initialize(): Promise<{success: boolean; error?: string}> {
    try {
      if (this.initialized) {
        return {success: true};
      }

      console.log('Initializing Storage Service...');

      // Create app directories
      const dirResult = await initializeDirectories();
      if (!dirResult.success) {
        console.error('Failed to create some directories:', dirResult.errors);
      }

      // Check storage availability
      const storageInfo = await getStorageInfo();
      if (storageInfo.isLowStorage) {
        console.warn(
          `⚠️ Low storage warning: ${formatBytes(storageInfo.free)} remaining`,
        );
      }

      this.initialized = true;
      console.log('✓ Storage Service initialized successfully');

      return {success: true};
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Storage Service initialization failed:', errorMessage);
      return {success: false, error: errorMessage};
    }
  }

  /**
   * Write data to file
   */
  public async writeFile(
    filePath: string,
    data: string,
    options: WriteFileOptions = {},
  ): Promise<{success: boolean; error?: string}> {
    try {
      // Ensure initialized
      if (!this.initialized) {
        await this.initialize();
      }

      // Safety check
      if (!isPathSafe(filePath)) {
        throw new Error('File path is outside app directories');
      }

      // Check storage
      const storageInfo = await getStorageInfo();
      if (storageInfo.isLowStorage) {
        throw new Error('Insufficient storage space');
      }

      // Create parent directories if needed
      if (options.createDirs) {
        const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
        const dirExists = await fileExists(dirPath);
        if (!dirExists) {
          await RNFS.mkdir(dirPath);
        }
      }

      // Write file
      if (options.append) {
        await RNFS.appendFile(filePath, data, options.encoding || 'utf8');
      } else {
        await RNFS.writeFile(filePath, data, options.encoding || 'utf8');
      }

      return {success: true};
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to write file ${filePath}:`, errorMessage);
      return {success: false, error: errorMessage};
    }
  }

  /**
   * Read file content
   */
  public async readFile(
    filePath: string,
    encoding: 'utf8' | 'ascii' | 'base64' = 'utf8',
  ): Promise<{success: boolean; data?: string; error?: string}> {
    try {
      // Safety check
      if (!isPathSafe(filePath)) {
        throw new Error('File path is outside app directories');
      }

      // Check if file exists
      const exists = await fileExists(filePath);
      if (!exists) {
        throw new Error('File does not exist');
      }

      // Read file
      const data = await RNFS.readFile(filePath, encoding);

      return {success: true, data};
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to read file ${filePath}:`, errorMessage);
      return {success: false, error: errorMessage};
    }
  }

  /**
   * Delete file
   */
  public async deleteFile(
    filePath: string,
  ): Promise<{success: boolean; error?: string}> {
    try {
      const deleted = await deleteFile(filePath);
      if (!deleted) {
        throw new Error('File does not exist or could not be deleted');
      }

      return {success: true};
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {success: false, error: errorMessage};
    }
  }

  /**
   * Copy file
   */
  public async copyFile(
    source: string,
    destination: string,
    onProgress?: (progress: number) => void,
  ): Promise<{success: boolean; error?: string}> {
    try {
      await copyFile(source, destination, onProgress);
      return {success: true};
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {success: false, error: errorMessage};
    }
  }

  /**
   * Move file
   */
  public async moveFile(
    source: string,
    destination: string,
  ): Promise<{success: boolean; error?: string}> {
    try {
      await moveFile(source, destination);
      return {success: true};
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {success: false, error: errorMessage};
    }
  }

  /**
   * List files in directory
   */
  public async listFiles(
    dirPath: string,
  ): Promise<{
    success: boolean;
    files?: Array<{
      name: string;
      path: string;
      size: number;
      isDirectory: boolean;
      modifiedTime: number;
    }>;
    error?: string;
  }> {
    try {
      // Safety check
      if (!isPathSafe(dirPath)) {
        throw new Error('Directory path is outside app directories');
      }

      const exists = await fileExists(dirPath);
      if (!exists) {
        throw new Error('Directory does not exist');
      }

      const items = await RNFS.readDir(dirPath);

      const files = items.map(item => ({
        name: item.name,
        path: item.path,
        size: item.size,
        isDirectory: item.isDirectory(),
        modifiedTime: new Date(item.mtime).getTime(),
      }));

      return {success: true, files};
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {success: false, error: errorMessage};
    }
  }

  /**
   * Get file info
   */
  public async getFileInfo(
    filePath: string,
  ): Promise<{
    success: boolean;
    info?: {
      size: number;
      exists: boolean;
      modifiedTime: number;
      isDirectory: boolean;
    };
    error?: string;
  }> {
    try {
      const exists = await fileExists(filePath);
      if (!exists) {
        return {
          success: true,
          info: {
            size: 0,
            exists: false,
            modifiedTime: 0,
            isDirectory: false,
          },
        };
      }

      const stat = await RNFS.stat(filePath);

      return {
        success: true,
        info: {
          size: stat.size,
          exists: true,
          modifiedTime: new Date(stat.mtime).getTime(),
          isDirectory: stat.isDirectory(),
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {success: false, error: errorMessage};
    }
  }

  /**
   * Get storage statistics
   */
  public async getStorageStats(): Promise<{
    success: boolean;
    stats?: StorageStats;
    error?: string;
  }> {
    try {
      const storageInfo = await getStorageInfo();
      const appSize = await getDirectorySize(AppDirectories.root);

      const stats: StorageStats = {
        totalSpace: storageInfo.total,
        freeSpace: storageInfo.free,
        usedSpace: storageInfo.used,
        appUsage: appSize,
        percentUsed: storageInfo.percentUsed,
        isLowStorage: storageInfo.isLowStorage,
        formatted: {
          total: formatBytes(storageInfo.total),
          free: formatBytes(storageInfo.free),
          used: formatBytes(storageInfo.used),
          app: formatBytes(appSize),
        },
      };

      return {success: true, stats};
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {success: false, error: errorMessage};
    }
  }

  /**
   * Check storage capacity
   * Returns true if there's enough space for the specified size
   */
  public async hasEnoughSpace(
    requiredBytes: number,
  ): Promise<{hasSpace: boolean; availableBytes: number}> {
    try {
      const storageInfo = await getStorageInfo();
      const hasSpace = storageInfo.free >= requiredBytes;

      return {
        hasSpace,
        availableBytes: storageInfo.free,
      };
    } catch (error) {
      console.error('Failed to check storage capacity:', error);
      return {
        hasSpace: false,
        availableBytes: 0,
      };
    }
  }

  /**
   * Write sensor data to file
   * Convenience method for writing sensor data
   */
  public async writeSensorData(
    sessionId: string,
    data: string,
    append: boolean = true,
  ): Promise<{success: boolean; filePath?: string; error?: string}> {
    try {
      const fileName = `${sessionId}.jsonl`;
      const filePath = `${AppDirectories.sensorData}/${fileName}`;

      const result = await this.writeFile(filePath, data, {
        append,
        createDirs: true,
      });

      if (result.success) {
        return {success: true, filePath};
      } else {
        return {success: false, error: result.error};
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {success: false, error: errorMessage};
    }
  }

  /**
   * Generate unique file path
   */
  public generateFilePath(
    directory: keyof typeof AppDirectories,
    prefix: string,
    extension: string,
  ): string {
    const fileName = generateUniqueFileName(prefix, extension);
    return `${AppDirectories[directory]}/${fileName}`;
  }

  /**
   * Clean up old files
   * Deletes files older than specified days
   */
  public async cleanupOldFiles(
    directory: string,
    olderThanDays: number,
  ): Promise<{
    success: boolean;
    deletedCount: number;
    freedSpace: number;
    error?: string;
  }> {
    try {
      const result = await this.listFiles(directory);
      if (!result.success || !result.files) {
        throw new Error(result.error || 'Failed to list files');
      }

      const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
      let deletedCount = 0;
      let freedSpace = 0;

      for (const file of result.files) {
        if (!file.isDirectory && file.modifiedTime < cutoffTime) {
          const deleteResult = await this.deleteFile(file.path);
          if (deleteResult.success) {
            deletedCount++;
            freedSpace += file.size;
          }
        }
      }

      return {success: true, deletedCount, freedSpace};
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {success: false, deletedCount: 0, freedSpace: 0, error: errorMessage};
    }
  }

  /**
   * Reset singleton instance (for testing)
   */
  public static reset(): void {
    StorageService.instance = null;
  }
}

// Export singleton instance getter
export const getStorageService = (): StorageService => {
  return StorageService.getInstance();
};
