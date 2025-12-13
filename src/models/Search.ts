// src/models/Search.ts

import { Track } from './Track';
import { Album } from './Album';
import { Artist } from './Artist';
import { Playlist } from './Playlist';

/** Результаты поиска со всеми полями */
export interface SearchResult {
  // Результаты по категориям
  best?: BestMatch;
  tracks?: SearchResultSection<Track>;
  albums?: SearchResultSection<Album>;
  artists?: SearchResultSection<Artist>;
  playlists?: SearchResultSection<Playlist>;
  videos?: SearchResultSection<any>;
  podcasts?: SearchResultSection<any>;
  podcast_episodes?: SearchResultSection<any>;
  
  // Метаинформация о поиске
  text?: string;
  type?: 'track' | 'album' | 'artist' | 'playlist' | 'all';
  page?: number;
  perPage?: number;
  searchRequestId?: string;
  misspellCorrected?: boolean;
  misspellOriginal?: string;
  nocorrect?: boolean;
}

export interface BestMatch {
  type: 'track' | 'album' | 'artist' | 'playlist';
  result: Track | Album | Artist | Playlist;
}

/** Секция результатов поиска с массивом результатов */
export interface SearchResultSection<T> {
  type?: string;
  total: number;
  perPage: number;
  order?: number;
  pager?: {
    total: number;
    limit: number;
    offset: number;
  };
  results: T[];
}

