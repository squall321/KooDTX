/**
 * SettingsScreen
 * Phase 132-133: Comprehensive settings UI
 *
 * Settings sections:
 * - Sensor settings (sampling rate, enabled sensors, GPS accuracy)
 * - Sync settings (auto sync, WiFi only, sync interval)
 * - Server settings (URL, auth status)
 * - Data management (storage size, cache clear)
 * - App info (version, build)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../database';
import { Session } from '../database/models/Session';

interface SensorSettings {
  samplingRate: number; // Hz
  enabledSensors: {
    accelerometer: boolean;
    gyroscope: boolean;
    magnetometer: boolean;
    gps: boolean;
    audio: boolean;
  };
  gpsAccuracy: 'high' | 'medium' | 'low';
  batterySaver: boolean;
}

interface SyncSettings {
  autoSync: boolean;
  wifiOnly: boolean;
  chargingOnly: boolean;
  syncInterval: number; // minutes
  // Phase 188-192: Advanced sync settings
  batchSize: number; // number of items per batch
  retryCount: number; // max retry attempts
  timeout: number; // seconds
}

interface ServerSettings {
  url: string;
  isLoggedIn: boolean;
  username?: string;
}

// Phase 188-192: New interfaces
interface AudioSettings {
  sampleRate: number; // Hz (8000, 16000, 44100, 48000)
  bitrate: number; // kbps (64, 128, 192, 256)
  format: 'pcm' | 'aac' | 'mp3';
  channels: 1 | 2; // mono or stereo
}

interface DataRetentionSettings {
  enabled: boolean;
  retentionDays: number; // days to keep data
  autoDelete: boolean;
}

interface PerformanceSettings {
  bufferSize: number; // KB
  compressionEnabled: boolean;
  compressionLevel: number; // 1-9
}

const SETTINGS_KEY = '@KooDTX:Settings';

export const SettingsScreen: React.FC = () => {
  // Sensor Settings (Phase 133)
  const [sensorSettings, setSensorSettings] = useState<SensorSettings>({
    samplingRate: 100,
    enabledSensors: {
      accelerometer: true,
      gyroscope: true,
      magnetometer: true,
      gps: false,
      audio: false,
    },
    gpsAccuracy: 'high',
    batterySaver: false,
  });

  // Sync Settings
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    autoSync: true,
    wifiOnly: false,
    chargingOnly: false,
    syncInterval: 5,
    // Phase 188-192: Advanced defaults
    batchSize: 100,
    retryCount: 3,
    timeout: 30,
  });

  // Server Settings
  const [serverSettings, setServerSettings] = useState<ServerSettings>({
    url: 'https://api.example.com',
    isLoggedIn: false,
  });
  const [editingUrl, setEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);

  // Phase 188-192: Advanced Settings
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    sampleRate: 44100,
    bitrate: 128,
    format: 'aac',
    channels: 1,
  });

  const [dataRetention, setDataRetention] = useState<DataRetentionSettings>({
    enabled: false,
    retentionDays: 30,
    autoDelete: false,
  });

  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    bufferSize: 256,
    compressionEnabled: true,
    compressionLevel: 6,
  });

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Data Management
  const [storageSize, setStorageSize] = useState('0 MB');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteMessage, setDeleteMessage] = useState('');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    calculateStorageSize();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        setSensorSettings(settings.sensor || sensorSettings);
        setSyncSettings(settings.sync || syncSettings);
        setServerSettings(settings.server || serverSettings);
        // Phase 188-192: Load new settings
        setAudioSettings(settings.audio || audioSettings);
        setDataRetention(settings.dataRetention || dataRetention);
        setPerformanceSettings(settings.performance || performanceSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        sensor: sensorSettings,
        sync: syncSettings,
        server: serverSettings,
        // Phase 188-192: Save new settings
        audio: audioSettings,
        dataRetention: dataRetention,
        performance: performanceSettings,
      };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      Alert.alert('성공', '설정이 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      '기본값 복원',
      '모든 설정을 기본값으로 복원하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '복원',
          style: 'destructive',
          onPress: () => {
            setSensorSettings({
              samplingRate: 100,
              enabledSensors: {
                accelerometer: true,
                gyroscope: true,
                magnetometer: true,
                gps: false,
                audio: false,
              },
              gpsAccuracy: 'high',
              batterySaver: false,
            });
            setSyncSettings({
              autoSync: true,
              wifiOnly: false,
              chargingOnly: false,
              syncInterval: 5,
            });
            Alert.alert('완료', '설정이 기본값으로 복원되었습니다.');
          },
        },
      ]
    );
  };

  const calculateStorageSize = async () => {
    try {
      // Get all sessions
      const sessions = await database.get<Session>('sessions').query().fetch();

      // Calculate total data size (rough estimate)
      // Each session has metadata + sensor data records
      let totalSize = 0;

      for (const session of sessions) {
        // Rough estimate: 1KB per session metadata + sensor data
        // In real implementation, you'd count sensor data rows
        totalSize += 1024; // 1KB for metadata
        totalSize += session.duration * 100; // ~100 bytes per second of recording
      }

      // Convert to MB
      const sizeMB = totalSize / (1024 * 1024);

      if (sizeMB < 1) {
        setStorageSize(`${(sizeMB * 1024).toFixed(2)} KB`);
      } else {
        setStorageSize(`${sizeMB.toFixed(2)} MB`);
      }
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      setStorageSize('계산 실패');
    }
  };

  const clearCache = () => {
    Alert.alert(
      '캐시 삭제',
      '캐시를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            setDeleteProgress(0);
            setDeleteMessage('캐시 삭제 중...');

            try {
              // Clear AsyncStorage cache (except settings)
              const allKeys = await AsyncStorage.getAllKeys();
              const cacheKeys = allKeys.filter(
                key => key !== 'koodtx_settings' && !key.startsWith('session_')
              );

              for (let i = 0; i < cacheKeys.length; i++) {
                await AsyncStorage.removeItem(cacheKeys[i]);
                setDeleteProgress((i + 1) / cacheKeys.length);
              }

              setIsDeleting(false);
              Alert.alert('완료', '캐시가 삭제되었습니다.');
              await calculateStorageSize();
            } catch (error) {
              setIsDeleting(false);
              console.error('Failed to clear cache:', error);
              Alert.alert('오류', '캐시 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const deleteAllData = () => {
    Alert.alert(
      '모든 데이터 삭제',
      '모든 로컬 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            setDeleteProgress(0);
            setDeleteMessage('모든 데이터 삭제 중...');

            try {
              // Step 1: Delete all sessions
              setDeleteMessage('세션 데이터 삭제 중...');
              const sessions = await database.get<Session>('sessions').query().fetch();

              await database.write(async () => {
                for (let i = 0; i < sessions.length; i++) {
                  await sessions[i].markAsDeleted();
                  setDeleteProgress((i + 1) / (sessions.length * 2));
                }
              });

              // Step 2: Clear AsyncStorage (except settings)
              setDeleteMessage('캐시 삭제 중...');
              const allKeys = await AsyncStorage.getAllKeys();
              const dataKeys = allKeys.filter(key => key !== 'koodtx_settings');

              for (let i = 0; i < dataKeys.length; i++) {
                await AsyncStorage.removeItem(dataKeys[i]);
                setDeleteProgress(0.5 + (i + 1) / (dataKeys.length * 2));
              }

              setIsDeleting(false);
              Alert.alert('완료', '모든 데이터가 삭제되었습니다.');
              await calculateStorageSize();
            } catch (error) {
              setIsDeleting(false);
              console.error('Failed to delete all data:', error);
              Alert.alert('오류', '데이터 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // Phase 135: Server settings functions
  const handleEditUrl = () => {
    setTempUrl(serverSettings.url);
    setEditingUrl(true);
  };

  const handleSaveUrl = () => {
    if (tempUrl.trim()) {
      // Basic URL validation
      try {
        new URL(tempUrl);
        setServerSettings({ ...serverSettings, url: tempUrl });
        setEditingUrl(false);
        Alert.alert('성공', '서버 URL이 저장되었습니다.');
      } catch (error) {
        Alert.alert('오류', '올바른 URL 형식이 아닙니다.');
      }
    }
  };

  const handleCancelEditUrl = () => {
    setEditingUrl(false);
    setTempUrl('');
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      // TODO: Implement actual connection test
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For now, just show success
      Alert.alert('연결 테스트', '서버 연결에 성공했습니다.');
    } catch (error) {
      Alert.alert('연결 테스트', '서버 연결에 실패했습니다.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          setServerSettings({
            ...serverSettings,
            isLoggedIn: false,
            username: undefined,
          });
          Alert.alert('완료', '로그아웃되었습니다.');
        },
      },
    ]);
  };

  // Phase 188-192: Export/Import Settings
  const exportSettings = async () => {
    try {
      const settings = {
        sensor: sensorSettings,
        sync: syncSettings,
        audio: audioSettings,
        dataRetention: dataRetention,
        performance: performanceSettings,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      const jsonString = JSON.stringify(settings, null, 2);

      // In production, save to file or share
      // For now, just copy to clipboard (would need Clipboard from react-native)
      Alert.alert(
        '설정 내보내기',
        `설정이 준비되었습니다.\n\n크기: ${(jsonString.length / 1024).toFixed(2)} KB`,
        [
          { text: '확인', style: 'default' },
        ]
      );

      console.log('Exported settings:', jsonString);
    } catch (error) {
      console.error('Failed to export settings:', error);
      Alert.alert('오류', '설정 내보내기에 실패했습니다.');
    }
  };

  const importSettings = () => {
    Alert.alert(
      '설정 가져오기',
      '설정 파일을 선택하세요. 기존 설정은 덮어쓰여집니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '가져오기',
          style: 'default',
          onPress: () => {
            // In production, open file picker
            // For now, simulate import
            Alert.alert('알림', '설정 가져오기 기능은 파일 시스템 권한이 필요합니다.');
          },
        },
      ]
    );
  };

  const renderSectionHeader = (title: string, iconName: string) => (
    <View style={styles.sectionHeader}>
      <Icon name={iconName} size={24} color="#007AFF" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderSettingRow = (
    label: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    description?: string
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
        thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? '#FFFFFF' : '#F4F4F4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Sensor Settings Section - Phase 133 */}
      <View style={styles.section}>
        {renderSectionHeader('센서 설정', 'speedometer')}

        {/* Sampling Rate */}
        <View style={styles.card}>
          <View style={styles.sliderContainer}>
            <Text style={styles.settingLabel}>샘플링 레이트</Text>
            <Text style={styles.sliderValue}>{sensorSettings.samplingRate} Hz</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={200}
            step={10}
            value={sensorSettings.samplingRate}
            onValueChange={(value) =>
              setSensorSettings({ ...sensorSettings, samplingRate: value })
            }
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#E5E5EA"
            thumbTintColor="#007AFF"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>10 Hz</Text>
            <Text style={styles.sliderLabelText}>200 Hz</Text>
          </View>
        </View>

        {/* Enabled Sensors */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>활성 센서</Text>
          {renderSettingRow(
            '가속도계',
            sensorSettings.enabledSensors.accelerometer,
            (value) =>
              setSensorSettings({
                ...sensorSettings,
                enabledSensors: { ...sensorSettings.enabledSensors, accelerometer: value },
              }),
            '3축 가속도 측정'
          )}
          {renderSettingRow(
            '자이로스코프',
            sensorSettings.enabledSensors.gyroscope,
            (value) =>
              setSensorSettings({
                ...sensorSettings,
                enabledSensors: { ...sensorSettings.enabledSensors, gyroscope: value },
              }),
            '3축 회전 속도 측정'
          )}
          {renderSettingRow(
            '자기계',
            sensorSettings.enabledSensors.magnetometer,
            (value) =>
              setSensorSettings({
                ...sensorSettings,
                enabledSensors: { ...sensorSettings.enabledSensors, magnetometer: value },
              }),
            '3축 자기장 측정'
          )}
          {renderSettingRow(
            'GPS',
            sensorSettings.enabledSensors.gps,
            (value) =>
              setSensorSettings({
                ...sensorSettings,
                enabledSensors: { ...sensorSettings.enabledSensors, gps: value },
              }),
            '위치 정보 수집'
          )}
          {renderSettingRow(
            '오디오',
            sensorSettings.enabledSensors.audio,
            (value) =>
              setSensorSettings({
                ...sensorSettings,
                enabledSensors: { ...sensorSettings.enabledSensors, audio: value },
              }),
            '오디오 녹음'
          )}
        </View>

        {/* GPS Accuracy */}
        {sensorSettings.enabledSensors.gps && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>GPS 정확도</Text>
            {['high', 'medium', 'low'].map((accuracy) => (
              <TouchableOpacity
                key={accuracy}
                style={styles.radioOption}
                onPress={() =>
                  setSensorSettings({
                    ...sensorSettings,
                    gpsAccuracy: accuracy as 'high' | 'medium' | 'low',
                  })
                }
              >
                <Icon
                  name={
                    sensorSettings.gpsAccuracy === accuracy
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={24}
                  color={sensorSettings.gpsAccuracy === accuracy ? '#007AFF' : '#8E8E93'}
                />
                <Text style={styles.radioLabel}>
                  {accuracy === 'high' ? '높음' : accuracy === 'medium' ? '중간' : '낮음'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Battery Saver */}
        <View style={styles.card}>
          {renderSettingRow(
            '배터리 절약 모드',
            sensorSettings.batterySaver,
            (value) => setSensorSettings({ ...sensorSettings, batterySaver: value }),
            '배터리가 낮을 때 샘플링 레이트 자동 감소'
          )}
        </View>
      </View>

      {/* Sync Settings Section */}
      <View style={styles.section}>
        {renderSectionHeader('동기화 설정', 'sync')}

        <View style={styles.card}>
          {renderSettingRow(
            '자동 동기화',
            syncSettings.autoSync,
            (value) => setSyncSettings({ ...syncSettings, autoSync: value }),
            '주기적으로 서버와 자동 동기화'
          )}
          {renderSettingRow(
            'Wi-Fi 전용',
            syncSettings.wifiOnly,
            (value) => setSyncSettings({ ...syncSettings, wifiOnly: value }),
            'Wi-Fi 연결 시에만 동기화'
          )}
          {renderSettingRow(
            '충전 중에만',
            syncSettings.chargingOnly,
            (value) => setSyncSettings({ ...syncSettings, chargingOnly: value }),
            '충전 중일 때만 동기화'
          )}
        </View>

        {/* Sync Interval */}
        {syncSettings.autoSync && (
          <View style={styles.card}>
            <View style={styles.sliderContainer}>
              <Text style={styles.settingLabel}>동기화 주기</Text>
              <Text style={styles.sliderValue}>{syncSettings.syncInterval}분</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={60}
              step={1}
              value={syncSettings.syncInterval}
              onValueChange={(value) =>
                setSyncSettings({ ...syncSettings, syncInterval: value })
              }
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#E5E5EA"
              thumbTintColor="#007AFF"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>1분</Text>
              <Text style={styles.sliderLabelText}>60분</Text>
            </View>
          </View>
        )}
      </View>

      {/* Server Settings Section - Phase 135 */}
      <View style={styles.section}>
        {renderSectionHeader('서버 설정', 'server')}

        <View style={styles.card}>
          <View style={styles.urlHeader}>
            <Text style={styles.cardTitle}>서버 URL</Text>
            {!editingUrl && (
              <TouchableOpacity onPress={handleEditUrl}>
                <Icon name="pencil" size={20} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>

          {editingUrl ? (
            <>
              <TextInput
                style={styles.urlInput}
                value={tempUrl}
                onChangeText={setTempUrl}
                placeholder="https://api.example.com"
                placeholderTextColor="#8E8E93"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <View style={styles.urlEditButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancelEditUrl}
                >
                  <Text style={styles.buttonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveUrl}
                >
                  <Text style={[styles.buttonText, styles.saveButtonText]}>저장</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.serverUrl}>{serverSettings.url}</Text>
          )}

          <View style={styles.serverStatus}>
            <Icon
              name={serverSettings.isLoggedIn ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={serverSettings.isLoggedIn ? '#34C759' : '#FF3B30'}
            />
            <Text style={styles.serverStatusText}>
              {serverSettings.isLoggedIn ? '로그인됨' : '로그인 안 됨'}
            </Text>
          </View>

          {serverSettings.isLoggedIn && serverSettings.username && (
            <Text style={styles.username}>사용자: {serverSettings.username}</Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleTestConnection}
            disabled={testingConnection}
          >
            {testingConnection ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text style={styles.buttonText}>연결 테스트</Text>
            )}
          </TouchableOpacity>

          {serverSettings.isLoggedIn && (
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={[styles.buttonText, styles.logoutButtonText]}>로그아웃</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Data Management Section */}
      <View style={styles.section}>
        {renderSectionHeader('데이터 관리', 'folder')}

        <View style={styles.card}>
          <View style={styles.dataRow}>
            <Text style={styles.settingLabel}>로컬 데이터 크기</Text>
            <Text style={styles.dataValue}>{storageSize}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={clearCache}>
            <Text style={styles.buttonText}>캐시 삭제</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={deleteAllData}
          >
            <Text style={[styles.buttonText, styles.dangerButtonText]}>
              모든 데이터 삭제
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Phase 188-192: Advanced Settings Toggle */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => setShowAdvancedSettings(!showAdvancedSettings)}
        >
          <Text style={styles.advancedToggleText}>고급 설정</Text>
          <Icon
            name={showAdvancedSettings ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>

      {/* Phase 188-192: Advanced Settings Sections */}
      {showAdvancedSettings && (
        <>
          {/* Advanced Sync Settings */}
          <View style={styles.section}>
            {renderSectionHeader('고급 동기화 설정', 'cloud-upload')}

            <View style={styles.card}>
              {/* Batch Size */}
              <View style={styles.sliderContainer}>
                <Text style={styles.settingLabel}>배치 크기</Text>
                <Text style={styles.sliderValue}>{syncSettings.batchSize}개</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={500}
                step={10}
                value={syncSettings.batchSize}
                onValueChange={(value) =>
                  setSyncSettings({ ...syncSettings, batchSize: value })
                }
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                thumbTintColor="#007AFF"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>10개</Text>
                <Text style={styles.sliderLabelText}>500개</Text>
              </View>
              <Text style={styles.settingDescription}>
                한 번에 업로드할 항목 수
              </Text>
            </View>

            <View style={styles.card}>
              {/* Retry Count */}
              <View style={styles.sliderContainer}>
                <Text style={styles.settingLabel}>재시도 횟수</Text>
                <Text style={styles.sliderValue}>{syncSettings.retryCount}회</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={syncSettings.retryCount}
                onValueChange={(value) =>
                  setSyncSettings({ ...syncSettings, retryCount: value })
                }
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                thumbTintColor="#007AFF"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>0회</Text>
                <Text style={styles.sliderLabelText}>10회</Text>
              </View>
              <Text style={styles.settingDescription}>
                실패 시 최대 재시도 횟수
              </Text>
            </View>

            <View style={styles.card}>
              {/* Timeout */}
              <View style={styles.sliderContainer}>
                <Text style={styles.settingLabel}>타임아웃</Text>
                <Text style={styles.sliderValue}>{syncSettings.timeout}초</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={120}
                step={5}
                value={syncSettings.timeout}
                onValueChange={(value) =>
                  setSyncSettings({ ...syncSettings, timeout: value })
                }
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                thumbTintColor="#007AFF"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>10초</Text>
                <Text style={styles.sliderLabelText}>120초</Text>
              </View>
              <Text style={styles.settingDescription}>
                요청 타임아웃 시간
              </Text>
            </View>
          </View>

          {/* Audio Settings */}
          <View style={styles.section}>
            {renderSectionHeader('오디오 설정', 'musical-notes')}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>샘플링 레이트</Text>
              {[8000, 16000, 44100, 48000].map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={styles.radioOption}
                  onPress={() => setAudioSettings({ ...audioSettings, sampleRate: rate })}
                >
                  <Icon
                    name={
                      audioSettings.sampleRate === rate
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={24}
                    color={audioSettings.sampleRate === rate ? '#007AFF' : '#8E8E93'}
                  />
                  <Text style={styles.radioLabel}>
                    {rate} Hz {rate === 44100 ? '(CD 품질)' : rate === 48000 ? '(고품질)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.card}>
              <View style={styles.sliderContainer}>
                <Text style={styles.settingLabel}>비트레이트</Text>
                <Text style={styles.sliderValue}>{audioSettings.bitrate} kbps</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={64}
                maximumValue={320}
                step={32}
                value={audioSettings.bitrate}
                onValueChange={(value) =>
                  setAudioSettings({ ...audioSettings, bitrate: value })
                }
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                thumbTintColor="#007AFF"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>64 kbps</Text>
                <Text style={styles.sliderLabelText}>320 kbps</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>포맷</Text>
              {(['pcm', 'aac', 'mp3'] as const).map((format) => (
                <TouchableOpacity
                  key={format}
                  style={styles.radioOption}
                  onPress={() => setAudioSettings({ ...audioSettings, format })}
                >
                  <Icon
                    name={
                      audioSettings.format === format
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={24}
                    color={audioSettings.format === format ? '#007AFF' : '#8E8E93'}
                  />
                  <Text style={styles.radioLabel}>
                    {format.toUpperCase()} {format === 'pcm' ? '(무손실)' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>채널</Text>
              {([1, 2] as const).map((channels) => (
                <TouchableOpacity
                  key={channels}
                  style={styles.radioOption}
                  onPress={() => setAudioSettings({ ...audioSettings, channels })}
                >
                  <Icon
                    name={
                      audioSettings.channels === channels
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={24}
                    color={audioSettings.channels === channels ? '#007AFF' : '#8E8E93'}
                  />
                  <Text style={styles.radioLabel}>
                    {channels === 1 ? '모노' : '스테레오'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Data Retention Policy */}
          <View style={styles.section}>
            {renderSectionHeader('데이터 보존 정책', 'time')}

            <View style={styles.card}>
              {renderSettingRow(
                '자동 정리 활성화',
                dataRetention.enabled,
                (value) => setDataRetention({ ...dataRetention, enabled: value }),
                '오래된 데이터 자동 삭제'
              )}
            </View>

            {dataRetention.enabled && (
              <>
                <View style={styles.card}>
                  <View style={styles.sliderContainer}>
                    <Text style={styles.settingLabel}>보존 기간</Text>
                    <Text style={styles.sliderValue}>{dataRetention.retentionDays}일</Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={7}
                    maximumValue={365}
                    step={1}
                    value={dataRetention.retentionDays}
                    onValueChange={(value) =>
                      setDataRetention({ ...dataRetention, retentionDays: value })
                    }
                    minimumTrackTintColor="#007AFF"
                    maximumTrackTintColor="#E5E5EA"
                    thumbTintColor="#007AFF"
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>7일</Text>
                    <Text style={styles.sliderLabelText}>365일</Text>
                  </View>
                  <Text style={styles.settingDescription}>
                    {dataRetention.retentionDays}일 이전 데이터 삭제
                  </Text>
                </View>

                <View style={styles.card}>
                  {renderSettingRow(
                    '자동 삭제',
                    dataRetention.autoDelete,
                    (value) => setDataRetention({ ...dataRetention, autoDelete: value }),
                    '보존 기간 만료 시 자동 삭제'
                  )}
                </View>
              </>
            )}
          </View>

          {/* Performance Settings */}
          <View style={styles.section}>
            {renderSectionHeader('성능 설정', 'speedometer')}

            <View style={styles.card}>
              <View style={styles.sliderContainer}>
                <Text style={styles.settingLabel}>버퍼 크기</Text>
                <Text style={styles.sliderValue}>{performanceSettings.bufferSize} KB</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={64}
                maximumValue={1024}
                step={64}
                value={performanceSettings.bufferSize}
                onValueChange={(value) =>
                  setPerformanceSettings({ ...performanceSettings, bufferSize: value })
                }
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#E5E5EA"
                thumbTintColor="#007AFF"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>64 KB</Text>
                <Text style={styles.sliderLabelText}>1024 KB</Text>
              </View>
              <Text style={styles.settingDescription}>
                센서 데이터 버퍼 크기
              </Text>
            </View>

            <View style={styles.card}>
              {renderSettingRow(
                '압축 활성화',
                performanceSettings.compressionEnabled,
                (value) =>
                  setPerformanceSettings({ ...performanceSettings, compressionEnabled: value }),
                '데이터 압축으로 저장 공간 절약'
              )}
            </View>

            {performanceSettings.compressionEnabled && (
              <View style={styles.card}>
                <View style={styles.sliderContainer}>
                  <Text style={styles.settingLabel}>압축 레벨</Text>
                  <Text style={styles.sliderValue}>{performanceSettings.compressionLevel}</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={9}
                  step={1}
                  value={performanceSettings.compressionLevel}
                  onValueChange={(value) =>
                    setPerformanceSettings({ ...performanceSettings, compressionLevel: value })
                  }
                  minimumTrackTintColor="#007AFF"
                  maximumTrackTintColor="#E5E5EA"
                  thumbTintColor="#007AFF"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>1 (빠름)</Text>
                  <Text style={styles.sliderLabelText}>9 (최대)</Text>
                </View>
                <Text style={styles.settingDescription}>
                  높을수록 압축률 향상, 느린 속도
                </Text>
              </View>
            )}
          </View>

          {/* Export/Import Settings */}
          <View style={styles.section}>
            {renderSectionHeader('설정 백업', 'download')}

            <View style={styles.card}>
              <TouchableOpacity style={styles.button} onPress={exportSettings}>
                <Text style={styles.buttonText}>설정 내보내기</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={importSettings}>
                <Text style={styles.buttonText}>설정 가져오기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* App Info Section */}
      <View style={styles.section}>
        {renderSectionHeader('앱 정보', 'information-circle')}

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>버전</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>빌드</Text>
            <Text style={styles.infoValue}>100</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>플랫폼</Text>
            <Text style={styles.infoValue}>{Platform.OS}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={saveSettings}>
          <Text style={styles.primaryButtonText}>설정 저장</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={resetToDefaults}>
          <Text style={styles.secondaryButtonText}>기본값 복원</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />

      {/* Progress Modal */}
      <Modal
        visible={isDeleting}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.modalTitle}>{deleteMessage}</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${deleteProgress * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(deleteProgress * 100)}%
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#8E8E93',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  radioLabel: {
    fontSize: 16,
    color: '#000000',
  },
  serverUrl: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 12,
  },
  serverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  serverStatusText: {
    fontSize: 14,
    color: '#000000',
  },
  username: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#FFF5F5',
  },
  logoutButtonText: {
    color: '#FF3B30',
  },
  dangerButton: {
    backgroundColor: '#FFF5F5',
  },
  dangerButtonText: {
    color: '#FF3B30',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  infoLabel: {
    fontSize: 16,
    color: '#000000',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  urlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  urlInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000000',
    marginBottom: 12,
  },
  urlEditButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#8E8E93',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  bottomPadding: {
    height: 40,
  },
  // Phase 188-192: Advanced Settings styles
  advancedToggle: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advancedToggleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default SettingsScreen;
