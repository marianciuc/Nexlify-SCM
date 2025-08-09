#!/usr/bin/env node

/**
 * Watcher для автоматической генерации типов при изменении файлов переводов
 */

const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');

const LOCALES_DIR = path.join(__dirname, '../public/locales');

console.log('🔍 Запуск watcher для файлов переводов...');
console.log(`📁 Отслеживаемая директория: ${LOCALES_DIR}`);

// Функция для запуска генерации типов
const generateTypes = () => {
    console.log('🔄 Обнаружены изменения, генерируем типы...');

    const child = spawn('node', [path.join(__dirname, 'generate-translation-types.cjs')], {
        stdio: 'inherit',
    });

    child.on('close', code => {
        if (code === 0) {
            console.log('✅ Типы успешно обновлены');
        } else {
            console.error('❌ Ошибка при генерации типов');
        }
    });
};

// Настройка watcher
const watcher = fs.watch(LOCALES_DIR, {recursive: true}, (eventType, filename) => {
    if (filename && filename.endsWith('.json')) {
        console.log(`📝 ${eventType}: ${filename}`);
        // Добавляем небольшую задержку для предотвращения множественных вызовов
        clearTimeout(watcher.debounceTimer);
        watcher.debounceTimer = setTimeout(generateTypes, 500);
    }
});

// Генерируем типы при запуске
generateTypes();

console.log('✅ Watcher активен. Нажмите Ctrl+C для остановки.');

process.on('SIGINT', () => {
    console.log('\n👋 Остановка watcher...');
    watcher.close();
    process.exit(0);
});
