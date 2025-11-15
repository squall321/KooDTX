import notifee, { AndroidColor } from '@notifee/react-native';
import { Platform } from 'react-native';
import { NotificationChannel, notificationService } from './NotificationService';
import { logger } from '../utils/logger';

/**
 * 녹음 알림 서비스
 * 녹음 중 Foreground Service 알림 관리
 */
class RecordingNotificationService {
  private notificationId = 'recording-foreground';
  private updateInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;

  /**
   * 녹음 시작 알림 표시
   */
  async startRecordingNotification(sensorName: string): Promise<void> {
    try {
      this.startTime = Date.now();

      await this.displayRecordingNotification(sensorName, 0);

      // 1초마다 녹음 시간 업데이트
      this.updateInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.updateRecordingTime(sensorName, elapsed);
      }, 1000);

      logger.info('Recording notification started', { sensorName });
    } catch (error) {
      logger.error('Failed to start recording notification', error as Error);
      throw error;
    }
  }

  /**
   * 녹음 알림 표시
   */
  private async displayRecordingNotification(
    sensorName: string,
    elapsedSeconds: number
  ): Promise<void> {
    const timeText = this.formatTime(elapsedSeconds);

    await notifee.displayNotification({
      id: this.notificationId,
      title: '녹음 중',
      body: `${sensorName} - ${timeText}`,
      android: {
        channelId: NotificationChannel.RECORDING,
        smallIcon: 'ic_launcher',
        color: AndroidColor.RED,
        ongoing: true, // 사용자가 스와이프로 제거할 수 없음
        asForegroundService: true, // Foreground Service
        progress: {
          indeterminate: true,
        },
        actions: [
          {
            title: '중지',
            pressAction: {
              id: 'stop-recording',
            },
          },
          {
            title: '일시정지',
            pressAction: {
              id: 'pause-recording',
            },
          },
        ],
      },
      ios: {
        sound: undefined,
      },
    });
  }

  /**
   * 녹음 시간 업데이트
   */
  private async updateRecordingTime(
    sensorName: string,
    elapsedSeconds: number
  ): Promise<void> {
    try {
      const timeText = this.formatTime(elapsedSeconds);

      await notifee.displayNotification({
        id: this.notificationId,
        title: '녹음 중',
        body: `${sensorName} - ${timeText}`,
        android: {
          channelId: NotificationChannel.RECORDING,
          smallIcon: 'ic_launcher',
          color: AndroidColor.RED,
          ongoing: true,
          asForegroundService: true,
          progress: {
            indeterminate: true,
          },
          actions: [
            {
              title: '중지',
              pressAction: {
                id: 'stop-recording',
              },
            },
            {
              title: '일시정지',
              pressAction: {
                id: 'pause-recording',
              },
            },
          ],
        },
      });
    } catch (error) {
      logger.error('Failed to update recording notification', error as Error);
    }
  }

  /**
   * 일시정지 상태 업데이트
   */
  async pauseRecordingNotification(sensorName: string): Promise<void> {
    try {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }

      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const timeText = this.formatTime(elapsed);

      await notifee.displayNotification({
        id: this.notificationId,
        title: '녹음 일시정지',
        body: `${sensorName} - ${timeText}`,
        android: {
          channelId: NotificationChannel.RECORDING,
          smallIcon: 'ic_launcher',
          color: AndroidColor.YELLOW,
          ongoing: true,
          asForegroundService: true,
          actions: [
            {
              title: '재개',
              pressAction: {
                id: 'resume-recording',
              },
            },
            {
              title: '중지',
              pressAction: {
                id: 'stop-recording',
              },
            },
          ],
        },
      });

      logger.info('Recording notification paused', { sensorName, elapsed });
    } catch (error) {
      logger.error('Failed to pause recording notification', error as Error);
    }
  }

  /**
   * 녹음 재개
   */
  async resumeRecordingNotification(sensorName: string): Promise<void> {
    try {
      // 재개 시 경과 시간 유지하며 업데이트 재시작
      const pausedElapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.startTime = Date.now() - pausedElapsed * 1000;

      await this.displayRecordingNotification(sensorName, pausedElapsed);

      this.updateInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.updateRecordingTime(sensorName, elapsed);
      }, 1000);

      logger.info('Recording notification resumed', { sensorName });
    } catch (error) {
      logger.error('Failed to resume recording notification', error as Error);
    }
  }

  /**
   * 녹음 중지 알림 제거
   */
  async stopRecordingNotification(): Promise<void> {
    try {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }

      await notificationService.cancelNotification(this.notificationId);

      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      logger.info('Recording notification stopped', { elapsed });

      // 녹음 완료 알림 표시 (선택사항)
      await this.showRecordingCompletedNotification(elapsed);
    } catch (error) {
      logger.error('Failed to stop recording notification', error as Error);
    }
  }

  /**
   * 녹음 완료 알림 표시
   */
  private async showRecordingCompletedNotification(
    elapsedSeconds: number
  ): Promise<void> {
    try {
      const timeText = this.formatTime(elapsedSeconds);

      await notificationService.displayNotification(
        '녹음 완료',
        `총 녹음 시간: ${timeText}`,
        {
          id: 'recording-completed',
          channelId: NotificationChannel.DEFAULT,
          data: {
            type: 'recording-completed',
            duration: elapsedSeconds,
          },
        }
      );
    } catch (error) {
      logger.error('Failed to show recording completed notification', error as Error);
    }
  }

  /**
   * 녹음 데이터 카운트 업데이트
   */
  async updateDataCount(
    sensorName: string,
    dataCount: number
  ): Promise<void> {
    try {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const timeText = this.formatTime(elapsed);

      await notifee.displayNotification({
        id: this.notificationId,
        title: '녹음 중',
        body: `${sensorName} - ${timeText}\n수집된 데이터: ${dataCount}개`,
        android: {
          channelId: NotificationChannel.RECORDING,
          smallIcon: 'ic_launcher',
          color: AndroidColor.RED,
          ongoing: true,
          asForegroundService: true,
          progress: {
            indeterminate: true,
          },
          actions: [
            {
              title: '중지',
              pressAction: {
                id: 'stop-recording',
              },
            },
            {
              title: '일시정지',
              pressAction: {
                id: 'pause-recording',
              },
            },
          ],
        },
      });
    } catch (error) {
      logger.error('Failed to update data count', error as Error);
    }
  }

  /**
   * 시간 포맷 (HH:MM:SS)
   */
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(secs)}`;
    }
    return `${this.pad(minutes)}:${this.pad(secs)}`;
  }

  /**
   * 숫자를 2자리로 패딩
   */
  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  /**
   * 현재 녹음 상태 확인
   */
  isRecording(): boolean {
    return this.updateInterval !== null;
  }

  /**
   * 현재 녹음 시간 (초)
   */
  getElapsedSeconds(): number {
    if (this.startTime === 0) {
      return 0;
    }
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
}

/**
 * 싱글톤 인스턴스
 */
export const recordingNotificationService = new RecordingNotificationService();
