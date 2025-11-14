/**
 * Sync Logger
 * Phase 118: Synchronization statistics and logging
 */

export interface SyncLog {
  id: string;
  timestamp: number;
  type: 'push' | 'pull' | 'conflict' | 'error';
  success: boolean;
  duration: number;
  itemsCount: number;
  bytesTransferred: number;
  error?: string;
}

export interface SyncStatistics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalBytesTransferred: number;
  averageSyncDuration: number;
  lastSyncTime: number;
  conflicts: number;
}

export class SyncLogger {
  private static instance: SyncLogger;
  private logs: SyncLog[] = [];
  private stats: SyncStatistics = {
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    totalBytesTransferred: 0,
    averageSyncDuration: 0,
    lastSyncTime: 0,
    conflicts: 0,
  };

  private constructor() {}

  public static getInstance(): SyncLogger {
    if (!SyncLogger.instance) {
      SyncLogger.instance = new SyncLogger();
    }
    return SyncLogger.instance;
  }

  public log(log: SyncLog): void {
    this.logs.push(log);
    this.updateStatistics(log);
  }

  private updateStatistics(log: SyncLog): void {
    this.stats.totalSyncs++;
    
    if (log.success) {
      this.stats.successfulSyncs++;
    } else {
      this.stats.failedSyncs++;
    }

    this.stats.totalBytesTransferred += log.bytesTransferred;
    this.stats.lastSyncTime = log.timestamp;

    if (log.type === 'conflict') {
      this.stats.conflicts++;
    }

    // Update average duration
    const totalDuration = this.logs.reduce((sum, l) => sum + l.duration, 0);
    this.stats.averageSyncDuration = totalDuration / this.logs.length;
  }

  public getStatistics(): SyncStatistics {
    return {...this.stats};
  }

  public getLogs(limit?: number): SyncLog[] {
    return limit ? this.logs.slice(-limit) : [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const syncLogger = SyncLogger.getInstance();
export default syncLogger;
