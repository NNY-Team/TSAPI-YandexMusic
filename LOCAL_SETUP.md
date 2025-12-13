# 🔗 Локальное использование библиотеки

Несколько способов использовать библиотеку в своих проектах без опубликования в npm.

## 📋 Содержание

1. [Способ 1: npm link (рекомендуется)](#способ-1-npm-link)
2. [Способ 2: Локальный путь в package.json](#способ-2-локальный-путь)
3. [Способ 3: Прямое подключение файлов](#способ-3-прямое-подключение)

---

## Способ 1: npm link (рекомендуется)

Самый удобный способ. Позволяет использовать библиотеку как установленный пакет.

### Шаг 1: Собрать библиотеку

```bash
cd D:\TSAPI-YandexMusic
npm run build
```

### Шаг 2: Линковать глобально

```bash
npm link
```

Это создаст глобальную ссылку на твою библиотеку.

### Шаг 3: Использовать в своем проекте

В своем проекте:

```bash
npm link yandex-music-api-ts
```

### Шаг 4: Импортировать

```typescript
import { YandexMusicClient } from 'yandex-music-api-ts';

const client = new YandexMusicClient('твой-токен');
```

### ✅ Преимущества:
- ✓ Обычный импорт как из npm
- ✓ Изменения видны автоматически (если использовать `npm run dev`)
- ✓ Удобно для разработки

### ❌ Минусы:
- Нужно запустить `npm link` один раз

---

## Способ 2: Локальный путь в package.json

Если не хочешь возиться с `npm link`.

### Шаг 1: Собрать библиотеку

```bash
npm run build
```

### Шаг 2: В своем проекте, в `package.json`:

```json
{
  "dependencies": {
    "yandex-music-api-ts": "file:../TSAPI-YandexMusic"
  }
}
```

Или с абсолютным путем:

```json
{
  "dependencies": {
    "yandex-music-api-ts": "file:D:/TSAPI-YandexMusic"
  }
}
```

### Шаг 3: Установить зависимости

```bash
npm install
```

### Шаг 4: Импортировать

```typescript
import { YandexMusicClient } from 'yandex-music-api-ts';
```

### ✅ Преимущества:
- ✓ Легко переключить на npm версию позже
- ✓ Работает независимо от проекта

### ❌ Минусы:
- Нужно пересчитывать путь для каждого проекта
- Нужно переустановить после изменений

---

## Способ 3: Прямое подключение файлов

Для быстрого тестирования без npm.

### Вариант 3a: Использовать dist файлы

```typescript
import { YandexMusicClient } from '../TSAPI-YandexMusic/dist/index.js';
```

### Вариант 3b: Использовать исходные файлы (ESM)

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "Node",
    "allowImportingTsExtensions": true
  }
}
```

```typescript
import { YandexMusicClient } from '../TSAPI-YandexMusic/src/index.ts';
```

### ✅ Преимущества:
- ✓ Без дополнительной настройки
- ✓ Разработка без build

### ❌ Минусы:
- ✗ Сложнее портировать
- ✗ Нет type definitions

---

## 🎯 Рекомендуемый способ для разработки

**Способ 1 (npm link)** - лучше всего.

### Полная инструкция:

1. **В папке TSAPI-YandexMusic:**

```bash
npm run build
npm link
npm run dev  # Запустить watch режим для автосборки
```

2. **В папке твоего проекта:**

```bash
npm link yandex-music-api-ts
```

3. **В файле проекта:**

```typescript
import { YandexMusicClient } from 'yandex-music-api-ts';

const client = new YandexMusicClient(process.env.YANDEX_MUSIC_TOKEN);

// Использовать как обычно
const search = await client.search.search('Dua Lipa');
console.log(search);
```

### 📝 Пример .env:

```env
YANDEX_MUSIC_TOKEN=y0_AgAAAABS_I6NAAG8XgAAAADQVzIcwCqLug5tSw6P_*******-******
```

---

## 🔄 Удалить линк (если нужно)

```bash
# В папке проекта
npm unlink yandex-music-api-ts

# В папке TSAPI-YandexMusic (опционально)
npm unlink
```

---

## ✅ Проверка работы

После настройки, создай файл `test-local.ts`:

```typescript
import { YandexMusicClient } from 'yandex-music-api-ts';

const token = process.env.YANDEX_MUSIC_TOKEN;
if (!token) {
  console.error('❌ Токен не найден в .env');
  process.exit(1);
}

const client = new YandexMusicClient(token);

(async () => {
  try {
    const status = await client.account.getStatus();
    console.log('✅ Подключение успешно!');
    console.log('👤 Пользователь:', status.account.login);
  } catch (error) {
    console.error('❌ Ошибка подключения:', error);
  }
})();
```

Запусти:

```bash
$env:YANDEX_MUSIC_TOKEN='твой-токен'
npx ts-node test-local.ts
```

Результат:

```
✅ Подключение успешно!
👤 Пользователь: y0u44ck
```

---

## 🚀 Быстрый старт

```bash
# 1. Собрать библиотеку
npm run build

# 2. Линковать глобально
npm link

# 3. В своем проекте
npm link yandex-music-api-ts

# 4. Импортировать в коде
import { YandexMusicClient } from 'yandex-music-api-ts';
```

Готово! 🎉
