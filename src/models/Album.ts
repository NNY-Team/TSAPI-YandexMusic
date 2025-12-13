// src/models/Album.ts

import { Artist } from './Artist';

export interface Album {
  id: string;
  title: string;
  type?: 'album' | 'compilation' | 'ep';
  metaType?: string;
  coverUri?: string;
  ogImage?: string;
  genre?: string;
  year?: number;
  releaseDate?: string;
  artists?: Artist[];
  trackCount?: number;
  description?: string;
  descriptionFormatted?: string;
  ratingPercent?: number;
  likesCount?: number;
}

