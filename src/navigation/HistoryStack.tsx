/**
 * HistoryStack
 *
 * History 탭 내의 Stack Navigator
 * - HistoryList: 세션 목록 화면
 * - SessionDetail: 세션 상세 화면
 * - Chart: 센서 데이터 차트 화면
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HistoryScreen} from '@screens/HistoryScreen';
import {SessionDetailScreen} from '@screens/SessionDetailScreen';
import {ChartScreen} from '@screens/ChartScreen';
import {useTheme} from 'react-native-paper';

export type HistoryStackParamList = {
  HistoryList: undefined;
  SessionDetail: {sessionId: string};
  Chart: {sessionId: string};
};

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export function HistoryStack() {
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
        name="HistoryList"
        component={HistoryScreen}
        options={{
          title: '기록',
          headerShown: false, // Tab Navigator에서 header 표시
        }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{
          title: '세션 상세',
        }}
      />
      <Stack.Screen
        name="Chart"
        component={ChartScreen}
        options={{
          title: '센서 데이터 차트',
        }}
      />
    </Stack.Navigator>
  );
}
