/**
 * Beta Testing Links Configuration
 * Phase 221: Beta tester recruitment links
 *
 * ⚠️ IMPORTANT: Update these links before Phase 223 (Internal Beta)
 *
 * Setup Instructions:
 * 1. TestFlight: Create app in App Store Connect → TestFlight → Get link
 * 2. Google Play: Upload APK to Internal Testing → Copy join link
 * 3. Google Forms: Create forms using GOOGLE_FORMS_SETUP_GUIDE.md
 * 4. Discord: Create server → Create invite link (no expiration)
 */

export interface BetaLinks {
  /**
   * iOS TestFlight join link
   * Format: https://testflight.apple.com/join/XXXXXXXX
   *
   * Setup:
   * - App Store Connect → My Apps → Your App → TestFlight
   * - Internal Testing or External Testing → Public Link
   */
  testFlight: string;

  /**
   * Android Google Play Internal Testing link
   * Format: https://play.google.com/apps/internaltest/XXXXXXXXXXXX
   *
   * Setup:
   * - Google Play Console → Your App → Testing → Internal testing
   * - Create new release → Copy "Copy link" from testers tab
   */
  playStoreInternalTest: string;

  /**
   * General feedback Google Form
   *
   * Setup:
   * - Follow GOOGLE_FORMS_SETUP_GUIDE.md
   * - Create form using BETA_FEEDBACK_TEMPLATE.md
   * - Form → Send → Get shortened link (forms.gle/XXXXX)
   */
  feedbackForm: string;

  /**
   * Bug report Google Form
   *
   * Setup:
   * - Follow GOOGLE_FORMS_SETUP_GUIDE.md
   * - Create form using BETA_BUG_REPORT_TEMPLATE.md
   * - Form → Send → Get shortened link (forms.gle/XXXXX)
   */
  bugReportForm: string;

  /**
   * Feature request Google Form
   *
   * Setup:
   * - Follow GOOGLE_FORMS_SETUP_GUIDE.md
   * - Create form using BETA_FEATURE_REQUEST_TEMPLATE.md
   * - Form → Send → Get shortened link (forms.gle/XXXXX)
   */
  featureRequestForm: string;

  /**
   * Discord community server invite
   *
   * Setup:
   * - Create Discord server
   * - Create invite link: Server Settings → Invites → Create Invite
   * - Set to never expire
   * - Format: https://discord.gg/XXXXXXXX
   */
  discordInvite: string;
}

/**
 * Beta testing links
 *
 * ⚠️ TODO: Update all links before starting Phase 223 (Internal Beta)
 *
 * Current status: PLACEHOLDER - Not ready for production
 */
export const betaLinks: BetaLinks = {
  // iOS TestFlight
  testFlight: 'https://testflight.apple.com/join/YOUR_TESTFLIGHT_CODE',

  // Android Google Play Internal Testing
  playStoreInternalTest: 'https://play.google.com/apps/internaltest/YOUR_TESTING_TRACK',

  // Google Forms
  feedbackForm: 'https://forms.gle/YOUR_FEEDBACK_FORM',
  bugReportForm: 'https://forms.gle/YOUR_BUG_REPORT_FORM',
  featureRequestForm: 'https://forms.gle/YOUR_FEATURE_REQUEST_FORM',

  // Discord
  discordInvite: 'https://discord.gg/YOUR_DISCORD_INVITE',
};

/**
 * Check if beta links are configured
 * Returns false if any link contains placeholder text
 */
export const areBetaLinksConfigured = (): boolean => {
  const links = Object.values(betaLinks);
  return !links.some(link =>
    link.includes('YOUR_') ||
    link.includes('PLACEHOLDER')
  );
};

/**
 * Get missing beta link keys
 * Returns array of link keys that are not configured
 */
export const getMissingBetaLinks = (): Array<keyof BetaLinks> => {
  const missing: Array<keyof BetaLinks> = [];

  (Object.keys(betaLinks) as Array<keyof BetaLinks>).forEach(key => {
    const link = betaLinks[key];
    if (link.includes('YOUR_') || link.includes('PLACEHOLDER')) {
      missing.push(key);
    }
  });

  return missing;
};

/**
 * Development/Testing mode links
 * These are example links that won't work but prevent errors during development
 */
export const devBetaLinks: BetaLinks = {
  testFlight: 'https://testflight.apple.com',
  playStoreInternalTest: 'https://play.google.com/console',
  feedbackForm: 'https://forms.google.com',
  bugReportForm: 'https://forms.google.com',
  featureRequestForm: 'https://forms.google.com',
  discordInvite: 'https://discord.com',
};

/**
 * Get beta links based on environment
 * In development, returns safe placeholder links
 * In production, returns configured links
 */
export const getBetaLinks = (): BetaLinks => {
  if (__DEV__) {
    // In development, use dev links to prevent accidental opens
    return devBetaLinks;
  }

  // In production, validate links are configured
  if (!areBetaLinksConfigured()) {
    console.warn(
      '[Beta Links] Some beta links are not configured:',
      getMissingBetaLinks()
    );
  }

  return betaLinks;
};
