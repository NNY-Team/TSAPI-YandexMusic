# 🎵 Полный проект: Проигрыватель Яндекс Музыки

В этом репозитории находятся:

1. **Библиотека API** (`src/`) - TypeScript API обертка для Яндекс Музыки
2. **Пример приложения** (`cult/`) - Готовый Electron проигрыватель

## 📚 Структура репозитория

```
TSAPI-YandexMusic/
├── src/                           # 📦 Основная библиотека API
│   ├── api/                       # 12 API классов (50+ методов)
│   ├── auth/                      # OAuth и управление токеном
│   ├── models/                    # TypeScript интерфейсы
│   ├── utils/                     # Утилиты (обложки, логирование)
│   └── index.ts                   # Main export
├── dist/                          # 📤 Скомпилированные файлы
│   ├── index.js (ESM)
│   ├── index.mjs (CJS)
│   └── index.d.ts (TypeScript)
├── cult/                          # 🎮 Готовое приложение
│   ├── electron/                  # Electron процессы
│   ├── src/                       # React компоненты
│   └── README.md                  # Документация приложения
│
├── README.md                      # Главная документация
├── API_GUIDE.md                   # Полный API справочник
├── LOCAL_SETUP.md                 # Локальное использование
├── QUICKSTART.md                  # Быстрый старт
└── SETUP.md                       # Этот файл
```

## 🚀 Быстрый старт

### Опция 1: Использовать готовое приложение (проигрыватель)

```bash
# 1. Соберите библиотеку
npm run build
npm link
npm run dev

# 2. В новом терминале перейдите в папку приложения
cd cult

# 3. Установите зависимости и запустите
npm install
npm run dev
```

Подробнее: [cult/SETUP.md](./cult/SETUP.md)

### Опция 2: Использовать библиотеку в своем проекте

```bash
# 1. Соберите библиотеку
npm run build
npm link

# 2. В своем проекте
npm link yandex-music-api-ts

# 3. Импортируйте
import { YandexMusicClient } from 'yandex-music-api-ts';
```

Подробнее: [LOCAL_SETUP.md](./LOCAL_SETUP.md)

## 📦 Что находится в библиотеке

### API Классы (12 классов, 50+ методов)

| Класс | Методы | Пример |
|-------|--------|--------|
| **Account** | getStatus, getSettings, updateSettings, consumePromoCode | `client.account.getStatus()` |
| **Search** | search, searchTracks, searchAlbums, suggest | `client.search.search('Dua Lipa')` |
| **Tracks** | getMany, get, getLyrics, getAllLikedTracks, likeTracks | `client.tracks.getMany(['123', '456'])` |
| **Radio** | getStations, getStationTracks, sendFeedback, getStationInfo | `client.radio.getStations()` |
| **Playlists** | getList, get, create, addTracks, rename, delete | `client.playlists.getList()` |
| **Albums** | get, getWithTracks, getMany | `client.albums.get('123')` |
| **Artists** | getPopularTracks, getTracks, getAlbums | `client.artists.getPopularTracks('123')` |
| **Landing** | getLanding, getNewReleases, getChart, getGenres | `client.landing.getChart()` |
| **Feed** | getFeed | `client.feed.getFeed()` |
| **Queues** | getQueues, getQueue, updatePosition | `client.queues.getQueues()` |
| **Tags** | getPlaylistsByTag | `client.tags.getPlaylistsByTag('pop')` |
| **Users** | getInfo | `client.users.getInfo('12345')` |

### Утилиты

- **coverUtils**: Преобразование URL обложек (10 размеров: 30-1000px)
- **ErrorLogger**: Логирование ошибок
- **TraceSource**: Трассировка выполнения
- **ElectronOAuth**: OAuth авторизация для Electron

## 🎵 Проигрыватель (cult/)

### Возможности

✅ OAuth авторизация через Яндекс  
✅ Загрузка популярных треков  
✅ Отображение обложек  
✅ Информация о исполнителях и альбомах  
✅ Управление громкостью  
✅ Красивый интерфейс  
✅ Сохранение токена между сеансами  

### Компоненты

- **Header** - Поиск и информация о пользователе
- **Sidebar** - Меню навигации
- **MainContent** - Отображение треков из API
- **Player** - Управление воспроизведением

### Технологии

- Electron 33
- React 18
- TypeScript 5.4
- Vite 5
- Tailwind CSS

Подробнее: [cult/README.md](./cult/README.md)

## 📚 Документация

| Файл | Назначение |
|------|-----------|
| [README.md](./README.md) | Главная документация, overview |
| [QUICKSTART.md](./QUICKSTART.md) | Быстрый старт для разработчиков |
| [API_GUIDE.md](./API_GUIDE.md) | Полный справочник всех API методов |
| [LOCAL_SETUP.md](./LOCAL_SETUP.md) | Как использовать библиотеку локально |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Статус проекта, тестирование |
| [cult/README.md](./cult/README.md) | Документация приложения |
| [cult/SETUP.md](./cult/SETUP.md) | Инструкция по запуску приложения |

## 🔧 Примеры использования

### Пример 1: Получение популярных треков

```typescript
import { YandexMusicClient } from 'yandex-music-api-ts';

const token = 'y0_...'; // Получить через OAuth
const client = new YandexMusicClient(token);

// Получить популярные треки
const landing = await client.landing.getChart();
const tracks = landing.chart?.tracks || [];

tracks.forEach(track => {
  console.log(`${track.title} - ${track.artists[0]?.name}`);
});
```

### Пример 2: Поиск музыки

```typescript
const searchResults = await client.search.search('Dua Lipa', 'all');

console.log(`Найдено:
  - Треков: ${searchResults.tracks?.length}
  - Альбомов: ${searchResults.albums?.length}
  - Исполнителей: ${searchResults.artists?.length}
`);
```

### Пример 3: Работа с плейлистами

```typescript
// Получить все плейлисты
const playlists = await client.playlists.getList();

// Создать новый плейлист
const newPlaylist = await client.playlists.create('Моя музыка');

// Добавить треки
await client.playlists.addTracks(
  newPlaylist.id,
  newPlaylist.uuid,
  ['track_id_1', 'track_id_2']
);
```

### Пример 4: Обложки с разными размерами

```typescript
import { getCoverUrl } from 'yandex-music-api-ts';

const track = { coverUri: 'avatars.yandex.net/...' };

// Получить обложку разных размеров
const small = getCoverUrl(track.coverUri, 100);
const medium = getCoverUrl(track.coverUri, 200);
const large = getCoverUrl(track.coverUri, 500);

console.log(`
  Маленькая: ${small}
  Средняя: ${medium}
  Большая: ${large}
`);
```

## ✅ Статус проекта

### Реализация

- ✅ **12 API классов** - все основные домены API
- ✅ **50+ методов** - 89% покрытие API
- ✅ **TypeScript** - полная типизация
- ✅ **ESM + CJS** - поддержка оба формата
- ✅ **OAuth** - авторизация через Яндекс
- ✅ **Тестирование** - 16/16 тестов пройдено (100%)
- ✅ **Документация** - полная документация на English и Russian
- ✅ **Пример приложения** - готовый Electron проигрыватель

### Тестирование

```
✓ Passed: 16/16 (100%)
✗ Failed: 0

Key Tests:
✓ Account API (getStatus, getSettings)
✓ Search API (search, searchTracks, suggest)
✓ Tracks API (getMany, getLyrics, likeTracks)
✓ Radio API (getStations, getStationTracks)
✓ Playlists API (getList, create, addTracks)
✓ Albums API (get, getWithTracks)
✓ Artists API (getPopularTracks)
✓ Landing API (getChart, getGenres)
✓ Feed API (getFeed)
✓ Energy parameter detection
✓ Cover URL transformation
```

## 🎯 Что дальше

### Для разработчиков

1. **Использовать библиотеку в своем проекте**
   - Смотрите [LOCAL_SETUP.md](./LOCAL_SETUP.md)
   - Следуйте примерам в [API_GUIDE.md](./API_GUIDE.md)

2. **Расширить приложение**
   - Добавить плеер с реальным воспроизведением
   - Реализовать поиск
   - Добавить радио
   - Управление плейлистами

3. **Экспортировать как npm пакет**
   ```bash
   npm publish
   ```

### Для пользователей

1. **Запустить приложение**
   ```bash
   cd cult
   npm install
   npm run dev
   ```

2. **Собрать установщик**
   ```bash
   npm run build
   ```

## 🤝 Вклад

Улучшения приветствуются!

- 🐛 報告ошибки через Issues
- 💡 Предложите новые функции
- 📝 Улучшайте документацию
- ✨ Создавайте Pull Requests

## 📝 Лицензия

LGPL-2.1

## 🔗 Ссылки

- [Яндекс Музыка](https://music.yandex.ru)
- [Electron](https://www.electronjs.org)
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [TypeScript](https://www.typescriptlang.org)

---

## 📞 Технический стек

| Компонент | Технология | Версия |
|-----------|-----------|--------|
| **Язык** | TypeScript | 5.9.3 |
| **HTTP Client** | Axios | 1.6.2 |
| **Build** | tsup | 8.5.1 |
| **Формат** | ESM + CJS + DTS | - |
| **Desktop** | Electron | 33.2.0 |
| **UI Framework** | React | 18.3.1 |
| **Build Tool** | Vite | 5.4.11 |
| **CSS** | Tailwind | 3.4.15 |
| **Testing** | Vitest | 2.1.5 |

---

Made with ❤️ for Yandex Music API lovers

**Последнее обновление**: Декабрь 2025
