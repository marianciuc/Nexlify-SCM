import type {InitOptions} from 'i18next';

// Конфигурация для i18next
export const i18nConfig: InitOptions = {
    // Основной язык (fallback)
    fallbackLng: 'en',

    // Поддерживаемые языки
    supportedLngs: ['en', 'ru', 'cn'],

    // Настройки определения языка
    detection: {
        // Порядок определения языка
        order: ['localStorage', 'navigator', 'htmlTag'],

        // Ключ для сохранения в localStorage
        lookupLocalStorage: 'i18nextLng',

        // Где сохранять выбранный язык
        caches: ['localStorage'],

        // Исключаем cookies для безопасности
        excludeCacheFor: ['cimode'],
    },

    // Настройки интерполяции
    interpolation: {
        // React уже экранирует значения
        escapeValue: false,
    },

    // Настройки React интеграции
    react: {
        // Отключаем Suspense для стабильности
        useSuspense: false,
    },

    // Дебаг в разработке
    debug: process.env.NODE_ENV === 'development',

    // Настройки загрузки
    load: 'languageOnly', // загружаем только язык, не регион

    // Разделитель для вложенных ключей
    keySeparator: '.',

    // Разделитель для пространств имен
    nsSeparator: ':',

    // Стандартное пространство имен
    defaultNS: 'translation',
};
