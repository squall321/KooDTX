/**
 * KooDTX React Native App
 */

import React, {useEffect, useState} from 'react';
import {StatusBar, useColorScheme, View, ActivityIndicator, Text, StyleSheet} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {getTheme} from '@config/theme';
import {RecordingScreen} from '@screens';
import {HistoryStack} from '@navigation/HistoryStack';
import {SettingsStack} from '@navigation/SettingsStack';
import {getSettingsManager} from '@services/config';
import {initializeApiClient} from '@services/api';
import {initializeSyncManager} from '@services/sync';

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = getTheme(isDarkMode);
  const [isInitialized, setIsInitialized] = useState(false);

  // 앱 초기화
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('[App] Initializing...');

        // 설정 관리자 초기화
        const settingsManager = getSettingsManager();
        await settingsManager.initialize();

        const settings = settingsManager.getSettings();

        // API 클라이언트 초기화
        initializeApiClient({
          baseURL: settings.api.baseURL,
          timeout: settings.api.timeout,
          retryAttempts: settings.api.retryAttempts,
        });

        // 동기화 관리자 초기화
        const syncManager = initializeSyncManager({
          autoSync: settings.sync.autoSync,
          syncInterval: settings.sync.syncInterval,
          wifiOnly: settings.sync.wifiOnly,
          batchSize: settings.sync.batchSize,
        });

        // 자동 동기화 시작
        if (settings.sync.autoSync) {
          await syncManager.start();
        }

        console.log('[App] Initialized successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('[App] Initialization failed:', error);
        // 실패해도 앱은 계속 실행
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  // 초기화 중 로딩 화면
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>초기화 중...</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <Tab.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: '#999',
          }}
        >
          <Tab.Screen
            name="Recording"
            component={RecordingScreen}
            options={{
              title: '녹음',
              tabBarLabel: '녹음',
              tabBarIcon: ({color, size}) => (
                <MaterialCommunityIcons name="record-circle" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryStack}
            options={{
              title: '기록',
              tabBarLabel: '기록',
              headerShown: false,
              tabBarIcon: ({color, size}) => (
                <MaterialCommunityIcons name="history" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsStack}
            options={{
              title: '설정',
              tabBarLabel: '설정',
              headerShown: false,
              tabBarIcon: ({color, size}) => (
                <MaterialCommunityIcons name="cog" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default App;
