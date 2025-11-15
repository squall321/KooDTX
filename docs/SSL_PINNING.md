# SSL Pinning Guide
**Phase 171: Certificate Pinning for Enhanced Security**

## Overview

SSL Pinning (Certificate Pinning) prevents man-in-the-middle (MITM) attacks by validating that the server's certificate matches a known, trusted certificate or public key.

## Why SSL Pinning?

### Without SSL Pinning

```
Your App → [Attacker's Proxy] → Your Server
           ↑
    Can intercept & modify data
```

### With SSL Pinning

```
Your App → [Attacker's Proxy] → ❌ Connection Rejected
           ↑
    Certificate doesn't match pinned cert
```

## Benefits

- ✅ Prevents MITM attacks
- ✅ Protects against rogue CAs
- ✅ Secures sensitive data transmission
- ✅ Compliance with security standards

## Risks

- ❌ App breaks if certificate expires
- ❌ Harder to debug network issues
- ❌ Requires app update to change pins
- ❌ Can block legitimate proxies

## Implementation

### Method 1: Using react-native-ssl-pinning

**Install:**
```bash
npm install react-native-ssl-pinning

# iOS
cd ios && pod install

# Android - automatic linking
```

**Configure:**

**src/utils/sslPinning.ts:**
```typescript
import { fetch as sslFetch } from 'react-native-ssl-pinning';

export const secureFetch = async (url: string, options: any = {}) => {
  const config = {
    ...options,
    sslPinning: {
      // Pin to certificate (recommended)
      certs: ['mycert'], // Put mycert.cer in android/app/src/main/assets/ and ios/

      // Or pin to public key hash
      // publicKeyHashes: [
      //   'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      //   'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=', // Backup pin
      // ],
    },
  };

  return await sslFetch(url, config);
};
```

**Usage:**
```typescript
import { secureFetch } from '@utils/sslPinning';

// Use instead of regular fetch
const response = await secureFetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

### Method 2: Axios Integration

**src/api/secureClient.ts:**
```typescript
import axios from 'axios';
import { fetch as sslFetch } from 'react-native-ssl-pinning';

// Create secure axios instance
export const secureAxios = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

// Replace default adapter with SSL pinning adapter
secureAxios.defaults.adapter = async (config) => {
  const url = config.baseURL + config.url;

  const response = await sslFetch(url, {
    method: config.method?.toUpperCase() || 'GET',
    headers: config.headers,
    body: config.data ? JSON.stringify(config.data) : undefined,
    sslPinning: {
      certs: ['mycert'],
    },
  });

  const data = await response.json();

  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    config,
  };
};

export default secureAxios;
```

**Usage:**
```typescript
import { secureAxios } from '@api/secureClient';

// Use like regular axios
const response = await secureAxios.get('/users');
const response = await secureAxios.post('/login', { email, password });
```

## Getting Certificate Pins

### Method 1: Extract from Server

```bash
# Get certificate from server
openssl s_client -connect api.example.com:443 -showcerts < /dev/null | \
  openssl x509 -outform DER > mycert.der

# Convert to PEM
openssl x509 -inform DER -in mycert.der -out mycert.cer

# Get public key hash (for public key pinning)
openssl x509 -in mycert.cer -pubkey -noout | \
  openssl pkey -pubin -outform der | \
  openssl dgst -sha256 -binary | \
  openssl enc -base64
```

**Result:**
```
sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
```

### Method 2: From Browser

1. Visit your API in Chrome
2. Click the lock icon → Certificate
3. Details → Export
4. Save as .cer file

### Method 3: Online Tools

- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [Certificate Decoder](https://www.sslshopper.com/certificate-decoder.html)

## Certificate Placement

### Android

```
android/app/src/main/assets/
  └── mycert.cer
```

### iOS

1. Drag certificate to Xcode project
2. Ensure "Copy items if needed" is checked
3. Add to target

## Testing SSL Pinning

### Test Valid Certificate

```typescript
const testValidPin = async () => {
  try {
    const response = await secureFetch('https://api.example.com/test');
    console.log('✅ SSL Pinning working:', response.status);
  } catch (error) {
    console.error('❌ SSL Pinning failed:', error);
  }
};
```

### Test Invalid Certificate (Should Fail)

```typescript
const testInvalidPin = async () => {
  try {
    // Use different server (should fail)
    const response = await secureFetch('https://google.com');
    console.error('❌ SSL Pinning NOT working - should have failed!');
  } catch (error) {
    console.log('✅ SSL Pinning working - correctly rejected:', error.message);
  }
};
```

### Test with Proxy (Should Fail)

1. Set up Charles Proxy or similar
2. Configure device to use proxy
3. Try to make API request
4. Should fail with SSL error

## Error Handling

```typescript
import { secureFetch } from '@utils/sslPinning';

const fetchData = async () => {
  try {
    const response = await secureFetch('https://api.example.com/data');
    return await response.json();
  } catch (error: any) {
    if (error.message?.includes('SSL')) {
      // SSL pinning error
      console.error('SSL pinning failed - possible MITM attack!');

      // Alert user
      Alert.alert(
        'Security Error',
        'Unable to establish secure connection. Please check your network.',
        [{ text: 'OK' }]
      );

      // Log to monitoring service
      Sentry.captureException(error, {
        tags: { type: 'ssl_pinning_failure' },
      });

      return null;
    }

    // Other network error
    throw error;
  }
};
```

## Best Practices

### 1. Use Multiple Pins

```typescript
sslPinning: {
  // Primary certificate
  certs: ['mycert-primary'],

  // Or use public key hashes with backup
  publicKeyHashes: [
    'sha256/PrimaryKeyHash...',
    'sha256/BackupKeyHash...',  // Backup for cert rotation
  ],
}
```

### 2. Plan for Certificate Rotation

```typescript
// config.ts
export const SSL_PINS = {
  primary: 'sha256/CurrentCertHash...',
  backup: 'sha256/NextCertHash...',
  expiryDate: '2025-12-31',
};

// Check expiry and warn
if (new Date() > new Date(SSL_PINS.expiryDate)) {
  console.warn('SSL certificate expiring soon!');
  // Send alert to monitoring
}
```

### 3. Use in Production Only

```typescript
import { __DEV__ } from 'react-native';

export const createApiClient = () => {
  const config = {
    baseURL: 'https://api.example.com',
  };

  // Only enable SSL pinning in production
  if (!__DEV__) {
    return secureAxios;
  } else {
    return axios.create(config); // Regular axios for development
  }
};
```

### 4. Monitor Failures

```typescript
const secureFetchWithMonitoring = async (url: string, options: any) => {
  try {
    return await secureFetch(url, options);
  } catch (error) {
    // Log SSL pinning failures
    Analytics.logEvent('ssl_pinning_failure', {
      url,
      error: error.message,
      timestamp: Date.now(),
    });

    throw error;
  }
};
```

## Troubleshooting

### Issue: SSL Pinning Always Fails

**Causes:**
1. Wrong certificate
2. Certificate not found
3. Incorrect pin format

**Solutions:**
```bash
# Verify certificate is correct
openssl x509 -in mycert.cer -text -noout

# Check public key hash
openssl x509 -in mycert.cer -pubkey -noout | \
  openssl pkey -pubin -outform der | \
  openssl dgst -sha256 -binary | \
  openssl enc -base64
```

### Issue: Works in Development, Fails in Production

**Cause:** Development uses HTTP, production uses HTTPS

**Solution:**
```typescript
const API_URL = __DEV__
  ? 'http://localhost:3000'  // Development
  : 'https://api.example.com'; // Production (with SSL pinning)
```

### Issue: Certificate Expired

**Solution:**
1. Get new certificate from server
2. Update pins in code
3. Release app update
4. **Important:** Keep backup pin for seamless rotation

## Certificate Rotation Strategy

### Before Certificate Expires

1. **3 months before expiry:**
   - Get new certificate
   - Add new pin as backup
   - Release app update

2. **After most users updated:**
   - Rotate certificate on server
   - Old certificate still works for old app versions

3. **After all users updated:**
   - Remove old pin
   - New certificate is now primary

### Code Example

```typescript
// Version 1.0 - Original certificate
const PINS_V1 = {
  primary: 'sha256/OriginalCertHash...',
};

// Version 1.1 - Add backup for rotation
const PINS_V1_1 = {
  primary: 'sha256/OriginalCertHash...',
  backup: 'sha256/NewCertHash...',
};

// Version 1.2 - After rotation complete
const PINS_V1_2 = {
  primary: 'sha256/NewCertHash...',
};

// Use appropriate pins based on app version
export const getCurrentPins = () => {
  const appVersion = DeviceInfo.getVersion();

  if (semver.gte(appVersion, '1.2.0')) {
    return PINS_V1_2;
  } else if (semver.gte(appVersion, '1.1.0')) {
    return PINS_V1_1;
  } else {
    return PINS_V1;
  }
};
```

## Alternatives

### 1. Public Key Pinning

More flexible than certificate pinning:

```typescript
sslPinning: {
  publicKeyHashes: [
    'sha256/PrimaryPublicKeyHash...',
    'sha256/BackupPublicKeyHash...',
  ],
}
```

**Pros:**
- Survives certificate renewal (if same key pair)
- More flexible

**Cons:**
- Less secure if private key compromised

### 2. Certificate Authority Pinning

Pin to CA instead of specific certificate:

```typescript
sslPinning: {
  // Pin to Let's Encrypt CA
  certs: ['letsencrypt-ca'],
}
```

**Pros:**
- Easier certificate rotation
- Works with any cert from that CA

**Cons:**
- Less secure (trusts entire CA)

## When to Use SSL Pinning

### ✅ Use SSL Pinning When:

- Handling sensitive data (banking, healthcare)
- High-value targets (fintech, enterprise)
- Compliance requirements (PCI-DSS, HIPAA)
- Protecting API keys/secrets
- Preventing corporate espionage

### ❌ Skip SSL Pinning When:

- Public APIs with no sensitive data
- Rapid development/prototyping
- Frequent certificate changes
- Using multiple backends
- Limited resources for maintenance

## Security Checklist

- [ ] Pins are properly configured
- [ ] Backup pins are set for rotation
- [ ] Certificate expiry is monitored
- [ ] Failures are logged and alerted
- [ ] Only enabled in production
- [ ] Tested with real certificate
- [ ] Tested with proxy (should fail)
- [ ] Plan for certificate rotation exists
- [ ] Team knows how to update pins
- [ ] Documentation is up to date

## Resources

- [OWASP Certificate Pinning](https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning)
- [react-native-ssl-pinning](https://github.com/MaxToyberman/react-native-ssl-pinning)
- [Certificate Pinning Best Practices](https://www.thesslstore.com/blog/what-is-certificate-pinning/)
- [Public Key Pinning](https://developer.mozilla.org/en-US/docs/Web/HTTP/Public_Key_Pinning)

## Summary

SSL Pinning significantly enhances mobile app security but requires careful implementation and maintenance. Use it for sensitive applications and plan for certificate rotation.

**Key Points:**
- 🔒 Prevents MITM attacks
- 📱 Requires app update for pin changes
- 🔄 Plan for certificate rotation
- ⚠️ Monitor failures closely
- 🎯 Use in production only
- 🛡️ Essential for sensitive data
