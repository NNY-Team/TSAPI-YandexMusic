// src/models/Playlist.ts

import { Track } from './Track';
import { Artist } from './Artist';

export interface Playlist {
  playlistUuid: string;
  uid: number;
  kind: number;
  title: string;
  description: string;
  descriptionFormatted?: string;
  available: boolean;
  collective: boolean;
  created: string;
  modified: string;
  backgroundColor?: string;
  textColor?: string;
  durationMs: number;
  isBanner: boolean;
  isPremiere: boolean;
  visibility: 'public' | 'private';
  owner?: Artist;
  tracks?: Track[];
  revision?: number;
  snapshot?: number;
  tags?: Array<{ id: string; value: string }>;
  likesCount?: number;
  trackCount: number;
  coverUri?: string;
  ogImage?: string;
  isFavorite?: boolean;
}

