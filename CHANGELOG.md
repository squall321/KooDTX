# Changelog

All notable changes to KooDTX will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Firebase Analytics integration (Phase 248)
- In-app feedback screen (Phase 249)
- Improved GPS accuracy
- Additional sensor support (magnetometer, barometer)

---

## [0.1.0] - 2025-01-XX (Initial Release)

### Added
- **Core Features**
  - GPS location tracking with high accuracy
  - Multi-sensor data collection (accelerometer, gyroscope, magnetometer, barometer)
  - Background recording support with foreground service
  - Session management (start, pause, resume, stop)
  - Local data storage using WatermelonDB (encrypted SQLite)

- **Data Export**
  - CSV export format
  - JSON export format
  - Export to device storage

- **Cloud Sync**
  - Optional cloud synchronization
  - WiFi-only sync option
  - Manual sync trigger
  - API key authentication

- **Settings**
  - Sensor enable/disable toggles
  - Sampling rate configuration (1Hz, 5Hz, 10Hz, 50Hz)
  - GPS accuracy settings
  - Sync configuration (server URL, API key)
  - Battery optimization settings

- **UI/UX**
  - Material Design 3 components
  - Korean and English localization
  - Permission request flow
  - Real-time recording status
  - Session list with details

- **Monitoring & Error Tracking**
  - Sentry integration for crash reporting
  - Error boundaries
  - Comprehensive logging

- **Legal & Privacy**
  - Privacy Policy (Korean + English)
  - Terms of Service (Korean + English)
  - GDPR, CCPA, and Korean PIPA compliant

### Technical Details
- **Minimum Android Version**: Android 10 (API 29)
- **Target Android Version**: Android 14 (API 34)
- **React Native Version**: 0.73.x
- **Database**: WatermelonDB (SQLite with encryption)
- **Architecture**: Local-first with optional cloud sync

### Known Issues
- GPS accuracy may be lower indoors (expected behavior)
- Background recording may be limited on some devices due to manufacturer battery optimization
- Sync requires stable WiFi connection

---

## Version History

- **[0.1.0]** - Initial release
- **[Unreleased]** - Future features and improvements

---

## How to Update

1. Open **Google Play Store**
2. Search for "**KooDTX**"
3. Tap "**Update**"

Or enable auto-updates in Play Store settings.

---

## Support

For questions, bug reports, or feature requests:
- Email: support@koodtx.com
- GitHub Issues: https://github.com/[YOUR_USERNAME]/KooDTX/issues

---

## Changelog Categories

This changelog uses the following categories:

- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features that will be removed in future versions
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

**Last Updated**: 2025-01-16
