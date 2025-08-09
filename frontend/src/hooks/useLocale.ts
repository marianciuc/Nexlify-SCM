import {useTranslation} from 'react-i18next';

import {type Locale, type TranslationPath} from '../types/generated-locale';

// Типизированный хук для переводов
export const useLocale = () => {
    const {t: originalT, i18n} = useTranslation();

    // Типизированная функция перевода
    const t = (key: TranslationPath, options?: Record<string, unknown>) => {
        return originalT(key, options);
    };

    // Функция для смены языка
    const setLocale = (locale: Locale) => {
        i18n.changeLanguage(locale);
    };

    // Текущая локаль
    const locale = i18n.language as Locale;

    // Состояние загрузки
    const isLoading = !i18n.isInitialized;

    return {
        t,
        locale,
        setLocale,
        isLoading,
    };
};

// Хук для получения доступных языков
export const useAvailableLocales = () => {
    const {i18n} = useTranslation();
    const supportedLngs = i18n.options.supportedLngs;

    if (!supportedLngs || !Array.isArray(supportedLngs)) {
        return [];
    }

    return supportedLngs.filter((lng: string) => lng !== 'cimode') as Locale[];
};
