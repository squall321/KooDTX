/**
 * SettingsManager Tests
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SettingsManager, getSettingsManager} from '../SettingsManager';
import type {ApiSettings, SyncSettings} from '../SettingsManager';

describe('SettingsManager', () => {
  let settingsManager: SettingsManager;

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    // Get a fresh instance
    settingsManager = getSettingsManager();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = getSettingsManager();
      const instance2 = getSettingsManager();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize()', () => {
    it('should initialize with default settings when storage is empty', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await settingsManager.initialize();

      const settings = settingsManager.getSettings();
      expect(settings.api.baseURL).toBe('https://api.example.com');
      expect(settings.api.timeout).toBe(30000);
      expect(settings.sync.autoSync).toBe(true);
    });

    it('should load settings from storage', async () => {
      const mockApiSettings: ApiSettings = {
        baseURL: 'https://custom.api.com',
        timeout: 60000,
        retryAttempts: 5,
      };

      const mockSyncSettings: SyncSettings = {
        autoSync: false,
        wifiOnly: true,
        syncInterval: 120000,
        batchSize: 200,
      };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockApiSettings))
        .mockResolvedValueOnce(JSON.stringify(mockSyncSettings));

      await settingsManager.initialize();

      const settings = settingsManager.getSettings();
      expect(settings.api.baseURL).toBe('https://custom.api.com');
      expect(settings.api.timeout).toBe(60000);
      expect(settings.sync.autoSync).toBe(false);
      expect(settings.sync.wifiOnly).toBe(true);
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error'),
      );

      await expect(settingsManager.initialize()).resolves.not.toThrow();

      const settings = settingsManager.getSettings();
      expect(settings.api.baseURL).toBe('https://api.example.com'); // Default value
    });
  });

  describe('saveApiSettings()', () => {
    it('should save API settings to storage', async () => {
      const apiSettings: ApiSettings = {
        baseURL: 'https://new.api.com',
        timeout: 45000,
        retryAttempts: 4,
      };

      await settingsManager.saveApiSettings(apiSettings);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@koodtx:api_settings',
        JSON.stringify(apiSettings),
      );

      const settings = settingsManager.getSettings();
      expect(settings.api.baseURL).toBe('https://new.api.com');
    });

    it('should merge partial API settings', async () => {
      await settingsManager.initialize();

      await settingsManager.saveApiSettings({
        baseURL: 'https://updated.api.com',
      });

      const settings = settingsManager.getSettings();
      expect(settings.api.baseURL).toBe('https://updated.api.com');
      expect(settings.api.timeout).toBe(30000); // Unchanged
    });

    it('should throw error on storage failure', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage full'),
      );

      await expect(
        settingsManager.saveApiSettings({
          baseURL: 'https://test.com',
          timeout: 30000,
          retryAttempts: 3,
        }),
      ).rejects.toThrow('Storage full');
    });
  });

  describe('saveSyncSettings()', () => {
    it('should save sync settings to storage', async () => {
      const syncSettings: SyncSettings = {
        autoSync: true,
        wifiOnly: false,
        syncInterval: 90000,
        batchSize: 150,
      };

      await settingsManager.saveSyncSettings(syncSettings);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@koodtx:sync_settings',
        JSON.stringify(syncSettings),
      );

      const settings = settingsManager.getSettings();
      expect(settings.sync.autoSync).toBe(true);
      expect(settings.sync.batchSize).toBe(150);
    });

    it('should merge partial sync settings', async () => {
      await settingsManager.initialize();

      await settingsManager.saveSyncSettings({
        wifiOnly: true,
      });

      const settings = settingsManager.getSettings();
      expect(settings.sync.wifiOnly).toBe(true);
      expect(settings.sync.autoSync).toBe(true); // Unchanged
    });
  });

  describe('getSettings()', () => {
    it('should return default settings when not initialized', () => {
      const newManager = SettingsManager.getInstance();
      const settings = newManager.getSettings();

      expect(settings.api.baseURL).toBe('https://api.example.com');
      expect(settings.sync.autoSync).toBe(true);
    });

    it('should return a copy of settings', () => {
      const settings1 = settingsManager.getSettings();
      const settings2 = settingsManager.getSettings();

      expect(settings1).toEqual(settings2);
      expect(settings1).not.toBe(settings2); // Different objects
    });
  });

  describe('getApiSettings()', () => {
    it('should return API settings', async () => {
      await settingsManager.initialize();

      const apiSettings = settingsManager.getApiSettings();

      expect(apiSettings.baseURL).toBeDefined();
      expect(apiSettings.timeout).toBeDefined();
      expect(apiSettings.retryAttempts).toBeDefined();
    });

    it('should return a copy', () => {
      const settings1 = settingsManager.getApiSettings();
      const settings2 = settingsManager.getApiSettings();

      expect(settings1).toEqual(settings2);
      expect(settings1).not.toBe(settings2);
    });
  });

  describe('getSyncSettings()', () => {
    it('should return sync settings', async () => {
      await settingsManager.initialize();

      const syncSettings = settingsManager.getSyncSettings();

      expect(syncSettings.autoSync).toBeDefined();
      expect(syncSettings.syncInterval).toBeDefined();
      expect(syncSettings.wifiOnly).toBeDefined();
      expect(syncSettings.batchSize).toBeDefined();
    });
  });

  describe('resetSettings()', () => {
    it('should reset all settings to default', async () => {
      await settingsManager.saveApiSettings({
        baseURL: 'https://custom.com',
        timeout: 60000,
        retryAttempts: 5,
      });

      await settingsManager.resetSettings();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        '@koodtx:api_settings',
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        '@koodtx:sync_settings',
      );

      const settings = settingsManager.getSettings();
      expect(settings.api.baseURL).toBe('https://api.example.com');
    });

    it('should handle reset errors', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error('Remove failed'),
      );

      await expect(settingsManager.resetSettings()).rejects.toThrow(
        'Remove failed',
      );
    });
  });

  describe('validateApiSettings()', () => {
    it('should pass validation for valid settings', () => {
      const validSettings: ApiSettings = {
        baseURL: 'https://api.example.com',
        timeout: 30000,
        retryAttempts: 3,
      };

      const errors = settingsManager.validateApiSettings(validSettings);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation for empty baseURL', () => {
      const invalidSettings: ApiSettings = {
        baseURL: '',
        timeout: 30000,
        retryAttempts: 3,
      };

      const errors = settingsManager.validateApiSettings(invalidSettings);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('URL');
    });

    it('should fail validation for invalid URL', () => {
      const invalidSettings: ApiSettings = {
        baseURL: 'not-a-valid-url',
        timeout: 30000,
        retryAttempts: 3,
      };

      const errors = settingsManager.validateApiSettings(invalidSettings);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('URL');
    });

    it('should fail validation for invalid timeout', () => {
      const invalidSettings: ApiSettings = {
        baseURL: 'https://api.example.com',
        timeout: 500, // Less than 1000
        retryAttempts: 3,
      };

      const errors = settingsManager.validateApiSettings(invalidSettings);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('타임아웃');
    });

    it('should fail validation for invalid retry attempts', () => {
      const invalidSettings: ApiSettings = {
        baseURL: 'https://api.example.com',
        timeout: 30000,
        retryAttempts: 10, // Greater than 5
      };

      const errors = settingsManager.validateApiSettings(invalidSettings);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('재시도');
    });
  });

  describe('validateSyncSettings()', () => {
    it('should pass validation for valid settings', () => {
      const validSettings: SyncSettings = {
        autoSync: true,
        wifiOnly: false,
        syncInterval: 60000,
        batchSize: 100,
      };

      const errors = settingsManager.validateSyncSettings(validSettings);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation for invalid sync interval', () => {
      const invalidSettings: SyncSettings = {
        autoSync: true,
        wifiOnly: false,
        syncInterval: 5000, // Less than 10000
        batchSize: 100,
      };

      const errors = settingsManager.validateSyncSettings(invalidSettings);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('동기화 간격');
    });

    it('should fail validation for invalid batch size', () => {
      const invalidSettings: SyncSettings = {
        autoSync: true,
        wifiOnly: false,
        syncInterval: 60000,
        batchSize: 5, // Less than 10
      };

      const errors = settingsManager.validateSyncSettings(invalidSettings);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('배치 크기');
    });
  });
});
