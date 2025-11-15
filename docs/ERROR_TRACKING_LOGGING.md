# Error Tracking and Logging Guide
**Phase 174-175: Sentry Integration and Custom Logging**

## Overview

Comprehensive error tracking and logging system using Sentry for production error monitoring and custom logger for structured logging.

## Sentry Setup (Phase 174)

### Installation

```bash
npm install @sentry/react-native

# iOS
cd ios && pod install

# Link native modules
npx @sentry/wizard -i reactNative -p ios android
```

### Configuration

**App.tsx:**
```typescript
import { initSentry } from '@utils/sentry';

// Initialize Sentry early in app lifecycle
initSentry();

function App() {
  // Your app code
}
```

### Usage Examples

**Capture Exception:**
```typescript
import { captureException } from '@utils/sentry';

try {
  // Your code
  riskyOperation();
} catch (error) {
  captureException(error as Error, {
    tags: { feature: 'user-profile' },
    extra: { userId: user.id },
    level: 'error',
  });
}
```

**Capture Message:**
```typescript
import { captureMessage } from '@utils/sentry';

captureMessage('User completed onboarding', 'info', {
  tags: { flow: 'onboarding' },
  extra: { steps: 5 },
});
```

**Add Breadcrumbs:**
```typescript
import { addBreadcrumb } from '@utils/sentry';

// Track user actions
addBreadcrumb('Button clicked', 'user', 'info', {
  buttonId: 'submit-form',
});

// Track API calls
addBreadcrumb('API request', 'http', 'info', {
  url: '/api/users',
  method: 'GET',
});
```

**Performance Monitoring:**
```typescript
import { startTransaction } from '@utils/sentry';

const transaction = startTransaction('Load User Profile', 'http');

try {
  const user = await fetchUserProfile();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
} finally {
  transaction.finish();
}
```

## Custom Logger (Phase 175)

### Basic Usage

```typescript
import logger from '@utils/logger';

// Debug log (dev only)
logger.debug('Debugging info', { variable: value });

// Info log
logger.info('User logged in', { userId: '123' });

// Warning log
logger.warn('API response slow', { duration: 5000 });

// Error log
logger.error('Failed to save', error, { userId: '123' });

// Fatal error (always sent to Sentry)
logger.fatal('Critical failure', error, { context: 'payment' });
```

### Specialized Logging

**API Requests:**
```typescript
logger.logApiRequest('GET', '/api/users', 200, 450);

// With error
logger.logApiRequest('POST', '/api/users', 500, 1200, error);
```

**User Actions:**
```typescript
logger.logUserAction('button_click', 'HomeScreen', {
  buttonId: 'submit',
});
```

**Navigation:**
```typescript
logger.logNavigation('HomeScreen', 'ProfileScreen');
```

### Performance Tracking

**Simple Timer:**
```typescript
const stopTimer = logger.startTimer('Data Processing');
// ... do work ...
stopTimer(); // Logs: "Timer: Data Processing { duration: '123ms' }"
```

**Track Async Operation:**
```typescript
const result = await logger.track('Fetch User Data', async () => {
  return await api.getUser(userId);
});
// Automatically logs start, success/failure, and duration
```

### Get Log History

```typescript
// Get all logs
const allLogs = logger.getHistory();

// Get logs by level
const errorLogs = logger.getHistory(LogLevel.ERROR);

// Export logs
const logsJson = logger.exportLogs();

// Clear history
logger.clearHistory();
```

## Error Boundary

**src/components/ErrorBoundary.tsx:**
```typescript
import React from 'react';
import * as Sentry from '@sentry/react-native';
import logger from '@utils/logger';

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to custom logger
    logger.fatal('React Error Boundary', error, {
      componentStack: errorInfo.componentStack,
    });

    // Sentry will automatically capture this
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });
  }

  render() {
    return this.props.children;
  }
}

export default Sentry.wrap(ErrorBoundary);
```

**Usage:**
```tsx
import ErrorBoundary from '@components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

## Best Practices

### 1. Log Levels

```typescript
// DEBUG: Development info (not sent to Sentry)
logger.debug('Cache hit', { key: 'user-123' });

// INFO: General information
logger.info('User logged in', { userId: '123' });

// WARN: Something unexpected but handled
logger.warn('Deprecated API used', { endpoint: '/old-api' });

// ERROR: Error that was caught and handled
logger.error('Failed to load image', error, { imageUrl });

// FATAL: Critical error requiring immediate attention
logger.fatal('Payment processing failed', error, { amount, userId });
```

### 2. Structured Data

```typescript
// ✅ Good - Structured
logger.info('User action', {
  action: 'purchase',
  itemId: '123',
  price: 99.99,
  userId: 'user-456',
});

// ❌ Bad - Unstructured
logger.info('User user-456 purchased item 123 for $99.99');
```

### 3. Context

```typescript
import { setContext, setTag } from '@utils/sentry';

// Set user context
setSentryUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

// Set custom context
setContext('subscription', {
  plan: 'premium',
  expires: '2024-12-31',
});

// Set tags for filtering
setTag('environment', 'production');
setTag('feature', 'checkout');
```

### 4. Privacy

```typescript
// ❌ Don't log sensitive data
logger.info('User login', {
  password: password, // NEVER log passwords
  creditCard: card, // NEVER log payment info
});

// ✅ Log safely
logger.info('User login', {
  userId: user.id,
  method: 'email',
});
```

### 5. Error Grouping

```typescript
// Help Sentry group errors better
captureException(error, {
  tags: {
    feature: 'checkout', // Group by feature
    errorType: 'payment-failed', // Group by type
  },
});
```

## Source Maps

### Android

**android/app/build.gradle:**
```gradle
apply from: "../../node_modules/@sentry/react-native/sentry.gradle"

project.ext.sentryCli = [
    logLevel: "debug",
    flakeRetries: 5
]
```

### iOS

**ios/sentry.properties:**
```properties
defaults.url=https://sentry.io/
defaults.org=your-org
defaults.project=your-project
auth.token=YOUR_AUTH_TOKEN
```

**Upload on build:**
```bash
# Automatically done by Sentry wizard
# Or manually:
sentry-cli releases files VERSION upload-sourcemaps --dist DIST build/
```

## Monitoring

### Alert Rules

**In Sentry Dashboard:**
1. **Alerts** → **Create Alert**
2. Set conditions:
   - Error count > 100 in 1 hour
   - New issue
   - Regression (previously resolved)
3. Set actions:
   - Email notification
   - Slack notification
   - PagerDuty

### Custom Metrics

```typescript
import { captureMessage } from '@utils/sentry';

// Track business metrics
captureMessage('Purchase completed', 'info', {
  tags: {
    revenue: 'true',
  },
  extra: {
    amount: 99.99,
    currency: 'USD',
  },
});
```

## Testing

### Test Sentry

```typescript
import { captureException, captureMessage } from '@utils/sentry';

// Send test error
const testSentry = () => {
  try {
    throw new Error('Test Sentry Integration');
  } catch (error) {
    captureException(error as Error, {
      tags: { test: 'true' },
    });
  }
};

// Send test message
captureMessage('Sentry test message', 'info');
```

### Test Logger

```typescript
import logger from '@utils/logger';

logger.debug('Debug test');
logger.info('Info test');
logger.warn('Warning test');
logger.error('Error test', new Error('Test error'));
logger.fatal('Fatal test', new Error('Fatal error'));

// Check history
console.log(logger.getHistory());
```

## Performance Impact

### Minimize Overhead

```typescript
// ✅ Good - Lazy data collection
logger.error('Failed', error, {
  data: getExpensiveData(), // Only called if logging enabled
});

// ❌ Bad - Eager evaluation
const data = getExpensiveData(); // Always called
logger.error('Failed', error, { data });
```

### Sample in Production

```typescript
// Only log 10% of info events in production
if (!__DEV__ && Math.random() > 0.9) {
  logger.info('User action', data);
}
```

## Troubleshooting

### Sentry Not Receiving Events

1. **Check DSN:**
   ```typescript
   console.log('Sentry DSN configured:', SENTRY_DSN ? 'Yes' : 'No');
   ```

2. **Check Network:**
   - Sentry requires internet connection
   - Check firewall/proxy settings

3. **Check Source Maps:**
   ```bash
   # Verify upload
   sentry-cli releases files VERSION list
   ```

### Logs Not Showing

1. **Check Log Level:**
   ```typescript
   // Ensure logger is enabled
   console.log('Logging enabled:', logger.enableConsoleLogging);
   ```

2. **Check Sentry Integration:**
   ```typescript
   import * as Sentry from '@sentry/react-native';
   console.log('Sentry enabled:', Sentry.getCurrentHub().getClient()?.getOptions().enabled);
   ```

## Resources

- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
- [Error Tracking Best Practices](https://blog.sentry.io/error-monitoring-best-practices/)
- [Logging Best Practices](https://www.loggly.com/ultimate-guide/node-logging-basics/)
- [Source Maps Guide](https://docs.sentry.io/platforms/react-native/sourcemaps/)

## Summary

**Sentry (Phase 174):**
- 🔍 Automatic error tracking
- 📊 Performance monitoring
- 🎯 Issue grouping and alerts
- 🗺️ Source maps for debugging

**Custom Logger (Phase 175):**
- 📝 Structured logging
- 🎚️ Multiple log levels
- ⏱️ Performance tracking
- 📈 Log history and export

Together, they provide comprehensive error tracking and logging for production apps!
