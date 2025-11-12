# KooDTX Project Structure

Complete folder structure and organization guide for the KooDTX React Native application.

## Overview

KooDTX follows a feature-based and domain-driven folder structure that promotes:

- **Scalability**: Easy to add new features without restructuring
- **Maintainability**: Clear separation of concerns
- **Discoverability**: Intuitive file locations
- **Reusability**: Shared components and utilities

## Root Structure

```
KooDTX/
├── android/                 # Android native code
├── ios/                     # iOS native code
├── src/                     # Application source code
├── __tests__/               # Test files
├── docs/                    # Documentation
├── node_modules/            # Dependencies
├── .github/                 # GitHub workflows and templates
├── App.tsx                  # Root application component
├── index.js                 # Application entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── babel.config.js          # Babel configuration
├── metro.config.js          # Metro bundler configuration
├── jest.config.js           # Jest test configuration
├── .eslintrc.js             # ESLint configuration
├── .prettierrc.js           # Prettier configuration
├── .gitignore               # Git ignore rules
└── README.md                # Project README
```

## Source Directory Structure

```
src/
├── components/              # Reusable UI components
│   ├── common/              # Generic components (Button, Input, Card)
│   ├── sensors/             # Sensor-specific components
│   ├── recording/           # Recording-related components
│   ├── charts/              # Data visualization
│   └── layout/              # Layout components
│
├── screens/                 # Full-screen views
│   ├── Home/                # Dashboard screen
│   ├── Recording/           # Recording screens
│   ├── History/             # Historical data screens
│   └── Settings/            # Settings screens
│
├── navigation/              # Navigation configuration
│   ├── RootNavigator.tsx    # Root navigator
│   ├── MainStack.tsx        # Main stack
│   ├── MainTabs.tsx         # Tab navigator
│   └── types.ts             # Navigation types
│
├── services/                # Business logic and API
│   ├── api/                 # Backend API client
│   ├── sensors/             # Sensor services
│   │   ├── accelerometer.ts
│   │   ├── gyroscope.ts
│   │   ├── gps.ts
│   │   └── audio.ts
│   ├── sync/                # Data synchronization
│   ├── database/            # Database service
│   ├── storage/             # Local storage
│   └── permissions/         # Permission handling
│
├── hooks/                   # Custom React hooks
│   ├── useSensor.ts         # Sensor hooks
│   ├── useRecording.ts      # Recording hooks
│   ├── useSync.ts           # Sync hooks
│   └── useDatabase.ts       # Database hooks
│
├── store/                   # Global state (Zustand)
│   ├── useAppStore.ts       # App state
│   ├── useRecordingStore.ts # Recording state
│   ├── useSensorStore.ts    # Sensor config state
│   └── useSettingsStore.ts  # Settings state
│
├── types/                   # TypeScript type definitions
│   ├── common.types.ts      # Common types
│   ├── sensor.types.ts      # Sensor types
│   ├── database.types.ts    # Database types
│   ├── navigation.types.ts  # Navigation types
│   └── index.ts             # Type exports
│
├── utils/                   # Utility functions
│   ├── date.ts              # Date utilities
│   ├── validation.ts        # Validation functions
│   ├── formatting.ts        # Formatting utilities
│   ├── logger.ts            # Logging utility
│   └── error.ts             # Error handling
│
├── config/                  # Configuration files
│   ├── env.ts               # Environment variables
│   ├── api.ts               # API configuration
│   ├── sensors.ts           # Sensor defaults
│   ├── database.ts          # Database config
│   └── theme.ts             # Theme configuration
│
├── constants/               # Application constants
│   ├── app.ts               # App constants
│   ├── sensors.ts           # Sensor constants
│   ├── database.ts          # Database constants
│   ├── errors.ts            # Error messages
│   └── routes.ts            # Route names
│
├── models/                  # Business entity models
│   ├── SensorData.ts        # Sensor data model
│   ├── RecordingSession.ts  # Session model
│   ├── SyncQueue.ts         # Sync queue model
│   └── UserSettings.ts      # Settings model
│
├── database/                # WatermelonDB setup
│   ├── index.ts             # Database initialization
│   ├── schema.ts            # Database schema
│   ├── models/              # WatermelonDB models
│   └── migrations/          # Schema migrations
│
└── assets/                  # Static assets
    ├── images/              # Images and icons
    ├── fonts/               # Custom fonts
    ├── sounds/              # Sound files
    └── animations/          # Lottie animations
```

## Component Organization

Each component follows this structure:

```
Component/
├── Component.tsx            # Main component
├── Component.styles.ts      # Styles (optional)
├── Component.test.tsx       # Tests
├── index.ts                 # Export
└── README.md                # Component docs (optional)
```

## Screen Organization

Each screen follows this structure:

```
ScreenName/
├── ScreenName.tsx           # Main screen component
├── ScreenName.styles.ts     # Styles
├── hooks/                   # Screen-specific hooks
├── components/              # Screen-specific components
└── index.ts                 # Export
```

## Path Aliases

Path aliases are configured for cleaner imports:

| Alias          | Path                |
| -------------- | ------------------- |
| @components/\* | src/components/\*   |
| @screens/\*    | src/screens/\*      |
| @navigation/\* | src/navigation/\*   |
| @services/\*   | src/services/\*     |
| @utils/\*      | src/utils/\*        |
| @hooks/\*      | src/hooks/\*        |
| @store/\*      | src/store/\*        |
| @types/\*      | src/types/\*        |
| @assets/\*     | src/assets/\*       |
| @config/\*     | src/config/\*       |
| @constants/\*  | src/constants/\*    |
| @models/\*     | src/models/\*       |
| @database/\*   | src/database/\*     |

Example usage:

```typescript
// Instead of: import {Button} from '../../components/common/Button';
import {Button} from '@components/common/Button';

// Instead of: import {useRecording} from '../../../hooks/useRecording';
import {useRecording} from '@hooks/useRecording';
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`, `SensorCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useSensor.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Types**: camelCase with '.types' suffix (e.g., `sensor.types.ts`)
- **Constants**: camelCase (e.g., `app.ts`)
- **Config**: camelCase (e.g., `env.ts`)

## Import Order

ESLint enforces the following import order:

1. React and React Native
2. External libraries
3. Internal absolute imports (@components, @services, etc.)
4. Relative imports (../, ./)
5. Type imports

Example:

```typescript
import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';

import {create} from 'zustand';

import {Button} from '@components/common/Button';
import {useSensor} from '@hooks/useSensor';

import {formatDate} from '../utils/date';

import type {SensorData} from '@types';
```

## Best Practices

### 1. Component Organization

- Keep components small and focused
- Extract reusable logic into hooks
- Use TypeScript for all components
- Write tests for complex components

### 2. State Management

- Use Zustand for global state
- Keep local state in components when possible
- Avoid prop drilling with context or global state

### 3. Styling

- Use StyleSheet for performance
- Keep styles close to components
- Use theme configuration for consistency

### 4. Testing

- Write unit tests for utilities and hooks
- Write integration tests for complex flows
- Use Jest and React Native Testing Library

### 5. Type Safety

- Define types in src/types/
- Use strict TypeScript configuration
- Avoid 'any' type

## Adding New Features

When adding a new feature:

1. **Create feature branch**: `feature/feature-name`
2. **Add types**: Define types in `src/types/`
3. **Create services**: Add business logic in `src/services/`
4. **Build components**: Create reusable components in `src/components/`
5. **Create screens**: Add screens in `src/screens/`
6. **Add navigation**: Update navigation configuration
7. **Write tests**: Add unit and integration tests
8. **Update docs**: Document the new feature

## References

- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Navigation](https://reactnavigation.org/)
- [WatermelonDB](https://nozbe.github.io/WatermelonDB/)
- [Zustand](https://github.com/pmndrs/zustand)
