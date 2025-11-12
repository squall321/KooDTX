/**
 * SettingsScreen
 *
 * 앱 설정 화면
 * - API 설정 (서버 URL, 타임아웃, 재시도)
 * - 동기화 설정 (자동 동기화, Wi-Fi 전용, 동기화 간격)
 * - 동기화 상태 보기
 * - 설정 초기화
 */

import React, {useState, useEffect, useCallback} from 'react';
import {View, ScrollView, StyleSheet, Alert} from 'react-native';
import {
  Text,
  Card,
  TextInput,
  Button,
  Switch,
  Divider,
  SegmentedButtons,
} from 'react-native-paper';
import {getSettingsManager} from '@services/config';
import type {ApiSettings, SyncSettings} from '@services/config';
import {initializeApiClient} from '@services/api';
import {getSyncManager} from '@services/sync';
import {useNetworkStatus} from '@hooks';

export function SettingsScreen({navigation}: any) {
  const settingsManager = getSettingsManager();
  const syncManager = getSyncManager();
  const {isConnected, connectionType} = useNetworkStatus();

  // API 설정
  const [baseURL, setBaseURL] = useState('');
  const [timeout, setTimeout] = useState('30000');
  const [retryAttempts, setRetryAttempts] = useState('3');

  // 동기화 설정
  const [autoSync, setAutoSync] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [syncInterval, setSyncInterval] = useState('60000');
  const [batchSize, setBatchSize] = useState('100');

  const [isSaving, setIsSaving] = useState(false);

  // 설정 로드
  useEffect(() => {
    const loadSettings = () => {
      const settings = settingsManager.getSettings();

      // API 설정
      setBaseURL(settings.api.baseURL);
      setTimeout(settings.api.timeout.toString());
      setRetryAttempts(settings.api.retryAttempts.toString());

      // 동기화 설정
      setAutoSync(settings.sync.autoSync);
      setWifiOnly(settings.sync.wifiOnly);
      setSyncInterval(settings.sync.syncInterval.toString());
      setBatchSize(settings.sync.batchSize.toString());
    };

    loadSettings();
  }, [settingsManager]);

  // API 설정 저장
  const handleSaveApiSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      const apiSettings: ApiSettings = {
        baseURL: baseURL.trim(),
        timeout: parseInt(timeout, 10),
        retryAttempts: parseInt(retryAttempts, 10),
      };

      // 유효성 검사
      const errors = settingsManager.validateApiSettings(apiSettings);
      if (errors.length > 0) {
        Alert.alert('설정 오류', errors.join('\n'));
        return;
      }

      // 저장
      await settingsManager.saveApiSettings(apiSettings);

      // API 클라이언트 재초기화
      initializeApiClient({
        baseURL: apiSettings.baseURL,
        timeout: apiSettings.timeout,
        retryAttempts: apiSettings.retryAttempts,
      });

      Alert.alert('성공', 'API 설정이 저장되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `설정 저장 실패: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [baseURL, timeout, retryAttempts, settingsManager]);

  // 동기화 설정 저장
  const handleSaveSyncSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      const syncSettings: SyncSettings = {
        autoSync,
        wifiOnly,
        syncInterval: parseInt(syncInterval, 10),
        batchSize: parseInt(batchSize, 10),
      };

      // 유효성 검사
      const errors = settingsManager.validateSyncSettings(syncSettings);
      if (errors.length > 0) {
        Alert.alert('설정 오류', errors.join('\n'));
        return;
      }

      // 저장
      await settingsManager.saveSyncSettings(syncSettings);

      // 동기화 관리자 옵션 업데이트
      syncManager.updateOptions({
        autoSync: syncSettings.autoSync,
        wifiOnly: syncSettings.wifiOnly,
        syncInterval: syncSettings.syncInterval,
        batchSize: syncSettings.batchSize,
      });

      // 자동 동기화 설정에 따라 시작/중지
      if (syncSettings.autoSync) {
        await syncManager.start();
      } else {
        syncManager.stop();
      }

      Alert.alert('성공', '동기화 설정이 저장되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `설정 저장 실패: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [autoSync, wifiOnly, syncInterval, batchSize, settingsManager, syncManager]);

  // 설정 초기화
  const handleResetSettings = useCallback(() => {
    Alert.alert(
      '설정 초기화',
      '모든 설정을 기본값으로 초기화하시겠습니까?',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            try {
              await settingsManager.resetSettings();

              // 설정 다시 로드
              const settings = settingsManager.getSettings();
              setBaseURL(settings.api.baseURL);
              setTimeout(settings.api.timeout.toString());
              setRetryAttempts(settings.api.retryAttempts.toString());
              setAutoSync(settings.sync.autoSync);
              setWifiOnly(settings.sync.wifiOnly);
              setSyncInterval(settings.sync.syncInterval.toString());
              setBatchSize(settings.sync.batchSize.toString());

              Alert.alert('완료', '설정이 초기화되었습니다.');
            } catch (error: any) {
              Alert.alert('오류', `초기화 실패: ${error.message}`);
            }
          },
        },
      ],
    );
  }, [settingsManager]);

  // 수동 동기화
  const handleManualSync = useCallback(async () => {
    if (!isConnected) {
      Alert.alert('오류', '네트워크 연결을 확인해주세요.');
      return;
    }

    try {
      await syncManager.sync();
      Alert.alert('완료', '동기화가 완료되었습니다.');
    } catch (error: any) {
      Alert.alert('오류', `동기화 실패: ${error.message}`);
    }
  }, [syncManager, isConnected]);

  return (
    <ScrollView style={styles.container}>
      {/* 네트워크 상태 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">네트워크 상태</Text>
          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text variant="bodyMedium">연결 상태:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {isConnected ? '연결됨' : '연결 안됨'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text variant="bodyMedium">연결 타입:</Text>
            <Text variant="bodyMedium" style={styles.value}>
              {connectionType === 'wifi' && 'Wi-Fi'}
              {connectionType === 'cellular' && '모바일 데이터'}
              {connectionType === 'none' && '없음'}
              {connectionType === 'unknown' && '알 수 없음'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* API 설정 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">API 설정</Text>
          <Divider style={styles.divider} />

          <TextInput
            label="서버 URL"
            value={baseURL}
            onChangeText={setBaseURL}
            mode="outlined"
            placeholder="https://api.example.com"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            label="타임아웃 (ms)"
            value={timeout}
            onChangeText={setTimeout}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="재시도 횟수"
            value={retryAttempts}
            onChangeText={setRetryAttempts}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSaveApiSettings}
            loading={isSaving}
            disabled={isSaving}
            style={styles.button}>
            API 설정 저장
          </Button>
        </Card.Content>
      </Card>

      {/* 동기화 설정 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">동기화 설정</Text>
          <Divider style={styles.divider} />

          <View style={styles.switchRow}>
            <Text variant="bodyMedium">자동 동기화</Text>
            <Switch value={autoSync} onValueChange={setAutoSync} />
          </View>

          <View style={styles.switchRow}>
            <Text variant="bodyMedium">Wi-Fi에서만 동기화</Text>
            <Switch value={wifiOnly} onValueChange={setWifiOnly} />
          </View>

          <TextInput
            label="동기화 간격 (ms)"
            value={syncInterval}
            onChangeText={setSyncInterval}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            disabled={!autoSync}
          />

          <TextInput
            label="배치 크기"
            value={batchSize}
            onChangeText={setBatchSize}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSaveSyncSettings}
            loading={isSaving}
            disabled={isSaving}
            style={styles.button}>
            동기화 설정 저장
          </Button>
        </Card.Content>
      </Card>

      {/* 동기화 작업 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">동기화 작업</Text>
          <Divider style={styles.divider} />

          <Button
            mode="contained"
            icon="sync"
            onPress={handleManualSync}
            disabled={!isConnected}
            style={styles.button}>
            수동 동기화
          </Button>

          <Button
            mode="outlined"
            icon="chart-timeline-variant"
            onPress={() => navigation.navigate('SyncStatus')}
            style={styles.button}>
            동기화 상태 보기
          </Button>
        </Card.Content>
      </Card>

      {/* 기타 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">기타</Text>
          <Divider style={styles.divider} />

          <Button
            mode="outlined"
            icon="restore"
            onPress={handleResetSettings}
            style={styles.button}
            buttonColor="#dc3545">
            설정 초기화
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 12,
  },
  divider: {
    marginVertical: 12,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  value: {
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
