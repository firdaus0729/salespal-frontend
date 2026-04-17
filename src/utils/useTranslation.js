import { usePreferences } from '../context/PreferencesContext';
import { t } from './i18n';

/**
 * React hook for translations.
 * Usage:
 *   const { translate } = useTranslation();
 *   translate('nav.dashboard')  // → 'Dashboard' or translated string
 */
export function useTranslation() {
    const { preferences } = usePreferences();
    return {
        translate: (keyPath) => t(preferences.language, keyPath),
        lang: preferences.language,
    };
}
