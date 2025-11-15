# App Branding Guide
**Phase 156: 앱 아이콘 및 이름 설정**

## 앱 이름 변경

### Android
1. `android/app/src/main/res/values/strings.xml` 파일 수정:
```xml
<resources>
    <string name="app_name">KooDTX</string>
</resources>
```

### iOS
1. Xcode에서 프로젝트 열기
2. General → Display Name을 "KooDTX"로 변경
3. 또는 `ios/KooDTX/Info.plist` 파일 수정:
```xml
<key>CFBundleDisplayName</key>
<string>KooDTX</string>
<key>CFBundleName</key>
<string>KooDTX</string>
```

## 앱 아이콘 설정

### Android
아이콘은 다양한 해상도로 준비해야 합니다:

- `mipmap-mdpi` (48x48px)
- `mipmap-hdpi` (72x72px)
- `mipmap-xhdpi` (96x96px)
- `mipmap-xxhdpi` (144x144px)
- `mipmap-xxxhdpi` (192x192px)

**위치:**
```
android/app/src/main/res/
├── mipmap-mdpi/
│   └── ic_launcher.png (48x48)
├── mipmap-hdpi/
│   └── ic_launcher.png (72x72)
├── mipmap-xhdpi/
│   └── ic_launcher.png (96x96)
├── mipmap-xxhdpi/
│   └── ic_launcher.png (144x144)
└── mipmap-xxxhdpi/
    └── ic_launcher.png (192x192)
```

**Adaptive Icon (Android 8.0+):**
```
android/app/src/main/res/
├── mipmap-anydpi-v26/
│   └── ic_launcher.xml
└── mipmap-xxxhdpi/
    ├── ic_launcher_foreground.png
    └── ic_launcher_background.png
```

### iOS
Xcode의 Assets.xcassets/AppIcon.appiconset에 아이콘 추가:

**필요한 크기:**
- iPhone: 20pt, 29pt, 40pt, 60pt (2x, 3x)
- iPad: 20pt, 29pt, 40pt, 76pt, 83.5pt (1x, 2x)
- App Store: 1024x1024px (1x)

## 권장 아이콘 디자인

### 색상
- Primary: #007AFF (iOS Blue)
- Background: #FFFFFF
- Accent: #5AC8FA

### 디자인 가이드라인
1. 단순하고 명확한 디자인
2. 센서/데이터 수집을 나타내는 아이콘
3. 마이크 또는 파형 모티프
4. 고대비, 명확한 실루엣

### 아이콘 제작 도구
- [App Icon Generator](https://appicon.co/)
- [Icon Kitchen](https://icon.kitchen/)
- Adobe Illustrator
- Figma
- Sketch

## Bundle Identifier

### Android
`android/app/build.gradle`:
```gradle
defaultConfig {
    applicationId "com.koodtx.app"
    // ...
}
```

### iOS
Xcode → General → Bundle Identifier:
```
com.koodtx.app
```

## 버전 관리

### Android
`android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 1
    versionName "1.0.0"
}
```

### iOS
`ios/KooDTX/Info.plist`:
```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

## 빌드 확인

### Android
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### iOS
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

## 스플래시 스크린

### Android
`android/app/src/main/res/drawable/launch_screen.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background"/>
    <item>
        <bitmap
            android:gravity="center"
            android:src="@mipmap/ic_launcher"/>
    </item>
</layer-list>
```

### iOS
Xcode → LaunchScreen.storyboard 편집

## 체크리스트

- [ ] Android 앱 이름 변경
- [ ] iOS 앱 이름 변경
- [ ] Android 아이콘 생성 (모든 해상도)
- [ ] iOS 아이콘 생성 (모든 크기)
- [ ] Bundle Identifier 설정
- [ ] 버전 번호 설정
- [ ] Android 빌드 테스트
- [ ] iOS 빌드 테스트
- [ ] 스플래시 스크린 확인
- [ ] 앱 아이콘 표시 확인 (홈 스크린)

## 참고 자료

- [React Native App Icon Guide](https://reactnative.dev/docs/image#images-for-different-screen-densities)
- [Android Icon Design](https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher)
- [iOS Icon Design](https://developer.apple.com/design/human-interface-guidelines/app-icons)
