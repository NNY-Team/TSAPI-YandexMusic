# Yandex Music API - TypeScript библиотека

<<<<<<< HEAD
**НЕ официальная TypeScript библиотека для Yandex Music API** - Создавайте потрясающие музыкальные приложения с полным доступом к 50+ эндпоинтам Яндекс Музыки.
=======
**Не официальная TypeScript библиотека для Yandex Music API** - Создавайте потрясающие музыкальные приложения с полным доступом к 50+ эндпоинтам Яндекс Музыки.
>>>>>>> 07a9715 (first commit)

[![npm version](https://img.shields.io/npm/v/yandex-music-api?style=flat-square)](https://www.npmjs.com/package/yandex-music-api)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**[🇬🇧 English](./README.md) | 🇷🇺 Русский**

## Быстрые ссылки

- 📚 **[Полная документация](#документация)** - Полный справочник API
- 🚀 **[Быстрый старт](#быстрый-старт)** - Установка и первый запрос
- 💡 **[Примеры](#примеры)** - Типичные случаи использования
- 🎵 **[Справочник API](#справочник-api)** - Все 50+ эндпоинтов
- 🤝 **[Помощь](#поддержка)** - Документация и поддержка

---

## Быстрый старт

### Установка

```bash
npm install yandex-music-api
```

### Базовая установка

```typescript
import { YandexMusicClient } from 'yandex-music-api';

// Создаём клиент с OAuth токеном
const client = new YandexMusicClient({ 
  token: process.env.YANDEX_MUSIC_TOKEN 
});

// Получаем текущего пользователя
const account = await client.account.getStatus();
console.log(`Вы вошли как: ${account.account.login}`);
```

### Аутентификация

Вам нужен действительный OAuth токен Яндекс Музыки. Получите его:
- [Yandex OAuth Apps](https://oauth.yandex.com/)
- Используйте scope: `music` для полного доступа к API

Сохраните токен в безопасности:

```bash
# .env
YANDEX_MUSIC_TOKEN=ваш_токен_здесь
```

---

## Документация

### Управление аккаунтом

Управление аккаунтом пользователя и настройками.

#### `getStatus()`

Получить информацию об аккаунте текущего пользователя.

```typescript
const status = await client.account.getStatus();

console.log(status.account.login);        // Логин пользователя
console.log(status.account.uid);          // ID пользователя
console.log(status.subscription?.hasPlus); // Статус премиума
```

**Ответ:**
```typescript
{
  account: {
    uid: number;
    login: string;
    verified: boolean;
    homelocation: string;
  },
  subscription?: {
    hasPlus: boolean;
    canStartTrial: boolean;
  }
}
```

#### `getSettings()`

Получить настройки пользователя.

```typescript
const settings = await client.account.getSettings();
console.log(settings);
```

---

### Поиск

Полнотекстовый поиск по всему музыкальному контенту.

#### `search(text, type?, page?)`

Общий поиск по всем типам контента.

```typescript
const results = await client.search.search('Queen', 'all', 0);

console.log(results.tracks?.results);    // Результаты по трекам
console.log(results.albums?.results);    // Результаты по альбомам
console.log(results.artists?.results);   // Результаты по артистам
console.log(results.playlists?.results); // Результаты по плейлистам
```

#### `searchTracks(text, page?)`

Поиск только треков.

```typescript
const tracks = await client.search.searchTracks('Bohemian Rhapsody');

tracks.results.forEach(track => {
  console.log(`${track.title} - ${track.artists[0].name}`);
});
```

#### `suggest(part)`

Получить предложения поиска.

```typescript
const suggestions = await client.search.suggest('Queen');
console.log(suggestions.suggestions);
```

---

### Треки

Получение информации о треках, ссылок на скачивание, текстов и многого другого.

#### `getMany(trackIds)`

Получить несколько треков.

```typescript
const tracks = await client.tracks.getMany(['1734383:5959892', '2022812:1580547']);

tracks.forEach(track => {
  console.log(`${track.title} от ${track.artists[0].name}`);
});
```

---

### Радио - "Моя волна" и станции

Доступ к персональному радио Яндекс Музыки и жанровым станциям.

#### `getStations()`

Получить все доступные радиостанции.

```typescript
const stations = await client.radio.getStations();

stations.forEach(station => {
  console.log(station.name);
  console.log(station.id.tag);  // Используйте для getStationTracks
});
```

#### `getStationTracks(stationId, settings?)`

Получить треки для радиостанции с персонализацией.

**"Моя волна" (Персональное радио):**

```typescript
const session = await client.radio.getStationTracks('user:onyourwave');

session.sequence.forEach(item => {
  const track = item.track;
  const energy = item.trackParameters?.energy;  // Шкала 0-1
  
  console.log(`${track.title} - Энергия: ${energy}`);
});
```

#### Параметр Energy (Энергия)

Параметр **Energy** (шкала 0-1) представляет интенсивность трека:

```
0.0 - 0.3: Спокойная музыка 🎹
  Классика, амбиент, lo-fi hip-hop

0.3 - 0.6: Средняя 🎸
  Поп, инди, джаз

0.6 - 1.0: Энергичная ⚡
  Электроника, рок, хип-хоп, метал
```

Яндекс Музыка использует Energy + BPM + Hue для персонализации "Моей волны" на основе:
1. Истории прослушивания
2. Обратной связи (лайки/пропуски)
3. Времени дня и контекста

#### `sendFeedback(feedback)`

Отправить отзыв для улучшения рекомендаций.

```typescript
await client.radio.sendFeedback({
  type: 'trackFinished',
  trackId: '1734383:5959892',
  totalPlayedSeconds: 180
});

// Типы: 'radioStarted', 'trackStarted', 'trackFinished', 'skip'
```

#### `skipTrack(batchId, trackId)`

Пропустить текущий трек в радио.

```typescript
await client.radio.skipTrack(batchId, trackId);
```

---

### Плейлисты

Создание, изменение и доступ к плейлистам.

#### `getList(userId)`

Получить все плейлисты пользователя.

```typescript
const playlists = await client.playlists.getList(userId);

playlists.forEach(pl => {
  console.log(`${pl.title} (${pl.trackCount} треков)`);
});
```

#### `create(userId, title, visibility?)`

Создать новый плейлист.

```typescript
const playlist = await client.playlists.create(
  userId,
  'Мой крутой плейлист',
  'public' // или 'private'
);
```

#### `addTracks(userId, kind, trackIds)`

Добавить треки в плейлист.

```typescript
await client.playlists.addTracks(
  userId,
  3,
  ['1734383:5959892', '2022812:1580547']
);
```

#### `removeTracks(userId, kind, positions)`

Удалить треки из плейлиста по позиции.

```typescript
await client.playlists.removeTracks(userId, 3, [0, 2]);
```

---

### Альбомы и исполнители

Получение информации об альбомах и исполнителях.

#### Альбомы

```typescript
// Получить один альбом
const album = await client.albums.get('5959892');

// Получить альбом со всеми треками
const withTracks = await client.albums.getWithTracks('5959892');

// Получить несколько альбомов
const albums = await client.albums.getMany(['5959892', '1580547']);
```

#### Исполнители

```typescript
// Получить популярные треки
const popular = await client.artists.getPopularTracks('2503923');

// Получить все треки
const tracks = await client.artists.getTracks('2503923');

// Получить дискографию
const albums = await client.artists.getAlbums('2503923');

// Получить краткую информацию
const info = await client.artists.getBriefInfo('2503923');
```

---

### Главная страница

Доступ к рекомендуемому контенту главной страницы.

```typescript
// Получить все блоки
const landing = await client.landing.getLanding();

// Новые релизы
const releases = await client.landing.getNewReleases();

// Подкасты
const podcasts = await client.landing.getPodcasts();

// Новые плейлисты
const newPl = await client.landing.getNewPlaylists();

// Чарты
const chart = await client.landing.getChart('artists');

// Жанры
const genres = await client.landing.getGenres();
```

---

### Лента

Личная лента пользователя и рекомендации.

```typescript
const feed = await client.feed.getFeed();

feed.days.forEach(day => {
  console.log(`${day.date}: ${day.events.length} событий`);
});
```

---

### Очереди

Синхронизация воспроизведения между устройствами.

```typescript
// Получить все очереди устройств
const queues = await client.queues.getQueues();

// Получить конкретную очередь
const queue = await client.queues.getQueue('queue-id');

// Обновить позицию воспроизведения
await client.queues.updatePosition('queue-id', 5, true);
```

---

### Теги

Просмотр по тегам и кураторским подборкам.

```typescript
const playlists = await client.tags.getPlaylistsByTag('rock');

playlists.playlists.forEach(pl => {
  console.log(pl.title);
});
```

---

### URL обложек

Преобразование шаблонов обложек в реальные URL изображений.

```typescript
import { getCoverUrl, hasCover, getAllCoverSizes } from 'yandex-music-api';

// Проверить, есть ли обложка
if (hasCover(track.coverUri)) {
  // Получить обложку определённого размера
  const url = getCoverUrl(track.coverUri, 200);    // 200x200
  const largeUrl = getCoverUrl(track.coverUri, 500); // 500x500
  
  // Получить все популярные размеры
  const allSizes = getAllCoverSizes(track.coverUri);
  // { small, medium, large, xlarge }
}
```

**Доступные размеры:** 30, 50, 100, 150, 200, 300, 400, 700, 800, 1000 пиксел

---

## Примеры

### Пример 1: Поиск и проигрывание

```typescript
import { YandexMusicClient } from 'yandex-music-api';

const client = new YandexMusicClient({ token: process.env.TOKEN });

// Поиск артиста
const results = await client.search.search('Beatles');
const beatles = results.artists?.results[0];

// Получить популярные треки
if (beatles) {
  const tracks = await client.artists.getPopularTracks(beatles.id);
  
  tracks.forEach(track => {
    console.log(`♪ ${track.title}`);
  });
}
```

### Пример 2: Скачивание треков

```typescript
const fs = require('fs');

// Поиск трека
const results = await client.search.searchTracks('Bohemian Rhapsody');
const track = results.results[0];

// Получить ссылку на скачивание
const url = await client.tracks.getTrackURL(track.id, 320);

// Скачать файл
const response = await fetch(url);
const buffer = await response.arrayBuffer();
fs.writeFileSync('bohemian-rhapsody.mp3', buffer);
```

### Пример 3: Создание плейлиста

```typescript
// Создать новый плейлист
const playlist = await client.playlists.create(userId, 'Моя коллекция');

// Поиск и добавление треков
const queens = await client.search.searchTracks('Queen');
const trackIds = queens.results.slice(0, 10).map(t => t.id);

// Добавить в плейлист
await client.playlists.addTracks(userId, playlist.kind, trackIds);

console.log('Добавлено 10 треков Queen в плейлист!');
```

### Пример 4: Персональное радио с отзывами

```typescript
const session = await client.radio.getStationTracks('user:onyourwave');

for (const item of session.sequence) {
  const track = item.track;
  const energy = item.trackParameters?.energy;
  
  console.log(`Сейчас играет: ${track.title} (Энергия: ${energy})`);
  
  // Симуляция действия пользователя
  const userLiked = Math.random() > 0.5;
  
  if (userLiked) {
    console.log('✓ Нравится');
    await client.radio.sendFeedback({
      type: 'trackFinished',
      trackId: track.id,
      totalPlayedSeconds: 180
    });
  } else {
    console.log('✕ Пропущено');
    await client.radio.skipTrack(session.batchId, track.id);
  }
}
```

---

## Справочник API

### 12 API классов

| Класс | Назначение | Методов |
|-------|-----------|--------|
| **Account** | Профиль и настройки | 5 |
| **Search** | Поиск | 6 |
| **Tracks** | Управление треками | 11 |
| **Radio** | Радио и рекомендации | 6 |
| **Playlists** | Управление плейлистами | 9 |
| **Albums** | Информация об альбомах | 3 |
| **Artists** | Данные об артистах | 4 |
| **Landing** | Рекомендуемый контент | 7 |
| **Feed** | Личная лента | 1 |
| **Queues** | Синхронизация устройств | 3 |
| **Tags** | Кураторские подборки | 1 |
| **Users** | Профили пользователей | 1 |

**Всего: 50+ методов API**

---

## Обработка ошибок

```typescript
try {
  const results = await client.search.searchTracks('Запрос');
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Неверный токен');
  } else if (error.response?.status === 429) {
    console.error('Лимит запросов превышен');
  } else {
    console.error('Ошибка запроса:', error.message);
  }
}
```

---

## Конфигурация

```typescript
interface YandexMusicClientConfig {
  token: string;           // OAuth токен (обязательно)
  timeout?: number;        // Таймаут запроса в мс (по умолч: 10000)
  retries?: number;        // Попытки повтора (по умолч: 3)
}
```

---

## Тестирование

Запустите полный набор тестов:

```bash
# Установить токен
$env:YANDEX_MUSIC_TOKEN="ваш_токен"

# Запустить тесты
npx ts-node test-comprehensive.ts
```

Тесты охватывают все 50+ методов API и проверяют:
- Аутентификацию
- Функциональность поиска
- Операции с треками
- Радио и рекомендации
- Управление плейлистами
- Преобразование URL обложек
- Обнаружение параметра Energy

---

## Помощь

- 📖 [Полная документация API](./API_GUIDE.md)
- 🚀 [Быстрый старт](./QUICKSTART.md)
- 🐛 [Сообщить об ошибке](https://github.com/your-repo/issues)
- 💬 [Обсуждения](https://github.com/your-repo/discussions)

---

## Лицензия

MIT License - См. файл [LICENSE](LICENSE)

---

**Сделано с ♪ для любителей музыки и разработчиков**
