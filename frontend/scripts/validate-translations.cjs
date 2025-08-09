#!/usr/bin/env node

/**
 * Валидатор переводов - проверяет соответствие ключей во всех языках
 */

console.log('🚀 Запуск валидатора переводов...');

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../public/locales');

// Функция для рекурсивного получения всех ключей
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

    return keys.sort();
}

// Функция для загрузки переводов из файла
function loadTranslations(locale) {
    const filePath = path.join(LOCALES_DIR, locale, 'translation.json');

    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`❌ Ошибка парсинга ${filePath}:`, error.message);
        return null;
    }
}

// Основная функция валидации
function validateTranslations() {
    console.log('🔍 Валидация переводов...\n');

    // Получаем список доступных локалей
    const locales = fs.readdirSync(LOCALES_DIR).filter(item => {
        return fs.statSync(path.join(LOCALES_DIR, item)).isDirectory();
    });

    if (locales.length === 0) {
        console.error('❌ Не найдено ни одной локали');
        process.exit(1);
    }

    console.log(`📍 Найдены локали: ${locales.join(', ')}\n`);

    // Загружаем переводы для всех локалей
    const translations = {};
    const allKeys = {};

    for (const locale of locales) {
        const translation = loadTranslations(locale);
        if (!translation) {
            console.error(`❌ Не удалось загрузить переводы для ${locale}`);
            continue;
        }

        translations[locale] = translation;
        allKeys[locale] = getKeysRecursively(translation);

        console.log(`✅ ${locale}: ${allKeys[locale].length} ключей`);
    }

    console.log();

    // Определяем эталонную локаль (обычно английский)
    const referenceLocale = locales.includes('en') ? 'en' : locales[0];
    const referenceKeys = allKeys[referenceLocale];

    console.log(`📋 Эталонная локаль: ${referenceLocale} (${referenceKeys.length} ключей)\n`);

    let hasErrors = false;

    // Проверяем каждую локаль
    for (const locale of locales) {
        if (locale === referenceLocale) continue;

        const currentKeys = allKeys[locale];
        const missingKeys = referenceKeys.filter(key => !currentKeys.includes(key));
        const extraKeys = currentKeys.filter(key => !referenceKeys.includes(key));

        console.log(`🔍 Проверка ${locale}:`);

        if (missingKeys.length > 0) {
            hasErrors = true;
            console.log(`  ❌ Отсутствуют ключи (${missingKeys.length}):`);
            missingKeys.forEach(key => console.log(`    - ${key}`));
        }

        if (extraKeys.length > 0) {
            hasErrors = true;
            console.log(`  ⚠️  Лишние ключи (${extraKeys.length}):`);
            extraKeys.forEach(key => console.log(`    + ${key}`));
        }

        if (missingKeys.length === 0 && extraKeys.length === 0) {
            console.log(`  ✅ Соответствует эталону`);
        }

        console.log();
    }

    // Проверяем на пустые значения
    console.log('🔍 Проверка пустых значений:\n');

    for (const locale of locales) {
        const emptyKeys = [];

        function checkEmpty(obj, prefix = '') {
            for (const [key, value] of Object.entries(obj)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;

                if (typeof value === 'object' && value !== null) {
                    checkEmpty(value, fullKey);
                } else if (!value || value.trim() === '') {
                    emptyKeys.push(fullKey);
                }
            }
        }

        checkEmpty(translations[locale]);

        if (emptyKeys.length > 0) {
            hasErrors = true;
            console.log(`❌ ${locale} - пустые значения (${emptyKeys.length}):`);
            emptyKeys.forEach(key => console.log(`  - ${key}`));
        } else {
            console.log(`✅ ${locale} - пустых значений не найдено`);
        }
    }

    console.log();

    // Итоговый результат
    if (hasErrors) {
        console.log('❌ Валидация не пройдена. Исправьте ошибки выше.');
        process.exit(1);
    } else {
        console.log('✅ Валидация успешно пройдена! Все переводы корректны.');
        process.exit(0);
    }
}

// Запускаем валидацию
validateTranslations();
