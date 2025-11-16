# KooDTX Store Assets

This directory contains all assets and materials required for app store submissions (Google Play Store, and future App Store).

## 📁 Directory Structure

```
store-assets/
├── README.md                          # This file - Overview and checklist
├── screenshots/                       # App screenshots (8 required for Google Play)
│   ├── 01_home_screen.png            # Main screen with session list
│   ├── 02_recording_active.png       # Active recording screen
│   ├── 03_sensor_selection.png       # Sensor configuration
│   ├── 04_data_visualization.png     # Charts and data display
│   ├── 05_session_details.png        # Session details and metadata
│   ├── 06_export_options.png         # Export functionality
│   ├── 07_settings.png               # Settings and preferences
│   └── 08_sync_status.png            # Cloud sync interface
├── graphics/                          # Promotional graphics
│   ├── feature_graphic.png           # 1024x500px (Google Play)
│   ├── promo_graphic.png             # 180x120px (optional)
│   └── tv_banner.png                 # 1280x720px (if supporting Android TV)
├── descriptions/                      # Store listing text
│   ├── short_description_kr.txt      # 80 chars Korean
│   ├── short_description_en.txt      # 80 chars English
│   ├── full_description_kr.txt       # 4000 chars Korean
│   └── full_description_en.txt       # 4000 chars English
└── legal/                            # Legal documents
    ├── privacy_policy.md             # Privacy policy (bilingual)
    └── terms_of_service.md           # Terms of service (bilingual)
```

## ✅ Submission Checklist

### 1. Screenshots (Required)

- [ ] **Screenshot 1**: Home screen with session list
  - Shows app branding and primary interface
  - Display 3-5 sample sessions with varied timestamps
  - Clean, uncluttered UI

- [ ] **Screenshot 2**: Active recording screen
  - Sensor data streaming in real-time
  - Recording timer visible
  - Sensor indicators active

- [ ] **Screenshot 3**: Sensor selection screen
  - Multiple sensors visible (accelerometer, gyroscope, GPS, etc.)
  - Sampling rate configuration visible
  - Clear checkbox/toggle states

- [ ] **Screenshot 4**: Data visualization
  - Real-time charts showing sensor data
  - Multiple data series visible
  - Professional chart design

- [ ] **Screenshot 5**: Session details
  - Metadata display (duration, sensors used, data points)
  - Export and share buttons visible
  - Session notes/tags visible

- [ ] **Screenshot 6**: Export options
  - CSV/JSON export options visible
  - Share functionality demonstrated
  - Professional export UI

- [ ] **Screenshot 7**: Settings screen
  - Sync preferences visible
  - API configuration options
  - Professional settings layout

- [ ] **Screenshot 8**: Sync status
  - Cloud sync progress/status
  - Upload/download indicators
  - Network status display

**Screenshot Requirements:**
- **Minimum**: 320px on shortest edge
- **Maximum**: 3840px on longest edge
- **Format**: PNG or JPEG (PNG preferred)
- **Aspect Ratio**: 16:9 or 9:16 recommended
- **Recommended Size**: 1080x1920px (portrait) or 1920x1080px (landscape)
- **No transparency**: Use solid background
- **Language**: Create separate sets for Korean and English

### 2. Graphic Assets (Required)

- [ ] **Feature Graphic** (1024x500px)
  - High-quality promotional banner
  - Displays on Google Play Store listing
  - Include app logo, tagline, and key visual
  - No text smaller than 40pt
  - PNG or JPEG, 24-bit, no alpha

- [ ] **App Icon** (512x512px)
  - Already in `android/app/src/main/res/mipmap-xxxhdpi/`
  - Verify it matches branding guidelines

- [ ] **Promo Graphic** (180x120px, optional)
  - Used in older Android devices
  - Simplified version of feature graphic

### 3. Descriptions (Required)

- [x] **Short Description - Korean** (80 characters max)
  - Location: `descriptions/short_description_kr.txt`
  - ✅ Completed: "스마트폰 센서로 고정밀 데이터를 수집하고 클라우드에 동기화하는 연구용 앱"

- [x] **Short Description - English** (80 characters max)
  - Location: `descriptions/short_description_en.txt`
  - ✅ Completed: "Collect high-precision sensor data from your smartphone and sync to cloud"

- [x] **Full Description - Korean** (4000 characters max)
  - Location: `descriptions/full_description_kr.txt`
  - ✅ Completed: Comprehensive Korean description with features, use cases, tech stack

- [x] **Full Description - English** (4000 characters max)
  - Location: `descriptions/full_description_en.txt`
  - ✅ Completed: Comprehensive English description with features, use cases, tech stack

### 4. Legal Documents (Required)

- [x] **Privacy Policy**
  - Location: `legal/privacy_policy.md`
  - ✅ Completed: Bilingual (English/Korean)
  - Must be hosted online (e.g., https://koodtx.com/privacy)
  - Complies with GDPR, CCPA, Korean Personal Information Protection Act

- [x] **Terms of Service**
  - Location: `legal/terms_of_service.md`
  - ✅ Completed: Bilingual (English/Korean)
  - Should be hosted online (e.g., https://koodtx.com/terms)
  - Covers usage rights, liability, data ownership

### 5. App Information (Required for Play Console)

- [ ] **App Title** (30 characters max)
  - English: "KooDTX - Sensor Data Logger"
  - Korean: "KooDTX - 센서 데이터 수집기"

- [ ] **Category**
  - Primary: Tools
  - Secondary: Education or Productivity

- [ ] **Tags/Keywords** (5 recommended)
  - sensor data
  - research
  - accelerometer
  - data collection
  - scientific

- [ ] **Content Rating**
  - Target audience: Everyone
  - No ads, no in-app purchases (currently)

- [ ] **Target Age Group**
  - 13+ (due to data collection requirements)

- [ ] **Contact Information**
  - Developer email: support@koodtx.com
  - Website: https://koodtx.com
  - Privacy policy URL: https://koodtx.com/privacy
  - Terms URL: https://koodtx.com/terms

### 6. Build Information (Required)

- [ ] **Version Code**: Check `android/app/build.gradle`
- [ ] **Version Name**: Should match package.json version
- [ ] **Min SDK**: API 29 (Android 10.0)
- [ ] **Target SDK**: API 34 (Android 14.0)
- [ ] **Signing**: Production keystore configured
- [ ] **ProGuard**: Enabled for release builds
- [ ] **App Bundle**: Generate AAB (not APK) for Play Store

### 7. Pre-Submission Testing (Critical)

- [ ] **Test on multiple devices**
  - Samsung, Google Pixel, OnePlus, etc.
  - Different screen sizes and resolutions

- [ ] **Test all permissions**
  - Location, Microphone, Storage
  - Permission rationale dialogs working

- [ ] **Test offline functionality**
  - All core features work without internet
  - Graceful handling of no network

- [ ] **Test cloud sync**
  - Upload/download working correctly
  - Wi-Fi only mode functioning
  - Retry logic working

- [ ] **Test data integrity**
  - Sensor data accurate and complete
  - Export functionality working
  - No data loss scenarios

- [ ] **Performance testing**
  - No memory leaks
  - Reasonable battery consumption
  - Fast app startup

- [ ] **Crash testing**
  - Sentry configured and working
  - No crash on common user flows

## 📸 Screenshot Creation Guide

### Tools Needed

1. **Android Device/Emulator**
   - Preferred: Real device with clean Android 12+ UI
   - Alternative: Android Studio emulator

2. **Screen Recording Tools**
   - Android Studio Device File Explorer
   - ADB command: `adb shell screencap -p /sdcard/screenshot.png`
   - Third-party: scrcpy for desktop mirroring

3. **Image Editing**
   - Remove status bar clutter (optional)
   - Add device frame (optional, using device-frames.com)
   - Consistent background across all screenshots

### Screenshot Best Practices

1. **Consistency**
   - Use same device/aspect ratio for all screenshots
   - Same background color or theme
   - Same time of day (if timestamps are visible)

2. **Sample Data**
   - Use realistic but clean sample data
   - Avoid empty states (unless intentional)
   - Session names should be descriptive and professional
   - Use varied sensor combinations

3. **UI State**
   - No loading spinners (unless demonstrating sync)
   - No error messages (unless demonstrating error handling)
   - Full battery indicator
   - Good network signal
   - Clean notification bar

4. **Text and Labels**
   - All text should be readable at preview size
   - Use Korean for Korean listing, English for English listing
   - Consistent terminology with app strings

5. **Highlighting Features**
   - Use app's natural UI to highlight features
   - Avoid adding external annotations/arrows (Google Play policy)
   - Let the UI speak for itself

### Creating Screenshots - Step by Step

```bash
# Method 1: Using ADB
# Connect device and enable USB debugging
adb devices

# Navigate to desired screen in app
# Take screenshot
adb shell screencap -p /sdcard/screenshot_01.png

# Pull to computer
adb pull /sdcard/screenshot_01.png ./store-assets/screenshots/01_home_screen.png

# Method 2: Using Android Studio
# 1. Open Running Devices panel
# 2. Click camera icon to capture
# 3. Save to screenshots directory

# Method 3: Using Device Buttons
# Press Power + Volume Down simultaneously
# Transfer via USB or cloud storage
```

### Recommended Screenshot Scenarios

1. **Home Screen**:
   - Have 4-5 completed sessions visible
   - Mix of recent and older sessions
   - Different sensor combinations shown
   - Clean, organized list

2. **Recording Active**:
   - Recording timer showing 00:15 or 00:30
   - 3-4 sensors active (different colors)
   - Real-time data updating visibly
   - Pause/Stop buttons visible

3. **Sensor Selection**:
   - Show all sensor options
   - 3-4 sensors selected
   - Sampling rate selector visible
   - Professional configuration UI

4. **Data Visualization**:
   - Real-time chart with multiple data series
   - Clear axis labels and legend
   - Data flowing naturally
   - Professional chart appearance

5. **Session Details**:
   - Complete metadata visible
   - Export buttons prominent
   - Session notes filled in
   - Professional details layout

6. **Export Options**:
   - CSV/JSON options visible
   - Share button clear
   - Professional export UI

7. **Settings**:
   - Sync preferences section expanded
   - API configuration visible
   - Professional settings UI
   - Clear labels and descriptions

8. **Sync Status**:
   - Upload progress visible (50-75% complete)
   - Multiple sessions in queue
   - Network indicator showing Wi-Fi
   - Professional sync interface

## 🎨 Graphic Assets Guide

### Feature Graphic (1024x500px)

**Purpose**: Main promotional banner on Play Store listing

**Design Elements**:
- App logo (left or center)
- Tagline: "Professional Sensor Data Collection"
- Key visual: Phone with sensor data visualization
- Clean, modern design
- Brand colors from branding guide
- No small text (minimum 40pt)

**Tools**:
- Figma (recommended)
- Adobe Photoshop
- Canva (easy option)
- GIMP (free option)

**Template Structure**:
```
[Left 30%: App Logo + Name]
[Center 40%: Phone mockup with app screenshot]
[Right 30%: Tagline + Key features]
```

### Creating Feature Graphic - Quick Guide

1. **Start with template**
   - 1024x500px canvas
   - 72 DPI minimum (96 DPI recommended)
   - RGB color mode

2. **Add background**
   - Use brand gradient or solid color
   - Ensure good contrast with text
   - Professional appearance

3. **Add app logo**
   - High-resolution PNG
   - Proper padding from edges (40px minimum)

4. **Add device mockup**
   - Use free mockup generator (mockuphone.com)
   - Insert screenshot from app
   - Ensure it's prominent but not overwhelming

5. **Add text**
   - App name: Bold, 60-80pt
   - Tagline: Regular, 40-50pt
   - Ensure readability at thumbnail size

6. **Export**
   - PNG format
   - 24-bit color
   - No transparency
   - Optimize file size (<1MB)

## 🌐 Hosting Legal Documents

### Option 1: GitHub Pages (Free, Recommended)

```bash
# Create a gh-pages branch
git checkout -b gh-pages

# Copy legal documents
mkdir docs
cp store-assets/legal/privacy_policy.md docs/
cp store-assets/legal/terms_of_service.md docs/

# Create index.html
cat > docs/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>KooDTX Legal Documents</title>
  <meta charset="UTF-8">
</head>
<body>
  <h1>KooDTX Legal Documents</h1>
  <ul>
    <li><a href="privacy_policy.html">Privacy Policy</a></li>
    <li><a href="terms_of_service.html">Terms of Service</a></li>
  </ul>
</body>
</html>
EOF

# Convert markdown to HTML (using pandoc or online converter)
# pandoc -s privacy_policy.md -o privacy_policy.html

# Push to GitHub
git add docs/
git commit -m "Add legal documents for GitHub Pages"
git push origin gh-pages

# Enable GitHub Pages in repository settings
# Your URLs will be: https://USERNAME.github.io/KooDTX/privacy_policy.html
```

### Option 2: Custom Domain

If you have koodtx.com:
1. Upload HTML versions to web hosting
2. Create clean URLs:
   - https://koodtx.com/privacy
   - https://koodtx.com/terms
3. Update Play Console with these URLs

### Option 3: Static Site Hosts (Free)

- Netlify: Deploy from GitHub automatically
- Vercel: Similar to Netlify
- Cloudflare Pages: Fast and free

## 📝 Store Listing Optimization (ASO)

### Keywords Research

**Primary Keywords** (English):
- sensor data collection
- research data logger
- accelerometer app
- scientific data tool
- sensor logger

**Primary Keywords** (Korean):
- 센서 데이터 수집
- 연구용 데이터 로거
- 가속도계 앱
- 과학 데이터 도구
- 센서 로거

### Title Optimization

**English Variations**:
- "KooDTX - Sensor Data Logger" (27 chars)
- "KooDTX: Research Data Tool" (27 chars)
- "KooDTX Sensor Logger" (21 chars)

**Korean Variations**:
- "KooDTX - 센서 데이터 수집기" (21 chars including spaces)
- "KooDTX: 연구용 데이터 로거" (21 chars)

### Description Best Practices

1. **First 3 lines are critical** - Visible without "Read more"
2. **Use bullet points** - Easy to scan
3. **Include keywords naturally** - Don't stuff
4. **Highlight unique features** - What makes KooDTX different
5. **Include use cases** - Help users see value
6. **Call to action** - "Download now and start collecting data"

## 🚀 Submission Workflow

### Phase 1: Preparation (Current)

1. ✅ Create directory structure
2. ✅ Write descriptions (Korean/English)
3. ✅ Draft privacy policy
4. ✅ Draft terms of service
5. ⏳ Create screenshots (8 required)
6. ⏳ Create feature graphic
7. ⏳ Host legal documents online

### Phase 2: Testing (Before Submission)

1. Generate signed release AAB
2. Test on multiple devices
3. Verify all features work
4. Check for crashes/errors
5. Performance testing
6. Beta testing with real users

### Phase 3: Play Console Setup

1. Create developer account ($25 one-time fee)
2. Complete account verification
3. Accept Developer Distribution Agreement
4. Set up merchant account (if selling)

### Phase 4: Create App Listing

1. Upload AAB to production track
2. Fill in store listing details
3. Upload screenshots and graphics
4. Set up content rating questionnaire
5. Configure pricing and distribution
6. Add privacy policy and terms URLs

### Phase 5: Review and Launch

1. Review all information for accuracy
2. Submit for review
3. Wait for Google approval (typically 1-7 days)
4. Monitor for review status
5. Address any issues if rejected
6. Launch when approved!

## 📊 Post-Launch Checklist

- [ ] Monitor crash reports (Sentry)
- [ ] Track user reviews and ratings
- [ ] Respond to user feedback
- [ ] Monitor download metrics
- [ ] Update screenshots if UI changes
- [ ] Keep legal documents updated
- [ ] Regular app updates

## 🔗 Useful Resources

### Google Play Store
- [Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [Store Listing Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Graphic Asset Specifications](https://support.google.com/googleplay/android-developer/answer/9866151)

### Design Resources
- [Material Design 3](https://m3.material.io/)
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [Device Frames](https://deviceframes.com/)
- [Mockup Generator](https://mockuphone.com/)

### Legal Templates
- [TermsFeed Privacy Policy Generator](https://www.termsfeed.com/privacy-policy-generator/)
- [GetTerms.io](https://getterms.io/)

### Screenshot Tools
- [scrcpy](https://github.com/Genymobile/scrcpy) - Display and control Android devices
- [Android Screenshot Tool](https://developer.android.com/studio/debug/am-screenshot)

## 📧 Contact

For questions about store submission:
- Technical: dev@koodtx.com
- Legal: legal@koodtx.com
- General: support@koodtx.com

## 📅 Timeline

**Estimated time to complete Phase 231**:
- ✅ Descriptions: 2 hours (Completed)
- ✅ Legal documents: 2 hours (Completed)
- ⏳ Screenshots: 4-6 hours (capture, edit, optimize)
- ⏳ Graphics: 2-4 hours (feature graphic, promo)
- ⏳ Hosting legal docs: 1 hour
- ⏳ Final review: 1 hour

**Total**: ~12-15 hours

**Next Steps**: Proceed to Phase 232 (App Submission Checklist)

---

Last updated: 2025-11-15
