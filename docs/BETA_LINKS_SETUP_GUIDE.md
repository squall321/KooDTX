# Beta Links Setup Guide

**Date:** 2025-11-15
**Purpose:** Step-by-step guide to configure beta testing links
**Priority:** P0 - Required before Phase 223 (Internal Beta)

---

## 📋 Overview

This guide provides detailed instructions for setting up all beta testing links required for KooDTX. These links must be configured in `src/config/betaLinks.ts` before starting Phase 223 (Internal Beta Week 1).

**Timeline:** Complete before Phase 223 starts (approximately 2-3 hours total)

---

## 🔗 Links to Configure

| Link Type | Current Status | Required For |
|-----------|----------------|--------------|
| TestFlight (iOS) | ❌ Placeholder | iOS beta testers |
| Google Play Internal Test | ❌ Placeholder | Android beta testers |
| Feedback Form | ❌ Placeholder | General feedback |
| Bug Report Form | ❌ Placeholder | Bug reports |
| Feature Request Form | ❌ Placeholder | Feature requests |
| Discord Invite | ❌ Placeholder | Community (optional) |

---

## 1️⃣ Google Play Internal Testing Setup

**Time:** ~20 minutes
**Platform:** Android

### Prerequisites

- [ ] Google Play Console account
- [ ] KooDTX app created in Google Play Console
- [ ] Signed APK or AAB ready for upload

### Steps

#### 1.1 Upload Build to Internal Testing

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (KooDTX)
3. Navigate to **Testing** → **Internal testing**
4. Click **Create new release**
5. Upload your signed APK or AAB:
   ```bash
   # Generate signed APK/AAB
   cd android
   ./gradlew bundleRelease
   # File will be at: android/app/build/outputs/bundle/release/app-release.aab
   ```
6. Fill in release details:
   - **Release name:** `v1.0.0-beta.1` (or current version)
   - **Release notes:**
     ```
     First internal beta release
     - Core sensor recording functionality
     - Data synchronization
     - Session management
     - Bug fixes and improvements
     ```
7. Click **Save** and **Review release**
8. Click **Start rollout to Internal testing**

#### 1.2 Get Internal Testing Link

1. Go to **Testing** → **Internal testing**
2. Click **Testers** tab
3. Copy the **Copy link** under "How testers join your test"
4. Format will be: `https://play.google.com/apps/internaltest/XXXXXXXXXXXX`

#### 1.3 Update betaLinks.ts

```typescript
// src/config/betaLinks.ts
export const betaLinks: BetaLinks = {
  // ...
  playStoreInternalTest: 'https://play.google.com/apps/internaltest/YOUR_ACTUAL_CODE_HERE',
  // ...
};
```

### Troubleshooting

**Issue:** Can't find the internal testing link
**Solution:** Make sure you've created at least one release in Internal testing

**Issue:** Link shows "Testing program is full"
**Solution:** Go to Testers tab → Manage testers → Increase tester limit (default is 100)

---

## 2️⃣ TestFlight Setup (iOS) - Optional

**Time:** ~30 minutes
**Platform:** iOS
**Note:** Only if you're building for iOS

### Prerequisites

- [ ] Apple Developer account ($99/year)
- [ ] App created in App Store Connect
- [ ] Signed IPA ready for upload

### Steps

#### 2.1 Upload Build to App Store Connect

1. Build archive in Xcode:
   ```bash
   cd ios
   xcodebuild archive \
     -workspace KooDTX.xcworkspace \
     -scheme KooDTX \
     -archivePath build/KooDTX.xcarchive
   ```
2. Or use Fastlane:
   ```bash
   fastlane beta
   ```
3. Upload to App Store Connect via Xcode → Organizer → Upload

#### 2.2 Configure TestFlight

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select KooDTX app
3. Go to **TestFlight** tab
4. Wait for build to process (15-30 minutes)
5. Select build → **External Testing** → **Create Group**
6. Name: "KooDTX Beta Testers"
7. Add test information:
   - **What to test:** Main features, data sync, recording
   - **Feedback email:** beta@koodtx.com

#### 2.3 Get TestFlight Link

1. External Testing group → **Public Link**
2. Click **Enable Public Link**
3. Copy the link: `https://testflight.apple.com/join/XXXXXXXX`

#### 2.4 Update betaLinks.ts

```typescript
// src/config/betaLinks.ts
export const betaLinks: BetaLinks = {
  testFlight: 'https://testflight.apple.com/join/YOUR_ACTUAL_CODE_HERE',
  // ...
};
```

---

## 3️⃣ Google Forms Setup

**Time:** ~45 minutes (15 min each)
**Cost:** Free

### Prerequisites

- [ ] Google account
- [ ] Access to Google Forms

### 3.1 Create Feedback Form

1. Go to [Google Forms](https://forms.google.com/)
2. Click **+ Blank** or use template
3. Use the structure from `docs/BETA_FEEDBACK_TEMPLATE.md`:

**Form Title:** KooDTX Beta Feedback

**Questions:**
1. Your Name (Short answer, Optional)
2. Email (Email, Required)
3. What do you like most about KooDTX? (Paragraph)
4. What frustrates you the most? (Paragraph)
5. How would you rate the overall experience? (Linear scale 1-5)
6. Would you recommend KooDTX to others? (Multiple choice: Yes/No/Maybe)
7. Any additional comments? (Paragraph, Optional)

4. Click **Send** → **Link icon** → **Shorten URL**
5. Copy shortened link: `https://forms.gle/XXXXX`

### 3.2 Create Bug Report Form

Use structure from `docs/BETA_BUG_REPORT_TEMPLATE.md`

**Form Title:** KooDTX Bug Report

**Questions:**
1. Your Name (Short answer, Optional)
2. Email (Email, Required)
3. Bug Summary (Short answer, Required)
4. Steps to Reproduce (Paragraph, Required)
5. Expected Behavior (Paragraph)
6. Actual Behavior (Paragraph)
7. Device Model (Short answer)
8. OS Version (Short answer)
9. App Version (Short answer)
10. Severity (Multiple choice: Critical/High/Medium/Low)
11. Screenshots (File upload, Optional)
12. Additional Notes (Paragraph, Optional)

### 3.3 Create Feature Request Form

Use structure from `docs/BETA_FEATURE_REQUEST_TEMPLATE.md`

**Form Title:** KooDTX Feature Request

**Questions:**
1. Your Name (Short answer, Optional)
2. Email (Email, Required)
3. Feature Title (Short answer, Required)
4. Problem it solves (Paragraph, Required)
5. Proposed solution (Paragraph, Required)
6. Alternatives considered (Paragraph, Optional)
7. Priority (Multiple choice: Critical/High/Medium/Low)
8. Additional context (Paragraph, Optional)

### 3.4 Update betaLinks.ts

```typescript
// src/config/betaLinks.ts
export const betaLinks: BetaLinks = {
  // ...
  feedbackForm: 'https://forms.gle/YOUR_FEEDBACK_FORM_CODE',
  bugReportForm: 'https://forms.gle/YOUR_BUG_REPORT_FORM_CODE',
  featureRequestForm: 'https://forms.gle/YOUR_FEATURE_REQUEST_FORM_CODE',
  // ...
};
```

### 3.5 Configure Form Notifications

1. For each form, click **Responses** tab
2. Click ⋮ (three dots) → **Get email notifications for new responses**
3. Or integrate with Google Sheets:
   - **Responses** → **View in Sheets**
   - Create spreadsheet: "KooDTX Beta Feedback"
   - All responses will be automatically logged

---

## 4️⃣ Discord Server Setup (Optional)

**Time:** ~15 minutes
**Cost:** Free
**Recommended:** Useful for community building

### Steps

#### 4.1 Create Discord Server

1. Open Discord
2. Click **+** (Add a Server)
3. Select **Create My Own** → **For a club or community**
4. Server Name: **KooDTX Beta**
5. Upload icon (optional)

#### 4.2 Set Up Channels

Create these channels:
- `#welcome` - Welcome message and rules
- `#announcements` - Beta updates and releases
- `#general` - General discussion
- `#bug-reports` - Quick bug reports
- `#feature-requests` - Feature ideas
- `#help` - Support for testers

#### 4.3 Create Invite Link

1. Right-click server name → **Invite People**
2. Click **Edit invite link**
3. Set **Expire After:** Never
4. Set **Max Uses:** No limit
5. Copy link: `https://discord.gg/XXXXXXXX`

#### 4.4 Update betaLinks.ts

```typescript
// src/config/betaLinks.ts
export const betaLinks: BetaLinks = {
  // ...
  discordInvite: 'https://discord.gg/YOUR_DISCORD_CODE',
};
```

---

## 5️⃣ Verification & Testing

After configuring all links, verify they work:

### Checklist

- [ ] **Google Play Internal Test Link**
  - [ ] Link opens correctly
  - [ ] Shows "Join the test" button
  - [ ] Can install app after joining

- [ ] **TestFlight Link** (if iOS)
  - [ ] Link opens TestFlight app
  - [ ] Shows beta information
  - [ ] Can install app

- [ ] **Feedback Form**
  - [ ] All questions display correctly
  - [ ] Can submit test response
  - [ ] Receive email notification (if configured)

- [ ] **Bug Report Form**
  - [ ] All required fields enforced
  - [ ] File upload works (if configured)
  - [ ] Response recorded in Sheet (if configured)

- [ ] **Feature Request Form**
  - [ ] Form loads properly
  - [ ] Can submit successfully

- [ ] **Discord Invite** (if configured)
  - [ ] Link works
  - [ ] Doesn't expire
  - [ ] New users can join

### Test with Real Device

1. Send links to your personal email
2. Open on mobile device
3. Click each link
4. Verify proper behavior

---

## 6️⃣ Update Configuration File

### Final betaLinks.ts

```typescript
// src/config/betaLinks.ts

export const betaLinks: BetaLinks = {
  // Android Google Play Internal Testing
  playStoreInternalTest: 'https://play.google.com/apps/internaltest/XXXXXXXXXXXX',

  // iOS TestFlight (if applicable)
  testFlight: 'https://testflight.apple.com/join/XXXXXXXX',

  // Google Forms
  feedbackForm: 'https://forms.gle/XXXXX',
  bugReportForm: 'https://forms.gle/XXXXX',
  featureRequestForm: 'https://forms.gle/XXXXX',

  // Discord Community (optional)
  discordInvite: 'https://discord.gg/XXXXXXXX',
};
```

### Verify Configuration

```bash
# Check if links are configured
cd src/config
grep -v "YOUR_" betaLinks.ts | grep -v "PLACEHOLDER"
```

All links should show actual URLs, not placeholders.

---

## 7️⃣ Additional Setup (Recommended)

### 7.1 Beta Testing Email

Create dedicated email: `beta@koodtx.com`

**Purpose:**
- Receive form responses
- TestFlight notifications
- Direct tester communication

**Setup:**
1. Create email account (Gmail, Outlook, etc.)
2. Set up email forwarding to your main email
3. Create email signature:
   ```
   KooDTX Beta Team
   Email: beta@koodtx.com
   Discord: https://discord.gg/XXXXXXXX
   ```

### 7.2 Tester Database

Create Google Sheet: "KooDTX Beta Testers"

**Columns:**
- Name
- Email
- Platform (Android/iOS)
- Device Model
- OS Version
- Join Date
- Last Active
- Feedback Count
- Status (Active/Inactive)

### 7.3 Automated Notifications (Optional)

Use Zapier or Make.com to automate:
1. **New form submission** → Email notification
2. **New form submission** → Add to Google Sheet
3. **New form submission** → Post to Discord #bug-reports

---

## 📊 Progress Tracking

### Before Phase 223 Checklist

- [ ] Google Play Internal Testing configured
- [ ] TestFlight configured (if iOS)
- [ ] 3 Google Forms created and tested
- [ ] Discord server created (optional)
- [ ] All links updated in `betaLinks.ts`
- [ ] Links verified on real devices
- [ ] Beta email created
- [ ] Tester database created
- [ ] Notification system configured (optional)

### Ready to Start Phase 223?

✅ **All required links configured**
✅ **Links tested and working**
✅ **betaLinks.ts updated**
✅ **areBetaLinksConfigured() returns true**

---

## 🚨 Troubleshooting

### Google Play: "This testing program is full"

**Solution:** Increase tester limit
1. Testing → Internal testing → Testers tab
2. Manage testers → Increase limit to 100+

### TestFlight: "Beta is not available"

**Solution:**
1. Check build status in App Store Connect
2. Ensure External Testing is enabled
3. Public Link must be enabled

### Google Forms: Not receiving responses

**Solution:**
1. Check spam folder
2. Verify email notifications are enabled
3. Check Google Sheets integration

### Discord: Invite expired

**Solution:**
1. Create new invite with "Never expire"
2. Update betaLinks.ts
3. Re-deploy app update

---

## 📚 Reference Links

- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Forms](https://forms.google.com/)
- [Discord](https://discord.com/)
- [GOOGLE_FORMS_SETUP_GUIDE.md](./GOOGLE_FORMS_SETUP_GUIDE.md)
- [BETA_TESTING_GUIDE.md](../BETA_TESTING_GUIDE.md)

---

## ✅ Completion

Once all links are configured:

1. **Commit changes:**
   ```bash
   git add src/config/betaLinks.ts
   git commit -m "feat: Configure beta testing links for Phase 223"
   git push
   ```

2. **Verify in app:**
   - Build app
   - Go to Settings → Beta Info
   - Click each link
   - Confirm all links work

3. **Document actual links** (keep private):
   - Store in password manager
   - Share with team via secure channel
   - Do NOT commit actual links to public repo (if open source)

4. **Ready for Phase 223!** 🎉

---

**Last Updated:** 2025-11-15
**Next Review:** Before Phase 223 start
**Status:** Ready to execute
