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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

interface ServerSettings {
  url: string;
  isLoggedIn: boolean;
  username?: string;
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
  });

  // Server Settings
  const [serverSettings, setServerSettings] = useState<ServerSettings>({
    url: 'https://api.example.com',
    isLoggedIn: false,
  });

  // Data Management
  const [storageSize, setStorageSize] = useState('0 MB');

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
    // TODO: Calculate actual storage size from database
    setStorageSize('0 MB');
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
            // TODO: Clear cache
            Alert.alert('완료', '캐시가 삭제되었습니다.');
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
            // TODO: Delete all data
            Alert.alert('완료', '모든 데이터가 삭제되었습니다.');
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

      {/* Server Settings Section */}
      <View style={styles.section}>
        {renderSectionHeader('서버 설정', 'server')}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>서버 URL</Text>
          <Text style={styles.serverUrl}>{serverSettings.url}</Text>

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

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>연결 테스트</Text>
          </TouchableOpacity>

          {serverSettings.isLoggedIn && (
            <TouchableOpacity style={[styles.button, styles.logoutButton]}>
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
  bottomPadding: {
    height: 40,
  },
});

export default SettingsScreen;
