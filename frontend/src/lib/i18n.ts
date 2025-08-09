import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';

import {SUPPORTED_LOCALES, type Locale} from '../types/generated-locale';

import {i18nConfig} from './i18n-config';

// Функция для динамической загрузки переводов
const loadTranslations = async (locale: Locale) => {
    try {
        const response = await fetch(`/locales/${locale}/translation.json`);
        if (!response.ok) {
            throw new Error(`Failed to load translations for ${locale}`);
        }
        return await response.json();
    } catch (error) {
        console.warn(`Failed to load translations for ${locale}:`, error);
        // Возвращаем пустой объект в случае ошибки
        return {};
    }
};

// Создаем ресурсы для i18next
const createResources = async () => {
    const resources: Record<Locale, { translation: any }> = {} as any;

    await Promise.all(
        SUPPORTED_LOCALES.map(async locale => {
            const translations = await loadTranslations(locale);
            resources[locale] = {translation: translations};
        })
    );

    return resources;
};

// Инициализация i18next
export const initI18n = async () => {
    const resources = await createResources();
    await i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            ...i18nConfig,
            resources,
        });

    return i18n;
};

export default i18n;
