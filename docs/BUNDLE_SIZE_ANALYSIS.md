# Bundle Size Analysis Guide
**Phase 167: Analyzing and Optimizing Bundle Size**

## Overview

This guide covers analyzing your React Native bundle size, identifying large dependencies, and implementing optimizations.

## Quick Start

### Automatic Analysis

```bash
# Make script executable
chmod +x scripts/analyze-bundle.sh

# Run full analysis
./scripts/analyze-bundle.sh all

# Or run specific analysis
./scripts/analyze-bundle.sh android
./scripts/analyze-bundle.sh ios
./scripts/analyze-bundle.sh duplicates
```

### Manual Analysis

```bash
# Install bundle visualizer
npm install --save-dev react-native-bundle-visualizer

# Analyze Android bundle
npx react-native-bundle-visualizer \
  --platform android \
  --dev false \
  --output-format html

# Analyze iOS bundle
npx react-native-bundle-visualizer \
  --platform ios \
  --dev false \
  --output-format html
```

## Bundle Size Targets

| Platform | Excellent | Good | Acceptable | Needs Work |
|----------|-----------|------|------------|------------|
| Android JS | < 500 KB | < 1 MB | < 2 MB | > 2 MB |
| iOS JS | < 500 KB | < 1 MB | < 2 MB | > 2 MB |
| Android APK | < 20 MB | < 30 MB | < 50 MB | > 50 MB |
| iOS IPA | < 25 MB | < 40 MB | < 60 MB | > 60 MB |

## Common Large Dependencies

### Replace Heavy Libraries

| Library | Size | Lighter Alternative | Savings |
|---------|------|---------------------|---------|
| moment | 232 KB | date-fns (13 KB) or Day.js (7 KB) | ~220 KB |
| lodash (full) | 531 KB | lodash-es (tree-shakeable) | ~400 KB |
| axios | 15 KB | fetch API (built-in) | 15 KB |
| uuid | 15 KB | react-native-uuid (7 KB) | 8 KB |

### Example: Replace moment with date-fns

**Before (moment):**
```typescript
import moment from 'moment';

const formatted = moment(date).format('YYYY-MM-DD');
const diff = moment(date1).diff(moment(date2), 'days');
```

**After (date-fns):**
```typescript
import { format, differenceInDays } from 'date-fns';

const formatted = format(date, 'yyyy-MM-dd');
const diff = differenceInDays(date1, date2);
```

**Savings:** ~220 KB

### Example: Replace lodash with lodash-es

**Before (full lodash):**
```typescript
import _ from 'lodash';

const debounced = _.debounce(fn, 300);
const cloned = _.cloneDeep(obj);
```

**After (tree-shakeable):**
```typescript
import debounce from 'lodash-es/debounce';
import cloneDeep from 'lodash-es/cloneDeep';

const debounced = debounce(fn, 300);
const cloned = cloneDeep(obj);
```

**Savings:** ~400 KB (only imports what you use)

## Identifying Large Dependencies

### Using Bundle Visualizer

```bash
npx react-native-bundle-visualizer
```

This opens an interactive visualization showing:
- Module sizes
- Dependencies tree
- Duplicate modules
- Import paths

**Look for:**
1. **Large modules** (> 50 KB)
2. **Duplicate versions** (same package, different versions)
3. **Unused code** (imported but not used)
4. **Heavy polyfills**

### Using npm-check

```bash
# Install globally
npm install -g npm-check

# Run check
npm-check

# Interactive update
npm-check -u
```

**Identifies:**
- Unused dependencies
- Outdated packages
- Missing dependencies

### Using depcheck

```bash
# Install globally
npm install -g depcheck

# Run check
depcheck

# With options
depcheck --ignores="@types/*,eslint-*"
```

**Finds:**
- Unused dependencies
- Unused dev dependencies
- Missing dependencies

## Finding Duplicate Dependencies

### Method 1: npm dedupe

```bash
# Dry run (see what would change)
npm dedupe --dry-run

# Actually dedupe
npm dedupe

# Check for duplicates
npm ls <package-name>
```

### Method 2: yarn-deduplicate

```bash
# Install
npm install -g yarn-deduplicate

# Run
yarn-deduplicate yarn.lock

# Apply changes
yarn install
```

### Method 3: Manual Check

```bash
# Find all versions of a package
npm ls react-native
npm ls lodash

# Check for duplicates in node_modules
find node_modules -name "package.json" -exec grep -l "\"name\": \"lodash\"" {} \; | wc -l
```

## Code Splitting Strategies

### 1. Dynamic Imports

```typescript
// ❌ Bad - Always loads
import HeavyComponent from './HeavyComponent';

function App() {
  return <HeavyComponent />;
}

// ✅ Good - Lazy loads
import React, { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 2. Route-Based Splitting

```typescript
import { lazy, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Lazy load screens
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home">
          {() => (
            <Suspense fallback={<Loading />}>
              <HomeScreen />
            </Suspense>
          )}
        </Stack.Screen>
        <Stack.Screen name="Profile">
          {() => (
            <Suspense fallback={<Loading />}>
              <ProfileScreen />
            </Suspense>
          )}
        </Stack.Screen>
        <Stack.Screen name="Settings">
          {() => (
            <Suspense fallback={<Loading />}>
              <SettingsScreen />
            </Suspense>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 3. Feature-Based Splitting

```typescript
// Load features on demand
const loadAnalytics = async () => {
  const { default: analytics } = await import('./features/analytics');
  return analytics;
};

const loadReporting = async () => {
  const { default: reporting } = await import('./features/reporting');
  return reporting;
};

// Use when needed
async function enableAnalytics() {
  const analytics = await loadAnalytics();
  analytics.init();
}
```

## Tree Shaking

### What is Tree Shaking?

Tree shaking eliminates unused code from your bundle. Modern bundlers (Metro, Webpack) support this for ES6 modules.

### Enable Tree Shaking

**metro.config.js:**
```javascript
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // Helps with tree shaking
      },
    }),
  },
};
```

### Write Tree-Shakeable Code

```typescript
// ❌ Bad - Imports entire library
import _ from 'lodash';
const result = _.debounce(fn, 300);

// ✅ Good - Only imports what's needed
import debounce from 'lodash/debounce';
const result = debounce(fn, 300);

// ❌ Bad - Exports everything as single object
export default {
  util1,
  util2,
  util3,
};

// ✅ Good - Named exports
export { util1 };
export { util2 };
export { util3 };
```

## Optimization Checklist

### Dependencies

- [ ] Remove unused dependencies
- [ ] Deduplicate dependencies
- [ ] Replace large libraries with smaller alternatives
- [ ] Use tree-shakeable imports
- [ ] Check for duplicate package versions

### Code

- [ ] Enable inline requires (Metro)
- [ ] Implement code splitting for routes
- [ ] Lazy load heavy components
- [ ] Remove dead code
- [ ] Use dynamic imports for features

### Assets

- [ ] Compress images (WebP, TinyPNG)
- [ ] Remove unused images
- [ ] Use vector graphics where possible
- [ ] Lazy load images

### Build Configuration

- [ ] Enable Hermes
- [ ] Enable ProGuard/R8 (Android)
- [ ] Enable minification
- [ ] Remove console.logs in production
- [ ] Enable source maps for debugging

## Measuring Impact

### Before Optimization

```bash
# 1. Build release bundle
./scripts/analyze-bundle.sh android

# 2. Note the size
# Example: 2.5 MB

# 3. Save report
mv bundle-size-report.txt bundle-size-before.txt
```

### After Optimization

```bash
# 1. Build release bundle
./scripts/analyze-bundle.sh android

# 2. Note the size
# Example: 1.8 MB

# 3. Compare
diff bundle-size-before.txt bundle-size-report.txt
```

### Calculate Savings

```
Before: 2.5 MB
After: 1.8 MB
Savings: 0.7 MB (28% reduction)
```

## Continuous Monitoring

### 1. Add to CI/CD

**.github/workflows/ci.yml:**
```yaml
- name: Analyze bundle size
  run: |
    npm run build:bundle
    BUNDLE_SIZE=$(du -k android-release.bundle | cut -f1)
    echo "Bundle size: ${BUNDLE_SIZE} KB"

    # Fail if bundle is too large
    if [ "$BUNDLE_SIZE" -gt 2000 ]; then
      echo "Bundle size exceeds 2 MB!"
      exit 1
    fi
```

### 2. Bundle Size Badge

Add to README.md:

```markdown
![Bundle Size](https://img.shields.io/badge/bundle%20size-1.8MB-brightgreen)
```

### 3. Track Over Time

```bash
# Save size to history
echo "$(date),$(du -k android-release.bundle | cut -f1)" >> bundle-size-history.csv

# View trends
cat bundle-size-history.csv
```

## Common Issues

### Issue: Bundle Still Large After Optimization

**Solutions:**
1. Check for large dependencies you missed
2. Enable Hermes if not already enabled
3. Verify ProGuard is enabled (Android)
4. Check for duplicate dependencies
5. Review imported images and assets

### Issue: App Crashes After Optimization

**Solutions:**
1. Check ProGuard rules (may have removed needed code)
2. Verify all dynamic imports are correct
3. Test thoroughly on real devices
4. Check for missing polyfills

### Issue: Slow Startup After Code Splitting

**Solutions:**
1. Preload critical routes
2. Use inline requires for frequently used modules
3. Reduce number of split points
4. Profile with React DevTools

## Tools Summary

| Tool | Purpose | Command |
|------|---------|---------|
| react-native-bundle-visualizer | Visualize bundle composition | `npx react-native-bundle-visualizer` |
| npm dedupe | Remove duplicate dependencies | `npm dedupe` |
| depcheck | Find unused dependencies | `npx depcheck` |
| npm-check | Check for updates and unused deps | `npm-check` |
| source-map-explorer | Analyze source map | `npx source-map-explorer bundle.js bundle.js.map` |
| bundle-stats | Track bundle changes over time | `npx bundle-stats` |

## Best Practices

1. **Measure First**: Always measure current size before optimizing
2. **Incremental Changes**: Make one change at a time and measure impact
3. **Test Thoroughly**: Optimization can break functionality
4. **Monitor Continuously**: Add bundle size checks to CI/CD
5. **Document Changes**: Keep track of what was optimized and why
6. **Set Budgets**: Define acceptable bundle sizes and enforce them
7. **Review Regularly**: Check bundle size with each major release

## References

- [Metro Bundler Documentation](https://facebook.github.io/metro/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [size-limit](https://github.com/ai/size-limit)
- [bundlesize](https://github.com/siddharthkp/bundlesize)
