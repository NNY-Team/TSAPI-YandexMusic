# Быстрый старт

Краткое руководство для начала работы с Yandex Music API.

**[🇬🇧 English](./QUICKSTART.md) | 🇷🇺 Русский**

---

## 1. Установка

```bash
npm install yandex-music-api
```

## 2. Получите OAuth токен

### Вариант A: Вручную через OAuth

1. Перейдите на [Yandex OAuth](https://oauth.yandex.com/)
2. Создайте приложение
3. Получите код авторизации
4. Обменяйте на токен

### Вариант B: Используйте расширение

[Расширение Yandex Music Token для Chrome](https://chrome.google.com/webstore/detail/yandex-music-token/)

## 3. Настройте окружение

Создайте файл `.env`:

```env
YANDEX_MUSIC_TOKEN=ваш_токен_здесь
```

Или установите переменную окружения:

```bash
# Windows PowerShell
$env:YANDEX_MUSIC_TOKEN="ваш_токен_здесь"

# Linux/Mac
export YANDEX_MUSIC_TOKEN="ваш_токен_здесь"
```

## 4. Инициализируйте клиент

```typescript
import { YandexMusicClient } from 'yandex-music-api';

const client = new YandexMusicClient({
  token: process.env.YANDEX_MUSIC_TOKEN
});
```

## 5. Первый запрос

```typescript
// Получить информацию об аккаунте
const status = await client.account.getStatus();
console.log(`Вы вошли как: ${status.account.login}`);
```

## Типичные задачи

### Поиск музыки

```typescript
// Поиск треков
const results = await client.search.searchTracks('Queen');
console.log(`Найдено ${results.results.length} треков`);

results.results.slice(0, 5).forEach(track => {
  console.log(`- ${track.title} от ${track.artists[0].name}`);
});
```

### Получить мои любимые треки

```typescript
const status = await client.account.getStatus();
const liked = await client.tracks.getAllLikedTracks(status.account.uid);

console.log(`У вас ${liked.length} любимых треков`);

// Показать первые 10
liked.slice(0, 10).forEach(track => {
  console.log(`♪ ${track.title}`);
});
```

### Слушать персональное радио

```typescript
// Получить "Моя волна" (Персональное радио)
const session = await client.radio.getStationTracks('user:onyourwave');

// Показать треки с информацией об энергии
session.sequence.forEach(item => {
  const { track, trackParameters } = item;
  const energy = trackParameters?.energy || 0;
  
  console.log(`${track.title}`);
  console.log(`  Энергия: ${(energy * 100).toFixed(0)}%`); // 0-100%
  console.log(`  Исполнитель: ${track.artists[0].name}`);
});
```

### Скачать трек

```typescript
import fs from 'fs';

// Поиск трека
const results = await client.search.searchTracks('Bohemian Rhapsody');
const track = results.results[0];

// Получить ссылку на скачивание
const url = await client.tracks.getTrackURL(track.id, 320);

// Скачать файл
const response = await fetch(url);
const buffer = await response.arrayBuffer();

// Сохранить в файл
fs.writeFileSync('bohemian-rhapsody.mp3', buffer);
console.log('Скачано!');
```

### Создать плейлист

```typescript
const status = await client.account.getStatus();
const userId = status.account.uid;

// Создать плейлист
const playlist = await client.playlists.create(
  userId,
  'Мой первый плейлист',
  'public'
);

console.log(`Создан: ${playlist.title}`);

// Поиск и добавление треков
const tracks = await client.search.searchTracks('Queen');
const trackIds = tracks.results.slice(0, 5).map(t => t.id);

await client.playlists.addTracks(userId, playlist.kind, trackIds);
console.log(`Добавлено 5 треков Queen!`);
```

### Получить информацию об альбоме

```typescript
// Получить альбом
const album = await client.albums.get('5959892');

console.log(`Альбом: ${album.title}`);
console.log(`Исполнитель: ${album.artists[0].name}`);
console.log(`Релиз: ${album.releaseDate}`);
console.log(`Треков: ${album.trackCount}`);

// Получить все треки
const withTracks = await client.albums.getWithTracks('5959892');
console.log(`Первый трек: ${withTracks.tracks[0].title}`);
```

### Получить популярные треки исполнителя

```typescript
const artistId = '2503923'; // Queen

const tracks = await client.artists.getPopularTracks(artistId);

console.log(`Популярные треки Queen:`);
tracks.slice(0, 10).forEach((track, i) => {
  console.log(`${i + 1}. ${track.title}`);
});
```

## Полный пример: музыкальный плеер

```typescript
import { YandexMusicClient } from 'yandex-music-api';

const client = new YandexMusicClient({
  token: process.env.YANDEX_MUSIC_TOKEN
});

async function main() {
  // Получить аккаунт
  const status = await client.account.getStatus();
  console.log(`Добро пожаловать, ${status.account.login}!`);
  
  // Получить персональное радио
  const radio = await client.radio.getStationTracks('user:onyourwave');
  
  // Проиграть каждый трек
  for (const item of radio.sequence) {
    const track = item.track;
    const energy = item.trackParameters?.energy || 0;
    
    console.log('\n🎵 Сейчас играет:');
    console.log(`   ${track.title}`);
    console.log(`   ${track.artists[0].name}`);
    console.log(`   Альбом: ${track.albums[0].title}`);
    console.log(`   Энергия: ${'█'.repeat(Math.ceil(energy * 10))}`);
    
    // Симуляция проигрывания
    await new Promise(r => setTimeout(r, 2000));
    
    // Отправить отзыв
    await client.radio.sendFeedback({
      type: 'trackFinished',
      trackId: track.id,
      totalPlayedSeconds: 180
    });
    
    console.log('   ✓ Добавлено в рекомендации');
  }
}

main().catch(console.error);
```

## Следующие шаги

- 📖 Читайте [API_GUIDE.ru.md](./API_GUIDE.ru.md) для подробного справочника API
- 💡 Посмотрите [example-all-apis.ts](./example-all-apis.ts) для больше примеров
- 🧪 Запустите тесты: `npx ts-node test-comprehensive.ts`

## Устранение проблем

### Ошибка "Invalid token"

```
Error: Request failed with status code 401
```

**Решение:**
1. Проверьте, что токен установлен правильно
2. Убедитесь, что он действительный и не истёк
3. Получите новый токен из [Yandex OAuth](https://oauth.yandex.com/)

### Ошибка "Rate limited"

```
Error: Request failed with status code 429
```

**Решение:**
1. Подождите перед следующими запросами
2. Добавьте задержку между запросами
3. Используйте кеширование для повторных запросов

### Ошибки TypeScript

Убедитесь, что у вас установлен TypeScript:

```bash
npm install --save-dev typescript ts-node @types/node
```

## Советы и рекомендации

### Пакетные операции

```typescript
// Поиск нескольких запросов одновременно
const [queen, beatles, floyd] = await Promise.all([
  client.search.searchTracks('Queen'),
  client.search.searchTracks('Beatles'),
  client.search.searchTracks('Pink Floyd')
]);
```

### Обработка ошибок

```typescript
try {
  const results = await client.search.searchTracks('Запрос');
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Токен истёк, пожалуйста, обновите');
  } else {
    console.error('Неожиданная ошибка:', error.message);
  }
}
```

### Кеширование результатов

```typescript
const cache = new Map();

async function searchCached(query) {
  if (cache.has(query)) {
    return cache.get(query);
  }
  
  const results = await client.search.searchTracks(query);
  cache.set(query, results);
  return results;
}
```

---

**Готовы начать? Отправляйтесь в [Справочник API](./API_GUIDE.ru.md)!**
