# Components

Reusable React Native components used throughout the application.

## Structure

```
components/
├── common/          # Generic reusable components (Button, Input, Card, etc.)
├── sensors/         # Sensor-specific components (SensorCard, SensorToggle, etc.)
├── recording/       # Recording-related components (RecordingControls, Timer, etc.)
├── charts/          # Data visualization components
└── layout/          # Layout components (Header, Footer, Container, etc.)
```

## Guidelines

- All components should be functional components using hooks
- Use TypeScript for type safety
- Follow atomic design principles (atoms, molecules, organisms)
- Each component should have its own directory with:
  - `ComponentName.tsx` - Main component file
  - `ComponentName.styles.ts` - StyleSheet (optional)
  - `ComponentName.test.tsx` - Unit tests
  - `index.ts` - Export file

## Example

```typescript
// Button/Button.tsx
import type {FC} from 'react';
import {TouchableOpacity, Text} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({title, onPress, disabled}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};
```
