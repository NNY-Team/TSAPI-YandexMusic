# Yandex Music API TypeScript Library

**NOT official TypeScript library for Yandex Music API** - Build amazing music applications with full access to 50+ Yandex Music endpoints.

[![npm version](https://img.shields.io/npm/v/yandex-music-api?style=flat-square)](https://www.npmjs.com/package/yandex-music-api)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Language:** 🇬🇧 [English](./README.md) | 🇷🇺 [Русский](./README.ru.md)

## 📚 Documentation

| Section | English | Русский |
|:---|:---:|:---:|
| **Quick Start** | [🚀 QUICKSTART.md](./QUICKSTART.md) | [🚀 QUICKSTART.ru.md](./QUICKSTART.ru.md) |
| **API Guide** | [📖 API_GUIDE.md](./API_GUIDE.md) | [📖 API_GUIDE.ru.md](./API_GUIDE.ru.md) |
| **Local Setup** | [🔗 LOCAL_SETUP.md](./LOCAL_SETUP.md) | - |
| **Examples** | [💡 example-all-apis.ts](./example-all-apis.ts) | - |
| **Project Status** | [📊 PROJECT_STATUS.md](./PROJECT_STATUS.md) | - |

## Quick Links

- 📚 **[Full Documentation](#documentation)** - Complete API reference
- 🚀 **[Getting Started](#getting-started)** - Setup and first request
- 💡 **[Examples](#examples)** - Common use cases
- 🎵 **[API Reference](#api-reference)** - All 50+ endpoints

---

## Getting Started

### Installation

```bash
npm install yandex-music-api
```

### Basic Setup

```typescript
import { YandexMusicClient } from 'yandex-music-api';

// Create client with your OAuth token
const client = new YandexMusicClient({ 
  token: process.env.YANDEX_MUSIC_TOKEN 
});

// Get current user
const account = await client.account.getStatus();
console.log(`Logged in as: ${account.account.login}`);
```

### Authentication

You need a valid Yandex Music OAuth token. Get one from:
- [Yandex OAuth Apps](https://oauth.yandex.com/)
- Use scope: `music` for full API access

Store your token securely:

```bash
# .env
YANDEX_MUSIC_TOKEN=your_token_here
```

---

## Documentation

### Account Management

Manage user account and settings.

#### `getStatus()`

Returns current user account information.

```typescript
const status = await client.account.getStatus();

console.log(status.account.login);        // User login
console.log(status.account.uid);          // User ID
console.log(status.subscription?.hasPlus); // Premium status
```

**Response:**
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

Get user preferences and settings.

```typescript
const settings = await client.account.getSettings();
console.log(settings);
```

---

### Search

Full-text search across all music content.

#### `search(text, type?, page?)`

General search across all content types.

```typescript
const results = await client.search.search('Queen', 'all', 0);

console.log(results.tracks?.results);    // Track results
console.log(results.albums?.results);    // Album results
console.log(results.artists?.results);   // Artist results
console.log(results.playlists?.results); // Playlist results
```

#### `searchTracks(text, page?)`

Search for tracks only.

```typescript
const tracks = await client.search.searchTracks('Bohemian Rhapsody');

tracks.results.forEach(track => {
  console.log(`${track.title} - ${track.artists[0].name}`);
});
```

#### `suggest(part)`

Get search suggestions.

```typescript
const suggestions = await client.search.suggest('Queen');
console.log(suggestions.suggestions);
```

---

### Tracks

Work with individual tracks, download info, lyrics, and more.

#### `getMany(trackIds)`

Get multiple tracks by ID.

```typescript
const tracks = await client.tracks.getMany(['1734383:5959892', '2022812:1580547']);

tracks.forEach(track => {
  console.log(`${track.title} by ${track.artists[0].name}`);
});
```

#### `getDownloadInfo(trackId)`

Get download information for a track.

```typescript
const downloadInfo = await client.tracks.getDownloadInfo('1734383:5959892');

console.log(downloadInfo[0].bitrateInKbps);  // 320, 256, etc.
console.log(downloadInfo[0].codec);          // 'mp3'
```

#### `getTrackURL(trackId, preferredBitrate?)`

Get direct MP3 download link.

```typescript
const url = await client.tracks.getTrackURL('1734383:5959892', 320);

// Use URL to download or stream
const response = await fetch(url);
const buffer = await response.arrayBuffer();
```

#### `getSupplement(trackId)`

Get additional track data (lyrics, videos).

```typescript
const supplement = await client.tracks.getSupplement('1734383:5959892');

if (supplement.lyrics?.length) {
  console.log(supplement.lyrics[0].lyrics);
}
```

#### `getSimilar(trackId)`

Get similar tracks.

```typescript
const similar = await client.tracks.getSimilar('1734383:5959892');
console.log(similar.similars);
```

#### `getLyrics(trackId)`

Get track lyrics.

```typescript
const lyrics = await client.tracks.getLyrics('1734383:5959892');
```

#### `getAllLikedTracks(userId)`

Get all user's liked tracks.

```typescript
const liked = await client.tracks.getAllLikedTracks(userId);
console.log(`Total liked: ${liked.length}`);
```

---

### Radio - "Моя волна" & Stations

Access Yandex Music's personalized radio and genre stations.

#### `getStations()`

Get all available radio stations.

```typescript
const stations = await client.radio.getStations();

stations.forEach(station => {
  console.log(station.name);
  console.log(station.id.tag);  // Use this for getStationTracks
});
```

#### `getStationTracks(stationId, settings?)`

Get tracks for a radio station with personalization.

**"Моя волна" (My Wave) - Personalized Radio:**

```typescript
const session = await client.radio.getStationTracks('user:onyourwave');

session.sequence.forEach(item => {
  const track = item.track;
  const energy = item.trackParameters?.energy;  // 0-1 scale
  
  console.log(`${track.title} - Energy: ${energy}`);
});
```

#### Energy Parameter

The **Energy** parameter (0-1 scale) represents track intensity:

```
0.0 - 0.3: Calm 🎹
  Classical, ambient, lo-fi hip-hop

0.3 - 0.6: Moderate 🎸
  Pop, indie, jazz

0.6 - 1.0: Energetic ⚡
  Electronic, rock, hip-hop, metal
```

Yandex Music uses Energy + BPM + Hue to personalize "Моя волна" based on:
1. Your listening history
2. Feedback (likes/skips)
3. Time of day

#### `sendFeedback(feedback)`

Send feedback to improve recommendations.

```typescript
await client.radio.sendFeedback({
  type: 'trackFinished',
  trackId: '1734383:5959892',
  totalPlayedSeconds: 180
});
```

#### `skipTrack(batchId, trackId)`

Skip current track in radio.

```typescript
await client.radio.skipTrack(batchId, trackId);
```

#### `getStationInfo(stationId)`

Get detailed station information.

```typescript
const info = await client.radio.getStationInfo('user:onyourwave');
console.log(info.station.name);
```

---

### Playlists

Create, modify, and access playlists.

#### `getList(userId)`

Get all playlists for a user.

```typescript
const playlists = await client.playlists.getList(userId);

playlists.forEach(pl => {
  console.log(`${pl.title} (${pl.trackCount} tracks)`);
});
```

#### `get(userId, playlistKind)`

Get specific playlist.

```typescript
const playlist = await client.playlists.get(userId, 3);
console.log(playlist.tracks);
```

#### `create(userId, title, visibility?)`

Create new playlist.

```typescript
const playlist = await client.playlists.create(
  userId,
  'My Awesome Playlist',
  'public'
);
```

#### `addTracks(userId, kind, trackIds)`

Add tracks to playlist.

```typescript
await client.playlists.addTracks(
  userId,
  3,
  ['1734383:5959892', '2022812:1580547']
);
```

#### `removeTracks(userId, kind, positions)`

Remove specific tracks from playlist.

```typescript
await client.playlists.removeTracks(userId, 3, [0, 2]);
```

---

### Albums & Artists

Get information about albums and artists.

#### Albums

```typescript
// Get single album
const album = await client.albums.get('5959892');

// Get multiple albums
const albums = await client.albums.getMany(['5959892', '1580547']);
```

#### Artists

```typescript
// Get popular tracks
const popular = await client.artists.getPopularTracks('2503923');

// Get all tracks
const tracks = await client.artists.getTracks('2503923');

// Get discography
const albums = await client.artists.getAlbums('2503923');

// Get brief info
const info = await client.artists.getBriefInfo('2503923');
```

---

### Landing Page

Access main page featured content.

```typescript
// Get landing with all blocks
const landing = await client.landing.getLanding();

// New releases
const releases = await client.landing.getNewReleases();

// Podcasts
const podcasts = await client.landing.getPodcasts();

// Charts
const chart = await client.landing.getChart('artists');

// Genres
const genres = await client.landing.getGenres();
```

---

### Feed

User's personal feed and recommendations.

```typescript
const feed = await client.feed.getFeed();

feed.days.forEach(day => {
  console.log(`${day.date}: ${day.events.length} events`);
});
```

---

### Queues

Synchronize playback across devices.

```typescript
// Get all device queues
const queues = await client.queues.getQueues();

// Get specific queue
const queue = await client.queues.getQueue('queue-id');

// Update position
await client.queues.updatePosition('queue-id', 5, true);
```

---

### Tags

Browse by tags and curated collections.

```typescript
const playlists = await client.tags.getPlaylistsByTag('rock');

playlists.playlists.forEach(pl => {
  console.log(pl.title);
});
```

---

### Cover URLs

Transform cover templates to actual image URLs.

```typescript
import { getCoverUrl, hasCover, getAllCoverSizes } from 'yandex-music-api';

// Check if track has cover
if (hasCover(track.coverUri)) {
  // Get cover at specific size
  const url = getCoverUrl(track.coverUri, 200);    // 200x200
  const largeUrl = getCoverUrl(track.coverUri, 500); // 500x500
  
  // Get all common sizes
  const allSizes = getAllCoverSizes(track.coverUri);
}
```

**Available Sizes:** 30, 50, 100, 150, 200, 300, 400, 700, 800, 1000 px

---

## Examples

### Example 1: Search and Play

```typescript
import { YandexMusicClient } from 'yandex-music-api';

const client = new YandexMusicClient({ token: process.env.TOKEN });

// Search for artist
const results = await client.search.search('Beatles');
const beatles = results.artists?.results[0];

// Get their popular tracks
if (beatles) {
  const tracks = await client.artists.getPopularTracks(beatles.id);
  tracks.forEach(track => {
    console.log(`♪ ${track.title}`);
  });
}
```

### Example 2: Download Tracks

```typescript
const fs = require('fs');

// Search track
const results = await client.search.searchTracks('Bohemian Rhapsody');
const track = results.results[0];

// Get download URL
const url = await client.tracks.getTrackURL(track.id, 320);

// Download
const response = await fetch(url);
const buffer = await response.arrayBuffer();
fs.writeFileSync('bohemian-rhapsody.mp3', buffer);
```

### Example 3: Build Playlist

```typescript
// Create new playlist
const playlist = await client.playlists.create(userId, 'My Collection');

// Search and add tracks
const queens = await client.search.searchTracks('Queen');
const trackIds = queens.results.slice(0, 10).map(t => t.id);

// Add to playlist
await client.playlists.addTracks(userId, playlist.kind, trackIds);

console.log('Added 10 Queen tracks to playlist!');
```

### Example 4: Personal Radio with Feedback

```typescript
const session = await client.radio.getStationTracks('user:onyourwave');

for (const item of session.sequence) {
  const track = item.track;
  const energy = item.trackParameters?.energy;
  
  console.log(`Now playing: ${track.title} (Energy: ${energy})`);
  
  // Simulate user action
  const userLiked = Math.random() > 0.5;
  
  if (userLiked) {
    console.log('✓ Liked');
    await client.radio.sendFeedback({
      type: 'trackFinished',
      trackId: track.id,
      totalPlayedSeconds: 180
    });
  } else {
    console.log('✕ Skipped');
    await client.radio.skipTrack(session.batchId, track.id);
  }
}
```

---

## API Reference

### 12 API Classes - 50+ Methods

| Class | Purpose |
|-------|---------|
| **Account** | User profile & settings |
| **Search** | Full-text search |
| **Tracks** | Track operations & downloads |
| **Radio** | Radio & personalization |
| **Playlists** | Playlist management |
| **Albums** | Album information |
| **Artists** | Artist data & discography |
| **Landing** | Featured content |
| **Feed** | Personal feed |
| **Queues** | Cross-device sync |
| **Tags** | Curated collections |
| **Users** | User profiles |

---

## Error Handling

```typescript
try {
  const results = await client.search.searchTracks('Query');
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Invalid token');
  } else if (error.response?.status === 429) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Request failed:', error.message);
  }
}
```

---

## Configuration

```typescript
interface YandexMusicClientConfig {
  token: string;           // OAuth token (required)
  timeout?: number;        // Request timeout in ms (default: 10000)
  retries?: number;        // Retry attempts (default: 3)
}
```

---

## Testing

Run the comprehensive test suite:

```bash
# Set token
$env:YANDEX_MUSIC_TOKEN="your_token"

# Run tests
npx ts-node test-comprehensive.ts
```

All 50+ methods tested and verified ✓

---

## License

MIT License - See [LICENSE](LICENSE) file for details

---

**Made with ♪ for music lovers and developers**
