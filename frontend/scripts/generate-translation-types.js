#!/usr/bin/env node

/**
 * Скрипт для автоматической генерации типов TypeScript из файлов переводов
 * Запуск: node scripts/generate-translation-types.js
 */

console.log('🔄 Генерация типов для переводов...');

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../public/locales');
const TYPES_OUTPUT = path.join(__dirname, '../src/types/generated-locale.ts');

// Функция для рекурсивного получения всех ключей из объекта
function getKeysRecursively(obj, prefix = '') {
    let keys = [];

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            keys = keys.concat(getKeysRecursively(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }

    return keys;
}

// Функция для создания TypeScript интерфейса из объекта
function createInterfaceFromObject(obj, interfaceName = 'TranslationKeys', depth = 0) {
    const indent = '  '.repeat(depth);
    let result = `${indent}export interface ${interfaceName} {\n`;

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const subInterfaceName = `${interfaceName}_${key.charAt(0).toUpperCase() + key.slice(1)}`;
            result += `${indent}  ${key}: ${subInterfaceName};\n`;
        } else {
            result += `${indent}  ${key}: string;\n`;
        }
    }

    result += `${indent}}\n\n`;

    // Добавляем интерфейсы для вложенных объектов
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const subInterfaceName = `${interfaceName}_${key.charAt(0).toUpperCase() + key.slice(1)}`;
            result = createInterfaceFromObject(value, subInterfaceName, depth) + result;
        }
    }

    return result;
}

// Функция для создания union типа для путей переводов
function createTranslationPathType(keys) {
    const paths = keys.map(key => `'${key}'`).join(' | ');
    return `export type TranslationPath = ${paths};\n\n`;
}

// Основная функция
function generateTypes() {
    try {
        console.log('🔄 Генерация типов для переводов...');

        // Читаем основной файл переводов (английский как эталон)
        const enTranslationPath = path.join(LOCALES_DIR, 'en/translation.json');

        if (!fs.existsSync(enTranslationPath)) {
            throw new Error(`Файл ${enTranslationPath} не найден`);
        }

        const enTranslations = JSON.parse(fs.readFileSync(enTranslationPath, 'utf8'));

        // Получаем все ключи
        const translationKeys = getKeysRecursively(enTranslations);

        // Создаем содержимое файла типов
        let content = `// Автоматически сгенерированные типы для переводов
// НЕ РЕДАКТИРОВАТЬ ВРУЧНУЮ - файл перезаписывается автоматически

`;

        // Добавляем интерфейсы
        content += createInterfaceFromObject(enTranslations);

        // Добавляем тип для путей переводов
        content += createTranslationPathType(translationKeys);

        // Добавляем типы локалей
        const locales = fs.readdirSync(LOCALES_DIR).filter(item => {
            return fs.statSync(path.join(LOCALES_DIR, item)).isDirectory();
        });

        content += `export type Locale = ${locales.map(l => `'${l}'`).join(' | ')};\n\n`;
        content += `export const SUPPORTED_LOCALES: Locale[] = [${locales.map(l => `'${l}'`).join(', ')}];\n\n`;

        // Добавляем названия локалей
        const localeNames = {
            en: 'English',
            ru: 'Русский',
            cn: '中文',
        };

        content += `export const LOCALE_NAMES: Record<Locale, string> = {\n`;
        locales.forEach(locale => {
            const name = localeNames[locale] || locale.toUpperCase();
            content += `  ${locale}: '${name}',\n`;
        });
        content += `} as const;\n\n`;

        content += `export const DEFAULT_LOCALE: Locale = 'en';\n\n`;

        // Добавляем типизированную функцию перевода
        content += `export type TFunction = (key: TranslationPath, options?: any) => string;\n\n`;

        // Добавляем контекст локализации
        content += `export interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
  isLoading: boolean;
}\n`;

        // Записываем файл
        fs.writeFileSync(TYPES_OUTPUT, content, 'utf8');

        console.log('✅ Типы успешно сгенерированы:', TYPES_OUTPUT);
        console.log(`📊 Найдено ${translationKeys.length} ключей переводов`);
        console.log(`🌍 Поддерживаемые локали: ${locales.join(', ')}`);
    } catch (error) {
        console.error('❌ Ошибка при генерации типов:', error.message);
        process.exit(1);
    }
}

// Запускаем генерацию
generateTypes();
