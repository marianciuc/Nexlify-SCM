# Система локализации

Этот проект использует типизированную систему локализации с автоматической генерацией типов TypeScript.

## Возможности

- ✅ **Полная типизация** - автокомплит и проверка ключей переводов
- ✅ **Автоматическая генерация типов** из JSON файлов переводов
- ✅ **Hot reload** - автообновление типов при изменении переводов
- ✅ **Множественные языки** - поддержка EN, RU, CN
- ✅ **React компоненты** для переключения языков
- ✅ **Вложенные ключи** с полной типизацией

## Структура файлов

```
public/locales/
├── en/
│   └── translation.json    # Английские переводы (эталон)
├── ru/
│   └── translation.json    # Русские переводы
└── cn/
    └── translation.json    # Китайские переводы

scripts/
├── generate-translation-types.cjs  # Генератор типов
└── watch-translations.cjs         # Watcher для hot reload

src/types/
├── generated-locale.ts     # Автогенерированные типы (НЕ РЕДАКТИРОВАТЬ)
└── locale.ts              # Дополнительные типы

src/hooks/
└── useLocale.ts           # Типизированный хук для переводов

src/components/
├── LanguageSwitcher.tsx    # Компонент переключения языков
└── TranslationExample.tsx  # Пример использования
```

## Использование

### Базовое использование

```tsx
import {useLocale} from '../hooks/useLocale';

function MyComponent() {
    const {t, locale, setLocale} = useLocale();

    return (
        <div>
            <p>{t('menu.dashboard')}</p>
            <p>{t('menu.settingsMenu.profile')}</p>
            <button onClick={() => setLocale('ru')}>Переключить на русский</button>
        </div>
    );
}
```

### Компонент переключения языков

```tsx
import {LanguageSwitcher} from './components/LanguageSwitcher';

function Header() {
    return (
        <header>
            <LanguageSwitcher/>
        </header>
    );
}
```

## Команды

```bash
# Генерация типов
pnpm generate:locale-types

# Запуск watcher для автогенерации
pnpm watch:locale-types

# Запуск dev сервера
pnpm dev
```

## Добавление новых переводов

1. **Добавьте ключ в основной файл** (`public/locales/en/translation.json`):

```json
{
  "menu": {
    "newItem": "New Item"
  }
}
```

2. **Переведите во всех языках** (`ru/translation.json`, `cn/translation.json`):

```json
{
  "menu": {
    "newItem": "Новый элемент"
  }
}
```

3. **Типы обновятся автоматически** (если запущен watcher)

4. **Используйте новый ключ** с полной типизацией:

```tsx
const text = t('menu.newItem'); // ✅ Типизировано
```

## Добавление нового языка

1. Создайте директорию: `public/locales/{код_языка}/`
2. Добавьте файл: `translation.json` с переводами
3. Запустите: `pnpm generate:locale-types`
4. Новый язык автоматически появится в типах и компонентах

## Валидация

Система автоматически:

- Проверяет соответствие ключей во всех языках
- Генерирует union типы для всех доступных ключей
- Обеспечивает типобезопасность во время компиляции

## Преимущества

1. **TypeScript интеграция** - полная типизация без ошибок рантайма
2. **Developer Experience** - автокомплит и проверка ключей
3. **Масштабируемость** - легко добавлять новые языки и ключи
4. **Производительность** - статическая генерация типов
5. **Надежность** - проверка на этапе сборки

## Troubleshooting

### Типы не обновляются

```bash
# Принудительная генерация
pnpm generate:locale-types
```

### Ошибки TypeScript

- Убедитесь, что все языки имеют одинаковую структуру ключей
- Проверьте синтаксис JSON файлов

### Hot reload не работает

```bash
# Перезапустите watcher
pnpm watch:locale-types
```
