# Build Optimization Guide
**Phase 163: Optimizing Build Size and Performance**

## Overview

This guide covers build optimization strategies for the KooDTX React Native app to reduce bundle size, improve startup time, and enhance overall performance.

## Optimization Areas

### 1. Hermes Engine

Hermes is a JavaScript engine optimized for React Native, providing faster startup, reduced memory usage, and smaller bundle size.

#### Enable Hermes

**Android (android/app/build.gradle):**
```gradle
project.ext.react = [
    enableHermes: true,
]
```

**iOS (Podfile):**
```ruby
use_react_native!(
  :path => config[:reactNativePath],
  :hermes_enabled => true
)
```

#### Verify Hermes

```javascript
// In your app
if (global.HermesInternal) {
  console.log('Hermes is enabled');
} else {
  console.log('Hermes is NOT enabled');
}
```

#### Hermes Benefits

- **Faster startup**: ~2x faster compared to JSC
- **Smaller APK**: ~30% smaller bundle size
- **Lower memory**: ~50% less memory usage
- **Better performance**: Optimized bytecode execution

### 2. ProGuard/R8 (Android)

ProGuard/R8 shrinks, obfuscates, and optimizes your app code.

#### Configuration

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

#### ProGuard Rules

See `android/app/proguard-rules.pro` for complete rules including:
- React Native core
- Hermes
- Third-party libraries
- Data models
- Native methods

#### Testing ProGuard

```bash
# Build release APK
cd android
./gradlew assembleRelease

# Test the release build thoroughly
# ProGuard may break functionality if rules are incorrect
```

### 3. Metro Bundler Optimization

#### Inline Requires

Lazy load modules to reduce startup time:

**metro.config.js:**
```javascript
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        inlineRequires: true,
      },
    }),
  },
};
```

**Usage:**
```javascript
// ❌ Bad - Eager loading
import LargeComponent from './LargeComponent';

function MyScreen() {
  return <LargeComponent />;
}

// ✅ Good - Lazy loading
function MyScreen() {
  const LargeComponent = require('./LargeComponent').default;
  return <LargeComponent />;
}
```

#### Remove Console Logs

**metro.config.js:**
```javascript
minifierConfig: {
  compress: {
    drop_console: true,
  },
}
```

### 4. Image Optimization

#### Formats

Use appropriate image formats:
- **PNG**: Transparency, icons, simple graphics
- **JPEG**: Photos, complex images
- **WebP**: Modern format, smaller size (50% smaller than JPEG)

#### Compression

```bash
# Install tools
npm install -g imagemin imagemin-cli imagemin-webp

# Compress images
imagemin src/assets/images/*.{jpg,png} --out-dir=src/assets/images-optimized --plugin=webp

# Or use online tools
# - TinyPNG (https://tinypng.com)
# - Squoosh (https://squoosh.app)
```

#### Resolution Strategy

Provide multiple resolutions:
```
assets/
  images/
    logo.png       # 1x (baseline)
    logo@2x.png    # 2x (high DPI)
    logo@3x.png    # 3x (very high DPI)
```

React Native automatically selects the appropriate resolution.

#### Image Component Optimization

```tsx
import FastImage from 'react-native-fast-image';

// ✅ Use FastImage for better caching and performance
<FastImage
  source={{
    uri: 'https://example.com/image.jpg',
    priority: FastImage.priority.normal,
  }}
  resizeMode={FastImage.resizeMode.contain}
  style={styles.image}
/>

// ❌ Avoid large images
// Resize images before bundling
```

### 5. Bundle Size Analysis

#### Android

```bash
cd android
./gradlew assembleRelease --scan

# APK Analyzer
# 1. Build > Analyze APK in Android Studio
# 2. Open app-release.apk
# 3. View size breakdown
```

#### iOS

```bash
# Archive the app in Xcode
# Window > Organizer > Select Archive > Distribute App
# View App Thinning Size Report
```

#### JavaScript Bundle

```bash
# Generate bundle stats
npx react-native-bundle-visualizer

# Opens visualization in browser
# Shows which modules consume the most space
```

### 6. Code Splitting

#### Dynamic Imports

```javascript
// ❌ Bad - Large bundle
import HeavyLibrary from 'heavy-library';

// ✅ Good - Load on demand
const loadHeavyLibrary = async () => {
  const HeavyLibrary = await import('heavy-library');
  return HeavyLibrary.default;
};
```

#### Screen Lazy Loading

```tsx
import React, { lazy, Suspense } from 'react';

// Lazy load screens
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Stack.Navigator>
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </Suspense>
  );
}
```

### 7. Dependency Optimization

#### Audit Dependencies

```bash
# List dependencies with sizes
npm list --depth=0

# Analyze what's in your bundle
npx depcheck

# Find duplicate dependencies
npm dedupe
```

#### Replace Heavy Dependencies

| Heavy | Lightweight Alternative |
|-------|-------------------------|
| moment (232 KB) | date-fns (13 KB) or Day.js (7 KB) |
| lodash (full: 531 KB) | lodash-es (tree-shakeable) |
| axios (15 KB) | fetch API (built-in) |

#### Tree Shaking

Use ES6 imports for tree shaking:

```javascript
// ❌ Bad - Imports entire library
import _ from 'lodash';

// ✅ Good - Imports only what's needed
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
```

### 8. Font Optimization

#### Subset Fonts

Include only needed characters:

```bash
# Install pyftsubset
pip install fonttools

# Create subset
pyftsubset Font.ttf \
  --output-file=Font-subset.ttf \
  --unicodes=U+0020-007E,U+00A0-00FF
```

#### Load Fonts Efficiently

```javascript
// Preload fonts at app startup
import * as Font from 'expo-font';

const loadFonts = async () => {
  await Font.loadAsync({
    'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
  });
};
```

### 9. Native Module Optimization

#### Disable Unused Modules

**react-native.config.js:**
```javascript
module.exports = {
  dependencies: {
    'react-native-camera': {
      platforms: {
        android: null, // Disable if not used on Android
      },
    },
  },
};
```

#### Auto-linking

React Native 0.60+ auto-links native modules. Remove manual linking if present.

### 10. Build Variants

Create optimized build variants for different scenarios.

#### Android

**android/app/build.gradle:**
```gradle
android {
    flavorDimensions "version"
    productFlavors {
        dev {
            dimension "version"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
            resValue "string", "app_name", "KooDTX Dev"
        }
        staging {
            dimension "version"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
            resValue "string", "app_name", "KooDTX Staging"
        }
        prod {
            dimension "version"
            resValue "string", "app_name", "KooDTX"
        }
    }
}
```

Build specific variant:
```bash
./gradlew assembleProdRelease
./gradlew assembleDevDebug
```

## Performance Metrics

### Target Sizes

| Platform | Target | Good | Acceptable |
|----------|--------|------|------------|
| Android APK | < 20 MB | < 30 MB | < 50 MB |
| Android AAB | < 15 MB | < 25 MB | < 40 MB |
| iOS IPA | < 25 MB | < 40 MB | < 60 MB |

### Startup Time

| Metric | Target | Good |
|--------|--------|------|
| Time to Interactive | < 2s | < 3s |
| JS Bundle Load | < 1s | < 1.5s |

## Optimization Checklist

### Before Release

- [ ] Enable Hermes
- [ ] Enable ProGuard/R8
- [ ] Optimize images (WebP, compression)
- [ ] Remove console.logs
- [ ] Enable inline requires
- [ ] Analyze bundle size
- [ ] Remove unused dependencies
- [ ] Use lightweight alternatives
- [ ] Test on low-end devices
- [ ] Profile with Hermes Profiler

### Images

- [ ] Compress all images
- [ ] Use WebP where possible
- [ ] Provide @2x and @3x versions
- [ ] Remove unused images
- [ ] Use FastImage for network images

### Code

- [ ] Remove dead code
- [ ] Use dynamic imports for large modules
- [ ] Lazy load screens
- [ ] Tree shake dependencies
- [ ] Use memoization (React.memo, useMemo)

### Native

- [ ] Disable unused native modules
- [ ] Remove manual linking if auto-linked
- [ ] Optimize native code (if any)

## Testing Optimizations

### Before Optimization

1. Measure baseline metrics
2. Record bundle size
3. Measure startup time
4. Profile memory usage

### After Optimization

1. Compare bundle sizes
2. Test app functionality thoroughly
3. Verify performance improvements
4. Test on real devices (low-end and high-end)

### Regression Testing

```bash
# Run full test suite
npm test

# Run E2E tests
npm run e2e:test:ios
npm run e2e:test:android

# Manual testing checklist
# - Login flow
# - Data loading
# - Navigation
# - Forms
# - Charts
# - Offline mode
```

## Tools

### Bundle Analysis

```bash
# React Native Bundle Visualizer
npx react-native-bundle-visualizer

# Source Map Explorer
npm install -g source-map-explorer
source-map-explorer bundle.js bundle.js.map
```

### Performance Profiling

```bash
# Hermes Profiler
npx react-native profile-hermes

# React DevTools Profiler
# Enable in app and profile interactions
```

### Size Comparison

```bash
# Before
du -h android/app/build/outputs/apk/release/app-release.apk

# After optimization
du -h android/app/build/outputs/apk/release/app-release.apk

# Compare
# Calculate percentage reduction
```

## Troubleshooting

### App Crashes After ProGuard

**Solution:** Add keep rules for affected classes in `proguard-rules.pro`

```proguard
-keep class com.yourpackage.problematic.** { *; }
```

### Images Not Loading

**Solution:** Check if images are properly imported and linked

```bash
# Re-link assets
npx react-native-asset
```

### Bundle Size Not Reducing

**Solutions:**
1. Clear Metro cache: `npx react-native start --reset-cache`
2. Clean build: `cd android && ./gradlew clean`
3. Check if minification is enabled
4. Verify ProGuard rules are correct

## Best Practices

1. **Measure First**: Always measure before optimizing
2. **Test Thoroughly**: Optimization can break functionality
3. **Progressive**: Optimize incrementally, not all at once
4. **Profile**: Use profiling tools to identify bottlenecks
5. **Real Devices**: Test on actual low-end devices
6. **Monitor**: Track bundle size over time
7. **Document**: Document optimization decisions

## References

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Hermes Documentation](https://hermesengine.dev/)
- [ProGuard Manual](https://www.guardsquare.com/manual/home)
- [Metro Bundler](https://facebook.github.io/metro/)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)
- [iOS App Thinning](https://developer.apple.com/documentation/xcode/reducing-your-app-s-size)
