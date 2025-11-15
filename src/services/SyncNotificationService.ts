import { AndroidStyle } from '@notifee/react-native';
import { NotificationChannel, notificationService } from './NotificationService';
import { logger } from '../utils/logger';

/**
 * 동기화 결과
 */
export interface SyncResult {
  success: boolean;
  uploadedCount: number;
  failedCount: number;
  totalSize: number; // bytes
  duration: number; // seconds
  error?: string;
}

/**
 * 동기화 통계
 */
export interface SyncStats {
  totalFiles: number;
  successCount: number;
  failedCount: number;
  totalSize: number;
  avgSpeed: number; // bytes per second
}

/**
 * 동기화 알림 서비스
 */
class SyncNotificationService {
  private syncNotificationId = 'sync-progress';
  private completedNotificationId = 'sync-completed';

  /**
   * 동기화 시작 알림
   */
  async showSyncStartNotification(fileCount: number): Promise<void> {
    try {
      await notificationService.displayNotification(
        '동기화 시작',
        `${fileCount}개 파일 업로드 중...`,
        {
          id: this.syncNotificationId,
          channelId: NotificationChannel.SYNC,
          data: {
            type: 'sync-started',
            fileCount,
          },
        }
      );

      logger.info('Sync start notification shown', { fileCount });
    } catch (error) {
      logger.error('Failed to show sync start notification', error as Error);
    }
  }

  /**
   * 동기화 진행률 업데이트
   */
  async updateSyncProgress(
    current: number,
    total: number,
    currentFileName?: string
  ): Promise<void> {
    try {
      const percentage = Math.round((current / total) * 100);
      const body = currentFileName
        ? `${currentFileName} (${current}/${total})`
        : `${current}/${total} 파일`;

      await notificationService.displayProgressNotification(
        `동기화 중 (${percentage}%)`,
        body,
        { current, max: total },
        {
          id: this.syncNotificationId,
          channelId: NotificationChannel.SYNC,
        }
      );
    } catch (error) {
      logger.error('Failed to update sync progress', error as Error);
    }
  }

  /**
   * 동기화 완료 알림 (성공)
   */
  async showSyncSuccessNotification(result: SyncResult): Promise<void> {
    try {
      const stats = this.formatSyncStats(result);
      const body = this.createSuccessMessage(result);

      await notificationService.displayNotification(
        '✓ 동기화 완료',
        body,
        {
          id: this.completedNotificationId,
          channelId: NotificationChannel.SYNC,
          data: {
            type: 'sync-completed',
            success: true,
            ...result,
          },
        }
      );

      // 진행률 알림 제거
      await notificationService.cancelNotification(this.syncNotificationId);

      logger.info('Sync success notification shown', { result });
    } catch (error) {
      logger.error('Failed to show sync success notification', error as Error);
    }
  }

  /**
   * 동기화 실패 알림
   */
  async showSyncFailureNotification(result: SyncResult): Promise<void> {
    try {
      const body = this.createFailureMessage(result);

      await notificationService.displayNotification(
        '✗ 동기화 실패',
        body,
        {
          id: this.completedNotificationId,
          channelId: NotificationChannel.IMPORTANT,
          data: {
            type: 'sync-failed',
            success: false,
            ...result,
          },
        }
      );

      // 진행률 알림 제거
      await notificationService.cancelNotification(this.syncNotificationId);

      logger.warn('Sync failure notification shown', { result });
    } catch (error) {
      logger.error('Failed to show sync failure notification', error as Error);
    }
  }

  /**
   * 동기화 부분 성공 알림
   */
  async showSyncPartialSuccessNotification(result: SyncResult): Promise<void> {
    try {
      const body = this.createPartialSuccessMessage(result);

      await notificationService.displayNotification(
        '⚠ 동기화 부분 완료',
        body,
        {
          id: this.completedNotificationId,
          channelId: NotificationChannel.IMPORTANT,
          data: {
            type: 'sync-partial',
            success: true,
            ...result,
          },
        }
      );

      // 진행률 알림 제거
      await notificationService.cancelNotification(this.syncNotificationId);

      logger.warn('Sync partial success notification shown', { result });
    } catch (error) {
      logger.error('Failed to show sync partial success notification', error as Error);
    }
  }

  /**
   * 동기화 완료 알림 (자동 선택)
   */
  async showSyncCompletedNotification(result: SyncResult): Promise<void> {
    if (!result.success) {
      await this.showSyncFailureNotification(result);
    } else if (result.failedCount > 0) {
      await this.showSyncPartialSuccessNotification(result);
    } else {
      await this.showSyncSuccessNotification(result);
    }
  }

  /**
   * 동기화 취소 알림
   */
  async showSyncCancelledNotification(
    uploadedCount: number,
    totalCount: number
  ): Promise<void> {
    try {
      await notificationService.displayNotification(
        '동기화 취소됨',
        `${uploadedCount}/${totalCount} 파일 업로드 완료`,
        {
          id: this.completedNotificationId,
          channelId: NotificationChannel.SYNC,
          data: {
            type: 'sync-cancelled',
            uploadedCount,
            totalCount,
          },
        }
      );

      // 진행률 알림 제거
      await notificationService.cancelNotification(this.syncNotificationId);

      logger.info('Sync cancelled notification shown', { uploadedCount, totalCount });
    } catch (error) {
      logger.error('Failed to show sync cancelled notification', error as Error);
    }
  }

  /**
   * 성공 메시지 생성
   */
  private createSuccessMessage(result: SyncResult): string {
    const lines: string[] = [];

    lines.push(`${result.uploadedCount}개 파일 업로드 완료`);
    lines.push(`크기: ${this.formatFileSize(result.totalSize)}`);
    lines.push(`소요 시간: ${this.formatDuration(result.duration)}`);

    if (result.duration > 0) {
      const speed = result.totalSize / result.duration;
      lines.push(`속도: ${this.formatFileSize(speed)}/s`);
    }

    return lines.join('\n');
  }

  /**
   * 실패 메시지 생성
   */
  private createFailureMessage(result: SyncResult): string {
    const lines: string[] = [];

    if (result.error) {
      lines.push(result.error);
    } else {
      lines.push('동기화 중 오류가 발생했습니다');
    }

    if (result.uploadedCount > 0) {
      lines.push(`\n${result.uploadedCount}개 파일은 업로드됨`);
    }

    if (result.failedCount > 0) {
      lines.push(`${result.failedCount}개 파일 실패`);
    }

    return lines.join('\n');
  }

  /**
   * 부분 성공 메시지 생성
   */
  private createPartialSuccessMessage(result: SyncResult): string {
    const lines: string[] = [];

    lines.push(`${result.uploadedCount}개 파일 업로드 완료`);
    lines.push(`${result.failedCount}개 파일 실패`);
    lines.push(`크기: ${this.formatFileSize(result.totalSize)}`);

    return lines.join('\n');
  }

  /**
   * 동기화 통계 포맷
   */
  private formatSyncStats(result: SyncResult): string {
    const stats: string[] = [];

    stats.push(`업로드: ${result.uploadedCount}개`);
    if (result.failedCount > 0) {
      stats.push(`실패: ${result.failedCount}개`);
    }
    stats.push(`크기: ${this.formatFileSize(result.totalSize)}`);
    stats.push(`시간: ${this.formatDuration(result.duration)}`);

    return stats.join(' | ');
  }

  /**
   * 파일 크기 포맷 (bytes → KB/MB/GB)
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * 시간 포맷 (seconds → HH:MM:SS or MM:SS)
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${this.pad(minutes)}:${this.pad(secs)}`;
    }
    return `${minutes}:${this.pad(secs)}`;
  }

  /**
   * 숫자를 2자리로 패딩
   */
  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  /**
   * 진행 중인 동기화 알림 취소
   */
  async cancelSyncNotifications(): Promise<void> {
    try {
      await notificationService.cancelNotification(this.syncNotificationId);
      await notificationService.cancelNotification(this.completedNotificationId);
      logger.debug('Sync notifications cancelled');
    } catch (error) {
      logger.error('Failed to cancel sync notifications', error as Error);
    }
  }
}

/**
 * 싱글톤 인스턴스
 */
export const syncNotificationService = new SyncNotificationService();
