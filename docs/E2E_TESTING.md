# E2E Testing Guide
**Phase 161: End-to-End Testing with Detox**

## Overview

This guide covers end-to-end (E2E) testing for the KooDTX React Native app using Detox. E2E tests simulate real user interactions to ensure the app works correctly from the user's perspective.

## Prerequisites

### Installation

```bash
# Install Detox CLI globally
npm install -g detox-cli

# Install dependencies
npm install --save-dev detox jest

# iOS setup
cd ios && pod install && cd ..

# Android setup - ensure Android SDK and emulator are configured
```

### iOS Setup

**Install applesimutils (required for Detox):**
```bash
brew tap wix/brew
brew install applesimutils
```

**Xcode Configuration:**
1. Open `ios/KooDTX.xcworkspace` in Xcode
2. Build > Build For > Testing (⌘⇧U)

### Android Setup

**Create AVD (Android Virtual Device):**
```bash
# List available AVDs
avdmanager list avd

# Create AVD if needed
avdmanager create avd -n Pixel_5_API_31 -k "system-images;android-31;google_apis;x86_64"
```

**Update android/build.gradle:**
```gradle
buildscript {
    ext {
        kotlinVersion = '1.8.0'
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:7.4.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion"
    }
}
```

## Project Structure

```
KooDTX/
├── .detoxrc.js           # Detox configuration
├── e2e/
│   ├── jest.config.js    # Jest configuration for E2E
│   ├── helpers.ts        # Test helper utilities
│   ├── auth.test.ts      # Authentication flow tests
│   └── sensorData.test.ts # Sensor data flow tests
```

## Configuration

### .detoxrc.js

The main Detox configuration file defines:
- **Test runner**: Jest with 120s timeout
- **Apps**: iOS/Android debug/release builds
- **Devices**: Simulators and emulators
- **Configurations**: Platform-specific setups

### e2e/jest.config.js

Jest configuration for E2E tests:
- Test timeout: 120 seconds
- Max workers: 1 (sequential execution)
- Detox test environment

## Running Tests

### Build App for Testing

**iOS:**
```bash
# Debug build
detox build --configuration ios.sim.debug

# Release build
detox build --configuration ios.sim.release
```

**Android:**
```bash
# Debug build
detox build --configuration android.emu.debug

# Release build
detox build --configuration android.emu.release
```

### Run Tests

**iOS:**
```bash
# Run all tests
detox test --configuration ios.sim.debug

# Run specific test file
detox test --configuration ios.sim.debug e2e/auth.test.ts

# Run with specific test name
detox test --configuration ios.sim.debug --testNamePattern="should login successfully"
```

**Android:**
```bash
# Start emulator first
emulator -avd Pixel_5_API_31

# Run all tests
detox test --configuration android.emu.debug

# Run specific test file
detox test --configuration android.emu.debug e2e/sensorData.test.ts
```

### Additional Options

```bash
# Run in headless mode
detox test --configuration ios.sim.debug --headless

# Record video
detox test --configuration ios.sim.debug --record-videos all

# Take screenshots on failure
detox test --configuration ios.sim.debug --take-screenshots failing

# Reuse existing build
detox test --configuration ios.sim.debug --reuse

# Debug mode
detox test --configuration ios.sim.debug --loglevel trace
```

## Writing Tests

### Basic Test Structure

```typescript
import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Feature Name', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it('should do something', async () => {
    // Your test logic
  });
});
```

### Element Matchers

```typescript
// By ID (most reliable)
element(by.id('login-button'))

// By text
element(by.text('Login'))

// By label (accessibility label)
element(by.label('Login Button'))

// By type
element(by.type('RCTTextInput'))

// By traits
element(by.traits(['button']))

// Combined matchers
element(by.id('login-button').and(by.label('Login')))
```

### Element Actions

```typescript
// Tap
await element(by.id('login-button')).tap();

// Type text
await element(by.id('email-input')).typeText('test@example.com');

// Clear text
await element(by.id('email-input')).clearText();

// Replace text
await element(by.id('email-input')).replaceText('new@example.com');

// Swipe
await element(by.id('scroll-view')).swipe('up', 'fast', 0.75);

// Scroll
await element(by.id('scroll-view')).scrollTo('bottom');

// Long press
await element(by.id('item')).longPress(1000);

// Multi-tap
await element(by.id('item')).multiTap(2);
```

### Element Assertions

```typescript
// Visibility
await detoxExpect(element(by.id('login-button'))).toBeVisible();
await detoxExpect(element(by.id('hidden'))).not.toBeVisible();

// Existence
await detoxExpect(element(by.id('item'))).toExist();
await detoxExpect(element(by.id('removed'))).not.toExist();

// Text
await detoxExpect(element(by.id('title'))).toHaveText('Welcome');

// Label
await detoxExpect(element(by.id('button'))).toHaveLabel('Submit');

// Value
await detoxExpect(element(by.id('input'))).toHaveValue('test@example.com');
```

### Wait For Element

```typescript
// Wait for element to be visible
await waitFor(element(by.id('main-screen')))
  .toBeVisible()
  .withTimeout(5000);

// Wait for element to not be visible
await waitFor(element(by.id('loading')))
  .not.toBeVisible()
  .withTimeout(3000);

// Wait while scrolling
await waitFor(element(by.id('item-50')))
  .toBeVisible()
  .whileElement(by.id('scroll-view'))
  .scroll(200, 'down');
```

### Device Actions

```typescript
// Launch app
await device.launchApp({ newInstance: true });

// Terminate app
await device.terminateApp();

// Reload React Native
await device.reloadReactNative();

// Send to background
await device.sendToHome();

// Shake device
await device.shake();

// Set orientation
await device.setOrientation('landscape');
await device.setOrientation('portrait');

// Set location
await device.setLocation(37.5665, 126.9780); // Seoul

// Take screenshot
await device.takeScreenshot('login-screen');
```

## Test Helpers

We've created helper functions in `e2e/helpers.ts` for common tasks:

### Authentication

```typescript
import { login, logout } from './helpers';

// Login with default credentials
await login();

// Login with custom credentials
await login('custom@example.com', 'CustomPass123');

// Logout
await logout();
```

### Navigation

```typescript
import { navigateToTab, waitAndTap } from './helpers';

// Navigate to tab
await navigateToTab('sensors');

// Wait for element and tap
await waitAndTap('submit-button', 3000);
```

### Form Handling

```typescript
import { submitForm, typeText } from './helpers';

// Type text
await typeText('email-input', 'test@example.com');

// Submit form
await submitForm('login-form', {
  'email-input': 'test@example.com',
  'password-input': 'Test1234!',
}, 'login-button');
```

### Network

```typescript
import { setNetworkStatus, waitForNetworkIdle } from './helpers';

// Disable network
await setNetworkStatus(false);

// Enable network
await setNetworkStatus(true);

// Wait for network requests to complete
await waitForNetworkIdle(5000);
```

### Screenshots

```typescript
import { takeScreenshot } from './helpers';

await takeScreenshot('login-success');
```

## Best Practices

### 1. Use Test IDs

Always add `testID` prop to elements you want to test:

```tsx
<TouchableOpacity testID="login-button" onPress={handleLogin}>
  <Text>Login</Text>
</TouchableOpacity>
```

### 2. Wait for Elements

Never assume elements are immediately available:

```typescript
// ❌ Bad - may fail if element isn't ready
await element(by.id('login-button')).tap();

// ✅ Good - wait for element first
await waitFor(element(by.id('login-button')))
  .toBeVisible()
  .withTimeout(3000);
await element(by.id('login-button')).tap();
```

### 3. Clean State Between Tests

```typescript
beforeEach(async () => {
  await device.reloadReactNative();
  // Or logout if already logged in
  if (await elementExists('logout-button')) {
    await logout();
  }
});
```

### 4. Use Helper Functions

Don't repeat common flows - create helpers:

```typescript
// ❌ Bad - repetitive
await element(by.id('email-input')).typeText('test@example.com');
await element(by.id('password-input')).typeText('Test1234!');
await element(by.id('login-button')).tap();

// ✅ Good - use helper
await login('test@example.com', 'Test1234!');
```

### 5. Descriptive Test Names

```typescript
// ❌ Bad
it('test login', async () => { ... });

// ✅ Good
it('should show validation error for invalid email format', async () => { ... });
```

### 6. One Assertion Per Test

Try to test one thing at a time:

```typescript
// ❌ Bad - testing multiple things
it('should login and show dashboard and sync data', async () => {
  await login();
  await detoxExpect(element(by.id('dashboard'))).toBeVisible();
  await element(by.id('sync-button')).tap();
  await detoxExpect(element(by.id('sync-success'))).toBeVisible();
});

// ✅ Good - separate concerns
it('should show dashboard after login', async () => {
  await login();
  await detoxExpect(element(by.id('dashboard'))).toBeVisible();
});

it('should sync data successfully', async () => {
  await login();
  await element(by.id('sync-button')).tap();
  await detoxExpect(element(by.id('sync-success'))).toBeVisible();
});
```

### 7. Handle Loading States

```typescript
// Wait for loading to complete
await waitFor(element(by.id('loading-indicator')))
  .not.toBeVisible()
  .withTimeout(5000);
```

### 8. Test Edge Cases

```typescript
describe('Edge Cases', () => {
  it('should handle offline mode', async () => {
    await setNetworkStatus(false);
    // Test offline behavior
  });

  it('should handle app backgrounding', async () => {
    await sendToBackground(2000);
    // Test app state restoration
  });

  it('should handle orientation change', async () => {
    await setOrientation('landscape');
    // Test layout in landscape
  });
});
```

## Troubleshooting

### Common Issues

#### 1. "Detox can't seem to connect to the test app"

**Solution:**
```bash
# Kill all simulators
killall Simulator

# Rebuild app
detox build --configuration ios.sim.debug

# Run again
detox test --configuration ios.sim.debug
```

#### 2. "Element not found"

**Solutions:**
- Check that `testID` is set on the element
- Wait for element with `waitFor()`
- Check element is visible in the UI
- Use `--loglevel trace` for detailed logs

#### 3. "Test timeout"

**Solutions:**
- Increase timeout in test or `waitFor()`
- Check for infinite loading states
- Verify network requests complete
- Use `device.reloadReactNative()` in `beforeEach`

#### 4. Android Emulator Issues

**Solutions:**
```bash
# Start emulator manually
emulator -avd Pixel_5_API_31

# Check ADB devices
adb devices

# Reverse port for metro bundler
adb reverse tcp:8081 tcp:8081

# Clear app data
adb shell pm clear com.koodtx
```

#### 5. iOS Simulator Issues

**Solutions:**
```bash
# Reset simulator
xcrun simctl erase all

# Reinstall app
detox build --configuration ios.sim.debug

# Check logs
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "KooDTX"'
```

### Debug Mode

Run tests with detailed logs:

```bash
# Verbose Detox logs
detox test --configuration ios.sim.debug --loglevel trace

# React Native logs
detox test --configuration ios.sim.debug --record-logs all

# Take screenshots on all actions
detox test --configuration ios.sim.debug --take-screenshots all
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install pods
        run: cd ios && pod install

      - name: Build app
        run: detox build --configuration ios.sim.release

      - name: Run E2E tests
        run: detox test --configuration ios.sim.release --cleanup

      - name: Upload artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: detox-artifacts
          path: artifacts/

  e2e-android:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup Android SDK
        uses: android-actions/setup-android@v2

      - name: Install dependencies
        run: npm ci

      - name: AVD cache
        uses: actions/cache@v3
        with:
          path: |
            ~/.android/avd/*
            ~/.android/adb*
          key: avd-31

      - name: Create AVD
        run: |
          echo "no" | avdmanager create avd -n test -k "system-images;android-31;google_apis;x86_64" --force

      - name: Build app
        run: detox build --configuration android.emu.release

      - name: Run E2E tests
        run: detox test --configuration android.emu.release --headless

      - name: Upload artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: detox-artifacts
          path: artifacts/
```

## Performance Tips

### 1. Reuse Build

```bash
# Build once
detox build --configuration ios.sim.debug

# Run tests multiple times without rebuilding
detox test --configuration ios.sim.debug --reuse
```

### 2. Run Tests in Parallel (use with caution)

```bash
# Increase max workers
detox test --configuration ios.sim.debug --workers 2
```

### 3. Run Specific Tests

```bash
# Run single test file
detox test e2e/auth.test.ts

# Run tests matching pattern
detox test --testNamePattern="login"
```

## References

- [Detox Documentation](https://wix.github.io/Detox/)
- [Jest Documentation](https://jestjs.io/)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [Detox GitHub](https://github.com/wix/Detox)
