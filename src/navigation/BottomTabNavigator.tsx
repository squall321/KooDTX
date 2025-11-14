import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import { RecordingScreen } from '../screens/RecordingScreen';
import { SessionsScreen } from '../screens/SessionsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import SyncScreen from '../screens/SyncScreen';

export type BottomTabParamList = {
  Home: undefined;
  Recording: undefined;
  Sessions: undefined;
  Sync: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Recording':
              iconName = focused ? 'mic' : 'mic-outline';
              break;
            case 'Sessions':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Sync':
              iconName = focused ? 'sync' : 'sync-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5EA',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#000000',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '홈',
          tabBarLabel: '홈',
        }}
      />
      <Tab.Screen
        name="Recording"
        component={RecordingScreen}
        options={{
          title: '녹음',
          tabBarLabel: '녹음',
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          title: '세션',
          tabBarLabel: '세션',
        }}
      />
      <Tab.Screen
        name="Sync"
        component={SyncScreen}
        options={{
          title: '동기화',
          tabBarLabel: '동기화',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '설정',
          tabBarLabel: '설정',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
