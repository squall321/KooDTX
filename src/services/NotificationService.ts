import notifee, {
  AndroidImportance,
  AndroidStyle,
  AuthorizationStatus,
  EventType,
  Notification,
} from '@notifee/react-native';
import { Platform, PermissionsAndroid } from 'react-native';
import { logger } from '../utils/logger';

/**
 * 알림 채널 ID
 */
export enum NotificationChannel {
  DEFAULT = 'default',
  IMPORTANT = 'important',
  FOREGROUND_SERVICE = 'foreground-service',
  SYNC = 'sync',
  RECORDING = 'recording',
}

/**
 * 알림 서비스
 * Notifee를 사용한 로컬 알림 관리
 */
class NotificationService {
  private initialized = false;

  /**
   * 알림 서비스 초기화
   * 앱 시작 시 호출하여 채널 생성 및 이벤트 리스너 등록
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 알림 채널 생성 (Android)
      await this.createChannels();

      // 권한 요청
      await this.requestPermission();

      this.initialized = true;
      logger.info('Notification service initialized');
    } catch (error) {
      logger.error('Failed to initialize notification service', error as Error);
      throw error;
    }
  }

  /**
   * 알림 채널 생성 (Android)
   */
  private async createChannels(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    await Promise.all([
      // 기본 채널
      notifee.createChannel({
        id: NotificationChannel.DEFAULT,
        name: 'General Notifications',
        importance: AndroidImportance.DEFAULT,
        sound: 'default',
        vibration: true,
      }),

      // 중요한 알림
      notifee.createChannel({
        id: NotificationChannel.IMPORTANT,
        name: 'Important Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      }),

      // Foreground Service
      notifee.createChannel({
        id: NotificationChannel.FOREGROUND_SERVICE,
        name: 'Background Services',
        importance: AndroidImportance.LOW,
        sound: undefined,
        vibration: false,
      }),

      // 동기화 알림
      notifee.createChannel({
        id: NotificationChannel.SYNC,
        name: 'Synchronization',
        importance: AndroidImportance.DEFAULT,
        sound: 'default',
      }),

      // 녹음 알림
      notifee.createChannel({
        id: NotificationChannel.RECORDING,
        name: 'Recording Status',
        importance: AndroidImportance.LOW,
        sound: undefined,
        vibration: false,
      }),
    ]);

    logger.debug('Notification channels created');
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    try {
      // iOS
      if (Platform.OS === 'ios') {
        const settings = await notifee.requestPermission();
        const granted = settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
        logger.info('iOS notification permission', { granted });
        return granted;
      }

      // Android 13+
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        logger.info('Android notification permission', { granted: hasPermission });
        return hasPermission;
      }

      // Android < 13
      return true;
    } catch (error) {
      logger.error('Failed to request notification permission', error as Error);
      return false;
    }
  }

  /**
   * 알림 권한 상태 확인
   */
  async checkPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const settings = await notifee.getNotificationSettings();
        return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
      }

      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted;
      }

      return true;
    } catch (error) {
      logger.error('Failed to check notification permission', error as Error);
      return false;
    }
  }

  /**
   * 기본 알림 표시
   */
  async displayNotification(
    title: string,
    body: string,
    options?: {
      id?: string;
      channelId?: NotificationChannel;
      data?: Record<string, any>;
    }
  ): Promise<string> {
    try {
      const notificationId = await notifee.displayNotification({
        id: options?.id,
        title,
        body,
        data: options?.data,
        android: {
          channelId: options?.channelId || NotificationChannel.DEFAULT,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      });

      logger.debug('Notification displayed', { id: notificationId, title });
      return notificationId;
    } catch (error) {
      logger.error('Failed to display notification', error as Error, { title, body });
      throw error;
    }
  }

  /**
   * 이미지가 포함된 리치 알림 표시
   */
  async displayRichNotification(
    title: string,
    body: string,
    imageUrl: string,
    options?: {
      id?: string;
      channelId?: NotificationChannel;
      actions?: Array<{ id: string; title: string }>;
    }
  ): Promise<string> {
    try {
      const notificationId = await notifee.displayNotification({
        id: options?.id,
        title,
        body,
        android: {
          channelId: options?.channelId || NotificationChannel.DEFAULT,
          smallIcon: 'ic_launcher',
          style: {
            type: AndroidStyle.BIGPICTURE,
            picture: imageUrl,
          },
          actions: options?.actions?.map((action) => ({
            title: action.title,
            pressAction: { id: action.id },
          })),
        },
        ios: {
          attachments: [{ url: imageUrl }],
        },
      });

      logger.debug('Rich notification displayed', { id: notificationId, title });
      return notificationId;
    } catch (error) {
      logger.error('Failed to display rich notification', error as Error);
      throw error;
    }
  }

  /**
   * 진행률 알림 표시
   */
  async displayProgressNotification(
    title: string,
    body: string,
    progress: { current: number; max: number },
    options?: {
      id?: string;
      channelId?: NotificationChannel;
      indeterminate?: boolean;
    }
  ): Promise<string> {
    try {
      const notificationId = await notifee.displayNotification({
        id: options?.id,
        title,
        body,
        android: {
          channelId: options?.channelId || NotificationChannel.DEFAULT,
          smallIcon: 'ic_launcher',
          progress: {
            max: progress.max,
            current: progress.current,
            indeterminate: options?.indeterminate || false,
          },
          onlyAlertOnce: true,
        },
      });

      return notificationId;
    } catch (error) {
      logger.error('Failed to display progress notification', error as Error);
      throw error;
    }
  }

  /**
   * 알림 업데이트
   */
  async updateNotification(
    id: string,
    updates: Partial<Notification>
  ): Promise<void> {
    try {
      await notifee.displayNotification({
        id,
        ...updates,
      } as Notification);

      logger.debug('Notification updated', { id });
    } catch (error) {
      logger.error('Failed to update notification', error as Error, { id });
      throw error;
    }
  }

  /**
   * 알림 취소
   */
  async cancelNotification(id: string): Promise<void> {
    try {
      await notifee.cancelNotification(id);
      logger.debug('Notification cancelled', { id });
    } catch (error) {
      logger.error('Failed to cancel notification', error as Error, { id });
    }
  }

  /**
   * 모든 알림 취소
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      logger.debug('All notifications cancelled');
    } catch (error) {
      logger.error('Failed to cancel all notifications', error as Error);
    }
  }

  /**
   * 표시된 알림 목록 조회
   */
  async getDisplayedNotifications(): Promise<Notification[]> {
    try {
      const notifications = await notifee.getDisplayedNotifications();
      return notifications.map((n) => n.notification);
    } catch (error) {
      logger.error('Failed to get displayed notifications', error as Error);
      return [];
    }
  }

  /**
   * Foreground 이벤트 리스너 등록
   */
  onForegroundEvent(
    handler: (event: { type: EventType; detail: any }) => void
  ): () => void {
    return notifee.onForegroundEvent(handler);
  }
}

/**
 * 싱글톤 인스턴스
 */
export const notificationService = new NotificationService();

/**
 * Background 이벤트 핸들러
 * index.js에서 호출
 */
export const setupBackgroundNotificationHandler = () => {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification, pressAction } = detail;

    logger.info('Background notification event', {
      type: EventType[type],
      notificationId: notification?.id,
      actionId: pressAction?.id,
    });

    switch (type) {
      case EventType.PRESS:
        // 알림 클릭 시 처리
        logger.debug('Background notification pressed', { id: notification?.id });
        break;

      case EventType.ACTION_PRESS:
        // 액션 버튼 클릭 시 처리
        logger.debug('Background notification action pressed', {
          id: notification?.id,
          action: pressAction?.id,
        });
        break;

      case EventType.DISMISSED:
        // 알림 삭제 시 처리
        logger.debug('Background notification dismissed', { id: notification?.id });
        break;
    }
  });
};
