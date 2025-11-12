/**
 * SyncManager
 *
 * 데이터 동기화 관리자
 * - 네트워크 상태 감지
 * - 업로드되지 않은 데이터 찾기
 * - 업로드 큐에 추가
 * - 업로드 완료 후 데이터베이스 업데이트
 */

import NetInfo, {NetInfoSubscription} from '@react-native-community/netinfo';
import {
  getRecordingSessionRepository,
  getSensorDataRepository,
  getAudioRecordingRepository,
} from '@database/repositories';
import {getUploadQueue, UploadTaskType, UploadTask} from './UploadQueue';
import {getApiClient} from '../api/ApiClient';
import type {RecordingSession, SensorDataRecord, AudioRecording} from '@database/models';
import RNFS from 'react-native-fs';

/**
 * 동기화 옵션
 */
export interface SyncOptions {
  autoSync?: boolean; // 자동 동기화 여부
  syncInterval?: number; // 동기화 간격 (ms)
  wifiOnly?: boolean; // Wi-Fi에서만 동기화
  batchSize?: number; // 배치 크기
}

/**
 * 동기화 상태
 */
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingSessions: number;
  pendingSensorData: number;
  pendingAudioFiles: number;
}

/**
 * 동기화 관리자 클래스 (Singleton)
 */
export class SyncManager {
  private static instance: SyncManager;
  private options: Required<SyncOptions>;
  private isSyncing: boolean = false;
  private lastSyncTime: number | null = null;
  private syncIntervalId: NodeJS.Timeout | null = null;
  private netInfoUnsubscribe: NetInfoSubscription | null = null;
  private sessionRepo = getRecordingSessionRepository();
  private dataRepo = getSensorDataRepository();
  private audioRepo = getAudioRecordingRepository();
  private uploadQueue = getUploadQueue();
  private apiClient = getApiClient();

  private constructor(options: SyncOptions = {}) {
    this.options = {
      autoSync: options.autoSync ?? true,
      syncInterval: options.syncInterval ?? 60000, // 1분
      wifiOnly: options.wifiOnly ?? false,
      batchSize: options.batchSize ?? 100,
    };

    this.setupUploadHandlers();
  }

  /**
   * Singleton 인스턴스 가져오기
   */
  public static getInstance(options?: SyncOptions): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager(options);
    }
    return SyncManager.instance;
  }

  /**
   * 업로드 핸들러 설정
   */
  private setupUploadHandlers(): void {
    // 세션 업로드 핸들러
    this.uploadQueue.registerHandler(
      UploadTaskType.SESSION,
      this.handleSessionUpload.bind(this),
    );

    // 센서 데이터 업로드 핸들러
    this.uploadQueue.registerHandler(
      UploadTaskType.SENSOR_DATA,
      this.handleSensorDataUpload.bind(this),
    );

    // 오디오 파일 업로드 핸들러
    this.uploadQueue.registerHandler(
      UploadTaskType.AUDIO_FILE,
      this.handleAudioFileUpload.bind(this),
    );
  }

  /**
   * 세션 업로드 핸들러
   */
  private async handleSessionUpload(task: UploadTask): Promise<void> {
    const session: RecordingSession = task.data;

    const response = await this.apiClient.post('/sessions', {
      sessionId: session.sessionId,
      startTime: session.startTime,
      endTime: session.endTime,
      enabledSensors: session.enabledSensors,
      sampleRate: session.sampleRate,
      notes: session.notes,
      isActive: session.isActive,
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to upload session');
    }

    // 업로드 완료 표시
    await this.sessionRepo.markAsUploaded([session.id]);
  }

  /**
   * 센서 데이터 업로드 핸들러
   */
  private async handleSensorDataUpload(task: UploadTask): Promise<void> {
    const {sessionId, data} = task.data as {
      sessionId: string;
      data: SensorDataRecord[];
    };

    const response = await this.apiClient.post(`/sessions/${sessionId}/sensor-data`, {
      data: data.map((record) => ({
        timestamp: record.timestamp,
        sensorType: record.sensorType,
        x: record.x,
        y: record.y,
        z: record.z,
        latitude: record.latitude,
        longitude: record.longitude,
        altitude: record.altitude,
        accuracy: record.accuracy,
        speed: record.speed,
        heading: record.heading,
      })),
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to upload sensor data');
    }

    // 업로드 완료 표시
    const ids = data.map((record) => record.id);
    await this.dataRepo.markAsUploaded(ids);
  }

  /**
   * 오디오 파일 업로드 핸들러
   */
  private async handleAudioFileUpload(task: UploadTask): Promise<void> {
    const audioRecording: AudioRecording = task.data;

    // 파일 존재 확인
    const fileExists = await RNFS.exists(audioRecording.filePath);
    if (!fileExists) {
      throw new Error('Audio file not found');
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('sessionId', audioRecording.sessionId);
    formData.append('timestamp', audioRecording.timestamp.toString());
    formData.append('duration', audioRecording.duration.toString());
    formData.append('sampleRate', audioRecording.sampleRate.toString());
    formData.append('channels', audioRecording.channels.toString());
    formData.append('format', audioRecording.format);
    formData.append('file', {
      uri: `file://${audioRecording.filePath}`,
      type: 'audio/m4a',
      name: audioRecording.filePath.split('/').pop(),
    } as any);

    // 파일 업로드
    const response = await this.apiClient.uploadFile(
      `/sessions/${audioRecording.sessionId}/audio`,
      formData,
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to upload audio file');
    }

    // 업로드 URL 저장
    await this.audioRepo.markAsUploaded([audioRecording.id]);
  }

  /**
   * 동기화 시작
   */
  public async start(): Promise<void> {
    if (this.options.autoSync) {
      // 네트워크 상태 감지 시작
      this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
        const isConnected = state.isConnected ?? false;
        const isWifi = state.type === 'wifi';

        // Wi-Fi 전용 모드인 경우
        if (this.options.wifiOnly && !isWifi) {
          console.log('[SyncManager] Waiting for Wi-Fi connection');
          return;
        }

        // 연결 상태가 변경되면 동기화 시도
        if (isConnected && !this.isSyncing) {
          this.sync();
        }
      });

      // 주기적 동기화 시작
      this.syncIntervalId = setInterval(() => {
        this.sync();
      }, this.options.syncInterval);

      // 즉시 동기화 시도
      await this.sync();
    }
  }

  /**
   * 동기화 중지
   */
  public stop(): void {
    // 네트워크 감지 중지
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }

    // 주기적 동기화 중지
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  /**
   * 동기화 실행
   */
  public async sync(): Promise<void> {
    if (this.isSyncing) {
      console.log('[SyncManager] Already syncing');
      return;
    }

    this.isSyncing = true;
    console.log('[SyncManager] Starting sync');

    try {
      // 네트워크 연결 확인
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('[SyncManager] No network connection');
        return;
      }

      // Wi-Fi 전용 모드 확인
      if (this.options.wifiOnly && netInfo.type !== 'wifi') {
        console.log('[SyncManager] Waiting for Wi-Fi connection');
        return;
      }

      // 1. 업로드되지 않은 세션 찾기
      await this.syncSessions();

      // 2. 업로드되지 않은 센서 데이터 찾기
      await this.syncSensorData();

      // 3. 업로드되지 않은 오디오 파일 찾기
      await this.syncAudioFiles();

      this.lastSyncTime = Date.now();
      console.log('[SyncManager] Sync completed');
    } catch (error) {
      console.error('[SyncManager] Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * 세션 동기화
   */
  private async syncSessions(): Promise<void> {
    const sessions = await this.sessionRepo.findUnuploaded();
    console.log(`[SyncManager] Found ${sessions.length} sessions to upload`);

    for (const session of sessions) {
      await this.uploadQueue.addTask(UploadTaskType.SESSION, session);
    }
  }

  /**
   * 센서 데이터 동기화
   */
  private async syncSensorData(): Promise<void> {
    const allData = await this.dataRepo.findUnuploaded();
    console.log(`[SyncManager] Found ${allData.length} sensor data records to upload`);

    // 세션별로 그룹화
    const groupedData = allData.reduce(
      (acc, record) => {
        if (!acc[record.sessionId]) {
          acc[record.sessionId] = [];
        }
        acc[record.sessionId].push(record);
        return acc;
      },
      {} as Record<string, SensorDataRecord[]>,
    );

    // 세션별로 배치 업로드
    for (const [sessionId, data] of Object.entries(groupedData)) {
      // 배치로 나누기
      for (let i = 0; i < data.length; i += this.options.batchSize) {
        const batch = data.slice(i, i + this.options.batchSize);
        await this.uploadQueue.addTask(UploadTaskType.SENSOR_DATA, {
          sessionId,
          data: batch,
        });
      }
    }
  }

  /**
   * 오디오 파일 동기화
   */
  private async syncAudioFiles(): Promise<void> {
    const audioFiles = await this.audioRepo.findNotUploaded();
    console.log(`[SyncManager] Found ${audioFiles.length} audio files to upload`);

    for (const audioFile of audioFiles) {
      await this.uploadQueue.addTask(UploadTaskType.AUDIO_FILE, audioFile);
    }
  }

  /**
   * 동기화 상태 가져오기
   */
  public async getStatus(): Promise<SyncStatus> {
    const [sessions, sensorData, audioFiles] = await Promise.all([
      this.sessionRepo.findUnuploaded(),
      this.dataRepo.findUnuploaded(),
      this.audioRepo.findNotUploaded(),
    ]);

    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      pendingSessions: sessions.length,
      pendingSensorData: sensorData.length,
      pendingAudioFiles: audioFiles.length,
    };
  }

  /**
   * 옵션 업데이트
   */
  public updateOptions(options: Partial<SyncOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };
  }
}

/**
 * 동기화 관리자 인스턴스 가져오기
 */
export function getSyncManager(): SyncManager {
  return SyncManager.getInstance();
}

/**
 * 동기화 관리자 초기화
 */
export function initializeSyncManager(options: SyncOptions): SyncManager {
  return SyncManager.getInstance(options);
}
