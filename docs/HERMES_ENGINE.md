# Hermes Engine Guide
**Phase 169: Enabling and Optimizing Hermes Engine**

## Overview

Hermes is a JavaScript engine optimized for React Native. It provides faster app startup, reduced memory usage, and smaller app size.

## Benefits

| Metric | Improvement |
|--------|-------------|
| App startup time | ~2x faster |
| Memory usage | ~50% less |
| APK size | ~30% smaller |
| Time to Interactive (TTI) | ~40% faster |

## Enabling Hermes

### Android

**android/app/build.gradle:**
```gradle
project.ext.react = [
    enableHermes: true,  // Enable Hermes
]

apply from: "../../node_modules/react-native/react.gradle"
```

**Rebuild the app:**
```bash
cd android
./gradlew clean
./gradlew assembleRelease

# Or
cd ..
npx react-native run-android --variant=release
```

### iOS

**ios/Podfile:**
```ruby
use_react_native!(
  :path => config[:reactNativePath],
  # Enable Hermes engine
  :hermes_enabled => true
)
```

**Install pods and rebuild:**
```bash
cd ios
pod install
cd ..
npx react-native run-ios --configuration Release
```

## Verifying Hermes

### Method 1: In-App Check

Add to your app:

```tsx
import { Text } from 'react-native';

function App() {
  const isHermes = () => !!global.HermesInternal;

  return (
    <Text>
      Engine: {isHermes() ? 'Hermes' : 'JSC'}
    </Text>
  );
}
```

### Method 2: Chrome DevTools

1. Open app in debug mode
2. Open Chrome DevTools
3. Look for "Hermes" in the Console tab

### Method 3: Check Binary

**Android:**
```bash
# Check if libhermes.so is present
unzip -l android/app/build/outputs/apk/release/app-release.apk | grep hermes

# Should show: lib/arm64-v8a/libhermes.so
```

**iOS:**
```bash
# Check frameworks
ls -la ios/build/Build/Products/Release-iphoneos/KooDTX.app/Frameworks/

# Should include hermes.framework
```

## Performance Comparison

### Startup Time

**Measure with:**
```tsx
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App';

const startTime = Date.now();

const AppWithMetrics = () => {
  useEffect(() => {
    const endTime = Date.now();
    const startupTime = endTime - startTime;
    console.log(`App startup time: ${startupTime}ms`);
  }, []);

  return <App />;
};

AppRegistry.registerComponent(appName, () => AppWithMetrics);
```

**Expected results:**
- JSC: ~2000-3000ms
- Hermes: ~1000-1500ms

### Memory Usage

**Monitor with:**
```tsx
import { NativeModules } from 'react-native';

const checkMemory = () => {
  if (global.HermesInternal) {
    const stats = global.HermesInternal.getInstrumentedStats();
    console.log('Memory usage:', stats);
  }
};
```

### Bundle Size

**Before Hermes:**
```bash
du -h android/app/build/outputs/apk/release/app-release.apk
# Example: 45 MB
```

**After Hermes:**
```bash
du -h android/app/build/outputs/apk/release/app-release.apk
# Example: 32 MB (~30% smaller)
```

## Hermes-Specific Optimizations

### 1. Bytecode Precompilation

Hermes can compile JavaScript to bytecode ahead of time:

**metro.config.js:**
```javascript
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    // Hermes bytecode compilation
    hermesCommand: './node_modules/hermes-engine/linux64-bin/hermesc',
  },
};
```

### 2. Use Hermes Profiler

**Start profiling:**
```bash
# Android
adb shell am start -n com.koodtx/.MainActivity --enable-sampling-profiler

# Use the app for a while

# Download profile
adb pull /data/user/0/com.koodtx/cache/sampling-profiler.cpuprofile

# Open in Chrome DevTools
# chrome://tracing
# Load the .cpuprofile file
```

**Analyze:**
- Identify slow functions
- Find bottlenecks
- Optimize hot paths

### 3. Optimize for Hermes

```tsx
// ✅ Good - Hermes optimizes these well
const result = array.map(x => x * 2);
const filtered = array.filter(x => x > 10);
const reduced = array.reduce((sum, x) => sum + x, 0);

// ❌ Avoid - Slower in Hermes
eval('1 + 1'); // Don't use eval
new Function('return 1 + 1')(); // Don't use Function constructor

// ✅ Use native methods when possible
JSON.parse(jsonString);
JSON.stringify(object);
```

## Troubleshooting

### Issue 1: App Crashes on Startup

**Cause:** Incompatible native modules or polyfills

**Solution:**
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ../ios
pod deintegrate
pod install
cd ..

# Rebuild
npx react-native run-android
npx react-native run-ios
```

### Issue 2: JavaScript Errors

**Cause:** Some JavaScript features not supported in Hermes

**Solution:** Use polyfills

**Install:**
```bash
npm install @react-native/polyfills
```

**Import in index.js:**
```javascript
import '@react-native/polyfills';
```

### Issue 3: Slow Performance

**Cause:** Not using Hermes optimizations

**Solutions:**
1. Enable inline requires
2. Use Hermes profiler to find bottlenecks
3. Avoid eval() and Function()
4. Use native methods when possible

### Issue 4: Large Bundle Size

**Cause:** Debug symbols included

**Solution:** Enable ProGuard/R8 (Android)

**android/app/build.gradle:**
```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Hermes Features

### Supported

- ✅ ES6+ syntax (const, let, arrow functions, classes)
- ✅ Promises, async/await
- ✅ Template literals
- ✅ Destructuring
- ✅ Spread operator
- ✅ Map, Set, WeakMap, WeakSet
- ✅ Symbols
- ✅ Proxies
- ✅ Generators

### Not Supported (as of React Native 0.70+)

- ❌ eval() (use with caution)
- ❌ Function() constructor
- ❌ Some Intl APIs (use polyfills)

### Polyfills Needed

```bash
# Install polyfills
npm install @react-native/polyfills

# Or specific polyfills
npm install intl
npm install date-time-format-timezone
```

## Comparing Engines

### Hermes vs JSC (JavaScriptCore)

| Feature | Hermes | JSC |
|---------|--------|-----|
| Startup time | ⚡ Faster (2x) | Slower |
| Memory usage | 📉 Lower (50% less) | Higher |
| Bundle size | 📦 Smaller (30% less) | Larger |
| Debugging | Chrome DevTools | Safari/Chrome |
| iOS | ✅ Supported | ✅ Default |
| Android | ✅ Recommended | ✅ Supported |

### When to Use Hermes

**✅ Use Hermes if:**
- You want faster startup times
- Memory is a concern
- Target low-end devices
- Bundle size matters

**❌ Avoid Hermes if:**
- You need unsupported features (eval, etc.)
- Debugging JSC-specific issues
- Third-party libraries incompatible

## Migration Checklist

### Before Migration

- [ ] Backup your project
- [ ] Test current performance metrics
- [ ] Check third-party library compatibility
- [ ] Review Hermes limitations

### During Migration

- [ ] Enable Hermes in build files
- [ ] Clean and rebuild
- [ ] Test all features thoroughly
- [ ] Check for JavaScript errors
- [ ] Profile performance

### After Migration

- [ ] Verify Hermes is active
- [ ] Measure performance improvements
- [ ] Test on multiple devices
- [ ] Monitor crash reports
- [ ] Update documentation

## Performance Monitoring

### Startup Time

```tsx
const AppStartupMonitor = () => {
  useEffect(() => {
    const startupTime = Date.now() - global.__START_TIME__;
    console.log(`Hermes startup: ${startupTime}ms`);

    // Send to analytics
    Analytics.trackEvent('app_startup', {
      time: startupTime,
      engine: 'hermes',
    });
  }, []);

  return null;
};
```

### Memory Usage

```tsx
const MemoryMonitor = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      if (global.HermesInternal) {
        const stats = global.HermesInternal.getInstrumentedStats();
        console.log('Memory:', {
          heapSize: stats.js_heapSize,
          allocatedBytes: stats.js_allocatedBytes,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return null;
};
```

## Best Practices

### 1. Enable Inline Requires

**metro.config.js:**
```javascript
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        inlineRequires: true, // ✅ Helps Hermes optimize
      },
    }),
  },
};
```

### 2. Use Memoization

```tsx
import { useMemo, useCallback } from 'react';

function MyComponent({ data }) {
  // ✅ Hermes optimizes memoized values well
  const processed = useMemo(() => {
    return data.map(item => item * 2);
  }, [data]);

  const handlePress = useCallback(() => {
    console.log('Pressed');
  }, []);

  return <View />;
}
```

### 3. Avoid Eval

```tsx
// ❌ Bad - Slow in Hermes
const result = eval('1 + 1');

// ✅ Good - Direct execution
const result = 1 + 1;
```

### 4. Use Native Methods

```tsx
// ✅ Hermes has optimized implementations
JSON.parse(jsonString);
JSON.stringify(object);
Object.keys(object);
Object.values(object);
Array.isArray(value);
```

## Advanced Configuration

### Custom Hermes Build

For advanced users who need custom Hermes builds:

```bash
# Clone Hermes
git clone https://github.com/facebook/hermes.git
cd hermes

# Build
cmake -S . -B build -DHERMES_ENABLE_DEBUGGER=ON
cmake --build ./build
```

### Hermes Debugging

**Enable source maps:**

**metro.config.js:**
```javascript
module.exports = {
  serializer: {
    createModuleIdFactory: () => (path) => {
      // Custom module ID
      return path.replace(/^.*\/node_modules\//, '');
    },
  },
};
```

## Monitoring Production

### Crash Reporting

```tsx
import crashlytics from '@react-native-firebase/crashlytics';

// Log Hermes info
crashlytics().log('Using Hermes engine');
crashlytics().setAttribute('js_engine', 'hermes');

// Track errors
try {
  // Your code
} catch (error) {
  crashlytics().recordError(error);
}
```

### Analytics

```tsx
import analytics from '@react-native-firebase/analytics';

// Track performance
analytics().logEvent('app_performance', {
  engine: 'hermes',
  startup_time: startupTime,
  memory_usage: memoryUsage,
});
```

## Resources

- [Hermes Official Docs](https://hermesengine.dev/)
- [React Native Hermes Guide](https://reactnative.dev/docs/hermes)
- [Hermes GitHub](https://github.com/facebook/hermes)
- [Hermes Profiler Guide](https://reactnative.dev/docs/profile-hermes)
- [Performance Optimization](https://reactnative.dev/docs/performance)

## Summary

Hermes provides significant performance improvements for React Native apps with minimal configuration. Enable it, test thoroughly, and enjoy faster, more efficient apps!

**Key Takeaways:**
- ⚡ 2x faster startup
- 📉 50% less memory
- 📦 30% smaller bundle
- 🎯 Better for low-end devices
- 🔧 Easy to enable
