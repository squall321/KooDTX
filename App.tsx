/**
 * KooDTX React Native App
 */

import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, useColorScheme} from 'react-native';
import {PaperProvider} from 'react-native-paper';

import {getTheme} from '@config/theme';

import {RecordingScreen} from './src/screens/RecordingScreen';

function App(): React.JSX.Element {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = getTheme(isDarkMode);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <RecordingScreen />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
