# Store Submission Guide
**Phase 165: Google Play & App Store Preparation**

## Overview

This guide covers the complete process of submitting your app to Google Play Store and Apple App Store.

## Pre-Submission Checklist

### General

- [ ] App tested thoroughly on multiple devices
- [ ] All features working correctly
- [ ] No crashes or critical bugs
- [ ] Performance is acceptable
- [ ] Privacy policy created and hosted
- [ ] Terms of service created
- [ ] Support email/website ready
- [ ] Marketing materials prepared
- [ ] App description written
- [ ] Screenshots captured
- [ ] App icon finalized
- [ ] Version numbers set correctly

### Android

- [ ] Release APK/AAB built and signed
- [ ] ProGuard tested thoroughly
- [ ] Target API level meets requirements
- [ ] All permissions justified
- [ ] Google Play Developer account created ($25 one-time)

### iOS

- [ ] Release build created and tested
- [ ] TestFlight testing completed
- [ ] All capabilities configured
- [ ] Export compliance determined
- [ ] Apple Developer account active ($99/year)

## Google Play Store

### 1. Create Developer Account

**Cost:** $25 (one-time registration fee)

**Steps:**

1. **Go to:** [Google Play Console](https://play.google.com/console/)
2. **Sign in** with Google account
3. **Accept** Developer Distribution Agreement
4. **Pay** registration fee
5. **Complete** account details:
   - Developer name
   - Contact information
   - Website (optional but recommended)

### 2. Create App

1. **Play Console** → **All apps** → **Create app**
2. **Fill in details:**
   - App name: KooDTX
   - Default language: Korean or English
   - App or game: App
   - Free or paid: Free (or Paid)
3. **Declarations:**
   - [ ] Developer Program Policies
   - [ ] US export laws
4. **Create app**

### 3. App Content

#### Privacy Policy

**Requirements:**

- Must be hosted on a publicly accessible URL
- Must describe data collection and usage
- Required if app handles personal data

**Template:**

```
Privacy Policy for KooDTX

Last updated: [DATE]

1. Information We Collect
   - Personal information (email, name)
   - Device information
   - Usage data

2. How We Use Information
   - Provide and maintain service
   - Improve user experience
   - Analytics

3. Data Security
   - Encryption in transit and at rest
   - Secure authentication

4. Third-Party Services
   - Analytics providers
   - Cloud hosting

5. Contact
   - Email: support@koodtx.com
```

**Host at:** Your website, GitHub Pages, or privacy policy generators

#### App Access

If your app requires login:

1. **Provide test credentials:**
   - Username: test@example.com
   - Password: TestPassword123!

2. **Or provide demo video** showing app functionality

#### Data Safety

**Complete Data Safety section:**

1. **Data collection:**
   - Location
   - Personal info
   - App activity
   - Device info

2. **Data usage:**
   - App functionality
   - Analytics
   - Personalization

3. **Data sharing:**
   - Not shared with third parties
   - Or list third parties

4. **Security practices:**
   - Encryption in transit
   - Users can request deletion

### 4. Store Listing

#### App Details

```
App name: KooDTX
Short description (80 chars):
  실시간 센서 데이터 모니터링 및 분석 애플리케이션

Full description (4000 chars):
  KooDTX는 IoT 센서 데이터를 실시간으로 모니터링하고 분석할 수 있는 강력한 모바일 애플리케이션입니다.

  주요 기능:
  • 실시간 센서 데이터 모니터링
  • 직관적인 데이터 시각화
  • 다양한 차트 및 그래프
  • 오프라인 모드 지원
  • 데이터 내보내기 (CSV, Excel)
  • 알림 및 경고 설정
  • 다중 센서 관리
  • 안전한 데이터 동기화

  특징:
  • 깔끔하고 현대적인 iOS 스타일 디자인
  • 빠르고 반응성 높은 사용자 인터페이스
  • 배터리 효율적인 백그라운드 동기화
  • 안전한 인증 및 데이터 보호
  • 한국어 및 영어 지원

  사용 사례:
  • 산업 IoT 모니터링
  • 스마트 홈 관리
  • 환경 데이터 추적
  • 농업 센서 모니터링
```

#### Graphics Assets

**App Icon:**
- Size: 512 x 512 px
- Format: PNG (32-bit)
- No transparency
- No rounded corners (Google Play adds automatically)

**Feature Graphic:**
- Size: 1024 x 500 px
- Format: PNG or JPEG
- Required for featured placement
- Should include app name and tagline

**Screenshots:**

| Device | Min | Max | Size |
|--------|-----|-----|------|
| Phone | 2 | 8 | 320-3840 px (any side) |
| Tablet (7") | 0 | 8 | 320-3840 px |
| Tablet (10") | 0 | 8 | 320-3840 px |

**Requirements:**
- PNG or JPEG
- 16:9 or 9:16 aspect ratio
- No transparency

**Capture screenshots:**

```bash
# Android
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png

# Or use Android Studio Device File Explorer
```

#### Video (Optional)

- YouTube URL
- Demonstrates app features
- 30 seconds to 2 minutes
- Professional quality recommended

#### Categories

- Primary: Productivity / Business / Tools
- Tags: IoT, Sensors, Monitoring, Data, Analytics

### 5. App Release

#### Production Track

1. **Create release**
2. **Upload AAB:**
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

3. **Release name:** 1.0.0 (1)

4. **Release notes:**
   ```
   첫 번째 정식 릴리스

   주요 기능:
   - 실시간 센서 데이터 모니터링
   - 데이터 시각화 및 차트
   - 오프라인 모드
   - 데이터 내보내기
   - 알림 시스템
   ```

#### Internal Testing (Optional but recommended)

1. **Create internal test release**
2. **Add testers:** Up to 100 by email
3. **Test thoroughly**
4. **Fix issues**
5. **Promote to production**

#### Closed Testing (Optional)

1. **Create closed test track**
2. **Add up to 2000 testers**
3. **Get feedback**
4. **Iterate**

### 6. Content Rating

**Complete questionnaire:**

1. **Category:** Utility, Productivity, or Business
2. **Questions about:**
   - Violence
   - Sexual content
   - Profanity
   - Controlled substances
   - User-generated content
   - Social features

3. **Get rating:**
   - Everyone
   - Teen
   - Mature
   - Adults only

### 7. Pricing & Distribution

**Set price:**
- Free or Paid
- In-app purchases (if applicable)
- Subscriptions (if applicable)

**Countries:**
- Select all countries
- Or specific regions

**Device categories:**
- [x] Phone
- [x] Tablet
- [ ] Wear OS
- [ ] Android TV
- [ ] Chrome OS

### 8. Review & Publish

1. **Review all sections** (must be complete)
2. **Fix any issues** highlighted in red
3. **Send for review**
4. **Wait for approval** (typically 1-3 days)
5. **App goes live!**

## Apple App Store

### 1. Create App Store Connect Record

**Prerequisites:**

- Apple Developer Program membership ($99/year)
- App ID created
- Build uploaded to TestFlight

**Steps:**

1. **Go to:** [App Store Connect](https://appstoreconnect.apple.com/)
2. **My Apps** → **+** → **New App**
3. **Platform:** iOS
4. **Name:** KooDTX
5. **Primary Language:** Korean or English
6. **Bundle ID:** com.koodtx
7. **SKU:** com.koodtx.app
8. **User Access:** Full Access

### 2. App Information

#### Privacy Policy URL

```
https://your-domain.com/privacy-policy
```

#### App Categories

- Primary: Productivity or Business
- Secondary: Utilities

#### Age Rating

Complete questionnaire:
- Unrestricted Web Access: No
- Gambling: No
- Violence: No
- Mature/Suggestive Themes: No
- Result: 4+ (typically)

### 3. Pricing and Availability

**Price:**
- Free or select price tier
- Price Tier 0 = Free
- Price Tier 1 = $0.99

**Availability:**
- All territories
- Or select specific countries

**Pre-Order:**
- Optional: Make available for pre-order

### 4. Prepare for Submission

#### App Screenshots

**Required sizes:**

| Device | Size |
|--------|------|
| iPhone 6.7" (15 Pro Max) | 1290 x 2796 px |
| iPhone 6.5" (14 Plus) | 1284 x 2778 px |
| iPhone 5.5" (8 Plus) | 1242 x 2208 px |
| iPad Pro 12.9" (6th gen) | 2048 x 2732 px |
| iPad Pro 12.9" (2nd gen) | 2048 x 2732 px |

**Tips:**
- Minimum 3 screenshots, maximum 10
- Landscape or portrait
- Status bar can be hidden
- Can add device frames using [Screenshot Framer](https://screenshot.rocks/)

**Capture in Simulator:**

```bash
# Run app in simulator
# Hardware → Screenshot (⌘+S)
# Files saved to ~/Desktop
```

#### App Preview (Optional)

- Video preview of app
- 15-30 seconds
- Same sizes as screenshots
- Portrait or landscape
- Guidelines: [App Preview Specifications](https://developer.apple.com/app-store/app-previews/)

#### App Icon

- Size: 1024 x 1024 px
- Format: PNG (no transparency)
- Color space: sRGB or P3
- No alpha channel
- No rounded corners (iOS adds automatically)

#### Marketing Text

**App Name:**
```
KooDTX
```

**Subtitle (30 chars):**
```
IoT Sensor Monitoring
```

**Promotional Text (170 chars):**
```
실시간 센서 데이터를 모니터링하고 분석하세요. 직관적인 차트, 오프라인 모드, 데이터 내보내기를 지원합니다.
```

**Description (4000 chars):**
```
KooDTX는 IoT 센서 데이터를 실시간으로 모니터링하고 분석할 수 있는 강력한 모바일 애플리케이션입니다.

주요 기능:

• 실시간 모니터링
- 센서 데이터 실시간 업데이트
- 다중 센서 동시 모니터링
- 자동 동기화

• 데이터 시각화
- 직관적인 라인 차트
- 바 차트 및 파이 차트
- 시간대별 데이터 분석
- 커스터마이징 가능한 대시보드

• 오프라인 지원
- 오프라인 모드 자동 전환
- 로컬 데이터 캐싱
- 온라인 복귀 시 자동 동기화

• 데이터 관리
- CSV 및 Excel 내보내기
- 이메일 공유
- 클라우드 백업

• 알림 시스템
- 임계값 기반 알림
- 푸시 알림
- 커스텀 알림 설정

특징:

✓ iOS 스타일의 깔끔한 디자인
✓ 빠르고 반응성 높은 UI
✓ 다크 모드 지원
✓ 한국어 및 영어 지원
✓ 배터리 효율적
✓ 안전한 인증 시스템

사용 사례:

• 산업 IoT 모니터링
• 스마트 홈 관리
• 환경 데이터 추적
• 농업 센서 모니터링
• 에너지 관리

개인정보 보호:

모든 데이터는 암호화되어 전송되며, 안전하게 저장됩니다.
사용자 정보는 제3자와 공유되지 않습니다.
```

**Keywords (100 chars):**
```
IoT,센서,모니터링,데이터,분석,차트,실시간,오프라인,동기화,알림
```

**Support URL:**
```
https://your-domain.com/support
```

**Marketing URL (optional):**
```
https://your-domain.com
```

### 5. Build

**Upload via Xcode:**

1. **Archive app** (Product → Archive)
2. **Organizer** → **Distribute App**
3. **App Store Connect** → **Upload**
4. **Wait for processing** (10-30 minutes)

**Select build:**

1. **App Store Connect** → **Your App** → **Version**
2. **Build** → **Select Build**
3. **Choose uploaded build**

### 6. App Review Information

**Contact Information:**
```
First Name: Your
Last Name: Name
Phone: +82-10-1234-5678
Email: support@koodtx.com
```

**Sign-in Required:**

If app requires login:
```
Username: reviewer@example.com
Password: ReviewPassword123!
```

**Notes:**
```
앱 사용을 위해서는 계정 등록이 필요합니다.
테스트 계정이 제공되었습니다.

App requires account registration.
Test account credentials are provided.
```

**Attachment (if needed):**
- Demo video
- Additional instructions
- Test data

### 7. Export Compliance

**Does your app use encryption?**

- **Yes** if using HTTPS (most apps)
- **No** if no encryption at all

**If Yes:**

1. **Is encryption limited to:**
   - [x] Calls to Apple's encryption APIs
   - [ ] Custom encryption

2. **Does app qualify for exemption?**
   - Usually **Yes** if using standard HTTPS

3. **Complete compliance questions**

### 8. Submit for Review

1. **Review all information**
2. **Ensure all required fields completed**
3. **Add for Review**
4. **Submit**

**Review timeline:**

- Typically 1-3 days
- Can be faster (24 hours)
- Can be slower (up to 7 days)

### 9. App Review Status

**Statuses:**

- **Waiting for Review**: In queue
- **In Review**: Being reviewed
- **Pending Developer Release**: Approved, waiting for your release
- **Ready for Sale**: Live on App Store
- **Rejected**: Issues found, needs fixes

**If Rejected:**

1. **Read rejection reason** carefully
2. **Fix issues**
3. **Respond in Resolution Center** (if applicable)
4. **Resubmit**

## Post-Submission

### Monitor Reviews

**Google Play:**
- Play Console → App → User feedback → Reviews
- Respond to reviews (builds user trust)

**App Store:**
- App Store Connect → My Apps → App → Ratings and Reviews
- Respond to reviews (requires setup)

### Analytics

**Google Play:**
- Statistics
- User acquisition
- Retention
- Crashes & ANRs

**App Store:**
- Analytics
- App Store Impressions
- Downloads
- Crashes

### Updates

**Version updates:**

1. **Increment version number**
2. **Build new release**
3. **Create new version in store**
4. **Upload build**
5. **Add release notes**
6. **Submit for review**

**Release notes template:**

```
버전 1.1.0

새로운 기능:
- 다크 모드 지원
- 데이터 필터링 기능 추가
- 성능 개선

수정 사항:
- 로그인 버그 수정
- 차트 표시 오류 수정
- 메모리 누수 해결

Version 1.1.0

New Features:
- Dark mode support
- Data filtering
- Performance improvements

Bug Fixes:
- Fixed login issues
- Fixed chart display errors
- Resolved memory leaks
```

## Common Rejection Reasons

### Google Play

1. **Privacy Policy missing/invalid**
   - Solution: Add valid privacy policy URL

2. **Dangerous permissions not justified**
   - Solution: Explain in description or remove

3. **Crashes on startup**
   - Solution: Test thoroughly before submission

4. **Missing functionality**
   - Solution: Ensure all described features work

### App Store

1. **App completeness**
   - Solution: Test all features, fix crashes

2. **Accurate metadata**
   - Solution: Screenshots must match current version

3. **Privacy**
   - Solution: Explain data usage clearly

4. **Design**
   - Solution: Follow iOS Human Interface Guidelines

5. **Minimum functionality**
   - Solution: Ensure app provides sufficient value

## Tips for Approval

### General

- **Test thoroughly** on multiple devices
- **Fix all crashes** and critical bugs
- **Provide test account** if app requires login
- **Write clear description** of app functionality
- **Use high-quality screenshots**
- **Respond quickly** to reviewer questions

### Google Play

- Complete **all sections** before submitting
- Use **real screenshots** (not mockups)
- Justify **all permissions** requested
- Ensure **target API level** is current
- Test with **ProGuard enabled**

### App Store

- Follow **iOS Human Interface Guidelines**
- Ensure app **provides value**
- Don't mention **Android** in description
- Use **appropriate age rating**
- Test on **real devices**, not just simulator
- Ensure **all links work** (support, privacy policy)

## Resources

### Google Play

- [Google Play Console](https://play.google.com/console/)
- [Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [Store Listing](https://support.google.com/googleplay/android-developer/answer/9866151)

### App Store

- [App Store Connect](https://appstoreconnect.apple.com/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Marketing Guidelines](https://developer.apple.com/app-store/marketing/guidelines/)

### Tools

- [Screenshot Framer](https://screenshot.rocks/)
- [App Icon Generator](https://appicon.co/)
- [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
- [LaunchKit Screenshot Builder](https://launchkit.io/)
