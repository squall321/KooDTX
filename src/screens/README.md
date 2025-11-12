# Screens

Full-screen views for navigation routes.

## Structure

```
screens/
├── Home/            # Dashboard and home screen
├── Recording/       # Recording session screens
├── History/         # Historical data viewing screens
├── Settings/        # App settings screens
└── Auth/            # Authentication screens (if needed)
```

## Guidelines

- One screen per navigation route
- Screens orchestrate components and handle business logic
- Use custom hooks for data fetching and state management
- Each screen directory should contain:
  - `ScreenName.tsx` - Main screen component
  - `ScreenName.styles.ts` - Styles (optional)
  - `hooks/` - Screen-specific hooks
  - `components/` - Screen-specific components

## Example

```typescript
// Home/Home.tsx
import type {FC} from 'react';
import {View, Text} from 'react-native';
import type {NavigationProp, RouteProp} from '@types';

interface HomeScreenProps {
  navigation: NavigationProp<'Home'>;
  route: RouteProp<'Home'>;
}

export const HomeScreen: FC<HomeScreenProps> = ({navigation}) => {
  return (
    <View>
      <Text>Home Screen</Text>
    </View>
  );
};
```
