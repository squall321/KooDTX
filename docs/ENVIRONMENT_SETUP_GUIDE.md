# Environment Setup Guide

**Date:** 2025-11-15
**Purpose:** Guide for setting up environment variables
**Priority:** P0 - Required before production build

---

## 📋 Overview

KooDTX uses environment variables to manage configuration across different environments (development, staging, production). This guide explains how to set up and manage these variables.

---

## 🗂️ Environment Files

### File Structure

```
KooDTX/
├── .env.example          # Template file (committed to git)
├── .env                  # Main environment file (NOT committed)
├── .env.development      # Development environment (optional)
├── .env.staging          # Staging environment (optional)
└── .env.production       # Production environment (optional)
```

### File Priority

The app uses this priority order:
1. Platform-specific: `.env.development`, `.env.staging`, `.env.production`
2. Main file: `.env`
3. Defaults: Defined in `src/config/env.ts`

---

## 🚀 Quick Setup

### 1. Create .env File

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

### 2. Required Variables (Production)

```bash
# .env
NODE_ENV=production
API_BASE_URL=https://api.koodtx.com  # Your actual API URL
SENTRY_DSN=https://YOUR_KEY@YOUR_ORG.ingest.sentry.io/PROJECT_ID
ENABLE_CRASH_REPORTING=true
ENABLE_ANALYTICS=true
```

### 3. Optional Variables

```bash
# Advanced configuration
API_TIMEOUT=30000
API_RETRY_ATTEMPTS=3
LOG_LEVEL=INFO
ENABLE_DEBUG_MODE=false
```

---

## 📝 Variable Reference

### Environment Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | string | `development` | Environment mode: `development`, `staging`, `production` |

### API Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `API_BASE_URL` | string | `http://localhost:3000/api` (dev)<br/>`https://api.koodtx.com` (prod) | Base URL for API requests |
| `API_TIMEOUT` | number | `30000` | Request timeout in milliseconds |
| `API_RETRY_ATTEMPTS` | number | `3` | Number of retry attempts for failed requests |

### Sentry (Crash Reporting)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SENTRY_DSN` | string | `""` | Sentry Data Source Name |
| `ENABLE_CRASH_REPORTING` | boolean | `false` (dev)<br/>`true` (prod) | Enable/disable crash reporting |

### Logging

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ENABLE_LOGGING` | boolean | `true` | Enable/disable logging |
| `LOG_LEVEL` | string | `DEBUG` (dev)<br/>`INFO` (prod) | Log level: `DEBUG`, `INFO`, `WARN`, `ERROR` |
| `REMOTE_LOGGING_URL` | string | `undefined` | Optional remote logging endpoint |

### Feature Flags

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ENABLE_ANALYTICS` | boolean | `false` (dev)<br/>`true` (prod) | Enable analytics tracking |
| `ENABLE_DEBUG_MODE` | boolean | `true` (dev)<br/>`false` (prod) | Enable debug features |

### App Information

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `APP_VERSION` | string | `0.1.0` | App version (usually from package.json) |
| `BUILD_NUMBER` | string | `1` | Build number (incremented with each build) |

---

## 🔧 Environment-Specific Setup

### Development Environment

```bash
# .env.development
NODE_ENV=development
API_BASE_URL=http://localhost:3000/api
ENABLE_CRASH_REPORTING=false
ENABLE_ANALYTICS=false
ENABLE_DEBUG_MODE=true
LOG_LEVEL=DEBUG
```

### Staging Environment

```bash
# .env.staging
NODE_ENV=staging
API_BASE_URL=https://api-staging.koodtx.com
SENTRY_DSN=https://YOUR_STAGING_KEY@sentry.io/STAGING_PROJECT_ID
ENABLE_CRASH_REPORTING=true
ENABLE_ANALYTICS=false
ENABLE_DEBUG_MODE=false
LOG_LEVEL=INFO
```

### Production Environment

```bash
# .env.production
NODE_ENV=production
API_BASE_URL=https://api.koodtx.com
SENTRY_DSN=https://YOUR_PRODUCTION_KEY@sentry.io/PRODUCTION_PROJECT_ID
ENABLE_CRASH_REPORTING=true
ENABLE_ANALYTICS=true
ENABLE_DEBUG_MODE=false
LOG_LEVEL=INFO
```

---

## 🔐 Getting Your Credentials

### 1. Sentry DSN

**Steps:**
1. Create account at [Sentry.io](https://sentry.io/)
2. Create new project:
   - Platform: React Native
   - Project name: KooDTX
3. Go to **Settings** → **Projects** → **KooDTX** → **Client Keys (DSN)**
4. Copy the DSN:
   ```
   https://abc123@o123456.ingest.sentry.io/789012
   ```
5. Paste into `.env`:
   ```bash
   SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/789012
   ```

### 2. API Base URL

**Development:**
- If running local server: `http://localhost:3000/api`
- If using ngrok: `https://YOUR_SUBDOMAIN.ngrok.io/api`

**Production:**
- Your deployed API server URL
- Examples:
  - `https://api.koodtx.com`
  - `https://koodtx-api.herokuapp.com/api`
  - `https://YOUR_SERVER_IP:3000/api`

### 3. Remote Logging URL (Optional)

Popular services:
- **Loggly:** `https://logs-01.loggly.com/inputs/YOUR_TOKEN/tag/http/`
- **Papertrail:** `https://logs.papertrailapp.com/YOUR_TOKEN`
- **Datadog:** `https://http-intake.logs.datadoghq.com/v1/input/YOUR_API_KEY`

---

## 🛠️ Usage in Code

### Importing Environment Variables

```typescript
// Import from centralized config
import { envConfig, API_BASE_URL, SENTRY_DSN } from '@/config/env';

// Use in your code
const apiUrl = API_BASE_URL; // 'https://api.koodtx.com'
const sentryDsn = SENTRY_DSN; // Your Sentry DSN

// Or use the entire config object
console.log('Environment:', envConfig.NODE_ENV);
console.log('API URL:', envConfig.API_BASE_URL);
console.log('Is Production:', envConfig.IS_PROD);
```

### Example: API Client

```typescript
// src/api/client.ts
import { envConfig } from '../config/env';

const apiClient = axios.create({
  baseURL: envConfig.API_BASE_URL,  // From environment
  timeout: envConfig.API_TIMEOUT,   // From environment
});
```

### Example: Sentry Setup

```typescript
// src/utils/sentry.ts
import { envConfig } from '../config/env';

Sentry.init({
  dsn: envConfig.SENTRY_DSN,
  environment: envConfig.NODE_ENV,
  enabled: envConfig.ENABLE_CRASH_REPORTING,
});
```

---

## ✅ Validation

### Check Configuration

The app automatically validates environment variables on startup.

**In Code:**
```typescript
import { validateEnvConfig, logEnvConfig } from '@/config/env';

// Validate
const validation = validateEnvConfig();
if (!validation.valid) {
  console.error('Missing variables:', validation.missing);
}

// Log current config (development only)
logEnvConfig();
```

**Output (Development):**
```
🔧 Environment Configuration:
  Environment: development
  API Base URL: http://localhost:3000/api
  API Timeout: 30000
  Crash Reporting: Disabled
  Analytics: Disabled
  App Version: 0.1.0
  Build Number: 1
```

### Manual Verification

```bash
# Check if variables are loaded
cd src/config
node -e "require('./env').logEnvConfig()"

# Or use React Native CLI
npx react-native start
# Then check logs for environment configuration
```

---

## 🚨 Troubleshooting

### Issue: Environment variables not loading

**Solution 1:** Clear Metro bundler cache
```bash
npm start -- --reset-cache
```

**Solution 2:** Rebuild the app
```bash
# Android
cd android && ./gradlew clean && cd ..
npm run android

# iOS
cd ios && pod install && cd ..
npm run ios
```

### Issue: "API_BASE_URL is localhost in production"

**Solution:** Check your `.env` file:
```bash
cat .env | grep API_BASE_URL
# Should show: API_BASE_URL=https://api.koodtx.com
# NOT: API_BASE_URL=http://localhost:3000/api
```

### Issue: Sentry not receiving errors

**Check:**
1. `SENTRY_DSN` is set correctly
2. `ENABLE_CRASH_REPORTING=true`
3. `NODE_ENV=production` (Sentry disabled in development)

**Test:**
```typescript
import { captureException } from '@/utils/sentry';

// Trigger test error
captureException(new Error('Test error from KooDTX'));
```

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets

```bash
# Verify .gitignore includes:
cat .gitignore | grep ".env"

# Should show:
# .env
# .env.local
# .env.*.local
```

### 2. Use Different Credentials per Environment

| Environment | Sentry Project | API Server | Database |
|-------------|----------------|------------|----------|
| Development | koodtx-dev | localhost | local DB |
| Staging | koodtx-staging | staging server | staging DB |
| Production | koodtx-prod | production server | production DB |

### 3. Rotate Credentials Regularly

**Schedule:**
- API keys: Every 3-6 months
- Sentry DSN: Yearly
- Database passwords: Every 6 months

### 4. Store Securely

**Recommended:**
- **1Password** - Team password manager
- **AWS Secrets Manager** - For AWS deployments
- **HashiCorp Vault** - Enterprise secret management

**Share with team:**
```bash
# Create encrypted file
gpg --encrypt --recipient team@koodtx.com .env.production

# Decrypt
gpg --decrypt .env.production.gpg > .env.production
```

---

## 📦 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Create .env file
        run: |
          echo "API_BASE_URL=${{ secrets.API_BASE_URL }}" >> .env
          echo "SENTRY_DSN=${{ secrets.SENTRY_DSN }}" >> .env
          echo "NODE_ENV=production" >> .env

      - name: Build app
        run: npm run build
```

**Add secrets in:**
GitHub repo → Settings → Secrets and variables → Actions

---

## 📚 Additional Resources

- [React Native Config](https://github.com/luggit/react-native-config)
- [Sentry Documentation](https://docs.sentry.io/platforms/react-native/)
- [Environment Variables Best Practices](https://12factor.net/config)

---

## ✅ Pre-Production Checklist

Before deploying to production:

- [ ] `.env.production` file created
- [ ] `API_BASE_URL` points to production server
- [ ] `SENTRY_DSN` configured with production project
- [ ] `ENABLE_CRASH_REPORTING=true`
- [ ] `ENABLE_ANALYTICS=true`
- [ ] `ENABLE_DEBUG_MODE=false`
- [ ] `NODE_ENV=production`
- [ ] Validated with `validateEnvConfig()`
- [ ] Tested production build
- [ ] Credentials stored securely
- [ ] Team has access to credentials (via password manager)

---

**Last Updated:** 2025-11-15
**Related Docs:**
- [BETA_LINKS_SETUP_GUIDE.md](./BETA_LINKS_SETUP_GUIDE.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
