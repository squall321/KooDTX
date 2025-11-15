# Google Forms Setup Guide for Beta Testing
## Phase 222: Feedback Collection System

**Purpose:** Step-by-step instructions for creating Google Forms for KooDTX beta testing feedback collection.

**Last Updated:** 2025-11-15

---

## Overview

You need to create **3 Google Forms**:

1. **Bug Report Form** - For collecting bug reports
2. **General Feedback Form** - For UX/UI feedback and suggestions
3. **Feature Request Form** - For collecting feature ideas

Each form will automatically save responses to a Google Sheet for tracking and analysis.

---

## Prerequisites

- Google Account (Gmail)
- Access to Google Forms (forms.google.com)
- Google Drive for storing responses

---

## Form 1: Bug Report Form

### Step 1: Create the Form

1. Go to https://forms.google.com
2. Click **"+ Blank"** to create a new form
3. Title: **"KooDTX Beta - Bug Report"**
4. Description:
   ```
   Thank you for helping improve KooDTX! Please fill out this form to report bugs or issues you've encountered during beta testing.

   Your feedback is valuable and will help us deliver a better app.
   ```

### Step 2: Add Questions

#### Section 1: Bug Information

**Q1: Bug Title** (Short answer, Required)
- Question: "Provide a short, descriptive title for the bug"
- Help text: "Example: App crashes when starting recording with all sensors"

**Q2: Severity** (Multiple choice, Required)
- Question: "How severe is this bug?"
- Options:
  - Critical - App crash, data loss, security issue
  - High - Core feature broken, blocking workflow
  - Medium - Feature partially working, workaround exists
  - Low - Cosmetic issue, minor inconvenience

**Q3: Bug Category** (Multiple choice, Required)
- Question: "Which category does this bug belong to?"
- Options:
  - Recording
  - Sync/Upload
  - Sessions Management
  - Settings
  - Diagnostics
  - UI/UX
  - Performance
  - Battery
  - Other

**Q4: Steps to Reproduce** (Paragraph, Required)
- Question: "Please provide detailed steps to reproduce the bug"
- Help text: "Example: 1. Open the app, 2. Go to Recording, 3. Enable all sensors, 4. Press start"

**Q5: Expected Behavior** (Paragraph, Required)
- Question: "What should happen?"
- Help text: "Describe the correct behavior"

**Q6: Actual Behavior** (Paragraph, Required)
- Question: "What actually happens?"
- Help text: "Describe what went wrong"

#### Section 2: Device Information

**Q7: Device Model** (Short answer, Required)
- Question: "What device are you using?"
- Help text: "Example: iPhone 14 Pro, Samsung Galaxy S23"

**Q8: OS Version** (Short answer, Required)
- Question: "What OS version are you running?"
- Help text: "Example: iOS 17.1, Android 14"

**Q9: App Version** (Short answer, Required)
- Question: "What app version are you testing?"
- Help text: "Check Settings > About in the app"

**Q10: Network Connection** (Multiple choice, Required)
- Question: "What network connection were you using?"
- Options:
  - WiFi
  - 4G/5G Mobile Data
  - Offline (Airplane Mode)
  - Poor Connection

#### Section 3: Additional Context

**Q11: Frequency** (Multiple choice, Required)
- Question: "How often does this occur?"
- Options:
  - Always (100%)
  - Often (>50%)
  - Sometimes (25-50%)
  - Rarely (<25%)

**Q12: First Occurrence** (Short answer, Optional)
- Question: "When did you first notice this bug?"
- Help text: "Example: After update to v1.2.0, or 3 days ago"

**Q13: Workaround** (Paragraph, Optional)
- Question: "Is there a workaround? If yes, please describe"

**Q14: Related Issues** (Paragraph, Optional)
- Question: "Have you noticed any related bugs or patterns?"

**Q15: Screenshots** (File upload, Optional)
- Question: "Upload screenshots or screen recordings if applicable"
- Settings: Allow file uploads (up to 10 files, 10MB each)

#### Section 4: Contact Information

**Q16: Your Name** (Short answer, Optional)
- Question: "Your name (optional, for follow-up questions)"

**Q17: Email** (Email, Required)
- Question: "Email address for updates on this bug"
- Validation: Must be valid email

**Q18: Tester Group** (Multiple choice, Required)
- Question: "Which tester group are you in?"
- Options:
  - Internal Beta Tester
  - Open Beta Tester
  - Other

**Q19: Consent** (Checkbox, Required)
- Question: "Please confirm:"
- Options:
  - I consent to the KooDTX team using this information to improve the app
  - I'm willing to provide additional information if needed
  - I'd like to be notified when this bug is fixed

### Step 3: Configure Settings

1. Click the **Settings** icon (gear) at the top
2. **General tab:**
   - ✅ Collect email addresses
   - ✅ Limit to 1 response per user (optional)
   - ✅ Allow response editing after submit
3. **Presentation tab:**
   - ✅ Show progress bar
   - Confirmation message: "Thank you for your bug report! We'll review it and get back to you within 24 hours."
4. Click **Save**

### Step 4: Set Up Response Collection

1. Click the **Responses** tab
2. Click the Google Sheets icon to create a spreadsheet
3. Name it: "KooDTX Beta - Bug Reports"
4. The spreadsheet will auto-populate with submissions

### Step 5: Get the Form Link

1. Click **Send** button
2. Click the **link icon** (chain)
3. Check **"Shorten URL"**
4. Copy the link (e.g., `https://forms.gle/abc123...`)
5. **Update BetaInfoScreen.tsx** with this link at line 74:
   ```typescript
   openLink(
     'https://forms.gle/YOUR_ACTUAL_LINK',
     '버그 리포트'
   );
   ```

---

## Form 2: General Feedback Form

### Step 1: Create the Form

1. Go to https://forms.google.com
2. Click **"+ Blank"**
3. Title: **"KooDTX Beta - General Feedback"**
4. Description:
   ```
   We value your feedback! Share your thoughts on the KooDTX beta app's user experience, interface, performance, or any suggestions you have.

   Your input helps shape the future of KooDTX.
   ```

### Step 2: Add Questions

#### Section 1: Feedback Information

**Q1: Feedback Title** (Short answer, Required)
- Question: "Provide a short, descriptive title for your feedback"

**Q2: Feedback Type** (Checkboxes, Required)
- Question: "What type of feedback is this?"
- Options:
  - User Experience (UX)
  - User Interface (UI)
  - Performance
  - Feature Suggestion
  - Documentation
  - Usability Issue
  - Positive Feedback
  - Other

**Q3: Related Feature/Screen** (Multiple choice, Required)
- Question: "Which part of the app is this feedback about?"
- Options:
  - Recording Screen
  - Sessions Screen
  - Sync Status Screen
  - Settings Screen
  - Diagnostics Screen
  - Navigation
  - Overall App
  - Other

**Q4: Your Feedback** (Paragraph, Required)
- Question: "Please provide detailed feedback"
- Help text: "Be as specific as possible"

**Q5: Why is this important to you?** (Paragraph, Required)
- Question: "Help us understand your use case"

**Q6: Impact on Usage** (Multiple choice, Required)
- Question: "How does this affect your usage?"
- Options:
  - Critical - Prevents me from using the app effectively
  - Significant - Makes certain tasks difficult
  - Moderate - Could improve my experience
  - Minor - Nice to have

#### Section 2: Suggestions

**Q7: Suggestions for Improvement** (Paragraph, Optional)
- Question: "If applicable, how would you improve this?"

**Q8: Examples from Other Apps** (Paragraph, Optional)
- Question: "Have you seen similar features done well elsewhere?"

#### Section 3: Usage Context

**Q9: Use Case** (Paragraph, Optional)
- Question: "Describe how you use this feature"

**Q10: Frequency of Use** (Multiple choice, Required)
- Question: "How often do you use this feature?"
- Options:
  - Daily
  - Weekly
  - Occasionally
  - Rarely
  - Haven't used it yet

**Q11: User Profile** (Checkboxes, Optional)
- Question: "Which best describes you? (Select all that apply)"
- Options:
  - First-time user
  - Casual user
  - Regular user
  - Power user
  - Professional use
  - Personal use
  - Research/Academic use

#### Section 4: Overall Experience

**Q12: Overall Experience** (Linear scale, Required)
- Question: "Rate your overall experience with the beta app"
- Scale: 1 (Poor) to 5 (Excellent)

**Q13: Would you recommend this app?** (Multiple choice, Required)
- Question: "Would you recommend KooDTX to others?"
- Options:
  - Definitely
  - Probably
  - Maybe
  - Probably Not
  - Definitely Not

**Q14: Why?** (Paragraph, Optional)
- Question: "Why or why not?"

**Q15: Screenshots** (File upload, Optional)
- Question: "Upload screenshots or mockups if applicable"

#### Section 5: Contact

**Q16: Your Name** (Short answer, Optional)
- Question: "Your name (optional)"

**Q17: Email** (Email, Required)
- Question: "Email for updates or further discussion"

**Q18: Tester Group** (Multiple choice, Required)
- Question: "Which tester group are you in?"
- Options:
  - Internal Beta Tester
  - Open Beta Tester
  - Other

**Q19: Consent** (Checkbox, Required)
- Options:
  - I consent to the KooDTX team using this feedback
  - I'm willing to participate in follow-up discussions
  - I'd like to be notified about implemented suggestions

### Step 3-5: Same as Bug Report Form

Follow the same steps for Settings, Response Collection, and Getting the Link.

**Update BetaInfoScreen.tsx** at line 84.

---

## Form 3: Feature Request Form

### Step 1: Create the Form

1. Title: **"KooDTX Beta - Feature Request"**
2. Description:
   ```
   Have an idea for a new feature or improvement? We'd love to hear it!

   Your feature requests help us prioritize development and build features that matter most to users.
   ```

### Step 2: Add Questions

#### Section 1: Feature Information

**Q1: Feature Title** (Short answer, Required)
- Question: "Provide a short, descriptive title"
- Help text: "Example: Add export to CSV feature"

**Q2: Feature Category** (Checkboxes, Required)
- Question: "Which category does this feature belong to?"
- Options:
  - Recording & Sensors
  - Data Sync & Upload
  - Session Management
  - Settings & Configuration
  - Data Visualization
  - Export & Sharing
  - Notifications
  - Performance
  - Accessibility
  - Other

#### Section 2: Problem Statement

**Q3: What problem does this solve?** (Paragraph, Required)
- Question: "Describe the pain point or need"

**Q4: Who would benefit?** (Checkboxes, Required)
- Question: "Who would benefit from this feature?"
- Options:
  - All users
  - Power users
  - Researchers
  - Casual users
  - Professional users
  - Specific use case (please describe)

**Q5: Problem Significance** (Multiple choice, Required)
- Question: "How significant is this problem?"
- Options:
  - Critical - Major blocker for my workflow
  - High - Significantly impacts my usage
  - Medium - Would improve my experience
  - Low - Nice to have

#### Section 3: Proposed Solution

**Q6: Describe your ideal solution** (Paragraph, Required)
- Question: "How would this feature work?"

**Q7: User Flow** (Paragraph, Required)
- Question: "Describe step-by-step how a user would interact with this feature"
- Help text: "Example: 1. User taps export, 2. Selects format, 3. Shares file"

**Q8: Visual Description** (Paragraph, Optional)
- Question: "Sketch or describe what the UI might look like"

**Q9: Screenshots/Mockups** (File upload, Optional)
- Question: "Upload examples or mockups if you have them"

#### Section 4: Alternatives & Examples

**Q10: Other Approaches** (Paragraph, Optional)
- Question: "Have you considered other approaches?"

**Q11: Examples from Other Apps** (Paragraph, Optional)
- Question: "Have you seen this implemented elsewhere?"

**Q12: Current Workarounds** (Paragraph, Optional)
- Question: "Are there any current workarounds? What are their limitations?"

#### Section 5: Use Case

**Q13: When would you use this?** (Paragraph, Required)
- Question: "Describe a specific scenario"

**Q14: Frequency of Use** (Multiple choice, Required)
- Question: "How often would you use it?"
- Options:
  - Daily
  - Weekly
  - Monthly
  - Occasionally
  - As needed

**Q15: Real-world Example** (Paragraph, Required)
- Question: "Provide a concrete example of when this would be useful"

#### Section 6: Priority

**Q16: Priority for You** (Multiple choice, Required)
- Question: "How important is this to you?"
- Options:
  - Must-have - Would not use app without it
  - High - Significantly improves my experience
  - Medium - Nice to have
  - Low - Minor improvement

**Q17: Time Savings** (Short answer, Optional)
- Question: "How much time would this save per use? (if applicable)"

#### Section 7: Contact

**Q18: Your Name** (Short answer, Optional)
- Question: "Your name (optional)"

**Q19: Email** (Email, Required)
- Question: "Email for updates on this feature request"

**Q20: Tester Group** (Multiple choice, Required)
- Options: Internal Beta Tester / Open Beta Tester / Other

**Q21: Involvement** (Checkboxes, Optional)
- Question: "Would you like to be involved?"
- Options:
  - Yes, I'd like to beta test this feature
  - Yes, I'd like to provide feedback during development
  - Yes, I'd like to be notified when it's implemented
  - No, just wanted to suggest

**Q22: Consent** (Checkbox, Required)
- Options:
  - I consent to the KooDTX team using this idea
  - I understand this is a suggestion and may not be implemented
  - I'm willing to participate in follow-up discussions
  - I'd like to be credited if this feature is implemented (optional)

### Step 3-5: Same as Bug Report Form

**Update BetaInfoScreen.tsx** at line 94.

---

## Post-Setup Tasks

### 1. Update BetaInfoScreen.tsx

Replace the placeholder links in `/home/user/KooDTX/src/screens/BetaInfoScreen.tsx`:

```typescript
// Line 74: Bug Report
openLink('https://forms.gle/YOUR_ACTUAL_BUG_LINK', '버그 리포트');

// Line 84: General Feedback
openLink('https://forms.gle/YOUR_ACTUAL_FEEDBACK_LINK', '피드백 폼');

// Line 94: Feature Request
openLink('https://forms.gle/YOUR_ACTUAL_FEATURE_LINK', '기능 요청');
```

### 2. Set Up Email Notifications

For each form:

1. Open the Google Sheet (Responses)
2. Go to **Tools > Notification rules**
3. Select: **"Notify me when... A user submits a form"**
4. Email: Immediately
5. Click **Save**

This will send you an email every time someone submits feedback.

### 3. Share Access with Team

1. Open each Google Sheet
2. Click **Share**
3. Add team members with **Editor** access
4. They can now view and manage responses

---

## Response Management

### Google Sheets Columns

Each form will create a spreadsheet with these columns:

- **Timestamp** - Auto-generated
- **All question responses** - One column per question
- **Email address** - If email collection is enabled

### Recommended Workflow

1. **Daily Review:** Check new submissions daily
2. **Triage:** Categorize by priority/severity
3. **Assign:** Assign to team members for action
4. **Track:** Update status (New → Reviewed → Fixed → Verified)
5. **Respond:** Reply to users when issues are resolved

### Add Status Columns

Manually add these columns to track progress:

1. **Status** (New / Reviewed / In Progress / Fixed / Closed)
2. **Assigned To** (Team member name)
3. **Priority** (P0 / P1 / P2 / P3)
4. **Notes** (Internal notes)
5. **Resolution Date** (When fixed)

---

## Tips for Better Responses

1. **Test the forms** yourself before sending to testers
2. **Keep forms concise** - Only ask essential questions
3. **Use conditional logic** - Show/hide questions based on answers (Advanced)
4. **Enable email collection** - To follow up with users
5. **Set up filters** in Google Sheets to sort by severity/priority
6. **Create pivot tables** to analyze trends
7. **Export data** regularly for backup

---

## Troubleshooting

**Q: Users can't access the form**
- Check sharing settings (Anyone with the link can respond)

**Q: Not receiving email notifications**
- Check notification rules in Google Sheets
- Check spam folder

**Q: Too many spam responses**
- Enable "Limit to 1 response per user"
- Require sign-in to Google account (not recommended for public beta)

**Q: Responses not saving**
- Check Google Sheets connection
- Recreate the sheet link if broken

---

## Security & Privacy

- **Don't collect sensitive data** (passwords, personal info)
- **GDPR compliance:** Add privacy notice in form description
- **Data retention:** Delete old responses after beta ends (optional)
- **Access control:** Limit who can view responses

---

## Next Steps

After creating the forms:

1. ✅ Test all forms thoroughly
2. ✅ Update BetaInfoScreen.tsx with actual links
3. ✅ Set up email notifications
4. ✅ Share access with team
5. ✅ Create response tracking workflow
6. ✅ Commit code changes
7. ✅ Announce forms to beta testers

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Status:** Phase 222 - Implementation Guide
