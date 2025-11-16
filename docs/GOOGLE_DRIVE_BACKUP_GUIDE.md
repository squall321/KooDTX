## Google Drive Backup Implementation Guide

Complete guide for implementing automatic cloud backup to Google Drive.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Implementation](#implementation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [Troubleshooting](#troubleshooting)

---

## Overview

### Features

- **Automatic Backup**: Scheduled backups (daily/weekly/monthly)
- **OAuth 2.0**: Secure Google Sign-In authentication
- **Incremental Backup**: Only upload changed data
- **Compression**: Reduce upload size
- **Background Tasks**: Backup runs in background
- **Constraints**: Wi-Fi only, charging only options
- **Auto Cleanup**: Delete old backups automatically
- **Restore**: Download and restore from backup

### Architecture

```
┌─────────────────┐
│  React Native   │
│      App        │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Backup  │
    │ Service │
    └────┬────┘
         │
    ┌────┴────────┐
    │   Google    │
    │   Drive     │
    │   API v3    │
    └─────────────┘
```

---

## Setup

### Step 1: Google Cloud Console Setup

1. **Create Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project: "KooDTX Backup"

2. **Enable Google Drive API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Android"
   - Name: "KooDTX Android"
   - Package name: `com.koodtx` (your app package)
   - SHA-1 fingerprint: Get from your keystore

4. **Get Web Client ID**
   - Also create "Web application" OAuth client
   - Copy the **Client ID** (you'll need this)

### Step 2: Install Dependencies

```bash
# Google Sign-In
npm install @react-native-google-signin/google-signin

# File system
npm install react-native-fs

# Network info (for Wi-Fi check)
npm install @react-native-community/netinfo

# Background tasks
npm install react-native-background-fetch

# Async storage
npm install @react-native-async-storage/async-storage

# Link native modules
cd ios && pod install && cd ..
```

### Step 3: Android Configuration

**android/app/build.gradle:**
```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
}
```

**AndroidManifest.xml:**
```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
</manifest>
```

### Step 4: iOS Configuration (if supporting iOS)

**ios/Podfile:**
```ruby
pod 'GoogleSignIn', '~> 7.0'
```

**Info.plist:**
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

---

## Implementation

### Step 1: Initialize Google Drive Backup

```typescript
import { GoogleDriveBackup } from '@/services/googleDriveBackup';

// In your app initialization
const config = {
  clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
  ],
  appFolderName: 'KooDTX_Backups',
};

const driveBackup = GoogleDriveBackup.getInstance(config);
await driveBackup.initialize();
```

### Step 2: Implement Sign-In Flow

```typescript
// Sign in button handler
async function handleSignIn() {
  try {
    await driveBackup.signIn();
    console.log('Signed in to Google Drive');

    // Enable automatic backups
    const scheduler = BackupScheduler.getInstance();
    await scheduler.updateConfig({
      enabled: true,
      frequency: BackupFrequency.DAILY,
    });
  } catch (error) {
    console.error('Sign-in failed:', error);
  }
}

// Sign out button handler
async function handleSignOut() {
  try {
    await driveBackup.signOut();

    // Disable automatic backups
    const scheduler = BackupScheduler.getInstance();
    await scheduler.updateConfig({ enabled: false });
  } catch (error) {
    console.error('Sign-out failed:', error);
  }
}
```

### Step 3: Manual Backup

```typescript
import { GoogleDriveBackup } from '@/services/googleDriveBackup';

async function backupSession(sessionId: string, sessionData: any) {
  const driveBackup = GoogleDriveBackup.getInstance();

  try {
    const backupMetadata = await driveBackup.uploadSession(sessionId, sessionData, {
      compress: true,
      incremental: true,
    });

    console.log('Backup created:', backupMetadata);
    return backupMetadata;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}
```

### Step 4: Automatic Backup Scheduling

```typescript
import { BackupScheduler, BackupFrequency } from '@/services/backupScheduler';

async function setupAutoBackup() {
  const scheduler = BackupScheduler.getInstance();

  await scheduler.updateConfig({
    enabled: true,
    frequency: BackupFrequency.DAILY,
    time: '02:00', // 2 AM
    wifiOnly: true, // Only on Wi-Fi
    chargingOnly: false,
    autoDelete: true,
    maxBackups: 10, // Keep last 10 backups
  });

  console.log('Automatic backup enabled');
}
```

### Step 5: Restore from Backup

```typescript
async function restoreSession(backupId: string) {
  const driveBackup = GoogleDriveBackup.getInstance();

  try {
    const sessionData = await driveBackup.downloadSession(backupId);

    // Save to local database
    await saveSessionToDatabase(sessionData);

    console.log('Session restored successfully');
    return sessionData;
  } catch (error) {
    console.error('Restore failed:', error);
    throw error;
  }
}
```

### Step 6: List and Manage Backups

```typescript
async function manageBackups() {
  const driveBackup = GoogleDriveBackup.getInstance();

  // List all backups
  const backups = await driveBackup.listBackups();
  console.log(`Found ${backups.length} backups`);

  // Display backups
  for (const backup of backups) {
    console.log(`
      Session: ${backup.sessionName}
      Date: ${new Date(backup.timestamp).toLocaleString()}
      Size: ${(backup.size / 1024 / 1024).toFixed(2)} MB
    `);
  }

  // Delete old backup
  if (backups.length > 10) {
    const oldestBackup = backups[backups.length - 1];
    await driveBackup.deleteBackup(oldestBackup.backupId);
    console.log('Deleted oldest backup');
  }

  // Get storage usage
  const storage = await driveBackup.getStorageUsage();
  console.log(`
    Used: ${(storage.used / 1024 / 1024 / 1024).toFixed(2)} GB
    Total: ${(storage.total / 1024 / 1024 / 1024).toFixed(2)} GB
  `);
}
```

---

## Configuration

### Backup Schedule Options

```typescript
interface BackupScheduleConfig {
  enabled: boolean; // Enable/disable automatic backup
  frequency: BackupFrequency; // MANUAL, DAILY, WEEKLY, MONTHLY
  time?: string; // HH:MM format (e.g., "02:00")
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  wifiOnly?: boolean; // Only backup on Wi-Fi
  chargingOnly?: boolean; // Only backup when charging
  autoDelete?: boolean; // Auto-delete old backups
  maxBackups?: number; // Maximum number of backups to keep
}
```

### Backup Options

```typescript
interface BackupOptions {
  compress?: boolean; // Compress before upload (recommended)
  incremental?: boolean; // Only upload changed data
  deleteAfterUpload?: boolean; // Delete local file after upload
}
```

---

## Usage

### Complete Backup Settings Screen

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Button } from 'react-native';
import { GoogleDriveBackup } from '@/services/googleDriveBackup';
import { BackupScheduler, BackupFrequency } from '@/services/backupScheduler';

export function BackupSettingsScreen() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [config, setConfig] = useState<BackupScheduleConfig | null>(null);
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [storage, setStorage] = useState({ used: 0, total: 0 });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const scheduler = BackupScheduler.getInstance();
    await scheduler.loadConfig();
    setConfig(scheduler.getConfig());

    const driveBackup = GoogleDriveBackup.getInstance();
    // Check sign-in status
    // Load backups and storage info
  }

  async function handleSignIn() {
    const driveBackup = GoogleDriveBackup.getInstance();
    await driveBackup.signIn();
    setIsSignedIn(true);
  }

  async function handleConfigChange(updates: Partial<BackupScheduleConfig>) {
    const scheduler = BackupScheduler.getInstance();
    await scheduler.updateConfig(updates);
    setConfig(scheduler.getConfig());
  }

  return (
    <View>
      <Text>Google Drive Backup</Text>

      {!isSignedIn ? (
        <Button title="Sign in to Google Drive" onPress={handleSignIn} />
      ) : (
        <View>
          <View>
            <Text>Automatic Backup</Text>
            <Switch
              value={config?.enabled}
              onValueChange={(value) =>
                handleConfigChange({ enabled: value })
              }
            />
          </View>

          <View>
            <Text>Frequency</Text>
            {/* Picker for frequency */}
          </View>

          <View>
            <Text>Wi-Fi Only</Text>
            <Switch
              value={config?.wifiOnly}
              onValueChange={(value) =>
                handleConfigChange({ wifiOnly: value })
              }
            />
          </View>

          <View>
            <Text>Backups: {backups.length}</Text>
            <Text>
              Storage: {(storage.used / 1024 / 1024 / 1024).toFixed(2)} GB /
              {(storage.total / 1024 / 1024 / 1024).toFixed(2)} GB
            </Text>
          </View>

          <Button title="Backup Now" onPress={() => {/* Manual backup */}} />
        </View>
      )}
    </View>
  );
}
```

---

## Troubleshooting

### Common Issues

#### 1. Sign-In Fails

**Error**: "DEVELOPER_ERROR" or "API not enabled"

**Solution**:
- Check that Google Drive API is enabled in Cloud Console
- Verify OAuth client ID is correct
- Check SHA-1 fingerprint matches your keystore
- Make sure package name matches

#### 2. Upload Fails

**Error**: "Insufficient permissions"

**Solution**:
- Check that scopes include `drive.file` or `drive.appdata`
- Re-authenticate to get updated permissions

#### 3. Background Task Not Running

**Error**: Backups don't run automatically

**Solution**:
- Check battery optimization settings
- Verify background fetch is configured correctly
- Check Wi-Fi/charging constraints
- Review device manufacturer restrictions (Xiaomi, Huawei, etc.)

#### 4. Storage Full

**Error**: "Insufficient storage"

**Solution**:
- Increase `maxBackups` limit
- Enable `autoDelete` option
- Manually delete old backups
- Use compression option

### Debug Mode

Enable debug logging:

```typescript
// In development
console.log('[GoogleDriveBackup] Uploading session:', sessionId);
console.log('[BackupScheduler] Queue status:', scheduler.getQueueStatus());
```

---

## Testing

### Test Checklist

- [ ] Google Sign-In works
- [ ] Manual backup creates file in Google Drive
- [ ] Backup appears in Drive folder
- [ ] Restore downloads and parses correctly
- [ ] Automatic backup runs on schedule
- [ ] Wi-Fi constraint works (disable Wi-Fi, backup should skip)
- [ ] Charging constraint works
- [ ] Old backups are deleted when limit reached
- [ ] Incremental backup skips unchanged sessions
- [ ] Background task survives app restart

### Test Script

```typescript
async function testGoogleDriveBackup() {
  console.log('=== Testing Google Drive Backup ===');

  // 1. Sign in
  console.log('1. Testing sign-in...');
  const driveBackup = GoogleDriveBackup.getInstance(config);
  await driveBackup.signIn();
  console.log('✓ Sign-in successful');

  // 2. Manual backup
  console.log('2. Testing manual backup...');
  const testSession = {
    sessionId: 'test_123',
    sessionName: 'Test Session',
    startTime: Date.now() - 60000,
    endTime: Date.now(),
    accelerometer: [{ timestamp: Date.now(), x: 1, y: 2, z: 3 }],
  };
  const backup = await driveBackup.uploadSession('test_123', testSession);
  console.log('✓ Backup created:', backup.backupId);

  // 3. List backups
  console.log('3. Testing list backups...');
  const backups = await driveBackup.listBackups();
  console.log(`✓ Found ${backups.length} backups`);

  // 4. Restore
  console.log('4. Testing restore...');
  const restored = await driveBackup.downloadSession(backup.backupId);
  console.log('✓ Restored session:', restored.sessionId);

  // 5. Delete
  console.log('5. Testing delete...');
  await driveBackup.deleteBackup(backup.backupId);
  console.log('✓ Backup deleted');

  console.log('=== All tests passed ===');
}
```

---

## Security Considerations

1. **OAuth Tokens**: Tokens are managed by Google Sign-In SDK, never store manually
2. **Encryption**: Google Drive encrypts data at rest and in transit
3. **Permissions**: Use minimal scopes (`drive.file` instead of `drive`)
4. **App Folder**: Use `drive.appdata` scope for app-only folder
5. **Backup Content**: Consider encrypting sensitive data before upload

---

## Performance Tips

1. **Compression**: Always use compression for large sessions
2. **Incremental**: Enable incremental backup to skip unchanged data
3. **Background**: Schedule backups during off-peak hours (2-4 AM)
4. **Wi-Fi**: Enable Wi-Fi-only to avoid mobile data charges
5. **Batch**: Upload multiple sessions in one background task
6. **Cleanup**: Regularly delete old backups to save storage

---

## Next Steps

1. Complete TODOs in `googleDriveBackup.ts`
2. Implement `BackupSettingsScreen.tsx`
3. Test on real device
4. Set up background tasks
5. Monitor backup success rate
6. Collect user feedback

---

**Created:** 2025-11-16
**Version:** 1.0
**Status:** ✅ Implementation Ready
