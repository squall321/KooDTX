/**
 * useTranslation Hook
 * Phase 199: i18n hook for components
 *
 * Usage:
 *   const { t } = useTranslation();
 *   <Text>{t.common.save}</Text>
 */

import { getTranslations, getCurrentLanguage, type I18nStrings } from '../i18n';

export const useTranslation = () => {
  const t = getTranslations();
  const currentLang = getCurrentLanguage();

  return {
    t,
    currentLang,
  };
};

export default useTranslation;
