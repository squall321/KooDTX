# Feedback Channels Setup Guide
## Phase 222: Email, Discord, and Communication Channels

**Purpose:** Instructions for setting up email and community channels for beta testing feedback.

**Last Updated:** 2025-11-15

---

## Table of Contents

1. [Email Setup (beta@koodtx.com)](#email-setup)
2. [Discord Community Setup](#discord-community-setup)
3. [Alternative: Slack Setup](#alternative-slack-setup)
4. [Communication Guidelines](#communication-guidelines)
5. [Response Templates](#response-templates)

---

## Email Setup

### Option 1: Google Workspace (Recommended for Professional Use)

**Cost:** ~$6/month per user

**Steps:**

1. **Purchase Domain (if not owned):**
   - Go to domains.google.com or use existing domain
   - Search for "koodtx.com" or your preferred domain
   - Purchase for ~$12/year

2. **Set Up Google Workspace:**
   - Go to workspace.google.com
   - Click "Get Started"
   - Follow setup wizard
   - Verify domain ownership (DNS records)

3. **Create Email Account:**
   - Admin Console > Users > Add New User
   - Email: beta@koodtx.com
   - Name: KooDTX Beta Team
   - Password: [Strong password]
   - Create

4. **Configure Email Settings:**
   - Enable 2-factor authentication
   - Set up email signature:
     ```
     KooDTX Beta Team
     beta@koodtx.com

     We appreciate your feedback!
     Response time: 24 hours (weekdays)
     ```

5. **Set Up Filters:**
   - Create labels:
     - "Bug Report - Critical"
     - "Bug Report - High"
     - "Bug Report - Medium/Low"
     - "Feedback - General"
     - "Feature Request"

   - Create filters:
     - From: forms-receipts-noreply@google.com
     - Subject contains: "Bug Report"
     - Apply label: "Bug Report"
     - Auto-forward to team members (optional)

6. **Enable Mobile Access:**
   - Install Gmail app on your phone
   - Add beta@koodtx.com account
   - Enable notifications for important emails

**Pros:**
- Professional appearance
- Reliable delivery
- Integration with Google Forms
- Team collaboration (shared inbox)

**Cons:**
- Monthly cost
- Requires domain ownership

---

### Option 2: Gmail Alias (Free, Quick Setup)

**Cost:** Free

**Steps:**

1. **Use Existing Gmail:**
   - Use your personal Gmail (e.g., yourname@gmail.com)
   - Set up alias: yourname+koodtxbeta@gmail.com

2. **Create Filters:**
   - Settings > Filters and Blocked Addresses
   - Create filter:
     - To: yourname+koodtxbeta@gmail.com
     - Apply label: "KooDTX Beta"
     - Star important

3. **Set Up Signature:**
   - Settings > General > Signature
   - Create:
     ```
     KooDTX Beta Team
     beta@koodtx.com (forwarded to gmail)

     Thank you for your feedback!
     ```

**Pros:**
- Free
- No domain needed
- Quick setup

**Cons:**
- Less professional
- Gmail address visible in replies
- No team sharing

---

### Option 3: ProtonMail (Privacy-Focused)

**Cost:** Free (limited) or €4/month (Plus plan)

**Steps:**

1. Go to protonmail.com
2. Sign up for account
3. Choose username: koodtx_beta or similar
4. Set up filters and labels
5. Configure auto-reply for non-business hours

**Pros:**
- Privacy-focused
- Free tier available
- Professional enough

**Cons:**
- Limited storage on free tier
- No custom domain on free tier

---

## Discord Community Setup

### Step 1: Create Discord Server

1. **Install Discord:**
   - Download from discord.com
   - Or use web version

2. **Create Server:**
   - Click "+" icon
   - "Create My Own"
   - "For a club or community"
   - Server Name: "KooDTX Beta Testers"
   - Upload icon (KooDTX logo)
   - Click "Create"

### Step 2: Set Up Channels

Create these text channels:

#### 📢 Information Channels
- **#welcome** - Welcome message and rules
- **#announcements** - Beta updates and announcements (read-only)
- **#guidelines** - Testing guidelines and resources

#### 💬 Discussion Channels
- **#general** - General discussion
- **#bug-reports** - Quick bug reporting
- **#feature-requests** - Feature ideas discussion
- **#feedback** - General feedback
- **#questions** - Q&A about the app

#### 🛠️ Support Channels
- **#help** - Get help from team/community
- **#faq** - Frequently asked questions

#### 🎮 Optional Channels
- **#show-and-tell** - Share cool recordings or use cases
- **#off-topic** - Non-KooDTX chat

### Step 3: Set Up Roles

Create these roles:

1. **@Admin** - Team members
   - Color: Red (#E74C3C)
   - Permissions: Administrator

2. **@Beta Manager** - Beta program managers
   - Color: Orange (#E67E22)
   - Permissions: Manage channels, messages, members

3. **@Internal Beta** - Internal testers (Week 1)
   - Color: Purple (#9B59B6)
   - Permissions: Send messages, add reactions
   - Access: All channels

4. **@Open Beta** - Open beta testers
   - Color: Blue (#3498DB)
   - Permissions: Send messages, add reactions
   - Access: Most channels (except internal)

5. **@Power User** - Active contributors
   - Color: Green (#2ECC71)
   - Permissions: Same as Open Beta
   - Recognition role

### Step 4: Configure Permissions

For **#announcements**:
- @everyone: View channel, Read message history
- @everyone: Send messages = OFF
- @Admin, @Beta Manager: Send messages = ON

For **#welcome**:
- @everyone: Read-only

For **#bug-reports, #feedback**:
- @everyone: Can send messages
- Set slow mode: 10 seconds (prevent spam)

### Step 5: Set Up Welcome Message

In **#welcome**, pin this message:

```
🎉 Welcome to KooDTX Beta Testers! 🎉

Thank you for joining our beta testing community!

📱 **About KooDTX**
KooDTX is a sensor data collection app for iOS and Android. We're building the best tool for recording accelerometer, gyroscope, GPS, audio, and more!

🧪 **Beta Testing Program**
- Internal Beta: 5-10 testers (Week 1)
- Open Beta: 50-100 testers (Week 2-4)
- Testing timeline: 4-6 weeks

📋 **How to Get Started**
1. Read #guidelines for testing instructions
2. Join TestFlight (iOS) or Google Play Internal Testing (Android)
3. Test the app and report bugs in #bug-reports
4. Share feedback in #feedback
5. Request features in #feature-requests

📞 **Support Channels**
- 🐛 Bug Reports: Use Google Forms (link in #guidelines) or post in #bug-reports
- 💬 General Feedback: #feedback
- 💡 Feature Ideas: #feature-requests
- ❓ Questions: #help
- 📧 Email: beta@koodtx.com

🏆 **Rewards**
- Name in app credits
- Beta tester badge
- Premium features (1 year free)
- Top 3 contributors: Lifetime premium + recognition

📜 **Rules**
1. Be respectful and constructive
2. No spam or self-promotion
3. Keep discussions on-topic
4. Beta builds are confidential - don't share outside
5. Report serious bugs via Google Forms, not just Discord

Let's build something great together! 🚀

React with ✅ if you've read this message.
```

### Step 6: Create Invite Link

1. Click server name > "Invite People"
2. Click "Edit invite link"
3. Settings:
   - Expire after: Never
   - Max number of uses: No limit
   - Grant temporary membership: OFF
4. Click "Generate a New Link"
5. Copy link (e.g., `https://discord.gg/abc123xyz`)

**Update BetaInfoScreen.tsx** at line 103:
```typescript
openLink('https://discord.gg/YOUR_ACTUAL_INVITE', 'Discord 커뮤니티');
```

### Step 7: Set Up Bots (Optional)

Useful bots:
- **MEE6** - Welcome messages, auto-moderation, leveling
- **Dyno** - Moderation, custom commands
- **Statbot** - Server statistics

### Step 8: Server Settings

1. **Verification Level:**
   - Server Settings > Safety Setup
   - Verification level: Low (verified email required)

2. **Moderation:**
   - Enable auto-moderation
   - Filter spam, profanity (optional)

3. **Community Features:**
   - Enable Community (for discovery)
   - Set up rules screening

---

## Alternative: Slack Setup

If you prefer Slack over Discord:

### Step 1: Create Workspace

1. Go to slack.com
2. Click "Get Started"
3. Enter email
4. Workspace name: "KooDTX Beta"
5. Project: "Beta Testing"

### Step 2: Create Channels

- #general
- #announcements
- #bug-reports
- #feedback
- #feature-requests
- #help

### Step 3: Invite Members

1. Settings > Invite People
2. Get invite link
3. Share with testers

### Pros of Slack:
- Better for professional teams
- Threaded conversations
- Better search
- Integrations

### Cons of Slack:
- 10,000 message limit on free tier
- Less gaming/community feel
- Smaller user base for casual users

---

## Communication Guidelines

### Response Time Commitments

- **Critical Bugs (App crashes, data loss):** 2-4 hours
- **High Priority Bugs:** 24 hours (weekdays)
- **Medium/Low Bugs:** 48 hours
- **General Feedback:** 48-72 hours
- **Feature Requests:** 1 week

### Communication Principles

1. **Be Professional**
   - Use friendly, professional tone
   - Thank users for feedback
   - Acknowledge effort

2. **Be Transparent**
   - Explain decisions
   - Share timeline when possible
   - Admit when something can't be fixed

3. **Be Timely**
   - Acknowledge receipt within 24 hours
   - Provide updates even if not resolved
   - Set expectations

4. **Be Helpful**
   - Offer workarounds when available
   - Ask clarifying questions
   - Provide context

---

## Response Templates

### Bug Report Acknowledgment

```
Hi [Name],

Thank you for reporting this bug! We've received your report about [brief description].

Status: We're investigating this issue.
Priority: [Critical/High/Medium/Low]
Estimated fix: [timeframe if known]

We'll keep you updated on our progress. In the meantime, [workaround if available].

Best regards,
KooDTX Beta Team
```

### Bug Fixed Notification

```
Hi [Name],

Great news! The bug you reported ([brief description]) has been fixed in version [X.X.X].

Please update your app and verify the fix. Let us know if you encounter any further issues.

Thank you for helping us improve KooDTX!

Best regards,
KooDTX Beta Team
```

### Feature Request Acknowledgment

```
Hi [Name],

Thank you for your feature request: [feature title].

We've added this to our feature backlog for consideration. We review all requests and prioritize based on user impact and technical feasibility.

Current status: Under review
Priority: [TBD/Low/Medium/High]

We'll notify you if this feature is scheduled for development.

Best regards,
KooDTX Beta Team
```

### General Feedback Response

```
Hi [Name],

Thank you for your feedback on [topic]! We appreciate you taking the time to share your thoughts.

[Specific response to their feedback]

Your input helps us build a better app for everyone.

Best regards,
KooDTX Beta Team
```

### Can't Reproduce Bug

```
Hi [Name],

We've tried to reproduce the bug you reported, but we haven't been able to replicate it on our test devices.

Could you provide:
1. More detailed steps to reproduce
2. Screenshot or screen recording
3. Any other details that might help

This will help us identify and fix the issue.

Thank you for your patience!

Best regards,
KooDTX Beta Team
```

---

## Team Workflow

### Daily Tasks

1. **Check email** (beta@koodtx.com) - Morning
2. **Review Google Forms** responses - Morning
3. **Monitor Discord** #bug-reports - Throughout day
4. **Respond to critical** issues - Immediately
5. **Update issue tracker** - End of day

### Weekly Tasks

1. **Summarize feedback** - Friday
2. **Prioritize bugs** - Monday
3. **Update testers** on progress - Wednesday
4. **Review feature requests** - Friday

### Tools Integration

- **Google Forms** → **Google Sheets** → **Email alerts**
- **Discord** → **Webhooks** → **Slack/Email** (optional)
- **Trello/Asana/Jira** - For issue tracking
- **GitHub Issues** - For developer tracking

---

## Privacy & Security

### Email

- Enable 2FA
- Use strong passwords
- Don't share credentials
- Review sent emails regularly

### Discord

- Enable 2FA
- Moderate carefully
- Ban spam/abusive users
- Keep invite link private (don't post publicly)

### Data Handling

- Don't share user emails publicly
- Aggregate feedback data
- Delete personal info when no longer needed
- Comply with GDPR/privacy laws

---

## Metrics to Track

### Email

- Response time (average, median)
- Number of tickets per day
- Resolution time
- User satisfaction (ask for ratings)

### Discord

- Active members
- Messages per day
- Most active channels
- Bug reports vs discussions ratio

### Google Forms

- Submissions per day
- Bug severity distribution
- Feature request themes
- User satisfaction ratings

---

## Troubleshooting

**Email not receiving responses:**
- Check spam folder
- Verify Google Forms email notification settings
- Check email forwarding rules

**Discord invite not working:**
- Check invite expiration
- Check server verification level
- Generate new invite link

**Too many spam messages:**
- Enable Discord slow mode
- Require email verification
- Ban/mute spam accounts
- Use auto-moderation bots

---

## Next Steps

After setting up channels:

1. ✅ Test all channels (send test messages)
2. ✅ Update BetaInfoScreen.tsx with actual links
3. ✅ Create response templates document
4. ✅ Train team members on response guidelines
5. ✅ Announce channels to beta testers
6. ✅ Monitor first week closely
7. ✅ Adjust based on feedback volume

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Status:** Phase 222 - Setup Instructions
