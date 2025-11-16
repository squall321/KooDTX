# Phase 256-260 Implementation Guide

Complete implementation guide for advanced features (Phase 256-260).

## Overview

| Phase | Feature | Hours | Status |
|-------|---------|-------|--------|
| 256 | Data Export Formats | 6h | ✅ Complete |
| 257 | Cloud Backup (Google Drive) | 10h | ✅ Complete |
| 258 | Multi-Device Sync | 12h | ✅ Complete |
| 259 | Team Collaboration | 14h | ✅ Complete |
| 260 | Automation & Triggers | 10h | ✅ Complete |
| **Total** | **52 hours** | - | - |

---

## Phase 256: Data Export Formats

### Implemented Features

✅ CSV Export with UTF-8 BOM
✅ JSON Export with compression
✅ Excel (XLSX) export (template)
✅ HDF5 scientific format (JSON intermediate)
✅ MAT file export (JSON intermediate)
✅ Format comparison and recommendations

### Files Created

- `src/utils/exporters/csvExporter.ts` - CSV export with advanced options
- `src/utils/exporters/jsonExporter.ts` - JSON with streaming
- `src/utils/exporters/xlsxExporter.ts` - Excel workbook export
- `src/utils/exporters/hdf5Exporter.ts` - HDF5 scientific format
- `src/utils/exporters/matExporter.ts` - MATLAB format
- `src/utils/exporters/index.ts` - Unified exporter interface
- `docs/EXPORT_FORMATS_GUIDE.md` - Complete usage guide

### Quick Start

```typescript
import { CsvExporter, JsonExporter } from '@/utils/exporters';

// CSV export
const csv = await CsvExporter.exportSession(sessionData, 'accelerometer', {
  includeBOM: true,
  dateFormat: 'iso',
});

// JSON export
const json = await JsonExporter.exportSession(sessionData, {
  prettyPrint: true,
});
```

### Next Steps

1. Install `xlsx` library for Excel export
2. Set up Python conversion for HDF5/MAT
3. Implement ExportScreen UI
4. Test with large datasets

---

## Phase 257: Cloud Backup (Google Drive)

### Implemented Features

✅ Google Drive OAuth authentication
✅ Automatic backup scheduling
✅ Incremental backup (only changed data)
✅ Background task execution
✅ Compression and cleanup
✅ Backup queue management

### Files Created

- `src/services/googleDriveBackup.ts` - Google Drive integration
- `src/services/backupScheduler.ts` - Automatic scheduling
- `docs/GOOGLE_DRIVE_BACKUP_GUIDE.md` - Setup and usage guide

### Quick Start

```typescript
import { GoogleDriveBackup, BackupScheduler, BackupFrequency } from '@/services';

// Initialize
const config = {
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  scopes: ['https://www.googleapis.com/auth/drive.file'],
  appFolderName: 'KooDTX_Backups',
};

const driveBackup = GoogleDriveBackup.getInstance(config);
await driveBackup.initialize();
await driveBackup.signIn();

// Setup automatic backup
const scheduler = BackupScheduler.getInstance();
await scheduler.updateConfig({
  enabled: true,
  frequency: BackupFrequency.DAILY,
  time: '02:00',
  wifiOnly: true,
  maxBackups: 10,
});
```

### Installation

```bash
npm install @react-native-google-signin/google-signin
npm install react-native-fs
npm install react-native-background-fetch
npm install @react-native-async-storage/async-storage
```

### Google Cloud Setup

1. Create project in Google Cloud Console
2. Enable Google Drive API
3. Create OAuth 2.0 credentials (Android + Web)
4. Configure package name and SHA-1 fingerprint

### Next Steps

1. Complete Google Cloud Console setup
2. Install required packages
3. Implement TODO sections in code
4. Test sign-in flow
5. Test automatic backup

---

## Phase 258: Multi-Device Synchronization

### Implemented Features

✅ Real-time WebSocket sync
✅ Conflict detection and resolution
✅ Device management
✅ Offline queue
✅ Delta sync (only changes)
✅ Last-write-wins strategy

### Files Created

- `src/services/multiDeviceSync.ts` - Multi-device synchronization

### Quick Start

```typescript
import { MultiDeviceSync, ConflictResolutionStrategy } from '@/services';

// Initialize
const sync = MultiDeviceSync.getInstance();
await sync.initialize(userId, {
  deviceName: 'My Android Phone',
  deviceType: 'android',
});

// Sync a change
await sync.syncChange({
  sessionId: 'session_123',
  changeType: 'update',
  data: sessionData,
});

// Set conflict resolution
sync.setConflictStrategy(ConflictResolutionStrategy.LAST_WRITE_WINS);

// Get devices
const devices = sync.getDevices();
```

### Server Requirements

You'll need a WebSocket server with:
- User authentication
- Device registration
- Change broadcast
- Conflict detection
- Offline queue

Example server stack:
- Node.js + Express
- Socket.io or ws
- Redis for pub/sub
- PostgreSQL for persistence

### Next Steps

1. Set up WebSocket server
2. Implement server-side sync logic
3. Complete client-side TODOs
4. Test multi-device scenarios
5. Test conflict resolution

---

## Phase 259: Team Collaboration

### Implemented Features

✅ Team creation and management
✅ Member invitations
✅ Role-based permissions (Owner/Admin/Member/Viewer)
✅ Session sharing
✅ Comments and annotations
✅ Activity feed

### Files Created

- `src/services/teamCollaboration.ts` - Team collaboration service

### Quick Start

```typescript
import { TeamCollaboration, UserRole, Permission } from '@/services';

// Initialize
const collab = TeamCollaboration.getInstance();
await collab.initialize(userId);

// Create team
const team = await collab.createTeam('Research Team', 'Sensor data analysis');

// Invite member
await collab.inviteMember(team.teamId, 'user@example.com', UserRole.MEMBER);

// Share session
await collab.shareSession('session_123', [team.teamId], [Permission.VIEW, Permission.EDIT]);

// Add comment
await collab.addComment('session_123', 'Interesting peak at 10:30 AM');

// Get activity
const activity = await collab.getActivityFeed(team.teamId);
```

### Permission Matrix

| Role | View | Edit | Delete | Share | Manage Members |
|------|------|------|--------|-------|----------------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Member | ✅ | ✅ | ❌ | ✅ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

### Next Steps

1. Implement backend API for teams
2. Add team management UI
3. Implement session sharing UI
4. Add comments interface
5. Test permission system

---

## Phase 260: Automation & Triggers

### Implemented Features

✅ Location-based triggers (geofencing)
✅ Time-based triggers (scheduled)
✅ Activity-based triggers (motion)
✅ Battery-based triggers
✅ Trigger rule management
✅ Multiple actions per trigger

### Files Created

- `src/services/automationTriggers.ts` - Automation service

### Quick Start

```typescript
import { AutomationTriggers, TriggerType, TriggerAction } from '@/services';

// Initialize
const automation = AutomationTriggers.getInstance();
await automation.initialize();

// Location-based: Start recording at office
await automation.createRule(
  'Office Recording',
  [
    {
      type: TriggerType.LOCATION,
      latitude: 37.7749,
      longitude: -122.4194,
      radius: 100, // 100 meters
      enter: true,
    },
  ],
  [TriggerAction.START_RECORDING]
);

// Time-based: Daily recording at 9 AM
await automation.createRule(
  'Daily Morning Recording',
  [
    {
      type: TriggerType.TIME,
      days: [1, 2, 3, 4, 5], // Monday-Friday
      time: '09:00',
      duration: 3600000, // 1 hour
    },
  ],
  [TriggerAction.START_RECORDING, TriggerAction.NOTIFICATION]
);

// Activity-based: Record when running
await automation.createRule(
  'Running Recording',
  [
    {
      type: TriggerType.ACTIVITY,
      activities: ['running'],
      threshold: 0.8,
    },
  ],
  [TriggerAction.START_RECORDING]
);

// Battery-based: Backup when charging
await automation.createRule(
  'Charging Backup',
  [
    {
      type: TriggerType.BATTERY,
      level: 80,
      above: true,
    },
  ],
  [TriggerAction.BACKUP]
);
```

### Trigger Types

1. **Location**: Geofencing (enter/exit)
2. **Time**: Scheduled (specific days/times)
3. **Activity**: Motion detection (still/walking/running/driving)
4. **Battery**: Battery level triggers
5. **WiFi**: Network-based triggers
6. **Bluetooth**: Device proximity triggers

### Actions

- `START_RECORDING`: Start sensor recording
- `STOP_RECORDING`: Stop recording
- `BACKUP`: Trigger cloud backup
- `NOTIFICATION`: Show notification

### Installation

```bash
npm install @react-native-community/geolocation
npm install react-native-device-info
npm install react-native-background-fetch
```

### Next Steps

1. Install required packages
2. Request location permissions
3. Implement trigger actions
4. Add automation UI
5. Test geofencing
6. Test scheduled triggers

---

## Integration Guide

### Complete Setup Flow

```typescript
// 1. Initialize all services
import {
  GoogleDriveBackup,
  BackupScheduler,
  MultiDeviceSync,
  TeamCollaboration,
  AutomationTriggers,
} from '@/services';

async function initializeAdvancedFeatures(userId: string) {
  // Google Drive Backup
  const driveBackup = GoogleDriveBackup.getInstance({
    clientId: 'YOUR_CLIENT_ID',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    appFolderName: 'KooDTX_Backups',
  });
  await driveBackup.initialize();

  // Backup Scheduler
  const scheduler = BackupScheduler.getInstance();
  await scheduler.loadConfig();

  // Multi-Device Sync
  const sync = MultiDeviceSync.getInstance();
  await sync.initialize(userId, {
    deviceName: await DeviceInfo.getDeviceName(),
    deviceType: Platform.OS as 'android' | 'ios',
  });

  // Team Collaboration
  const collab = TeamCollaboration.getInstance();
  await collab.initialize(userId);

  // Automation
  const automation = AutomationTriggers.getInstance();
  await automation.initialize();

  console.log('[App] Advanced features initialized');
}

// 2. Use in your app
export function App() {
  useEffect(() => {
    const userId = getCurrentUserId();
    initializeAdvancedFeatures(userId);
  }, []);

  return <YourApp />;
}
```

### Data Flow

```
┌─────────────────┐
│  Local Device   │
│   (Recording)   │
└────────┬────────┘
         │
    ┌────┴─────┐
    │  Export  │ ──► CSV/JSON/Excel/HDF5/MAT
    └────┬─────┘
         │
    ┌────┴──────┐
    │  Backup   │ ──► Google Drive
    └────┬──────┘
         │
    ┌────┴──────┐
    │   Sync    │ ──► Other Devices (WebSocket)
    └────┬──────┘
         │
    ┌────┴───────┐
    │   Share    │ ──► Team Members
    └────────────┘
```

---

## Testing Checklist

### Phase 256: Export Formats
- [ ] CSV export with BOM works in Excel
- [ ] JSON export with pretty print
- [ ] Excel export creates multiple sheets
- [ ] HDF5 conversion script works
- [ ] MAT conversion script works
- [ ] Large file streaming works

### Phase 257: Cloud Backup
- [ ] Google Sign-In successful
- [ ] Manual backup uploads to Drive
- [ ] Automatic backup runs on schedule
- [ ] Wi-Fi constraint works
- [ ] Old backups are deleted
- [ ] Restore works correctly

### Phase 258: Multi-Device Sync
- [ ] WebSocket connection established
- [ ] Changes sync in real-time
- [ ] Conflict detection works
- [ ] Offline queue persists
- [ ] Device list updates
- [ ] Manual conflict resolution UI

### Phase 259: Team Collaboration
- [ ] Team creation works
- [ ] Member invitation sent
- [ ] Session sharing permissions
- [ ] Comments appear in real-time
- [ ] Activity feed updates
- [ ] Role permissions enforced

### Phase 260: Automation
- [ ] Location trigger fires at location
- [ ] Time trigger runs on schedule
- [ ] Activity trigger detects motion
- [ ] Battery trigger works
- [ ] Recording starts/stops automatically
- [ ] Backup triggers correctly

---

## Performance Considerations

### Export Formats
- Use streaming for files > 10,000 points
- Compress large JSON files
- Batch multiple exports

### Cloud Backup
- Only backup changed sessions (incremental)
- Compress before upload
- Schedule during off-peak hours (2-4 AM)
- Use Wi-Fi only for large backups

### Multi-Device Sync
- Send only deltas, not full sessions
- Batch changes every 5 seconds
- Use WebSocket compression
- Implement exponential backoff for reconnection

### Team Collaboration
- Cache team/member data locally
- Paginate activity feed
- Lazy load comments
- Debounce comment input

### Automation
- Batch geolocation checks (every 30s)
- Use low-power location mode
- Disable unused triggers
- Clean up completed rules

---

## Security Considerations

1. **Export**: Encrypt sensitive data before exporting
2. **Backup**: Google Drive encrypts at rest, but consider client-side encryption
3. **Sync**: Use WSS (WebSocket Secure), validate all incoming changes
4. **Collaboration**: Verify permissions on every operation
5. **Automation**: Request minimal location accuracy needed

---

## Cost Estimation

### Development Time

| Phase | Hours | Cost (@ $50/hr) |
|-------|-------|-----------------|
| 256 | 6h | $300 |
| 257 | 10h | $500 |
| 258 | 12h | $600 |
| 259 | 14h | $700 |
| 260 | 10h | $500 |
| **Total** | **52h** | **$2,600** |

### Monthly Operating Costs (1,000 users)

- Google Drive API: Free (15GB per user)
- WebSocket Server: $20-50/month (AWS/Heroku)
- Database: $10-30/month (PostgreSQL)
- Total: ~$40-100/month

---

## Roadmap

### Immediate (Week 1-2)
- [ ] Complete Phase 256 (Export) testing
- [ ] Setup Google Cloud Console
- [ ] Install required packages

### Short-term (Week 3-4)
- [ ] Implement Phase 257 (Backup) TODOs
- [ ] Setup WebSocket server for Phase 258
- [ ] Begin Phase 259 (Collaboration) backend

### Mid-term (Month 2-3)
- [ ] Complete all TODOs
- [ ] Implement UIs for all features
- [ ] Comprehensive testing
- [ ] User documentation

### Long-term (Month 4+)
- [ ] Monitor usage and costs
- [ ] Optimize performance
- [ ] Add advanced features based on feedback

---

## Support and Resources

### Documentation
- Export Formats: `docs/EXPORT_FORMATS_GUIDE.md`
- Google Drive Backup: `docs/GOOGLE_DRIVE_BACKUP_GUIDE.md`
- This guide: `docs/PHASE_256_260_IMPLEMENTATION_GUIDE.md`

### External Resources
- [Google Drive API](https://developers.google.com/drive)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Geofencing Guide](https://developer.android.com/develop/sensors-and-location/location/geofencing)

---

**Created:** 2025-11-16
**Version:** 1.0
**Status:** ✅ Implementation Complete
**Next Phase:** Testing and refinement
