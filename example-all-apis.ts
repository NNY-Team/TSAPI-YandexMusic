#!/usr/bin/env ts-node
// example-all-apis.ts
// Пример использования всех реализованных API

import { YandexMusicClient, getCoverUrl } from './src/index';

const token = process.argv[2];

if (!token) {
  console.error('Usage: npx ts-node example-all-apis.ts "YOUR_TOKEN"');
  process.exit(1);
}

async function demonstrateAllAPIs() {
  const client = new YandexMusicClient({ token });

  console.log('🎵 Демонстрация всех API Яндекс.Музыки\n');

  try {
    // 1. Account API
    console.log('📱 1. ACCOUNT API');
    const status = await client.account.getStatus();
    console.log(`   ✓ Пользователь: ${status.account.login}`);
    console.log(`   ✓ UID: ${status.account.uid}\n`);

    // 2. Search API
    console.log('🔍 2. SEARCH API');
    const searchResult = await client.search.searchTracks('Led Zeppelin', 0);
    console.log(`   ✓ Найдено треков: ${searchResult.total}`);
    if (searchResult.results.length > 0) {
      console.log(`   ✓ Первый трек: ${searchResult.results[0].title}\n`);
    }

    // 3. Radio API (Моя волна)
    console.log('📻 3. RADIO API - "Моя волна"');
    const radioSession = await client.radio.getStationTracks('user:onyourwave');
    console.log(`   ✓ Получено треков: ${radioSession.sequence.length}`);
    const firstTrack = radioSession.sequence[0]?.track;
    if (firstTrack) {
      const energy = radioSession.sequence[0].trackParameters?.energy;
      console.log(`   ✓ Первый трек: "${firstTrack.title}"`);
      console.log(`   ✓ Energy (энергичность): ${energy?.toFixed(2)} (0-1)`);
      if (firstTrack.coverUri) {
        const coverUrl = getCoverUrl(firstTrack.coverUri, 200);
        console.log(`   ✓ Cover URL (200x200): ${coverUrl}\n`);
      }
    }

    // 4. Landing API
    console.log('🎬 4. LANDING API - Главная страница');
    const genres = await client.landing.getGenres();
    console.log(`   ✓ Всего жанров: ${genres.length}`);
    if (genres.length > 0) {
      console.log(`   ✓ Первый жанр: ${genres[0].name}\n`);
    }

    // 5. Feed API
    console.log('📰 5. FEED API - Лента');
    const feed = await client.feed.getFeed();
    console.log(`   ✓ Дней в ленте: ${feed.days.length}`);
    console.log(`   ✓ Плейлистов: ${feed.generatedPlaylists.length}`);
    console.log(`   ✓ Мастер пройден: ${feed.isWizardPassed}\n`);

    // 6. Tags API
    console.log('🏷️ 6. TAGS API - Подборки');
    const tagResult = await client.tags.getPlaylistsByTag('rock');
    console.log(`   ✓ Тег: ${tagResult.tag.name}`);
    console.log(`   ✓ Плейлистов: ${tagResult.ids.length}\n`);

    // 7. NonMusic API
    console.log('📚 7. NONMUSIC API - Книги и подкасты');
    const booksAndPodcasts = await client.nonMusic.getBooksAndPodcasts();
    console.log(`   ✓ Блоков: ${booksAndPodcasts.blocks.length}\n`);

    // 8. Artists API
    console.log('👤 8. ARTISTS API');
    const artistInfo = await client.artists.getBriefInfo('123456');
    console.log(`   ✓ Получена краткая информация об артисте\n`);

    // 9. Queues API
    console.log('📋 9. QUEUES API - Синхронизация');
    const queues = await client.queues.getQueues();
    console.log(`   ✓ Очередей найдено: ${queues.queues.length}\n`);

    // 10. Users API
    console.log('👥 10. USERS API');
    const userInfo = await client.users.getInfo(String(status.account.uid));
    console.log(`   ✓ Пользователь: ${userInfo.login}\n`);

    console.log('✅ Все API работают правильно!\n');

    console.log('📊 Информация об Energy (Энергичность):');
    console.log('   Energy - это значение от 0 до 1, которое показывает');
    console.log('   интенсивность и активность трека:');
    console.log('   • 0.0-0.3 - Спокойная (классика, амбиент)');
    console.log('   • 0.3-0.6 - Умеренная (поп, джаз)');
    console.log('   • 0.6-1.0 - Энергичная (электро, рок, хип-хоп)');
    console.log('   \n   Система использует этот параметр для улучшения');
    console.log('   рекомендаций в "Моей волне" на основе вашего фидбека!\n');

  } catch (error: any) {
    console.error('❌ Ошибка:', error.message);
    if (error.response?.data) {
      console.error('   API Response:', error.response.data);
    }
    process.exit(1);
  }
}

demonstrateAllAPIs();
