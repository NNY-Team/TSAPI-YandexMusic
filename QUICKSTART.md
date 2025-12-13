# Getting Started

Quick start guide to begin using Yandex Music API.

**Language:** 🇬🇧 [English](./QUICKSTART.md) | 🇷🇺 [Русский](./QUICKSTART.ru.md)

---

## 1. Installation

```bash
npm install yandex-music-api
```

## 2. Get OAuth Token

### Option A: Manual via OAuth

1. Go to [Yandex OAuth](https://oauth.yandex.com/)
2. Create app
3. Get authorization code
4. Exchange for token

### Option B: Use Browser

[Yandex Music Token Chrome Extension](https://chrome.google.com/webstore/detail/yandex-music-token/)

## 3. Set Up Environment

Create `.env` file:

```env
YANDEX_MUSIC_TOKEN=your_token_here
```

Or set environment variable:

```bash
# Windows PowerShell
$env:YANDEX_MUSIC_TOKEN="your_token_here"

# Linux/Mac
export YANDEX_MUSIC_TOKEN="your_token_here"
```

## 4. Initialize Client

```typescript
import { YandexMusicClient } from 'yandex-music-api';

const client = new YandexMusicClient({
  token: process.env.YANDEX_MUSIC_TOKEN
});
```

## 5. First Request

```typescript
// Get account info
const status = await client.account.getStatus();
console.log(`Logged in as: ${status.account.login}`);
```

## Common Tasks

### Search for Music

```typescript
// Search tracks
const results = await client.search.searchTracks('Queen');
console.log(`Found ${results.results.length} tracks`);

results.results.slice(0, 5).forEach(track => {
  console.log(`- ${track.title} by ${track.artists[0].name}`);
});
```

### Get My Liked Tracks

```typescript
const status = await client.account.getStatus();
const liked = await client.tracks.getAllLikedTracks(status.account.uid);

console.log(`You have ${liked.length} liked tracks`);

// Show first 10
liked.slice(0, 10).forEach(track => {
  console.log(`♪ ${track.title}`);
});
```

### Listen to Personal Radio

```typescript
// Get "Моя волна" (My Wave) - Personalized Radio
const session = await client.radio.getStationTracks('user:onyourwave');

// Display tracks with energy info
session.sequence.forEach(item => {
  const { track, trackParameters } = item;
  const energy = trackParameters?.energy || 0;
  
  console.log(`${track.title}`);
  console.log(`  Energy: ${(energy * 100).toFixed(0)}%`); // 0-100%
  console.log(`  Artist: ${track.artists[0].name}`);
});
```

### Download a Track

```typescript
import fs from 'fs';

// Search track
const results = await client.search.searchTracks('Bohemian Rhapsody');
const track = results.results[0];

// Get download URL
const url = await client.tracks.getTrackURL(track.id, 320);

// Download file
const response = await fetch(url);
const buffer = await response.arrayBuffer();

// Save to file
fs.writeFileSync('bohemian-rhapsody.mp3', buffer);
console.log('Downloaded!');
```

### Create Playlist

```typescript
const status = await client.account.getStatus();
const userId = status.account.uid;

// Create playlist
const playlist = await client.playlists.create(
  userId,
  'My First Playlist',
  'public'
);

console.log(`Created: ${playlist.title}`);

// Search and add tracks
const tracks = await client.search.searchTracks('Queen');
const trackIds = tracks.results.slice(0, 5).map(t => t.id);

await client.playlists.addTracks(userId, playlist.kind, trackIds);
console.log(`Added 5 Queen tracks!`);
```

### Get Album Info

```typescript
// Get album
const album = await client.albums.get('5959892');

console.log(`Album: ${album.title}`);
console.log(`Artist: ${album.artists[0].name}`);
console.log(`Release: ${album.releaseDate}`);
console.log(`Tracks: ${album.trackCount}`);

// Get all tracks
const withTracks = await client.albums.getWithTracks('5959892');
console.log(`First track: ${withTracks.tracks[0].title}`);
```

### Get Artist Popular Tracks

```typescript
const artistId = '2503923'; // Queen

const tracks = await client.artists.getPopularTracks(artistId);

console.log(`Popular Queen tracks:`);
tracks.slice(0, 10).forEach((track, i) => {
  console.log(`${i + 1}. ${track.title}`);
});
```

## Full Example: Music Player

```typescript
import { YandexMusicClient } from 'yandex-music-api';

const client = new YandexMusicClient({
  token: process.env.YANDEX_MUSIC_TOKEN
});

async function main() {
  // Get account
  const status = await client.account.getStatus();
  console.log(`Welcome, ${status.account.login}!`);
  
  // Get personal radio
  const radio = await client.radio.getStationTracks('user:onyourwave');
  
  // Play each track
  for (const item of radio.sequence) {
    const track = item.track;
    const energy = item.trackParameters?.energy || 0;
    
    console.log('\n🎵 Now Playing:');
    console.log(`   ${track.title}`);
    console.log(`   ${track.artists[0].name}`);
    console.log(`   Album: ${track.albums[0].title}`);
    console.log(`   Energy: ${'█'.repeat(Math.ceil(energy * 10))}`);
    
    // Simulate playback
    await new Promise(r => setTimeout(r, 2000));
    
    // Send feedback
    await client.radio.sendFeedback({
      type: 'trackFinished',
      trackId: track.id,
      totalPlayedSeconds: 180
    });
    
    console.log('   ✓ Added to recommendations');
  }
}

main().catch(console.error);
```

## Next Steps

- 📖 Read [API_GUIDE.md](./API_GUIDE.md) for detailed API reference
- 💡 Check [example-all-apis.ts](./example-all-apis.ts) for more examples
- 🧪 Run tests: `npx ts-node test-comprehensive.ts`

## Troubleshooting

### "Invalid token" Error

```
Error: Request failed with status code 401
```

**Solution:**
1. Check token is set correctly
2. Make sure it's valid and not expired
3. Get new token from [Yandex OAuth](https://oauth.yandex.com/)

### "Rate limited" Error

```
Error: Request failed with status code 429
```

**Solution:**
1. Wait before making more requests
2. Add delays between requests
3. Use caching for repeated requests

### TypeScript Errors

Make sure you have TypeScript installed:

```bash
npm install --save-dev typescript ts-node @types/node
```

## Tips & Tricks

### Batch Operations

```typescript
// Search multiple queries
const [queen, beatles, floyd] = await Promise.all([
  client.search.searchTracks('Queen'),
  client.search.searchTracks('Beatles'),
  client.search.searchTracks('Pink Floyd')
]);
```

### Error Handling

```typescript
try {
  const results = await client.search.searchTracks('Query');
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Token expired, please refresh');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

### Caching Results

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

**Ready to build? Start with the [API Guide](./API_GUIDE.md)!**
