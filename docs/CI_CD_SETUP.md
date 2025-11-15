# CI/CD Setup Guide
**Phase 162: Continuous Integration and Deployment**

## Overview

This guide covers the CI/CD setup for the KooDTX React Native app using GitHub Actions. The CI/CD pipeline automates testing, building, and deployment processes.

## Workflows

### 1. CI Workflow (.github/workflows/ci.yml)

Runs on every push and pull request to main branches.

**Jobs:**
- **Lint & Type Check**: ESLint, TypeScript, Prettier
- **Unit & Integration Tests**: Jest tests with coverage
- **Build Android**: Android Debug APK
- **Build iOS**: iOS Debug build
- **Security Scan**: npm audit, dependency check
- **Performance Check**: Bundle size analysis

**Triggers:**
```yaml
on:
  push:
    branches: [main, develop, 'feature/**', 'claude/**']
  pull_request:
    branches: [main, develop]
```

### 2. E2E Test Workflow (.github/workflows/e2e.yml)

Runs end-to-end tests using Detox.

**Jobs:**
- **E2E Tests (iOS)**: Detox tests on iOS simulator
- **E2E Tests (Android)**: Detox tests on Android emulator

**Triggers:**
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

### 3. Release Workflow (.github/workflows/release.yml)

Builds and publishes production releases.

**Jobs:**
- **Create Release**: GitHub release creation
- **Build Android Release**: Signed APK and AAB
- **Build iOS Release**: Signed IPA

**Triggers:**
```yaml
on:
  push:
    tags:
      - 'v*.*.*'  # v1.0.0, v2.1.3, etc.
```

## Setup Instructions

### Prerequisites

1. **GitHub Repository**: Code hosted on GitHub
2. **GitHub Actions**: Enabled in repository settings
3. **Secrets Configuration**: Required secrets (see below)

### Required GitHub Secrets

Navigate to: **Settings** → **Secrets and variables** → **Actions**

#### Android Secrets

```
ANDROID_KEYSTORE_BASE64
  Description: Base64-encoded release keystore
  How to generate:
    base64 -i release.keystore | pbcopy

ANDROID_KEYSTORE_PASSWORD
  Description: Keystore password
  Value: Your keystore password

ANDROID_KEY_ALIAS
  Description: Key alias
  Value: Your key alias (usually "release")

ANDROID_KEY_PASSWORD
  Description: Key password
  Value: Your key password
```

#### iOS Secrets

```
IOS_CERTIFICATES_P12
  Description: Base64-encoded P12 certificate
  How to generate:
    base64 -i Certificates.p12 | pbcopy

IOS_CERTIFICATES_PASSWORD
  Description: P12 certificate password
  Value: Your certificate password

IOS_PROVISIONING_PROFILE
  Description: Base64-encoded provisioning profile
  How to generate:
    base64 -i profile.mobileprovision | pbcopy
```

#### App Store Connect Secrets (Optional)

```
APP_STORE_CONNECT_ISSUER_ID
APP_STORE_CONNECT_API_KEY_ID
APP_STORE_CONNECT_API_PRIVATE_KEY
```

#### Google Play Secrets (Optional)

```
GOOGLE_PLAY_SERVICE_ACCOUNT
  Description: Service account JSON
  Value: Full JSON content of service account key
```

### Generating Android Keystore

```bash
# Generate keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore release.keystore \
  -alias release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Convert to base64 for GitHub Secrets
base64 -i release.keystore | pbcopy
```

**Store the keystore safely!** You'll need it for all future releases.

### Generating iOS Certificates

1. **Create App ID** in Apple Developer Portal
2. **Generate Certificate Signing Request (CSR)**
   ```bash
   # On macOS
   Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
   ```
3. **Create Distribution Certificate** in Apple Developer Portal
4. **Download and install** the certificate in Keychain
5. **Export as P12**
   ```bash
   # In Keychain Access
   Right-click certificate → Export → Save as .p12
   ```
6. **Convert to base64**
   ```bash
   base64 -i Certificates.p12 | pbcopy
   ```

### Creating Provisioning Profile

1. **Create App ID** in Apple Developer Portal (if not exists)
2. **Create Provisioning Profile** (Distribution)
3. **Download** the profile
4. **Convert to base64**
   ```bash
   base64 -i profile.mobileprovision | pbcopy
   ```

## Configuration Files

### package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "e2e:build:ios": "detox build --configuration ios.sim.release",
    "e2e:test:ios": "detox test --configuration ios.sim.release",
    "e2e:build:android": "detox build --configuration android.emu.release",
    "e2e:test:android": "detox test --configuration android.emu.release"
  }
}
```

### Android Gradle Configuration

**android/app/build.gradle:**

```gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('KEYSTORE_PASSWORD')) {
                storeFile file('release.keystore')
                storePassword System.getenv('KEYSTORE_PASSWORD')
                keyAlias System.getenv('KEY_ALIAS')
                keyPassword System.getenv('KEY_PASSWORD')
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

### iOS Export Options

**ios/ExportOptions.plist:**

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
</dict>
</plist>
```

## Running Workflows

### Automatically

Workflows run automatically based on triggers:

- **CI**: On every push/PR to main branches
- **E2E**: On push/PR + daily at 2 AM
- **Release**: On git tag creation

### Manually

You can also trigger workflows manually:

1. Go to **Actions** tab in GitHub
2. Select workflow
3. Click **Run workflow**
4. Choose branch and parameters

### Creating a Release

```bash
# Tag a new version
git tag v1.0.0

# Push the tag
git push origin v1.0.0

# The release workflow will automatically:
# 1. Create GitHub release
# 2. Build signed Android APK/AAB
# 3. Build signed iOS IPA
# 4. Upload artifacts to GitHub release
# 5. (Optional) Upload to Google Play/App Store
```

## Viewing Results

### CI Results

1. Go to **Actions** tab
2. Click on workflow run
3. View job details, logs, and artifacts

### Test Coverage

Coverage reports are uploaded to Codecov:
- View at: `https://codecov.io/gh/YOUR_USERNAME/KooDTX`

### Artifacts

Download build artifacts:
1. Go to workflow run
2. Scroll to **Artifacts** section
3. Download APK, IPA, or test results

## Troubleshooting

### Common Issues

#### 1. Build Fails on Android

**Error:** "Keystore not found"

**Solution:**
```bash
# Verify secret is set
# Re-generate base64 and update secret
base64 -i release.keystore | pbcopy
```

#### 2. iOS Build Fails

**Error:** "Code signing error"

**Solution:**
- Verify P12 certificate is valid
- Verify provisioning profile matches App ID
- Check certificate expiration date

#### 3. Tests Timeout

**Solution:**
- Increase timeout in workflow:
```yaml
- name: Run tests
  run: npm test
  timeout-minutes: 10
```

#### 4. E2E Tests Fail

**Solution:**
- Check simulator/emulator availability
- Verify Detox configuration
- Check app build succeeded

### Debug Mode

Enable debug logging:

```yaml
- name: Debug info
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    ls -la
```

## Best Practices

### 1. Branch Protection

Configure branch protection rules:
- Require status checks to pass
- Require pull request reviews
- Require up-to-date branches

**Settings** → **Branches** → **Branch protection rules**

### 2. Caching

Cache dependencies to speed up builds:

```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### 3. Secrets Management

- Never commit secrets to repository
- Rotate secrets periodically
- Use separate secrets for dev/staging/prod
- Limit secret access to necessary workflows

### 4. Versioning

Use semantic versioning:
- **Major**: Breaking changes (v2.0.0)
- **Minor**: New features (v1.1.0)
- **Patch**: Bug fixes (v1.0.1)

### 5. Notifications

Add Slack/Discord notifications:

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Build failed: ${{ github.ref }}"
      }
```

## Performance Optimization

### 1. Parallel Jobs

Run independent jobs in parallel:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest

  lint:
    runs-on: ubuntu-latest

  build:
    needs: [test, lint]  # Only run after test and lint pass
```

### 2. Matrix Builds

Test across multiple versions:

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node-version }}
```

### 3. Conditional Execution

Skip unnecessary steps:

```yaml
- name: Build Android
  if: runner.os == 'Linux'
  run: ./gradlew assembleDebug
```

## Security

### 1. Dependency Scanning

Automated security scanning:

```yaml
- name: Run Snyk
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 2. Code Scanning

Enable CodeQL analysis:

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v2
  with:
    languages: javascript

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v2
```

### 3. SAST Tools

Static Application Security Testing:

```yaml
- name: Run ESLint security plugin
  run: npx eslint . --ext .js,.ts --plugin security
```

## Monitoring

### 1. Build Status Badge

Add to README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/KooDTX/workflows/CI/badge.svg)
```

### 2. Workflow Analytics

Track workflow performance:
- **Actions** → **Workflows** → View metrics

### 3. Cost Monitoring

GitHub Actions free tier:
- Public repos: Unlimited
- Private repos: 2,000 minutes/month

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Android Signing Documentation](https://developer.android.com/studio/publish/app-signing)
- [iOS Distribution Documentation](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)
- [Detox CI Documentation](https://wix.github.io/Detox/docs/introduction/continuous-integration)
