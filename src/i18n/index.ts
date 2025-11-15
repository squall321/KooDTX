/**
 * i18n Configuration
 * Phase 199: Internationalization setup
 *
 * Currently supports: Korean (ko)
 * Future expansion: English (en), Japanese (ja), etc.
 */

import ko, { I18nStrings } from './ko';

export type SupportedLanguage = 'ko';

/**
 * Available translations
 */
const translations: Record<SupportedLanguage, I18nStrings> = {
  ko,
};

/**
 * Current language (default: Korean)
 * Future: Load from AsyncStorage user preference
 */
let currentLanguage: SupportedLanguage = 'ko';

/**
 * Get current translations
 */
export const getTranslations = (): I18nStrings => {
  return translations[currentLanguage];
};

/**
 * Set language
 * Future: Save to AsyncStorage
 */
export const setLanguage = (lang: SupportedLanguage) => {
  currentLanguage = lang;
};

/**
 * Get current language
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  return currentLanguage;
};

// Export Korean strings as default for now
export const t = getTranslations();

export { ko };
export type { I18nStrings };
