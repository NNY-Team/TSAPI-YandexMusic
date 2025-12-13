// src/api/Artists.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";
import { Artist } from "../models/Artist.ts";
import { Track } from "../models/Track.ts";

export interface ArtistTracksResult {
  artist: Artist;
  tracks: Track[];
}

export class ArtistsApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  async getPopularTracks(artistId: string): Promise<ArtistTracksResult> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: {
        artist: Artist;
        tracks: string[];
      };
    }>(`/artists/${artistId}/track-ids-by-rating`);
    
    // Теоретически нужно будет получить сами треки по ID
    return {
      artist: response.result.artist,
      tracks: [], // Нужно будет вызвать getTracks
    };
  }

  async getInfo(artistId: string): Promise<Artist> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: Artist;
    }>(`/artists/${artistId}`);
    return response.result;
  }

  async getTracks(
    artistId: string,
    page: number = 0,
    pageSize: number = 20
  ): Promise<{ artist: Artist; tracks: Track[] }> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: { artist: Artist; tracks: Track[] };
    }>(`/artists/${artistId}/tracks`, { page, ["page-size"]: pageSize });
    return response.result;
  }

  async getAlbums(
    artistId: string,
    page: number = 0,
    pageSize: number = 20,
    sortBy: "year" | "rating" = "rating"
  ): Promise<any> {
    const response = await this.http.get<any>(`/artists/${artistId}/direct-albums`, {
      page,
      ["page-size"]: pageSize,
      ["sort-by"]: sortBy,
    });
    return response;
  }

  /**
   * Получить краткую информацию об артисте
   * GET /artists/{artistId}/brief-info
   * 
   * @param artistId - ID артиста
   * @returns Краткая информация об артисте
   * 
   * @example
   * ```typescript
   * const info = await client.artists.getBriefInfo('artist-id');
   * console.log(`Основное: ${info.main}`);
   * console.log(`Похожие артисты: ${info.similarArtists?.length}`);
   * ```
   */
  async getBriefInfo(artistId: string): Promise<any> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: any;
    }>(`/artists/${artistId}/brief-info`);
    return response.result;
  }
}

