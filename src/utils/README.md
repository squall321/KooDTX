# Utils

Utility functions and helper modules.

## Structure

```
utils/
├── date.ts          # Date formatting and manipulation
├── validation.ts    # Input validation functions
├── formatting.ts    # Data formatting utilities
├── logger.ts        # Logging utility
├── error.ts         # Error handling utilities
└── permissions.ts   # Permission checking utilities
```

## Guidelines

- Functions should be pure when possible
- Use TypeScript for type safety
- Write comprehensive unit tests
- Document complex logic with JSDoc comments
- Keep functions small and focused

## Example

```typescript
// date.ts
/**
 * Formats a timestamp to a readable date string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string (YYYY-MM-DD HH:mm:ss)
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * Calculates duration between two timestamps
 * @param start - Start timestamp in milliseconds
 * @param end - End timestamp in milliseconds
 * @returns Duration object with hours, minutes, seconds
 */
export const calculateDuration = (
  start: number,
  end: number,
): {hours: number; minutes: number; seconds: number} => {
  const diff = Math.abs(end - start);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return {
    hours: hours,
    minutes: minutes % 60,
    seconds: seconds % 60,
  };
};
```
