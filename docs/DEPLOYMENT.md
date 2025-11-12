# Deployment Guide

KooDTX 앱의 빌드 및 배포 가이드입니다.

## 목차

1. [환경 설정](#환경-설정)
2. [버전 관리](#버전-관리)
3. [Android 빌드](#android-빌드)
4. [iOS 빌드](#ios-빌드)
5. [릴리스 체크리스트](#릴리스-체크리스트)
6. [배포 자동화](#배포-자동화)
7. [문제 해결](#문제-해결)

## 환경 설정

### 1. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 수정:

```env
# Production API
API_BASE_URL=https://api.koodtx.com
API_TIMEOUT=30000

# Logging
ENABLE_LOGGING=true
LOG_LEVEL=INFO
REMOTE_LOGGING_URL=https://logs.koodtx.com

# Crash Reporting
ENABLE_CRASH_REPORTING=true
SENTRY_DSN=your_sentry_dsn_here

# Environment
NODE_ENV=production
```

### 2. 의존성 설치

```bash
# Node modules
npm install

# iOS pods
cd ios
pod install
cd ..
```

### 3. 서명 설정

**Android**:
- `android/app/build.gradle`에 서명 설정
- Keystore 파일 준비 (`release.keystore`)

**iOS**:
- Xcode에서 Signing & Capabilities 설정
- Provisioning Profile 설정

## 버전 관리

### 자동 버전 업데이트

```bash
# Patch 버전 (0.1.0 → 0.1.1)
npm run version:patch

# Minor 버전 (0.1.1 → 0.2.0)
npm run version:minor

# Major 버전 (0.2.0 → 1.0.0)
npm run version:major
```

이 스크립트는 자동으로:
- `package.json` 버전 업데이트
- Android `versionName`, `versionCode` 업데이트
- iOS `CFBundleShortVersionString`, `CFBundleVersion` 업데이트
- Git commit 및 tag 생성

### 수동 버전 업데이트

**package.json**:
```json
{
  "version": "1.0.0"
}
```

**Android** (`android/app/build.gradle`):
```gradle
defaultConfig {
    versionCode 1
    versionName "1.0.0"
}
```

**iOS** (`ios/KooDTX/Info.plist`):
```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

## Android 빌드

### Development 빌드

```bash
# APK 빌드
cd android
./gradlew assembleDebug

# 결과물
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Production 빌드

```bash
# 1. 클린 빌드
cd android
./gradlew clean

# 2. Release APK 빌드
./gradlew assembleRelease

# 3. Release AAB 빌드 (Google Play)
./gradlew bundleRelease

# 결과물
# APK: android/app/build/outputs/apk/release/app-release.apk
# AAB: android/app/build/outputs/bundle/release/app-release.aab
```

### 서명 설정

`android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

`android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=***
MYAPP_RELEASE_KEY_PASSWORD=***
```

⚠️ **주의**: `gradle.properties` 파일은 `.gitignore`에 추가!

### Keystore 생성

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore release.keystore \
  -alias my-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

## iOS 빌드

### Development 빌드

```bash
# Xcode에서
# Product → Build (⌘B)
# Product → Run (⌘R)

# 또는 CLI
npx react-native run-ios
```

### Production 빌드

```bash
# 1. Xcode 열기
cd ios
open KooDTX.xcworkspace

# 2. 빌드 설정
# - Generic iOS Device 선택
# - Product → Scheme → Edit Scheme
# - Build Configuration: Release

# 3. Archive
# Product → Archive (⌘⇧B)

# 4. Organizer에서 배포
# Window → Organizer
# Distribute App → App Store Connect
```

### CLI로 Archive

```bash
cd ios

# Archive 생성
xcodebuild -workspace KooDTX.xcworkspace \
  -scheme KooDTX \
  -configuration Release \
  -archivePath ./build/KooDTX.xcarchive \
  archive

# IPA 생성
xcodebuild -exportArchive \
  -archivePath ./build/KooDTX.xcarchive \
  -exportOptionsPlist exportOptions.plist \
  -exportPath ./build
```

### Provisioning Profile

**Development**:
- Apple Developer Portal에서 생성
- Xcode에서 자동 다운로드

**Distribution**:
- App Store 배포용 Provisioning Profile
- Xcode → Preferences → Accounts에서 관리

## 릴리스 체크리스트

### 빌드 전

- [ ] 버전 번호 업데이트
- [ ] 환경 변수 확인 (.env)
- [ ] 의존성 업데이트 확인
- [ ] 테스트 실행 (`npm test`)
- [ ] Lint 검사 (`npm run lint`)
- [ ] TypeScript 검사 (`npm run typecheck`)
- [ ] 번들 크기 분석 (`npm run analyze`)

### 기능 확인

- [ ] 센서 데이터 수집 정상 작동
- [ ] 오디오 녹음 정상 작동
- [ ] 데이터 저장 및 로드 확인
- [ ] 네트워크 동기화 확인
- [ ] 설정 저장 및 로드 확인
- [ ] 에러 처리 확인
- [ ] 권한 요청 정상 작동

### 빌드 설정

- [ ] 프로덕션 API URL 설정
- [ ] Crash reporting 활성화
- [ ] Analytics 설정 (필요시)
- [ ] 디버그 모드 비활성화
- [ ] Source map 생성 활성화

### Android 체크리스트

- [ ] Release keystore 설정
- [ ] ProGuard 설정 확인
- [ ] 앱 아이콘 설정
- [ ] 스플래시 스크린 설정
- [ ] 권한 설정 확인 (`AndroidManifest.xml`)
- [ ] AAB 빌드 테스트

### iOS 체크리스트

- [ ] Provisioning Profile 설정
- [ ] 앱 아이콘 설정
- [ ] Launch Screen 설정
- [ ] 권한 설명 설정 (`Info.plist`)
- [ ] Archive 빌드 테스트

### 빌드 후

- [ ] APK/IPA 파일 생성 확인
- [ ] 앱 설치 및 실행 테스트
- [ ] 크래시 없이 정상 작동 확인
- [ ] 릴리스 노트 작성
- [ ] Git tag 생성 (`v1.0.0`)

## 배포 자동화

### GitHub Actions를 통한 자동 빌드

`.github/workflows/release.yml` (예시):

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  android-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: cd android && ./gradlew bundleRelease
      - uses: actions/upload-artifact@v4
        with:
          name: android-release
          path: android/app/build/outputs/bundle/release/

  ios-build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: cd ios && pod install
      - run: xcodebuild -workspace ios/KooDTX.xcworkspace ...
```

### Fastlane 통합

`fastlane/Fastfile` (예시):

```ruby
platform :android do
  desc "Deploy to Play Store"
  lane :deploy do
    gradle(
      task: "bundle",
      build_type: "Release"
    )
    upload_to_play_store
  end
end

platform :ios do
  desc "Deploy to App Store"
  lane :deploy do
    build_app(workspace: "ios/KooDTX.xcworkspace")
    upload_to_app_store
  end
end
```

## 문제 해결

### Android 빌드 실패

**문제**: `AAPT: error: resource android:attr/lStar not found`

해결:
```gradle
// android/app/build.gradle
android {
    compileSdkVersion 34
}
```

**문제**: `Duplicate class found`

해결:
```gradle
// 의존성 충돌 해결
configurations.all {
    exclude group: 'com.facebook.react', module: 'react-native'
}
```

### iOS 빌드 실패

**문제**: `Command PhaseScriptExecution failed`

해결:
```bash
cd ios
pod deintegrate
pod install
```

**문제**: `No valid code signing`

해결:
- Xcode → Signing & Capabilities
- Team 선택
- Provisioning Profile 확인

### 메모리 부족

```bash
# Gradle memory 증가
echo "org.gradle.jvmargs=-Xmx4096m" >> android/gradle.properties

# Metro bundler 재시작
npm start -- --reset-cache
```

## 스토어 배포

### Google Play Store

1. Google Play Console (https://play.google.com/console)
2. 앱 등록
3. AAB 업로드
4. 앱 정보, 스크린샷 등록
5. 검토 제출

### Apple App Store

1. App Store Connect (https://appstoreconnect.apple.com)
2. 앱 등록
3. Xcode에서 Archive 업로드
4. 앱 정보, 스크린샷 등록
5. 검토 제출

## 베타 테스팅

### Android - Google Play Internal Testing

1. Play Console → Testing → Internal testing
2. AAB 업로드
3. 테스터 이메일 추가
4. 링크 공유

### iOS - TestFlight

1. App Store Connect → TestFlight
2. Archive 업로드
3. 테스터 이메일 추가
4. 링크 공유

## 참고 자료

- [React Native Building for Production](https://reactnative.dev/docs/signed-apk-android)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [iOS Deployment](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)
- [Fastlane Documentation](https://docs.fastlane.tools/)
