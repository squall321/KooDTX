# Phase 232: Pre-Launch Checklist & Play Console Setup

**Estimated Time:** 4 hours
**Priority:** Critical
**Prerequisites:** Phase 231 completed (Store assets ready)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Part 1: Google Play Console Setup](#part-1-google-play-console-setup)
3. [Part 2: App Build & Signing](#part-2-app-build--signing)
4. [Part 3: Pre-Launch Testing](#part-3-pre-launch-testing)
5. [Part 4: Final Submission](#part-4-final-submission)
6. [Troubleshooting](#troubleshooting)
7. [Post-Submission](#post-submission)

---

## Overview

### 🎯 Objectives

This phase prepares KooDTX for production release on Google Play Store:
- Set up Google Play Console account
- Generate production-ready signed app bundle
- Conduct comprehensive pre-launch testing
- Submit app for review

### ✅ Success Criteria

- [ ] Google Play Console account created and verified
- [ ] Production AAB file generated and signed
- [ ] All pre-launch tests passed
- [ ] App submitted for review on Play Store

### 📦 Deliverables

1. Production keystore (securely stored)
2. Signed AAB file ready for upload
3. Completed Play Console listing
4. Pre-launch test report
5. Submission confirmation

---

## Part 1: Google Play Console Setup

**Time:** 1 hour

### Step 1.1: Create Developer Account

1. **Visit Google Play Console**
   - Go to: https://play.google.com/console
   - Sign in with your Google account

2. **Pay Registration Fee**
   - One-time fee: $25 USD
   - Payment methods: Credit/debit card, PayPal
   - Keep receipt for records

3. **Complete Developer Profile**
   ```
   Required Information:
   - Developer name: "KooDTX" or your organization name
   - Email address: support@koodtx.com
   - Phone number: +82-xxx-xxxx-xxxx
   - Website: https://koodtx.com (if available)
   - Physical address: Required for Korean apps
   ```

4. **Accept Agreements**
   - [ ] Google Play Developer Distribution Agreement
   - [ ] US Export Laws compliance
   - [ ] Content Policy guidelines
   - [ ] Developer Program Policies

5. **Verify Identity** (if required)
   - Upload government-issued ID
   - Verification takes 1-3 business days
   - Check email for confirmation

### Step 1.2: Create App in Play Console

1. **Create New App**
   ```
   Navigation: Play Console > All apps > Create app

   App Details:
   - App name: KooDTX - Sensor Data Logger
   - Default language: Korean (한국어)
   - App or game: App
   - Free or paid: Free
   ```

2. **Declarations**
   - [ ] This is not a game
   - [ ] App complies with Developer Program Policies
   - [ ] App complies with US export laws
   - [ ] Confirm app is free (no in-app purchases currently)

### Step 1.3: Set Up Store Listing

Navigate to: **Store presence > Main store listing**

#### App Details

```
App name: KooDTX - Sensor Data Logger
Short description: (Copy from store-assets/descriptions/short_description_en.txt)
Full description: (Copy from store-assets/descriptions/full_description_en.txt)
```

#### Graphics

Upload from `store-assets/` directory:

1. **App icon** (512x512px)
   - Location: `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
   - Upload 512x512 version

2. **Feature graphic** (1024x500px)
   - **TODO**: Create using design tool
   - Shows on top of store listing

3. **Phone screenshots** (minimum 2, recommended 8)
   - **TODO**: Capture from running app
   - 1080x1920px or similar aspect ratio
   - Upload in order: Home, Recording, Sensors, Visualization, etc.

4. **Tablet screenshots** (optional but recommended)
   - If supporting tablets: 1920x1080px or 2560x1600px

#### Categorization

```
App category: Tools
Tags (optional):
  - Sensor data
  - Research
  - Data collection
  - Scientific tools
```

#### Contact Details

```
Email: support@koodtx.com
Website: https://koodtx.com (or GitHub repository)
Privacy policy URL: https://koodtx.com/privacy (must be hosted)
```

**Important**: Privacy policy URL is **required** and must be publicly accessible before submission.

#### Store Settings (Optional)

```
App type: Not a game
Category: Tools
Tags: sensor, data, research
External marketing: No (unless you have marketing website)
```

### Step 1.4: Translation (Korean Listing)

1. **Add Korean Translation**
   - Click "Manage translations"
   - Add language: Korean (한국어)

2. **Korean Store Listing**
   ```
   앱 이름: KooDTX - 센서 데이터 수집기
   짧은 설명: (Copy from store-assets/descriptions/short_description_kr.txt)
   전체 설명: (Copy from store-assets/descriptions/full_description_kr.txt)
   ```

3. **Upload Korean Screenshots**
   - Same screenshots with Korean UI
   - Ensure app is in Korean language before capturing

---

## Part 2: App Build & Signing

**Time:** 1.5 hours

### Step 2.1: Create Production Keystore

**⚠️ CRITICAL**: Store keystore securely! Lost keystore = cannot update app ever!

```bash
# Navigate to android/app directory
cd android/app

# Create keystore directory (gitignored)
mkdir -p ../../keystores
cd ../../keystores

# Generate keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore koodtx-release.keystore \
  -alias koodtx-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "YOUR_STRONG_PASSWORD" \
  -keypass "YOUR_STRONG_PASSWORD" \
  -dname "CN=KooDTX, OU=Mobile, O=KooDTX, L=Seoul, ST=Seoul, C=KR"
```

**Prompts and Answers**:
```
Enter keystore password: [Create strong password, save in password manager]
Re-enter new password: [Same password]
What is your first and last name? KooDTX
What is the name of your organizational unit? Mobile
What is the name of your organization? KooDTX
What is the name of your City or Locality? Seoul
What is the name of your State or Province? Seoul
What is the two-letter country code for this unit? KR
Is CN=KooDTX, OU=Mobile, O=KooDTX, L=Seoul, ST=Seoul, C=KR correct? yes

Enter key password for <koodtx-release>: [Press Enter to use same password]
```

**Verify Keystore Created**:
```bash
keytool -list -v -keystore koodtx-release.keystore
# Enter password when prompted
# Should show key details and SHA fingerprints
```

### Step 2.2: Configure Gradle for Signing

1. **Create `gradle.properties` (LOCAL)**

Create or edit `android/gradle.properties`:

```properties
# Keystore Configuration (DO NOT COMMIT TO GIT!)
KOODTX_RELEASE_STORE_FILE=../../keystores/koodtx-release.keystore
KOODTX_RELEASE_KEY_ALIAS=koodtx-release
KOODTX_RELEASE_STORE_PASSWORD=YOUR_PASSWORD_HERE
KOODTX_RELEASE_KEY_PASSWORD=YOUR_PASSWORD_HERE
```

**⚠️ Security**:
- Add `gradle.properties` to `.gitignore` (should already be there)
- NEVER commit passwords to version control
- Use environment variables in CI/CD

2. **Update `android/app/build.gradle`**

Check if signing config exists. If not, add:

```gradle
android {
    ...

    signingConfigs {
        release {
            if (project.hasProperty('KOODTX_RELEASE_STORE_FILE')) {
                storeFile file(KOODTX_RELEASE_STORE_FILE)
                storePassword KOODTX_RELEASE_STORE_PASSWORD
                keyAlias KOODTX_RELEASE_KEY_ALIAS
                keyPassword KOODTX_RELEASE_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 2.3: Update Version Information

**Edit `android/app/build.gradle`**:

```gradle
android {
    defaultConfig {
        applicationId "com.koodtx"  // Verify this matches your package
        versionCode 1               // Increment for each release
        versionName "0.1.0"        // Matches package.json version
        // ... other config
    }
}
```

**Edit `package.json`**:
```json
{
  "name": "KooDTX",
  "version": "0.1.0",
  // ... rest
}
```

**Version Numbering Strategy**:
- `versionCode`: Integer that increases with each release (1, 2, 3, ...)
- `versionName`: User-visible version (0.1.0, 0.1.1, 0.2.0, ...)
- Follow semantic versioning: MAJOR.MINOR.PATCH

### Step 2.4: Configure ProGuard (Optional but Recommended)

ProGuard reduces APK size and obfuscates code.

**Edit `android/app/proguard-rules.pro`**:

```proguard
# Add rules to prevent breaking functionality
-keep class com.koodtx.** { *; }

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters

# WatermelonDB
-keep class com.nozbe.watermelondb.** { *; }
-dontwarn com.nozbe.watermelondb.**

# Sentry
-keep class io.sentry.** { *; }
-dontwarn io.sentry.**

# React Native permissions
-keep class com.zoontek.rnpermissions.** { *; }

# Add other library-specific rules as needed
```

### Step 2.5: Build Production AAB

**Clean and Build**:

```bash
# Navigate to android directory
cd android

# Clean previous builds
./gradlew clean

# Build release AAB (App Bundle)
./gradlew bundleRelease

# Build takes 2-5 minutes depending on machine
# Watch for any errors or warnings
```

**Expected Output**:
```
BUILD SUCCESSFUL in 3m 24s
151 actionable tasks: 151 executed

Generated AAB at:
android/app/build/outputs/bundle/release/app-release.aab
```

### Step 2.6: Verify AAB File

```bash
# Check file exists and size
ls -lh android/app/build/outputs/bundle/release/app-release.aab

# Expected size: 15-30 MB (depending on dependencies)

# Verify signing
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab

# Should show: "jar verified."
```

**Extract APK from AAB (for local testing)**:

```bash
# Install bundletool (if not installed)
# Download from: https://github.com/google/bundletool/releases

# Generate APK set from AAB
java -jar bundletool.jar build-apks \
  --bundle=android/app/build/outputs/bundle/release/app-release.aab \
  --output=koodtx-release.apks \
  --mode=universal

# Extract APK from APKS
unzip koodtx-release.apks -d koodtx-apk
# Universal APK is in koodtx-apk/universal.apk

# Install on connected device
adb install koodtx-apk/universal.apk
```

### Step 2.7: Backup Keystore Securely

**⚠️ CRITICAL STEP**

```bash
# Create encrypted backup
tar czf koodtx-keystore-backup-$(date +%Y%m%d).tar.gz keystores/

# Store in multiple secure locations:
# 1. Password manager (1Password, Bitwarden, etc.)
# 2. Encrypted USB drive
# 3. Secure cloud storage (Google Drive encrypted folder)
# 4. Company secure vault (if applicable)

# Record keystore details:
# - Alias: koodtx-release
# - Password: [in password manager]
# - SHA-1 fingerprint: [from keytool -list output]
# - SHA-256 fingerprint: [from keytool -list output]
# - Created date: 2025-11-15
```

---

## Part 3: Pre-Launch Testing

**Time:** 1 hour

### Step 3.1: Create Internal Test Track

1. **Navigate to Testing**
   - Play Console > Testing > Internal testing
   - Click "Create new release"

2. **Upload AAB**
   - Drag and drop `app-release.aab`
   - Wait for upload (30 seconds - 2 minutes)
   - Google Play scans for security issues

3. **Release Name**
   ```
   Release name: v0.1.0 - Initial Release
   Release notes (English):
   - Initial release of KooDTX
   - Sensor data collection (accelerometer, gyroscope, GPS, audio)
   - Offline-first local storage
   - Cloud synchronization
   - Data export (CSV/JSON)

   Release notes (Korean):
   - KooDTX 첫 번째 릴리스
   - 센서 데이터 수집 (가속도계, 자이로스코프, GPS, 오디오)
   - 오프라인 우선 로컬 저장
   - 클라우드 동기화
   - 데이터 내보내기 (CSV/JSON)
   ```

4. **Review and Roll Out**
   - Review release details
   - Click "Review release"
   - Click "Start rollout to Internal testing"

### Step 3.2: Add Test Users

1. **Create Testers List**
   ```
   Testers (email addresses):
   - your.email@gmail.com
   - colleague1@gmail.com
   - colleague2@gmail.com
   (Add 5-20 testers for comprehensive feedback)
   ```

2. **Share Testing Link**
   - Copy opt-in URL from Play Console
   - Send to testers via email
   - Example: https://play.google.com/apps/internaltest/...

3. **Tester Instructions**
   ```
   Subject: KooDTX Internal Testing Invitation

   Hi [Name],

   You're invited to test KooDTX before public launch!

   Steps:
   1. Click this link: [OPT-IN URL]
   2. Accept invitation
   3. Download app from Play Store
   4. Test for 2-3 days
   5. Report any issues to: support@koodtx.com

   Focus areas:
   - Sensor data collection accuracy
   - UI/UX feedback
   - Crash or error reports
   - Battery usage
   - Any unexpected behavior

   Thank you for helping improve KooDTX!
   ```

### Step 3.3: Pre-Launch Checklist

#### Functional Testing

- [ ] **App Installation**
  - Installs successfully from Play Store
  - App icon appears correctly
  - App name displays correctly

- [ ] **Permissions**
  - Location permission request works
  - Microphone permission request works
  - Storage permission request works (if needed)
  - Permission rationales are clear

- [ ] **Core Functionality**
  - Create new session
  - Start recording with multiple sensors
  - Stop recording
  - View session details
  - Export data to CSV
  - Export data to JSON
  - Delete session

- [ ] **Sensor Testing**
  - Accelerometer data collects correctly
  - Gyroscope data collects correctly
  - Magnetometer data collects correctly
  - GPS location tracks correctly
  - Audio recording works
  - Sampling rates configurable

- [ ] **Data Integrity**
  - Data saves to local database
  - Data persists after app restart
  - Exported CSV format correct
  - Exported JSON format correct
  - No data loss

- [ ] **Synchronization** (if server available)
  - Wi-Fi only mode works
  - Upload to server succeeds
  - Download from server succeeds
  - Sync status updates correctly
  - Retry on failure works

- [ ] **UI/UX**
  - All screens render correctly
  - Navigation works smoothly
  - No visual glitches
  - Text readable on all screen sizes
  - Dark/light mode works (if applicable)

- [ ] **Settings**
  - Change sampling rate
  - Toggle sync preferences
  - Configure API URL
  - Settings persist

#### Performance Testing

- [ ] **App Performance**
  - App starts in < 3 seconds
  - Smooth scrolling in session list
  - No lag during recording
  - Memory usage reasonable (< 200MB)

- [ ] **Battery Usage**
  - Normal usage: < 5% battery per hour
  - Recording: < 15% battery per hour
  - No background battery drain

- [ ] **Storage**
  - App size < 50MB
  - Database grows reasonably
  - Large sessions (10,000+ points) handle well

#### Compatibility Testing

Test on multiple devices:

- [ ] **Samsung** (Galaxy S21, S22, S23, etc.)
- [ ] **Google Pixel** (Pixel 6, 7, 8)
- [ ] **Other brands** (OnePlus, Xiaomi, LG)
- [ ] **Screen sizes**: Phone, Phablet, Tablet
- [ ] **Android versions**:
  - Android 10 (API 29)
  - Android 11 (API 30)
  - Android 12 (API 31)
  - Android 13 (API 33)
  - Android 14 (API 34)

#### Error Handling

- [ ] **Network Errors**
  - Airplane mode: App continues to work offline
  - Slow network: Sync times out gracefully
  - Server down: Error message clear

- [ ] **Permission Denied**
  - Location denied: Clear message shown
  - Microphone denied: Audio disabled gracefully
  - Settings link provided

- [ ] **Storage Full**
  - Low storage warning
  - Prevents data loss
  - Suggests cleanup

- [ ] **Crashes**
  - No crashes in normal usage
  - Sentry captures any crashes
  - Crash reports reviewed

#### Security Testing

- [ ] **Data Security**
  - Data encrypted in transit (HTTPS)
  - No sensitive data in logs
  - API keys not hardcoded

- [ ] **Privacy**
  - Privacy policy accessible
  - User data deletable
  - No unnecessary permissions

### Step 3.4: Collect Feedback

**Create Feedback Form** (Google Forms):

```
KooDTX Internal Test Feedback

1. Device Information
   - Device model: _______
   - Android version: _______

2. Installation (1-5 rating)
   - How easy was installation? _____
   - Any issues? _______

3. Core Features (1-5 rating)
   - Session creation: _____
   - Data recording: _____
   - Data export: _____
   - UI/UX: _____

4. Performance
   - App responsiveness: _____
   - Battery usage acceptable? Yes / No
   - Any lag or freezing? _______

5. Bugs/Issues
   - Describe any crashes: _______
   - Unexpected behavior: _______
   - Features not working: _______

6. Suggestions
   - What would improve the app? _______
   - Missing features? _______

7. Overall
   - Would you use this app? Yes / No / Maybe
   - Overall rating (1-5): _____
   - Additional comments: _______
```

---

## Part 4: Final Submission

**Time:** 30 minutes

### Step 4.1: Complete Content Rating

1. **Navigate to Content Rating**
   - Play Console > App content > Content rating
   - Click "Start questionnaire"

2. **Answer Questionnaire**

   **Email address**: support@koodtx.com

   **Category**: Utility, Productivity, Communication (choose Tools)

   **Questions** (likely answers for KooDTX):
   ```
   Does your app contain violence? No
   Does your app contain sexual content? No
   Does your app contain bad language? No
   Does your app contain controlled substances? No
   Does your app contain gambling content? No
   Does your app contain chat or social features? No
   Does your app share user location? Yes
     - Is location sharing optional? Yes
     - Is it for educational purposes? Yes (research)
   Does your app collect personal data? Yes
     - Sensor data for research purposes
     - User controls data deletion
   ```

3. **Review Rating**
   - Expected rating: **Everyone** or **Everyone 10+**
   - If rated higher, review answers

4. **Apply Rating**
   - Click "Apply rating"
   - Save changes

### Step 4.2: Set Up Pricing & Distribution

1. **Navigate to Pricing & Distribution**
   - Play Console > Monetization > Pricing & distribution

2. **Pricing**
   ```
   App pricing: Free
   Contains ads: No
   Contains in-app purchases: No (for now)
   ```

3. **Countries**
   ```
   Available in: All countries (or select specific)
   Primary country: South Korea
   ```

4. **Export Compliance**
   ```
   Does your app use encryption? Yes (HTTPS for API calls)
   - Select "Yes, my app uses encryption"
   - Choose "App uses standard encryption from Android/iOS"
   - No export authorization required
   ```

5. **Content Guidelines**
   - [ ] Confirm app follows Content Policy
   - [ ] Confirm app follows Developer Program Policies
   - [ ] Confirm US export laws compliance

6. **Save Changes**

### Step 4.3: App Access

If your app requires login or specific setup:

1. **Navigate to App Access**
   - Play Console > App content > App access

2. **Declare Access**
   ```
   All features are accessible without restrictions: Yes
   (KooDTX works offline, no login required)
   ```

   OR if you need tester credentials:
   ```
   Provide demo credentials:
   - Username: demo@koodtx.com
   - Password: [demo password]
   ```

### Step 4.4: Ads & Monetization

1. **Navigate to Ads**
   - Play Console > App content > Ads

2. **Declare Ads**
   ```
   Does your app contain ads? No
   ```

### Step 4.5: Target Audience

1. **Navigate to Target Audience**
   - Play Console > App content > Target audience

2. **Age Groups**
   ```
   Select target age groups:
   - [x] 13-17 years
   - [x] 18+ years

   App designed specifically for children? No
   ```

3. **Save**

### Step 4.6: Data Safety

**CRITICAL**: Google requires detailed data safety disclosure.

1. **Navigate to Data Safety**
   - Play Console > App content > Data safety
   - Click "Start"

2. **Data Collection & Security**

   **Does your app collect or share user data?** Yes

   **Collected Data Types**:

   - [x] **Location**
     - Approximate location: Yes (GPS data)
     - Precise location: Yes (GPS coordinates)
     - Collection purpose: App functionality (research/data collection)
     - Is collection optional: Yes
     - Is data encrypted in transit: Yes
     - Can users request data deletion: Yes

   - [x] **Audio**
     - Voice or sound recordings: Yes
     - Collection purpose: App functionality
     - Is collection optional: Yes
     - Is data encrypted in transit: Yes
     - Can users request data deletion: Yes

   - [x] **Device or other IDs**
     - Device ID: Yes (for sync)
     - Collection purpose: App functionality, Analytics
     - Is collection optional: No
     - Is data encrypted in transit: Yes
     - Can users request data deletion: Yes

   **Data Sharing**:
   ```
   Do you share user data with third parties? Yes
   - Sentry (crash reporting) - optional
   - Cloud storage provider (if sync enabled)
   ```

   **Data Security**:
   - [x] Data is encrypted in transit (HTTPS)
   - [x] Users can request data deletion
   - [x] Committed to Google Play Families Policy (if applicable)

3. **Preview & Submit**
   - Review all declarations
   - Click "Submit"

### Step 4.7: Pre-Launch Report (Automatic)

Google automatically tests your app on real devices.

1. **Check Pre-Launch Report**
   - Play Console > Release > Testing > Pre-launch report
   - Wait 30-60 minutes after AAB upload

2. **Review Results**
   - Crashes: Should be 0
   - Security vulnerabilities: Should be 0
   - Performance: Should be acceptable
   - Screenshots: Auto-generated on various devices

3. **Fix Issues** (if any)
   - Address crashes before production release
   - Update AAB and re-upload if needed

### Step 4.8: Final Review

**Complete All Sections**:

- [x] Store listing (English + Korean)
- [x] Screenshots and graphics
- [x] Content rating
- [x] Pricing & distribution
- [x] App access
- [x] Ads declaration
- [x] Target audience
- [x] Data safety
- [x] Privacy policy URL
- [x] App category

**Dashboard Check**:
- All items should have green checkmarks
- No red warnings or errors

### Step 4.9: Submit for Review

1. **Create Production Release**
   - Play Console > Production
   - Click "Create new release"

2. **Upload AAB**
   - Same AAB from internal testing
   - OR build new AAB if changes made

3. **Release Notes**
   ```
   English:
   - Initial release of KooDTX
   - Professional sensor data collection tool
   - Supports accelerometer, gyroscope, magnetometer, GPS, audio
   - Local-first offline storage
   - Optional cloud synchronization
   - Export to CSV/JSON formats
   - Material Design 3 UI

   Korean:
   - KooDTX 첫 번째 릴리스
   - 전문 센서 데이터 수집 도구
   - 가속도계, 자이로스코프, 자기계, GPS, 오디오 지원
   - 로컬 우선 오프라인 저장
   - 선택적 클라우드 동기화
   - CSV/JSON 내보내기
   - Material Design 3 UI
   ```

4. **Rollout Percentage**
   ```
   Initial rollout: 100% (or start with 10-50% for gradual rollout)
   ```

5. **Review Release**
   - Double-check all information
   - Verify version code/name
   - Confirm release notes

6. **Send for Review**
   - Click "Review release"
   - Click "Start rollout to Production"
   - Confirm submission

7. **Confirmation**
   - You'll receive email confirmation
   - Review typically takes 1-7 days (average: 2-3 days)

---

## Troubleshooting

### Common Issues

#### Issue: AAB Upload Failed

**Error**: "Upload failed: Invalid package"

**Solutions**:
- Verify AAB is signed correctly: `jarsigner -verify app-release.aab`
- Check package name matches Play Console
- Ensure version code is unique (higher than previous)
- Try re-building AAB

#### Issue: Pre-Launch Report Shows Crashes

**Solutions**:
- Review crash logs in Play Console
- Check Sentry for error details
- Test on similar device/Android version
- Fix crash and upload new AAB

#### Issue: Content Rating Rejected

**Solutions**:
- Re-answer questionnaire more accurately
- Provide additional context if needed
- Contact Play Console support

#### Issue: Data Safety Errors

**Solutions**:
- Ensure all data collection is disclosed
- Mark optional collections correctly
- Verify privacy policy URL is accessible
- Check HTTPS encryption declared

#### Issue: Review Rejected

**Common reasons**:
- Privacy policy missing or invalid
- Data safety declarations incomplete
- Content policy violation
- Misleading store listing
- Broken functionality

**Steps**:
1. Read rejection email carefully
2. Address specific issues mentioned
3. Update app or listing as needed
4. Resubmit for review

#### Issue: Keystore Lost

**⚠️ CRITICAL PROBLEM**

- You CANNOT update the app without the original keystore
- Only solution: Publish as new app with different package name
- Lose all reviews, ratings, users
- **Prevention**: Backup keystore in multiple secure locations!

---

## Post-Submission

### During Review (1-7 days)

1. **Monitor Email**
   - Google sends updates to developer email
   - Check spam folder

2. **Do NOT**
   - Change store listing during review
   - Upload new AAB during review
   - Modify app content settings

3. **Track Status**
   - Play Console shows review status
   - "Under review" → "Approved" or "Rejected"

### After Approval

1. **Announce Launch**
   - Social media announcement
   - Email to beta testers
   - Update website
   - Post on relevant communities (Reddit, forums)

2. **Monitor Metrics**
   - Play Console > Dashboard
   - Installs, ratings, reviews
   - Crashes and ANRs
   - User acquisition

3. **Respond to Reviews**
   - Reply to user reviews (positive and negative)
   - Address issues quickly
   - Thank users for feedback

4. **Plan Updates**
   - Collect feature requests
   - Fix reported bugs
   - Plan version 0.2.0

### If Rejected

1. **Review Feedback**
   - Google provides specific reasons
   - Sometimes requires app changes
   - Sometimes just listing changes

2. **Make Corrections**
   - Fix issues mentioned
   - Update description if misleading
   - Ensure compliance with policies

3. **Appeal (if unfair)**
   - Play Console > Policy status
   - Click "Appeal"
   - Provide detailed explanation
   - Usually resolved in 3-5 days

---

## Phase 232 Completion Checklist

### Documentation Created

- [x] Pre-launch checklist guide
- [x] Google Play Console setup guide
- [x] App build and signing guide
- [x] Pre-launch testing checklist
- [x] Final submission procedure

### Ready for Execution

When ready to execute Phase 232:

1. **Google Play Console**
   - [ ] Developer account created ($25 paid)
   - [ ] App created in console
   - [ ] Store listing completed (English + Korean)
   - [ ] Screenshots uploaded (8 required)
   - [ ] Feature graphic uploaded
   - [ ] Privacy policy hosted and linked

2. **App Build**
   - [ ] Production keystore generated
   - [ ] Keystore backed up securely
   - [ ] AAB file built and signed
   - [ ] Version code/name updated
   - [ ] ProGuard configured

3. **Testing**
   - [ ] Internal test track created
   - [ ] Test users invited (5-20 people)
   - [ ] All pre-launch tests passed
   - [ ] Feedback collected and addressed

4. **Submission**
   - [ ] Content rating completed
   - [ ] Data safety filled out
   - [ ] Pricing & distribution set
   - [ ] All compliance declarations made
   - [ ] Production release submitted

---

## Next Steps

**After Phase 232**:

**Phase 233-240**: Post-Launch Operations
- Monitor app performance
- Respond to user feedback
- Fix critical bugs
- Plan first update

**Timeline**:
- Phase 232 execution: 4-6 hours
- Google review: 1-7 days
- Public launch: Week 1
- First update: 2-4 weeks after launch

---

**Last Updated:** 2025-11-15
**Status:** Ready to Execute
**Prerequisites:** Phase 231 completed ✅

**Note**: This is a comprehensive guide. Actual execution requires completing store assets (screenshots, graphics) from Phase 231 first.
