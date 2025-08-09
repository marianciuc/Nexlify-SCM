// Переэкспорт сгенерированных типов для обратной совместимости
export * from './generated-locale';
import type {Locale} from './generated-locale';

// Дополнительные типы, если понадобятся в будущем
export interface LocaleConfig {
    code: Locale;
    name: string;
    flag?: string;
    rtl?: boolean;
}

// Тип для валидации ключей переводов во время разработки
export type ValidateTranslationKeys<T> =
    T extends Record<string, unknown>
        ? {
            [K in keyof T]: T[K] extends string
                ? string
                : T[K] extends Record<string, unknown>
                    ? ValidateTranslationKeys<T[K]>
                    : never;
        }
        : never;
