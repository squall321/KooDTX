# KooDTX Beta Testing Guide
## Phase 221: Beta Tester Recruitment & Testing Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-15
**Beta Program Status:** Internal Beta (Week 1) - Recruiting

---

## 📋 Table of Contents

1. [Welcome](#welcome)
2. [Beta Program Overview](#beta-program-overview)
3. [How to Join](#how-to-join)
4. [Tester Groups](#tester-groups)
5. [Testing Guidelines](#testing-guidelines)
6. [Test Scenarios](#test-scenarios)
7. [Reporting Issues](#reporting-issues)
8. [Feedback Channels](#feedback-channels)
9. [Timeline](#timeline)
10. [Rewards & Recognition](#rewards--recognition)

---

## 🎉 Welcome

Thank you for your interest in becoming a KooDTX beta tester! Your participation is crucial in helping us build a robust, reliable sensor data collection application.

**KooDTX** is a React Native mobile application designed for:
- Multi-sensor data recording (Accelerometer, Gyroscope, Magnetometer, GPS, Audio)
- Local-first data storage with WatermelonDB
- Server synchronization for data analysis
- Advanced settings and diagnostics

---

## 📱 Beta Program Overview

### What is Beta Testing?

Beta testing allows you to:
- **Experience new features first** before public release
- **Contribute to app quality** by finding bugs and suggesting improvements
- **Directly communicate with developers** via feedback channels
- **Shape the product** with your insights and use cases

### What to Expect

- **Bugs and crashes** - Beta versions are unstable by nature
- **Frequent updates** - We'll push fixes and improvements rapidly
- **Active communication** - We'll need your feedback regularly
- **Time commitment** - Approximately 3-5 hours/week for active testing

---

## 🚀 How to Join

### iOS (TestFlight)

1. **Install TestFlight** from the App Store (if not already installed)
2. **Click the invitation link** sent via email or provided in-app
3. **Accept the invitation** in TestFlight
4. **Download KooDTX Beta** from TestFlight
5. **Start testing!**

**TestFlight Link:** `https://testflight.apple.com/join/YOUR_TESTFLIGHT_CODE`

### Android (Google Play Internal Testing)

1. **Join the testing program** via the invitation link
2. **Accept the invitation** on Google Play
3. **Download KooDTX** from the Play Store (beta version)
4. **Start testing!**

**Internal Testing Link:** `https://play.google.com/apps/internaltest/YOUR_TESTING_TRACK`

### Requirements

- **iOS:** iOS 13.4 or later
- **Android:** Android 8.0 (API 26) or later
- **Storage:** At least 500MB free space
- **Internet:** WiFi or mobile data for sync testing

---

## 👥 Tester Groups

### Internal Beta (Week 1) - 5-10 Testers

**Status:** 🔴 Currently Recruiting

**Focus:**
- Core functionality testing
- Critical bug identification
- Daily feedback loop
- Intensive testing scenarios

**Requirements:**
- Available for daily testing (30-60 min/day)
- Quick response to developer questions
- Technical background preferred
- Multiple device types preferred

### Open Beta (Week 2-4) - 50-100 Testers

**Status:** ⏳ Opening Soon

**Focus:**
- Real-world usage scenarios
- Diverse device/OS testing
- UI/UX feedback
- Feature requests

**Requirements:**
- Weekly testing sessions
- Bi-weekly feedback submissions
- At least one detailed bug report

### Power Users - Ongoing

**Status:** ⏳ Post-Launch

**Focus:**
- Advanced feature testing
- Performance benchmarking
- Edge case scenarios
- Long-term stability

---

## 📖 Testing Guidelines

### General Principles

1. **Test Realistically**
   - Use the app as you would in real scenarios
   - Don't just click randomly - follow actual use cases

2. **Document Everything**
   - Take screenshots of bugs
   - Note the exact steps to reproduce issues
   - Record device info and OS version

3. **Be Thorough**
   - Test all major features
   - Try edge cases (low battery, airplane mode, etc.)
   - Test both online and offline scenarios

4. **Communicate Clearly**
   - Provide detailed, actionable feedback
   - Use the provided templates for bug reports
   - Don't assume developers know the context

### Testing Frequency

- **Internal Beta:** Daily testing sessions (30-60 min)
- **Open Beta:** 3-4 sessions per week (15-30 min each)
- **Critical Issues:** Report immediately via Discord/Email

### What to Test

✅ **Must Test:**
- Recording with different sensor combinations
- Sync functionality (upload to server)
- Settings configuration
- Session management (view, delete, export)
- Battery consumption
- Background recording
- App stability (crash testing)

✅ **Should Test:**
- Different network conditions (WiFi, 4G, offline)
- Low storage scenarios
- Device rotation
- App backgrounding/foregrounding
- Multiple sessions in sequence

✅ **Nice to Test:**
- Accessibility features
- Dark mode
- Internationalization (if applicable)
- Advanced settings
- Diagnostics screen

---

## 🧪 Test Scenarios

### Scenario 1: Basic Recording

**Objective:** Test core recording functionality

**Steps:**
1. Launch the app
2. Navigate to Recording screen
3. Select sensors: Accelerometer, Gyroscope
4. Start recording for 2 minutes
5. Add event markers during recording (3-5 markers)
6. Stop recording
7. Verify session appears in Sessions screen

**Expected Result:**
- Recording starts without errors
- Sensor data is captured
- Event markers are saved
- Session is saved locally

**Report if:**
- Recording doesn't start
- App crashes during recording
- Data is missing or corrupted
- Session doesn't appear

---

### Scenario 2: Long Recording Session

**Objective:** Test app stability during extended use

**Steps:**
1. Start recording with all sensors enabled
2. Record for 30-60 minutes
3. Let the app run in background for 10 minutes
4. Return to foreground
5. Stop recording

**Expected Result:**
- App remains stable
- No excessive battery drain (monitor in diagnostics)
- All data is captured
- No memory leaks

**Report if:**
- App crashes
- Recording stops unexpectedly
- Battery drains faster than 5%/10min
- Data gaps during background period

---

### Scenario 3: Sync Testing

**Objective:** Test server synchronization

**Steps:**
1. Record 3 sessions (5 min each)
2. Go to Sync Status screen
3. Verify pending upload count
4. Trigger manual sync
5. Monitor sync progress
6. Verify all sessions uploaded

**Expected Result:**
- Sync starts successfully
- Progress is displayed accurately
- All sessions uploaded
- Upload statistics update correctly

**Report if:**
- Sync fails with error
- Progress bar freezes
- Some sessions don't upload
- Network errors not handled gracefully

---

### Scenario 4: Offline Mode

**Objective:** Test offline-first functionality

**Steps:**
1. Enable airplane mode
2. Record 2 sessions
3. Navigate through app features
4. Disable airplane mode
5. Trigger sync

**Expected Result:**
- App works fully offline
- Sessions saved locally
- Sync queue builds up
- Auto-sync triggers when online

**Report if:**
- App requires internet connection
- Features break without network
- Sync doesn't automatically trigger
- Data loss occurs

---

### Scenario 5: Settings & Configuration

**Objective:** Test all settings options

**Steps:**
1. Navigate to Settings screen
2. Change sensor sampling rates
3. Toggle sync settings
4. Change theme (light/dark)
5. Configure advanced settings (audio, retention, performance)
6. Export settings
7. Restart app
8. Verify settings persisted

**Expected Result:**
- All settings save correctly
- Settings persist after restart
- Export/Import works
- No crashes from configuration changes

---

### Scenario 6: Stress Testing

**Objective:** Test app limits and error handling

**Steps:**
1. Record 20+ sessions back-to-back
2. Fill device storage to 95%
3. Force-kill app during recording
4. Rapidly switch between screens
5. Toggle network on/off repeatedly during sync

**Expected Result:**
- App handles low storage gracefully
- Unsaved data is recovered (or user is warned)
- No data corruption
- Graceful error messages

**Report if:**
- App crashes without recovery
- Data is lost
- Error messages are unclear
- App becomes unresponsive

---

## 🐛 Reporting Issues

### Bug Report Template

Use this template when reporting bugs:

```
**Bug Title:** [Short, descriptive title]

**Severity:** [Critical / High / Medium / Low]
- Critical: App crash, data loss
- High: Feature broken, blocking issue
- Medium: UI bug, minor functionality issue
- Low: Cosmetic issue, suggestion

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Videos:**
[Attach if applicable]

**Device Info:**
- Device Model: [e.g., iPhone 14 Pro / Samsung Galaxy S23]
- OS Version: [e.g., iOS 17.1 / Android 14]
- App Version: [Check in Settings > About]
- Network: [WiFi / 4G / Offline]

**Additional Context:**
[Any other relevant information]
```

### Feature Request Template

```
**Feature Title:** [Short, descriptive title]

**Problem Statement:**
[What problem does this solve?]

**Proposed Solution:**
[How should it work?]

**Alternatives Considered:**
[Other approaches?]

**Priority:** [High / Medium / Low]

**Use Case:**
[When would you use this?]
```

### Severity Guidelines

- **Critical:** App crashes, data loss, security issues
- **High:** Core features broken, blocking workflows
- **Medium:** Features partially working, workarounds exist
- **Low:** Cosmetic issues, nice-to-have improvements

---

## 💬 Feedback Channels

### Primary Channels

1. **Google Forms - Bug Reports**
   - Link: `https://forms.gle/YOUR_BUG_REPORT_FORM`
   - Use for: Detailed bug reports
   - Response time: 24 hours (weekdays)

2. **Google Forms - General Feedback**
   - Link: `https://forms.gle/YOUR_FEEDBACK_FORM`
   - Use for: Feature requests, UX feedback
   - Response time: 48 hours

3. **Google Forms - Feature Requests**
   - Link: `https://forms.gle/YOUR_FEATURE_REQUEST_FORM`
   - Use for: New feature ideas
   - Response time: 1 week

### Secondary Channels

4. **Discord Community (Optional)**
   - Link: `https://discord.gg/YOUR_DISCORD_INVITE`
   - Use for: Quick questions, community discussions
   - Response time: Real-time (during business hours)

5. **Email**
   - Address: `beta@koodtx.com`
   - Use for: Urgent issues, private feedback
   - Response time: 24 hours (weekdays)

### Communication Guidelines

- **Be respectful** - Developers are working hard to improve the app
- **Be specific** - Vague feedback isn't actionable
- **Be patient** - Fixes take time to implement and test
- **Be proactive** - Don't wait for developers to ask - share insights!

---

## 📅 Timeline

### Phase 221: Beta Tester Recruitment (Current)

**Duration:** 3 hours
**Status:** 🔴 In Progress

**Tasks:**
- ✅ Compose tester groups
- ✅ Prepare invitation links
- ✅ Write testing guide (this document)
- ✅ Set up feedback channels

**Deliverable:** 5-10 internal beta testers recruited

---

### Phase 222: Feedback Collection System

**Duration:** 4 hours
**Status:** ⏳ Next

**Tasks:**
- Set up Google Forms for feedback
- Create bug report template
- Create feature request template
- Share contact information

**Deliverable:** Feedback system ready

---

### Phase 223: Internal Beta (Week 1)

**Duration:** 20 hours (1 week)
**Status:** ⏳ Upcoming

**Tasks:**
- 5-10 internal testers
- Intensive daily testing
- Daily feedback collection
- Emergency bug fixes
- Stability verification

**Deliverable:** Internal beta complete with 80%+ stability

---

### Phase 224-230: Open Beta & Iterations

**Duration:** 3-4 weeks
**Status:** ⏳ Future

**Tasks:**
- Open beta with 50-100 testers
- Multiple bug fix iterations
- Crash log analysis
- Performance improvements
- UX refinements
- Final validation

---

### Phase 231-240: Launch Preparation

**Duration:** 1-2 weeks
**Status:** ⏳ Future

**Tasks:**
- Play Store / App Store assets
- App descriptions
- Screenshots & videos
- Release notes
- Production deployment
- Monitoring setup

---

## 🎁 Rewards & Recognition

### For All Beta Testers

- ✅ **Name in app credits** (if you provide consent)
- ✅ **Beta tester badge** in app profile
- ✅ **Early access** to future features
- ✅ **Priority support** for 6 months

### For Active Testers (5+ bug reports or 10+ feedback items)

- ✅ **Premium features free for 1 year** (when available)
- ✅ **Exclusive beta tester Discord role**
- ✅ **Access to development roadmap**

### For Top 3 Contributors

- ✅ **All of the above**
- ✅ **Special recognition** in release announcement
- ✅ **Lifetime premium access** (when available)
- ✅ **Swag package** (if budget allows)

### How to Qualify

Contributions are measured by:
- Number of unique bugs found
- Quality of feedback (detailed, actionable)
- Feature suggestions implemented
- Community participation (helping other testers)
- Testing frequency and coverage

---

## ❓ FAQ

### Q: How much time do I need to commit?

**A:** Internal beta: 30-60 min/day. Open beta: 3-4 sessions/week (15-30 min each).

### Q: What if I find a critical bug?

**A:** Report immediately via email (beta@koodtx.com) or Discord with "URGENT" in the title.

### Q: Can I share beta builds with friends?

**A:** No. Beta builds are confidential. Invite your friends to join the beta program properly.

### Q: Will my data be safe?

**A:** Beta versions may have bugs that could cause data loss. We recommend not using critical data during beta testing.

### Q: What happens after beta ends?

**A:** You'll be upgraded to the production version automatically. Your beta tester status and rewards remain.

### Q: Can I opt out of beta?

**A:** Yes, you can leave anytime via TestFlight (iOS) or Play Store (Android). Your feedback so far is still valuable!

### Q: How do I update the beta app?

**A:** Updates are delivered via TestFlight (iOS) or Play Store (Android) automatically. You'll get notifications.

### Q: What if the app is in a foreign language?

**A:** Currently the app is in Korean (ko). English localization is planned. Please provide feedback on any confusing UI elements.

---

## 📞 Contact & Support

**Beta Program Manager:** KooDTX Team
**Email:** beta@koodtx.com
**Discord:** discord.gg/koodtx
**Response Time:** 24 hours (weekdays), 48 hours (weekends)

**Emergency Contact (Critical Bugs Only):**
Email with subject: `[URGENT] [Beta Bug] Your Issue`

---

## 🙏 Thank You!

Your participation in the KooDTX beta program is invaluable. Together, we're building a robust, reliable sensor data collection app that serves real-world needs.

We appreciate your time, patience, and detailed feedback. Let's make KooDTX great! 🚀

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-15
**Next Review:** After Phase 223 (Internal Beta Week 1)
