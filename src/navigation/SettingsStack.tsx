/**
 * SettingsStack
 *
 * Settings 탭 내의 Stack Navigator
 * - Settings: 설정 화면
 * - SyncStatus: 동기화 상태 화면
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SettingsScreen} from '@screens/SettingsScreen';
import {SyncStatusScreen} from '@screens/SyncStatusScreen';
import {useTheme} from 'react-native-paper';

export type SettingsStackParamList = {
  SettingsList: undefined;
  SyncStatus: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="SettingsList"
        component={SettingsScreen}
        options={{
          title: '설정',
          headerShown: false, // Tab Navigator에서 header 표시
        }}
      />
      <Stack.Screen
        name="SyncStatus"
        component={SyncStatusScreen}
        options={{
          title: '동기화 상태',
        }}
      />
    </Stack.Navigator>
  );
}
