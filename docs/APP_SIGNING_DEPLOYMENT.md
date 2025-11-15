# App Signing and Deployment Guide
**Phase 164: Code Signing and Distribution**

## Overview

This guide covers code signing and deployment for both Android and iOS platforms.

## Android Signing

### 1. Generate Upload Keystore

**For first-time setup:**

```bash
# Generate keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore upload-keystore.keystore \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_KEYSTORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Your Name, OU=Your Organization, O=Your Company, L=Your City, ST=Your State, C=Your Country Code"
```

**Interactive mode:**

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore upload-keystore.keystore \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You'll be prompted for:
# - Keystore password
# - Key password
# - Name, organization, etc.
```

**IMPORTANT:** Store the keystore file securely! You cannot recover it if lost.

### 2. Store Keystore Safely

```bash
# Move keystore to secure location
mv upload-keystore.keystore /path/to/secure/location/

# Set permissions (Unix/Mac)
chmod 600 /path/to/secure/location/upload-keystore.keystore

# Backup to encrypted storage
# - 1Password
# - LastPass
# - Hardware security key
# - Encrypted external drive
```

### 3. Configure Gradle

**android/gradle.properties:**

```properties
UPLOAD_STORE_FILE=upload-keystore.keystore
UPLOAD_STORE_PASSWORD=your_keystore_password
UPLOAD_KEY_ALIAS=upload
UPLOAD_KEY_PASSWORD=your_key_password
```

**Add to .gitignore:**

```gitignore
# Signing files
*.keystore
*.jks
gradle.properties
```

**android/app/build.gradle:**

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('UPLOAD_STORE_FILE')) {
                storeFile file(UPLOAD_STORE_FILE)
                storePassword UPLOAD_STORE_PASSWORD
                keyAlias UPLOAD_KEY_ALIAS
                keyPassword UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. Build Release APK/AAB

**Build APK:**

```bash
cd android
./gradlew clean
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

**Build AAB (Android App Bundle):**

```bash
cd android
./gradlew clean
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

**Verify Signing:**

```bash
# Check APK signature
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk

# Get SHA fingerprints
keytool -list -v -keystore upload-keystore.keystore -alias upload
```

### 5. Google Play App Signing

Google Play uses **app signing** for enhanced security.

**Initial Setup:**

1. **Build and upload first AAB** to Google Play Console
2. **Opt in to Google Play App Signing**
3. **Download app signing certificate** (for third-party services)

**Key Hierarchy:**

```
Upload Key (you hold)
    ↓
Google Play Signing Key (Google holds)
    ↓
Installed App
```

**Benefits:**

- Lost key recovery
- Signing key security
- App bundle optimization
- Automatic APK generation

### 6. Testing Release Build

**Install on device:**

```bash
# Install APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Or using bundletool for AAB
bundletool build-apks --bundle=app-release.aab --output=app-release.apks --mode=universal
bundletool install-apks --apks=app-release.apks
```

**Test thoroughly:**

- Login/logout
- Data sync
- API calls
- Offline mode
- Permissions
- Push notifications

## iOS Signing

### 1. Apple Developer Account

**Requirements:**

- Apple Developer Account ($99/year)
- macOS with Xcode installed
- Valid payment method

**Enroll at:** https://developer.apple.com/programs/enroll/

### 2. App ID

**Create App ID:**

1. **Go to:** [Apple Developer Portal](https://developer.apple.com/account/)
2. **Certificates, IDs & Profiles** → **Identifiers** → **+**
3. **Select:** App IDs → **Continue**
4. **Configure:**
   - Description: KooDTX
   - Bundle ID: `com.koodtx` (explicit)
   - Capabilities: (select as needed)
     - Push Notifications
     - Associated Domains
     - Sign in with Apple
     - etc.
5. **Register**

### 3. Certificates

#### Development Certificate

1. **Generate CSR:**
   ```
   Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
   - User Email Address: your@email.com
   - Common Name: Your Name
   - Request is: Saved to disk
   ```

2. **Create Certificate:**
   - Developer Portal → Certificates → **+**
   - Select: iOS App Development
   - Upload CSR
   - Download certificate
   - Double-click to install in Keychain

#### Distribution Certificate

1. **Generate CSR** (same as above)

2. **Create Certificate:**
   - Developer Portal → Certificates → **+**
   - Select: iOS Distribution (App Store and Ad Hoc)
   - Upload CSR
   - Download certificate
   - Double-click to install in Keychain

### 4. Provisioning Profiles

#### Development Profile

1. **Create Profile:**
   - Developer Portal → Profiles → **+**
   - Select: iOS App Development
   - App ID: Select your app
   - Certificates: Select your dev certificate
   - Devices: Select test devices
   - Profile Name: KooDTX Development
   - Download

2. **Install Profile:**
   ```bash
   # Double-click to install, or:
   cp KooDTX_Development.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/
   ```

#### Distribution Profile

1. **Create Profile:**
   - Developer Portal → Profiles → **+**
   - Select: App Store
   - App ID: Select your app
   - Certificates: Select your distribution certificate
   - Profile Name: KooDTX Distribution
   - Download

2. **Install Profile:**
   ```bash
   cp KooDTX_Distribution.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/
   ```

### 5. Xcode Configuration

**ios/KooDTX.xcworkspace:**

1. **Open in Xcode**
2. **Select project** → **Signing & Capabilities**
3. **Team:** Select your team
4. **Bundle Identifier:** `com.koodtx`
5. **Signing Certificate:** iOS Distribution
6. **Provisioning Profile:** KooDTX Distribution

**Automatic Signing:**

```
✓ Automatically manage signing
Team: Your Team
```

**Manual Signing:**

```
☐ Automatically manage signing
Provisioning Profile: KooDTX Distribution
Signing Certificate: iOS Distribution
```

### 6. Build Settings

**ios/KooDTX/Info.plist:**

```xml
<key>CFBundleDisplayName</key>
<string>KooDTX</string>
<key>CFBundleIdentifier</key>
<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

**Version Management:**

- **CFBundleShortVersionString**: User-visible version (1.0.0, 1.0.1)
- **CFBundleVersion**: Build number (1, 2, 3, ...)

### 7. Create Archive

**Via Xcode:**

1. **Product** → **Scheme** → **Edit Scheme**
2. **Run** → **Build Configuration** → **Release**
3. **Product** → **Archive**
4. **Wait for archive to complete**

**Via Command Line:**

```bash
cd ios

# Clean build folder
xcodebuild clean -workspace KooDTX.xcworkspace -scheme KooDTX

# Archive
xcodebuild archive \
  -workspace KooDTX.xcworkspace \
  -scheme KooDTX \
  -configuration Release \
  -archivePath build/KooDTX.xcarchive \
  CODE_SIGN_IDENTITY="iPhone Distribution" \
  PROVISIONING_PROFILE_SPECIFIER="KooDTX Distribution"
```

### 8. Export IPA

**Via Xcode:**

1. **Window** → **Organizer**
2. **Select Archive** → **Distribute App**
3. **App Store Connect** → **Next**
4. **Upload** → **Next**
5. **Select provisioning profile**
6. **Upload**

**Via Command Line:**

**Create ExportOptions.plist:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>compileBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>provisioningProfiles</key>
    <dict>
        <key>com.koodtx</key>
        <string>KooDTX Distribution</string>
    </dict>
</dict>
</plist>
```

**Export:**

```bash
xcodebuild -exportArchive \
  -archivePath build/KooDTX.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist
```

### 9. Testing Release Build

**TestFlight:**

1. **Upload to App Store Connect** (via Xcode or Transporter)
2. **Wait for processing** (~10-30 minutes)
3. **Add internal testers**
4. **Distribute build**
5. **Testers receive notification**
6. **Test thoroughly**

**Ad Hoc Distribution:**

1. **Create Ad Hoc provisioning profile**
2. **Add device UDIDs**
3. **Export IPA with ad hoc method**
4. **Distribute via:**
   - Xcode (Window → Devices and Simulators)
   - Testflight
   - Third-party services (Diawi, TestFairy)

## Security Best Practices

### 1. Keystore/Certificate Security

```bash
# ✅ Do
- Store in encrypted location
- Backup in multiple secure locations
- Use strong passwords (20+ characters)
- Limit access to necessary personnel
- Use hardware security keys if possible

# ❌ Don't
- Commit to version control
- Share via email
- Store in cloud storage (unless encrypted)
- Use weak passwords
- Share with contractors without NDA
```

### 2. Password Management

**Use password managers:**

- 1Password
- LastPass
- Bitwarden
- Apple Keychain

**Generate strong passwords:**

```bash
# macOS
openssl rand -base64 32

# Linux
pwgen 32 1
```

### 3. Secrets in CI/CD

**GitHub Secrets:**

```bash
# Add secrets via GitHub UI
Settings → Secrets and variables → Actions → New repository secret

# Access in workflow
${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
```

**Environment Variables:**

```bash
# Never hardcode
❌ const API_KEY = 'abc123';

# Use environment variables
✅ const API_KEY = process.env.API_KEY;
```

## Versioning Strategy

### Semantic Versioning

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1 → 1.1.0 → 2.0.0
```

**Rules:**

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Build Numbers

**iOS:**

```
Increment CFBundleVersion for every build
1, 2, 3, 4, ...
```

**Android:**

```gradle
// android/app/build.gradle
android {
    defaultConfig {
        versionCode 1      // Increment for every release
        versionName "1.0.0"
    }
}
```

### Automation

**Fastlane:**

```ruby
# Fastfile
lane :bump_version do
  increment_version_number(version_number: "1.0.1")
  increment_build_number
end
```

## Deployment Automation

### Fastlane Setup

**Install:**

```bash
# Install Fastlane
sudo gem install fastlane -NV

# Or using Homebrew
brew install fastlane
```

**Initialize:**

```bash
cd ios
fastlane init

cd ../android
fastlane init
```

### Android Deployment Lane

**android/fastlane/Fastfile:**

```ruby
platform :android do
  desc "Deploy to Google Play"
  lane :deploy do
    gradle(
      task: "clean bundleRelease",
      project_dir: "android/"
    )

    upload_to_play_store(
      track: 'production',
      aab: 'android/app/build/outputs/bundle/release/app-release.aab',
      skip_upload_screenshots: true,
      skip_upload_images: true
    )
  end
end
```

### iOS Deployment Lane

**ios/fastlane/Fastfile:**

```ruby
platform :ios do
  desc "Deploy to App Store"
  lane :deploy do
    increment_build_number

    build_app(
      workspace: "KooDTX.xcworkspace",
      scheme: "KooDTX"
    )

    upload_to_app_store(
      skip_metadata: true,
      skip_screenshots: true
    )
  end
end
```

## Troubleshooting

### Android Issues

**Issue:** "Could not find or load main class org.gradle.wrapper.GradleWrapperMain"

**Solution:**
```bash
cd android
./gradlew wrapper
./gradlew clean
```

**Issue:** "Keystore was tampered with, or password was incorrect"

**Solution:**
- Verify password in gradle.properties
- Check keystore file path
- Ensure keystore file is not corrupted

### iOS Issues

**Issue:** "No profiles for 'com.koodtx' were found"

**Solution:**
- Create provisioning profile in Developer Portal
- Download and install profile
- Refresh profiles in Xcode (Preferences → Accounts → Download Manual Profiles)

**Issue:** "Code signing error"

**Solution:**
- Verify certificate is valid and installed
- Check provisioning profile matches bundle ID
- Ensure certificate is in Keychain
- Restart Xcode

## References

- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [iOS Code Signing](https://developer.apple.com/support/code-signing/)
- [Google Play Console](https://play.google.com/console/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Fastlane Documentation](https://docs.fastlane.tools/)
