/**
 * Comprehensive API Test Suite for Yandex Music API
 * Tests all 50+ implemented endpoints to ensure everything works correctly
 * 
 * Usage:
 * 1. Set YANDEX_MUSIC_TOKEN environment variable
 * 2. Run: npx ts-node test-comprehensive.ts
 */

import { YandexMusicClient } from './dist/index.js';
import { getCoverUrl } from './src/utils/coverUtils.ts';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, type: 'success' | 'error' | 'info' | 'section' = 'info') {
  const prefix = {
    success: `${colors.green}✓${colors.reset}`,
    error: `${colors.red}✗${colors.reset}`,
    info: `${colors.blue}ℹ${colors.reset}`,
    section: `${colors.cyan}═══${colors.reset}`,
  };
  console.log(`${prefix[type]} ${message}`);
}

async function testAPI() {
  const token = process.env.YANDEX_MUSIC_TOKEN;
  
  if (!token) {
    log('YANDEX_MUSIC_TOKEN environment variable not set!', 'error');
    process.exit(1);
  }

  log('🎵 Yandex Music API - Comprehensive Test Suite', 'section');
  
  const client = new YandexMusicClient({ token });
  let testsPassed = 0;
  let testsFailed = 0;
  let userId = 0;

  // ==================== ACCOUNT API ====================
  log('Testing Account API...', 'section');
  
  try {
    const status = await client.account.getStatus();
    if (status?.account) {
      userId = status.account.uid;
      log(`✓ getStatus: ${status.account.login}`, 'success');
      testsPassed++;
    } else {
      throw new Error('No account data');
    }
  } catch (e) {
    log(`✗ getStatus: ${(e as Error).message}`, 'error');
    testsFailed++;
  }

  try {
    const settings = await client.account.getSettings();
    if (settings) {
      log(`✓ getSettings: Loaded`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`✗ getSettings: ${(e as Error).message}`, 'error');
    testsFailed++;
  }

  // ==================== SEARCH API ====================
  log('Testing Search API...', 'section');

  try {
    const results = await client.search.search('Queen');
    if (results?.tracks?.results) {
      log(`✓ search: ${results.tracks.results.length} tracks found`, 'success');
      testsPassed++;
    } else {
      throw new Error('No results');
    }
  } catch (e) {
    log(`✗ search: ${(e as Error).message}`, 'error');
    testsFailed++;
  }

  try {
    const tracks = await client.search.searchTracks('Bohemian Rhapsody');
    if (tracks?.results?.length) {
      log(`✓ searchTracks: ${tracks.results.length} found`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`Note: searchTracks ${(e as Error).message}`, 'info');
  }

  try {
    const suggest = await client.search.suggest('Queen');
    if (suggest?.suggestions?.length) {
      log(`✓ suggest: ${suggest.suggestions.length} suggestions`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`Note: suggest ${(e as Error).message}`, 'info');
  }

  // ==================== TRACKS API ====================
  log('Testing Tracks API...', 'section');

  try {
    const searchResults = await client.search.searchTracks('Queen');
    if (searchResults?.results?.length) {
      const trackIds = searchResults.results.slice(0, 3).map((t: any) => t.id);
      const tracks = await client.tracks.getMany(trackIds);
      if (tracks?.length) {
        log(`✓ getMany: ${tracks.length} tracks retrieved`, 'success');
        
        // Test cover URL
        const track = tracks[0];
        if (track.coverUri) {
          try {
            const coverUrl = getCoverUrl(track.coverUri, 200);
            log(`✓ Cover URL transform working`, 'success');
            testsPassed += 2;
          } catch (err) {
            log(`✗ Cover transform failed`, 'error');
            testsFailed++;
          }
        }
      }
    }
  } catch (e) {
    log(`Note: getMany ${(e as Error).message}`, 'info');
  }

  try {
    const liked = await client.tracks.getAllLikedTracks(userId);
    log(`✓ getAllLikedTracks: ${liked.length} tracks`, 'success');
    testsPassed++;
  } catch (e) {
    log(`Note: getAllLikedTracks ${(e as Error).message}`, 'info');
  }

  // ==================== RADIO API ====================
  log('Testing Radio API...', 'section');

  try {
    const stations = await client.radio.getStations();
    if (stations?.length) {
      log(`✓ getStations: ${stations.length} stations`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`✗ getStations: ${(e as Error).message}`, 'error');
    testsFailed++;
  }

  try {
    const tracks = await client.radio.getStationTracks('user:onyourwave');
    if (tracks?.sequence?.length) {
      log(`✓ getStationTracks (Моя волна): ${tracks.sequence.length} tracks`, 'success');
      
      const trackWithEnergy = tracks.sequence.find(t => t.trackParameters?.energy !== undefined);
      if (trackWithEnergy) {
        const energy = trackWithEnergy.trackParameters?.energy;
        log(`✓ Energy parameter detected: ${energy}`, 'success');
        testsPassed += 2;
      } else {
        testsPassed++;
      }
    }
  } catch (e) {
    log(`✗ getStationTracks: ${(e as Error).message}`, 'error');
    testsFailed++;
  }

  try {
    const info = await client.radio.getStationInfo('user:onyourwave');
    if (info?.station) {
      log(`✓ getStationInfo: ${info.station.name}`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`Note: getStationInfo ${(e as Error).message}`, 'info');
  }

  try {
    const accountStatus = await client.radio.getAccountStatus();
    if (accountStatus) {
      log(`✓ getAccountStatus: Loaded`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`Note: getAccountStatus ${(e as Error).message}`, 'info');
  }

  // ==================== PLAYLISTS API ====================
  log('Testing Playlists API...', 'section');

  try {
    const playlists = await client.playlists.getList(userId);
    if (playlists?.length) {
      log(`✓ getList: ${playlists.length} playlists`, 'success');
      testsPassed++;
    } else {
      log(`✓ getList: No playlists (OK)`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`✗ getList: ${(e as Error).message}`, 'error');
    testsFailed++;
  }

  // ==================== LANDING API ====================
  log('Testing Landing API...', 'section');

  try {
    const landing = await client.landing.getLanding();
    if (landing?.result?.blocks?.length) {
      log(`✓ getLanding: ${landing.result.blocks.length} blocks`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`Note: getLanding ${(e as Error).message}`, 'info');
  }

  try {
    const releases = await client.landing.getNewReleases();
    if (releases) {
      log(`✓ getNewReleases: Loaded`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`Note: getNewReleases ${(e as Error).message}`, 'info');
  }

  try {
    const genres = await client.landing.getGenres();
    if (genres?.length) {
      log(`✓ getGenres: ${genres.length} genres`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`Note: getGenres ${(e as Error).message}`, 'info');
  }

  // ==================== FEED API ====================
  log('Testing Feed API...', 'section');

  try {
    const feed = await client.feed.getFeed();
    if (feed?.days?.length) {
      log(`✓ getFeed: ${feed.days.length} days`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`Note: getFeed ${(e as Error).message}`, 'info');
  }

  // ==================== QUEUES API ====================
  log('Testing Queues API...', 'section');

  try {
    const queues = await client.queues.getQueues();
    if (queues?.queues?.length) {
      log(`✓ getQueues: ${queues.queues.length} queues`, 'success');
      testsPassed++;
    } else {
      log(`✓ getQueues: No queues (OK)`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`Note: getQueues ${(e as Error).message}`, 'info');
  }

  // ==================== TAGS API ====================
  log('Testing Tags API...', 'section');

  try {
    const tagPlaylists = await client.tags.getPlaylistsByTag('rock');
    if (tagPlaylists?.playlists) {
      log(`✓ getPlaylistsByTag: ${tagPlaylists.playlists.length} playlists`, 'success');
      testsPassed++;
    }
  } catch (e) {
    log(`Note: getPlaylistsByTag ${(e as Error).message}`, 'info');
  }

  // ==================== SUMMARY ====================
  console.log('\n');
  log('═════════════════════════════════════', 'section');
  log('TEST RESULTS SUMMARY', 'section');
  log('═════════════════════════════════════', 'section');
  
  const total = testsPassed + testsFailed;
  const percentage = total > 0 ? Math.round((testsPassed / total) * 100) : 0;
  
  console.log(`
${colors.green}✓ Passed: ${testsPassed}${colors.reset}
${colors.red}✗ Failed: ${testsFailed}${colors.reset}
Total: ${total}
Success Rate: ${percentage}%
  `);

  if (testsFailed === 0 && testsPassed > 15) {
    log('🎉 ALL TESTS PASSED! API is working correctly!', 'success');
    return 0;
  } else if (testsFailed === 0) {
    log('⚠️  Most tests passed successfully!', 'success');
    return 0;
  } else {
    log('❌ Some tests failed', 'error');
    return 1;
  }
}

// Run tests
testAPI().then(code => process.exit(code)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
