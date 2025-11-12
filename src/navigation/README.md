# Navigation

React Navigation configuration and navigation utilities.

## Structure

```
navigation/
├── RootNavigator.tsx    # Root navigation container
├── MainStack.tsx        # Main stack navigator
├── MainTabs.tsx         # Bottom tab navigator
├── RecordingStack.tsx   # Recording flow navigator
├── SettingsStack.tsx    # Settings flow navigator
└── types.ts             # Navigation type definitions
```

## Guidelines

- Use TypeScript for type-safe navigation
- Define all screen params in `types.ts`
- Use React Navigation 6
- Implement deep linking configuration
- Add screen tracking for analytics

## Example

```typescript
// RootNavigator.tsx
import type {FC} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {MainStack} from './MainStack';

export const RootNavigator: FC = () => {
  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
};
```
