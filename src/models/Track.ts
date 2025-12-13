// src/models/Track.ts

import { Artist } from './Artist';
import { Album } from './Album';
import { TrackSupplement } from '../api/Tracks'; // импортируем TrackSupplement

export interface Track {
  // Основные поля
  id: string;
  realId?: string;
  title: string;
  durationMs: number;
  fileSize?: number;
  
  // Статус трека
  available: boolean;
  availableForPremiumUsers: boolean;
  availableFullWithoutPermission: boolean;
  
  // Изображение
  coverUri?: string;
  ogImage?: string;
  
  // Доступность
  lyricsAvailable?: boolean;
  
  // Информация о треке
  type?: string;
  major?: {
    id: number;
    name: string;
  };
  normalization?: {
    gain: number;
    peak: number;
  };
  previewDurationMs?: number;
  rememberPosition?: boolean;
  storageDir?: string;
  
  // Связанные сущности
  artists?: Artist[];
  albums?: Album[];
  
  // Легаси поля
  contentWarning?: string;
  explicitLyrics?: boolean;
  availableAsRbt?: boolean;
  remoteLink?: boolean;
  diskNumber?: number;
  trackNumber?: number;

  // Новое поле для дополнительной информации
  supplement?: TrackSupplement;
}
