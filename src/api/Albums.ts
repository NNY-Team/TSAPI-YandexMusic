// src/api/Albums.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";
import { Album } from "../models/Album.ts";

export class AlbumsApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  async get(albumId: number): Promise<Album> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: Album;
    }>(`/albums/${albumId}/`);
    return response.result;
  }

  async getWithTracks(albumId: number): Promise<Album> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: Album;
    }>(`/albums/${albumId}/with-tracks`);
    return response.result;
  }

  async getMany(albumIds: number[]): Promise<Album[]> {
    const ids = albumIds.join(",");
    const response = await this.http.post<{
      invocationInfo: any;
      result: Album[];
    }>(`/albums`, { ["album-ids"]: ids });
    return response.result;
  }
}

