// src/api/Search.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";
import { SearchResult, SearchResultSection } from "../models/Search.ts";
import { Track } from "../models/Track.ts";
import { Album } from "../models/Album.ts";
import { Artist } from "../models/Artist.ts";
import { Playlist } from "../models/Playlist.ts";

export class SearchApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  async search(
    text: string,
    type: string = "all",
    page: number = 0,
    nocorrect: boolean = false
  ): Promise<SearchResult> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: SearchResult;
    }>(`/search`, {
      text,
      type,
      page,
      nococrrect: nocorrect,
    });
    return response.result;
  }

  async searchTracks(text: string, page: number = 0): Promise<SearchResultSection<Track>> {
    const result = await this.search(text, "track", page);
    return result.tracks || { total: 0, perPage: 0, results: [] };
  }

  async searchAlbums(text: string, page: number = 0): Promise<SearchResultSection<Album>> {
    const result = await this.search(text, "album", page);
    return result.albums || { total: 0, perPage: 0, results: [] };
  }

  async searchArtists(text: string, page: number = 0): Promise<SearchResultSection<Artist>> {
    const result = await this.search(text, "artist", page);
    return result.artists || { total: 0, perPage: 0, results: [] };
  }

  async searchPlaylists(text: string, page: number = 0): Promise<SearchResultSection<Playlist>> {
    const result = await this.search(text, "playlist", page);
    return result.playlists || { total: 0, perPage: 0, results: [] };
  }

  async suggest(part: string): Promise<any> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: any;
    }>(`/search/suggest`, { part });
    return response.result;
  }
}

