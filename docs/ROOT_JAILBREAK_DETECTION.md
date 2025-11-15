# Root/Jailbreak Detection Guide
**Phase 172: Detecting Compromised Devices**

## Overview

Root (Android) and Jailbreak (iOS) detection helps identify compromised devices that may pose security risks to your app and users' data.

## Why Detect Root/Jailbreak?

### Risks of Compromised Devices

- 🔓 **Bypassed Security**: OS-level protections removed
- 🔑 **Access to Sensitive Data**: Can access encrypted storage
- 🎭 **App Tampering**: Can modify app behavior at runtime
- 💳 **Financial Fraud**: Higher risk for payment/banking apps
- 🕵️ **Data Theft**: Can intercept app communications

### Use Cases

- Banking & financial apps
- Enterprise apps with sensitive data
- Apps handling PII (Personally Identifiable Information)
- DRM-protected content
- Compliance requirements (PCI-DSS, HIPAA)

## Implementation

### Install jail-monkey

```bash
npm install jail-monkey

# iOS
cd ios && pod install

# Android - automatic linking
```

### Basic Usage

```typescript
import { isDeviceCompromised } from '@utils/deviceSecurity';

// Simple check
const isCompromised = isDeviceCompromised();

if (isCompromised) {
  Alert.alert(
    'Security Warning',
    'This device appears to be rooted/jailbroken. Some features may be restricted.'
  );
}
```

### Comprehensive Check

```typescript
import {
  performSecurityCheck,
  getSecurityLevel,
  shouldRestrictFeature,
} from '@utils/deviceSecurity';

// Detailed security check
const result = performSecurityCheck();

console.log('Security check:', {
  isCompromised: result.isCompromised,
  checks: result.checks,
  warnings: result.warnings,
  recommendations: result.recommendations,
});

// Get security level
const level = getSecurityLevel(); // 'secure' | 'warning' | 'compromised'

// Check if feature should be restricted
const restrictPayments = shouldRestrictFeature('payments');
if (restrictPayments) {
  // Disable payment features
}
```

### Using SecurityWarning Component

```tsx
import SecurityWarning from '@components/SecurityWarning';

function App() {
  return (
    <>
      <SecurityWarning
        allowBypass={true}
        showDetails={true}
        onAcceptRisk={() => {
          console.log('User accepted risk');
        }}
        onReject={() => {
          // Close app or navigate away
          BackHandler.exitApp();
        }}
      />
      {/* Rest of your app */}
    </>
  );
}
```

### Using Hook

```tsx
import { useSecurityCheck } from '@components/SecurityWarning';

function MyScreen() {
  const { isCompromised, securityLevel, recheckSecurity } = useSecurityCheck({
    autoCheck: true,
    onCompromised: (result) => {
      console.log('Device compromised:', result);
    },
  });

  if (isCompromised) {
    return (
      <View>
        <Text>This feature is not available on compromised devices</Text>
      </View>
    );
  }

  return <YourNormalContent />;
}
```

## Detection Methods

### Root Detection (Android)

jail-monkey checks for:

1. **Root Management Apps**
   - SuperSU
   - Magisk
   - KingRoot
   - etc.

2. **Root Binaries**
   - `/system/bin/su`
   - `/system/xbin/su`
   - `/sbin/su`

3. **Dangerous Properties**
   - `ro.debuggable=1`
   - `ro.secure=0`

4. **Test Keys**
   - Build signed with test keys

5. **BusyBox**
   - Presence of BusyBox

### Jailbreak Detection (iOS)

jail-monkey checks for:

1. **Jailbreak Files**
   - `/Applications/Cydia.app`
   - `/Library/MobileSubstrate/`
   - `/bin/bash`
   - `/usr/sbin/sshd`
   - `/etc/apt`

2. **Suspicious Apps**
   - Cydia
   - Sileo
   - Zebra

3. **File System Permissions**
   - Can write to protected locations

4. **Dynamic Libraries**
   - MobileSubstrate.dylib
   - Substitute.dylib

5. **URL Schemes**
   - cydia://

## Response Strategies

### 1. Block Entirely

```typescript
const result = performSecurityCheck();

if (result.checks.isJailBroken) {
  Alert.alert(
    'Device Not Supported',
    'This app cannot run on jailbroken/rooted devices for security reasons.',
    [
      {
        text: 'OK',
        onPress: () => BackHandler.exitApp(),
      },
    ],
    { cancelable: false }
  );
  return;
}
```

### 2. Warn and Allow

```typescript
const result = performSecurityCheck();

if (result.isCompromised) {
  Alert.alert(
    'Security Warning',
    'Your device appears to be compromised. Continue at your own risk.',
    [
      {
        text: 'Continue',
        style: 'destructive',
      },
      {
        text: 'Exit',
        onPress: () => BackHandler.exitApp(),
      },
    ]
  );
}
```

### 3. Restrict Features

```typescript
const ProtectedFeature = () => {
  const { isCompromised } = useSecurityCheck();

  if (isCompromised) {
    return (
      <View style={styles.restricted}>
        <Text>This feature is not available on compromised devices</Text>
      </View>
    );
  }

  return <SensitiveFeature />;
};
```

### 4. Monitor and Log

```typescript
import { logSecurityCheck } from '@utils/deviceSecurity';
import analytics from '@react-native-firebase/analytics';

const result = performSecurityCheck();

// Log to analytics
analytics().logEvent('security_check', {
  is_compromised: result.isCompromised,
  platform: Platform.OS,
  trust_score: getTrustScore(),
  ...result.checks,
});

// Log to monitoring
logSecurityCheck(result);

// Send to backend
api.post('/security/report', {
  deviceId: getDeviceId(),
  securityCheck: result,
  timestamp: Date.now(),
});
```

## Best Practices

### 1. Don't Rely Solely on Client-Side Detection

```typescript
// ❌ Bad - Only client-side check
if (isDeviceCompromised()) {
  // Block feature
}

// ✅ Good - Also validate on server
const response = await api.post('/validate-device', {
  securityCheck: performSecurityCheck(),
  deviceInfo: getDeviceInfo(),
});

if (!response.data.deviceTrusted) {
  // Block feature
}
```

### 2. Use Trust Scores

```typescript
import { getTrustScore } from '@utils/deviceSecurity';

const trustScore = getTrustScore(); // 0-100

if (trustScore < 50) {
  // High risk - block critical features
  setRestrictedMode(true);
} else if (trustScore < 80) {
  // Medium risk - warn user
  showSecurityWarning();
}
```

### 3. Graceful Degradation

```typescript
const PaymentScreen = () => {
  const { isCompromised } = useSecurityCheck();

  if (isCompromised) {
    return (
      <View>
        <Text>For security reasons, payments are not available on this device.</Text>
        <Text>You can still browse and add items to your cart.</Text>
      </View>
    );
  }

  return <PaymentForm />;
};
```

### 4. Update Regularly

```typescript
// Check security periodically
useEffect(() => {
  const interval = setInterval(() => {
    const result = performSecurityCheck();
    if (result.isCompromised) {
      // Handle newly detected compromise
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  return () => clearInterval(interval);
}, []);
```

## Bypass Prevention

### Detection Methods Can Be Bypassed

⚠️ **Important**: Root/jailbreak detection is NOT foolproof. Determined attackers can bypass it.

**Common Bypass Techniques:**
- Hooking detection functions
- Modifying app binary
- Using hiding tools (Magisk Hide, Liberty Lite)
- Emulating non-rooted environment

### Defense in Depth

```typescript
// Layer 1: Client-side detection
const clientCheck = performSecurityCheck();

// Layer 2: Server-side validation
const serverCheck = await api.validateDevice();

// Layer 3: Behavioral analysis
const behaviorScore = await analyzeBehavior();

// Combined decision
const isTrusted =
  !clientCheck.isCompromised &&
  serverCheck.trusted &&
  behaviorScore > 80;
```

## Testing

### Test on Rooted/Jailbroken Devices

**Android:**
```bash
# Check if rooted
adb shell su -c "id"

# If not rooted, use emulator with root
emulator -avd Pixel_5_API_31 -writable-system
adb root
```

**iOS:**
```bash
# Jailbroken device required for testing
# Or use jailbreak detection simulators
```

### Test Detection

```typescript
// In development, you can simulate detection
const __DEV_SIMULATE_ROOT__ = false;

export const isDeviceCompromised = (): boolean => {
  if (__DEV__ && __DEV_SIMULATE_ROOT__) {
    return true; // Simulate rooted device
  }
  return JailMonkey.isJailBroken();
};
```

### Unit Tests

```typescript
import { performSecurityCheck } from '@utils/deviceSecurity';

describe('Device Security', () => {
  it('should detect secure device', () => {
    const result = performSecurityCheck();
    // Assuming test device is not rooted
    expect(result.isCompromised).toBe(false);
  });

  it('should have all checks', () => {
    const result = performSecurityCheck();
    expect(result.checks).toHaveProperty('isJailBroken');
    expect(result.checks).toHaveProperty('canMockLocation');
    expect(result.checks).toHaveProperty('hookDetected');
  });
});
```

## Compliance

### PCI-DSS Requirements

For payment card data:
- Detect jailbroken/rooted devices
- Log security events
- Restrict payment features on compromised devices

### HIPAA Requirements

For healthcare data:
- Identify security risks
- Implement access controls
- Log security events

### Enterprise Policies

Many enterprises require:
- Detection of compromised devices
- Restriction of corporate data access
- Reporting of security events

## False Positives

### Common Causes

1. **Developer Devices**
   - Rooted for development
   - ADB debugging enabled

2. **Custom ROMs**
   - Some ROMs trigger detection
   - Not necessarily insecure

3. **Emulators**
   - Often appear as rooted
   - May need to whitelist

### Handling False Positives

```typescript
const handleSecurityCheck = async () => {
  const result = performSecurityCheck();

  if (result.isCompromised) {
    // Allow user to report false positive
    Alert.alert(
      'Security Check',
      'We detected security concerns with your device. If you believe this is an error, please contact support.',
      [
        {
          text: 'Contact Support',
          onPress: () => openSupportChat(),
        },
        {
          text: 'Continue',
          style: 'destructive',
        },
      ]
    );
  }
};
```

## Monitoring

### Track Detection Rates

```typescript
analytics().logEvent('device_security_check', {
  is_compromised: result.isCompromised,
  platform: Platform.OS,
  app_version: DeviceInfo.getVersion(),
  trust_score: getTrustScore(),
});

// Track over time
if (result.isCompromised) {
  analytics().logEvent('compromised_device_detected', {
    detection_type: Platform.OS === 'ios' ? 'jailbreak' : 'root',
    checks_failed: Object.entries(result.checks)
      .filter(([_, value]) => value === true)
      .map(([key]) => key),
  });
}
```

### Alert on Suspicious Patterns

```typescript
const monitorSecurityTrends = () => {
  const compromisedRate = getCompromisedDeviceRate();

  if (compromisedRate > 0.1) {
    // More than 10% of devices compromised
    sendAlertToTeam({
      type: 'security_trend',
      message: `High rate of compromised devices detected: ${compromisedRate * 100}%`,
    });
  }
};
```

## Resources

- [jail-monkey](https://github.com/GantMan/jail-monkey)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [Root Detection Techniques](https://mobile-security.gitbook.io/mobile-security-testing-guide/android-testing-guide/0x05j-testing-resiliency-against-reverse-engineering#testing-root-detection)
- [iOS Jailbreak Detection](https://mobile-security.gitbook.io/mobile-security-testing-guide/ios-testing-guide/0x06j-testing-resiliency-against-reverse-engineering#jailbreak-detection)

## Summary

Root/jailbreak detection is an important security measure but should be part of a comprehensive security strategy:

**Key Points:**
- 🔍 Detect compromised devices
- ⚠️ Warn users appropriately
- 🛡️ Restrict sensitive features
- 📊 Monitor and log events
- 🔄 Update detection regularly
- 🎯 Use defense in depth
- ⚖️ Balance security and UX
