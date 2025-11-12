/**
 * SettingsManager
 *
 * 앱 설정 관리 서비스
 * - AsyncStorage를 사용한 설정 저장/로드
 * - API 설정 (서버 URL, 타임아웃)
 * - 동기화 설정 (자동 동기화, Wi-Fi 전용, 동기화 간격)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API 설정
 */
export interface ApiSettings {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
}

/**
 * 동기화 설정
 */
export interface SyncSettings {
  autoSync: boolean;
  syncInterval: number;
  wifiOnly: boolean;
  batchSize: number;
}

/**
 * 앱 설정
 */
export interface AppSettings {
  api: ApiSettings;
  sync: SyncSettings;
}

/**
 * 기본 설정
 */
const DEFAULT_SETTINGS: AppSettings = {
  api: {
    baseURL: 'https://api.example.com',
    timeout: 30000,
    retryAttempts: 3,
  },
  sync: {
    autoSync: true,
    syncInterval: 60000, // 1분
    wifiOnly: false,
    batchSize: 100,
  },
};

/**
 * AsyncStorage 키
 */
const STORAGE_KEYS = {
  API_SETTINGS: '@koodtx:api_settings',
  SYNC_SETTINGS: '@koodtx:sync_settings',
};

/**
 * 설정 관리자 클래스 (Singleton)
 */
export class SettingsManager {
  private static instance: SettingsManager;
  private settings: AppSettings;
  private isInitialized: boolean = false;

  private constructor() {
    this.settings = DEFAULT_SETTINGS;
  }

  /**
   * Singleton 인스턴스 가져오기
   */
  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  /**
   * 초기화 (AsyncStorage에서 설정 로드)
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const [apiSettings, syncSettings] = await Promise.all([
        this.loadApiSettings(),
        this.loadSyncSettings(),
      ]);

      if (apiSettings) {
        this.settings.api = apiSettings;
      }

      if (syncSettings) {
        this.settings.sync = syncSettings;
      }

      this.isInitialized = true;
      console.log('[SettingsManager] Initialized with settings:', this.settings);
    } catch (error) {
      console.error('[SettingsManager] Failed to initialize:', error);
      // 기본 설정 사용
      this.settings = DEFAULT_SETTINGS;
      this.isInitialized = true;
    }
  }

  /**
   * API 설정 로드
   */
  private async loadApiSettings(): Promise<ApiSettings | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.API_SETTINGS);
      if (json) {
        return JSON.parse(json);
      }
    } catch (error) {
      console.error('[SettingsManager] Failed to load API settings:', error);
    }
    return null;
  }

  /**
   * 동기화 설정 로드
   */
  private async loadSyncSettings(): Promise<SyncSettings | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_SETTINGS);
      if (json) {
        return JSON.parse(json);
      }
    } catch (error) {
      console.error('[SettingsManager] Failed to load sync settings:', error);
    }
    return null;
  }

  /**
   * API 설정 저장
   */
  public async saveApiSettings(settings: Partial<ApiSettings>): Promise<void> {
    try {
      this.settings.api = {
        ...this.settings.api,
        ...settings,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.API_SETTINGS,
        JSON.stringify(this.settings.api),
      );

      console.log('[SettingsManager] API settings saved:', this.settings.api);
    } catch (error) {
      console.error('[SettingsManager] Failed to save API settings:', error);
      throw error;
    }
  }

  /**
   * 동기화 설정 저장
   */
  public async saveSyncSettings(settings: Partial<SyncSettings>): Promise<void> {
    try {
      this.settings.sync = {
        ...this.settings.sync,
        ...settings,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.SYNC_SETTINGS,
        JSON.stringify(this.settings.sync),
      );

      console.log('[SettingsManager] Sync settings saved:', this.settings.sync);
    } catch (error) {
      console.error('[SettingsManager] Failed to save sync settings:', error);
      throw error;
    }
  }

  /**
   * 전체 설정 가져오기
   */
  public getSettings(): AppSettings {
    if (!this.isInitialized) {
      console.warn('[SettingsManager] Not initialized, returning default settings');
      return DEFAULT_SETTINGS;
    }
    return { ...this.settings };
  }

  /**
   * API 설정 가져오기
   */
  public getApiSettings(): ApiSettings {
    return { ...this.settings.api };
  }

  /**
   * 동기화 설정 가져오기
   */
  public getSyncSettings(): SyncSettings {
    return { ...this.settings.sync };
  }

  /**
   * 설정 초기화 (기본값으로 리셋)
   */
  public async resetSettings(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.API_SETTINGS),
        AsyncStorage.removeItem(STORAGE_KEYS.SYNC_SETTINGS),
      ]);

      this.settings = DEFAULT_SETTINGS;
      console.log('[SettingsManager] Settings reset to default');
    } catch (error) {
      console.error('[SettingsManager] Failed to reset settings:', error);
      throw error;
    }
  }

  /**
   * 설정 유효성 검사
   */
  public validateApiSettings(settings: ApiSettings): string[] {
    const errors: string[] = [];

    if (!settings.baseURL) {
      errors.push('API URL은 필수입니다.');
    } else if (!this.isValidUrl(settings.baseURL)) {
      errors.push('유효한 URL을 입력해주세요.');
    }

    if (settings.timeout < 1000 || settings.timeout > 60000) {
      errors.push('타임아웃은 1초에서 60초 사이여야 합니다.');
    }

    if (settings.retryAttempts < 0 || settings.retryAttempts > 5) {
      errors.push('재시도 횟수는 0에서 5 사이여야 합니다.');
    }

    return errors;
  }

  /**
   * URL 유효성 검사
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 동기화 설정 유효성 검사
   */
  public validateSyncSettings(settings: SyncSettings): string[] {
    const errors: string[] = [];

    if (settings.syncInterval < 10000 || settings.syncInterval > 3600000) {
      errors.push('동기화 간격은 10초에서 1시간 사이여야 합니다.');
    }

    if (settings.batchSize < 10 || settings.batchSize > 1000) {
      errors.push('배치 크기는 10에서 1000 사이여야 합니다.');
    }

    return errors;
  }
}

/**
 * 설정 관리자 인스턴스 가져오기
 */
export function getSettingsManager(): SettingsManager {
  return SettingsManager.getInstance();
}
