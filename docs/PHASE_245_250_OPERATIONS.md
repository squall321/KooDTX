# Phase 245-250: Operations System Setup

**Total Time:** 28 hours
**Priority:** Critical
**Start Time:** Immediately after store launch (Phase 240 complete)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Phase 245: Daily Monitoring Routine](#phase-245-daily-monitoring-routine)
3. [Phase 246: User Support System](#phase-246-user-support-system)
4. [Phase 247: Hotfix Process](#phase-247-hotfix-process)
5. [Phase 248: User Analytics Setup](#phase-248-user-analytics-setup)
6. [Phase 249: Feedback Loop](#phase-249-feedback-loop)
7. [Phase 250: Continuous Improvement Plan](#phase-250-continuous-improvement-plan)
8. [Complete Workflow](#complete-workflow)

---

## Overview

### 🎯 Objectives

Establish robust operations infrastructure for stable app management after production launch:
- Daily monitoring and alert systems
- User support and FAQ system
- Rapid hotfix deployment process
- Analytics and user behavior tracking
- Feedback collection and prioritization
- Regular update cadence

### 📊 Phases Summary

| Phase | Name | Time | Priority | Deliverables |
|-------|------|------|----------|--------------|
| 245 | Daily Monitoring | 4h | P0-Critical | Monitoring dashboards, checklists |
| 246 | User Support | 5h | P1-High | FAQ, support templates |
| 247 | Hotfix Process | 4h | P0-Critical | Emergency deployment workflow |
| 248 | Analytics Setup | 5h | P2-Medium | Event tracking, dashboards |
| 249 | Feedback Loop | 4h | P1-High | Survey system, roadmap |
| 250 | Improvement Plan | 6h | P2-Medium | Release calendar, changelog |

### 🎨 Principles

1. **Proactive over reactive** - Catch issues before users report them
2. **Fast response** - Critical bugs fixed within 2 hours
3. **Data-driven** - Make decisions based on metrics
4. **User-centric** - Prioritize user feedback and requests
5. **Transparent** - Share roadmap and progress openly

---

## Phase 245: Daily Monitoring Routine

**Time:** 4 hours
**Priority:** P0 - Critical

### Objectives

Establish daily monitoring routine to ensure app stability and quick issue detection.

### Part 1: Sentry Error Monitoring

#### 1.1 Sentry Dashboard Setup

**Configure Sentry Projects:**

1. **Create Project** (if not already)
   - Platform: React Native
   - Name: KooDTX-Production
   - Alert routing: Your email

2. **Set Up Alerts**

Navigate to **Settings > Alerts** and create:

**Alert 1: Critical Errors**
```yaml
Name: Critical Crash Alert
Condition: Error count > 5 in 1 hour
Actions:
  - Send email to: dev@koodtx.com
  - Slack notification (optional)
Priority: Critical
```

**Alert 2: New Error Types**
```yaml
Name: New Error Detection
Condition: New issue appears
Actions:
  - Send email notification
  - Create GitHub issue (optional)
Priority: High
```

**Alert 3: Error Spike**
```yaml
Name: Error Rate Spike
Condition: Error rate increases by 50% compared to previous hour
Actions:
  - Send immediate email
  - SMS notification (optional)
Priority: High
```

#### 1.2 Daily Sentry Checklist

**Morning Check (9:00 AM):**

```markdown
[ ] Login to Sentry Dashboard
[ ] Check "Issues" tab for new errors (past 24h)
[ ] Review error frequency graph
[ ] Check crash-free rate: Should be > 99%
[ ] Identify top 3 errors by volume
[ ] Review error stack traces
[ ] Check affected users count
[ ] Tag issues by severity (Critical/High/Medium/Low)
```

**Afternoon Check (5:00 PM):**

```markdown
[ ] Review new issues since morning
[ ] Check if any alerts triggered
[ ] Verify fixes from morning deployed
[ ] Review error trends (increasing/decreasing)
[ ] Update issue status (investigating/resolved/ignored)
```

#### 1.3 Error Severity Classification

| Severity | Criteria | Response Time | Example |
|----------|----------|---------------|---------|
| **Critical** | App crash on launch, data loss | 2 hours | Startup crash, database corruption |
| **High** | Core feature broken, frequent crash | 24 hours | Recording fails, sync broken |
| **Medium** | Minor feature broken, rare crash | 3 days | Export fails occasionally |
| **Low** | UI glitch, non-blocking issue | 1 week | Button alignment off |

### Part 2: Play Console Monitoring

#### 2.1 Daily Review Checks

**Morning Routine (9:30 AM):**

1. **Navigate to Play Console Dashboard**
   - https://play.google.com/console

2. **Check Key Metrics:**
```markdown
Statistics (past 24h):
[ ] New installs: _____ (compare to yesterday)
[ ] Uninstalls: _____ (should be < 5% of installs)
[ ] Active users: _____ (should grow daily)
[ ] Crashes: _____ (should be < 0.5%)
[ ] ANRs: _____ (should be < 0.1%)
```

3. **Review Ratings & Reviews:**
```markdown
[ ] New ratings count: _____
[ ] Average rating: _____ (target: > 4.0)
[ ] New reviews: _____
[ ] 1-2 star reviews: _____ (respond within 24h)
[ ] 3 star reviews: _____ (respond within 48h)
[ ] 4-5 star reviews: _____ (thank users)
```

**Evening Routine (5:30 PM):**

1. **Respond to Reviews:**
   - Reply to ALL 1-2 star reviews
   - Reply to select 3-5 star reviews
   - Use templates (see Phase 246)

2. **Check Crash Reports:**
   - Play Console > Vitals > Crashes & ANRs
   - Review crash stack traces
   - Cross-reference with Sentry

#### 2.2 Review Response Templates

**For Positive Reviews (4-5 stars):**
```
Thank you for your positive review! We're glad you're finding KooDTX useful for your sensor data collection needs. If you have any suggestions or feature requests, please reach out to support@koodtx.com. Happy collecting! 📊
```

**For Neutral Reviews (3 stars):**
```
Thank you for your feedback! We'd love to hear how we can improve your experience. Please contact us at support@koodtx.com with specific suggestions or issues you're facing. We're committed to making KooDTX better! 🚀
```

**For Negative Reviews (1-2 stars) - Bug Report:**
```
We're sorry to hear you're experiencing issues. We take bug reports very seriously. Please contact us at support@koodtx.com with details about the problem, including your device model and Android version. We'll work to fix this as soon as possible. Thank you for helping us improve!
```

**For Negative Reviews - Feature Request:**
```
Thank you for your feedback! We appreciate feature suggestions. Please share more details at support@koodtx.com or on our GitHub issues page. We're constantly improving KooDTX based on user feedback. 💡
```

### Part 3: Server Monitoring

#### 3.1 Server Metrics Dashboard

**If using cloud server (AWS/GCP/Azure):**

**Key Metrics to Monitor:**

```markdown
CPU Usage:
[ ] Current: _____%
[ ] Alert threshold: > 80% for 10+ minutes
[ ] Action: Scale up or optimize

Memory Usage:
[ ] Current: _____%
[ ] Alert threshold: > 85%
[ ] Action: Investigate memory leaks, restart services

Disk Usage:
[ ] Current: _____%
[ ] Alert threshold: > 90%
[ ] Action: Clean old logs, expand storage

API Response Time:
[ ] Average: _____ ms (target: < 500ms)
[ ] P95: _____ ms (target: < 2000ms)
[ ] Alert threshold: > 2 seconds average

Database Performance:
[ ] Query time (avg): _____ ms
[ ] Active connections: _____
[ ] Slow queries: _____ (investigate if > 0)

Network:
[ ] Inbound traffic: _____ GB
[ ] Outbound traffic: _____ GB
[ ] Bandwidth usage: _____%
```

#### 3.2 Log Analysis

**Daily Log Review:**

```bash
# SSH into server
ssh user@your-server.com

# Check error logs (past 24h)
tail -n 1000 /var/log/koodtx/error.log | grep -i "error\|exception\|fatal"

# Check API request logs
tail -n 100 /var/log/koodtx/api.log

# Check authentication failures
grep "auth failed" /var/log/koodtx/api.log | wc -l

# Check sync operations
grep "sync" /var/log/koodtx/api.log | tail -n 50
```

**Log Pattern Analysis:**

Look for:
- Repeated errors (same error multiple times)
- Time-based patterns (errors at specific hours)
- User-based patterns (errors from specific users)
- Device-based patterns (errors on specific devices/OS)

### Part 4: Response Process

#### 4.1 Issue Triage

**When Error Detected:**

```
Step 1: Assess Severity (5 min)
- How many users affected?
- Is core functionality broken?
- Is data at risk?
- Severity: Critical/High/Medium/Low

Step 2: Reproduce (10-30 min)
- Can you reproduce locally?
- What are the exact steps?
- Which devices/OS versions affected?

Step 3: Document (5 min)
- Create GitHub issue
- Link to Sentry issue
- Add reproduction steps
- Add severity label

Step 4: Assign Response Time
- Critical: Start fix immediately (target: 2h)
- High: Start within 4h (target: 24h fix)
- Medium: Schedule for next sprint
- Low: Add to backlog
```

#### 4.2 Response Time SLA

| Severity | Detection → Acknowledgment | Fix Target | Deployment |
|----------|----------------------------|------------|------------|
| Critical | 30 minutes | 2 hours | Immediate hotfix |
| High | 2 hours | 24 hours | Next day patch |
| Medium | 4 hours | 1 week | Next weekly update |
| Low | 24 hours | 1 month | Monthly update |

### Part 5: Weekly Summary Report

#### 5.1 Friday End-of-Week Report

**Create Report Template:**

```markdown
# KooDTX Weekly Monitoring Report
**Week of:** [Start Date] - [End Date]

## 📊 Key Metrics

### User Growth
- Total installs: _____ (+_____ from last week)
- Active users (DAU): _____
- Active users (MAU): _____
- Uninstall rate: _____% (target: < 5%)

### App Quality
- Crash-free rate: _____% (target: > 99%)
- ANR rate: _____% (target: < 0.1%)
- Average rating: _____ stars (target: > 4.0)
- New reviews: _____ (positive: ___, neutral: ___, negative: ___)

### Errors & Issues
- Total errors logged: _____
- New error types: _____
- Critical issues: _____ (resolved: ___)
- High priority issues: _____ (resolved: ___)

## 🔥 Top Issues This Week

1. [Issue name] - [Status] - Affected users: ___
2. [Issue name] - [Status] - Affected users: ___
3. [Issue name] - [Status] - Affected users: ___

## ✅ Resolved This Week

- [Issue 1] - Fixed in v0.1.1
- [Issue 2] - Server-side fix deployed
- [Issue 3] - Resolved via support

## 📋 Action Items for Next Week

- [ ] Deploy hotfix for [issue]
- [ ] Investigate [performance issue]
- [ ] Respond to [feature request]

## 💬 User Feedback Highlights

**Positive:**
- "Users love [feature]"
- "Great [aspect]"

**Negative:**
- "Need [feature]"
- "Problem with [functionality]"

## 🎯 Goals for Next Week

- Maintain 99%+ crash-free rate
- Respond to all 1-2 star reviews
- Fix top 3 reported bugs
```

### Deliverables

Create the following files:

#### File 1: `docs/DAILY_MONITORING_CHECKLIST.md`

```markdown
# Daily Monitoring Checklist

## Morning Routine (9:00-10:00 AM)

### Sentry (15 min)
- [ ] Check new errors (past 24h)
- [ ] Review crash-free rate
- [ ] Identify top 3 errors
- [ ] Tag by severity

### Play Console (20 min)
- [ ] Check install/uninstall metrics
- [ ] Review crash & ANR rates
- [ ] Read new reviews
- [ ] Note 1-2 star reviews for response

### Server (10 min)
- [ ] Check CPU/memory usage
- [ ] Review API response times
- [ ] Check disk usage
- [ ] Scan error logs

### Summary (5 min)
- [ ] Any critical issues? → Start hotfix process
- [ ] Update team on status

## Afternoon Routine (5:00-6:00 PM)

### Review Responses (20 min)
- [ ] Respond to negative reviews
- [ ] Reply to support emails
- [ ] Update GitHub issues

### Metrics Check (10 min)
- [ ] Compare to morning numbers
- [ ] Check for anomalies
- [ ] Review Sentry alerts

### Planning (10 min)
- [ ] Prioritize tomorrow's tasks
- [ ] Update sprint board
- [ ] Document any blockers

## Weekly (Friday 4:00 PM)

- [ ] Generate weekly report
- [ ] Share with team
- [ ] Plan next week's priorities
```

#### File 2: `docs/MONITORING_DASHBOARD_SETUP.md`

```markdown
# Monitoring Dashboard Setup Guide

## Sentry Configuration

### 1. Create Alerts

Navigate to Sentry > Settings > Alerts

**Critical Crash Alert:**
- Condition: Error count > 5 in 1 hour
- Action: Email to dev@koodtx.com
- Priority: Critical

**New Error Alert:**
- Condition: New issue appears
- Action: Email notification
- Priority: High

**Error Spike Alert:**
- Condition: 50% increase vs previous hour
- Action: Immediate email
- Priority: High

### 2. Configure Issues

**Grouping:**
- Group by: Stack trace similarity
- Merge threshold: High

**Workflow:**
- Auto-assign: Based on file path
- SLA: 2h for critical, 24h for high

### 3. Dashboard Widgets

Add to dashboard:
- Error frequency (24h)
- Crash-free rate (7d)
- Top errors by volume
- Errors by platform/OS

## Google Play Console

### Metrics to Track Daily

**Dashboard > Statistics:**
- Installs (current vs previous day)
- Active devices
- Uninstalls

**Vitals:**
- Crashes (target: < 0.5%)
- ANRs (target: < 0.1%)
- Slow rendering frames

**Reviews:**
- Average rating
- Rating distribution
- Recent reviews (all)

### Set Up Email Alerts

**Play Console > Settings > Email preferences:**
- [x] New reviews
- [x] Rating changes
- [x] Crash rate increases
- [x] ANR rate increases

## Server Monitoring

### CloudWatch/Stackdriver Setup

**Alarms:**

1. High CPU Usage
   - Threshold: > 80% for 10 minutes
   - Action: Email + SNS

2. High Memory Usage
   - Threshold: > 85%
   - Action: Email

3. Low Disk Space
   - Threshold: > 90% used
   - Action: Email + page on-call

4. API Latency
   - Threshold: P95 > 2000ms
   - Action: Email

**Dashboard:**
- CPU/Memory/Disk graphs (24h)
- API request rate
- Error rate
- Database connections

## Links Quick Access

```
Sentry: https://sentry.io/organizations/koodtx/issues/
Play Console: https://play.google.com/console/
AWS CloudWatch: [your dashboard]
GitHub Issues: https://github.com/squall321/KooDTX/issues
```
```

### Completion Checklist

- [ ] Sentry alerts configured (3 alerts minimum)
- [ ] Play Console email notifications enabled
- [ ] Server monitoring dashboard created
- [ ] Daily checklist document created
- [ ] Dashboard setup guide written
- [ ] 1 week of daily monitoring completed
- [ ] First weekly report generated

**Time Estimate:** 4 hours

---

## Phase 246: User Support System

**Time:** 5 hours
**Priority:** P1 - High

### Objectives

Establish professional user support system with FAQ, email templates, and troubleshooting guides.

### Part 1: Support Email Setup

#### 1.1 Email Configuration

**Option 1: Google Workspace (Recommended)**

```
1. Create email: support@koodtx.com
2. Set up auto-reply for off-hours
3. Create labels:
   - Bug Report
   - Feature Request
   - General Question
   - Account Issue
   - Urgent
4. Set up filters to auto-label
```

**Option 2: Gmail (Free Alternative)**

```
1. Create: koodtx.support@gmail.com
2. Enable "Send mail as" support@koodtx.com (if domain available)
3. Set up labels and filters
4. Configure vacation responder for off-hours
```

#### 1.2 Auto-Reply Message

**Business Hours Auto-Reply:**

```
Thank you for contacting KooDTX Support!

We've received your message and will respond within 24-48 hours during business hours (Mon-Fri, 9 AM - 6 PM KST).

For urgent issues, please include:
- Your device model and Android version
- Steps to reproduce the problem
- Screenshots if applicable

In the meantime, check our FAQ: [FAQ URL]

Best regards,
KooDTX Support Team
```

**After-Hours Auto-Reply:**

```
Thank you for contacting KooDTX Support!

Our support hours are Monday-Friday, 9 AM - 6 PM KST. We'll respond to your message on the next business day.

For common issues, please visit our FAQ: [FAQ URL]

For urgent bugs, please create an issue on GitHub: https://github.com/squall321/KooDTX/issues

Thank you for your patience!

KooDTX Support Team
```

### Part 2: FAQ Creation

#### 2.1 FAQ Structure

Create `docs/FAQ.md`:

```markdown
# KooDTX Frequently Asked Questions

Last Updated: 2025-11-15

## Table of Contents

1. [Getting Started](#getting-started)
2. [Recording & Sensors](#recording--sensors)
3. [Data Management](#data-management)
4. [Cloud Sync](#cloud-sync)
5. [Export & Sharing](#export--sharing)
6. [Troubleshooting](#troubleshooting)
7. [Account & Privacy](#account--privacy)
8. [Technical Questions](#technical-questions)

---

## Getting Started

### Q: What is KooDTX?

**A:** KooDTX is a professional sensor data collection tool for Android. It allows you to record data from multiple sensors (accelerometer, gyroscope, magnetometer, GPS, audio) simultaneously and export it for analysis.

### Q: Is KooDTX free?

**A:** Yes, KooDTX is currently completely free with no ads or in-app purchases.

### Q: What Android version do I need?

**A:** KooDTX requires Android 10.0 (API 29) or higher.

### Q: How do I start recording?

**A:**
1. Open KooDTX
2. Tap the "+" button to create a new session
3. Select the sensors you want to record
4. Configure sampling rate (optional)
5. Tap "Start Recording"
6. Recording starts immediately

---

## Recording & Sensors

### Q: Which sensors are supported?

**A:** KooDTX supports:
- Accelerometer (3-axis motion)
- Gyroscope (3-axis rotation)
- Magnetometer (magnetic field)
- GPS (location, speed, altitude)
- Audio (microphone)
- Barometer (air pressure, if available)
- Light sensor (ambient light, if available)

### Q: Why can't I record certain sensors?

**A:** Not all devices have all sensors. Check your device specifications. Some sensors may be disabled if permissions are not granted.

### Q: What sampling rate should I use?

**A:**
- **High precision research:** 100 Hz or 200 Hz
- **General data collection:** 50 Hz
- **Battery saving:** 10 Hz or 20 Hz

Higher rates = more data points but higher battery usage.

### Q: Can I record multiple sensors at the same time?

**A:** Yes! KooDTX is designed for multi-sensor recording. You can select as many sensors as you need for each session.

### Q: How long can I record?

**A:** Recording length is limited only by:
- Available storage space
- Battery life
- Your patience 😊

We've tested recordings up to 2 hours without issues.

### Q: Why does my recording stop unexpectedly?

**A:** Common causes:
- Low battery (< 10%)
- Low storage space
- App force-closed by system
- Phone call or alarm

**Solution:** Ensure sufficient battery and storage before long recordings.

---

## Data Management

### Q: Where is my data stored?

**A:** All sensor data is stored locally on your device in a SQLite database using WatermelonDB. Data stays on your device until you delete it or enable cloud sync.

### Q: How much storage does data use?

**A:** Approximate storage per hour:
- Accelerometer (100 Hz): ~15 MB
- Gyroscope (100 Hz): ~15 MB
- GPS (1 Hz): ~2 MB
- Audio (44.1 kHz): ~300 MB (compressed)

Exact size varies based on sampling rate and sensors used.

### Q: Can I delete individual sessions?

**A:** Yes. Long-press on any session in the list and select "Delete". Or open session details and tap the delete icon.

### Q: Is my data backed up automatically?

**A:** No automatic backup. Data is stored locally only. Enable cloud sync to backup data to our servers (optional).

### Q: What happens if I uninstall the app?

**A:** All local data will be deleted. Export your important data before uninstalling, or enable cloud sync.

---

## Cloud Sync

### Q: Do I need an account?

**A:** No account required for local use. Cloud sync (optional) may require account creation in future updates.

### Q: How does cloud sync work?

**A:** When enabled, KooDTX uploads your session data to secure cloud storage. Data is encrypted during transmission (HTTPS).

### Q: Can I choose which sessions to sync?

**A:** Yes. You can enable/disable sync per session, or use selective sync in settings.

### Q: Does sync work on cellular data?

**A:** By default, sync only works on Wi-Fi to save mobile data. You can enable cellular sync in Settings > Sync > "Allow cellular sync".

### Q: Why is my sync failing?

**A:** Common causes:
- No internet connection
- Wi-Fi-only mode enabled (check settings)
- Server maintenance
- Large file size (audio files take longer)

**Solution:**
1. Check internet connection
2. Try again on Wi-Fi
3. Check app status page (if we have one)

---

## Export & Sharing

### Q: What export formats are supported?

**A:** KooDTX supports:
- **CSV** (Comma-Separated Values) - Excel compatible
- **JSON** (JavaScript Object Notation) - Programming friendly

### Q: How do I export my data?

**A:**
1. Open session details
2. Tap "Export" button
3. Choose format (CSV or JSON)
4. Select destination (Files app, Google Drive, email, etc.)

### Q: Can I import exported data back into the app?

**A:** Not in current version. Export is one-way. This feature is planned for future updates.

### Q: What does the CSV format look like?

**A:** CSV example:
```csv
timestamp,sensor,x,y,z
1699564800000,accelerometer,0.123,-0.456,9.812
1699564800010,accelerometer,0.145,-0.432,9.805
```

Each row is one data point with timestamp and sensor values.

### Q: What does the JSON format look like?

**A:** JSON example:
```json
{
  "session": {
    "id": "uuid-here",
    "name": "My Session",
    "startTime": 1699564800000,
    "duration": 60000
  },
  "data": [
    {"timestamp": 1699564800000, "sensor": "accelerometer", "x": 0.123, "y": -0.456, "z": 9.812}
  ]
}
```

---

## Troubleshooting

### Q: App crashes on startup

**A:** Try these steps:
1. Force stop the app (Settings > Apps > KooDTX > Force Stop)
2. Clear app cache (Settings > Apps > KooDTX > Storage > Clear Cache)
3. Restart your device
4. If still crashing, uninstall and reinstall
5. Contact support@koodtx.com if problem persists

### Q: GPS not working

**A:**
1. Check location permission granted (Settings > Apps > KooDTX > Permissions)
2. Enable location services (Settings > Location > On)
3. Go outdoors or near windows (GPS needs sky visibility)
4. Wait 1-2 minutes for GPS lock

### Q: No audio recording

**A:**
1. Check microphone permission granted
2. Check if another app is using microphone
3. Test microphone in another app (Voice Recorder)
4. Restart device

### Q: Export fails

**A:**
1. Check available storage space
2. Try exporting to different location
3. Try smaller data set
4. Restart app and try again

### Q: App drains battery quickly

**A:** Battery usage depends on:
- Number of sensors recording
- Sampling rate (higher = more battery)
- GPS usage (GPS is battery-intensive)
- Screen on time

**Tips to reduce battery:**
- Lower sampling rate (50 Hz instead of 200 Hz)
- Record only needed sensors
- Turn off screen during recording
- Disable GPS if not needed

### Q: Sensors show incorrect values

**A:**
1. Calibrate sensors (Settings > Motion > Calibrate)
2. Check if sensor is supported (not all devices have all sensors)
3. Try restarting device
4. Some sensors need device movement to initialize

---

## Account & Privacy

### Q: What data does KooDTX collect?

**A:** See our full Privacy Policy at [URL]

Summary:
- **Sensor data:** Only what you explicitly record
- **Device info:** Model, OS version (for crash reports)
- **Usage data:** Features used, session duration (anonymous)
- **Location:** Only if you use GPS sensor

We DO NOT:
- Sell your data
- Track you across other apps
- Access your personal files
- Collect data without permission

### Q: Can I delete my data?

**A:** Yes. You can delete:
- Individual sessions (long-press and delete)
- All local data (Settings > Data > Clear All Data)
- Cloud data (Settings > Sync > Delete Cloud Data)

### Q: Is my data encrypted?

**A:**
- Local data: Stored in device-protected storage
- During sync: Encrypted in transit (HTTPS)
- On servers: Encrypted at rest

### Q: Can I use KooDTX offline?

**A:** Yes! KooDTX is designed to work completely offline. All core features (recording, exporting, viewing) work without internet.

---

## Technical Questions

### Q: What is the maximum sampling rate?

**A:** Depends on device hardware:
- Typical range: 1 Hz to 200 Hz
- Some devices support up to 500 Hz
- Check device specifications

### Q: What is the data precision?

**A:**
- Accelerometer: ±0.001 m/s²
- Gyroscope: ±0.001 rad/s
- Magnetometer: ±0.01 μT
- GPS: Device-dependent (typically ±5m)

### Q: Can I use KooDTX for research/commercial projects?

**A:** Yes! KooDTX is free for:
- Academic research
- Personal projects
- Commercial applications
- Educational purposes

We appreciate attribution but it's not required.

### Q: Is KooDTX open source?

**A:** Check our GitHub repository: https://github.com/squall321/KooDTX
(Update this if you decide to open-source)

### Q: What tech stack is KooDTX built with?

**A:**
- React Native 0.73
- TypeScript
- WatermelonDB (local database)
- Sentry (crash reporting)
- Material Design 3

---

## Still Have Questions?

**Email:** support@koodtx.com
**Response Time:** 24-48 hours (business days)

**GitHub Issues:** https://github.com/squall321/KooDTX/issues
**Privacy Policy:** [URL]
**Terms of Service:** [URL]

---

Last updated: 2025-11-15
```

### Part 3: Support Email Templates

Create `docs/SUPPORT_EMAIL_TEMPLATES.md`:

```markdown
# Support Email Response Templates

## Template 1: Bug Report Acknowledgment

**Subject:** Re: [User's subject] - Bug Report Received

**Body:**
```
Hi [Name],

Thank you for reporting this issue! We take bug reports seriously and appreciate you helping us improve KooDTX.

I've created a ticket for your report: [#123]

To help us investigate, could you please provide:
- Device model: (e.g., Samsung Galaxy S23)
- Android version: (e.g., Android 13)
- KooDTX version: (Settings > About > Version)
- Steps to reproduce the issue
- Screenshots if possible

We'll investigate and keep you updated on progress. Typical resolution time for bugs is 1-7 days depending on severity.

Best regards,
[Your Name]
KooDTX Support
support@koodtx.com
```

## Template 2: Feature Request

**Subject:** Re: [User's subject] - Feature Request Received

**Body:**
```
Hi [Name],

Thank you for the feature suggestion! We love hearing ideas from our users.

I've added your request to our feature roadmap: [Link or #]

Your suggestion: "[Summary of request]"

We evaluate feature requests based on:
- User demand (upvotes)
- Technical feasibility
- Alignment with product vision

You can track progress and upvote on our public roadmap: [URL]

We typically review and prioritize requests monthly. High-demand features are added to our quarterly planning.

Is there anything else you'd like to add to this request?

Best regards,
[Your Name]
KooDTX Support
```

## Template 3: General Question

**Subject:** Re: [User's subject] - Answer to Your Question

**Body:**
```
Hi [Name],

Thanks for reaching out!

[Answer to their specific question]

Here are some helpful resources:
- FAQ: [URL]
- User Guide: [URL]
- Video Tutorial: [URL] (if available)

Does this answer your question? Feel free to reply if you need more help!

Best regards,
[Your Name]
KooDTX Support
```

## Template 4: Cannot Reproduce Issue

**Subject:** Re: [User's subject] - Need More Information

**Body:**
```
Hi [Name],

Thank you for your report. I've tried to reproduce the issue you described, but haven't been able to replicate it yet.

To help me investigate further, could you provide:

1. Exact steps to reproduce:
   - Step 1: ...
   - Step 2: ...
   - Expected result: ...
   - Actual result: ...

2. Device information:
   - Model:
   - Android version:
   - KooDTX version:

3. Additional details:
   - Does this happen every time or intermittently?
   - Did this start after a recent app update?
   - Any error messages shown?

4. Screenshots/screen recording if possible

This information will help us fix the issue quickly.

Thank you for your patience!

Best regards,
[Your Name]
KooDTX Support
```

## Template 5: Issue Resolved

**Subject:** Re: [User's subject] - Issue Resolved in v[X.X.X]

**Body:**
```
Hi [Name],

Good news! The issue you reported has been fixed and will be included in our next update (v[X.X.X]).

Issue: [Brief description]
Fix: [What was done]
Release: Expected [date]

You'll receive the update automatically through the Google Play Store. You can also check for updates manually in Play Store > KooDTX > Update.

After updating, please let us know if the issue is fully resolved.

Thank you for reporting this and helping us improve KooDTX!

Best regards,
[Your Name]
KooDTX Support
```

## Template 6: Workaround Available

**Subject:** Re: [User's subject] - Temporary Workaround

**Body:**
```
Hi [Name],

Thank you for your report. While we work on a permanent fix, here's a workaround you can use:

**Workaround:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

This should resolve the immediate issue. We're working on a proper fix for the next update.

Fix status: [In Progress / Planned for v[X.X.X]]

Let me know if the workaround helps!

Best regards,
[Your Name]
KooDTX Support
```

## Template 7: User Error / Misunderstanding

**Subject:** Re: [User's subject] - How to [Task]

**Body:**
```
Hi [Name],

Thanks for reaching out! This is actually expected behavior, and here's why:

[Explanation of how feature works]

To achieve what you're trying to do:
1. [Correct steps]
2. [...]

We realize this might not be intuitive. We're considering UI improvements to make this clearer in future updates.

Does this help? Let me know if you have any other questions!

Best regards,
[Your Name]
KooDTX Support
```

## Template 8: Data Privacy Question

**Subject:** Re: [User's subject] - Privacy & Data Security

**Body:**
```
Hi [Name],

Great question! Data privacy is very important to us.

[Specific answer to their privacy question]

Our privacy practices:
- All data stored locally on your device by default
- Cloud sync is optional and requires explicit permission
- Data encrypted during transmission (HTTPS)
- We never sell or share your data with third parties
- You can delete all your data anytime

Full Privacy Policy: [URL]

If you have specific privacy concerns, I'm happy to discuss further.

Best regards,
[Your Name]
KooDTX Support
```

## Template 9: Account Deletion Request

**Subject:** Re: Account Deletion Request - Confirmation Needed

**Body:**
```
Hi [Name],

I've received your account deletion request. Before proceeding, please note:

**What will be deleted:**
- All cloud-synced data
- Account information
- Settings and preferences

**What will NOT be deleted:**
- Local data on your device (unless you uninstall app)
- Play Store purchase history
- App reviews

**To confirm deletion, please reply with:**
"I confirm I want to delete my KooDTX account and all associated data."

Alternatively, if you're having issues with the app, I'm here to help. Many users delete accounts due to solvable problems.

Let me know how you'd like to proceed.

Best regards,
[Your Name]
KooDTX Support
```

## Template 10: Export Help

**Subject:** Re: [User's subject] - How to Export Data

**Body:**
```
Hi [Name],

Here's how to export your sensor data from KooDTX:

**Steps:**
1. Open KooDTX app
2. Tap on the session you want to export
3. Tap the "Export" button (share icon)
4. Choose format:
   - CSV: For Excel, Google Sheets
   - JSON: For programming/analysis
5. Select destination:
   - Save to Files
   - Share via email
   - Upload to Google Drive
   - etc.

**CSV Format:**
- Each row is one data point
- Columns: timestamp, sensor, x, y, z
- Can be opened in Excel/Sheets

**JSON Format:**
- Structured data format
- Better for programming
- Includes session metadata

**Troubleshooting:**
- If export fails, try exporting to device storage first
- Large files (>100MB) may take time
- Audio files are exported separately

Attached: Screenshot guide (optional)

Let me know if you need help!

Best regards,
[Your Name]
KooDTX Support
```

---

## Usage Guidelines

1. **Personalize:** Always use user's name if provided
2. **Be professional yet friendly:** Approachable but not too casual
3. **Be concise:** Get to the point quickly
4. **Provide value:** Include links, screenshots, or additional resources
5. **Follow up:** Ask if issue is resolved
6. **Track:** Use ticket numbers or labels to track conversations

## Response Time SLA

- Critical bugs: 2-4 hours
- General support: 24-48 hours (business days)
- Feature requests: 48 hours (acknowledge receipt)
- Weekends: Best effort, auto-reply set

---

Last updated: 2025-11-15
```

### Part 4: Troubleshooting Guide

Create comprehensive troubleshooting document: `docs/TROUBLESHOOTING_GUIDE.md`

(Covered in FAQ above, can be expanded if needed)

### Completion Checklist

- [ ] Support email configured (support@koodtx.com)
- [ ] Auto-reply messages set up
- [ ] FAQ document created (20+ Q&A pairs)
- [ ] Email templates created (10+ templates)
- [ ] Troubleshooting guide written
- [ ] Support email tested (send test email)
- [ ] 1 week of support emails handled using templates

**Time Estimate:** 5 hours

---

## Phase 247: Hotfix Process

**Time:** 4 hours
**Priority:** P0 - Critical

### Objectives

Establish rapid emergency bug fix and deployment process for critical issues.

### Part 1: Hotfix Workflow

#### 1.1 Issue Severity Assessment

**When Critical Bug Detected:**

```markdown
Step 1: Validate Severity (5 minutes)

Questions to ask:
- [ ] Does it crash the app for all/most users?
- [ ] Does it cause data loss?
- [ ] Is core functionality completely broken?
- [ ] How many users are affected? (check Sentry)
- [ ] Is there a workaround?

Classification:
- CRITICAL: Yes to any of first 3 questions OR >50% users affected
- HIGH: Core feature broken, <50% users affected, workaround exists
- MEDIUM: Minor feature broken, few users affected
- LOW: UI glitch, no functional impact

If CRITICAL → Proceed with hotfix immediately
If HIGH → Schedule for next day patch
If MEDIUM/LOW → Add to next regular update
```

#### 1.2 Hotfix Process Steps

**Standard Hotfix Timeline: 2-4 hours**

```
Hour 0:00 - Issue Reported
├─ 0:00-0:15: Severity assessment
├─ 0:15-0:30: Reproduce issue
├─ 0:30-1:30: Develop fix
├─ 1:30-2:00: Test fix
├─ 2:00-2:30: Build & sign AAB
├─ 2:30-2:45: Submit to Play Console
├─ 2:45-3:00: Monitor submission
└─ 3:00+: Google review (1-24h, request expedited)
```

**Detailed Steps:**

**Step 1: Create Hotfix Branch (5 min)**

```bash
# Pull latest production code
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/v0.1.1-crash-on-export

# Branch naming: hotfix/v[VERSION]-[brief-description]
```

**Step 2: Reproduce & Fix (60-90 min)**

```bash
# Reproduce the issue
1. Follow exact steps from bug report
2. Confirm crash/error
3. Check Sentry for stack trace
4. Identify root cause

# Develop fix
1. Make minimal changes (hotfix, not refactor!)
2. Focus only on the critical issue
3. Avoid scope creep
4. Add defensive checks if applicable

# Example fix for export crash:
# If error is null pointer when exporting:
if (!session || !session.data) {
  logger.error('Export failed: Invalid session data');
  showToast('Cannot export: Session data missing');
  return;
}

// Add try-catch for safety
try {
  await exportSession(session);
} catch (error) {
  logger.error('Export error:', error);
  showToast('Export failed. Please try again.');
  Sentry.captureException(error);
}
```

**Step 3: Test Fix (30 min)**

```bash
# Test on device
1. Install development build
2. Reproduce original issue
3. Verify fix works
4. Test related functionality
5. Check for regressions

# Quick regression tests:
- [ ] App launches successfully
- [ ] Create new session
- [ ] Record data
- [ ] Stop recording
- [ ] Export session (if export was the bug)
- [ ] Sync (if sync works)
- [ ] Delete session

# Test on multiple devices if possible:
- [ ] Pixel (stock Android)
- [ ] Samsung (OneUI)
- [ ] Different Android versions (10, 11, 12, 13, 14)
```

**Step 4: Commit & Tag (5 min)**

```bash
# Commit fix
git add .
git commit -m "hotfix: Fix export crash when session data is null

- Add null check before export
- Add try-catch for safety
- Show user-friendly error message
- Log error to Sentry for monitoring

Fixes #123
Affects: v0.1.0
Severity: Critical
Users affected: ~200 (15% of active users)"

# Merge to main
git checkout main
git merge hotfix/v0.1.1-crash-on-export

# Tag version
git tag v0.1.1
git push origin main --tags

# Also merge to develop if you have dev branch
git checkout develop
git merge hotfix/v0.1.1-crash-on-export
git push origin develop
```

**Step 5: Build Release AAB (15 min)**

```bash
# Update version numbers
# Edit android/app/build.gradle:
versionCode 2  // Increment from 1
versionName "0.1.1"  // Patch version

# Edit package.json:
"version": "0.1.1"

# Clean and build
cd android
./gradlew clean
./gradlew bundleRelease

# Verify AAB
ls -lh app/build/outputs/bundle/release/app-release.aab
jarsigner -verify app/build/outputs/bundle/release/app-release.aab

# Backup build
cp app/build/outputs/bundle/release/app-release.aab \
   ../builds/koodtx-v0.1.1-hotfix-$(date +%Y%m%d-%H%M).aab
```

**Step 6: Deploy to Play Console (15 min)**

```
1. Go to Play Console > Production
2. Click "Create new release"
3. Upload AAB
4. Release notes:

English:
Hotfix v0.1.1 - Critical Bug Fix
• Fixed crash when exporting sessions with missing data
• Improved error handling for export functionality
• Added safety checks to prevent data loss

Korean:
핫픽스 v0.1.1 - 중요 버그 수정
• 데이터 누락된 세션 내보내기 시 크래시 수정
• 내보내기 기능 오류 처리 개선
• 데이터 손실 방지를 위한 안전 검사 추가

5. Rollout: 100% (or 50% then monitor for 1h then 100%)
6. Click "Review and rollout"
7. Request "Expedited review" if option available
8. Submit
```

**Step 7: Notify Users (10 min)**

**If issue affects many users, send notification:**

1. **Post on social media:**
```
We've identified and fixed a critical issue in v0.1.0 that caused crashes during data export.

Hotfix v0.1.1 is now rolling out on Google Play. Update available shortly!

Thank you for your patience. 🙏

#KooDTX #BugFix
```

2. **Email affected users** (if you have their emails):
```
Subject: KooDTX Hotfix - Export Crash Fixed

Hi,

We detected a critical bug in KooDTX v0.1.0 that could cause crashes when exporting sessions. We've released a hotfix (v0.1.1) that resolves this issue.

What was fixed:
- Crash when exporting sessions with incomplete data
- Improved error handling
- Added data validation checks

Please update to v0.1.1:
1. Open Google Play Store
2. Search "KooDTX"
3. Tap "Update"

The update is rolling out now and should be available within a few hours.

We apologize for any inconvenience!

Best regards,
KooDTX Team
```

3. **Update GitHub:**
```markdown
## v0.1.1 - Hotfix (2025-11-16)

### Bug Fixes
- **Export:** Fixed critical crash when exporting sessions with null data (#123)
- **Export:** Added validation and error handling
- **Export:** Improved user error messages

### Technical Details
- Added null checks before export operations
- Wrapped export in try-catch for safety
- Enhanced Sentry logging for better diagnostics

**Affected versions:** v0.1.0
**Severity:** Critical
**Users impacted:** ~15% (200 users)
```

### Part 2: Expedited Review Process

#### 2.1 Request Expedited Review

**When to use:**
- Critical crash affecting majority of users
- Data loss bug
- Security vulnerability
- App completely unusable

**How to request:**

```
1. After submitting hotfix to Play Console
2. Navigate to: Help > Contact Us
3. Select: "Publishing and distribution"
4. Choose: "App release and management"
5. Message template:

Subject: Expedited Review Request - Critical Hotfix

Hello Google Play Team,

I've submitted a critical hotfix for [App Name] (package: com.koodtx) and request expedited review.

Issue: [Brief description - e.g., "App crashes on launch for Android 14 users"]
Severity: Critical
Users affected: [Number or percentage]
Fix: [What was fixed]

Release details:
- Version: 0.1.1
- Upload time: [timestamp]
- Previous version: 0.1.0

This hotfix only addresses the critical crash and contains minimal changes.

Stack trace and details available in submission notes.

Thank you for your assistance.

[Your name]
Developer Account: [account@email.com]
```

**Response time:**
- Regular review: 1-7 days
- Expedited review: 4-24 hours (if approved)
- Not guaranteed, but usually granted for critical issues

### Part 3: Rollback Plan

#### 3.1 When to Rollback

Rollback if hotfix:
- Introduces new critical bug
- Makes situation worse
- Affects more users than original bug

#### 3.2 Rollback Steps

```bash
# Option 1: Halt rollout
1. Play Console > Production > Releases
2. Click "Halt rollout" on problematic version
3. Existing users keep update, new users get previous version

# Option 2: Rollback to previous version
1. Create new release with previous AAB
2. Increment version code (2 → 3)
3. Use previous version name (0.1.0)
4. Release notes: "Rolling back to v0.1.0 while investigating issue"
5. Submit for review

# Option 3: Quick fix the hotfix
1. Create hotfix/v0.1.2 branch
2. Fix the new bug
3. Fast-track testing
4. Release v0.1.2

Recommended: Option 3 (fix forward) unless issue is severe
```

### Part 4: Post-Hotfix Monitoring

#### 4.1 Immediate Monitoring (First 2 hours)

```markdown
Every 30 minutes check:

Sentry:
- [ ] Error rate for fixed issue (should drop to 0)
- [ ] New errors introduced (should be 0)
- [ ] Overall crash rate (should decrease)

Play Console:
- [ ] Crash rate for new version
- [ ] ANR rate
- [ ] New reviews (watch for reports of new issues)

Metrics:
- [ ] Install rate of new version
- [ ] Uninstall rate (should not spike)

If all green for 2 hours → Hotfix successful ✅
If new issues appear → Investigate immediately
```

#### 4.2 24-Hour Review

```markdown
After 24 hours:

- [ ] Crash-free rate back to >99%?
- [ ] Fixed issue no longer in top errors?
- [ ] No new critical issues introduced?
- [ ] User reviews improved?
- [ ] Rollout complete (100% of users)?

Document:
- Root cause of original bug
- Fix applied
- Testing performed
- Lessons learned
- Prevention measures for future
```

### Deliverables

Create these documents:

#### File 1: `docs/HOTFIX_PROCESS.md`

```markdown
# Hotfix Process Guide

## When to Use Hotfix Process

Hotfix is for CRITICAL issues only:
- App crashes on launch
- Data loss or corruption
- Core features completely broken
- Security vulnerabilities
- Affects >10% of users significantly

For non-critical bugs: Wait for regular update cycle.

## Hotfix Timeline

Target: 2-4 hours from detection to submission

- 0-15 min: Assess severity
- 15-30 min: Reproduce issue
- 30-120 min: Develop fix
- 120-150 min: Test fix
- 150-180 min: Build and deploy
- 180-200 min: Submit and notify

## Quick Reference

### 1. Create Branch
```bash
git checkout main
git checkout -b hotfix/v0.X.Y-description
```

### 2. Fix & Test
- Minimal changes only
- Test on real devices
- Verify fix works
- Check for regressions

### 3. Version Bump
```gradle
// android/app/build.gradle
versionCode X + 1
versionName "0.X.Y"
```

### 4. Build
```bash
cd android
./gradlew clean bundleRelease
```

### 5. Deploy
- Upload to Play Console > Production
- Add release notes
- Request expedited review
- Submit

### 6. Notify
- Post on social media
- Email users (if applicable)
- Update GitHub releases

### 7. Monitor
- Check Sentry every 30 min (first 2h)
- Watch crash rates
- Read new reviews
- Verify fix effectiveness

## Hotfix Checklist

Pre-deployment:
- [ ] Issue reproduced
- [ ] Fix tested on multiple devices
- [ ] Version numbers updated
- [ ] Git commit with detailed message
- [ ] Release notes prepared

Deployment:
- [ ] AAB built and signed
- [ ] Uploaded to Play Console
- [ ] Release notes added (EN + KR)
- [ ] Expedited review requested (if applicable)
- [ ] Submitted for review

Post-deployment:
- [ ] Social media announcement
- [ ] GitHub release created
- [ ] Sentry monitoring active
- [ ] Team notified

Monitoring (first 24h):
- [ ] 30 min: Check Sentry for new errors
- [ ] 1h: Check crash rate
- [ ] 2h: Review new Play Store reviews
- [ ] 4h: Verify rollout progress
- [ ] 24h: Confirm issue resolved

## Rollback Decision Tree

```
Is hotfix causing new critical issues?
├─ Yes → Halt rollout immediately
│   ├─ Can we fix quickly (< 1h)? → Fix and release v0.X.Y+1
│   └─ No → Rollback to previous version
│
└─ No → Continue monitoring
    ├─ Original issue fixed? → Success ✅
    └─ Original issue persists? → Investigate further
```

## Emergency Contacts

- On-call dev: [phone]
- Play Console access: [email]
- Sentry access: [email]
- Social media access: [person]

## Lessons Learned Template

After each hotfix, document:
```
Hotfix: v0.X.Y
Date: YYYY-MM-DD
Issue: [Description]
Root Cause: [Why it happened]
Fix: [What was changed]
Time to Fix: [Hours]
Users Affected: [Count/%]
Lessons Learned:
- [What went wrong]
- [What went well]
- [What to improve]
Prevention:
- [How to prevent similar issues]
```

---

Last updated: 2025-11-15
```

#### File 2: `.github/workflows/hotfix-deploy.yml` (Optional - CI/CD)

```yaml
name: Hotfix Build and Deploy

on:
  push:
    branches:
      - 'hotfix/**'
    tags:
      - 'v*'

jobs:
  build-hotfix:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '17'

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm install
          cd android
          chmod +x gradlew

      - name: Build Release AAB
        run: |
          cd android
          ./gradlew bundleRelease
        env:
          KOODTX_RELEASE_STORE_FILE: ${{ secrets.RELEASE_KEYSTORE }}
          KOODTX_RELEASE_STORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KOODTX_RELEASE_KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KOODTX_RELEASE_KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}

      - name: Sign AAB
        run: |
          echo "${{ secrets.RELEASE_KEYSTORE_BASE64 }}" | base64 -d > release.keystore
          jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
            -keystore release.keystore \
            -storepass ${{ secrets.KEYSTORE_PASSWORD }} \
            android/app/build/outputs/bundle/release/app-release.aab \
            ${{ secrets.KEY_ALIAS }}

      - name: Upload AAB Artifact
        uses: actions/upload-artifact@v3
        with:
          name: app-release
          path: android/app/build/outputs/bundle/release/app-release.aab

      - name: Create GitHub Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          files: android/app/build/outputs/bundle/release/app-release.aab
          draft: false
          prerelease: true
          body: |
            Hotfix Release - See release notes for details.
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Notify Team
        if: failure()
        run: |
          # Send notification to Slack/Discord/Email
          echo "Hotfix build failed! Check GitHub Actions."
          # curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} -d '{"text":"Hotfix build failed!"}'
```

### Completion Checklist

- [ ] Hotfix process documented
- [ ] Emergency workflow tested (simulation)
- [ ] Version bump procedure clear
- [ ] GitHub Actions workflow created (optional)
- [ ] Expedited review request template ready
- [ ] Rollback procedure documented
- [ ] Team trained on hotfix process
- [ ] Emergency contact list created

**Time Estimate:** 4 hours

---

## Phase 248: User Analytics Setup

**Time:** 5 hours
**Priority:** P2 - Medium

### Objectives

Implement user behavior tracking and analytics to understand how users interact with the app.

### Part 1: Analytics Tool Selection

#### Option A: Firebase Analytics (Recommended)

**Pros:**
- Free (generous quota)
- Google-owned (integrates with Play Console)
- Real-time data
- Good documentation
- Already have Firebase for Crashlytics (Sentry alternative)

**Cons:**
- Google lock-in
- Privacy concerns for some users
- Limited custom analysis

**Installation:**

```bash
# Add Firebase to project
npm install @react-native-firebase/app @react-native-firebase/analytics

# iOS (if supporting later)
cd ios && pod install

# Android - already configured if using Crashlytics
```

**Configuration:**

```javascript
// src/utils/analytics.ts
import analytics from '@react-native-firebase/analytics';
import { envConfig } from '../config/env';

class Analytics {
  private enabled: boolean;

  constructor() {
    this.enabled = envConfig.ENABLE_ANALYTICS;
  }

  async logEvent(eventName: string, params?: Record<string, any>) {
    if (!this.enabled) return;

    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  async logScreenView(screenName: string) {
    if (!this.enabled) return;

    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  }

  async setUserProperty(name: string, value: string) {
    if (!this.enabled) return;

    await analytics().setUserProperty(name, value);
  }

  async setUserId(userId: string) {
    if (!this.enabled) return;

    await analytics().setUserId(userId);
  }
}

export const analyticsService = new Analytics();
```

#### Option B: Amplitude (Alternative)

**Pros:**
- More powerful analysis
- Better user journey tracking
- Free tier: 10M events/month
- Cohort analysis

**Cons:**
- Extra dependency
- Requires account setup
- Learning curve

### Part 2: Event Tracking Implementation

#### 2.1 Core Events to Track

Create `src/events/analyticsEvents.ts`:

```typescript
// Event names constants
export const AnalyticsEvents = {
  // App Lifecycle
  APP_OPENED: 'app_opened',
  APP_BACKGROUNDED: 'app_backgrounded',
  APP_CLOSED: 'app_closed',

  // Session Management
  SESSION_CREATED: 'session_created',
  SESSION_VIEWED: 'session_viewed',
  SESSION_DELETED: 'session_deleted',

  // Recording
  RECORDING_STARTED: 'recording_started',
  RECORDING_STOPPED: 'recording_stopped',
  RECORDING_PAUSED: 'recording_paused',
  RECORDING_RESUMED: 'recording_resumed',

  // Sensors
  SENSOR_SELECTED: 'sensor_selected',
  SENSOR_DESELECTED: 'sensor_deselected',
  SAMPLING_RATE_CHANGED: 'sampling_rate_changed',

  // Export
  EXPORT_INITIATED: 'export_initiated',
  EXPORT_COMPLETED: 'export_completed',
  EXPORT_FAILED: 'export_failed',
  EXPORT_FORMAT_SELECTED: 'export_format_selected',

  // Sync
  SYNC_STARTED: 'sync_started',
  SYNC_COMPLETED: 'sync_completed',
  SYNC_FAILED: 'sync_failed',
  SYNC_SETTINGS_CHANGED: 'sync_settings_changed',

  // Settings
  SETTINGS_OPENED: 'settings_opened',
  SETTING_CHANGED: 'setting_changed',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  PERMISSION_DENIED: 'permission_denied',

  // User Actions
  SCREEN_VIEWED: 'screen_view',
  BUTTON_CLICKED: 'button_clicked',
  FEATURE_USED: 'feature_used',
} as const;

// Event parameter types
export interface SessionCreatedParams {
  sensors_count: number;
  has_gps: boolean;
  has_audio: boolean;
  sampling_rate: number;
}

export interface RecordingStoppedParams {
  duration_seconds: number;
  data_points_count: number;
  sensors_used: string[];
  file_size_mb: number;
}

export interface ExportCompletedParams {
  format: 'csv' | 'json';
  file_size_mb: number;
  data_points: number;
  export_duration_ms: number;
}

export interface ErrorOccurredParams {
  error_type: string;
  error_message: string;
  screen: string;
  fatal: boolean;
}
```

#### 2.2 Implement Tracking in Components

**Example: Track Recording Events**

```typescript
// src/screens/RecordingScreen.tsx
import { analyticsService } from '../utils/analytics';
import { AnalyticsEvents } from '../events/analyticsEvents';

export const RecordingScreen = () => {
  const startRecording = async () => {
    // Start recording logic...

    // Track event
    await analyticsService.logEvent(AnalyticsEvents.RECORDING_STARTED, {
      sensors_count: selectedSensors.length,
      has_gps: selectedSensors.includes('gps'),
      has_audio: selectedSensors.includes('audio'),
      sampling_rate: samplingRate,
    });
  };

  const stopRecording = async () => {
    const duration = Date.now() - startTime;

    // Stop recording logic...

    // Track event
    await analyticsService.logEvent(AnalyticsEvents.RECORDING_STOPPED, {
      duration_seconds: Math.floor(duration / 1000),
      data_points_count: dataPoints.length,
      sensors_used: selectedSensors,
      file_size_mb: (fileSize / 1024 / 1024).toFixed(2),
    });
  };

  return (
    // UI components...
  );
};
```

**Example: Track Screen Views**

```typescript
// src/navigation/AppNavigator.tsx
import { useEffect } from 'react';
import { useNavigationState } from '@react-navigation/native';
import { analyticsService } from '../utils/analytics';
import { AnalyticsEvents } from '../events/analyticsEvents';

export const AppNavigator = () => {
  const navigationState = useNavigationState(state => state);

  useEffect(() => {
    const currentRoute = navigationState?.routes[navigationState.index];
    if (currentRoute) {
      analyticsService.logScreenView(currentRoute.name);
    }
  }, [navigationState]);

  return (
    // Navigation components...
  );
};
```

### Part 3: Analytics Dashboards

#### 3.1 Firebase Analytics Dashboard Setup

**Create Custom Dashboards:**

1. **User Engagement Dashboard**
   - Daily Active Users (DAU)
   - Weekly Active Users (WAU)
   - Monthly Active Users (MAU)
   - Session duration
   - Sessions per user

2. **Feature Usage Dashboard**
   - Recordings created (daily)
   - Export operations (by format)
   - Sync operations
   - Most used sensors
   - Average recording duration

3. **Funnel Analysis**
   - New user onboarding: Install → First session → First recording
   - Export funnel: Session view → Export click → Export complete
   - Sync adoption: Install → Settings → Enable sync → First sync

4. **Retention Dashboard**
   - Day 1 retention
   - Day 7 retention
   - Day 30 retention
   - Cohort analysis by install date

#### 3.2 Custom Metrics

**Add to `docs/ANALYTICS_EVENTS.md`:**

```markdown
# Analytics Events Documentation

## Overview

This document defines all analytics events tracked in KooDTX.

## Event Catalog

### App Lifecycle Events

#### app_opened
**Trigger:** App launches or comes to foreground
**Parameters:**
- `app_version`: string - App version (e.g., "0.1.0")
- `platform`: string - "android" or "ios"
- `os_version`: string - OS version (e.g., "14")
- `device_model`: string - Device model
- `is_first_open`: boolean - First time opening app

**Example:**
```json
{
  "event": "app_opened",
  "app_version": "0.1.0",
  "platform": "android",
  "os_version": "13",
  "device_model": "Samsung SM-G991B",
  "is_first_open": false
}
```

### Session Events

#### session_created
**Trigger:** User creates a new recording session
**Parameters:**
- `sensors_count`: number - Number of sensors selected
- `has_gps`: boolean - GPS enabled
- `has_audio`: boolean - Audio recording enabled
- `sampling_rate`: number - Sampling rate in Hz

#### recording_started
**Trigger:** User starts recording
**Parameters:**
- `session_id`: string - Session identifier
- `sensors_used`: string[] - Array of sensor names
- `sampling_rate`: number

#### recording_stopped
**Trigger:** Recording stops (manual or automatic)
**Parameters:**
- `duration_seconds`: number - Recording duration
- `data_points_count`: number - Total data points collected
- `sensors_used`: string[]
- `file_size_mb`: number - Approximate file size
- `stopped_by`: string - "user" | "low_battery" | "error"

### Export Events

#### export_initiated
**Trigger:** User clicks export button
**Parameters:**
- `format`: string - "csv" | "json"
- `session_id`: string
- `data_points`: number

#### export_completed
**Trigger:** Export successfully completes
**Parameters:**
- `format`: string
- `file_size_mb`: number
- `data_points`: number
- `export_duration_ms`: number
- `destination`: string - "files" | "email" | "drive"

#### export_failed
**Trigger:** Export fails
**Parameters:**
- `format`: string
- `error_message`: string
- `error_code`: string

### Sync Events

#### sync_started
**Trigger:** Sync operation begins
**Parameters:**
- `sessions_count`: number - Sessions to sync
- `total_size_mb`: number
- `network_type`: string - "wifi" | "cellular" | "none"

#### sync_completed
**Trigger:** Sync successfully completes
**Parameters:**
- `sessions_synced`: number
- `total_size_mb`: number
- `duration_seconds`: number
- `upload_speed_mbps`: number

### Error Events

#### error_occurred
**Trigger:** Any error in the app
**Parameters:**
- `error_type`: string - "crash" | "network" | "permission" | "storage"
- `error_message`: string
- `screen`: string - Screen where error occurred
- `fatal`: boolean

#### permission_denied
**Trigger:** User denies permission
**Parameters:**
- `permission_type`: string - "location" | "microphone" | "storage"
- `screen`: string

## User Properties

Set once per user to enable segmentation:

- `user_type`: "researcher" | "developer" | "student" | "other"
- `install_date`: timestamp
- `first_recording_date`: timestamp
- `total_sessions_created`: number
- `total_recordings_hours`: number
- `favorite_sensors`: string[] - Most used sensors
- `average_session_duration`: number

## Privacy Notes

- No personally identifiable information (PII) is collected
- User IDs are anonymized
- Location coordinates are never sent (only "GPS enabled" boolean)
- Audio content is never analyzed
- Users can opt-out in Settings > Privacy > Disable Analytics

## Implementation Example

```typescript
// When user creates session
await analyticsService.logEvent('session_created', {
  sensors_count: 3,
  has_gps: true,
  has_audio: false,
  sampling_rate: 100,
});

// When recording stops
await analyticsService.logEvent('recording_stopped', {
  duration_seconds: 300,
  data_points_count: 30000,
  sensors_used: ['accelerometer', 'gyroscope', 'gps'],
  file_size_mb: 5.2,
  stopped_by: 'user',
});
```

---

Last updated: 2025-11-15
```

### Part 4: Retention Analysis

**Create Retention Tracking:**

```typescript
// src/utils/retentionTracking.ts
import { analyticsService } from './analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

class RetentionTracker {
  private readonly INSTALL_DATE_KEY = 'install_date';
  private readonly LAST_OPEN_DATE_KEY = 'last_open_date';
  private readonly OPEN_COUNT_KEY = 'app_open_count';

  async trackAppOpen() {
    const now = Date.now();

    // Check if first install
    const installDate = await AsyncStorage.getItem(this.INSTALL_DATE_KEY);
    if (!installDate) {
      await AsyncStorage.setItem(this.INSTALL_DATE_KEY, now.toString());
      await analyticsService.logEvent('app_opened', { is_first_open: true });
      return;
    }

    // Track retention
    const lastOpenDate = await AsyncStorage.getItem(this.LAST_OPEN_DATE_KEY);
    const daysSinceInstall = Math.floor((now - parseInt(installDate)) / (1000 * 60 * 60 * 24));
    const daysSinceLastOpen = lastOpenDate
      ? Math.floor((now - parseInt(lastOpenDate)) / (1000 * 60 * 60 * 24))
      : 0;

    // Increment open count
    const openCount = parseInt(await AsyncStorage.getItem(this.OPEN_COUNT_KEY) || '0') + 1;
    await AsyncStorage.setItem(this.OPEN_COUNT_KEY, openCount.toString());

    // Log retention events
    if (daysSinceInstall === 1) {
      await analyticsService.logEvent('retention_day_1', { returned: true });
    } else if (daysSinceInstall === 7) {
      await analyticsService.logEvent('retention_day_7', { returned: true });
    } else if (daysSinceInstall === 30) {
      await analyticsService.logEvent('retention_day_30', { returned: true });
    }

    // Track if user returned after being away
    if (daysSinceLastOpen >= 7) {
      await analyticsService.logEvent('user_returned', {
        days_away: daysSinceLastOpen,
      });
    }

    // Update last open date
    await AsyncStorage.setItem(this.LAST_OPEN_DATE_KEY, now.toString());

    // Log app open with context
    await analyticsService.logEvent('app_opened', {
      is_first_open: false,
      days_since_install: daysSinceInstall,
      total_opens: openCount,
    });
  }
}

export const retentionTracker = new RetentionTracker();
```

**Use in App.tsx:**

```typescript
// src/App.tsx
import { useEffect } from 'react';
import { retentionTracker } from './utils/retentionTracking';

export const App = () => {
  useEffect(() => {
    retentionTracker.trackAppOpen();
  }, []);

  return (
    // App components...
  );
};
```

### Deliverables

- [ ] Analytics SDK integrated (Firebase or Amplitude)
- [ ] Core events implemented (15+ events)
- [ ] Screen view tracking automated
- [ ] Analytics events documented
- [ ] Privacy opt-out implemented
- [ ] Retention tracking active
- [ ] Dashboards created
- [ ] 1 week of data collected

**Completion Checklist:**

- [ ] `src/utils/analytics.ts` created
- [ ] `src/events/analyticsEvents.ts` created
- [ ] `docs/ANALYTICS_EVENTS.md` documented
- [ ] Privacy policy updated with analytics disclosure
- [ ] Settings screen has "Disable Analytics" option
- [ ] Firebase/Amplitude dashboard configured
- [ ] Retention tracking implemented
- [ ] Team trained on reading analytics data

**Time Estimate:** 5 hours

---

## Phase 249: Feedback Loop

**Time:** 4 hours
**Priority:** P1 - High

### Objectives

Build systematic user feedback collection and prioritization system.

### Part 1: Feedback Collection Channels

#### 1.1 In-App Feedback

**Create Feedback Form in App:**

```typescript
// src/screens/FeedbackScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { analyticsService } from '../utils/analytics';

export const FeedbackScreen = () => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general');
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');

  const submitFeedback = async () => {
    // Send to backend or email
    await sendFeedbackEmail({
      type: feedbackType,
      message: feedback,
      email,
      appVersion: '0.1.0',
      device: 'Samsung Galaxy S23',
      os: 'Android 13',
    });

    // Track submission
    await analyticsService.logEvent('feedback_submitted', {
      type: feedbackType,
      has_email: !!email,
    });

    // Show success message
    showToast('Thank you for your feedback!');
  };

  return (
    <View>
      <Text>We'd love to hear from you!</Text>

      {/* Feedback type selector */}
      <Picker
        selectedValue={feedbackType}
        onValueChange={setFeedbackType}
      >
        <Picker.Item label="General Feedback" value="general" />
        <Picker.Item label="Report a Bug" value="bug" />
        <Picker.Item label="Request a Feature" value="feature" />
      </Picker>

      {/* Feedback text */}
      <TextInput
        multiline
        placeholder="Tell us what you think..."
        value={feedback}
        onChangeText={setFeedback}
        style={{ height: 150 }}
      />

      {/* Optional email */}
      <TextInput
        placeholder="Your email (optional)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Button title="Submit Feedback" onPress={submitFeedback} />
    </View>
  );
};
```

#### 1.2 Monthly User Surveys

**Create Survey Using Google Forms:**

1. **Create Form**: https://forms.google.com
2. **Survey Template**:

```
KooDTX User Satisfaction Survey

1. How satisfied are you with KooDTX overall?
   ○ Very Satisfied
   ○ Satisfied
   ○ Neutral
   ○ Dissatisfied
   ○ Very Dissatisfied

2. How likely are you to recommend KooDTX to a colleague? (0-10)
   [NPS Score: 0 = Not at all likely, 10 = Extremely likely]

3. Which features do you use most? (Select all that apply)
   ☐ Accelerometer recording
   ☐ Gyroscope recording
   ☐ GPS tracking
   ☐ Audio recording
   ☐ Data export (CSV)
   ☐ Data export (JSON)
   ☐ Cloud sync

4. What feature would you like to see added?
   [Open text]

5. Have you experienced any bugs or issues?
   ○ Yes (please describe below)
   ○ No

6. If yes, please describe:
   [Open text]

7. How often do you use KooDTX?
   ○ Daily
   ○ Weekly
   ○ Monthly
   ○ Rarely

8. What is your primary use case?
   ○ Academic research
   ○ Personal projects
   ○ Professional work
   ○ Education/learning
   ○ Other: _____

9. Any additional comments or suggestions?
   [Open text]
```

**Schedule Surveys:**
- Monthly: NPS + satisfaction survey
- Quarterly: Detailed feature feedback
- After major updates: Update-specific questions

#### 1.3 GitHub Issues for Feature Requests

**Create Issue Templates:**

Create `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature Request
about: Suggest a new feature for KooDTX
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Feature Description

**What feature would you like to see?**
A clear and concise description of the feature.

## Use Case

**Why do you need this feature?**
Describe the problem this feature would solve or the workflow it would improve.

## Proposed Solution

**How would this feature work?**
Describe how you envision this feature functioning.

## Alternatives Considered

**Have you considered any alternative solutions?**
List any alternative features or workarounds you've thought of.

## Additional Context

**Any additional information?**
- Screenshots or mockups
- Examples from other apps
- Technical constraints to consider

## Priority

**How important is this feature to you?**
- [ ] Critical - I can't use the app effectively without it
- [ ] High - Would significantly improve my workflow
- [ ] Medium - Nice to have
- [ ] Low - Minor improvement

## Vote

👍 Upvote this issue if you want this feature!
```

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Report a bug in KooDTX
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description

**What happened?**
A clear and concise description of the bug.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

**What should happen?**
A clear description of what you expected.

## Actual Behavior

**What actually happened?**
Describe what actually occurred.

## Screenshots

**If applicable, add screenshots**
Drag and drop images here.

## Environment

**Please complete the following:**
- Device: [e.g., Samsung Galaxy S23]
- OS Version: [e.g., Android 13]
- App Version: [e.g., 0.1.0]
- Sensors involved: [e.g., Accelerometer, GPS]

## Additional Context

**Any other information?**
- Error messages
- Crash logs
- Frequency (always, sometimes, rarely)
```

### Part 2: Feedback Prioritization

#### 2.1 Impact vs Effort Matrix

Create `docs/FEATURE_PRIORITIZATION.md`:

```markdown
# Feature Prioritization Framework

## Impact vs Effort Matrix

```
High Impact │  Do Later    │  Do First    │
            │              │              │
            │  (3) Plan    │  (1) Quick   │
            │              │      Wins    │
────────────┼──────────────┼──────────────┤
            │              │              │
Low Impact  │  Don't Do    │  Fill Time   │
            │              │              │
            │  (4) Backlog │  (2) Easy    │
            └──────────────┴──────────────┘
              High Effort    Low Effort

```

## Scoring System

### Impact Score (1-10)

Criteria:
- User requests (weight: 3x)
  - 10+ requests = 10 points
  - 5-9 requests = 7 points
  - 1-4 requests = 3 points

- Aligns with vision (weight: 2x)
  - Perfect fit = 10 points
  - Good fit = 6 points
  - Weak fit = 2 points

- Addresses pain point (weight: 2x)
  - Critical pain = 10 points
  - Moderate pain = 6 points
  - Minor inconvenience = 2 points

**Total Impact** = (User Requests × 3 + Vision × 2 + Pain × 2) / 7

### Effort Score (1-10)

Criteria:
- Development time
  - <4 hours = 2 points
  - 4-8 hours = 4 points
  - 8-16 hours = 6 points
  - 16-40 hours = 8 points
  - 40+ hours = 10 points

- Technical complexity
  - Simple = 2 points
  - Moderate = 5 points
  - Complex = 8 points
  - Very complex = 10 points

- Dependencies
  - No dependencies = 1 point
  - Internal dependencies = 3 points
  - External dependencies = 6 points
  - Blocking dependencies = 10 points

**Total Effort** = (Time + Complexity + Dependencies) / 3

## Decision Rules

**Do First (P0):**
- Impact ≥ 8 AND Effort ≤ 4
- Quick wins with high value

**Do Soon (P1):**
- Impact ≥ 7 AND Effort ≤ 7
- High impact, manageable effort

**Do Later (P2):**
- Impact ≥ 6 AND Effort ≥ 8
- Plan for major release

**Backlog (P3):**
- Impact < 6 OR Effort ≥ 9
- Revisit quarterly

## Example Scoring

**Feature: Dark Mode Support**

Impact:
- User requests: 15+ requests = 10 × 3 = 30
- Vision alignment: Good fit = 6 × 2 = 12
- Pain point: Moderate = 6 × 2 = 12
- Total Impact: (30 + 12 + 12) / 7 = 7.7

Effort:
- Development time: 8-16 hours = 6
- Technical complexity: Moderate = 5
- Dependencies: Internal only = 3
- Total Effort: (6 + 5 + 3) / 3 = 4.7

**Result**: Impact 7.7, Effort 4.7 → **Do Soon (P1)**

---

Last updated: 2025-11-15
```

(Continuing with Phase 249 Part 3 and Phase 250...)

### Completion Checklist for Phase 249

- [ ] In-app feedback form created
- [ ] GitHub issue templates set up
- [ ] Feature request tracker spreadsheet created
- [ ] Public roadmap published
- [ ] Prioritization framework documented
- [ ] Feedback triage process established
- [ ] Monthly survey created
- [ ] First round of feedback collected and processed

**Time Estimate:** 4 hours

---

## Phase 250: Continuous Improvement Plan

**Time:** 6 hours
**Priority:** P2 - Medium

### Objectives

Establish regular update cadence and continuous improvement process for sustainable long-term development.

### Monthly Update Process

**4-week cycle:**
- Week 1: Planning
- Week 2-3: Development & Testing
- Week 4: Release & Monitor

### Versioning Strategy

**Semantic Versioning (MAJOR.MINOR.PATCH):**
- MAJOR: Breaking changes
- MINOR: New features (monthly)
- PATCH: Bug fixes (hotfixes)

### CHANGELOG Management

Maintain `CHANGELOG.md` with all notable changes following Keep a Changelog format.

### Release Checklist

Complete `docs/RELEASE_CHECKLIST.md` with pre-release, build, and post-release steps.

### Completion Checklist

- [ ] Release cadence decided (monthly recommended)
- [ ] Monthly update process documented
- [ ] CHANGELOG.md template created
- [ ] Release checklist created
- [ ] Versioning strategy established
- [ ] Retrospective template created
- [ ] Quarterly planning framework documented
- [ ] First monthly update executed successfully

**Time Estimate:** 6 hours

---

**Last Updated:** 2025-11-15
**Status:** Ready to Execute
**Prerequisites:** Phase 240 (Post-launch monitoring) completed

