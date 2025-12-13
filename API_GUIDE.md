# API Guide

Complete reference for all Yandex Music API endpoints.

**Language:** 🇬🇧 [English](./API_GUIDE.md) | 🇷🇺 [Русский](./API_GUIDE.ru.md)

---

## Table of Contents

- [Account API](#account-api)
- [Search API](#search-api)
- [Tracks API](#tracks-api)
- [Radio API](#radio-api)
- [Playlists API](#playlists-api)
- [Albums API](#albums-api)
- [Artists API](#artists-api)
- [Landing API](#landing-api)
- [Feed API](#feed-api)
- [Queues API](#queues-api)
- [Tags API](#tags-api)
- [Users API](#users-api)

---

## Account API

User account management and preferences.

### getStatus()

Get current user's account status and subscription info.

**Returns:**
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

**Example:**
```typescript
const status = await client.account.getStatus();
if (status.subscription?.hasPlus) {
  console.log('User has Yandex Music Premium');
}
```

---

### getSettings()

Get user's account settings.

**Returns:** User settings object with theme, volume, etc.

**Example:**
```typescript
const settings = await client.account.getSettings();
```

---

### getExperiments()

Get active A/B tests for this user.

**Example:**
```typescript
const experiments = await client.account.getExperiments();
```

---

### updateSettings(settings)

Update user settings.

**Parameters:**
- `settings` (object) - Settings to update

---

### consumePromoCode(code, language?)

Consume a promo code.

**Parameters:**
- `code` (string) - Promo code
- `language` (string, optional) - Language code

---

## Search API

Search for music, albums, artists, and playlists.

### search(text, type?, page?)

General search with all content types.

**Parameters:**
- `text` (string) - Search query
- `type` (string, optional) - Search type: "all", "track", "album", "artist", "playlist"
- `page` (number, optional) - Page number (default: 0)

**Returns:**
```typescript
{
  tracks?: { results: Track[] },
  albums?: { results: Album[] },
  artists?: { results: Artist[] },
  playlists?: { results: Playlist[] }
}
```

**Example:**
```typescript
const results = await client.search.search('Queen');
console.log(`Found ${results.tracks?.results.length} tracks`);
```

---

### searchTracks(text, page?)

Search for tracks only.

**Example:**
```typescript
const tracks = await client.search.searchTracks('Bohemian Rhapsody');
tracks.results.forEach(t => console.log(t.title));
```

---

### searchAlbums(text, page?)

Search for albums only.

---

### searchArtists(text, page?)

Search for artists only.

---

### searchPlaylists(text, page?)

Search for playlists only.

---

### suggest(part)

Get search suggestions.

**Example:**
```typescript
const suggestions = await client.search.suggest('Queen');
// Returns: { suggestions: ['Queen', 'Queens of the Stone Age', ...] }
```

---

## Tracks API

Get track information, download links, lyrics, and more.

### getMany(trackIds)

Get multiple tracks.

**Parameters:**
- `trackIds` (string[]) - Track IDs (format: "id:albumId")

**Example:**
```typescript
const tracks = await client.tracks.getMany(['1734383:5959892', '2022812:1580547']);
```

---

### get(trackId)

Get single track.

---

### getDownloadInfo(trackId)

Get available download formats and bitrates.

**Returns:**
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

**Example:**
```typescript
const info = await client.tracks.getDownloadInfo('1734383:5959892');
console.log(`Available bitrates: ${info.map(i => i.bitrateInKbps)}`);
```

---

### getTrackURL(trackId, preferredBitrate?)

Get direct MP3 download URL.

**Parameters:**
- `trackId` (string) - Track ID
- `preferredBitrate` (number, optional) - Preferred bitrate (320, 256, 192, etc.)

**Example:**
```typescript
const url = await client.tracks.getTrackURL('1734383:5959892', 320);

// Download the track
const response = await fetch(url);
const buffer = await response.arrayBuffer();
```

---

### getSupplement(trackId)

Get additional track info (lyrics, videos).

**Returns:**
```typescript
{
  lyrics?: [{ id: string; lyrics: string }],
  videos?: [{ title: string; cover: string; url: string }]
}
```

---

### getSimilar(trackId)

Get similar tracks.

**Example:**
```typescript
const similar = await client.tracks.getSimilar('1734383:5959892');
console.log(`${similar.similars.length} similar tracks`);
```

---

### getLyrics(trackId)

Get track lyrics.

---

### getAllLikedTracks(userId, pageSize?)

Get all user's liked tracks.

**Parameters:**
- `userId` (number) - User ID
- `pageSize` (number, optional) - Items per page (default: 100)

**Example:**
```typescript
const status = await client.account.getStatus();
const liked = await client.tracks.getAllLikedTracks(status.account.uid);
console.log(`${liked.length} liked tracks`);
```

---

### likeTracks(userId, trackIds)

Add tracks to liked.

---

### removeLikedTracks(userId, trackIds)

Remove tracks from liked.

---

### getDislikedTracks(userId)

Get all disliked tracks.

---

## Radio API

Access personalized radio and genre stations.

### getStations()

Get all available radio stations.

**Returns:** Array of `RadioStation` objects

**Example:**
```typescript
const stations = await client.radio.getStations();
console.log(`Available stations: ${stations.length}`);
```

---

### getStationTracks(stationId, settings?)

Get tracks for a radio station.

**Parameters:**
- `stationId` (string) - Station ID
  - `'user:onyourwave'` - Personal "Моя волна"
  - `'genre:rock'` - Rock station
  - `'genre:pop'` - Pop station
  - `'user:mood:happy'` - Happy mood

**Returns:**
```typescript
{
  sequence: [
    {
      track: Track;
      trackParameters?: {
        energy?: number;    // 0-1 scale
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

**Example:**
```typescript
// Get "Моя волна" tracks
const session = await client.radio.getStationTracks('user:onyourwave');

session.sequence.forEach(item => {
  const { track, trackParameters } = item;
  console.log(`${track.title}`);
  console.log(`Energy: ${trackParameters?.energy}`); // 0-1
});
```

### Energy Scale

- **0.0 - 0.3**: Calm 🎹 (Classical, ambient, lo-fi)
- **0.3 - 0.6**: Moderate 🎸 (Pop, indie, jazz)
- **0.6 - 1.0**: Energetic ⚡ (Electronic, rock, hip-hop)

---

### sendFeedback(feedback)

Send feedback for better recommendations.

**Parameters:**
```typescript
{
  type: 'radioStarted' | 'trackStarted' | 'trackFinished' | 'skip';
  trackId?: string;
  totalPlayedSeconds?: number;
  timestamp?: string;
  from?: string;
}
```

**Example:**
```typescript
// User finished listening to a track
await client.radio.sendFeedback({
  type: 'trackFinished',
  trackId: '1734383:5959892',
  totalPlayedSeconds: 180
});

// User skipped a track
await client.radio.sendFeedback({
  type: 'skip',
  trackId: '1734383:5959892'
});
```

---

### skipTrack(batchId, trackId)

Skip current track in radio.

**Example:**
```typescript
const session = await client.radio.getStationTracks('user:onyourwave');
await client.radio.skipTrack(session.batchId, session.sequence[0].track.id);
```

---

### getStationInfo(stationId)

Get detailed information about a station.

---

### getAccountStatus()

Get user's account status for radio.

---

## Playlists API

Create and manage playlists.

### getList(userId)

Get all playlists for a user.

**Example:**
```typescript
const status = await client.account.getStatus();
const playlists = await client.playlists.getList(status.account.uid);

playlists.forEach(pl => {
  console.log(`${pl.title} (${pl.trackCount} tracks)`);
});
```

---

### get(userId, playlistKind)

Get specific playlist with tracks.

**Example:**
```typescript
const playlist = await client.playlists.get(userId, 3);
console.log(playlist.tracks); // Array of Track objects
```

---

### create(userId, title, visibility?)

Create new playlist.

**Parameters:**
- `userId` (number)
- `title` (string) - Playlist name
- `visibility` (string, optional) - "public" or "private"

**Example:**
```typescript
const playlist = await client.playlists.create(
  userId,
  'My Awesome Playlist',
  'public'
);
```

---

### addTracks(userId, kind, trackIds)

Add tracks to playlist.

**Example:**
```typescript
await client.playlists.addTracks(
  userId,
  playlist.kind,
  ['1734383:5959892', '2022812:1580547']
);
```

---

### removeTracks(userId, kind, positions)

Remove tracks from playlist by position.

**Example:**
```typescript
// Remove first and third tracks
await client.playlists.removeTracks(userId, kind, [0, 2]);
```

---

### rename(userId, kind, title)

Rename playlist.

---

### delete(userId, kind)

Delete playlist.

---

### setVisibility(userId, kind, visibility)

Change playlist visibility.

---

## Albums API

Get album information.

### get(albumId)

Get album details.

**Example:**
```typescript
const album = await client.albums.get('5959892');
console.log(album.title);
```

---

### getWithTracks(albumId)

Get album with all tracks.

---

### getMany(albumIds)

Get multiple albums.

---

## Artists API

Get artist information and discography.

### getPopularTracks(artistId)

Get artist's popular tracks.

**Example:**
```typescript
const tracks = await client.artists.getPopularTracks('2503923');
tracks.forEach(t => console.log(t.title));
```

---

### getTracks(artistId)

Get all artist's tracks.

---

### getAlbums(artistId)

Get artist's albums.

---

### getBriefInfo(artistId)

Get brief artist information.

---

## Landing API

Get featured content from landing page.

### getLanding()

Get all landing page blocks.

---

### getLandingBlock(blockId)

Get specific landing block.

---

### getNewReleases()

Get new releases block.

---

### getPodcasts()

Get podcasts block.

---

### getNewPlaylists()

Get new playlists block.

---

### getChart(chartType)

Get charts (artists, tracks, etc).

---

### getGenres()

Get all available genres.

**Example:**
```typescript
const genres = await client.landing.getGenres();
genres.forEach(g => console.log(g.name));
```

---

## Feed API

Get user's personal feed.

### getFeed()

Get feed with recommendations and events.

**Example:**
```typescript
const feed = await client.feed.getFeed();
feed.days.forEach(day => {
  console.log(`${day.date}: ${day.events.length} events`);
});
```

---

## Queues API

Cross-device playback synchronization.

### getQueues()

Get all device queues.

---

### getQueue(queueId)

Get specific queue.

---

### updatePosition(queueId, currentIndex, isInteractive)

Update playback position in queue.

---

## Tags API

Browse by tags and curated collections.

### getPlaylistsByTag(tagId)

Get playlists by tag.

**Example:**
```typescript
const rock = await client.tags.getPlaylistsByTag('rock');
rock.playlists.forEach(pl => console.log(pl.title));
```

---

## Users API

Get user profile information.

### getInfo(userId)

Get user's public profile.

---

## Cover URLs

Transform cover templates to actual URLs.

```typescript
import { getCoverUrl, hasCover, getAllCoverSizes } from 'yandex-music-api';

// Check if track has cover
if (hasCover(track.coverUri)) {
  // Get specific size
  const url = getCoverUrl(track.coverUri, 200);    // 200x200
  const largeUrl = getCoverUrl(track.coverUri, 500); // 500x500
  
  // Get all sizes
  const sizes = getAllCoverSizes(track.coverUri);
  // { small: url, medium: url, large: url, xlarge: url }
}
```

**Available Sizes:** 30, 50, 100, 150, 200, 300, 400, 700, 800, 1000 px

---

## Error Handling

All methods throw errors on failure. Always use try-catch:

```typescript
try {
  const results = await client.search.searchTracks('Query');
} catch (error) {
  console.error('Search failed:', error.message);
  
  if (error.response?.status === 401) {
    console.error('Invalid token');
  } else if (error.response?.status === 429) {
    console.error('Rate limited');
  }
}
```

---

## Rate Limits

Yandex Music API has rate limits. Recommended:
- Max 5 requests per second
- Spread requests evenly
- Add delays between batch operations

---

## Best Practices

1. **Cache Results**: Don't re-fetch the same data frequently
2. **Error Handling**: Always handle errors gracefully
3. **Feedback**: Send feedback for better recommendations
4. **Respect Limits**: Don't make excessive requests
5. **Token Security**: Keep your OAuth token secure
6. **Use TSX**: Prefer TypeScript for type safety

---
