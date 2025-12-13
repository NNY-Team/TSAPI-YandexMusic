// src/models/Artist.ts

export interface Artist {
  id: string;
  name: string;
  cover?: {
    type: string;
    uri: string;
    dir: string;
    sizes?: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  };
  coverUri?: string;
  genres?: string[];
  counts?: {
    tracks?: number;
    directAlbums?: number;
    alsoAlbums?: number;
    alsoTracks?: number;
  };
  ticketsAvailable?: boolean;
  links?: Array<{
    title: string;
    href: string;
  }>;
  ratings?: {
    week?: number;
    month?: number;
  };
  description?: string;
  descriptionFormatted?: string;
}

