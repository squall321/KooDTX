/**
 * KooDTX React Native App
 */

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {getTheme} from '@config/theme';
import {RecordingScreen} from '@screens';
import {HistoryStack} from '@navigation/HistoryStack';

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = getTheme(isDarkMode);

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
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;
