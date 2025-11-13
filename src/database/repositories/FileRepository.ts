/**
 * FileRepository
 * Handles CRUD operations for file records
 */

import {Q} from '@nozbe/watermelondb';
import {database, File} from '../index';
import type {FileType, FileMetadata} from '../models/File';

export interface CreateFileData {
  sessionId: string;
  fileType: FileType;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  checksum?: string;
  metadata?: FileMetadata;
}

export interface UpdateFileData {
  isUploaded?: boolean;
  uploadedUrl?: string;
  uploadedAt?: number;
  metadata?: FileMetadata;
}

export class FileRepository {
  private collection = database.get<File>('files');

  /**
   * Create a new file record
   */
  async create(data: CreateFileData): Promise<File> {
    return database.write(async () => {
      return this.collection.create(record => {
        record.sessionId = data.sessionId;
        record.fileType = data.fileType;
        record.filePath = data.filePath;
        record.fileName = data.fileName;
        record.fileSize = data.fileSize;
        record.mimeType = data.mimeType;
        record.checksum = data.checksum;
        record.isUploaded = false;
        record.metadata = data.metadata;
      });
    });
  }

  /**
   * Find file by ID
   */
  async findById(id: string): Promise<File | null> {
    try {
      return await this.collection.find(id);
    } catch {
      return null;
    }
  }

  /**
   * Find file by path
   */
  async findByPath(filePath: string): Promise<File | null> {
    const files = await this.collection
      .query(Q.where('file_path', filePath))
      .fetch();
    return files[0] || null;
  }

  /**
   * Find files by session ID
   */
  async findBySessionId(sessionId: string): Promise<File[]> {
    return this.collection
      .query(
        Q.where('session_id', sessionId),
        Q.sortBy('created_at', Q.desc),
      )
      .fetch();
  }

  /**
   * Find files by type
   */
  async findByType(fileType: FileType): Promise<File[]> {
    return this.collection
      .query(
        Q.where('file_type', fileType),
        Q.sortBy('created_at', Q.desc),
      )
      .fetch();
  }

  /**
   * Find files by session ID and type
   */
  async findBySessionIdAndType(
    sessionId: string,
    fileType: FileType,
  ): Promise<File[]> {
    return this.collection
      .query(
        Q.where('session_id', sessionId),
        Q.where('file_type', fileType),
        Q.sortBy('created_at', Q.desc),
      )
      .fetch();
  }

  /**
   * Find unuploaded files
   */
  async findUnuploaded(): Promise<File[]> {
    return this.collection
      .query(
        Q.where('is_uploaded', false),
        Q.sortBy('created_at', Q.asc),
      )
      .fetch();
  }

  /**
   * Find unuploaded files by type
   */
  async findUnuploadedByType(fileType: FileType): Promise<File[]> {
    return this.collection
      .query(
        Q.where('is_uploaded', false),
        Q.where('file_type', fileType),
        Q.sortBy('created_at', Q.asc),
      )
      .fetch();
  }

  /**
   * Find uploaded files
   */
  async findUploaded(): Promise<File[]> {
    return this.collection
      .query(
        Q.where('is_uploaded', true),
        Q.sortBy('uploaded_at', Q.desc),
      )
      .fetch();
  }

  /**
   * Find large files (over specified size in bytes)
   */
  async findLargeFiles(minSizeBytes: number): Promise<File[]> {
    return this.collection
      .query(
        Q.where('file_size', Q.gte(minSizeBytes)),
        Q.sortBy('file_size', Q.desc),
      )
      .fetch();
  }

  /**
   * Update file
   */
  async update(id: string, updates: UpdateFileData): Promise<File> {
    const record = await this.collection.find(id);
    return database.write(async () => {
      return record.update(r => {
        if (updates.isUploaded !== undefined) {
          r.isUploaded = updates.isUploaded;
        }
        if (updates.uploadedUrl !== undefined) {
          r.uploadedUrl = updates.uploadedUrl;
        }
        if (updates.uploadedAt !== undefined) {
          r.uploadedAt = updates.uploadedAt;
        }
        if (updates.metadata !== undefined) {
          r.metadata = updates.metadata;
        }
      });
    });
  }

  /**
   * Mark file as uploaded
   */
  async markAsUploaded(id: string, uploadedUrl: string): Promise<File> {
    return this.update(id, {
      isUploaded: true,
      uploadedUrl,
      uploadedAt: Date.now(),
    });
  }

  /**
   * Delete file record
   */
  async delete(id: string): Promise<void> {
    const record = await this.collection.find(id);
    return database.write(async () => {
      await record.destroyPermanently();
    });
  }

  /**
   * Delete file record by path
   */
  async deleteByPath(filePath: string): Promise<void> {
    const file = await this.findByPath(filePath);
    if (file) {
      await this.delete(file.id);
    }
  }

  /**
   * Delete all uploaded files (records only, not physical files)
   */
  async deleteUploadedRecords(): Promise<number> {
    const files = await this.findUploaded();
    await database.write(async () => {
      await Promise.all(files.map(f => f.destroyPermanently()));
    });
    return files.length;
  }

  /**
   * Count files
   */
  async count(): Promise<number> {
    return this.collection.query().fetchCount();
  }

  /**
   * Count files by type
   */
  async countByType(fileType: FileType): Promise<number> {
    return this.collection
      .query(Q.where('file_type', fileType))
      .fetchCount();
  }

  /**
   * Get total size of all files
   */
  async getTotalSize(): Promise<number> {
    const files = await this.collection.query().fetch();
    return files.reduce((total, file) => total + file.fileSize, 0);
  }

  /**
   * Get total size by session
   */
  async getTotalSizeBySession(sessionId: string): Promise<number> {
    const files = await this.findBySessionId(sessionId);
    return files.reduce((total, file) => total + file.fileSize, 0);
  }

  /**
   * Get file statistics
   */
  async getStatistics(): Promise<{
    total: number;
    audio: number;
    export: number;
    backup: number;
    uploaded: number;
    unuploaded: number;
    totalSize: number;
    averageSize: number;
  }> {
    const [
      total,
      audio,
      exportCount,
      backup,
      uploaded,
      unuploaded,
      totalSize,
    ] = await Promise.all([
      this.count(),
      this.countByType('audio'),
      this.countByType('export'),
      this.countByType('backup'),
      this.findUploaded().then(f => f.length),
      this.findUnuploaded().then(f => f.length),
      this.getTotalSize(),
    ]);

    return {
      total,
      audio,
      export: exportCount,
      backup,
      uploaded,
      unuploaded,
      totalSize,
      averageSize: total > 0 ? Math.round(totalSize / total) : 0,
    };
  }

  /**
   * Clear all file records (use with caution)
   */
  async clearAll(): Promise<void> {
    const records = await this.collection.query().fetch();
    return database.write(async () => {
      await Promise.all(records.map(r => r.destroyPermanently()));
    });
  }
}

// Singleton instance
let repositoryInstance: FileRepository | null = null;

/**
 * Get singleton instance of FileRepository
 */
export function getFileRepository(): FileRepository {
  if (!repositoryInstance) {
    repositoryInstance = new FileRepository();
  }
  return repositoryInstance;
}

/**
 * Reset singleton instance (mainly for testing)
 */
export function resetFileRepository(): void {
  repositoryInstance = null;
}
