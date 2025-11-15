# ProGuard/R8 Obfuscation Guide
**Phase 170: Code Shrinking and Obfuscation for Android**

## Overview

ProGuard and R8 are code shrinkers and obfuscators for Android. They reduce APK size, improve security, and optimize performance.

## What is R8?

R8 is Google's code shrinker that replaced ProGuard as the default in Android Gradle Plugin 3.4.0+. It's faster and more efficient than ProGuard.

| Feature | ProGuard | R8 |
|---------|----------|-----|
| Shrinking | ✅ | ✅ Faster |
| Obfuscation | ✅ | ✅ Better |
| Optimization | ✅ | ✅ More aggressive |
| Dex compilation | ❌ | ✅ Integrated |
| Performance | Good | Excellent |

## Benefits

- **Size Reduction**: 20-40% smaller APK
- **Security**: Makes reverse engineering harder
- **Performance**: Removes unused code, optimizes
- **Startup**: Faster app startup

## Enabling R8

### android/app/build.gradle

```gradle
android {
    buildTypes {
        release {
            // Enable code shrinking and obfuscation
            minifyEnabled true

            // Enable resource shrinking
            shrinkResources true

            // ProGuard rules files
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'

            // Optionally enable code shrinking for debug builds too
            // debuggable true
        }

        // Enable for debug if needed
        debug {
            minifyEnabled false
        }
    }
}
```

**Configuration Options:**

| Option | Purpose | Recommended |
|--------|---------|-------------|
| `minifyEnabled` | Enable code shrinking | `true` for release |
| `shrinkResources` | Remove unused resources | `true` for release |
| `proguard-android.txt` | Basic rules | For compatibility |
| `proguard-android-optimize.txt` | Optimized rules | For best performance |

## ProGuard Rules

### android/app/proguard-rules.pro

See the complete rules in `android/app/proguard-rules.pro` (created in Phase 163).

**Key sections:**

1. **React Native core**
2. **Hermes engine**
3. **Third-party libraries**
4. **Native methods**
5. **Data models**
6. **Optimization settings**

### Understanding Rules

```proguard
# Keep class
-keep class com.example.MyClass { *; }

# Keep only class name (obfuscate members)
-keep class com.example.MyClass

# Keep methods
-keepclassmembers class com.example.MyClass {
    public <methods>;
}

# Keep fields
-keepclassmembers class com.example.MyClass {
    private <fields>;
}

# Don't warn about missing classes
-dontwarn com.example.SomeClass

# Keep class names (don't obfuscate)
-keepnames class com.example.** { *; }

# Keep attributes
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
```

## Common Rules for React Native

### React Native Core

```proguard
# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native modules
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.bridge.** { *; }
```

### Native Modules

```proguard
# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep classes that use JNI
-keep class com.facebook.jni.** { *; }
```

### Third-Party Libraries

```proguard
# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }

# Gson (JSON parsing)
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Retrofit
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }

# React Native Keychain
-keep class com.oblador.keychain.** { *; }

# React Native AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }
```

### Your Code

```proguard
# Keep your data models
-keep class com.koodtx.models.** { *; }
-keep class com.koodtx.api.** { *; }

# Keep serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
```

## Testing ProGuard/R8

### Build Release APK

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### Check APK Size

```bash
# Before minification
du -h app/build/outputs/apk/debug/app-debug.apk

# After minification
du -h app/build/outputs/apk/release/app-release.apk

# Compare
# Debug: 45 MB
# Release: 28 MB (38% reduction)
```

### Test Functionality

**Critical tests:**

1. **App launches** without crashing
2. **Login/logout** works
3. **API calls** succeed
4. **Navigation** works
5. **Data persistence** (AsyncStorage, SQLite)
6. **Native modules** function correctly
7. **Third-party SDKs** work

### Analyze APK

**Android Studio:**
1. Build > Analyze APK
2. Open `app-release.apk`
3. View:
   - Classes (obfuscated names)
   - Resources
   - Size breakdown

**Command Line:**
```bash
# Unzip APK
unzip app-release.apk -d apk-contents

# View classes
dex2jar classes.dex
jar -xvf classes-dex2jar.jar

# Decompile with jadx
jadx apk-contents/classes.dex
```

## Troubleshooting

### Issue 1: App Crashes on Startup

**Cause:** Critical class was removed/obfuscated

**Solution:** Add keep rule

```proguard
# Keep the problematic class
-keep class com.example.CriticalClass { *; }

# Or keep entire package
-keep class com.example.critical.** { *; }
```

### Issue 2: Reflection Errors

**Cause:** Class accessed via reflection was obfuscated

**Solution:**

```proguard
# Keep classes used via reflection
-keep class com.example.MyReflectedClass { *; }

# Or use @Keep annotation
-keep @interface androidx.annotation.Keep
-keep @androidx.annotation.Keep class * { *; }
```

**In code:**
```java
import androidx.annotation.Keep;

@Keep
public class MyClass {
    // This class won't be obfuscated
}
```

### Issue 3: Native Method Errors

**Cause:** JNI methods were removed

**Solution:**

```proguard
# Keep all native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
```

### Issue 4: Serialization Errors

**Cause:** Serializable classes were modified

**Solution:**

```proguard
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
```

### Issue 5: Missing Classes Warnings

**Cause:** Classes not found in classpath

**Solution:**

```proguard
# Ignore warnings for specific classes
-dontwarn com.example.MissingClass

# Or ignore all warnings (not recommended)
# -ignorewarnings
```

## Mapping Files

### What are Mapping Files?

ProGuard/R8 generates mapping files that translate obfuscated names back to original names.

**Location:**
```
app/build/outputs/mapping/release/mapping.txt
```

**Example:**
```
com.koodtx.MainActivity -> a.b.c:
    void onCreate() -> a
    void onDestroy() -> b
```

### Using Mapping Files

**Deobfuscate stack traces:**

```bash
# Install retrace
# (included with Android SDK)

# Deobfuscate
retrace mapping.txt obfuscated-stacktrace.txt
```

**Before:**
```
at a.b.c.a(Unknown Source)
at a.b.d.b(Unknown Source)
```

**After:**
```
at com.koodtx.MainActivity.onCreate(MainActivity.java:42)
at com.koodtx.MyService.onStart(MyService.java:15)
```

### Upload to Crash Reporting

**Firebase Crashlytics:**

```gradle
// android/app/build.gradle
buildTypes {
    release {
        firebaseCrashlytics {
            mappingFileUploadEnabled true
        }
    }
}
```

**Sentry:**

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Upload mapping file
sentry-cli upload-proguard \
    --android-manifest android/app/src/main/AndroidManifest.xml \
    --write-properties app/build/outputs/mapping/release/mapping.txt
```

## Optimization

### Aggressive Optimization

```proguard
# More aggressive optimization
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# Repackage classes into single package
-repackageclasses ''

# Merge interfaces aggressively
-mergeinterfacesaggressively

# Overload obfuscated names aggressively
-overloadaggressively

# Use mixed-case class names
-dontusemixedcaseclassnames
```

### Remove Logging

```proguard
# Remove all logging in production
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}
```

## Security Considerations

### What ProGuard Protects

- ✅ Class names (obfuscated)
- ✅ Method names (obfuscated)
- ✅ Field names (obfuscated)
- ✅ Dead code removed
- ✅ Makes reverse engineering harder

### What ProGuard Doesn't Protect

- ❌ String literals (visible)
- ❌ Resource names (visible)
- ❌ Native code (separate protection needed)
- ❌ Reflection-based code (if kept)

### Additional Security

**Encrypt strings:**
```java
// Use string encryption library
String apiKey = StringEncryptor.decrypt("encrypted_api_key");
```

**Use NDK for sensitive code:**
```cpp
// Move critical logic to C++
extern "C" JNIEXPORT jstring JNICALL
Java_com_example_Security_validateLicense(JNIEnv* env, jobject) {
    // Critical validation logic
}
```

**Root detection:**
```java
if (RootChecker.isDeviceRooted()) {
    // Block functionality or warn user
}
```

## Best Practices

### 1. Test Early and Often

```bash
# Test release build frequently
./gradlew assembleRelease

# Install and test
adb install app/build/outputs/apk/release/app-release.apk
```

### 2. Keep Mapping Files

```bash
# Save mapping files for each release
cp app/build/outputs/mapping/release/mapping.txt \
   mappings/mapping-v1.0.0-build-123.txt
```

### 3. Use Specific Rules

```proguard
# ❌ Too broad
-keep class com.** { *; }

# ✅ Specific
-keep class com.koodtx.models.User { *; }
-keep class com.koodtx.api.AuthApi { *; }
```

### 4. Document Rules

```proguard
# Keep user model for Gson serialization
# Used in LoginResponse and ProfileResponse
-keep class com.koodtx.models.User { *; }
```

### 5. Monitor Crashes

```tsx
import crashlytics from '@react-native-firebase/crashlytics';

crashlytics().log('ProGuard enabled: true');
```

## Performance Impact

### Before/After Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| APK Size | 45 MB | 28 MB | 38% |
| Startup Time | 2.5s | 2.1s | 16% |
| Method Count | 85,000 | 52,000 | 39% |

### Measuring Impact

```bash
# Method count
# Install dexcount-gradle-plugin

# android/app/build.gradle
plugins {
    id 'com.getkeepsafe.dexcount'
}

# Run
./gradlew countReleaseApks
```

## Checklist

### Before Enabling

- [ ] Backup current codebase
- [ ] Document current APK size
- [ ] List critical functionality to test
- [ ] Review third-party library requirements

### During Configuration

- [ ] Enable minifyEnabled
- [ ] Enable shrinkResources
- [ ] Add ProGuard rules
- [ ] Configure mapping file upload

### After Enabling

- [ ] Build release APK
- [ ] Test all functionality
- [ ] Check APK size reduction
- [ ] Verify crash reporting works
- [ ] Save mapping files
- [ ] Document any issues

## Resources

- [ProGuard Manual](https://www.guardsquare.com/manual/home)
- [R8 Documentation](https://developer.android.com/studio/build/shrink-code)
- [ProGuard Rules Examples](https://github.com/krschultz/android-proguard-snippets)
- [Android Shrink Resources](https://developer.android.com/studio/build/shrink-code#shrink-resources)

## Summary

ProGuard/R8 is essential for production Android apps:
- 📦 Significantly reduces APK size
- 🔒 Improves code security
- ⚡ Optimizes performance
- 🛡️ Protects intellectual property

Configure it carefully, test thoroughly, and keep those mapping files safe!
