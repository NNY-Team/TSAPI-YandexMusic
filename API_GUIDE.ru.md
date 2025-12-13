# Справочник API

Полный справочник всех эндпоинтов Yandex Music API.

**[🇬🇧 English](./API_GUIDE.md) | 🇷🇺 Русский**

---

## Оглавление

- [API Аккаунта](#api-аккаунта)
- [API Поиска](#api-поиска)
- [API Треков](#api-треков)
- [API Радио](#api-радио)
- [API Плейлистов](#api-плейлистов)
- [API Альбомов](#api-альбомов)
- [API Исполнителей](#api-исполнителей)
- [API Главной страницы](#api-главной-страницы)
- [API Ленты](#api-ленты)
- [API Очередей](#api-очередей)
- [API Тегов](#api-тегов)
- [API Пользователей](#api-пользователей)

---

## API Аккаунта

Управление аккаунтом пользователя и настройками.

### getStatus()

Получить статус текущего пользователя и информацию об аккаунте.

**Возвращает:**
```typescript
{
  account: {
    uid: number;
    login: string;
    verified: boolean;
    fullName?: string;
    sex?: string;
  },
  subscription?: {
    hasPlus: boolean;
    canStartTrial: boolean;
    mcdonalds: boolean;
  },
  premium?: {
    until: string;
  }
}
```

**Пример:**
```typescript
const status = await client.account.getStatus();
if (status.subscription?.hasPlus) {
  console.log('У пользователя есть Yandex Music Premium');
}
```

---

### getSettings()

Получить настройки аккаунта пользователя.

**Возвращает:** Объект с настройками

---

### getExperiments()

Получить активные A/B тесты для пользователя.

---

### updateSettings(settings)

Обновить настройки аккаунта.

**Параметры:**
- `settings` (объект) - Настройки для обновления

---

### consumePromoCode(code, language?)

Использовать промо-код.

**Параметры:**
- `code` (строка) - Промо-код
- `language` (строка, опционально) - Код языка

---

## API Поиска

Полнотекстовый поиск по всему музыкальному контенту.

### search(text, type?, page?)

Общий поиск по всем типам контента.

**Параметры:**
- `text` (строка) - Поисковый запрос
- `type` (строка, опционально) - Тип поиска: "all", "track", "album", "artist", "playlist"
- `page` (число, опционально) - Номер страницы (по умолч: 0)

**Возвращает:**
```typescript
{
  tracks?: { results: Track[] },
  albums?: { results: Album[] },
  artists?: { results: Artist[] },
  playlists?: { results: Playlist[] }
}
```

**Пример:**
```typescript
const results = await client.search.search('Queen');
console.log(`Найдено ${results.tracks?.results.length} треков`);
```

---

### searchTracks(text, page?)

Поиск только треков.

**Пример:**
```typescript
const tracks = await client.search.searchTracks('Bohemian Rhapsody');
tracks.results.forEach(t => console.log(t.title));
```

---

### searchAlbums(text, page?)

Поиск только альбомов.

---

### searchArtists(text, page?)

Поиск только исполнителей.

---

### searchPlaylists(text, page?)

Поиск только плейлистов.

---

### suggest(part)

Получить предложения поиска.

**Пример:**
```typescript
const suggestions = await client.search.suggest('Queen');
// Возвращает: { suggestions: ['Queen', 'Queens of the Stone Age', ...] }
```

---

## API Треков

Получение информации о треках, загрузка, текст песни и многое другое.

### getMany(trackIds)

Получить несколько треков.

**Параметры:**
- `trackIds` (массив строк) - ID треков (формат: "id:albumId")

**Пример:**
```typescript
const tracks = await client.tracks.getMany(['1734383:5959892', '2022812:1580547']);
```

---

### get(trackId)

Получить один трек.

---

### getDownloadInfo(trackId)

Получить доступные форматы и битреиты для скачивания.

**Возвращает:**
```typescript
[
  {
    downloadInfoUrl: string;
    codec: 'mp3';
    bitrateInKbps: 320;
    gain: boolean;
    preview: boolean;
  }
]
```

**Пример:**
```typescript
const info = await client.tracks.getDownloadInfo('1734383:5959892');
console.log(`Доступные битреиты: ${info.map(i => i.bitrateInKbps)}`);
```

---

### getTrackURL(trackId, preferredBitrate?)

Получить прямую ссылку на MP3 файл.

**Параметры:**
- `trackId` (строка) - ID трека
- `preferredBitrate` (число, опционально) - Предпочтительный битрейт (320, 256, 192, и т.д.)

**Пример:**
```typescript
const url = await client.tracks.getTrackURL('1734383:5959892', 320);

// Скачать трек
const response = await fetch(url);
const buffer = await response.arrayBuffer();
```

---

### getSupplement(trackId)

Получить дополнительную информацию о треке (текст, видео).

**Возвращает:**
```typescript
{
  lyrics?: [{ id: string; lyrics: string }],
  videos?: [{ title: string; cover: string; url: string }]
}
```

---

### getSimilar(trackId)

Получить похожие треки.

**Пример:**
```typescript
const similar = await client.tracks.getSimilar('1734383:5959892');
console.log(`${similar.similars.length} похожих треков`);
```

---

### getLyrics(trackId)

Получить текст песни.

---

### getAllLikedTracks(userId, pageSize?)

Получить все любимые треки пользователя.

**Параметры:**
- `userId` (число) - ID пользователя
- `pageSize` (число, опционально) - Элементов на странице (по умолч: 100)

**Пример:**
```typescript
const status = await client.account.getStatus();
const liked = await client.tracks.getAllLikedTracks(status.account.uid);
console.log(`Всего любимых: ${liked.length}`);
```

---

### likeTracks(userId, trackIds)

Добавить треки в любимые.

---

### removeLikedTracks(userId, trackIds)

Удалить треки из любимых.

---

### getDislikedTracks(userId)

Получить все нежелаемые треки.

---

## API Радио

Доступ к персональному радио и жанровым станциям.

### getStations()

Получить все доступные радиостанции.

**Возвращает:** Массив объектов `RadioStation`

**Пример:**
```typescript
const stations = await client.radio.getStations();
console.log(`Доступные станции: ${stations.length}`);
```

---

### getStationTracks(stationId, settings?)

Получить треки для радиостанции.

**Параметры:**
- `stationId` (строка) - ID станции
  - `'user:onyourwave'` - Персональное "Моя волна"
  - `'genre:rock'` - Станция Rock
  - `'genre:pop'` - Станция Pop
  - `'user:mood:happy'` - Веселое настроение

**Возвращает:**
```typescript
{
  sequence: [
    {
      track: Track;
      trackParameters?: {
        energy?: number;    // Шкала 0-1
        bpm?: number;
        hue?: number;
      };
      liked: boolean;
    }
  ],
  batchId: string;
  radioSessionId?: string;
}
```

**Пример:**
```typescript
// Получить треки "Моя волна"
const session = await client.radio.getStationTracks('user:onyourwave');

session.sequence.forEach(item => {
  const { track, trackParameters } = item;
  console.log(`${track.title}`);
  console.log(`Энергия: ${trackParameters?.energy}`); // 0-1
});
```

### Шкала Энергии

- **0.0 - 0.3**: Спокойная 🎹 (Классика, амбиент, lo-fi)
- **0.3 - 0.6**: Средняя 🎸 (Поп, инди, джаз)
- **0.6 - 1.0**: Энергичная ⚡ (Электроника, рок, хип-хоп)

---

### sendFeedback(feedback)

Отправить отзыв для улучшения рекомендаций.

**Параметры:**
```typescript
{
  type: 'radioStarted' | 'trackStarted' | 'trackFinished' | 'skip';
  trackId?: string;
  totalPlayedSeconds?: number;
  timestamp?: string;
  from?: string;
}
```

**Пример:**
```typescript
// Пользователь закончил слушать трек
await client.radio.sendFeedback({
  type: 'trackFinished',
  trackId: '1734383:5959892',
  totalPlayedSeconds: 180
});

// Пользователь пропустил трек
await client.radio.sendFeedback({
  type: 'skip',
  trackId: '1734383:5959892'
});
```

---

### skipTrack(batchId, trackId)

Пропустить текущий трек в радио.

**Пример:**
```typescript
const session = await client.radio.getStationTracks('user:onyourwave');
await client.radio.skipTrack(session.batchId, session.sequence[0].track.id);
```

---

### getStationInfo(stationId)

Получить подробную информацию о станции.

---

### getAccountStatus()

Получить статус аккаунта для радио.

---

## API Плейлистов

Создание и управление плейлистами.

### getList(userId)

Получить все плейлисты пользователя.

**Пример:**
```typescript
const status = await client.account.getStatus();
const playlists = await client.playlists.getList(status.account.uid);

playlists.forEach(pl => {
  console.log(`${pl.title} (${pl.trackCount} треков)`);
});
```

---

### get(userId, playlistKind)

Получить конкретный плейлист с треками.

**Пример:**
```typescript
const playlist = await client.playlists.get(userId, 3);
console.log(playlist.tracks); // Массив объектов Track
```

---

### create(userId, title, visibility?)

Создать новый плейлист.

**Параметры:**
- `userId` (число)
- `title` (строка) - Название плейлиста
- `visibility` (строка, опционально) - "public" или "private"

**Пример:**
```typescript
const playlist = await client.playlists.create(
  userId,
  'Мой крутой плейлист',
  'public'
);
```

---

### addTracks(userId, kind, trackIds)

Добавить треки в плейлист.

**Пример:**
```typescript
await client.playlists.addTracks(
  userId,
  playlist.kind,
  ['1734383:5959892', '2022812:1580547']
);
```

---

### removeTracks(userId, kind, positions)

Удалить треки из плейлиста по позиции.

**Пример:**
```typescript
// Удалить первый и третий треки
await client.playlists.removeTracks(userId, kind, [0, 2]);
```

---

### rename(userId, kind, title)

Переименовать плейлист.

---

### delete(userId, kind)

Удалить плейлист.

---

### setVisibility(userId, kind, visibility)

Изменить видимость плейлиста.

---

## API Альбомов

Получение информации об альбомах.

### get(albumId)

Получить информацию об альбоме.

**Пример:**
```typescript
const album = await client.albums.get('5959892');
console.log(album.title);
```

---

### getWithTracks(albumId)

Получить альбом со всеми треками.

---

### getMany(albumIds)

Получить несколько альбомов.

---

## API Исполнителей

Получение информации об исполнителях и дискографии.

### getPopularTracks(artistId)

Получить популярные треки исполнителя.

**Пример:**
```typescript
const tracks = await client.artists.getPopularTracks('2503923');
tracks.forEach(t => console.log(t.title));
```

---

### getTracks(artistId)

Получить все треки исполнителя.

---

### getAlbums(artistId)

Получить альбомы исполнителя.

---

### getBriefInfo(artistId)

Получить краткую информацию об исполнителе.

---

## API Главной страницы

Получить рекомендуемый контент с главной страницы.

### getLanding()

Получить все блоки главной страницы.

---

### getLandingBlock(blockId)

Получить конкретный блок.

---

### getNewReleases()

Получить блок новых релизов.

---

### getPodcasts()

Получить блок подкастов.

---

### getNewPlaylists()

Получить блок новых плейлистов.

---

### getChart(chartType)

Получить чарты.

---

### getGenres()

Получить все доступные жанры.

**Пример:**
```typescript
const genres = await client.landing.getGenres();
genres.forEach(g => console.log(g.name));
```

---

## API Ленты

Получить личную ленту пользователя.

### getFeed()

Получить ленту с рекомендациями и событиями.

**Пример:**
```typescript
const feed = await client.feed.getFeed();
feed.days.forEach(day => {
  console.log(`${day.date}: ${day.events.length} событий`);
});
```

---

## API Очередей

Синхронизация воспроизведения между устройствами.

### getQueues()

Получить все очереди устройств.

---

### getQueue(queueId)

Получить конкретную очередь.

---

### updatePosition(queueId, currentIndex, isInteractive)

Обновить позицию воспроизведения в очереди.

---

## API Тегов

Просмотр по тегам и кураторским подборкам.

### getPlaylistsByTag(tagId)

Получить плейлисты по тегу.

**Пример:**
```typescript
const rock = await client.tags.getPlaylistsByTag('rock');
rock.playlists.forEach(pl => console.log(pl.title));
```

---

## API Пользователей

Получение информации о профиле пользователя.

### getInfo(userId)

Получить публичный профиль пользователя.

---

## URL Обложек

Преобразование шаблонов обложек в реальные URL.

```typescript
import { getCoverUrl, hasCover, getAllCoverSizes } from 'yandex-music-api';

// Проверить, есть ли обложка
if (hasCover(track.coverUri)) {
  // Получить определённый размер
  const url = getCoverUrl(track.coverUri, 200);    // 200x200
  const largeUrl = getCoverUrl(track.coverUri, 500); // 500x500
  
  // Получить все размеры
  const sizes = getAllCoverSizes(track.coverUri);
  // { small: url, medium: url, large: url, xlarge: url }
}
```

**Доступные размеры:** 30, 50, 100, 150, 200, 300, 400, 700, 800, 1000 пиксел

---

## Обработка ошибок

Все методы выбрасывают ошибки при отказе. Всегда используйте try-catch:

```typescript
try {
  const results = await client.search.searchTracks('Запрос');
} catch (error) {
  console.error('Поиск не удался:', error.message);
  
  if (error.response?.status === 401) {
    console.error('Неверный токен');
  } else if (error.response?.status === 429) {
    console.error('Лимит запросов');
  }
}
```

---

## Лучшие практики

1. **Кеширование результатов**: Не переполучайте одни и те же данные часто
2. **Обработка ошибок**: Всегда обрабатывайте ошибки корректно
3. **Отправка отзывов**: Отправляйте отзывы для улучшения рекомендаций
4. **Уважение к лимитам**: Не делайте чрезмерное количество запросов
5. **Безопасность токена**: Держите OAuth токен в безопасности
6. **Используйте TypeScript**: Предпочитайте TypeScript для безопасности типов

---
