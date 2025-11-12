/**
 * Home Screen
 * Demo screen showcasing React Native Paper components
 */

import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
  Button,
  Card,
  Chip,
  Divider,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

export const HomeScreen = () => {
  const theme = useTheme();
  const [text, setText] = useState('');

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
    >
      <Surface style={styles.surface} elevation={0}>
        <Text variant="displaySmall" style={styles.title}>
          KooDTX
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Local-First Sensor Data Collection App
        </Text>
      </Surface>

      <Card style={styles.card}>
        <Card.Title title="Welcome" subtitle="React Native Paper Demo" />
        <Card.Content>
          <Text variant="bodyMedium">
            This is a demo screen showcasing React Native Paper components. The
            app uses Material Design 3 theme.
          </Text>

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Text Input
          </Text>
          <TextInput
            label="Enter some text"
            value={text}
            onChangeText={setText}
            mode="outlined"
            style={styles.input}
          />

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Buttons
          </Text>
          <View style={styles.buttonRow}>
            <Button mode="contained" style={styles.button}>
              Contained
            </Button>
            <Button mode="outlined" style={styles.button}>
              Outlined
            </Button>
          </View>
          <Button mode="text" style={styles.button}>
            Text Button
          </Button>

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Chips
          </Text>
          <View style={styles.chipRow}>
            <Chip icon="information" style={styles.chip}>
              Info
            </Chip>
            <Chip icon="check-circle" style={styles.chip}>
              Success
            </Chip>
            <Chip icon="alert-circle" style={styles.chip}>
              Warning
            </Chip>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Features" subtitle="Coming Soon" />
        <Card.Content>
          <Text variant="bodyMedium">• Sensor Data Collection</Text>
          <Text variant="bodyMedium">• Local Database (WatermelonDB)</Text>
          <Text variant="bodyMedium">• Data Synchronization</Text>
          <Text variant="bodyMedium">• Audio Recording</Text>
          <Text variant="bodyMedium">• Real-time Charts</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surface: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    margin: 16,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  input: {
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  button: {
    marginHorizontal: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
});
