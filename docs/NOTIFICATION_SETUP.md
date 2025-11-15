# Notifee 알림 설정 가이드

## 개요

@notifee/react-native는 React Native 앱에서 로컬 알림을 표시하기 위한 강력한 라이브러리입니다. Firebase Cloud Messaging 없이도 풍부한 알림 기능을 제공합니다.

## 설치

```bash
npm install @notifee/react-native
# or
yarn add @notifee/react-native
```

### iOS 추가 설정

```bash
cd ios && pod install && cd ..
```

**Info.plist 설정** (필요시):
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

### Android 추가 설정

**android/app/src/main/AndroidManifest.xml**:
```xml
<manifest>
  <application>
    <!-- Notification icon (옵션) -->
    <meta-data
      android:name="app.notifee.notification_icon"
      android:resource="@drawable/ic_notification" />

    <!-- Notification color (옵션) -->
    <meta-data
      android:name="app.notifee.notification_color"
      android:resource="@color/notification_color" />
  </application>
</manifest>
```

## 알림 채널 설정 (Android)

Android 8.0 (API 26) 이상에서는 알림 채널이 필수입니다.

```typescript
import notifee, { AndroidImportance } from '@notifee/react-native';

export const createNotificationChannels = async () => {
  // 기본 채널
  await notifee.createChannel({
    id: 'default',
    name: 'Default Notifications',
    importance: AndroidImportance.DEFAULT,
  });

  // 중요한 알림 채널
  await notifee.createChannel({
    id: 'important',
    name: 'Important Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  // Foreground 서비스 채널
  await notifee.createChannel({
    id: 'foreground-service',
    name: 'Foreground Service',
    importance: AndroidImportance.LOW,
    sound: undefined,
    vibration: false,
  });
};
```

## 기본 알림 표시

### 간단한 알림

```typescript
import notifee from '@notifee/react-native';

async function displayNotification() {
  // Request permissions (iOS)
  await notifee.requestPermission();

  // Display a notification
  await notifee.displayNotification({
    title: '알림 제목',
    body: '알림 내용',
    android: {
      channelId: 'default',
      smallIcon: 'ic_launcher',
      pressAction: {
        id: 'default',
      },
    },
    ios: {
      sound: 'default',
    },
  });
}
```

### 리치 알림 (이미지, 버튼)

```typescript
async function displayRichNotification() {
  await notifee.displayNotification({
    title: '새로운 메시지',
    body: '사진이 도착했습니다',
    android: {
      channelId: 'default',
      smallIcon: 'ic_launcher',
      largeIcon: require('../assets/user-avatar.png'),
      style: {
        type: AndroidStyle.BIGPICTURE,
        picture: 'https://example.com/image.jpg',
      },
      actions: [
        {
          title: '보기',
          pressAction: { id: 'view' },
        },
        {
          title: '삭제',
          pressAction: { id: 'delete' },
        },
      ],
    },
  });
}
```

## 알림 이벤트 처리

### Foreground 이벤트

```typescript
import { useEffect } from 'react';
import notifee, { EventType } from '@notifee/react-native';

function useNotificationEvents() {
  useEffect(() => {
    // Foreground event listener
    return notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          // Navigate to specific screen
          break;
        case EventType.ACTION_PRESS:
          console.log('User pressed an action', detail.pressAction?.id);
          break;
      }
    });
  }, []);
}
```

### Background 이벤트

**index.js** (앱 최상위):
```typescript
import notifee, { EventType } from '@notifee/react-native';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  switch (type) {
    case EventType.PRESS:
      console.log('Background notification pressed', notification);
      break;
    case EventType.ACTION_PRESS:
      if (pressAction?.id === 'delete') {
        await notifee.cancelNotification(notification?.id);
      }
      break;
  }
});
```

## 권한 요청

### iOS 권한

```typescript
import notifee, { AuthorizationStatus } from '@notifee/react-native';

async function checkNotificationPermission() {
  const settings = await notifee.requestPermission();

  if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
    console.log('Permission granted');
  } else {
    console.log('Permission denied');
  }
}
```

### Android 권한 (Android 13+)

```typescript
import { Platform, PermissionsAndroid } from 'react-native';

async function requestAndroidNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}
```

## 알림 관리

### 알림 취소

```typescript
// 특정 알림 취소
await notifee.cancelNotification('notification-id');

// 모든 알림 취소
await notifee.cancelAllNotifications();

// 특정 태그의 알림 취소
await notifee.cancelNotification('notification-id', 'tag');
```

### 표시된 알림 조회

```typescript
const displayedNotifications = await notifee.getDisplayedNotifications();
console.log('Currently displayed:', displayedNotifications);
```

## 예약 알림

```typescript
import notifee, { TriggerType, TimestampTrigger } from '@notifee/react-native';

async function scheduleNotification() {
  const date = new Date(Date.now() + 60 * 60 * 1000); // 1시간 후

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
  };

  await notifee.createTriggerNotification(
    {
      title: '예약된 알림',
      body: '1시간이 지났습니다',
      android: {
        channelId: 'default',
      },
    },
    trigger
  );
}
```

## 반복 알림

```typescript
import { TriggerType, RepeatFrequency } from '@notifee/react-native';

async function scheduleRepeatingNotification() {
  const trigger = {
    type: TriggerType.INTERVAL,
    interval: 15, // 15분마다
    timeUnit: TimeUnit.MINUTES,
  };

  await notifee.createTriggerNotification(
    {
      title: '반복 알림',
      body: '15분마다 표시됩니다',
      android: {
        channelId: 'default',
      },
    },
    trigger
  );
}
```

## 알림 스타일

### Big Text

```typescript
android: {
  channelId: 'default',
  style: {
    type: AndroidStyle.BIGTEXT,
    text: '매우 긴 텍스트 내용...',
  },
}
```

### Inbox Style

```typescript
android: {
  channelId: 'default',
  style: {
    type: AndroidStyle.INBOX,
    lines: [
      '첫 번째 메시지',
      '두 번째 메시지',
      '세 번째 메시지',
    ],
  },
}
```

### Progress Bar

```typescript
android: {
  channelId: 'default',
  progress: {
    max: 100,
    current: 45,
    indeterminate: false,
  },
}
```

## 베스트 프랙티스

### 1. 앱 시작 시 채널 생성

```typescript
// App.tsx
useEffect(() => {
  createNotificationChannels();
}, []);
```

### 2. 알림 ID 관리

```typescript
// 고유한 ID 사용
const notificationId = `recording-${Date.now()}`;
await notifee.displayNotification({
  id: notificationId,
  // ...
});
```

### 3. 알림 우선순위

- **HIGH**: 중요한 알림 (전화, 메시지)
- **DEFAULT**: 일반 알림
- **LOW**: Foreground Service

### 4. 배터리 최적화

```typescript
// Foreground Service는 LOW importance 사용
await notifee.createChannel({
  id: 'foreground-service',
  name: 'Background Tasks',
  importance: AndroidImportance.LOW,
  sound: undefined,
  vibration: false,
});
```

## 트러블슈팅

### 알림이 표시되지 않음

1. **채널 확인**: Android에서 채널이 생성되었는지 확인
2. **권한 확인**: iOS/Android 13+ 권한 상태 확인
3. **중요도 확인**: 채널의 importance 레벨 확인

### iOS에서 소리가 나지 않음

```typescript
ios: {
  sound: 'default',
  critical: true, // Critical alert (iOS 12+)
}
```

### Android 아이콘이 표시되지 않음

- `android/app/src/main/res/drawable/ic_notification.png` 생성
- 투명 배경의 흰색 아이콘 사용 (24x24dp)

## 참고 자료

- [Notifee 공식 문서](https://notifee.app/)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)
- [iOS User Notifications](https://developer.apple.com/documentation/usernotifications)

## 다음 단계

1. Phase 177: 녹음 중 Foreground 알림 구현
2. Phase 178: 동기화 완료 알림 구현
